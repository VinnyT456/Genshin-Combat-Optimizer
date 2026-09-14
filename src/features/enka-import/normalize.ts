import { isValidEnkaUid } from "./contracts";
import type { ArtifactSlot } from "@/simulation/character/equipment";

export interface NormalizedEnkaArtifactStat {
  readonly propId: string;
  /** Enka publishes percentage stats in percentage points (e.g. 5.8). */
  readonly value: number;
}

export interface NormalizedEnkaArtifact {
  readonly setId: number;
  readonly slot: ArtifactSlot;
  readonly mainStat?: NormalizedEnkaArtifactStat;
  readonly substats: readonly NormalizedEnkaArtifactStat[];
}

export interface NormalizedEnkaCharacter {
  readonly avatarId: number;
  readonly level: number;
  readonly constellation: number;
  readonly talents?: { normal: number; skill: number; burst: number };
  readonly weapon?: { itemId: number; level: number; refinement: number };
  readonly artifactCount: number;
  readonly artifacts: readonly NormalizedEnkaArtifact[];
}
export interface NormalizedEnkaPayload {
  readonly characters: readonly NormalizedEnkaCharacter[];
  /** Enka's cache lifetime, in seconds, when the upstream supplied it. */
  readonly ttlSeconds?: number;
}

function numericValue(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  const object = record(value);
  if (object === null) return undefined;
  // Enka prop entries use `val` for the display value and `ival` for the
  // integer value. Both are strings in real responses.
  return numericValue(object.val) ?? numericValue(object.ival);
}

function boundedInt(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = numericValue(value);
  return numeric !== undefined && Number.isInteger(numeric) && numeric >= min && numeric <= max ? numeric : fallback;
}
function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function artifactSlot(value: unknown): ArtifactSlot | undefined {
  switch (value) {
    case "EQUIP_BRACER": return "flower";
    case "EQUIP_NECKLACE": return "plume";
    case "EQUIP_SHOES": return "sands";
    case "EQUIP_RING": return "goblet";
    case "EQUIP_DRESS": return "circlet";
    default: return undefined;
  }
}

function artifactStat(value: unknown): NormalizedEnkaArtifactStat | undefined {
  const item = record(value);
  const propId = item?.mainPropId ?? item?.appendPropId;
  const statValue = numericValue(item?.statValue);
  return typeof propId === "string" && statValue !== undefined
    ? { propId, value: Number(statValue.toFixed(1)) }
    : undefined;
}

function normalizeArtifact(value: unknown): NormalizedEnkaArtifact | undefined {
  const item = record(value);
  const flat = record(item?.flat);
  const reliquary = record(item?.reliquary);
  const setId = numericValue(flat?.setId);
  const slot = artifactSlot(flat?.equipType);
  if (setId === undefined || !Number.isInteger(setId) || slot === undefined || reliquary === null) {
    return undefined;
  }
  const mainStat = artifactStat(flat?.reliquaryMainstat);
  const rawSubstats = Array.isArray(flat?.reliquarySubstats) ? flat.reliquarySubstats : [];
  return {
    setId,
    slot,
    ...(mainStat === undefined ? {} : { mainStat }),
    substats: rawSubstats.map(artifactStat).filter((stat): stat is NormalizedEnkaArtifactStat => stat !== undefined),
  };
}

function talentLevelsFromSkillMap(skillLevelMap: Record<string, unknown> | null): { normal: number; skill: number; burst: number } | undefined {
  if (skillLevelMap === null) return undefined;
  const explicit = [skillLevelMap["1"], skillLevelMap["2"], skillLevelMap["3"]];
  const values = explicit.every((value) => value !== undefined)
    ? explicit
    : Object.entries(skillLevelMap)
        .filter(([key]) => /^\d+$/.test(key))
        .sort(([a], [b]) => Number(a) - Number(b))
        .slice(0, 3)
        .map(([, value]) => value);
  if (values.length !== 3) return undefined;
  return {
    normal: boundedInt(values[0], 1, 15, 1),
    skill: boundedInt(values[1], 1, 15, 1),
    burst: boundedInt(values[2], 1, 15, 1),
  };
}

export function normalizeEnkaPayload(payload: unknown): NormalizedEnkaPayload {
  const root = record(payload);
  const list = root?.avatarInfoList;
  const ttl = numericValue(root?.ttl);
  const ttlSeconds = ttl !== undefined && Number.isFinite(ttl) && ttl >= 0 ? ttl : undefined;
  if (!Array.isArray(list)) return { characters: [], ...(ttlSeconds === undefined ? {} : { ttlSeconds }) };
  const characters: NormalizedEnkaCharacter[] = [];
  for (const raw of list) {
    const item = record(raw);
    if (item === null) continue;
    const avatarId = item?.avatarId;
    if (typeof avatarId !== "number" || !Number.isInteger(avatarId)) continue;
    const propMap = record(item.propMap);
    // `skillLevelMap` is the documented field. Keep the legacy fallback so a
    // previously saved fixture using the old name remains readable.
    const skillLevelMap = record(item.skillLevelMap) ?? record(item.talentIdMap);
    const talents = talentLevelsFromSkillMap(skillLevelMap);
    const equipList = Array.isArray(item.equipList) ? item.equipList : [];
    const weaponRaw = equipList.map(record).find((equip) => equip?.weapon !== undefined);
    const weapon = record(weaponRaw?.weapon);
    const itemId = weaponRaw?.itemId;
    const artifactItems = equipList.filter((equip) => record(equip)?.reliquary !== undefined);
    characters.push({
      avatarId,
      level: boundedInt(propMap?.["4001"], 1, 100, 1),
      constellation: boundedInt(item.talentIdList instanceof Array ? item.talentIdList.length : 0, 0, 6, 0),
      ...(talents === undefined ? {} : { talents }),
      ...(typeof itemId === "number" && weapon ? { weapon: {
        itemId,
        level: boundedInt(weapon.level, 1, 90, 1),
        // affixMap stores the refinement index as its value: 0 = R1.
        refinement: boundedInt(
          weapon.affixMap === undefined ? 0 : Object.values(record(weapon.affixMap) ?? {})[0],
          0,
          4,
          0,
        ) + 1,
      } } : {}),
      artifactCount: artifactItems.length,
      artifacts: artifactItems.map(normalizeArtifact).filter((artifact): artifact is NormalizedEnkaArtifact => artifact !== undefined),
    });
  }
  return { characters, ...(ttlSeconds === undefined ? {} : { ttlSeconds }) };
}

export { isValidEnkaUid };
