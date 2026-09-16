/** Runtime Kamisato Ayaka overlay for executable sourced damage channels. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { kamisatoAyaka } from "../generated/cryo";

const AYAKA_A1_NORMAL_CHARGED_DMG_BONUS = 0.3;
const AYAKA_A1_DURATION_SECONDS = 6;
const AYAKA_C2_ADDITIONAL_STORM_RATIO = 0.2;

const a1NormalChargedBuff: Buff = {
  id: "kamisato-ayaka-a1-amatsumi-kunitsumi-sanctification",
  source: "Amatsumi Kunitsumi Sanctification",
  sourceCharacterId: kamisatoAyaka.id,
  startTime: 0,
  duration: AYAKA_A1_DURATION_SECONDS,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { damageTypes: ["normal", "charged"] },
  modifiers: [{ stat: "dmgBonus", value: AYAKA_A1_NORMAL_CHARGED_DMG_BONUS }],
};

function c2AdditionalStormInstances(): KitAbility["instances"] {
  const source = kamisatoAyaka.burst.instances[1];
  if (source === undefined) throw new Error("Kamisato Ayaka burst is missing its sourced Bloom row");

  // The generated burst compresses the original storm into Cutting + Bloom
  // rows. Each smaller C2 storm is therefore represented as one hit whose
  // scaling is 20% of the combined generated burst rows.
  const scalingByStat = new Map<string, number[]>();
  for (const instance of kamisatoAyaka.burst.instances) {
    for (const term of instance.scaling) {
      const values = scalingByStat.get(term.stat) ?? Array.from({ length: term.table.values.length }, () => 0);
      term.table.values.forEach((value, index) => { values[index] = (values[index] ?? 0) + value; });
      scalingByStat.set(term.stat, values);
    }
  }
  const scaling = [...scalingByStat.entries()].map(([stat, values]) => ({
    stat: stat as "atk",
    table: { values: values.map((value) => AYAKA_C2_ADDITIONAL_STORM_RATIO * value) },
  }));

  return [1, 2].map((index) => ({
    ...source,
    id: `kamisato-ayaka-c2-burst-${index}`,
    name: `Additional Frostflake Seki no To ${index}`,
    scaling,
  }));
}

export function createKamisatoAyakaDefinition(
  constellationLevel = kamisatoAyaka.constellationLevel,
  talentLevels: TalentLevels = kamisatoAyaka.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? kamisatoAyaka.ascensionPhase;

  return {
    ...kamisatoAyaka,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: {
      ...kamisatoAyaka.skill,
      ...(ascensionPhase >= 1 ? { buffs: [a1NormalChargedBuff] } : {}),
    },
    burst: {
      ...kamisatoAyaka.burst,
      ...(level >= 2
        ? { instances: [...kamisatoAyaka.burst.instances, ...c2AdditionalStormInstances()] }
        : {}),
    },
  };
}

export const KAMISATO_AYAKA_KIT_METADATA = {
  a1NormalChargedDmgBonus: AYAKA_A1_NORMAL_CHARGED_DMG_BONUS,
  a1DurationSeconds: AYAKA_A1_DURATION_SECONDS,
  c2AdditionalStormRatio: AYAKA_C2_ADDITIONAL_STORM_RATIO,
  unsupportedChannels: [
    "a4SenhoEndCryoDamageBonusAndStaminaRestore",
    "c1CryoNormalChargedAttackSkillCooldownChance",
    "c4BurstHitGatedEnemyDefReduction",
    "c6TimedUsurahiButouChargedAttackBuff",
    "p3CraftingDoubleRewardChance",
  ],
} as const;

export const kamisatoAyakaWithKit = createKamisatoAyakaDefinition();
