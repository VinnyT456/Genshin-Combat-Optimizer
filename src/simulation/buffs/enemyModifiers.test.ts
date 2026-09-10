import { describe, expect, it } from "vitest";
import type { BuffContext, EnemyState } from "@/types";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { defMultiplier, resMultiplier } from "@/simulation/damage/pipeline";
import {
  makeBuffResolver,
  makeEnemyModifierResolver,
  makeResolvers,
} from "@/simulation/buffs/makeBuffResolver";
import { sumActiveEnemyModifiers } from "@/simulation/buffs/resolver";
import type { Buff } from "@/simulation/buffs/types";

// A buff carrying ONLY enemy-side modifiers (no stat modifiers at all).
function shredBuff(overrides: Partial<Buff> = {}): Buff {
  return {
    id: "shred",
    source: "test-shred",
    startTime: 0,
    duration: 10,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    enemyModifiers: [{ key: "resReduction", value: 0.4, element: "pyro" }],
    ...overrides,
  };
}

function makeContext(time = 0): BuffContext {
  return {
    time,
    character: testPyro,
    ability: testPyro.elementalSkill,
    activeCharacterId: testPyro.id,
    snapshot: { time, activeCharacterId: testPyro.id, characters: {} },
    enemy: testEnemy,
  };
}

describe("makeEnemyModifierResolver — frozen EnemyModifierResolver contract", () => {
  it("assigns directly to the frozen signature and aggregates shred", () => {
    const resolve = makeEnemyModifierResolver({ buffs: [shredBuff()] });
    expect(resolve(makeContext())).toEqual({
      defReduction: 0,
      defIgnore: 0,
      resReduction: { pyro: 0.4 },
    });
  });

  it("reports no shred when nothing is active", () => {
    const resolve = makeEnemyModifierResolver({
      buffs: [shredBuff({ startTime: 100 })],
    });
    expect(resolve(makeContext())).toEqual({
      defReduction: 0,
      defIgnore: 0,
      resReduction: {},
    });
  });

  it("honours the same window / condition gating as the stat seam", () => {
    const burstOnly = makeEnemyModifierResolver({
      buffs: [shredBuff({ conditions: { damageTypes: ["burst"] } })],
    });
    // Context ability is a skill, so the debuff must not apply.
    expect(burstOnly(makeContext()).resReduction).toEqual({});
  });

  it("scales enemy modifiers by stack count", () => {
    const mk = (startTime: number) =>
      shredBuff({
        startTime,
        stacking: { mode: "stack", maxStacks: 3 },
        enemyModifiers: [{ key: "defReduction", value: 0.1 }],
      });
    const resolve = makeEnemyModifierResolver({ buffs: [mk(0), mk(1)] });
    expect(resolve(makeContext(2)).defReduction).toBeCloseTo(0.2, 10);
  });

  it("sums defReduction and defIgnore in their own channels", () => {
    const resolve = makeEnemyModifierResolver({
      buffs: [
        shredBuff({
          id: "a",
          enemyModifiers: [
            { key: "defReduction", value: 0.2 },
            { key: "defIgnore", value: 0.1 },
          ],
        }),
        shredBuff({
          id: "b",
          enemyModifiers: [{ key: "defReduction", value: 0.15 }],
        }),
      ],
    });
    const totals = resolve(makeContext());
    expect(totals.defReduction).toBeCloseTo(0.35, 10);
    expect(totals.defIgnore).toBeCloseTo(0.1, 10);
  });

  it("does not mutate context, and returns a fresh object each call", () => {
    const resolve = makeEnemyModifierResolver({ buffs: [shredBuff()] });
    const context = makeContext();
    const before = structuredClone(context);
    const a = resolve(context);
    const b = resolve(context);
    expect(context).toEqual(before);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(a.resReduction).not.toBe(b.resReduction);
  });

  it("is insulated from later mutation of the caller's buff array", () => {
    const buffs: Buff[] = [shredBuff()];
    const resolve = makeEnemyModifierResolver({ buffs });
    const before = resolve(makeContext());
    buffs.push(shredBuff({ id: "sneaky" }));
    expect(resolve(makeContext())).toEqual(before);
  });

  it("ignores a resReduction that names no element", () => {
    const resolve = makeEnemyModifierResolver({
      buffs: [shredBuff({ enemyModifiers: [{ key: "resReduction", value: 0.4 }] })],
    });
    expect(resolve(makeContext()).resReduction).toEqual({});
  });

  it("treats a buff with no enemyModifiers as contributing nothing", () => {
    const resolve = makeEnemyModifierResolver({
      buffs: [
        {
          id: "stat-only",
          source: "test",
          startTime: 0,
          duration: 10,
          stacking: { mode: "refresh" },
          targets: { scope: "party" },
          modifiers: [{ stat: "dmgBonus", value: 0.5 }],
        },
      ],
    });
    expect(resolve(makeContext())).toEqual({
      defReduction: 0,
      defIgnore: 0,
      resReduction: {},
    });
  });

  it("sumActiveEnemyModifiers does not mutate the buffs it reads", () => {
    const buff = shredBuff();
    const before = structuredClone(buff);
    sumActiveEnemyModifiers([{ buff, stacks: 2 }]);
    expect(buff).toEqual(before);
  });
});

describe("shred through simulateRotation — end to end", () => {
  const rotation = [
    {
      characterId: testPyro.id,
      actionType: "skill" as const,
      abilityId: testPyro.elementalSkill.id,
    },
  ];

  const baseline = simulateRotation([testPyro], rotation, testEnemy);

  function run(buffs: Buff[]) {
    return simulateRotation([testPyro], rotation, testEnemy, {
      enemyModifierResolver: makeEnemyModifierResolver({ buffs }),
    });
  }

  it("RES shred increases damage by exactly the RES multiplier ratio", () => {
    const shredded = run([shredBuff()]);
    const basePyroRes = testEnemy.resistances.pyro ?? 0;
    const expectedRatio =
      resMultiplier(basePyroRes - 0.4) / resMultiplier(basePyroRes);
    expect(shredded.totalDamage / baseline.totalDamage).toBeCloseTo(
      expectedRatio,
      10,
    );
    expect(shredded.totalDamage).toBeGreaterThan(baseline.totalDamage);
  });

  it("DEF shred increases damage by exactly the DEF multiplier ratio", () => {
    const shredded = run([
      shredBuff({ enemyModifiers: [{ key: "defReduction", value: 0.4 }] }),
    ]);
    const expectedRatio =
      defMultiplier(testPyro.level, testEnemy.level, 0.4, 0) /
      defMultiplier(testPyro.level, testEnemy.level);
    expect(shredded.totalDamage / baseline.totalDamage).toBeCloseTo(
      expectedRatio,
      10,
    );
  });

  it("shred on a non-matching element does not change damage", () => {
    const other = run([
      shredBuff({
        enemyModifiers: [{ key: "resReduction", value: 0.4, element: "cryo" }],
      }),
    ]);
    expect(other.totalDamage).toBeCloseTo(baseline.totalDamage, 10);
  });

  it("a shred that has not started yet does not change damage", () => {
    const later = run([shredBuff({ startTime: 50 })]);
    expect(later.totalDamage).toBeCloseTo(baseline.totalDamage, 10);
  });

  it("never mutates the enemy passed in", () => {
    const enemy: EnemyState = structuredClone(testEnemy);
    const before = structuredClone(enemy);
    simulateRotation([testPyro], rotation, enemy, {
      enemyModifierResolver: makeEnemyModifierResolver({ buffs: [shredBuff()] }),
    });
    expect(enemy).toEqual(before);
  });

  it("is deterministic across repeated runs", () => {
    const buffs = [shredBuff()];
    expect(run(buffs).totalDamage).toBe(run(buffs).totalDamage);
  });
});

describe("makeResolvers — both seams from one buff list", () => {
  const rotation = [
    {
      characterId: testPyro.id,
      actionType: "skill" as const,
      abilityId: testPyro.elementalSkill.id,
    },
  ];

  it("applies stat bonuses and shred together from a single buff", () => {
    // One data object carrying BOTH sides.
    const combined: Buff = {
      id: "combined",
      source: "test",
      startTime: 0,
      duration: 10,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      modifiers: [{ stat: "dmgBonus", value: 0.5 }],
      enemyModifiers: [{ key: "resReduction", value: 0.4, element: "pyro" }],
    };

    const baseline = simulateRotation([testPyro], rotation, testEnemy);
    const both = simulateRotation([testPyro], rotation, testEnemy, {
      ...makeResolvers({ buffs: [combined] }),
    });

    const basePyroRes = testEnemy.resistances.pyro ?? 0;
    const resRatio =
      resMultiplier(basePyroRes - 0.4) / resMultiplier(basePyroRes);
    // dmgBonus 0 -> 0.5 on top of the character's pyro bonus; the DMG% factor
    // is (1 + dmgBonus + elemental), so the ratio is computable exactly.
    const elemental = testPyro.baseStats.elementalDmgBonus.pyro ?? 0;
    const dmgRatio = (1 + 0.5 + elemental) / (1 + elemental);

    expect(both.totalDamage / baseline.totalDamage).toBeCloseTo(
      resRatio * dmgRatio,
      10,
    );
  });

  it("keeps the two seams independently gated by the same conditions", () => {
    const burstOnly: Buff = {
      id: "burst-only",
      source: "test",
      startTime: 0,
      duration: 10,
      stacking: { mode: "refresh" },
      targets: { scope: "party" },
      conditions: { damageTypes: ["burst"] },
      modifiers: [{ stat: "dmgBonus", value: 0.5 }],
      enemyModifiers: [{ key: "resReduction", value: 0.4, element: "pyro" }],
    };

    const baseline = simulateRotation([testPyro], rotation, testEnemy);
    const gated = simulateRotation([testPyro], rotation, testEnemy, {
      ...makeResolvers({ buffs: [burstOnly] }),
    });
    // Rotation casts a skill, so neither side may apply.
    expect(gated.totalDamage).toBeCloseTo(baseline.totalDamage, 10);
  });

  it("the stat resolver still works when buffs carry only enemy modifiers", () => {
    const resolver = makeBuffResolver({ buffs: [shredBuff()] });
    const base = testPyro.baseStats;
    const out = resolver(base, makeContext());
    expect(out).toEqual(base);
    expect(out).not.toBe(base);
  });
});
