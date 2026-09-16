/** Runtime Hu Tao overlay for Paramita Papilio and sourced HP-gated damage. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import { talentTable, talentValueAt } from "@/simulation/character/talent";
import type { Buff, StanceDefinition } from "@/simulation/buffs/types";
import { huTao } from "../generated/pyro";

// Guide to Afterlife's ATK bonus is a percentage of Max HP and is capped at
// 400% of Hu Tao's base ATK. These are the sourced level-1 through level-15
// values; the generic conversion seam applies the cap to the converted ATK.
const HP_TO_ATK = talentTable([
  0.0384, 0.04128, 0.04416, 0.048, 0.05088, 0.05376, 0.0576, 0.06144,
  0.06528, 0.06912, 0.07296, 0.0768, 0.0816, 0.0864, 0.0912,
]);

const PARAMITA_DURATION_SECONDS = 9;
const SANGUINE_ROUGE_PYRO_BONUS = 0.33;
const C6_CRIT_RATE = 1;

const sanguineRouge: Buff = {
  id: "hu-tao-a4-sanguine-rouge",
  source: "Sanguine Rouge",
  sourceCharacterId: "hu-tao",
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  // The generic condition resolver evaluates the authored hit element before
  // weapon infusion. Hu Tao's stance is the only executable source of her
  // Pyro damage here, so the HP gate is sufficient and avoids leaking a
  // pre-infusion element predicate into the runtime.
  conditions: { maxHpFraction: 0.5 },
  modifiers: [{ stat: "elementalDmgBonus", element: "pyro", value: SANGUINE_ROUGE_PYRO_BONUS }],
};

const c6ButterflyEmbrace: Buff = {
  id: "hu-tao-c6-butterfly-embrace",
  source: "Butterfly's Embrace",
  sourceCharacterId: "hu-tao",
  startTime: 0,
  duration: 10,
  stacking: { mode: "refresh" },
  targets: { scope: "self" },
  conditions: { maxHpFractionExclusive: 0.25 },
  modifiers: [{ stat: "critRate", value: C6_CRIT_RATE }],
};

function paramitaPapilio(base: GenericCharacterDefinition): StanceDefinition<
  GenericCharacterDefinition["normalAttacks"],
  KitAbility
> {
  return {
    id: "hu-tao-paramita-papilio",
    name: "Paramita Papilio",
    durationSeconds: PARAMITA_DURATION_SECONDS,
    endsOnSwap: true,
    infusion: {
      id: "hu-tao-paramita-papilio-infusion",
      element: "pyro",
      durationSeconds: PARAMITA_DURATION_SECONDS,
      canBeOverridden: false,
    },
    conversions: [{
      sourceStat: "hp",
      targetStat: "atkFlat",
      ratio: talentValueAt(HP_TO_ATK, base.talentLevels.skill),
      maxCap: 4 * (base.baseStats.atk ?? 0),
    }],
  };
}

export function createHuTaoDefinition(
  constellationLevel = huTao.constellationLevel,
  talentLevels: TalentLevels = huTao.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  const ascensionPhase = overrides.ascensionPhase ?? huTao.ascensionPhase;

  return {
    ...huTao,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    // Guide to Afterlife has no direct hit. Blood Blossom is a delayed mark
    // whose target/lifecycle event is not represented by the current engine.
    passives: huTao.passives.map((passive) =>
      passive.id === "hu-tao-a4" && ascensionPhase >= 4
        ? { ...passive, buffs: [sanguineRouge] }
        : passive,
    ),
    constellations: huTao.constellations.map((constellation) => {
      if (constellation.id === "hu-tao-c6") {
        return { ...constellation, buffs: level >= 6 ? [c6ButterflyEmbrace] : [] };
      }
      return constellation;
    }),
    skill: {
      ...huTao.skill,
      instances: [],
      stance: paramitaPapilio({ ...huTao, ...overrides, talentLevels }),
    },
  };
}

export const HU_TAO_KIT_METADATA = {
  paramitaDurationSeconds: PARAMITA_DURATION_SECONDS,
  hpToAtkAtTalentLevel10: talentValueAt(HP_TO_ATK, 10),
  hpToAtkBaseAtkCap: 4,
  sanguineRougePyroBonus: SANGUINE_ROUGE_PYRO_BONUS,
  c6CritRate: C6_CRIT_RATE,
  unsupportedChannels: [
    "a1ParamitaEndPartyCritRate",
    "c1ChargedAttackStaminaCost",
    "c2BloodBlossomMaxHpDamageAndBurstApplication",
    "c4BloodBlossomDefeatPartyCritRate",
    "c6FatalDamagePreventionAndResistance",
    "p3SuspiciousDishProc",
    "skillBloodBlossomDelayedMarkLifecycle",
  ],
} as const;

export const huTaoWithKit = createHuTaoDefinition();
