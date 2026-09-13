import type { EquipmentStat, EquipmentStatKey } from "@/simulation/character/equipment";
import type { SubstatToken } from "./buildAuthoring";

/**
 * Rounded five-star artifact substat roll increments, in the values shown to
 * players. Percentage stats use percentage points; flat stats and EM use raw
 * points. Fandom's table lists the same four tiers as 70/80/90/100% of the
 * highest possible roll, with the displayed values rounded to one decimal.
 */
export const ARTIFACT_SUBSTAT_ROLL_VALUES: Readonly<
  Record<SubstatToken, readonly number[]>
> = {
  HP: [209.1, 239.0, 268.9, 298.8],
  ATK: [13.6, 15.6, 17.5, 19.5],
  DEF: [16.2, 18.5, 20.8, 23.2],
  "HP%": [4.1, 4.7, 5.3, 5.8],
  "ATK%": [4.1, 4.7, 5.3, 5.8],
  "DEF%": [5.1, 5.8, 6.6, 7.3],
  EM: [16.3, 18.7, 21.0, 23.3],
  "ER%": [4.5, 5.2, 5.8, 6.5],
  crit_rate: [2.7, 3.1, 3.5, 3.9],
  crit_dmg: [5.4, 6.2, 7.0, 7.8],
};

const PERCENT_SUBSTATS = new Set<SubstatToken>([
  "HP%",
  "ATK%",
  "DEF%",
  "ER%",
  "crit_rate",
  "crit_dmg",
]);

/** Theoretical best value in the equipment model's units. */
export const THEORETICAL_BEST_SUBSTAT_VALUE: Readonly<
  Record<SubstatToken, number>
> = Object.fromEntries(
  Object.entries(ARTIFACT_SUBSTAT_ROLL_VALUES).map(([token, values]) => [
    token,
    equipmentValueForRoll(
      token as SubstatToken,
      values[values.length - 1] ?? 0,
    ),
  ]),
) as Record<SubstatToken, number>;

/**
 * Game8 uses character-specific evaluation values. The authored KQM arrays
 * already contain the character-specific ordering, so the deterministic
 * baseline uses the same common evaluation buckets in that order.
 */
const EVALUATION_BY_PRIORITY = [1, 0.7, 0.5, 0.3, 0.2] as const;

/** Four existing lines plus five upgrades: [2, 1, 1, 1] upgrades by line. */
const BASELINE_ROLL_COUNTS = [3, 2, 2, 2] as const;

/** A strong but non-perfect deterministic roll pattern for each line. */
const BASELINE_ROLL_TIERS = [2, 1, 2, 1, 2] as const;

/** Fills the fourth line when a character has fewer than four authored priorities. */
const FALLBACK_SUBSTAT_PRIORITIES: readonly SubstatToken[] = [
  "crit_rate",
  "crit_dmg",
  "ATK%",
  "ER%",
  "EM",
  "HP%",
  "DEF%",
  "ATK",
  "HP",
  "DEF",
];

const SUBSTAT_TO_EQUIPMENT_STAT: Readonly<
  Record<SubstatToken, EquipmentStatKey>
> = {
  HP: "hpFlat",
  ATK: "atkFlat",
  DEF: "defFlat",
  "HP%": "hpPercent",
  "ATK%": "atkPercent",
  "DEF%": "defPercent",
  EM: "elementalMastery",
  "ER%": "energyRecharge",
  crit_rate: "critRate",
  crit_dmg: "critDmg",
};

const EQUIPMENT_STAT_TO_SUBSTAT: Readonly<
  Partial<Record<EquipmentStatKey, SubstatToken>>
> = {
  hpFlat: "HP",
  atkFlat: "ATK",
  defFlat: "DEF",
  hpPercent: "HP%",
  atkPercent: "ATK%",
  defPercent: "DEF%",
  elementalMastery: "EM",
  energyRecharge: "ER%",
  critRate: "crit_rate",
  critDmg: "crit_dmg",
};

function evaluationForPriority(index: number): number {
  return EVALUATION_BY_PRIORITY[Math.min(index, EVALUATION_BY_PRIORITY.length - 1)] ?? 0;
}

function substatTokenForEquipmentStat(
  stat: EquipmentStat,
): SubstatToken | undefined {
  return EQUIPMENT_STAT_TO_SUBSTAT[stat.stat];
}

function equipmentValueForRoll(token: SubstatToken, displayValue: number): number {
  return PERCENT_SUBSTATS.has(token)
    ? Number((displayValue / 100).toFixed(3))
    : displayValue;
}

function roundedEquipmentValue(token: SubstatToken, value: number): number {
  const displayValue = PERCENT_SUBSTATS.has(token) ? value * 100 : value;
  return equipmentValueForRoll(token, Number(displayValue.toFixed(1)));
}

/** Return the four legal five-star increments for the selected stat. */
export function artifactSubstatRollOptions(
  stat: EquipmentStat | undefined,
): readonly number[] {
  const token = stat ? substatTokenForEquipmentStat(stat) : undefined;
  if (token === undefined) return [];
  return ARTIFACT_SUBSTAT_ROLL_VALUES[token].map((value) =>
    equipmentValueForRoll(token, value),
  );
}

/**
 * Add one legal five-star substat roll. This is deliberately discrete: a
 * CRIT DMG row can only gain +5.4, +6.2, +7.0 or +7.8 percentage points.
 */
export function addArtifactSubstatRoll(
  stat: EquipmentStat,
  rollIndex: number,
): EquipmentStat | undefined {
  const token = substatTokenForEquipmentStat(stat);
  const roll = token === undefined ? undefined : ARTIFACT_SUBSTAT_ROLL_VALUES[token][rollIndex];
  if (token === undefined || roll === undefined) return undefined;

  return {
    ...stat,
    value: roundedEquipmentValue(
      token,
      stat.value + equipmentValueForRoll(token, roll),
    ),
  };
}

function roundedDisplayTotal(values: readonly number[]): number {
  return Number(values.reduce((total, value) => total + value, 0).toFixed(1));
}

function baselineSubstatValue(token: SubstatToken, rollCount: number): number {
  const increments = ARTIFACT_SUBSTAT_ROLL_VALUES[token];
  const displayTotal = roundedDisplayTotal(
    Array.from({ length: rollCount }, (_, index) =>
      increments[BASELINE_ROLL_TIERS[index % BASELINE_ROLL_TIERS.length]!] ?? 0,
    ),
  );
  return equipmentValueForRoll(token, displayTotal);
}

/**
 * Score the substats on one artifact piece using a build's ordered priorities.
 * `mainStat` is excluded because the same stat cannot appear as a substat on a
 * real artifact. The return value is the Game8-style substat score (0–300+),
 * without main-stat or set multipliers.
 */
export function scoreArtifactSubstats(
  substats: readonly EquipmentStat[],
  priorities: readonly SubstatToken[],
  mainStat?: EquipmentStat,
): number {
  const excluded = mainStat ? substatTokenForEquipmentStat(mainStat) : undefined;
  const availablePriorities = priorities.filter((token) => token !== excluded);

  const score = substats.reduce((total, substat) => {
    const token = substatTokenForEquipmentStat(substat);
    if (token === undefined) return total;
    const priorityIndex = availablePriorities.indexOf(token);
    if (priorityIndex < 0) return total;

    return (
      total +
      (substat.value / THEORETICAL_BEST_SUBSTAT_VALUE[token]) *
        evaluationForPriority(priorityIndex) *
        50
    );
  }, 0);

  return Math.round(score * 10) / 10;
}

function mainStatTokenForEquipmentStat(
  stat: EquipmentStat | undefined,
): SubstatToken | undefined {
  return stat === undefined || stat.value === 0
    ? undefined
    : EQUIPMENT_STAT_TO_SUBSTAT[stat.stat];
}

/**
 * Create a deterministic, legal level-20 comparison baseline for one artifact
 * piece. It starts with four lines and distributes five upgrades as [2, 1, 1,
 * 1], so every line is upgraded at least once. More rolls can be added later
 * only through `addArtifactSubstatRoll`.
 */
export function baselineArtifactSubstats(
  priorities: readonly SubstatToken[] | undefined,
  mainStat?: EquipmentStat,
): readonly EquipmentStat[] {
  if (priorities === undefined || priorities.length === 0) return [];

  const excluded = mainStatTokenForEquipmentStat(mainStat);
  const selected: SubstatToken[] = [];
  for (const token of [...priorities, ...FALLBACK_SUBSTAT_PRIORITIES]) {
    if (token === excluded || selected.includes(token)) continue;
    selected.push(token);
    if (selected.length === BASELINE_ROLL_COUNTS.length) break;
  }

  return selected.map((token, index) => ({
    stat: SUBSTAT_TO_EQUIPMENT_STAT[token],
    value: baselineSubstatValue(token, BASELINE_ROLL_COUNTS[index] ?? 2),
  }));
}
