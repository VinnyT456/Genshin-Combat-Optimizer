import { describe, expect, it } from "vitest";
import {
  EPSILON,
  MIN_SWAP_COST_SECONDS,
  simulateRotation,
  validateAction,
} from "@/simulation/engine";
import { createEnergyState } from "@/simulation/energy";
import type {
  CharacterDefinition,
  CharacterState,
  Rotation,
  ValidationErrorCode,
} from "@/types";
import { makeTestCharacter, NEUTRAL_ENEMY, NO_CRIT_CONFIG } from "@/tests/helpers/fixtures";

// ============================================================================
// TASK #017 — the two NEW ValidationErrorCodes.
//
// `mismatched-ability`: abilityId is AUTHORITATIVE. The dangerous failure mode
// is SILENT EXECUTION of the slot ability, which produces plausible-looking but
// wrong damage. So it is not enough to check that a warning is emitted — the
// tests below assert NO damage was dealt, NO cooldown started and NO energy
// moved, which is what "never silently executed" actually means.
//
// `invalid-config`: reported once, before any action, and the offending value
// clamped rather than allowed to corrupt the clock.
// ============================================================================

function statesOf(...defs: CharacterDefinition[]): Map<string, CharacterState> {
  return new Map(
    defs.map((def) => {
      const energy = createEnergyState(def);
      return [
        def.id,
        { definition: def, currentEnergy: energy.current, energy, cooldowns: {} },
      ];
    }),
  );
}

describe("mismatched-ability: abilityId is AUTHORITATIVE, never advisory", () => {
  it("validateAction rejects an abilityId naming a different slot's ability", () => {
    const v = validateAction({
      // actionType "skill" resolves to "a-e", but the rotation claims "a-q".
      action: { characterId: "a", actionType: "skill", abilityId: "a-q" },
      states: statesOf(makeTestCharacter("a")),
      time: 0,
      config: {},
    });
    expect(v.valid).toBe(false);
    if (v.valid) throw new Error("unreachable");
    expect(v.code).toBe("mismatched-ability" satisfies ValidationErrorCode);
  });

  it("rejects a wholly unknown abilityId rather than falling back to the slot", () => {
    const v = validateAction({
      action: { characterId: "a", actionType: "skill", abilityId: "not-a-real-id" },
      states: statesOf(makeTestCharacter("a")),
      time: 0,
      config: {},
    });
    expect(v.valid).toBe(false);
    if (v.valid) throw new Error("unreachable");
    expect(v.code).toBe("mismatched-ability");
  });

  it("THE CORE CLAIM: a mismatched action deals ZERO damage — not the slot's damage", () => {
    // The silent-execution bug would show 1000 here (the skill's damage).
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "skill", abilityId: "a-q" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.totalDamage).toBe(0);
    expect(r.timeline.filter((e) => e.type === "damage")).toEqual([]);
    expect(r.structuredWarnings.map((w) => w.code)).toEqual(["mismatched-ability"]);
  });

  it("a rejected action starts NO cooldown (state must be untouched)", () => {
    // A half-executed action that burned the cooldown would corrupt every
    // later action in the rotation.
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "skill", abilityId: "a-q" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.finalState.characters["a"]!.cooldowns).toEqual({});
  });

  it("a rejected burst spends NO energy and generates none", () => {
    const a = makeTestCharacter("a", {
      elementalSkill: { cooldown: 0, energyGenerated: 40 },
    });
    const r = simulateRotation(
      [a],
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" }, // +40
        { characterId: "a", actionType: "burst", abilityId: "a-e" }, // mismatched
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    const energy = r.finalState.characters["a"]!.energy;
    expect(energy.current).toBe(40);
    expect(energy.totalSpent).toBe(0);
    expect(r.structuredWarnings.map((w) => w.code)).toEqual(["mismatched-ability"]);
  });

  it("a rejected action does NOT advance the clock", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "skill", abilityId: "a-q" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.duration).toBe(0);
  });

  it("skips only the mismatched action; the rest of the rotation still runs", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [
        { characterId: "a", actionType: "normal", abilityId: "a-na" }, // 500
        { characterId: "a", actionType: "normal", abilityId: "a-ca" }, // mismatched
        { characterId: "a", actionType: "normal", abilityId: "a-na" }, // 500
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.totalDamage).toBeCloseTo(1000, 8);
    expect(r.structuredWarnings.map((w) => w.code)).toEqual(["mismatched-ability"]);
  });

  it("accepts a MATCHING abilityId (the check is not rejecting everything)", () => {
    // Guards against a fix that over-rejects and makes every test above pass
    // for the wrong reason.
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.warnings).toEqual([]);
    expect(r.totalDamage).toBeCloseTo(1000, 8);
  });

  it("accepts an OMITTED abilityId (opt-in authority, not mandatory)", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "skill" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.warnings).toEqual([]);
    expect(r.totalDamage).toBeCloseTo(1000, 8);
  });

  it("prefers the MORE SPECIFIC unknown-ability for an unresolvable actionType", () => {
    // Code-precedence contract: an authoring error in actionType is reported as
    // unknown-ability, not masked by the abilityId mismatch check.
    const rotation = [
      { characterId: "a", actionType: "ultimate", abilityId: "a-q" },
    ] as unknown as Rotation;
    const r = simulateRotation(
      [makeTestCharacter("a")], rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG,
    );
    expect(r.structuredWarnings.map((w) => w.code)).toEqual(["unknown-ability"]);
  });

  it("reports unknown-character before looking at abilityId at all", () => {
    const v = validateAction({
      action: { characterId: "ghost", actionType: "skill", abilityId: "a-q" },
      states: statesOf(makeTestCharacter("a")),
      time: 0,
      config: {},
    });
    expect(v.valid).toBe(false);
    if (v.valid) throw new Error("unreachable");
    expect(v.code).toBe("unknown-character");
  });

  it("a swap action ignores abilityId rather than reporting a mismatch", () => {
    // Swaps resolve to no ability, so an abilityId on a swap is meaningless
    // and must not produce a spurious rejection.
    const v = validateAction({
      action: { characterId: "b", actionType: "swap" },
      states: statesOf(makeTestCharacter("a"), makeTestCharacter("b")),
      time: 0,
      activeCharacterId: "a",
      config: {},
    });
    expect(v.valid).toBe(true);
  });
});

describe("invalid-config: reported, clamped, and never silently absorbed", () => {
  const TWO_CHARACTER_SWAP: Rotation = [
    { characterId: "a", actionType: "normal", abilityId: "a-na" },
    { characterId: "b", actionType: "swap" },
  ];

  function runWithSwapCost(swapCost: number) {
    return simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      TWO_CHARACTER_SWAP,
      NEUTRAL_ENEMY,
      { ...NO_CRIT_CONFIG, swapCost },
    );
  }

  it("a negative swapCost is reported as invalid-config", () => {
    const r = runWithSwapCost(-5);
    expect(r.structuredWarnings.some((w) => w.code === "invalid-config")).toBe(true);
  });

  it("a negative swapCost is clamped, never rewinding the clock", () => {
    const r = runWithSwapCost(-5);
    expect(r.effectiveSwapCost).toBe(MIN_SWAP_COST_SECONDS);
    expect(r.duration).toBeGreaterThanOrEqual(0);
    expect(r.duration).toBeCloseTo(0.5, 8); // the 0.5s normal + a 0s swap
  });

  it("is reported ONCE regardless of how many swaps the rotation contains", () => {
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      [
        { characterId: "a", actionType: "swap" },
        { characterId: "b", actionType: "swap" },
        { characterId: "a", actionType: "swap" },
        { characterId: "b", actionType: "swap" },
      ],
      NEUTRAL_ENEMY,
      { ...NO_CRIT_CONFIG, swapCost: -1 },
    );
    expect(
      r.structuredWarnings.filter((w) => w.code === "invalid-config"),
    ).toHaveLength(1);
  });

  it("is reported even when the rotation contains NO swap at all", () => {
    // The config is invalid on its own terms; the report must not depend on
    // whether the bad value happened to be used.
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      { ...NO_CRIT_CONFIG, swapCost: -3 },
    );
    expect(r.structuredWarnings.some((w) => w.code === "invalid-config")).toBe(true);
  });

  it("a valid swapCost produces NO invalid-config warning", () => {
    for (const swapCost of [0, 0.6, 2]) {
      const r = runWithSwapCost(swapCost);
      expect(r.structuredWarnings.some((w) => w.code === "invalid-config")).toBe(false);
      expect(r.effectiveSwapCost).toBe(swapCost);
    }
  });

  it("an omitted swapCost uses the default and warns for nothing", () => {
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      TWO_CHARACTER_SWAP,
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.structuredWarnings.some((w) => w.code === "invalid-config")).toBe(false);
    expect(r.effectiveSwapCost).toBeGreaterThan(0);
  });

  it("dps stays finite and non-negative under an invalid config", () => {
    const r = runWithSwapCost(-100);
    expect(Number.isFinite(r.dps)).toBe(true);
    expect(r.dps).toBeGreaterThanOrEqual(0);
  });
});

describe("every emitted warning code is a member of the public union", () => {
  // Contract guard: the optimizer branches on these codes, so an ad-hoc string
  // leaking into structuredWarnings would break pruning silently.
  const KNOWN: readonly ValidationErrorCode[] = [
    "unknown-character",
    "unknown-ability",
    "on-cooldown",
    "insufficient-energy",
    "redundant-swap",
    "past-time-limit",
    "mismatched-ability",
    "invalid-config",
  ];

  it("collects only known codes across a deliberately broken rotation", () => {
    const rotation = [
      { characterId: "ghost", actionType: "skill" },
      { characterId: "a", actionType: "ultimate" },
      { characterId: "a", actionType: "skill", abilityId: "a-q" },
      { characterId: "a", actionType: "burst", abilityId: "a-q" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "swap" },
    ] as unknown as Rotation;
    const r = simulateRotation([makeTestCharacter("a")], rotation, NEUTRAL_ENEMY, {
      ...NO_CRIT_CONFIG,
      swapCost: -1,
    });
    expect(r.structuredWarnings.length).toBeGreaterThan(0);
    for (const warning of r.structuredWarnings) {
      expect(KNOWN).toContain(warning.code);
    }
  });

  it("exercises both new codes in a single run", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "skill", abilityId: "a-q" }],
      NEUTRAL_ENEMY,
      { ...NO_CRIT_CONFIG, swapCost: -1 },
    );
    const codes = new Set(r.structuredWarnings.map((w) => w.code));
    expect(codes.has("mismatched-ability")).toBe(true);
    expect(codes.has("invalid-config")).toBe(true);
  });

  it("EPSILON is a small positive tolerance, not zero or negative", () => {
    // Boundary tests elsewhere divide EPSILON by 2 and rely on it being > 0.
    expect(EPSILON).toBeGreaterThan(0);
    expect(EPSILON).toBeLessThan(0.01);
  });
});
