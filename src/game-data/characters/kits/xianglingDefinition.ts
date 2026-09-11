/**
 * Xiangling's runtime kit overlay.
 *
 * The generated burst rows contain both the opening swing and the sourced
 * Pyronado motion value. The latter is a time-driven coordinated attack so it
 * can continue while Xiangling is off field without an engine character
 * branch.
 */
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility, NormalAttackString } from "@/simulation/character/kit";
import type { StanceDefinition } from "@/simulation/buffs/types";
import { xiangling } from "../generated/pyro";

const PYRONADO_INTERVAL_SECONDS = 1.5;

export function createXianglingDefinition(
  constellationLevel = xiangling.constellationLevel,
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const sourceHit = xiangling.burst.instances[3] ?? xiangling.burst.instances.at(-1);
  if (!sourceHit) throw new Error("Xiangling burst is missing a Pyronado damage row");

  const pyronadoHit = {
    ...sourceHit,
    id: "xiangling-pyronado-contact-1",
    name: "旋火轮接触伤害",
    // Pyronado applies 1U Pyro on its standard 1.5s application cadence.
    application: { element: "pyro" as const, gauge: 1 as const, icdGroup: "xiangling-pyronado" },
  };
  const durationSeconds = level >= 4 ? 14 : 10;
  const stance: StanceDefinition<NormalAttackString, KitAbility> = {
    id: "xiangling-pyronado",
    name: "旋火轮",
    durationSeconds,
    // The field follows the active character and survives Xiangling leaving.
    endsOnSwap: false,
    triggers: [
      {
        id: "xiangling-pyronado-contact",
        name: "旋火轮接触伤害",
        trigger: "onInterval",
        intervalSeconds: PYRONADO_INTERVAL_SECONDS,
        durationSeconds,
        icdSeconds: 0,
        maxProcs: level >= 4 ? 9 : 7,
        snapshotMode: "cast",
        sourceCharacterId: "xiangling",
        ability: {
          id: "xiangling-pyronado-contact",
          name: "旋火轮接触伤害",
          slot: "burst",
          castTime: 0,
          cooldown: { values: [0] },
          energyCost: 0,
          instances: [pyronadoHit],
        },
      },
    ],
  };

  return {
    ...xiangling,
    constellationLevel: level,
    // C1 starts a six-second Pyro RES shred after Guoba's skill resolves.
    // The generic post-cast buff seam keeps the window finite and avoids the
    // old National compatibility path's permanent shred.
    skill:
      level >= 1
        ? {
            ...xiangling.skill,
            buffs: [
              {
                id: "xiangling-c1-pyro-shred",
                source: "外酥里嫩",
                sourceCharacterId: "xiangling",
                startTime: 0,
                duration: 6,
                stacking: { mode: "refresh" as const },
                targets: { scope: "party" as const },
                enemyModifiers: [
                  { key: "resReduction" as const, element: "pyro" as const, value: 0.15 },
                ],
              },
            ],
          }
        : xiangling.skill,
    // Only the opening swing is part of the burst cast. Contact hits are
    // emitted by the generic interval trigger above.
    burst: {
      ...xiangling.burst,
      instances: [xiangling.burst.instances[0] ?? sourceHit],
      ...(level >= 6
        ? {
            buffs: [
              {
                id: "xiangling-c6-pyro-dmg",
                source: "大龙卷旋火",
                sourceCharacterId: "xiangling",
                startTime: 0,
                duration: durationSeconds,
                stacking: { mode: "refresh" as const },
                targets: { scope: "party" as const },
                modifiers: [
                  { stat: "elementalDmgBonus" as const, element: "pyro" as const, value: 0.15 },
                ],
              },
            ],
          }
        : {}),
      stance,
    },
  };
}

export const xianglingWithKit = createXianglingDefinition();
