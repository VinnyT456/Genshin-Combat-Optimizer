import { describe, expect, it } from "vitest";
import {
  DEFAULT_SWAP_COST_SECONDS,
  simulateRotation,
  validateAction,
} from "@/simulation/engine";
import { createEnergyState } from "@/simulation/energy";
import type {
  CharacterDefinition,
  CharacterState,
  Rotation,
  SimulationConfig,
  ValidationErrorCode,
} from "@/types";
import {
  expectedNeutralDamage,
  makeTestCharacter,
  NEUTRAL_ENEMY,
  NO_CRIT_CONFIG,
} from "@/tests/helpers/fixtures";

// ============================================================================
// Public API contract tests.
//
// Asserts the FROZEN surface behaves as documented in docs/ARCHITECTURE.md:
// every ValidationErrorCode, SimulationConfig field semantics, and the
// accuracy of SimulationResult.finalState.
// ============================================================================

function stateFor(def: CharacterDefinition): CharacterState {
  const energy = createEnergyState(def);
  return { definition: def, currentEnergy: energy.current, energy, cooldowns: {} };
}

function statesOf(...defs: CharacterDefinition[]): Map<string, CharacterState> {
  return new Map(defs.map((d) => [d.id, stateFor(d)]));
}

/** Narrowing helper: asserts invalid and returns the error code. */
function codeOf(
  verdict: ReturnType<typeof validateAction>,
): ValidationErrorCode {
  expect(verdict.valid).toBe(false);
  if (verdict.valid) throw new Error("expected an invalid verdict");
  return verdict.code;
}

describe("validateAction(): every ValidationErrorCode", () => {
  it("unknown-character: character id not present in the team", () => {
    const v = validateAction({
      action: { characterId: "nobody", actionType: "normal" },
      states: statesOf(makeTestCharacter("a")),
      time: 0,
      config: {},
    });
    expect(codeOf(v)).toBe("unknown-character");
  });

  it("unknown-character takes priority over every other failure", () => {
    // Unknown character + past the time limit + swap-to-self: identity first.
    const v = validateAction({
      action: { characterId: "nobody", actionType: "swap" },
      states: statesOf(makeTestCharacter("a")),
      time: 100,
      activeCharacterId: "nobody",
      config: { timeLimit: 1 },
    });
    expect(codeOf(v)).toBe("unknown-character");
  });

  it("unknown-ability: an actionType the character cannot resolve", () => {
    const v = validateAction({
      // Runtime-invalid input, as an untyped caller (UI/JSON) could supply.
      action: { characterId: "a", actionType: "ultimate" } as never,
      states: statesOf(makeTestCharacter("a")),
      time: 0,
      config: {},
    });
    expect(codeOf(v)).toBe("unknown-ability");
  });

  it("on-cooldown: reports availableAt so the optimizer can reschedule", () => {
    const def = makeTestCharacter("a");
    const states = statesOf(def);
    states.get("a")!.cooldowns[def.elementalSkill.id] = 6;
    const v = validateAction({
      action: { characterId: "a", actionType: "skill", abilityId: "a-e" },
      states,
      time: 5.999,
      config: {},
    });
    expect(codeOf(v)).toBe("on-cooldown");
    if (v.valid) throw new Error("unreachable");
    expect(v.availableAt).toBe(6);
  });

  it("insufficient-energy: burst below cost", () => {
    const states = statesOf(makeTestCharacter("a"));
    states.get("a")!.energy.current = 39.9;
    const v = validateAction({
      action: { characterId: "a", actionType: "burst", abilityId: "a-q" },
      states,
      time: 0,
      config: {},
    });
    expect(codeOf(v)).toBe("insufficient-energy");
  });

  it("redundant-swap: swapping to the character already on-field", () => {
    const v = validateAction({
      action: { characterId: "a", actionType: "swap" },
      states: statesOf(makeTestCharacter("a")),
      time: 0,
      activeCharacterId: "a",
      config: {},
    });
    expect(codeOf(v)).toBe("redundant-swap");
  });

  it("past-time-limit: applies to swaps as well as damage actions", () => {
    const states = statesOf(makeTestCharacter("a"), makeTestCharacter("b"));
    const v = validateAction({
      action: { characterId: "b", actionType: "swap" },
      states,
      time: 10,
      activeCharacterId: "a",
      config: { timeLimit: 10 },
    });
    expect(codeOf(v)).toBe("past-time-limit");
  });

  it("accepts a legal action and reports no code", () => {
    const v = validateAction({
      action: { characterId: "a", actionType: "normal", abilityId: "a-na" },
      states: statesOf(makeTestCharacter("a")),
      time: 0,
      config: {},
    });
    expect(v).toEqual({ valid: true });
  });

  it("is pure: validating does not mutate the states it inspects", () => {
    const states = statesOf(makeTestCharacter("a"));
    const before = JSON.stringify([...states].map(([, s]) => s.energy));
    for (const actionType of ["normal", "charged", "skill", "burst", "swap"] as const) {
      validateAction({
        action: { characterId: "a", actionType },
        states,
        time: 0,
        config: {},
      });
    }
    expect(JSON.stringify([...states].map(([, s]) => s.energy))).toBe(before);
  });
});

describe("SimulationConfig field semantics", () => {
  it("swapCost defaults to DEFAULT_SWAP_COST_SECONDS (0.6)", () => {
    expect(DEFAULT_SWAP_COST_SECONDS).toBe(0.6);
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      [{ characterId: "b", actionType: "swap" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.duration).toBeCloseTo(DEFAULT_SWAP_COST_SECONDS);
  });

  it("swapCost of 0 makes swaps free on the clock", () => {
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      [
        { characterId: "b", actionType: "swap" },
        { characterId: "a", actionType: "swap" },
        { characterId: "a", actionType: "normal", abilityId: "a-na" },
      ],
      NEUTRAL_ENEMY,
      { ...NO_CRIT_CONFIG, swapCost: 0 },
    );
    expect(r.duration).toBeCloseTo(0.5);
  });

  it("critMode 'never' yields exactly the non-crit damage", () => {
    const a = makeTestCharacter("a", { stats: { critRate: 1, critDmg: 2 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      { critMode: "never" },
    );
    // 1000 ATK * 1.0 mult * 0.5 def = 500, crit ignored entirely.
    expect(r.totalDamage).toBeCloseTo(expectedNeutralDamage(1000, 1));
  });

  it("critMode 'always' multiplies by (1 + critDmg)", () => {
    const a = makeTestCharacter("a", { stats: { critRate: 0, critDmg: 2 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      { critMode: "always" },
    );
    expect(r.totalDamage).toBeCloseTo(expectedNeutralDamage(1000, 1) * 3);
  });

  it("critMode 'expected' (the default) uses 1 + rate*dmg", () => {
    const a = makeTestCharacter("a", { stats: { critRate: 0.5, critDmg: 2 } });
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    const explicit = simulateRotation([a], rotation, NEUTRAL_ENEMY, {
      critMode: "expected",
    });
    const implicit = simulateRotation([a], rotation, NEUTRAL_ENEMY, {});
    expect(explicit.totalDamage).toBeCloseTo(expectedNeutralDamage(1000, 1) * 2);
    expect(implicit.totalDamage).toBeCloseTo(explicit.totalDamage);
  });

  it("expected damage always sits between the non-crit and crit bounds", () => {
    const a = makeTestCharacter("a", { stats: { critRate: 0.37, critDmg: 1.4 } });
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const never = simulateRotation([a], rotation, NEUTRAL_ENEMY, { critMode: "never" });
    const expected = simulateRotation([a], rotation, NEUTRAL_ENEMY, { critMode: "expected" });
    const always = simulateRotation([a], rotation, NEUTRAL_ENEMY, { critMode: "always" });
    expect(expected.totalDamage).toBeGreaterThan(never.totalDamage);
    expect(expected.totalDamage).toBeLessThan(always.totalDamage);
  });

  it("every DamageInstance reports non-crit, crit and final consistently", () => {
    const a = makeTestCharacter("a", { stats: { critRate: 0.5, critDmg: 1 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      { critMode: "expected" },
    );
    const d = r.timeline[0]!.damage!;
    expect(d.critDamage).toBeCloseTo(d.nonCritDamage * 2);
    expect(d.finalDamage).toBeCloseTo(d.nonCritDamage * 1.5);
    expect(d.rawDamage).toBeCloseTo(1000 * 2);
  });

  it("timeLimit rejects actions starting at or after the bound", () => {
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" }, // t=0.0
      { characterId: "a", actionType: "normal", abilityId: "a-na" }, // t=0.5
      { characterId: "a", actionType: "normal", abilityId: "a-na" }, // t=1.0 -> blocked
    ];
    const r = simulateRotation([makeTestCharacter("a")], rotation, NEUTRAL_ENEMY, {
      ...NO_CRIT_CONFIG,
      timeLimit: 1,
    });
    expect(r.totalDamage).toBeCloseTo(expectedNeutralDamage(1000, 1) * 2);
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0]).toContain("time limit");
  });

  it("timeLimit of 0 rejects every action", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      { ...NO_CRIT_CONFIG, timeLimit: 0 },
    );
    expect(r.totalDamage).toBe(0);
    expect(r.timeline).toEqual([]);
    expect(r.warnings).toHaveLength(1);
  });

  it("an undefined timeLimit is unbounded", () => {
    const rotation: Rotation = Array.from({ length: 50 }, () => ({
      characterId: "a",
      actionType: "normal" as const,
      abilityId: "a-na",
    }));
    const r = simulateRotation([makeTestCharacter("a")], rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.warnings).toEqual([]);
    expect(r.duration).toBeCloseTo(25);
  });
});

describe("SimulationResult.finalState accuracy", () => {
  it("reports the end-of-run clock and on-field character", () => {
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" }, // 1.0s
        { characterId: "b", actionType: "swap" }, // 0.6s
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.finalState.time).toBeCloseTo(1.6);
    expect(r.finalState.time).toBeCloseTo(r.duration);
    expect(r.finalState.activeCharacterId).toBe("b");
  });

  it("has no active character before any action runs", () => {
    const r = simulateRotation([makeTestCharacter("a")], [], NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.finalState.activeCharacterId).toBeUndefined();
    expect(r.finalState.time).toBe(0);
  });

  it("includes every team member, even ones that never acted", () => {
    const team = ["a", "b", "c", "d"].map((id) => makeTestCharacter(id));
    const r = simulateRotation(
      team,
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(Object.keys(r.finalState.characters).sort()).toEqual(["a", "b", "c", "d"]);
    for (const id of ["b", "c", "d"]) {
      expect(r.finalState.characters[id]!.energy.current).toBe(0);
      expect(r.finalState.characters[id]!.cooldowns).toEqual({});
    }
  });

  it("records cooldown expiry timestamps as absolute times", () => {
    const a = makeTestCharacter("a", {
      elementalSkill: { cooldown: 6, castTime: 1 },
      normalAttack: { castTime: 0.5 },
    });
    const r = simulateRotation(
      [a],
      [
        { characterId: "a", actionType: "normal", abilityId: "a-na" }, // t=0
        { characterId: "a", actionType: "skill", abilityId: "a-e" }, // t=0.5 -> ready at 6.5
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.finalState.characters["a"]!.cooldowns["a-e"]).toBeCloseTo(6.5);
    // Zero-cooldown abilities must not appear in the map at all.
    expect(r.finalState.characters["a"]!.cooldowns["a-na"]).toBeUndefined();
  });

  it("reflects energy gained, spent and capped", () => {
    const a = makeTestCharacter("a", {
      maxEnergy: 40,
      elementalSkill: { cooldown: 0, energyGenerated: 30 },
    });
    const r = simulateRotation(
      [a],
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" }, // 0 -> 30
        { characterId: "a", actionType: "skill", abilityId: "a-e" }, // 30 -> 40 (capped)
        { characterId: "a", actionType: "burst", abilityId: "a-q" }, // -40 -> 0
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    const s = r.finalState.characters["a"]!.energy;
    expect(s.current).toBe(0);
    expect(s.max).toBe(40);
    expect(s.totalGained).toBe(40); // 30 + 10 after the cap
    expect(s.totalSpent).toBe(40);
  });

  it("keeps finalState energy consistent with the last energy event", () => {
    const a = makeTestCharacter("a", { elementalSkill: { cooldown: 0, energyGenerated: 15 } });
    const r = simulateRotation(
      [a],
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" },
        { characterId: "a", actionType: "skill", abilityId: "a-e" },
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    const energyEvents = r.timeline.filter((e) => e.type === "energy");
    const last = energyEvents[energyEvents.length - 1]!;
    expect(r.finalState.characters["a"]!.energy.current).toBe(last.energy);
  });

  it("is a snapshot, not a live reference: mutating it cannot corrupt a rerun", () => {
    const team = [makeTestCharacter("a")];
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const first = simulateRotation(team, rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    first.finalState.characters["a"]!.energy.current = 9999;
    const second = simulateRotation(team, rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(second.finalState.characters["a"]!.energy.current).toBe(20);
  });

  it("is JSON-serializable for Web Worker transfer", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    const roundTripped = JSON.parse(JSON.stringify(r.finalState)) as typeof r.finalState;
    expect(roundTripped).toEqual(r.finalState);
  });
});

describe("SimulationResult shape contract", () => {
  it("always returns every documented field, even for a no-op run", () => {
    const r = simulateRotation([], [], NEUTRAL_ENEMY, {});
    // Asserted field-by-field rather than as an exact object: the result type
    // is allowed to grow ADDITIVELY (e.g. `structuredWarnings`,
    // `effectiveSwapCost` arrived in Phase 2). An exact-shape assertion would
    // turn every legal additive change into a false failure. What must never
    // change is that these documented fields exist with these zero values.
    expect(r.totalDamage).toBe(0);
    expect(r.dps).toBe(0);
    expect(r.duration).toBe(0);
    expect(r.damageByCharacter).toEqual({});
    expect(r.damageByAbility).toEqual({});
    expect(r.damageByElement).toEqual({});
    expect(r.timeline).toEqual([]);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
    expect(r.finalState).toEqual({
      time: 0,
      activeCharacterId: undefined,
      characters: {},
    });
  });

  it("reports the effective swap cost actually used for the run", () => {
    const team = [makeTestCharacter("a"), makeTestCharacter("b")];
    const rotation: Rotation = [{ characterId: "b", actionType: "swap" }];
    const defaulted = simulateRotation(team, rotation, NEUTRAL_ENEMY, {});
    expect(defaulted.effectiveSwapCost).toBe(DEFAULT_SWAP_COST_SECONDS);

    const overridden = simulateRotation(team, rotation, NEUTRAL_ENEMY, {
      swapCost: 1.25,
    });
    expect(overridden.effectiveSwapCost).toBe(1.25);
    expect(overridden.duration).toBeCloseTo(overridden.effectiveSwapCost);
  });

  it("keeps structuredWarnings aligned one-to-one with warnings", () => {
    const team = [makeTestCharacter("a")];
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // on cooldown
      { characterId: "a", actionType: "burst", abilityId: "a-q" }, // no energy
    ];
    const r = simulateRotation(team, rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.structuredWarnings).toHaveLength(r.warnings.length);
    const codes = r.structuredWarnings.map((w) => w.code);
    expect(codes).toEqual(["on-cooldown", "insufficient-energy"]);
  });

  it("keys damageByAbility by ability ID (names collide; ids do not)", () => {
    // TASK #022 S1 changed this key from `ability.name` to `ability.id`.
    // The fixture sets `name === id`, so a test that merely read the name
    // would still pass while asserting the WRONG contract. Both are checked
    // here against ids explicitly, and `abilityNamesById` supplies labels.
    const a = makeTestCharacter("a", { element: "hydro" });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(Object.keys(r.damageByAbility)).toEqual([a.elementalSkill.id]);
    expect(Object.keys(r.damageByElement)).toEqual(["hydro"]);
    expect(Object.keys(r.damageByCharacter)).toEqual(["a"]);

    // Display labels live in a SEPARATE map, keyed by the same id.
    expect(r.abilityNamesById[a.elementalSkill.id]).toBe(a.elementalSkill.name);
  });

  it("two abilities SHARING a name stay separate rows in damageByAbility", () => {
    // The discriminating case the old name-keyed contract got wrong: two
    // distinct abilities with the same display name must not merge.
    const a = makeTestCharacter("a", { element: "hydro" });
    const collided = {
      ...a,
      elementalSkill: { ...a.elementalSkill, name: "Shared Name" },
      elementalBurst: {
        ...a.elementalBurst,
        name: "Shared Name",
        energyCost: 0,
      },
    };
    const r = simulateRotation(
      [collided],
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" },
        { characterId: "a", actionType: "burst", abilityId: "a-q" },
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(Object.keys(r.damageByAbility).sort()).toEqual(["a-e", "a-q"]);
    expect(r.abilityNamesById["a-e"]).toBe("Shared Name");
    expect(r.abilityNamesById["a-q"]).toBe("Shared Name");
  });

  it("warns rather than throwing on an unimplemented resumeFrom", () => {
    const seed = simulateRotation([makeTestCharacter("a")], [], NEUTRAL_ENEMY, {});
    const config: SimulationConfig = { resumeFrom: seed.finalState };
    expect(() =>
      simulateRotation([makeTestCharacter("a")], [], NEUTRAL_ENEMY, config),
    ).not.toThrow();
    const r = simulateRotation([makeTestCharacter("a")], [], NEUTRAL_ENEMY, config);
    // resumeFrom is IMPLEMENTED as of TASK #051 — the engine restores from the
    // snapshot instead of warning. This asserted the old not-implemented warning.
    expect(r.warnings.some((w) => w.includes("resumeFrom"))).toBe(false);
  });
});
