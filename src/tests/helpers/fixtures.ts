import type {
  AbilityDefinition,
  ActionType,
  CharacterDefinition,
  EnemyState,
  Element,
  SimulationConfig,
  Stats,
} from "@/types";
import { damageTypeForActionType } from "@/simulation/engine/actionSpace";

// ============================================================================
// Deterministic test fixtures.
//
// Every number here is chosen so expected damage is exactly hand-computable:
// character level 0 and enemy level 0 give a DEF multiplier of exactly 0.5,
// zero resistances give a RES multiplier of exactly 1.0, and `critMode:
// "never"` removes crit entirely. So with ATK 1000 and multiplier 2.0:
//
//   1000 * 2.0 * 1 (bonus) * 0.5 (def) * 1 (res) = 1000
//
// Tests that need a different DEF factor override the levels explicitly.
// Nothing here depends on `src/game-data`, so game-data edits by other agents
// cannot silently change QA's expected values.
// ============================================================================

/** DEF multiplier when both character and enemy are level 0: 100/(100+100). */
export const LEVEL_0_DEF_MULTIPLIER = 0.5;

/** Zero-everything stats. Tests override only the fields they care about. */
export const NEUTRAL_STATS: Readonly<Stats> = Object.freeze({
  atk: 1000,
  hp: 0,
  def: 0,
  elementalMastery: 0,
  critRate: 0,
  critDmg: 0,
  energyRecharge: 1,
  dmgBonus: 0,
  elementalDmgBonus: {},
});

export interface AbilityOverrides {
  element?: Element;
  multiplier?: number;
  castTime?: number;
  cooldown?: number;
  energyCost?: number;
  energyGenerated?: number;
}

function makeAbility(
  id: string,
  actionType: ActionType,
  defaults: Required<AbilityOverrides>,
  overrides: AbilityOverrides = {},
): AbilityDefinition {
  const merged = { ...defaults, ...overrides };
  return {
    id,
    name: id,
    actionType,
    element: merged.element,
    // Total mapping over the whole `ActionType` union. `ActionType` is NOT a
    // structural subset of `DamageType` (plungeLow/plungeHigh both map to the
    // coarse `plunge`), so this must be the exported mapping, not a cast.
    damageType: damageTypeForActionType(actionType),
    multiplier: merged.multiplier,
    scaling: "atk",
    castTime: merged.castTime,
    cooldown: merged.cooldown,
    energyCost: merged.energyCost,
    energyGenerated: merged.energyGenerated,
  };
}

export interface TestCharacterOverrides {
  element?: Element;
  level?: number;
  maxEnergy?: number;
  stats?: Partial<Stats>;
  normalAttack?: AbilityOverrides;
  chargedAttack?: AbilityOverrides;
  elementalSkill?: AbilityOverrides;
  elementalBurst?: AbilityOverrides;
}

/**
 * Builds a fully deterministic test character. Ability ids follow the stable
 * pattern `<id>-na | -ca | -e | -q`, which tests rely on when asserting
 * cooldown keys in `finalState`.
 *
 * Defaults (all hand-computable at level 0 vs a level-0, 0-res enemy):
 *   NA  mult 1.0  cast 0.5s  no cooldown  no energy      -> 500 dmg
 *   CA  mult 1.0  cast 0.5s  no cooldown  no energy      -> 500 dmg
 *   E   mult 2.0  cast 1.0s  cooldown 6s  +20 flat energy-> 1000 dmg
 *   Q   mult 4.0  cast 1.0s  cooldown 15s cost 40 energy -> 2000 dmg
 */
export function makeTestCharacter(
  id: string,
  overrides: TestCharacterOverrides = {},
): CharacterDefinition {
  const element = overrides.element ?? "pyro";
  const base: Required<AbilityOverrides> = {
    element,
    multiplier: 1,
    castTime: 0.5,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  };
  return {
    id,
    name: id,
    element,
    level: overrides.level ?? 0,
    maxEnergy: overrides.maxEnergy ?? 40,
    baseStats: { ...NEUTRAL_STATS, ...overrides.stats },
    normalAttack: makeAbility(`${id}-na`, "normal", base, overrides.normalAttack),
    chargedAttack: makeAbility(`${id}-ca`, "charged", base, overrides.chargedAttack),
    elementalSkill: makeAbility(`${id}-e`, "skill", base, {
      multiplier: 2,
      castTime: 1,
      cooldown: 6,
      energyGenerated: 20,
      ...overrides.elementalSkill,
    }),
    elementalBurst: makeAbility(`${id}-q`, "burst", base, {
      multiplier: 4,
      castTime: 1,
      cooldown: 15,
      energyCost: 40,
      ...overrides.elementalBurst,
    }),
  };
}

/** Level-0, zero-resistance dummy: DEF multiplier 0.5, RES multiplier 1.0. */
export const NEUTRAL_ENEMY: EnemyState = {
  id: "neutral-dummy",
  name: "Neutral Dummy",
  level: 0,
  resistances: {},
};

/** Crit removed so every damage number is exact rather than expected-value. */
export const NO_CRIT_CONFIG: SimulationConfig = { critMode: "never" };

/**
 * Expected final damage for one hit under the neutral fixture set.
 * Mirrors the documented formula, not the implementation, so a pipeline
 * regression fails rather than silently redefining "correct".
 */
export function expectedNeutralDamage(
  atk: number,
  multiplier: number,
  dmgBonus = 0,
): number {
  return atk * multiplier * (1 + dmgBonus) * LEVEL_0_DEF_MULTIPLIER;
}
