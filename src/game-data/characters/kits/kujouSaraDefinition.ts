/** Runtime Kujou Sara overlay for Crowfeather buffs and damage constellations. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { DamageInstanceDefinition, KitAbility } from "@/simulation/character/kit";
import { talentTable, talentValueAt } from "@/simulation/character/talent";
import type { Buff } from "@/simulation/buffs/types";
import { kujouSara } from "../generated/electro";

const CROWFEATHER_DURATION_SECONDS = 6;
const C2_CROWFEATHER_DAMAGE_RATIO = 0.3;
const C4_STORMCLUSTER_COUNT = 6;
const C6_ELECTRO_CRIT_DMG = 0.6;

// Tengu Juurai's sourced Base ATK bonus ratio (KQM TCL / talent table).
const CROWFEATHER_ATK_RATIO = talentTable([
  0.4296, 0.4618, 0.494, 0.537, 0.5692, 0.6014, 0.6444, 0.6874,
  0.7303, 0.7733, 0.8162, 0.8592, 0.9129, 0.9666, 1.0203,
]);

function crowfeatherBuff(talentLevel: number, c6: boolean): Buff[] {
  const modifiers = c6
    ? [{ stat: "critDmg" as const, value: C6_ELECTRO_CRIT_DMG }]
    : [];
  return [
    {
      id: "kujou-sara-tengu-juurai-atk",
      source: "Tengu Juurai",
      sourceCharacterId: kujouSara.id,
      startTime: 0,
      duration: CROWFEATHER_DURATION_SECONDS,
      stacking: { mode: "refresh" as const },
      targets: { scope: "active" as const },
      sourceBaseAtkPercent: talentValueAt(CROWFEATHER_ATK_RATIO, talentLevel),
      ...(modifiers.length > 0 ? { modifiers } : {}),
    },
  ];
}

function scaledInstance(instance: DamageInstanceDefinition, ratio: number, id: string): DamageInstanceDefinition {
  return {
    ...instance,
    id,
    name: `${instance.name} (C2)`,
    scaling: instance.scaling.map((term) => ({
      ...term,
      table: talentTable(term.table.values.map((value) => value * ratio)),
    })),
  };
}

function withC4Stormclusters(burst: KitAbility): KitAbility {
  const cluster = burst.instances[1];
  if (cluster === undefined) throw new Error("Kujou Sara burst is missing its sourced Stormcluster row");
  return {
    ...burst,
    instances: [
      burst.instances[0]!,
      ...Array.from({ length: C4_STORMCLUSTER_COUNT }, (_, index) => ({
        ...cluster,
        id: `kujou-sara-burst-stormcluster-${index + 1}`,
      })),
    ],
  };
}

export function createKujouSaraDefinition(
  constellationLevel = kujouSara.constellationLevel,
  talentLevels: TalentLevels = kujouSara.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const c6 = level >= 6;
  const skillInstances = level >= 2
    ? [
        ...kujouSara.skill.instances,
        scaledInstance(kujouSara.skill.instances[0]!, C2_CROWFEATHER_DAMAGE_RATIO, "kujou-sara-skill-c2-crowfeather"),
      ]
    : kujouSara.skill.instances;
  const skill = {
    ...kujouSara.skill,
    instances: skillInstances,
    buffs: crowfeatherBuff(talentLevels.skill, c6),
  };
  const baseBurst = {
    ...kujouSara.burst,
    buffs: crowfeatherBuff(talentLevels.skill, c6),
  };

  return {
    ...kujouSara,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill,
    burst: level >= 4 ? withC4Stormclusters(baseBurst) : baseBurst,
  };
}

export const KUJOU_SARA_KIT_METADATA = {
  crowfeatherDurationSeconds: CROWFEATHER_DURATION_SECONDS,
  crowfeatherAtkRatioAtTalentLevel: CROWFEATHER_ATK_RATIO.values,
  c2CrowfeatherDamageRatio: C2_CROWFEATHER_DAMAGE_RATIO,
  c4StormclusterCount: C4_STORMCLUSTER_COUNT,
  c6ElectroCritDmg: C6_ELECTRO_CRIT_DMG,
  unsupportedChannels: [
    "a1CrowfeatherAimedShotChargeTime",
    "a4EnergyRestoreOnAmbush",
    "c1SkillCooldownReduction",
    "p3ExpeditionTimeReduction",
  ],
} as const;

export const kujouSaraWithKit = createKujouSaraDefinition();
