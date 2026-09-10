import type { AbilityDefinition, CharacterDefinition } from "@/types";
import type {
  GenericCharacterDefinition,
  TalentLevels,
} from "@/simulation/character/character";
import type {
  AbilitySlot,
  KitAbility,
  Rarity,
  WeaponType,
} from "@/simulation/character/kit";
import { flatTalent, talentTable } from "@/simulation/character/talent";

// ============================================================================
// Legacy adapter — lifts the Phase 1/2 `CharacterDefinition` into the generic
// model WITHOUT modifying it.
//
// This is the migration strategy: additive coexistence. The legacy shape stays
// byte-identical, every existing consumer and all 512 existing tests keep
// working untouched, and new code can consume a uniform generic model via this
// lift. Nothing is rewritten in place and nothing is deleted.
//
// The lift is lossy in ONE direction only (legacy -> generic gains structure it
// never had, filled with explicit neutral defaults). It is NOT a source of game
// data: it invents no multipliers, no particle counts, no energy costs. Every
// value it produces comes from the legacy object it was handed.
// ============================================================================

/**
 * Talent level assumed for a lifted legacy character.
 *
 * Legacy multipliers are scalars with no level attached. Lifting them to a
 * 1-entry table and reading it at any level returns that same scalar, so this
 * constant cannot change a lifted character's numbers — it exists so the
 * generic model's required field has a defined value.
 */
export const LEGACY_TALENT_LEVEL = 1;

/** Weapon type is absent from the legacy shape; callers may override it. */
export const LEGACY_DEFAULT_WEAPON_TYPE: WeaponType = "sword";

/** Rarity is absent from the legacy shape; callers may override it. */
export const LEGACY_DEFAULT_RARITY: Rarity = 5;

function slotFor(ability: AbilityDefinition): AbilitySlot {
  switch (ability.actionType) {
    case "charged":
      return "charged";
    case "skill":
      return "skill";
    case "burst":
      return "burst";
    default:
      return "normal";
  }
}

/**
 * Lifts one legacy ability into a single-instance `KitAbility`.
 *
 * A legacy ability has exactly one multiplier, so it becomes exactly one damage
 * instance — the degenerate case of the multi-hit model, which is precisely why
 * multi-hit needed no special-casing in the engine.
 */
export function liftAbility(ability: AbilityDefinition): KitAbility {
  return {
    id: ability.id,
    name: ability.name,
    slot: slotFor(ability),
    castTime: ability.castTime,
    // Scalar cooldown -> constant table: reads back identical at every level.
    cooldown: flatTalent(ability.cooldown),
    energyCost: ability.energyCost,
    ...(ability.particles !== undefined ? { particles: ability.particles } : {}),
    ...(ability.energyGenerated !== 0
      ? { energyGenerated: ability.energyGenerated }
      : {}),
    instances: [
      {
        id: `${ability.id}-hit`,
        name: ability.name,
        damageType: ability.damageType,
        element: ability.element,
        // Legacy scaling is the literal "atk"; one term, constant table.
        scaling: [{ stat: "atk", table: talentTable([ability.multiplier]) }],
        // No elemental application: the legacy model has no gauge or ICD data,
        // and inventing one would fabricate reaction behaviour. Left absent
        // ON PURPOSE so a lifted character triggers no reactions rather than
        // wrong ones.
      },
    ],
  };
}

export interface LiftOptions {
  weaponType?: WeaponType;
  rarity?: Rarity;
  talentLevels?: TalentLevels;
}

/**
 * Lifts a legacy `CharacterDefinition` into a `GenericCharacterDefinition`.
 *
 * The legacy four-slot kit maps onto the generic model as:
 *   normalAttack  -> a 1-entry normal-attack string (N1 only)
 *   chargedAttack -> chargedAttack
 *   elementalSkill/-Burst -> skill / burst
 *
 * Plunging attacks, passives, constellations and resources come back EMPTY:
 * the legacy shape carries no such data, and empty is the honest answer.
 */
export function liftCharacter(
  def: CharacterDefinition,
  options: LiftOptions = {},
): GenericCharacterDefinition {
  const talentLevels: TalentLevels = options.talentLevels ?? {
    normal: LEGACY_TALENT_LEVEL,
    skill: LEGACY_TALENT_LEVEL,
    burst: LEGACY_TALENT_LEVEL,
  };

  return {
    id: def.id,
    name: def.name,
    element: def.element,
    weaponType:
      options.weaponType ?? def.weaponType ?? LEGACY_DEFAULT_WEAPON_TYPE,
    rarity: options.rarity ?? LEGACY_DEFAULT_RARITY,
    level: def.level,
    // Legacy data is authored as already-final stats, so there is no ascension
    // phase to speak of. Phase 0 with a zero curve keeps `baseStats`
    // authoritative and adds nothing.
    ascensionPhase: 0,
    constellationLevel: 0,
    talentLevels,
    baseStatCurves: {
      hp: { byLevel: { [def.level]: def.baseStats.hp } },
      atk: { byLevel: { [def.level]: def.baseStats.atk } },
      def: { byLevel: { [def.level]: def.baseStats.def } },
    },
    ascensionBonus: { stat: "atkPercent", valueByPhase: [0] },
    baseStats: def.baseStats,
    maxEnergy: def.maxEnergy,
    normalAttacks: { hits: [liftAbility(def.normalAttack)], loops: true },
    chargedAttack: liftAbility(def.chargedAttack),
    skill: liftAbility(def.elementalSkill),
    burst: liftAbility(def.elementalBurst),
    passives: [],
    constellations: [],
    resources: [],
  };
}
