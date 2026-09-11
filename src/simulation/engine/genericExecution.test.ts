import { describe, expect, it } from "vitest";
import type {
  CharacterDefinition,
  CharacterState,
  EnemyState,
  Rotation,
} from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { validateAction } from "@/simulation/engine/validateAction";
import {
  syntheticBurst,
  syntheticN1,
  syntheticUnit,
} from "@/simulation/character/fixtures";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import { flatTalent, talentValueAt } from "@/simulation/character/talent";
import type { StanceDefinition } from "@/simulation/buffs/types";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import { findCharacter } from "@/game-data/characters/registry";

const testEnemy: EnemyState = {
  id: "test-target",
  name: "Target Dummy",
  level: 90,
  resistances: {
    physical: 0.1,
    pyro: 0.1,
    hydro: 0.1,
    electro: 0.1,
    cryo: 0.1,
    anemo: 0.1,
    geo: 0.1,
    dendro: 0.1,
  },
};

/** Standalone legacy CharacterDefinition fixture for engine tests. */
const legacyUnit: CharacterDefinition = {
  id: "legacy-unit",
  name: "Legacy Unit",
  element: "pyro",
  level: 90,
  baseStats: {
    atk: 1000,
    hp: 12000,
    def: 700,
    elementalMastery: 0,
    critRate: 0.05,
    critDmg: 0.5,
    energyRecharge: 1,
    dmgBonus: 0,
    elementalDmgBonus: {},
  },
  maxEnergy: 60,
  normalAttack: {
    id: "legacy-na",
    name: "Legacy Normal",
    actionType: "normal",
    element: "physical",
    damageType: "normal",
    multiplier: 1.0,
    scaling: "atk",
    castTime: 0.5,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  chargedAttack: {
    id: "legacy-ca",
    name: "Legacy Charged",
    actionType: "charged",
    element: "physical",
    damageType: "charged",
    multiplier: 1.5,
    scaling: "atk",
    castTime: 0.6,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  },
  elementalSkill: {
    id: "legacy-skill",
    name: "Legacy Skill",
    actionType: "skill",
    element: "pyro",
    damageType: "skill",
    multiplier: 2.0,
    scaling: "atk",
    castTime: 0.8,
    cooldown: 6,
    energyCost: 0,
    energyGenerated: 0,
    particles: { count: 3, element: "pyro" },
  },
  elementalBurst: {
    id: "legacy-burst",
    name: "Legacy Burst",
    actionType: "burst",
    element: "pyro",
    damageType: "burst",
    multiplier: 4.0,
    scaling: "atk",
    castTime: 1.5,
    cooldown: 15,
    energyCost: 60,
    energyGenerated: 0,
  },
};

describe("Generic character execution in combat engine", () => {
  describe("1. Support for both generic and legacy character models", () => {
    it("simulates legacy CharacterDefinition seamlessly", () => {
      const rotation: Rotation = [
        { characterId: legacyUnit.id, actionType: "skill" },
        { characterId: legacyUnit.id, actionType: "normal" },
      ];
      const result = simulateRotation([legacyUnit], rotation, testEnemy);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.totalDamage).toBeGreaterThan(0);
      expect(result.timeline).toHaveLength(3); // skill dmg, particles, normal dmg
    });

    it("simulates GenericCharacterDefinition seamlessly", () => {
      const rotation: Rotation = [
        { characterId: syntheticUnit.id, actionType: "normal" },
      ];
      const result = simulateRotation([syntheticUnit], rotation, testEnemy);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.totalDamage).toBeGreaterThan(0);
      // syntheticN1 has 2 instances -> 2 damage events
      const dmgEvents = result.timeline.filter((e) => e.type === "damage");
      expect(dmgEvents).toHaveLength(2);
    });

    it("simulates mixed teams with swapping and particle sharing", () => {
      const rotation: Rotation = [
        { characterId: syntheticUnit.id, actionType: "skill" },
        { characterId: legacyUnit.id, actionType: "swap" },
        { characterId: legacyUnit.id, actionType: "normal" },
      ];
      const result = simulateRotation(
        [syntheticUnit, legacyUnit],
        rotation,
        testEnemy,
      );
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.damageByCharacter[syntheticUnit.id]).toBeGreaterThan(0);
      expect(result.damageByCharacter[legacyUnit.id]).toBeGreaterThan(0);
      // Energy distribution: syntheticUnit skill emits hydro particles
      const energyEvents = result.timeline.filter((e) => e.type === "energy");
      expect(energyEvents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("2. Multi-hit ability planning & execution", () => {
    it("emits distinct damage events at delay offsets while advancing clock by castTime", () => {
      // syntheticN1 has 2 instances: hit1 at 0s, hit2 at 0.2s. castTime = 0.5s
      const rotation: Rotation = [
        { characterId: syntheticUnit.id, actionType: "normal" },
        { characterId: syntheticUnit.id, actionType: "normal" },
      ];
      const result = simulateRotation([syntheticUnit], rotation, testEnemy);
      const dmg = result.timeline.filter((e) => e.type === "damage");
      expect(dmg).toHaveLength(4);

      // First N1: cast starts at 0.0s
      expect(dmg[0]!.timestamp).toBeCloseTo(0.0);
      expect(dmg[0]!.duration).toBeCloseTo(0.5); // Primary hit carries duration
      expect(dmg[1]!.timestamp).toBeCloseTo(0.2); // Delayed hit at 0.2s
      expect(dmg[1]!.duration).toBeUndefined(); // Subsequent hit has no duration

      // Second N1: cast starts at 0.5s (after first N1 castTime)
      expect(dmg[2]!.timestamp).toBeCloseTo(0.5);
      expect(dmg[2]!.duration).toBeCloseTo(0.5);
      expect(dmg[3]!.timestamp).toBeCloseTo(0.7); // 0.5 + 0.2
      expect(dmg[3]!.duration).toBeUndefined();

      expect(result.duration).toBeCloseTo(1.0);
    });

    it("evaluates hybrid scaling terms (ATK + HP) via scaledBase", () => {
      // syntheticSkill scales with ATK (table [1.0, 1.1, 1.2], talent lvl 2 => 1.1)
      // and HP (0.05 * 10000 = 500)
      // Base ATK = 800 => 800 * 1.1 = 880
      // Raw damage = 880 + 500 = 1380
      const rotation: Rotation = [
        { characterId: syntheticUnit.id, actionType: "skill" },
      ];
      const result = simulateRotation([syntheticUnit], rotation, testEnemy);
      const skillHit = result.timeline.find(
        (e) => e.type === "damage" && e.damage?.abilityId === "synthetic-skill",
      );
      expect(skillHit).toBeDefined();
      expect(skillHit!.damage!.rawDamage).toBeCloseTo(1380);
    });
  });

  describe("3. Weapon infusions", () => {
    it("converts physical normal attacks to infused element", () => {
      const infusedSkill: KitAbility = {
        id: "infuse-skill",
        name: "Infusion Skill",
        slot: "skill",
        castTime: 0.5,
        cooldown: flatTalent(10),
        energyCost: 0,
        instances: [],
        infusion: {
          id: "pyro-weapon-infusion",
          element: "pyro",
          durationSeconds: 5,
          canBeOverridden: false,
        },
      };

      const infusedUnit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "infused-unit",
        skill: infusedSkill,
      };

      const rotation: Rotation = [
        { characterId: infusedUnit.id, actionType: "skill" },
        { characterId: infusedUnit.id, actionType: "normal" },
      ];

      const result = simulateRotation([infusedUnit], rotation, testEnemy);
      const normalHits = result.timeline.filter(
        (e) => e.type === "damage" && e.damage?.abilityId === "synthetic-n1",
      );
      expect(normalHits).toHaveLength(2);
      expect(normalHits[0]!.damage!.element).toBe("pyro");
      expect(normalHits[1]!.damage!.element).toBe("pyro");
      expect(result.damageByElement["pyro"]).toBeGreaterThan(0);
      expect(result.damageByElement["physical"] ?? 0).toBe(0);
    });

    it("reverts to physical damage after infusion expires", () => {
      const shortInfuseSkill: KitAbility = {
        id: "short-infuse-skill",
        name: "Short Infusion Skill",
        slot: "skill",
        castTime: 1.0,
        cooldown: flatTalent(10),
        energyCost: 0,
        instances: [],
        infusion: {
          id: "short-pyro-infusion",
          element: "pyro",
          durationSeconds: 1.2, // expires at 1.0 + 1.2 = 2.2s
          canBeOverridden: false,
        },
      };

      const unit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "unit-expire-infusion",
        skill: shortInfuseSkill,
      };

      const rotation: Rotation = [
        { characterId: unit.id, actionType: "skill" }, // t=0..1.0, infusion ends at 2.2
        { characterId: unit.id, actionType: "normal" }, // t=1.0..1.5 (active)
        { characterId: unit.id, actionType: "normal" }, // t=1.5..2.0 (active)
        { characterId: unit.id, actionType: "normal" }, // t=2.0..2.5 (hit 1 at 2.0 active, hit 2 at 2.2 expired)
        { characterId: unit.id, actionType: "normal" }, // t=2.5..3.0 (both expired -> physical)
      ];

      const result = simulateRotation([unit], rotation, testEnemy);
      const normalHits = result.timeline.filter(
        (e) => e.type === "damage" && e.damage?.abilityId === "synthetic-n1",
      );
      // Last N1 (hits at 2.5s and 2.7s) are definitely past 2.2s
      const lateHits = normalHits.filter((h) => h.timestamp >= 2.5);
      expect(lateHits).toHaveLength(2);
      expect(lateHits[0]!.damage!.element).toBe("physical");
      expect(lateHits[1]!.damage!.element).toBe("physical");
    });
  });

  describe("4. Alternate Stances", () => {
    it("overrides normal attacks, damageType, and adds stat buffs during stance", () => {
      const stanceN1: KitAbility = {
        id: "stance-n1",
        name: "Stance Slash N1",
        slot: "normal",
        castTime: 0.4,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "stance-hit-1",
            name: "Slash 1",
            damageType: "normal",
            element: "pyro",
            scaling: [{ stat: "atk", table: flatTalent(1.5) }],
          },
        ],
      };

      const stanceDef: StanceDefinition<NormalAttackString, KitAbility> = {
        id: "test-pyro-stance",
        name: "Pyro Stance",
        durationSeconds: 4,
        endsOnSwap: true,
        damageTypeOverride: "burst",
        modifiers: [{ stat: "atkFlat", value: 400 }],
        normalAttacks: { hits: [stanceN1], loops: true },
      };

      const stanceSkill: KitAbility = {
        id: "enter-stance-skill",
        name: "Enter Stance Skill",
        slot: "skill",
        castTime: 0.5,
        cooldown: flatTalent(15),
        energyCost: 0,
        instances: [],
        stance: stanceDef,
      };

      const stanceUnit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "stance-unit",
        skill: stanceSkill,
      };

      const rotation: Rotation = [
        { characterId: stanceUnit.id, actionType: "skill" }, // t=0..0.5, enters stance for 4s (until 4.5s)
        { characterId: stanceUnit.id, actionType: "normal" }, // t=0.5..0.9
      ];

      const result = simulateRotation([stanceUnit], rotation, testEnemy);
      const normalDmg = result.timeline.find(
        (e) => e.type === "damage" && e.damage?.abilityId === "stance-n1",
      );
      expect(normalDmg).toBeDefined();
      // Verifies damageTypeOverride: "burst"
      expect(normalDmg!.damage!.damageType).toBe("burst");
      // Verifies atkFlat +400: base ATK 800 + 400 = 1200. Scaling 1.5 => raw 1800
      expect(normalDmg!.damage!.rawDamage).toBeCloseTo(1800);
    });

    it("cancels stance and its infusion immediately on swap when endsOnSwap is true", () => {
      const stanceDef: StanceDefinition<NormalAttackString, KitAbility> = {
        id: "swap-cancel-stance",
        name: "Swap Cancel Stance",
        durationSeconds: 10,
        endsOnSwap: true,
        infusion: {
          id: "stance-infusion",
          element: "pyro",
          durationSeconds: 10,
          canBeOverridden: false,
        },
      };

      const stanceSkill: KitAbility = {
        id: "stance-skill-cancel",
        name: "Stance Skill",
        slot: "skill",
        castTime: 0.5,
        cooldown: flatTalent(15),
        energyCost: 0,
        instances: [],
        stance: stanceDef,
      };

      const unit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "unit-stance-swap",
        skill: stanceSkill,
      };

      const rotation: Rotation = [
        { characterId: unit.id, actionType: "skill" }, // t=0..0.5, enters stance
        { characterId: legacyUnit.id, actionType: "swap" }, // t=0.5..1.5, cancels stance on unit
        { characterId: unit.id, actionType: "swap" }, // t=1.5..2.5, swap back to unit
        { characterId: unit.id, actionType: "normal" }, // t=2.5..3.0
      ];

      const result = simulateRotation([unit, legacyUnit], rotation, testEnemy);
      expect(result.errors).toHaveLength(0);

      // Normal attacks performed after swapping back must NOT have the pyro infusion
      const normalHits = result.timeline.filter(
        (e) =>
          e.type === "damage" &&
          e.characterId === unit.id &&
          e.damage?.abilityId === "synthetic-n1",
      );
      expect(normalHits).toHaveLength(2);
      expect(normalHits[0]!.damage!.element).toBe("physical");
    });
  });

  describe("5. Coordinated Attacks & Trigger Evaluation", () => {
    it("activates a cast-declared damage trigger after the creating cast", () => {
      const proc: KitAbility = {
        id: "delayed-proc",
        name: "Delayed Proc",
        slot: "skill",
        castTime: 0,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [{
          id: "delayed-proc-hit",
          name: "Proc",
          damageType: "skill",
          element: "pyro",
          scaling: [{ stat: "atk", table: flatTalent(0.5) }],
        }],
      };
      const skill: KitAbility = {
        ...syntheticBurst,
        id: "creates-trigger",
        energyCost: 0,
        triggers: [{
          id: "delayed-trigger",
          name: "Delayed Trigger",
          trigger: "onDamageDealt",
          durationSeconds: 10,
          icdSeconds: 1,
          sourceCharacterId: syntheticUnit.id,
          ability: proc,
        }],
      };
      const unit: GenericCharacterDefinition = { ...syntheticUnit, skill };

      const onlyCast = simulateRotation(
        [unit],
        [{ characterId: unit.id, actionType: "skill" }],
        testEnemy,
      );
      expect(onlyCast.timeline.filter((event) => event.type === "damage")).toHaveLength(1);
      expect(onlyCast.timeline.some((event) => event.type === "damage" && event.damage?.abilityId === proc.id)).toBe(false);

      const castThenAttack = simulateRotation(
        [unit],
        [
          { characterId: unit.id, actionType: "skill" },
          { characterId: unit.id, actionType: "normal" },
        ],
        testEnemy,
      );
      const procs = castThenAttack.timeline.filter(
        (event) => event.type === "damage" && event.damage?.abilityId === proc.id,
      );
      expect(procs).toHaveLength(1);
      expect(procs[0]!.timestamp).toBeCloseTo(1.5);
    });

    it("procs off-field coordinated attack on normal attacks respecting ICD", () => {
      const coordAttack: KitAbility = {
        id: "coord-proc-hit",
        name: "Rain Swords Hit",
        slot: "burst",
        castTime: 0,
        cooldown: flatTalent(0),
        energyCost: 0,
        instances: [
          {
            id: "sword-1",
            name: "Sword",
            damageType: "burst",
            element: "hydro",
            scaling: [{ stat: "atk", table: flatTalent(1.0) }],
          },
        ],
      };

      const trigDef: TriggeredEffectDefinition<KitAbility> = {
        id: "raincutter-proc",
        name: "Raincutter Coordinated Proc",
        trigger: "onNormalAttack",
        durationSeconds: 15,
        icdSeconds: 1.0,
        sourceCharacterId: "hydro-subdps",
        ability: coordAttack,
      };

      const burstWithTrig: KitAbility = {
        ...syntheticBurst,
        id: "raincutter-burst",
        energyCost: 0,
        triggers: [trigDef],
      };

      const hydroSubDps: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "hydro-subdps",
        burst: burstWithTrig,
      };

      const rotation: Rotation = [
        { characterId: hydroSubDps.id, actionType: "burst" }, // t=0..1.5
        { characterId: legacyUnit.id, actionType: "swap" }, // t=1.5..2.1
        { characterId: legacyUnit.id, actionType: "normal" }, // t=2.1: fires proc 1
        { characterId: legacyUnit.id, actionType: "normal" }, // t=2.6: 0.5s since proc 1 < 1.0s ICD => BLOCKED
        { characterId: legacyUnit.id, actionType: "normal" }, // t=3.1: 1.0s since proc 1 >= 1.0s ICD => fires proc 2
      ];

      const result = simulateRotation([hydroSubDps, legacyUnit], rotation, testEnemy);
      const procs = result.timeline.filter(
        (e) => e.type === "damage" && e.damage?.abilityId === "coord-proc-hit",
      );

      expect(procs).toHaveLength(2);
      expect(procs[0]!.timestamp).toBeCloseTo(2.1);
      expect(procs[0]!.characterId).toBe("hydro-subdps");
      expect(procs[1]!.timestamp).toBeCloseTo(3.1);
      expect(procs[1]!.characterId).toBe("hydro-subdps");
    });
  });

  describe("6. Resources and State Effects", () => {
    it("updates character resources on ability cast via applyStateEffects", () => {
      const consumeSkill: KitAbility = {
        id: "consume-skill",
        name: "Consume Stacks Skill",
        slot: "skill",
        castTime: 0.8,
        cooldown: flatTalent(5),
        energyCost: 0,
        instances: [],
        effects: [{ resourceId: "synthetic-stacks", kind: "consume", amount: 1 }],
      };

      const unit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "resource-unit",
      };

      // syntheticUnit.skill grants +2 synthetic-stacks
      const rotation: Rotation = [
        { characterId: unit.id, actionType: "skill" }, // 0 -> 2
      ];

      const res1 = simulateRotation([unit], rotation, testEnemy);
      expect(
        res1.finalState.characters[unit.id]!.resources?.["synthetic-stacks"]?.value,
      ).toBe(2);

      // Now with consume skill
      const unit2: GenericCharacterDefinition = {
        ...unit,
        burst: consumeSkill,
      };
      const rotation2: Rotation = [
        { characterId: unit2.id, actionType: "skill" }, // 0 -> 2
        { characterId: unit2.id, actionType: "burst" }, // 2 - 1 -> 1
      ];
      const res2 = simulateRotation([unit2], rotation2, testEnemy);
      expect(
        res2.finalState.characters[unit2.id]!.resources?.["synthetic-stacks"]?.value,
      ).toBe(1);
    });
  });

  describe("7. Resumable snapshots", () => {
    it("preserves icd, resources, normalStringIndex, activeStance, activeTriggers in snapshot", () => {
      const stanceDef: StanceDefinition<NormalAttackString, KitAbility> = {
        id: "persisted-stance",
        name: "Persisted Stance",
        durationSeconds: 20,
      };
      const stanceSkill: KitAbility = {
        id: "stance-skill",
        name: "Stance Skill",
        slot: "skill",
        castTime: 0.5,
        cooldown: flatTalent(10),
        energyCost: 0,
        instances: [],
        stance: stanceDef,
        effects: [{ resourceId: "synthetic-stacks", kind: "gain", amount: 3 }],
      };
      const unit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "snapshot-unit",
        skill: stanceSkill,
      };

      const rotation: Rotation = [
        { characterId: unit.id, actionType: "skill" },
        { characterId: unit.id, actionType: "normal" },
      ];

      const result = simulateRotation([unit], rotation, testEnemy);
      const snap = result.finalState;

      expect(snap.characters[unit.id]!.resources?.["synthetic-stacks"]?.value).toBe(3);
      const stanceObj = snap.characters[unit.id]!.activeStance?.stance as StanceDefinition;
      expect(stanceObj.id).toBe("persisted-stance");
      expect(snap.characters[unit.id]!.icd).toBeDefined();
      expect(snap.characters[unit.id]!.normalStringIndex).toBeDefined();

      // Ensure JSON serializability
      expect(() => structuredClone(snap)).not.toThrow();
      expect(structuredClone(snap)).toEqual(snap);
    });
  });

  describe("8. validateAction with GenericCharacterDefinition & stances", () => {
    it("validates normal attack indices and rejects out-of-bounds", () => {
      const multiHitNormals: NormalAttackString = {
        hits: [syntheticN1, syntheticN1],
        loops: true,
      };
      const multiUnit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "multi-unit",
        normalAttacks: multiHitNormals,
      };

      const charState: CharacterState = {
        definition: legacyUnit,
        genericDefinition: multiUnit,
        currentEnergy: 60,
        energy: { current: 60, max: 60, totalGained: 60, totalSpent: 0 },
        cooldowns: {},
        normalStringIndex: 0,
      };

      const states = new Map<string, CharacterState>([[multiUnit.id, charState]]);

      // Index 0 valid
      const v0 = validateAction({
        action: { characterId: multiUnit.id, actionType: "normal", normalIndex: 0 },
        states,
        time: 0,
        config: {},
      });
      expect(v0.valid).toBe(true);

      // Index 1 valid
      const v1 = validateAction({
        action: { characterId: multiUnit.id, actionType: "normal", normalIndex: 1 },
        states,
        time: 0,
        config: {},
      });
      expect(v1.valid).toBe(true);

      // Index 2 out of bounds -> unknown-ability
      const v2 = validateAction({
        action: { characterId: multiUnit.id, actionType: "normal", normalIndex: 2 },
        states,
        time: 0,
        config: {},
      });
      expect(v2.valid).toBe(false);
      if (!v2.valid) {
        expect(v2.code).toBe("unknown-ability");
      }
    });
  });

  describe("9. TASK #035 — GenericCharacterDefinition direct execution & invariants", () => {
    it("real character with pure HP scaling (Yelan) scales off HP and ignores ATK buffs", () => {
      const yelan = findCharacter("yelan");
      expect(yelan).toBeDefined();
      if (!yelan) return;

      const rotation: Rotation = [
        { characterId: yelan.id, actionType: "skill" },
      ];

      // 1. Baseline simulation
      const baseResult = simulateRotation([yelan], rotation, testEnemy);
      expect(baseResult.errors).toHaveLength(0);
      expect(baseResult.warnings).toHaveLength(0);
      expect(baseResult.totalDamage).toBeGreaterThan(0);

      const baseSkillHit = baseResult.timeline.find(
        (e) => e.type === "damage" && e.characterId === yelan.id,
      );
      expect(baseSkillHit).toBeDefined();
      const baseRaw = baseSkillHit!.damage!.rawDamage;

      // 2. ATK buff should NOT change rawDamage because Yelan skill scales 100% off HP
      const withAtkBuff = simulateRotation([yelan], rotation, testEnemy, {
        buffResolver: (stats) => ({ ...stats, atk: stats.atk + 2000 }),
      });
      const atkBuffSkillHit = withAtkBuff.timeline.find(
        (e) => e.type === "damage" && e.characterId === yelan.id,
      );
      expect(atkBuffSkillHit!.damage!.rawDamage).toBeCloseTo(baseRaw, 5);

      // 3. HP buff SHOULD increase rawDamage proportionally
      const withHpBuff = simulateRotation([yelan], rotation, testEnemy, {
        buffResolver: (stats) => ({ ...stats, hp: stats.hp * 1.5 }),
      });
      const hpBuffSkillHit = withHpBuff.timeline.find(
        (e) => e.type === "damage" && e.characterId === yelan.id,
      );
      expect(hpBuffSkillHit!.damage!.rawDamage).toBeCloseTo(baseRaw * 1.5, 5);
    });

    it("real character scales strictly with talent levels from per-level tables", () => {
      const yelan = findCharacter("yelan");
      expect(yelan).toBeDefined();
      if (!yelan) return;

      const yelanLvl1: GenericCharacterDefinition = {
        ...yelan,
        talentLevels: { normal: 1, skill: 1, burst: 1 },
      };
      const yelanLvl10: GenericCharacterDefinition = {
        ...yelan,
        talentLevels: { normal: 1, skill: 10, burst: 1 },
      };

      const rotation: Rotation = [
        { characterId: yelan.id, actionType: "skill" },
      ];

      const res1 = simulateRotation([yelanLvl1], rotation, testEnemy);
      const res10 = simulateRotation([yelanLvl10], rotation, testEnemy);

      const hit1 = res1.timeline.find((e) => e.type === "damage" && e.characterId === yelan.id);
      const hit10 = res10.timeline.find((e) => e.type === "damage" && e.characterId === yelan.id);

      expect(hit1).toBeDefined();
      expect(hit10).toBeDefined();
      expect(hit10!.damage!.rawDamage).toBeGreaterThan(hit1!.damage!.rawDamage);

      // Exact table ratio verification
      const skillInstance = yelan.skill.instances[0]!;
      const hpScaleTerm = skillInstance.scaling.find((s) => s.stat === "hp")!;
      const expectedRatio =
        talentValueAt(hpScaleTerm.table, 10) / talentValueAt(hpScaleTerm.table, 1);

      expect(hit10!.damage!.rawDamage / hit1!.damage!.rawDamage).toBeCloseTo(expectedRatio, 5);
    });

    it("expands multi-hit abilities deterministically with correct timestamps and durations", () => {
      const multiHitSkill: KitAbility = {
        id: "multi-instance-skill",
        name: "Multi Instance Skill",
        slot: "skill",
        castTime: 1.2,
        cooldown: flatTalent(8),
        energyCost: 0,
        instances: [
          {
            id: "hit-1",
            name: "First Hit",
            damageType: "skill",
            element: "pyro",
            delay: 0,
            scaling: [{ stat: "atk", table: flatTalent(1.0) }],
          },
          {
            id: "hit-2",
            name: "Second Hit",
            damageType: "skill",
            element: "pyro",
            delay: 0.3,
            scaling: [{ stat: "atk", table: flatTalent(1.5) }],
          },
          {
            id: "hit-3",
            name: "Third Hit",
            damageType: "skill",
            element: "pyro",
            delay: 0.7,
            scaling: [{ stat: "atk", table: flatTalent(2.0) }],
          },
        ],
      };

      const unit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "multi-hit-unit",
        skill: multiHitSkill,
      };

      const rotation: Rotation = [
        { characterId: unit.id, actionType: "skill" },
      ];

      const run1 = simulateRotation([unit], rotation, testEnemy);
      const run2 = simulateRotation([unit], rotation, testEnemy);

      // Determinism
      expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));

      const hits = run1.timeline.filter((e) => e.type === "damage");
      expect(hits).toHaveLength(3);

      // First hit at 0, has cast duration 1.2s
      expect(hits[0]!.timestamp).toBeCloseTo(0);
      expect(hits[0]!.duration).toBeCloseTo(1.2);
      expect(hits[0]!.damage!.rawDamage).toBeCloseTo(800 * 1.0);

      // Second hit at 0.3s, duration undefined
      expect(hits[1]!.timestamp).toBeCloseTo(0.3);
      expect(hits[1]!.duration).toBeUndefined();
      expect(hits[1]!.damage!.rawDamage).toBeCloseTo(800 * 1.5);

      // Third hit at 0.7s, duration undefined
      expect(hits[2]!.timestamp).toBeCloseTo(0.7);
      expect(hits[2]!.duration).toBeUndefined();
      expect(hits[2]!.damage!.rawDamage).toBeCloseTo(800 * 2.0);

      // Clock advances by castTime (1.2s)
      expect(run1.duration).toBeCloseTo(1.2);
    });

    it("verifies resumable snapshot contains proper state including carried invariants", () => {
      const unit: GenericCharacterDefinition = {
        ...syntheticUnit,
        id: "snapshot-test-unit",
        normalAttacks: { hits: [syntheticN1, syntheticN1], loops: true },
      };

      const rotation: Rotation = [
        { characterId: unit.id, actionType: "skill" },
        { characterId: unit.id, actionType: "normal" },
      ];

      const result = simulateRotation([unit], rotation, testEnemy);
      const snapshot = result.finalState;

      // Time matches end of rotation
      expect(snapshot.time).toBeGreaterThan(0);
      expect(snapshot.activeCharacterId).toBe(unit.id);

      const charSnap = snapshot.characters[unit.id];
      expect(charSnap).toBeDefined();
      expect(charSnap!.characterId).toBe(unit.id);
      expect(charSnap!.energy.current).toBeGreaterThanOrEqual(0);
      expect(charSnap!.cooldowns[unit.skill.id]).toBeGreaterThan(0);
      expect(charSnap!.normalStringIndex).toBe(1);
      expect(charSnap!.resources).toBeDefined();
      expect(charSnap!.resources!["synthetic-stacks"]).toBeDefined();
      expect(charSnap!.icd).toBeDefined();

      // Ensure JSON round-trip
      const serialized = JSON.stringify(snapshot);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(snapshot);
    });
  });
});
