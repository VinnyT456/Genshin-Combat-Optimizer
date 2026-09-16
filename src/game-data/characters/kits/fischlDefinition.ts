/** Runtime Fischl overlay for Oz, sourced damage constellations, and A4. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { TriggeredEffectDefinition } from "@/simulation/buffs/triggers";
import { flatTalent } from "@/simulation/character/talent";
import { fischl } from "../generated/electro";

const OZ_DURATION_SECONDS = 10;
const OZ_C6_DURATION_SECONDS = 12;
const OZ_INTERVAL_SECONDS = 1;
const C1_NORMAL_ATK_RATIO = 0.22;
const C2_SUMMONING_BONUS_RATIO = 2;
const C4_BURST_RATIO = 2.22;
const C6_OZ_ATTACK_RATIO = 0.30;
const A4_REACTION_RATIO = 0.80;

function ozAttack(source: NonNullable<GenericCharacterDefinition["skill"]>["instances"][number], id: string, ratio?: number) {
  return {
    ...source,
    id,
    ...(ratio === undefined ? {} : { scaling: [{ stat: "atk" as const, table: flatTalent(ratio) }] }),
  };
}

function ozTrigger(
  source: NonNullable<GenericCharacterDefinition["skill"]>["instances"][number],
  id: string,
  name: string,
  trigger: "onInterval" | "onNormalAttack" | "onReaction",
  durationSeconds: number,
  icdSeconds: number,
  ratio?: number,
): TriggeredEffectDefinition<KitAbility> {
  return {
    id,
    name,
    trigger,
    durationSeconds,
    icdSeconds,
    ...(trigger === "onInterval" ? { intervalSeconds: OZ_INTERVAL_SECONDS, maxProcs: Math.ceil(durationSeconds / OZ_INTERVAL_SECONDS) } : {}),
    sourceCharacterId: "fischl",
    snapshotMode: "cast",
    ability: {
      id: `${id}-hit`,
      name,
      slot: "skill",
      castTime: 0,
      cooldown: flatTalent(0),
      energyCost: 0,
      instances: [ozAttack(source, `${id}-hit`, ratio)],
    },
  };
}

function c1NormalAttacks(): GenericCharacterDefinition["normalAttacks"] {
  return {
    ...fischl.normalAttacks,
    hits: fischl.normalAttacks.hits.map((ability) => ({
      ...ability,
      instances: [
        ...ability.instances,
        {
          id: `${ability.id}-c1-gaze`,
          name: "Gaze of the Deep coordinated shot",
          damageType: "normal" as const,
          element: "physical" as const,
          scaling: [{ stat: "atk" as const, table: flatTalent(C1_NORMAL_ATK_RATIO) }],
        },
      ],
    })),
  };
}

export function createFischlDefinition(
  constellationLevel = fischl.constellationLevel,
  talentLevels: TalentLevels = fischl.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? fischl.ascensionPhase;
  const ozSource = fischl.skill.instances[0];
  const summonSource = fischl.skill.instances[1];
  if (ozSource === undefined || summonSource === undefined) throw new Error("Fischl skill is missing Oz rows");

  const ozDuration = level >= 6 ? OZ_C6_DURATION_SECONDS : OZ_DURATION_SECONDS;
  const triggers: TriggeredEffectDefinition<KitAbility>[] = [
    ozTrigger(ozSource, "fischl-oz-interval", "Oz attack", "onInterval", ozDuration, 0),
  ];
  if (level >= 6) triggers.push(
    ozTrigger(ozSource, "fischl-c6-oz-attack", "Evernight Raven coordinated attack", "onNormalAttack", ozDuration, 0.6, C6_OZ_ATTACK_RATIO),
  );
  if (ascensionPhase >= 4) triggers.push(
    ozTrigger(ozSource, "fischl-a4-reaction", "Undone Be Thy Sinful Hex", "onReaction", ozDuration, 0.5, A4_REACTION_RATIO),
  );

  const skillInstances = [
    {
      ...summonSource,
      ...(level >= 2 ? { scaling: [...summonSource.scaling, { stat: "atk" as const, table: flatTalent(C2_SUMMONING_BONUS_RATIO) }] } : {}),
    },
  ];
  const burstInstances = level >= 4
    ? [...fischl.burst.instances, { ...ozSource, id: "fischl-c4-night-raven", name: "Her Pilgrimage of Bleak explosion", scaling: [{ stat: "atk" as const, table: flatTalent(C4_BURST_RATIO) }] }]
    : fischl.burst.instances;

  return {
    ...fischl,
    ...overrides,
    ascensionPhase,
    constellationLevel: level,
    talentLevels,
    normalAttacks: level >= 1 ? c1NormalAttacks() : fischl.normalAttacks,
    skill: { ...fischl.skill, instances: skillInstances, triggers },
    burst: { ...fischl.burst, instances: burstInstances },
  };
}

export const fischlWithKit = createFischlDefinition();

export const FISCHL_KIT_METADATA = {
  ozDurationSeconds: OZ_DURATION_SECONDS,
  c6OzDurationSeconds: OZ_C6_DURATION_SECONDS,
  c1NormalAtkRatio: C1_NORMAL_ATK_RATIO,
  c2SummoningBonusRatio: C2_SUMMONING_BONUS_RATIO,
  c4BurstRatio: C4_BURST_RATIO,
  c6OzAttackRatio: C6_OZ_ATTACK_RATIO,
  a4ReactionRatio: A4_REACTION_RATIO,
  unsupportedChannels: [
    "a1FullyChargedShotHitsOzConditionalExplosion",
    "c4BurstEndHealing",
    "p3CraftingRefund",
  ],
} as const;
