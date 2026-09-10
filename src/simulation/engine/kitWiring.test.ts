import { describe, expect, it } from "vitest";
import type {
  BuffContext,
  BuffResolver,
  EnemyState,
  Rotation,
  Stats,
} from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { flatTalent, talentTable } from "@/simulation/character/talent";
import { simulateRotation } from "@/simulation/engine/simulateRotation";

// ============================================================================
// TASK #030 — the character framework wired into the engine.
//
// Everything here is SYNTHETIC. The repo's authored character data has no
// source citations yet (qa TASK #028), so pinning one of those multipliers
// would pin an unverified number as if it were verified. These fixtures are
// invented, and are named so no reader mistakes them for a real kit.
//
// What these tests are FOR: the wiring is deliberately fail-closed, which
// means a broken wiring looks exactly like "no reactions configured" — green
// everywhere. Each test below therefore asserts a value that is only
// reachable if the wiring actually executes.
// ============================================================================

const ENEMY: EnemyState = {
  id: "dummy",
  name: "Dummy",
  level: 90,
  // Zero RES everywhere keeps the expected values readable: the RES multiplier
  // is exactly 1, so it drops out of the hand-computed comparisons.
  resistances: {},
};

const BASE_STATS: Stats = {
  atk: 1000,
  hp: 20000,
  def: 500,
  elementalMastery: 0,
  critRate: 0,
  critDmg: 0,
  energyRecharge: 1,
  dmgBonus: 0,
  elementalDmgBonus: {},
};

/**
 * Three hits authored in a deliberately NON-chronological order: the second
 * authored instance lands LAST. Authoring order must survive, so a wiring that
 * re-sorts by `delay` is detectable.
 */
const THREE_HIT: KitAbility = {
  id: "wiring-multihit",
  name: "Wiring Multihit",
  slot: "skill",
  castTime: 1,
  cooldown: flatTalent(0),
  energyCost: 0,
  instances: [
    {
      id: "hit-a",
      name: "Hit A",
      damageType: "skill",
      element: "physical",
      scaling: [{ stat: "atk", table: flatTalent(1) }],
    },
    {
      id: "hit-b",
      name: "Hit B",
      damageType: "skill",
      element: "physical",
      scaling: [{ stat: "atk", table: flatTalent(2) }],
      delay: 0.5,
    },
    {
      id: "hit-c",
      name: "Hit C",
      damageType: "skill",
      element: "physical",
      scaling: [{ stat: "atk", table: flatTalent(3) }],
      delay: 0.25,
    },
  ],
};

/** Non-ATK scaling: HP and DEF and EM, plus a hybrid ATK+HP instance. */
const NON_ATK: KitAbility = {
  id: "wiring-nonatk",
  name: "Wiring NonATK",
  slot: "burst",
  castTime: 1,
  cooldown: flatTalent(0),
  energyCost: 0,
  instances: [
    {
      id: "hp-hit",
      name: "HP Hit",
      damageType: "burst",
      element: "physical",
      scaling: [{ stat: "hp", table: flatTalent(0.1) }],
    },
    {
      id: "def-hit",
      name: "DEF Hit",
      damageType: "burst",
      element: "physical",
      scaling: [{ stat: "def", table: flatTalent(2) }],
    },
    {
      id: "hybrid-hit",
      name: "Hybrid Hit",
      damageType: "burst",
      element: "physical",
      scaling: [
        { stat: "atk", table: flatTalent(1) },
        { stat: "hp", table: flatTalent(0.05) },
      ],
    },
  ],
};

/** Talent-level-dependent multipliers, to prove the level lookup is wired. */
const TALENT_SCALED: KitAbility = {
  id: "wiring-talent",
  name: "Wiring Talent",
  slot: "normal",
  castTime: 1,
  cooldown: flatTalent(0),
  energyCost: 0,
  instances: [
    {
      id: "talent-hit",
      name: "Talent Hit",
      damageType: "normal",
      element: "physical",
      // Level 1 -> 1.0, level 2 -> 5.0, level 3 -> 9.0. Deliberately far apart
      // so an off-by-one level lookup cannot be mistaken for rounding.
      scaling: [{ stat: "atk", table: talentTable([1, 5, 9]) }],
    },
  ],
};

function makeUnit(
  overrides: Partial<GenericCharacterDefinition> = {},
): GenericCharacterDefinition {
  return {
    id: "wiring-unit",
    name: "Wiring Test Unit",
    element: "pyro",
    weaponType: "catalyst",
    rarity: 5,
    level: 90,
    ascensionPhase: 6,
    constellationLevel: 0,
    talentLevels: { normal: 1, skill: 1, burst: 1 },
    baseStatCurves: {
      hp: { byLevel: { 90: BASE_STATS.hp } },
      atk: { byLevel: { 90: BASE_STATS.atk } },
      def: { byLevel: { 90: BASE_STATS.def } },
    },
    baseStats: BASE_STATS,
    maxEnergy: 40,
    resources: [],
    passives: [],
    constellations: [],
    // Zeroed so ascension never perturbs the hand-computed expectations.
    ascensionBonus: { stat: "critDmg", valueByPhase: [0, 0, 0, 0] },
    normalAttacks: { hits: [TALENT_SCALED], loops: true },
    skill: THREE_HIT,
    burst: NON_ATK,
    ...overrides,
  };
}

function damageEvents(
  result: ReturnType<typeof simulateRotation>,
): { abilityId: string; timestamp: number; raw: number; final: number }[] {
  return result.timeline
    .filter((e) => e.type === "damage" && e.damage)
    .map((e) => ({
      abilityId: e.damage!.abilityId,
      timestamp: e.damage!.timestamp,
      raw: e.damage!.rawDamage,
      final: e.damage!.finalDamage,
    }));
}

describe("multi-hit: one action emits N damage events", () => {
  const unit = makeUnit();
  const rotation: Rotation = [
    { characterId: unit.id, actionType: "skill", abilityId: THREE_HIT.id },
  ];

  it("emits exactly one event per authored instance", () => {
    const result = simulateRotation([unit], rotation, ENEMY);
    // Three instances in ONE cast. Before wiring this was one event.
    expect(damageEvents(result)).toHaveLength(3);
  });

  it("preserves AUTHORING order, not delay order, at equal timestamps", () => {
    const result = simulateRotation([unit], rotation, ENEMY);
    // Hit B (delay 0.5) is authored second but lands last. The timeline sort
    // is by timestamp, so chronological order is A(0), C(0.25), B(0.5) — the
    // raw values prove WHICH instance each event came from.
    expect(damageEvents(result).map((e) => e.raw)).toEqual([
      1000, // Hit A: 1.0 * 1000 ATK
      3000, // Hit C: 3.0 * 1000 ATK
      2000, // Hit B: 2.0 * 1000 ATK
    ]);
  });

  it("gives each instance its own absolute timestamp from the cast start", () => {
    const result = simulateRotation([unit], rotation, ENEMY);
    expect(damageEvents(result).map((e) => e.timestamp)).toEqual([0, 0.25, 0.5]);
  });

  it("attaches the cast duration to exactly one event", () => {
    const result = simulateRotation([unit], rotation, ENEMY);
    const durations = result.timeline
      .filter((e) => e.type === "damage")
      .map((e) => e.duration);
    // Only the first hit carries it: N hits must not multiply the cast time.
    expect(durations.filter((d) => d !== undefined)).toEqual([1]);
  });
});

describe("authoring order is preserved when delays are EQUAL", () => {
  it("emits simultaneous hits in the order they were authored", () => {
    const simultaneous: KitAbility = {
      ...THREE_HIT,
      id: "wiring-simultaneous",
      instances: THREE_HIT.instances.map((i) => ({ ...i, delay: 0 })),
    };
    const unit = makeUnit({ skill: simultaneous });
    const result = simulateRotation(
      [unit],
      [{ characterId: unit.id, actionType: "skill", abilityId: simultaneous.id }],
      ENEMY,
    );
    // All three at t=0, so ONLY authoring order can distinguish them. A sort
    // that is not stable, or that re-orders by delay, changes this.
    expect(damageEvents(result).map((e) => e.raw)).toEqual([1000, 2000, 3000]);
  });
});

describe("authoring order is what ICD consumes", () => {
  /**
   * The sharpest consequence of authoring order. Two hits SHARE an ICD group,
   * so under the standard rule the FIRST one walked applies its element and
   * the second is suppressed. The hits carry different gauges, so which one
   * applied is readable off the resulting aura.
   *
   * `planAbility` walks `instances` in authoring order and does NOT re-sort by
   * `delay`. Here the authored-first hit has the LATER delay, so a wiring that
   * re-sorts would hand the application to the other hit and store a different
   * gauge — which this test reads back.
   */
  const gaugeHit = (
    id: string,
    delay: number,
    gauge: 1 | 2 | 4,
  ): KitAbility["instances"][number] => ({
    id,
    name: id,
    damageType: "skill",
    element: "pyro",
    scaling: [{ stat: "atk", table: flatTalent(1) }],
    delay,
    application: { element: "pyro", gauge, icdGroup: "shared" },
  });

  /**
   * Three hits on one shared ICD group, authored with DESCENDING delays so
   * that authoring order and delay order are exact reverses.
   *
   * ICD is evaluated in WALK order against a clock that moves with each hit,
   * so the two orders give measurably different numbers of applications:
   *
   *   authoring order (correct): times 0.4, 0.2, 0 — each hit's time is
   *     BEFORE the stored window start, which the ICD rule treats as a fresh
   *     window ("a counter from the future carries no information"). All 3
   *     apply.
   *   delay order     (mutant) : times 0, 0.2, 0.4 — one monotonic window, so
   *     the standard 3-hit rule suppresses hits 2 and 3. Only 1 applies.
   *
   * 3 vs 1 elemental applications is the signature this pins.
   */
  const SHARED_ICD: KitAbility = {
    id: "wiring-icd-order",
    name: "Wiring ICD Order",
    slot: "skill",
    castTime: 1,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [
      gaugeHit("first", 0.4, 2),
      gaugeHit("second", 0.2, 4),
      gaugeHit("third", 0, 1),
    ],
  };

  it("suppresses by AUTHORING position, not by delay position", () => {
    const unit = makeUnit({ skill: SHARED_ICD });
    const result = simulateRotation(
      [unit],
      [{ characterId: unit.id, actionType: "skill", abilityId: SHARED_ICD.id }],
      ENEMY,
    );

    // All three hits ALWAYS deal damage; only the APPLICATION is gated, so hit
    // count alone cannot distinguish the two orders.
    expect(
      damageEvents(result).filter((e) => e.abilityId === SHARED_ICD.id),
    ).toHaveLength(3);

    const aura = result.finalState.enemyAuras?.[ENEMY.id]?.auras[0];
    expect(aura?.element).toBe("pyro");

    // Both orders leave the aura anchored at t=0, so `since` does NOT separate
    // them. The GAUGE does, because the orders differ in HOW MANY hits applied:
    //
    //   authoring order: times run 0.4, 0.2, 0 — each hit precedes the stored
    //     window start, which the ICD rule reads as a fresh window, so ALL
    //     THREE apply. The 4U hit lands, and `refreshAura` keeps the stronger
    //     gauge, leaving >1U.
    //   delay-sorted   : times run 0, 0.2, 0.4 — one monotonic window, so the
    //     standard 3-hit rule suppresses hits 2 and 3. ONLY the 1U hit applies,
    //     leaving <=1U (measured: 0.8 after decay).
    //
    // Verified by mutation: sorting `instances` by delay fails this with
    // "expected 0.8 to be greater than 1".
    expect(aura?.since).toBe(0);
    expect(aura?.gauge).toBeGreaterThan(1);
  });
});

describe("non-ATK scaling", () => {
  const unit = makeUnit();
  const rotation: Rotation = [
    { characterId: unit.id, actionType: "burst", abilityId: NON_ATK.id },
  ];

  it("scales off HP, DEF and hybrid terms, not ATK", () => {
    const result = simulateRotation([unit], rotation, ENEMY);
    expect(damageEvents(result).map((e) => e.raw)).toEqual([
      2000, // 0.1 * 20000 HP
      1000, // 2.0 * 500 DEF
      2000, // 1.0 * 1000 ATK + 0.05 * 20000 HP  (terms are SUMMED)
    ]);
  });

  it("an HP-scaling hit responds to an HP buff and ignores an ATK buff", () => {
    const hpBuff: BuffResolver = (base: Stats): Stats => ({
      ...base,
      hp: base.hp * 2,
      atk: base.atk * 100,
    });
    const result = simulateRotation([unit], rotation, ENEMY, {
      buffResolver: hpBuff,
    });
    const raws = damageEvents(result).map((e) => e.raw);
    // HP hit doubles; it must NOT move with the (huge) ATK buff.
    expect(raws[0]).toBe(4000);
    // Hybrid picks up BOTH, proving terms are independent, not one stat.
    expect(raws[2]).toBe(100000 + 2000);
  });
});

describe("talent level drives the multiplier", () => {
  it("reads the multiplier at the character's talent level", () => {
    const rotationFor = (unit: GenericCharacterDefinition): Rotation => [
      { characterId: unit.id, actionType: "normal", abilityId: TALENT_SCALED.id },
    ];
    const lvl1 = makeUnit({ talentLevels: { normal: 1, skill: 1, burst: 1 } });
    const lvl3 = makeUnit({ talentLevels: { normal: 3, skill: 1, burst: 1 } });

    const a = damageEvents(simulateRotation([lvl1], rotationFor(lvl1), ENEMY));
    const b = damageEvents(simulateRotation([lvl3], rotationFor(lvl3), ENEMY));

    expect(a[0]!.raw).toBe(1000); // 1.0 * 1000
    expect(b[0]!.raw).toBe(9000); // 9.0 * 1000 — level lookup, not a constant.
  });
});

describe("BuffContext.snapshot is built ONCE PER CAST", () => {
  /**
   * The performance contract from the optimizer: rebuilding the snapshot per
   * INSTANCE multiplies its search budget by mean-instances-per-action.
   *
   * Asserted by IDENTITY, not by a counter: every instance of one cast must
   * receive the very same object reference. A per-instance rebuild would
   * produce equal-but-distinct objects, which `toBe` catches and `toEqual`
   * would not.
   */
  it("hands every instance of a cast the identical snapshot object", () => {
    const seen: unknown[] = [];
    const spy: BuffResolver = (base: Stats, ctx: BuffContext): Stats => {
      seen.push(ctx.snapshot);
      return base;
    };
    const unit = makeUnit();
    simulateRotation(
      [unit],
      [{ characterId: unit.id, actionType: "skill", abilityId: THREE_HIT.id }],
      ENEMY,
      { buffResolver: spy },
    );

    expect(seen).toHaveLength(3); // one resolve per instance
    const distinct = new Set(seen);
    expect(distinct.size).toBe(1); // ...but ONE snapshot object
  });

  it("uses a DIFFERENT snapshot for a different cast", () => {
    const seen: unknown[] = [];
    const spy: BuffResolver = (base: Stats, ctx: BuffContext): Stats => {
      seen.push(ctx.snapshot);
      return base;
    };
    const unit = makeUnit();
    simulateRotation(
      [unit],
      [
        { characterId: unit.id, actionType: "skill", abilityId: THREE_HIT.id },
        { characterId: unit.id, actionType: "burst", abilityId: NON_ATK.id },
      ],
      ENEMY,
      { buffResolver: spy },
    );

    // 3 instances + 3 instances, but exactly 2 snapshots. This is the other
    // half of the contract: once per cast, not once per RUN (which would make
    // the snapshot stale and silently wrong).
    expect(seen).toHaveLength(6);
    expect(new Set(seen).size).toBe(2);
  });
});

describe("determinism", () => {
  it("produces a byte-identical result for identical inputs", () => {
    const unit = makeUnit();
    const rotation: Rotation = [
      { characterId: unit.id, actionType: "skill", abilityId: THREE_HIT.id },
      { characterId: unit.id, actionType: "burst", abilityId: NON_ATK.id },
      { characterId: unit.id, actionType: "normal", abilityId: TALENT_SCALED.id },
    ];
    const a = simulateRotation([unit], rotation, ENEMY);
    const b = simulateRotation([unit], rotation, ENEMY);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("does not leak state between runs via the aura store", () => {
    // Two runs of an APPLYING ability must be identical. If the enemy aura
    // store were shared across runs (e.g. module-level), the second run would
    // start with an aura already on the target and could react.
    const unit = makeUnit({ skill: APPLYING });
    const rotation: Rotation = [
      { characterId: unit.id, actionType: "skill", abilityId: APPLYING.id },
    ];
    const a = simulateRotation([unit], rotation, ENEMY);
    const b = simulateRotation([unit], rotation, ENEMY);
    expect(JSON.stringify(a.finalState.enemyAuras)).toBe(
      JSON.stringify(b.finalState.enemyAuras),
    );
    expect(a.totalDamage).toBe(b.totalDamage);
  });
});

/** A pyro ability that DOES author an elemental application. */
const APPLYING: KitAbility = {
  id: "wiring-applying",
  name: "Wiring Applying",
  slot: "skill",
  castTime: 1,
  cooldown: flatTalent(0),
  energyCost: 0,
  instances: [
    {
      id: "applying-hit",
      name: "Applying Hit",
      damageType: "skill",
      element: "pyro",
      scaling: [{ stat: "atk", table: flatTalent(1) }],
      application: { element: "pyro", gauge: 1 },
    },
  ],
};

/** Same shape, hydro, so the pair can react. */
const APPLYING_HYDRO: KitAbility = {
  ...APPLYING,
  id: "wiring-applying-hydro",
  name: "Wiring Applying Hydro",
  instances: [
    {
      ...APPLYING.instances[0]!,
      id: "applying-hydro-hit",
      element: "hydro",
      application: { element: "hydro", gauge: 1 },
    },
  ],
};

describe("elemental application feeds the reactions layer", () => {
  it("records an aura on the enemy after an applying hit", () => {
    const unit = makeUnit({ skill: APPLYING });
    const result = simulateRotation(
      [unit],
      [{ characterId: unit.id, actionType: "skill", abilityId: APPLYING.id }],
      ENEMY,
    );
    const auras = result.finalState.enemyAuras?.[ENEMY.id]?.auras ?? [];
    expect(auras.map((a) => a.element)).toEqual(["pyro"]);
  });

  it("FAILS CLOSED: an ability with no `application` leaves no aura", () => {
    // THREE_HIT authors no application. Un-authored must mean 0U, never 1U —
    // otherwise unauthored data silently fabricates reaction damage.
    const unit = makeUnit();
    const result = simulateRotation(
      [unit],
      [{ characterId: unit.id, actionType: "skill", abilityId: THREE_HIT.id }],
      ENEMY,
    );
    expect(result.finalState.enemyAuras).toBeUndefined();
  });

  it("amplifies the trigger's damage when a reaction occurs", () => {
    // Hydro aura first, then a Pyro trigger => forward vaporize (x1.5 at 0 EM).
    const hydroUnit = makeUnit({
      id: "wiring-hydro",
      name: "Wiring Hydro Unit",
      element: "hydro",
      skill: APPLYING_HYDRO,
    });
    const pyroUnit = makeUnit({ skill: APPLYING });

    const withReaction = simulateRotation(
      [hydroUnit, pyroUnit],
      [
        {
          characterId: hydroUnit.id,
          actionType: "skill",
          abilityId: APPLYING_HYDRO.id,
        },
        { characterId: pyroUnit.id, actionType: "skill", abilityId: APPLYING.id },
      ],
      ENEMY,
    );

    const pyroHit = damageEvents(withReaction).find(
      (e) => e.abilityId === APPLYING.id,
    );
    const baseline = damageEvents(
      simulateRotation(
        [pyroUnit],
        [{ characterId: pyroUnit.id, actionType: "skill", abilityId: APPLYING.id }],
        ENEMY,
      ),
    )[0]!;

    // Same base, but multiplied by the vaporize term. The ratio is what is
    // asserted, so this does not pin the reaction coefficient itself (that is
    // mechanics' to own and test).
    expect(pyroHit!.raw).toBe(baseline.raw);
    expect(pyroHit!.final).toBeGreaterThan(baseline.final);
    expect(pyroHit!.final / baseline.final).toBeCloseTo(1.5, 10);
  });
});
