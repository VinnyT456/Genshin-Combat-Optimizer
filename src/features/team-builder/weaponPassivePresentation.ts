import type { DamageType, Element } from "@/types";
import type { StatConversionSourceStat, StatKey } from "@/simulation/buffs/types";
import type {
  GeneratedWeaponConversion,
  GeneratedWeaponEnemyModifier,
  GeneratedWeaponModifier,
} from "@/game-data/weapons/generated";
import type {
  WeaponPassiveDisplayKind,
  WeaponPassiveView,
} from "@/features/team-builder/weaponPresentation";

// ---------------------------------------------------------------------------
// Weapon passive presentation — Chinese rows for ONE resolved passive.
//
// WHAT THIS FIXES: the picker rendered a legacy prose blob under a blanket
// `仅展示，未接入模拟` label, for every weapon. That statement is wrong in two
// opposite directions at once. Six weapons (30 refinement rows) DO have their
// passive expressed as structured modifiers the engine consumes, so labelling
// them "not simulated" understates them; and the 725 unimplemented rows each
// carry their OWN `reason` explaining what is missing, which the blanket label
// discarded.
//
// `damageTypes` IS LOAD-BEARING and is rendered, never summarised away. Rust
// grants +40% to NORMAL ATTACKS only; presenting that as a bare "+40% 伤害加成"
// states a global bonus the weapon does not give. Every modifier row therefore
// carries its scope, and an unscoped grant says so explicitly rather than
// leaving the scope blank and letting the reader assume.
//
// Pure: no React, no DOM, no engine calls. No arithmetic beyond formatting a
// value that was already read from the table.
// ---------------------------------------------------------------------------

/** Chinese labels for the engine's stat vocabulary. */
const STAT_LABEL_ZH: Record<StatKey, string> = {
  atkPercent: "攻击力",
  atkFlat: "攻击力",
  hpPercent: "生命值",
  hpFlat: "生命值",
  defPercent: "防御力",
  defFlat: "防御力",
  elementalMastery: "元素精通",
  critRate: "暴击率",
  critDmg: "暴击伤害",
  energyRecharge: "元素充能效率",
  dmgBonus: "伤害加成",
  elementalDmgBonus: "元素伤害加成",
  reactionBonus: "反应伤害加成",
  flatDamageBonus: "额外伤害",
  baseDmgMultiplier: "基础伤害倍率",
};

/** Stat keys whose value is a flat number rather than a fraction. */
const FLAT_STAT_KEYS: ReadonlySet<StatKey> = new Set<StatKey>([
  "atkFlat",
  "hpFlat",
  "defFlat",
  "elementalMastery",
  "flatDamageBonus",
]);

const DAMAGE_TYPE_LABEL_ZH: Record<DamageType, string> = {
  normal: "普通攻击",
  charged: "重击",
  plunge: "下落攻击",
  skill: "元素战技",
  burst: "元素爆发",
  reaction: "元素反应",
};

const ELEMENT_LABEL_ZH: Record<Element, string> = {
  pyro: "火",
  hydro: "水",
  electro: "雷",
  cryo: "冰",
  anemo: "风",
  geo: "岩",
  dendro: "草",
  physical: "物理",
};

/** Scope text for a grant confined to specific damage types. */
export const UNSCOPED_SCOPE_ZH = "全部伤害";

const PERCENT_SCALE = 100;
const PERCENT_DECIMALS = 1;

/**
 * Formats a modifier value for display, INCLUDING its sign.
 *
 * Flat stats print as-is; fractional stats print as a percentage. A signed
 * format is required, not cosmetic: Rust's passive grants +40% Normal Attack
 * DMG and simultaneously takes away 10% Charged Attack DMG, and several other
 * weapons carry a downside term the same way. A caller that prefixed "+"
 * unconditionally would render the penalty as "+-10%"; one that dropped the
 * sign would render a penalty as a bonus.
 *
 * This is formatting of a value the table already published, not a damage
 * computation.
 */
export function formatModifierValue(stat: StatKey, value: number): string {
  const sign = value < 0 ? "-" : "+";
  const magnitude = Math.abs(value);
  if (FLAT_STAT_KEYS.has(stat)) return `${sign}${magnitude}`;
  const rounded = Number((magnitude * PERCENT_SCALE).toFixed(PERCENT_DECIMALS));
  return `${sign}${rounded}%`;
}

/**
 * The damage types a grant is confined to, in Chinese.
 *
 * Absent `damageTypes` means the source states no restriction, which is
 * rendered as an explicit "全部伤害" rather than an empty string: a blank scope
 * reads as "unknown", and the whole point of carrying this field is that the
 * difference between "Normal Attacks only" and "everything" is the difference
 * between Rust being correct and Rust being a global 40% damage lie.
 */
export function scopeLabelZh(
  damageTypes: readonly DamageType[] | undefined,
): string {
  if (damageTypes === undefined || damageTypes.length === 0) {
    return UNSCOPED_SCOPE_ZH;
  }
  return damageTypes.map((t) => DAMAGE_TYPE_LABEL_ZH[t]).join("、");
}

/** One structured grant, ready to render as a labelled row. */
export interface WeaponEffectRow {
  readonly id: string;
  /** e.g. `攻击力` or `火元素伤害加成`. */
  readonly label: string;
  /** e.g. `+40%`. */
  readonly value: string;
  /** e.g. `普通攻击` or `全部伤害`. Never blank. */
  readonly scope: string;
}

function modifierLabel(modifier: GeneratedWeaponModifier): string {
  if (modifier.stat === "elementalDmgBonus" && modifier.element !== undefined) {
    return `${ELEMENT_LABEL_ZH[modifier.element]}元素伤害加成`;
  }
  return STAT_LABEL_ZH[modifier.stat];
}

export function modifierRows(
  modifiers: readonly GeneratedWeaponModifier[],
): readonly WeaponEffectRow[] {
  return modifiers.map((modifier, index) => ({
    id: `mod-${index}`,
    label: modifierLabel(modifier),
    value: formatModifierValue(modifier.stat, modifier.value),
    scope: scopeLabelZh(modifier.damageTypes),
  }));
}

const CONVERSION_SOURCE_LABEL_ZH: Record<StatConversionSourceStat, string> = {
  atk: "攻击力",
  hp: "生命值",
  def: "防御力",
  elementalMastery: "元素精通",
  energyRecharge: "元素充能效率",
};

export function conversionRows(
  conversions: readonly GeneratedWeaponConversion[],
): readonly WeaponEffectRow[] {
  return conversions.map((conversion, index) => {
    const source = CONVERSION_SOURCE_LABEL_ZH[conversion.sourceStat];
    const target = STAT_LABEL_ZH[conversion.targetStat];
    const ratio = Number(
      (conversion.ratio * PERCENT_SCALE).toFixed(PERCENT_DECIMALS),
    );
    return {
      id: `conv-${index}`,
      label: `${source} 转化为 ${target}`,
      value: `${ratio}%`,
      scope: scopeLabelZh(conversion.damageTypes),
    };
  });
}

export function enemyModifierRows(
  enemyModifiers: readonly GeneratedWeaponEnemyModifier[],
): readonly WeaponEffectRow[] {
  return enemyModifiers.map((enemyModifier, index) => ({
    id: `enemy-${index}`,
    label: enemyModifierLabelZh(enemyModifier),
    value: `${Number(
      (enemyModifier.value * PERCENT_SCALE).toFixed(PERCENT_DECIMALS),
    )}%`,
    scope: UNSCOPED_SCOPE_ZH,
  }));
}

function enemyModifierLabelZh(
  enemyModifier: GeneratedWeaponEnemyModifier,
): string {
  const element = enemyModifier.element;
  if (element !== undefined) {
    return `${ELEMENT_LABEL_ZH[element]}元素抗性降低`;
  }
  return "抗性降低";
}

/**
 * Support copy for one passive at one refinement.
 *
 * The three kinds are mutually exclusive and each says a DIFFERENT thing:
 *
 * - `simulated`   the structured effects below are in the run.
 * - `not-simulated` the numbers were read but no channel expresses them; the
 *   generator's own `reason` is surfaced verbatim instead of a generic apology.
 * - `unverified`  the sources disagreed or no number was readable, so only the
 *   prose is shown and nothing is claimed about it.
 */
export interface WeaponPassiveSupport {
  readonly kind: WeaponPassiveDisplayKind;
  readonly label: string;
  readonly state: "success" | "warning" | "info";
  /** Generator-supplied explanation. Present only when not simulated. */
  readonly reason?: string;
}

export const PASSIVE_SUPPORT_LABEL_ZH: Record<
  WeaponPassiveDisplayKind,
  string
> = {
  simulated: "已接入模拟",
  "not-simulated": "尚未接入模拟",
  unverified: "数值待核实",
};

const PASSIVE_SUPPORT_STATE: Record<
  WeaponPassiveDisplayKind,
  WeaponPassiveSupport["state"]
> = {
  simulated: "success",
  "not-simulated": "warning",
  unverified: "info",
};

export function passiveSupport(
  passive: WeaponPassiveView,
): WeaponPassiveSupport {
  return {
    kind: passive.kind,
    label: PASSIVE_SUPPORT_LABEL_ZH[passive.kind],
    state: PASSIVE_SUPPORT_STATE[passive.kind],
    ...(passive.kind === "simulated" || passive.reason === undefined
      ? {}
      : { reason: passive.reason }),
  };
}

/**
 * Every structured row for a passive, in a stable render order.
 *
 * Empty for an unimplemented or unverified passive — those have prose and a
 * reason, not effects. A caller rendering an empty list must show the prose and
 * the support label, never an empty panel implying nothing was found.
 */
export function passiveEffectRows(
  passive: WeaponPassiveView,
): readonly WeaponEffectRow[] {
  return [
    ...modifierRows(passive.modifiers),
    ...conversionRows(passive.conversions),
    ...enemyModifierRows(passive.enemyModifiers),
  ];
}
