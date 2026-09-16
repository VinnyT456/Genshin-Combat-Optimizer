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
    // C1 is intentionally not emitted as a cast buff: its source requires
    // Guoba to hit an opponent, while this ability-level seam has no hit gate.
    // The generated burst contains three separate opening swing hits followed
    // by the recurring Pyronado hit. Keep the sourced opening rows on the cast;
    // contact hits are emitted by the generic interval trigger above.
    burst: {
      ...xiangling.burst,
      instances: xiangling.burst.instances.slice(0, 3),
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

/** Source-backed perks not executable through the current generic kit seams. */
export const XIANGLING_UNSUPPORTED_MECHANICS = [
  "c1GuobaHitGatedPyroResistanceReduction",
  "a4PickupTriggeredAttackBonus",
  "c2NormalStringEndExplosion",
  "a1GuobaFlameRange",
] as const;

export const xianglingWithKit = createXianglingDefinition();
