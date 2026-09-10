import { describe, expect, it } from "vitest";
import type {
  EnemyModifierResolver,
  EnemyModifiers,
  Rotation,
  SimulationConfig,
} from "@/types";
import { NO_ENEMY_MODIFIERS } from "@/types";
import {
  MIN_SWAP_COST_SECONDS,
  noOpEnemyModifierResolver,
  resolveEnemyModifiers,
  simulateRotation,
  validateAction,
} from "@/simulation/engine";
import { createEnergyState } from "@/simulation/energy";
import { makeTestCharacter, NEUTRAL_ENEMY } from "@/tests/helpers/fixtures";
import type {
  CharacterDefinition,
  CharacterState,
  RotationAction,
} from "@/types";

const NO_CRIT: SimulationConfig = { critMode: "never" };

function statesOf(...defs: CharacterDefinition[]): Map<string, CharacterState> {
  const m = new Map<string, CharacterState>();
  for (const d of defs) {
    const energy = createEnergyState(d);
    m.set(d.id, {
      definition: d,
      currentEnergy: energy.current,
      energy,
      cooldowns: {},
    });
  }
  return m;
}

const skillOnly: Rotation = [
  { characterId: "a", actionType: "skill", abilityId: "a-e" },
];

function damageWith(resolver?: EnemyModifierResolver): number {
  return simulateRotation(
    [makeTestCharacter("a")],
    skillOnly,
    NEUTRAL_ENEMY,
    resolver ? { ...NO_CRIT, enemyModifierResolver: resolver } : NO_CRIT,
  ).totalDamage;
}

describe("enemy-modifier seam", () => {
  it("defaults to no shred, leaving damage unchanged", () => {
    expect(damageWith()).toBeCloseTo(damageWith(noOpEnemyModifierResolver));
  });

  it("resolveEnemyModifiers falls back to the no-op when undefined", () => {
    const ctx = {
      time: 0,
      character: makeTestCharacter("a"),
      ability: makeTestCharacter("a").elementalSkill,
      snapshot: { time: 0, characters: {} },
      enemy: NEUTRAL_ENEMY,
    };
    expect(resolveEnemyModifiers(ctx, undefined)).toEqual(NO_ENEMY_MODIFIERS);
  });

  it("applies DEF shred supplied by the resolver, increasing damage", () => {
    const shredded = damageWith(() => ({
      ...NO_ENEMY_MODIFIERS,
      defReduction: 0.5,
    }));
    expect(shredded).toBeGreaterThan(damageWith());
  });

  it("applies RES shred supplied by the resolver, increasing damage", () => {
    const enemy = { ...NEUTRAL_ENEMY, resistances: { pyro: 0.5 } };
    const base = simulateRotation([makeTestCharacter("a")], skillOnly, enemy, NO_CRIT);
    const shred = simulateRotation([makeTestCharacter("a")], skillOnly, enemy, {
      ...NO_CRIT,
      enemyModifierResolver: () => ({
        ...NO_ENEMY_MODIFIERS,
        resReduction: { pyro: 0.5 },
      }),
    });
    expect(shred.totalDamage).toBeGreaterThan(base.totalDamage);
  });

  it("hands the resolver the same per-hit context the buff seam receives", () => {
    const seen: string[] = [];
    const resolver: EnemyModifierResolver = (ctx) => {
      seen.push(`${ctx.character.id}:${ctx.ability.id}:${ctx.time}`);
      expect(ctx.enemy.id).toBe(NEUTRAL_ENEMY.id);
      expect(ctx.snapshot.characters["a"]).toBeDefined();
      return NO_ENEMY_MODIFIERS;
    };
    simulateRotation([makeTestCharacter("a")], skillOnly, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      enemyModifierResolver: resolver,
    });
    expect(seen).toEqual(["a:a-e:0"]);
  });

  it("is called once per damage instance, not per action", () => {
    let calls = 0;
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "b", actionType: "swap" }, // swaps deal no damage
    ];
    simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      rotation,
      NEUTRAL_ENEMY,
      {
        ...NO_CRIT,
        enemyModifierResolver: () => {
          calls++;
          return NO_ENEMY_MODIFIERS;
        },
      },
    );
    expect(calls).toBe(2);
  });

  it("stays deterministic with a shred resolver applied", () => {
    const resolver: EnemyModifierResolver = () => ({
      defReduction: 0.3,
      defIgnore: 0.1,
      resReduction: { pyro: 0.25 },
    });
    const run = (): string =>
      JSON.stringify(
        simulateRotation([makeTestCharacter("a")], skillOnly, NEUTRAL_ENEMY, {
          ...NO_CRIT,
          enemyModifierResolver: resolver,
        }),
      );
    expect(run()).toBe(run());
  });

  it("does not let shred from one hit leak into the next", () => {
    // Resolver shreds only the FIRST hit; the second must be un-shredded.
    let first = true;
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    const r = simulateRotation([makeTestCharacter("a")], rotation, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      enemyModifierResolver: (): EnemyModifiers => {
        if (first) {
          first = false;
          return { ...NO_ENEMY_MODIFIERS, defReduction: 0.5 };
        }
        return NO_ENEMY_MODIFIERS;
      },
    });
    const hits = r.timeline.filter((e) => e.type === "damage");
    expect(hits).toHaveLength(2);
    expect(hits[0]!.damage!.finalDamage).toBeGreaterThan(
      hits[1]!.damage!.finalDamage,
    );
  });
});

describe("negative swapCost is clamped (TASK #008 fix)", () => {
  const rotation: Rotation = [
    { characterId: "a", actionType: "normal", abilityId: "a-na" },
    { characterId: "b", actionType: "swap" },
  ];
  const team = (): CharacterDefinition[] => [
    makeTestCharacter("a"),
    makeTestCharacter("b"),
  ];

  it("never rewinds the clock", () => {
    const r = simulateRotation(team(), rotation, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      swapCost: -5,
    });
    expect(r.duration).toBeGreaterThanOrEqual(0);
    expect(r.duration).toBeCloseTo(0.5);
  });

  it("reports the clamp as an invalid-config warning", () => {
    const r = simulateRotation(team(), rotation, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      swapCost: -5,
    });
    expect(r.structuredWarnings.some((w) => w.code === "invalid-config")).toBe(true);
    expect(r.warnings.some((w) => w.includes("swapCost"))).toBe(true);
  });

  it("reports the clamped value as the effective swap cost", () => {
    const r = simulateRotation(team(), rotation, NEUTRAL_ENEMY, {
      ...NO_CRIT,
      swapCost: -5,
    });
    expect(r.effectiveSwapCost).toBe(MIN_SWAP_COST_SECONDS);
    const swap = r.timeline.find((e) => e.type === "swap")!;
    expect(swap.duration).toBe(MIN_SWAP_COST_SECONDS);
  });

  it("leaves a zero or positive swapCost untouched and warns for neither", () => {
    for (const cost of [0, 0.6, 2]) {
      const r = simulateRotation(team(), rotation, NEUTRAL_ENEMY, {
        ...NO_CRIT,
        swapCost: cost,
      });
      expect(r.effectiveSwapCost).toBe(cost);
      expect(r.structuredWarnings.some((w) => w.code === "invalid-config")).toBe(
        false,
      );
    }
  });
});

describe("abilityId is authoritative (TASK #008 fix)", () => {
  const a = makeTestCharacter("a");

  it("rejects an abilityId that does not match the actionType's ability", () => {
    const v = validateAction({
      action: { characterId: "a", actionType: "normal", abilityId: "a-e" },
      states: statesOf(a),
      time: 0,
      config: {},
    });
    expect(v).toMatchObject({ valid: false, code: "mismatched-ability" });
  });

  it("rejects a wholly bogus abilityId instead of silently running the slot", () => {
    const v = validateAction({
      action: {
        characterId: "a",
        actionType: "normal",
        abilityId: "does-not-exist",
      },
      states: statesOf(a),
      time: 0,
      config: {},
    });
    expect(v).toMatchObject({ valid: false, code: "mismatched-ability" });
  });

  it("accepts a matching abilityId", () => {
    const v = validateAction({
      action: { characterId: "a", actionType: "normal", abilityId: "a-na" },
      states: statesOf(a),
      time: 0,
      config: {},
    });
    expect(v).toEqual({ valid: true });
  });

  it("accepts an omitted abilityId (unchanged behaviour)", () => {
    const v = validateAction({
      action: { characterId: "a", actionType: "normal" },
      states: statesOf(a),
      time: 0,
      config: {},
    });
    expect(v).toEqual({ valid: true });
  });

  it("still reports unknown-ability for an unresolvable actionType", () => {
    // Ordering guarantee: unknown-ability is the more specific authoring error
    // and must win over mismatched-ability.
    const v = validateAction({
      // "ultimate" is not a valid ActionType; cast mirrors the existing
      // boundaries.test.ts pattern for exercising invalid authored input.
      action: {
        characterId: "a",
        actionType: "ultimate",
        abilityId: "a-x",
      } as unknown as RotationAction,
      states: statesOf(a),
      time: 0,
      config: {},
    });
    expect(v).toMatchObject({ valid: false, code: "unknown-ability" });
  });

  it("skips the mismatched action in a run rather than executing it", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "normal", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT,
    );
    expect(r.totalDamage).toBe(0);
    expect(r.structuredWarnings.map((w) => w.code)).toEqual([
      "mismatched-ability",
    ]);
  });
});
