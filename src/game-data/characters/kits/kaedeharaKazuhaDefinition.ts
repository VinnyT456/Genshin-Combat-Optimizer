/** Runtime Kaedehara Kazuha overlay for executable sourced kit channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { flatTalent } from "@/simulation/character/talent";
import { kaedeharaKazuha } from "../generated/anemo";

const KAZUHA_C1_COOLDOWN_MULTIPLIER = 0.9;
const KAZUHA_C2_ELEMENTAL_MASTERY = 200;
const KAZUHA_C2_DURATION_SECONDS = 10;
const KAZUHA_C6_ATTACK_EM_RATIO = 0.002;
const KAZUHA_C6_INFUSION_DURATION_SECONDS = 5;

const c2ElementalMasteryBuff: Buff = {
  id: "kaedehara-kazuha-c2-yamaarashi-tailwind",
  source: "Yamaarashi Tailwind",
  sourceCharacterId: "kaedehara-kazuha",
  startTime: 0,
  duration: KAZUHA_C2_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "party" },
  modifiers: [{ stat: "elementalMastery", value: KAZUHA_C2_ELEMENTAL_MASTERY }],
};

const c6Infusion = {
  id: "kaedehara-kazuha-c6-crimson-momiji-infusion",
  element: "anemo" as const,
  durationSeconds: KAZUHA_C6_INFUSION_DURATION_SECONDS,
  canBeOverridden: false,
};

function addC6AttackScaling<T extends KitAbility>(ability: T, enabled: boolean): T {
  if (!enabled) return ability;
  return {
    ...ability,
    instances: ability.instances.map((instance) => ({
      ...instance,
      // The generic scaling seam has no post-formula dynamic DMG% term on a
      // per-damage-type basis. This equivalent EM contribution is limited to
      // Kazuha's NA/CA/plunge rows and does not leak into skill/burst damage.
      scaling: [
        ...instance.scaling,
        { stat: "elementalMastery", table: flatTalent(KAZUHA_C6_ATTACK_EM_RATIO) },
      ],
    })),
  };
}

export function createKaedeharaKazuhaDefinition(
  constellationLevel = kaedeharaKazuha.constellationLevel,
  talentLevels: TalentLevels = kaedeharaKazuha.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const c6 = level >= 6;
  const normalAttacks = {
    ...kaedeharaKazuha.normalAttacks,
    hits: kaedeharaKazuha.normalAttacks.hits.map((hit) => addC6AttackScaling(hit, c6)),
  };
  const chargedAttack = kaedeharaKazuha.chargedAttack
    ? addC6AttackScaling(kaedeharaKazuha.chargedAttack, c6)
    : undefined;
  const plungeLow = kaedeharaKazuha.plungeLow
    ? addC6AttackScaling(kaedeharaKazuha.plungeLow, c6)
    : undefined;
  const plungeHigh = kaedeharaKazuha.plungeHigh
    ? addC6AttackScaling(kaedeharaKazuha.plungeHigh, c6)
    : undefined;

  return {
    ...kaedeharaKazuha,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    normalAttacks,
    chargedAttack,
    plungeLow,
    plungeHigh,
    skill: {
      ...kaedeharaKazuha.skill,
      cooldown: {
        values: kaedeharaKazuha.skill.cooldown.values.map((value) =>
          value * (level >= 1 ? KAZUHA_C1_COOLDOWN_MULTIPLIER : 1)),
      },
      ...(c6 ? { infusion: c6Infusion } : {}),
    },
    burst: {
      ...kaedeharaKazuha.burst,
      ...(level >= 2 ? { buffs: [c2ElementalMasteryBuff] } : {}),
      ...(c6 ? { infusion: c6Infusion } : {}),
    },
  };
}

export const KAEDEHARA_KAZUHA_KIT_METADATA = {
  c1CooldownMultiplier: KAZUHA_C1_COOLDOWN_MULTIPLIER,
  c2ElementalMastery: KAZUHA_C2_ELEMENTAL_MASTERY,
  c2DurationSeconds: KAZUHA_C2_DURATION_SECONDS,
  c6AttackElementalMasteryRatio: KAZUHA_C6_ATTACK_EM_RATIO,
  c6InfusionDurationSeconds: KAZUHA_C6_INFUSION_DURATION_SECONDS,
  unsupportedChannels: [
    "a1ElementalAbsorptionAndAdditionalPlungeHit",
    "a4SwirlTriggeredAbsorbedElementDamageBonus",
    "c1BurstTriggeredSkillReset",
    "c4EnergyBelow45AndGlidingEnergyRegeneration",
    "c6InfusionExactPostCastLifecycleAndDamageBonusFormula",
    "p3SprintingStaminaReduction",
  ],
} as const;

export const kaedeharaKazuhaWithKit = createKaedeharaKazuhaDefinition();
