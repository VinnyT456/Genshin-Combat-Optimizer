/** Generic runtime overlay for Xingqiu's Raincutter. */
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { Buff } from "@/simulation/buffs/types";
import { xingqiu } from "../generated/hydro";

export function createXingqiuDefinition(
  constellationLevel = xingqiu.constellationLevel,
  talentLevels = xingqiu.talentLevels,
  overrides?: Pick<GenericCharacterDefinition, "level" | "baseStats">,
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const durationSeconds = level >= 2 ? 18 : 15;
  const sourceHit = xingqiu.burst.instances[0];
  if (!sourceHit) throw new Error("Xingqiu burst is missing a Sword Rain row");

  const rainHit = {
    ...sourceHit,
    id: "xingqiu-rain-sword",
    name: "剑雨协同攻击",
    application: {
      element: "hydro" as const,
      gauge: 1 as const,
      icdGroup: "xingqiu-sword-rain",
    },
  };
  const rainAbility: KitAbility = {
    id: "xingqiu-rain-sword",
    name: "剑雨协同攻击",
    slot: "burst",
    castTime: 0,
    cooldown: { values: [0] },
    energyCost: 0,
    instances: [rainHit],
  };

  const burstBuffs: readonly Buff[] | undefined = level >= 4
    ? [
        {
          id: "xingqiu-c4-skill-damage",
          source: "孤舟斩蛟",
          sourceCharacterId: "xingqiu",
          startTime: 0,
          duration: durationSeconds,
          stacking: { mode: "refresh" },
          targets: { scope: "self" },
          conditions: { damageTypes: ["skill"] },
          // The generic stat channel expresses the authored +50% skill damage
          // while retaining the normal buff lifecycle and gating.
          modifiers: [{ stat: "dmgBonus", value: 0.5 }],
        },
      ]
    : undefined;

  return {
    ...xingqiu,
    ...(overrides ?? {}),
    constellationLevel: level,
    talentLevels,
    // Blades Amidst Raindrops grants Xingqiu 20% Hydro DMG. The generated
    // row is presentation-only, so attach the executable self buff here.
    passives: xingqiu.passives.map((passive) =>
      passive.id === "xingqiu-a4"
        ? {
            ...passive,
            buffs: [
              {
                id: "xingqiu-a4-hydro-dmg",
                source: "虚实工笔",
                sourceCharacterId: "xingqiu",
                startTime: 0,
                duration: Number.POSITIVE_INFINITY,
                stacking: { mode: "refresh" as const },
                targets: { scope: "self" as const },
                modifiers: [
                  { stat: "elementalDmgBonus" as const, element: "hydro" as const, value: 0.2 },
                ],
              },
            ],
          }
        : passive,
    ),
    burst: {
      ...xingqiu.burst,
      buffs: burstBuffs,
      instances: [sourceHit],
      triggers: [
        {
          id: "xingqiu-raincutter",
          name: "剑雨",
          trigger: "onNormalAttack",
          durationSeconds,
          icdSeconds: 0,
          sourceCharacterId: "xingqiu",
          snapshotMode: "cast",
          ability: rainAbility,
          ...(level >= 2
            ? {
                buffs: [
                  {
                    id: "xingqiu-c2-hydro-shred",
                    source: "天青现虹",
                    sourceCharacterId: "xingqiu",
                    startTime: 0,
                    duration: 4,
                    stacking: { mode: "refresh" as const },
                    targets: { scope: "party" as const },
                    enemyModifiers: [
                      { key: "resReduction" as const, element: "hydro" as const, value: 0.15 },
                    ],
                  } satisfies Buff,
                ],
              }
            : {}),
        },
      ],
    },
  };
}

export const xingqiuWithKit = createXingqiuDefinition();
