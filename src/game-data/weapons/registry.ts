import type { WeaponDefinition, WeaponSubStatType, WeaponType } from "./types";
import { generatedWeaponsById } from "./generated";
import { weaponsData } from "./weaponsData";

/**
 * Build the website-facing record from the generated combat row and the
 * legacy display catalog.  The latter still owns bilingual labels, icons and
 * passive prose; it must never provide base ATK or substat numbers.
 *
 * A missing generated row is omitted rather than falling back to an
 * unverified legacy combat value.  This keeps the live registry fail-closed
 * while old display metadata remains available for matched IDs.
 */
function toGeneratedDefinition(legacy: WeaponDefinition): WeaponDefinition | null {
  const generated = generatedWeaponsById.get(legacy.id);
  if (!generated) return null;

  const baseAtk = generated.baseAtkByLevel[90];
  if (baseAtk === undefined) return null;

  const substat = generated.substat;
  const substatValue = substat?.valueByLevel[90];
  if (substat && substatValue === undefined) return null;

  // `dmgBonus` is the generated engine channel for a physical weapon
  // substat. The legacy display type keeps the narrower public vocabulary so
  // the existing equipment adapter continues to map physical damage onto the
  // generic damage channel deliberately.
  const substatType = substat ? legacySubstatType(substat.stat) : "none";
  if (substatType === null) return null;
  const subStat = substat
    ? { type: substatType, value: substatValue!, labelZh: legacy.subStat.labelZh }
    : { type: "none" as const, value: 0, labelZh: "无" };

  return {
    // Copy the legacy catalog's presentation fields explicitly. This keeps a
    // future combat-shaped field added to the legacy catalog from becoming a
    // second (unverified) source through an object spread.
    id: legacy.id,
    name: legacy.name,
    nameZh: legacy.nameZh,
    weaponType: legacy.weaponType,
    rarity: legacy.rarity,
    iconUrl: legacy.iconUrl,
    ...(legacy.version === undefined ? {} : { version: legacy.version }),
    ...(legacy.versionWeight === undefined
      ? {}
      : { versionWeight: legacy.versionWeight }),
    ...(legacy.passive === undefined ? {} : { passive: legacy.passive }),
    baseAtk,
    subStat,
    dataSource: "generated",
    generatedId: generated.id,
  };
}

function legacySubstatType(stat: string): WeaponSubStatType | null {
  if (stat === "dmgBonus") return "physicalDmg";
  switch (stat) {
    case "critRate":
    case "critDmg":
    case "atkPercent":
    case "energyRecharge":
    case "elementalMastery":
    case "hpPercent":
    case "defPercent":
      return stat;
    default:
      return null;
  }
}

export const allWeapons: readonly WeaponDefinition[] = weaponsData
  .map(toGeneratedDefinition)
  .filter((weapon): weapon is WeaponDefinition => weapon !== null);

export const weaponsById: ReadonlyMap<string, WeaponDefinition> = new Map(
  allWeapons.map((w) => [w.id, w]),
);

export function findWeapon(id: string): WeaponDefinition | undefined {
  return weaponsById.get(id.toLowerCase().replace(/[^a-z0-9]/g, ""));
}

export function getWeaponsByType(type: WeaponType): readonly WeaponDefinition[] {
  return allWeapons.filter((w) => w.weaponType === type);
}

const DEFAULT_WEAPONS: Record<WeaponType, string> = {
  sword: "mistsplitterreforged",
  claymore: "wolfsgravestone",
  polearm: "staffofhoma",
  catalyst: "kagurasverity",
  bow: "aquasimulacra",
};

export function getDefaultWeapon(weaponType: WeaponType): WeaponDefinition {
  const defId = DEFAULT_WEAPONS[weaponType];
  const found = findWeapon(defId);
  if (found) return found;
  const anyOfType = getWeaponsByType(weaponType)[0];
  if (anyOfType) return anyOfType;
  return allWeapons[0]!;
}

/** Resolve the full generated row for a selected website weapon. */
export function findGeneratedWeapon(id: string) {
  const weapon = findWeapon(id);
  return weapon?.generatedId
    ? generatedWeaponsById.get(weapon.generatedId)
    : undefined;
}

/** Resolve only base ATK when a generated row has no substat value at a level. */
export function findWeaponBaseAtkAtLevel(
  id: string,
  level: number,
): number | undefined {
  const weapon = findWeapon(id);
  const generated = weapon?.generatedId
    ? generatedWeaponsById.get(weapon.generatedId)
    : undefined;
  if (!weapon || !generated || !Number.isInteger(level) || level < 1 || level > 90) {
    return undefined;
  }
  return generated.baseAtkByLevel[level];
}

/**
 * Resolve the sourced combat stats at an exact weapon level.
 *
 * The website catalog intentionally exposes level-90 values for its compact
 * card shape, but the generated record retains the complete verified curves.
 * Consumers that simulate a non-90 weapon must use this seam instead of
 * silently reusing the level-90 projection.  A missing generated table entry
 * is reported as `undefined`; it is never interpolated or substituted.
 */
export function findWeaponStatsAtLevel(
  id: string,
  level: number,
): { readonly baseAtk: number; readonly subStat: WeaponDefinition["subStat"] } | undefined {
  const weapon = findWeapon(id);
  const generated = weapon?.generatedId
    ? generatedWeaponsById.get(weapon.generatedId)
    : undefined;
  const baseAtk = findWeaponBaseAtkAtLevel(id, level);
  if (!weapon || !generated || baseAtk === undefined) {
    return undefined;
  }
  const generatedSubstat = generated.substat;
  if (!generatedSubstat) {
    return {
      baseAtk,
      subStat: { type: "none", value: 0, labelZh: "无" },
    };
  }
  const value = generatedSubstat.valueByLevel[level];
  if (value === undefined) return undefined;
  const type = legacySubstatType(generatedSubstat.stat);
  if (type === null) return undefined;
  return {
    baseAtk,
    subStat: { type, value, labelZh: weapon.subStat.labelZh },
  };
}
