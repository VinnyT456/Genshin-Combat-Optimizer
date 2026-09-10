import { describe, expect, it } from "vitest";
import {
  simulateRotation,
  validateAction,
  EPSILON,
  MIN_SWAP_COST_SECONDS,
} from "@/simulation/engine";
import { createEnergyState } from "@/simulation/energy";
import type {
  CharacterDefinition,
  CharacterState,
  Rotation,
  RotationAction,
} from "@/types";
import {
  expectedNeutralDamage,
  makeTestCharacter,
  NEUTRAL_ENEMY,
  NO_CRIT_CONFIG,
} from "@/tests/helpers/fixtures";

// ============================================================================
// Boundary and edge-case suite.
//
// Adversarial by design: these exist to find the places the engine breaks, not
// to confirm the happy path. Off-by-one at cooldown expiry, exact-energy
// bursts, degenerate teams and rotations, divide-by-zero DPS.
// ============================================================================

function statesOf(...defs: CharacterDefinition[]): Map<string, CharacterState> {
  return new Map(
    defs.map((def) => {
      const energy = createEnergyState(def);
      const state: CharacterState = {
        definition: def,
        currentEnergy: energy.current,
        energy,
        cooldowns: {},
      };
      return [def.id, state];
    }),
  );
}

describe("cooldown boundaries", () => {
  const cooldown = 6;

  it("is NOT ready one epsilon-scale step before availableAt", () => {
    const def = makeTestCharacter("a");
    const states = statesOf(def);
    states.get("a")!.cooldowns["a-e"] = cooldown;
    const v = validateAction({
      action: { characterId: "a", actionType: "skill", abilityId: "a-e" },
      states,
      time: cooldown - 1e-6,
      config: {},
    });
    expect(v.valid).toBe(false);
  });

  it("IS ready exactly at availableAt (inclusive boundary)", () => {
    const def = makeTestCharacter("a");
    const states = statesOf(def);
    states.get("a")!.cooldowns["a-e"] = cooldown;
    const v = validateAction({
      action: { characterId: "a", actionType: "skill", abilityId: "a-e" },
      states,
      time: cooldown,
      config: {},
    });
    expect(v.valid).toBe(true);
  });

  it("IS ready within EPSILON below availableAt (float slack)", () => {
    const def = makeTestCharacter("a");
    const states = statesOf(def);
    states.get("a")!.cooldowns["a-e"] = cooldown;
    const v = validateAction({
      action: { characterId: "a", actionType: "skill", abilityId: "a-e" },
      states,
      time: cooldown - EPSILON / 2,
      config: {},
    });
    expect(v.valid).toBe(true);
  });

  it("through the engine: a skill landing exactly at expiry is accepted", () => {
    // Skill 1.0s at t=0 -> ready at 6.0. Ten 0.5s normals fill 1.0 -> 6.0.
    const a = makeTestCharacter("a", {
      elementalSkill: { cooldown: 6, castTime: 1 },
    });
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      ...Array.from({ length: 10 }, (): RotationAction => ({
        characterId: "a",
        actionType: "normal",
        abilityId: "a-na",
      })),
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const r = simulateRotation([a], rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.warnings).toEqual([]);
    expect(r.timeline.filter((e) => e.damage?.abilityId === "a-e")).toHaveLength(2);
  });

  it("through the engine: one normal short of expiry is rejected", () => {
    const a = makeTestCharacter("a", {
      elementalSkill: { cooldown: 6, castTime: 1 },
    });
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      ...Array.from({ length: 9 }, (): RotationAction => ({
        characterId: "a",
        actionType: "normal",
        abilityId: "a-na",
      })),
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // t=5.5 < 6
    ];
    const r = simulateRotation([a], rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.warnings).toHaveLength(1);
    expect(r.structuredWarnings[0]!.code).toBe("on-cooldown");
    expect(r.structuredWarnings[0]!.availableAt).toBeCloseTo(6);
  });

  it("a zero-cooldown ability is never recorded and never blocks", () => {
    const a = makeTestCharacter("a", { normalAttack: { cooldown: 0 } });
    const rotation: Rotation = Array.from({ length: 5 }, () => ({
      characterId: "a",
      actionType: "normal" as const,
      abilityId: "a-na",
    }));
    const r = simulateRotation([a], rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.warnings).toEqual([]);
    expect(r.finalState.characters["a"]!.cooldowns).toEqual({});
  });

  it("a negative cooldown is treated as no cooldown, not as time travel", () => {
    const a = makeTestCharacter("a", { elementalSkill: { cooldown: -5 } });
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const r = simulateRotation([a], rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.warnings).toEqual([]);
    expect(r.finalState.characters["a"]!.cooldowns["a-e"]).toBeUndefined();
  });

  it("cooldowns are per-character, never shared across the team", () => {
    const team = [makeTestCharacter("a"), makeTestCharacter("b")];
    const r = simulateRotation(
      team,
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" },
        { characterId: "b", actionType: "swap" },
        { characterId: "b", actionType: "skill", abilityId: "b-e" },
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.warnings).toEqual([]);
    expect(r.finalState.characters["a"]!.cooldowns["a-e"]).toBeDefined();
    expect(r.finalState.characters["b"]!.cooldowns["b-e"]).toBeDefined();
    expect(r.finalState.characters["a"]!.cooldowns["b-e"]).toBeUndefined();
  });
});

describe("energy boundaries", () => {
  it("a burst at EXACTLY the energy cost is legal and drains to zero", () => {
    const a = makeTestCharacter("a", {
      maxEnergy: 40,
      elementalSkill: { cooldown: 0, energyGenerated: 20 },
      elementalBurst: { energyCost: 40 },
    });
    const r = simulateRotation(
      [a],
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" }, // 20
        { characterId: "a", actionType: "skill", abilityId: "a-e" }, // 40 exactly
        { characterId: "a", actionType: "burst", abilityId: "a-q" },
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.warnings).toEqual([]);
    expect(r.finalState.characters["a"]!.energy.current).toBe(0);
    expect(r.finalState.characters["a"]!.energy.totalSpent).toBe(40);
  });

  it("a burst one unit below the cost is rejected", () => {
    const a = makeTestCharacter("a", {
      elementalSkill: { cooldown: 0, energyGenerated: 39 },
      elementalBurst: { energyCost: 40 },
    });
    const r = simulateRotation(
      [a],
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" },
        { characterId: "a", actionType: "burst", abilityId: "a-q" },
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.structuredWarnings.map((w) => w.code)).toEqual(["insufficient-energy"]);
    expect(r.finalState.characters["a"]!.energy.current).toBe(39);
    expect(r.finalState.characters["a"]!.energy.totalSpent).toBe(0);
  });

  it("accepts a burst within EPSILON of the cost (float accumulation slack)", () => {
    const def = makeTestCharacter("a");
    const states = statesOf(def);
    states.get("a")!.energy.current = 40 - EPSILON / 2;
    const v = validateAction({
      action: { characterId: "a", actionType: "burst", abilityId: "a-q" },
      states,
      time: 0,
      config: {},
    });
    expect(v.valid).toBe(true);
  });

  it("a zero-cost burst is always castable and emits no spend event", () => {
    const a = makeTestCharacter("a", { elementalBurst: { energyCost: 0 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "burst", abilityId: "a-q" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.warnings).toEqual([]);
    expect(r.timeline.filter((e) => e.type === "energy")).toEqual([]);
    expect(r.finalState.characters["a"]!.energy.totalSpent).toBe(0);
  });

  it("energy never exceeds maxEnergy or drops below zero", () => {
    const a = makeTestCharacter("a", {
      maxEnergy: 40,
      elementalSkill: { cooldown: 0, energyGenerated: 35 },
      elementalBurst: { cooldown: 0, energyCost: 40 },
    });
    const rotation: Rotation = [];
    for (let i = 0; i < 6; i++) {
      rotation.push({ characterId: "a", actionType: "skill", abilityId: "a-e" });
      rotation.push({ characterId: "a", actionType: "burst", abilityId: "a-q" });
    }
    const r = simulateRotation([a], rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    for (const event of r.timeline) {
      if (event.energy === undefined) continue;
      expect(event.energy).toBeGreaterThanOrEqual(0);
      expect(event.energy).toBeLessThanOrEqual(40);
    }
    const final = r.finalState.characters["a"]!.energy;
    expect(final.current).toBeGreaterThanOrEqual(0);
    expect(final.current).toBeLessThanOrEqual(final.max);
  });

  it("a zero-maxEnergy character can never gain energy", () => {
    const a = makeTestCharacter("a", {
      maxEnergy: 0,
      elementalSkill: { cooldown: 0, energyGenerated: 50 },
    });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    const energy = r.finalState.characters["a"]!.energy;
    expect(energy.current).toBe(0);
    expect(energy.totalGained).toBe(0);
  });
});

describe("degenerate rotations and teams", () => {
  it("an empty rotation produces a zero result, not a crash", () => {
    const r = simulateRotation([makeTestCharacter("a")], [], NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.totalDamage).toBe(0);
    expect(r.duration).toBe(0);
    expect(r.dps).toBe(0);
    expect(r.timeline).toEqual([]);
    expect(r.errors).toEqual([]);
  });

  it("an empty team rejects every action as unknown-character", () => {
    const r = simulateRotation(
      [],
      [
        { characterId: "a", actionType: "normal", abilityId: "a-na" },
        { characterId: "b", actionType: "swap" },
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.errors).toHaveLength(2);
    expect(r.totalDamage).toBe(0);
    expect(r.finalState.characters).toEqual({});
  });

  it("guards DPS against divide-by-zero when duration is 0", () => {
    // Zero cast time: damage is dealt but no time passes.
    const a = makeTestCharacter("a", { normalAttack: { castTime: 0 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.duration).toBe(0);
    expect(r.totalDamage).toBeCloseTo(expectedNeutralDamage(1000, 1));
    // Must be a finite guard value, never Infinity or NaN.
    expect(Number.isFinite(r.dps)).toBe(true);
    expect(r.dps).toBe(0);
  });

  it("an unknown character id is an error, not a thrown exception", () => {
    expect(() =>
      simulateRotation(
        [makeTestCharacter("a")],
        [{ characterId: "does-not-exist", actionType: "skill" }],
        NEUTRAL_ENEMY,
        NO_CRIT_CONFIG,
      ),
    ).not.toThrow();
  });

  it("an action naming an actionType the character lacks is skipped", () => {
    const rotation = [
      { characterId: "a", actionType: "ultimate", abilityId: "a-x" },
    ] as unknown as Rotation;
    const r = simulateRotation([makeTestCharacter("a")], rotation, NEUTRAL_ENEMY, NO_CRIT_CONFIG);
    expect(r.totalDamage).toBe(0);
    expect(r.structuredWarnings.map((w) => w.code)).toEqual(["unknown-ability"]);
  });

  it("a rotation of only swaps deals no damage but advances the clock", () => {
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      [
        { characterId: "a", actionType: "swap" },
        { characterId: "b", actionType: "swap" },
        { characterId: "a", actionType: "swap" },
      ],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.totalDamage).toBe(0);
    expect(r.dps).toBe(0);
    expect(r.duration).toBeCloseTo(1.8);
    expect(r.warnings).toEqual([]);
  });

  it("the first swap of a run is never redundant (no character on-field yet)", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "swap" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.warnings).toEqual([]);
    expect(r.finalState.activeCharacterId).toBe("a");
  });

  it("a time limit hit mid-rotation truncates without corrupting state", () => {
    const a = makeTestCharacter("a", {
      elementalSkill: { cooldown: 0, castTime: 1, energyGenerated: 10 },
    });
    const rotation: Rotation = Array.from({ length: 10 }, () => ({
      characterId: "a",
      actionType: "skill" as const,
      abilityId: "a-e",
    }));
    const r = simulateRotation([a], rotation, NEUTRAL_ENEMY, {
      ...NO_CRIT_CONFIG,
      timeLimit: 3,
    });
    // Actions start at 0,1,2 -> three run; the one at t=3 and beyond are cut.
    expect(r.timeline.filter((e) => e.type === "damage")).toHaveLength(3);
    expect(r.duration).toBeCloseTo(3);
    expect(r.finalState.characters["a"]!.energy.current).toBe(30);
    expect(r.structuredWarnings).toHaveLength(7);
    for (const w of r.structuredWarnings) expect(w.code).toBe("past-time-limit");
  });

  it("every action after the time limit is rejected, none slip through", () => {
    const rotation: Rotation = Array.from({ length: 20 }, () => ({
      characterId: "a",
      actionType: "normal" as const,
      abilityId: "a-na",
    }));
    const r = simulateRotation([makeTestCharacter("a")], rotation, NEUTRAL_ENEMY, {
      ...NO_CRIT_CONFIG,
      timeLimit: 2,
    });
    for (const event of r.timeline) {
      expect(event.timestamp).toBeLessThan(2);
    }
  });
});

describe("extreme stat values", () => {
  it("clamps a negative crit rate to 0 rather than reducing damage", () => {
    const a = makeTestCharacter("a", { stats: { critRate: -5, critDmg: 1 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      { critMode: "expected" },
    );
    expect(r.totalDamage).toBeCloseTo(expectedNeutralDamage(1000, 1));
  });

  it("clamps a crit rate above 1 to 1 rather than over-scaling", () => {
    const a = makeTestCharacter("a", { stats: { critRate: 5, critDmg: 1 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      { critMode: "expected" },
    );
    // Capped at 100% crit: 500 * (1 + 1*1) = 1000, not 500 * 6.
    expect(r.totalDamage).toBeCloseTo(expectedNeutralDamage(1000, 1) * 2);
  });

  it("produces zero damage for zero ATK, without NaN", () => {
    const a = makeTestCharacter("a", { stats: { atk: 0 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.totalDamage).toBe(0);
    expect(Number.isFinite(r.dps)).toBe(true);
  });

  it("produces zero damage for a zero multiplier", () => {
    const a = makeTestCharacter("a", { elementalSkill: { multiplier: 0 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(r.totalDamage).toBe(0);
  });

  it("handles high resistance (>= 0.75) via the divisor branch", () => {
    const a = makeTestCharacter("a", { element: "pyro" });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      { ...NEUTRAL_ENEMY, resistances: { pyro: 0.75 } },
      NO_CRIT_CONFIG,
    );
    // res mult = 1/(4*0.75+1) = 0.25 -> 1000 * 2 * 0.5 * 0.25 = 250
    expect(r.totalDamage).toBeCloseTo(250);
  });

  it("handles negative resistance via the halving branch", () => {
    const a = makeTestCharacter("a", { element: "pyro" });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      { ...NEUTRAL_ENEMY, resistances: { pyro: -0.5 } },
      NO_CRIT_CONFIG,
    );
    // res mult = 1 - (-0.5/2) = 1.25 -> 1000 * 2 * 0.5 * 1.25 = 1250
    expect(r.totalDamage).toBeCloseTo(1250);
  });

  it("applies resistance per-element, not globally", () => {
    // Skill is pyro, normal attack is pyro too by fixture default; make the
    // normal physical so the two use different resistance entries.
    const a = makeTestCharacter("a", {
      element: "pyro",
      normalAttack: { element: "physical" },
    });
    const r = simulateRotation(
      [a],
      [
        { characterId: "a", actionType: "skill", abilityId: "a-e" }, // pyro, 0 res
        { characterId: "a", actionType: "normal", abilityId: "a-na" }, // physical, 50% res
      ],
      { ...NEUTRAL_ENEMY, resistances: { physical: 0.5 } },
      NO_CRIT_CONFIG,
    );
    expect(r.damageByElement["pyro"]).toBeCloseTo(1000);
    expect(r.damageByElement["physical"]).toBeCloseTo(250);
  });

  it("a negative swapCost must not rewind the clock", () => {
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      [
        { characterId: "a", actionType: "normal", abilityId: "a-na" },
        { characterId: "b", actionType: "swap" },
      ],
      NEUTRAL_ENEMY,
      { ...NO_CRIT_CONFIG, swapCost: -5 },
    );
    // FIXED (TASK #008): a negative swapCost is clamped to MIN_SWAP_COST_SECONDS
    // and reported, instead of rewinding the clock. Previously this pinned the
    // defective behaviour (duration -4.5); it now asserts the correction.
    // Duration is the 0.5s normal attack plus a 0s clamped swap.
    expect(r.duration).toBeCloseTo(0.5);
    expect(r.duration).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(r.dps)).toBe(true);
    expect(r.dps).toBeGreaterThanOrEqual(0);
    // The clamp is surfaced, not silent.
    expect(r.effectiveSwapCost).toBe(MIN_SWAP_COST_SECONDS);
    expect(
      r.structuredWarnings.some((w) => w.code === "invalid-config"),
    ).toBe(true);
  });
});
