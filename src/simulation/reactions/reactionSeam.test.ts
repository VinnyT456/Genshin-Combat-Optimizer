import { describe, expect, it } from "vitest";
import type {
  AuraSnapshot,
  Element,
  EnemyState,
  Rotation,
} from "@/types";
import {
  auraFor,
  resolveReactions,
  restoreEnemyAuras,
  snapshotEnemyAuras,
  type EnemyAuraStore,
} from "@/simulation/engine/reactionSeam";
import { toReactionModifiers } from "@/simulation/reactions/resolver";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { evaluateIcd } from "@/simulation/reactions/icd";
import {
  STANDARD_ICD,
  type IcdBehaviour,
  type IcdCounter,
} from "@/simulation/reactions/types";
import { createAura, gaugeAt } from "@/simulation/reactions/aura";
import { NEUTRAL_ENEMY, NO_CRIT_CONFIG } from "@/tests/helpers/fixtures";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { flatTalent } from "@/simulation/character/talent";
import type { GaugeUnits } from "@/simulation/character/scaling";

// ============================================================================
// TASK #036 — Reaction Seam, Aura Tracking, and ICD Resume Verification.
//
// Proves end-to-end and at seam boundary:
//  1. applyElement() is gated on appliesElement: true and gauge > 0.
//  2. Reaction damage (amplifying, additive, transformative) is computed and
//     emitted as CombatEvents.
//  3. Aura state is tracked across casts, decays with time, and survives
//     snapshot serialization / restoration.
//  4. ICD is tracked per character/group and survives snapshot resumption.
// ============================================================================

function makeGenericChar(
  id: string,
  element: Element,
  options: { gauge?: GaugeUnits; icd?: IcdBehaviour; multiplier?: number } = {},
): GenericCharacterDefinition {
  const gauge = options.gauge ?? 1;
  const icd = options.icd ?? { mode: "none" };
  const multiplier = options.multiplier ?? 1.0;

  const naAbility: KitAbility = {
    id: `${id}-na`,
    name: `${id} Normal`,
    slot: "normal",
    castTime: 0.5,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [
      {
        id: `${id}-na-hit`,
        name: `${id} Normal Hit`,
        damageType: "normal",
        element,
        scaling: [{ stat: "atk", table: flatTalent(multiplier) }],
        application: gauge > 0 ? { element, gauge } : undefined,
        icd,
      },
    ],
  };

  const skillAbility: KitAbility = {
    id: `${id}-e`,
    name: `${id} Skill`,
    slot: "skill",
    castTime: 0.5,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [
      {
        id: `${id}-e-hit`,
        name: `${id} Skill Hit`,
        damageType: "skill",
        element,
        scaling: [{ stat: "atk", table: flatTalent(multiplier) }],
        application: gauge > 0 ? { element, gauge } : undefined,
        icd,
      },
    ],
  };

  return {
    id,
    name: id,
    element,
    weaponType: "catalyst",
    rarity: 5,
    level: 90,
    ascensionPhase: 6,
    constellationLevel: 0,
    talentLevels: { normal: 1, skill: 1, burst: 1 },
    baseStatCurves: {
      hp: { byLevel: { 90: 10000 } },
      atk: { byLevel: { 90: 1000 } },
      def: { byLevel: { 90: 800 } },
    },
    ascensionBonus: { stat: "atkPercent", valueByPhase: [0] },
    baseStats: {
      atk: 1000,
      hp: 10000,
      def: 800,
      elementalMastery: 0,
      critRate: 0,
      critDmg: 0,
      energyRecharge: 1,
      dmgBonus: 0,
      elementalDmgBonus: {},
    },
    maxEnergy: 60,
    normalAttacks: { hits: [naAbility], loops: true },
    chargedAttack: naAbility,
    skill: skillAbility,
    burst: skillAbility,
    passives: [],
    constellations: [],
    resources: [],
  };
}

describe("Requirement 1: applyElement() gating and invocation", () => {
  const enemy: EnemyState = {
    id: "test-target",
    name: "Test Target",
    level: 90,
    resistances: { pyro: 0.1, hydro: 0.1 },
  };

  it("calls applyElement when appliesElement is true and gauge > 0", () => {
    const store: EnemyAuraStore = {};
    resolveReactions({
      store,
      enemy,
      element: "pyro",
      gauge: 1.0,
      appliesElement: true,
      time: 1.0,
      stats: { level: 90, elementalMastery: 0 },
    });

    // Pyro aura applied (1U * 0.8 tax = 0.8U)
    const targetAura = auraFor(store, enemy.id);
    expect(targetAura.auras).toHaveLength(1);
    expect(targetAura.auras[0]!.element).toBe("pyro");
    expect(targetAura.auras[0]!.gauge).toBeCloseTo(0.8);
    expect(targetAura.auras[0]!.since).toBe(1.0);
  });

  it("does NOT apply element when appliesElement is false (ICD suppressed)", () => {
    const store: EnemyAuraStore = {};
    const mod = resolveReactions({
      store,
      enemy,
      element: "pyro",
      gauge: 1.0,
      appliesElement: false, // ICD gated
      time: 1.0,
      stats: { level: 90, elementalMastery: 0 },
    });

    expect(mod.amplifyingMultiplier).toBe(1.0);
    expect(mod.additiveBaseDamageBonus).toBe(0);
    expect(mod.transformative).toEqual([]);
    expect(auraFor(store, enemy.id).auras).toHaveLength(0);
  });

  it("does NOT apply element when gauge is undefined (un-authored ability)", () => {
    const store: EnemyAuraStore = {};
    const mod = resolveReactions({
      store,
      enemy,
      element: "pyro",
      gauge: undefined,
      appliesElement: true,
      time: 1.0,
      stats: { level: 90, elementalMastery: 0 },
    });

    expect(mod.amplifyingMultiplier).toBe(1.0);
    expect(auraFor(store, enemy.id).auras).toHaveLength(0);
  });

  it("does NOT apply element when gauge is 0 (0U non-applying hit)", () => {
    const store: EnemyAuraStore = {};
    const mod = resolveReactions({
      store,
      enemy,
      element: "pyro",
      gauge: 0,
      appliesElement: true,
      time: 1.0,
      stats: { level: 90, elementalMastery: 0 },
    });

    expect(mod.amplifyingMultiplier).toBe(1.0);
    expect(auraFor(store, enemy.id).auras).toHaveLength(0);
  });
});

describe("Requirement 2: Reaction damage computation and event emission", () => {
  const enemy: EnemyState = {
    id: "target",
    name: "Target",
    level: 90,
    resistances: { pyro: 0.1, hydro: 0.1, electro: 0.1, cryo: 0.1, dendro: 0.1 },
  };

  describe("amplifying multipliers (Vaporize / Melt)", () => {
    it("computes Forward Vaporize (Hydro on Pyro) with 2.0x base multiplier", () => {
      const store: EnemyAuraStore = {
        [enemy.id]: {
          auras: [createAura("pyro", 1.6, 0)],
          compound: [],
        },
      };

      const mod = resolveReactions({
        store,
        enemy,
        element: "hydro",
        gauge: 1.0,
        appliesElement: true,
        time: 1.0,
        stats: { level: 90, elementalMastery: 0 },
      });

      expect(mod.amplifyingMultiplier).toBeCloseTo(2.0);
    });

    it("computes Reverse Vaporize (Pyro on Hydro) with 1.5x base multiplier", () => {
      const store: EnemyAuraStore = {
        [enemy.id]: {
          auras: [createAura("hydro", 1.6, 0)],
          compound: [],
        },
      };

      const mod = resolveReactions({
        store,
        enemy,
        element: "pyro",
        gauge: 1.0,
        appliesElement: true,
        time: 1.0,
        stats: { level: 90, elementalMastery: 0 },
      });

      expect(mod.amplifyingMultiplier).toBeCloseTo(1.5);
    });

    it("increases amplifying multiplier with Elemental Mastery", () => {
      const store: EnemyAuraStore = {
        [enemy.id]: {
          auras: [createAura("pyro", 1.6, 0)],
          compound: [],
        },
      };

      const mod = resolveReactions({
        store,
        enemy,
        element: "hydro",
        gauge: 1.0,
        appliesElement: true,
        time: 1.0,
        stats: { level: 90, elementalMastery: 200 },
      });

      // 2.0 * (1 + 2.78 * 200 / (200 + 1400))
      expect(mod.amplifyingMultiplier).toBeGreaterThan(2.0);
      expect(mod.amplifyingMultiplier).toBeCloseTo(2.0 * (1 + (2.78 * 200) / (200 + 1400)));
    });

    it("scales finalDamage in simulateRotation when Vaporize triggers", () => {
      const pyroChar = makeGenericChar("pyro-char", "pyro", { gauge: 1 });
      const hydroChar = makeGenericChar("hydro-char", "hydro", { gauge: 1 });

      const rotation: Rotation = [
        { characterId: "pyro-char", actionType: "skill", abilityId: "pyro-char-e" },
        { characterId: "hydro-char", actionType: "swap" },
        { characterId: "hydro-char", actionType: "skill", abilityId: "hydro-char-e" },
      ];

      const res = simulateRotation(
        [pyroChar, hydroChar],
        rotation,
        NEUTRAL_ENEMY,
        NO_CRIT_CONFIG,
      );

      const hydroHit = res.timeline.find(
        (e) => e.damage?.sourceCharacterId === "hydro-char",
      );
      expect(hydroHit).toBeDefined();
      // Hydro onto Pyro: forward vaporize 2.0x -> rawDamage * defMult * resMult * 2.0
      // Character level 90, enemy level 0: defMult = (90 + 100) / (90 + 100 + 0 + 100) = 190 / 290
      expect(hydroHit!.damage!.finalDamage).toBeCloseTo(
        hydroHit!.damage!.rawDamage * (190 / 290) * 2.0,
      );
    });
  });

  describe("additive reactions (Aggravate / Spread)", () => {
    it("computes Aggravate flat bonus via toReactionModifiers", () => {
      const mod = toReactionModifiers(
        [
          {
            kind: "aggravate",
            category: "additive",
            triggerElement: "electro",
            auraElement: "dendro",
            gaugeConsumed: 0,
          },
        ],
        { level: 90, elementalMastery: 100 },
        () => 1.0,
      );

      expect(mod.additiveBaseDamageBonus).toBeGreaterThan(0);
      expect(mod.amplifyingMultiplier).toBe(1.0);
    });

    it("computes Spread flat bonus via toReactionModifiers", () => {
      const mod = toReactionModifiers(
        [
          {
            kind: "spread",
            category: "additive",
            triggerElement: "dendro",
            auraElement: "electro",
            gaugeConsumed: 0,
          },
        ],
        { level: 90, elementalMastery: 100 },
        () => 1.0,
      );

      expect(mod.additiveBaseDamageBonus).toBeGreaterThan(0);
      expect(mod.amplifyingMultiplier).toBe(1.0);
    });
  });

  describe("transformative reactions and CombatEvent emission", () => {
    it("computes Overloaded and emits separate damage instance", () => {
      const store: EnemyAuraStore = {
        [enemy.id]: {
          auras: [createAura("pyro", 1.0, 0)],
          compound: [],
        },
      };

      const mod = resolveReactions({
        store,
        enemy,
        element: "electro",
        gauge: 1.0,
        appliesElement: true,
        time: 1.0,
        stats: { level: 90, elementalMastery: 100 },
      });

      expect(mod.transformative).toHaveLength(1);
      const overload = mod.transformative[0]!;
      expect(overload.kind).toBe("overloaded");
      expect(overload.resElement).toBe("pyro");
      expect(overload.damage).toBeGreaterThan(0);
    });

    it("emits transformative CombatEvent with damageType: reaction in simulateRotation", () => {
      const pyroChar = makeGenericChar("pyro-c", "pyro", { gauge: 1 });
      const electroChar = makeGenericChar("electro-c", "electro", { gauge: 1 });

      const rotation: Rotation = [
        { characterId: "pyro-c", actionType: "skill", abilityId: "pyro-c-e" },
        { characterId: "electro-c", actionType: "swap" },
        { characterId: "electro-c", actionType: "skill", abilityId: "electro-c-e" },
      ];

      const res = simulateRotation(
        [pyroChar, electroChar],
        rotation,
        NEUTRAL_ENEMY,
        NO_CRIT_CONFIG,
      );

      const reactionEvents = res.timeline.filter(
        (e) => e.damage?.damageType === "reaction",
      );
      expect(reactionEvents.length).toBeGreaterThan(0);
      const overloadEvent = reactionEvents[0]!;
      expect(overloadEvent.description).toContain("overloaded");
      expect(overloadEvent.damage!.finalDamage).toBeGreaterThan(0);
      expect(overloadEvent.damage!.abilityId).toContain("overloaded");
    });
  });
});

describe("Requirement 3: Aura tracking, time decay, snapshot and resume", () => {
  const enemy: EnemyState = {
    id: "boss",
    name: "Boss",
    level: 90,
    resistances: { pyro: 0.1, hydro: 0.1 },
  };

  it("tracks aura across multiple casts and decays gauge over time", () => {
    const store: EnemyAuraStore = {};

    // Cast 1: Apply 2U Pyro at t=1.0
    resolveReactions({
      store,
      enemy,
      element: "pyro",
      gauge: 2.0,
      appliesElement: true,
      time: 1.0,
      stats: { level: 90, elementalMastery: 0 },
    });

    const auraT1 = store[enemy.id]!.auras[0]!;
    expect(auraT1.element).toBe("pyro");
    expect(auraT1.since).toBe(1.0);
    // 2U * 0.8 = 1.6U initial gauge
    expect(auraT1.gauge).toBeCloseTo(1.6);

    // Gauge at t=5.0 has decayed
    const decayedGauge = gaugeAt(auraT1, 5.0);
    expect(decayedGauge).toBeLessThan(1.6);
    expect(decayedGauge).toBeGreaterThan(0);
  });

  it("serializes aura store to Snapshot and restores identically", () => {
    const store: EnemyAuraStore = {
      [enemy.id]: {
        auras: [createAura("pyro", 1.2, 2.0)],
        compound: [{ kind: "frozen", gauge: 0.8, since: 2.0, decayRate: 10 }],
      },
      minion: {
        auras: [createAura("electro", 0.5, 3.0)],
        compound: [],
      },
    };

    // Serialize
    const snap = snapshotEnemyAuras(store);
    expect(snap).toBeDefined();

    // Round-trip through JSON
    const serialized = JSON.parse(JSON.stringify(snap)) as Record<string, AuraSnapshot>;

    // Restore
    const restored = restoreEnemyAuras(serialized);
    expect(restored[enemy.id]!.auras).toHaveLength(1);
    expect(restored[enemy.id]!.auras[0]!.element).toBe("pyro");
    expect(restored[enemy.id]!.auras[0]!.gauge).toBe(0.96);
    expect(restored[enemy.id]!.auras[0]!.since).toBe(2.0);
    expect(restored[enemy.id]!.compound).toHaveLength(1);
    expect(restored[enemy.id]!.compound[0]!.kind).toBe("frozen");

    expect(restored["minion"]!.auras[0]!.element).toBe("electro");
  });

  it("proves reaction on restored aura produces identical results to continuous timeline", () => {
    // Unbroken run: Pyro 2U at t=0, Hydro 0.5U at t=3.0 (partial consumption leaves remaining aura)
    const unbrokenStore: EnemyAuraStore = {};
    resolveReactions({
      store: unbrokenStore,
      enemy,
      element: "pyro",
      gauge: 2.0,
      appliesElement: true,
      time: 0,
      stats: { level: 90, elementalMastery: 50 },
    });
    const unbrokenReaction = resolveReactions({
      store: unbrokenStore,
      enemy,
      element: "hydro",
      gauge: 0.5,
      appliesElement: true,
      time: 3.0,
      stats: { level: 90, elementalMastery: 50 },
    });

    // Interrupted run: Pyro 2U at t=0 -> Snapshot -> Restore -> Hydro 0.5U at t=3.0
    const interruptedStore: EnemyAuraStore = {};
    resolveReactions({
      store: interruptedStore,
      enemy,
      element: "pyro",
      gauge: 2.0,
      appliesElement: true,
      time: 0,
      stats: { level: 90, elementalMastery: 50 },
    });

    // Checkpoint at t=1.5
    const snapshotAuras = snapshotEnemyAuras(interruptedStore);
    const roundTripped = JSON.parse(JSON.stringify(snapshotAuras));
    const restoredStore = restoreEnemyAuras(roundTripped);

    // Continue at t=3.0 on restored store
    const resumedReaction = resolveReactions({
      store: restoredStore,
      enemy,
      element: "hydro",
      gauge: 0.5,
      appliesElement: true,
      time: 3.0,
      stats: { level: 90, elementalMastery: 50 },
    });

    expect(resumedReaction.amplifyingMultiplier).toBeCloseTo(
      unbrokenReaction.amplifyingMultiplier,
    );
    expect(restoredStore[enemy.id]!.auras[0]?.gauge).toBeCloseTo(
      unbrokenStore[enemy.id]!.auras[0]!.gauge,
    );
  });
});

describe("Requirement 4: ICD tracking per character/group and snapshot resume", () => {
  it("tracks standard 2.5s / 3-hit ICD sequence", () => {
    let counter = undefined;

    // Hit 1 at t=0.0 -> applies
    const d1 = evaluateIcd(STANDARD_ICD, counter, 0.0);
    expect(d1.applies).toBe(true);
    counter = d1.counter;

    // Hit 2 at t=0.5 -> suppressed
    const d2 = evaluateIcd(STANDARD_ICD, counter, 0.5);
    expect(d2.applies).toBe(false);
    counter = d2.counter;

    // Hit 3 at t=1.0 -> suppressed
    const d3 = evaluateIcd(STANDARD_ICD, counter, 1.0);
    expect(d3.applies).toBe(false);
    counter = d3.counter;

    // Hit 4 at t=1.5 -> applies (every 3rd hit in window)
    const d4 = evaluateIcd(STANDARD_ICD, counter, 1.5);
    expect(d4.applies).toBe(true);
    counter = d4.counter;

    // Hit 5 at t=3.0 -> applies (2.5s window expired)
    const d5 = evaluateIcd(STANDARD_ICD, counter, 3.0);
    expect(d5.applies).toBe(true);
  });

  it("preserves ICD counter across snapshot and prevents false application on resume", () => {
    // 2 hits in
    const d1 = evaluateIcd(STANDARD_ICD, undefined, 0.0);
    const d2 = evaluateIcd(STANDARD_ICD, d1.counter, 0.5);
    expect(d2.applies).toBe(false);

    // Snapshot at t=0.5
    const serializedIcd = JSON.parse(JSON.stringify(d2.counter));

    // Hit 3 at t=1.0 with carried counter -> MUST be suppressed
    const d3Resumed = evaluateIcd(STANDARD_ICD, serializedIcd, 1.0);
    expect(d3Resumed.applies).toBe(false);

    // Contrast with dropped counter -> would falsely apply (the bias we eliminate)
    const d3Dropped = evaluateIcd(STANDARD_ICD, undefined, 1.0);
    expect(d3Dropped.applies).toBe(true);
  });

  it("tracks custom ICD behaviour (e.g. mode: none)", () => {
    let counter = undefined;
    for (let i = 0; i < 5; i++) {
      const d = evaluateIcd({ mode: "none" }, counter, i * 0.2);
      expect(d.applies).toBe(true);
      counter = d.counter;
    }
  });

  it("tracks ICD separately per group within CharacterSnapshot.icd", () => {
    const charIcd: Record<string, IcdCounter | undefined> = {};

    // Group "normal" hit 1 at t=0.0 -> applies
    const n1 = evaluateIcd(STANDARD_ICD, charIcd["normal"], 0.0);
    charIcd["normal"] = n1.counter;
    expect(n1.applies).toBe(true);

    // Group "skill" hit 1 at t=0.1 -> applies (independent group from normal)
    const s1 = evaluateIcd(STANDARD_ICD, charIcd["skill"], 0.1);
    charIcd["skill"] = s1.counter;
    expect(s1.applies).toBe(true);

    // Group "normal" hit 2 at t=0.2 -> suppressed (same group as n1)
    const n2 = evaluateIcd(STANDARD_ICD, charIcd["normal"], 0.2);
    charIcd["normal"] = n2.counter;
    expect(n2.applies).toBe(false);

    // Snapshot
    const snapshotIcd = JSON.parse(JSON.stringify(charIcd));

    // Resumed: Group "normal" hit 3 at t=0.3 -> still suppressed
    const n3 = evaluateIcd(STANDARD_ICD, snapshotIcd["normal"], 0.3);
    expect(n3.applies).toBe(false);

    // Resumed: Group "skill" hit 2 at t=0.4 -> suppressed
    const s2 = evaluateIcd(STANDARD_ICD, snapshotIcd["skill"], 0.4);
    expect(s2.applies).toBe(false);
  });

  it("verifies simulateRotation populates enemyAuras and character ICD in finalState snapshot", () => {
    const pyroChar = makeGenericChar("pyro-snap", "pyro", {
      gauge: 1,
      icd: { mode: "standard" },
    });

    const res = simulateRotation(
      [pyroChar],
      [{ characterId: "pyro-snap", actionType: "skill", abilityId: "pyro-snap-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );

    // Snapshot has enemyAuras
    expect(res.finalState.enemyAuras).toBeDefined();
    const bossAuras = res.finalState.enemyAuras![NEUTRAL_ENEMY.id];
    expect(bossAuras).toBeDefined();
    expect(bossAuras!.auras.some((a) => a.element === "pyro")).toBe(true);

    // Snapshot has character ICD state
    const charSnap = res.finalState.characters["pyro-snap"];
    expect(charSnap).toBeDefined();
    expect(charSnap!.icd).toBeDefined();
  });
});

