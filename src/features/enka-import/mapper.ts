import { allCharacters } from "@/game-data";
import { allArtifacts } from "@/game-data/artifacts/registry";
import { toLegacyCharacterDefinition } from "@/game-data/characters/registry";
import { findWeapon } from "@/game-data/weapons/registry";
import { statsAtLevel } from "@/features/team-builder/characterProgression";
import { equipArtifactLoadout } from "@/features/team-builder/equipmentSelection";
import type { ArtifactLoadout, EquipmentStat } from "@/simulation/character/equipment";
import type { Element } from "@/types";
import type { EnkaCharacterPreview, EnkaImportPreview } from "./contracts";
import type { NormalizedEnkaArtifact, NormalizedEnkaPayload } from "./normalize";
import { CHARACTER_ID_BY_ENKA_ID, WEAPON_ID_BY_ENKA_ID } from "./mappings";

function artifactEquipmentStat(propId: string, value: number): EquipmentStat | undefined {
  const percentage = value / 100;
  const elemental: Readonly<Record<string, Element>> = {
    FIGHT_PROP_PHYSICAL_ADD_HURT: "physical",
    FIGHT_PROP_FIRE_ADD_HURT: "pyro",
    FIGHT_PROP_WATER_ADD_HURT: "hydro",
    FIGHT_PROP_ELEC_ADD_HURT: "electro",
    FIGHT_PROP_WIND_ADD_HURT: "anemo",
    FIGHT_PROP_ICE_ADD_HURT: "cryo",
    FIGHT_PROP_ROCK_ADD_HURT: "geo",
    FIGHT_PROP_GRASS_ADD_HURT: "dendro",
  };
  const element = elemental[propId];
  if (element !== undefined) return { stat: "elementalDmgBonus", element, value: percentage };
  switch (propId) {
    case "FIGHT_PROP_HP": return { stat: "hpFlat", value };
    case "FIGHT_PROP_ATTACK": return { stat: "atkFlat", value };
    case "FIGHT_PROP_DEFENSE": return { stat: "defFlat", value };
    case "FIGHT_PROP_HP_PERCENT": return { stat: "hpPercent", value: percentage };
    case "FIGHT_PROP_ATTACK_PERCENT": return { stat: "atkPercent", value: percentage };
    case "FIGHT_PROP_DEFENSE_PERCENT": return { stat: "defPercent", value: percentage };
    case "FIGHT_PROP_CRITICAL": return { stat: "critRate", value: percentage };
    case "FIGHT_PROP_CRITICAL_HURT": return { stat: "critDmg", value: percentage };
    case "FIGHT_PROP_CHARGE_EFFICIENCY": return { stat: "energyRecharge", value: percentage };
    case "FIGHT_PROP_ELEMENTAL_MASTERY": return { stat: "elementalMastery", value };
    default: return undefined;
  }
}

function mapArtifactLoadout(artifacts: readonly NormalizedEnkaArtifact[]): {
  readonly loadout?: ArtifactLoadout;
  readonly skipped: number;
} {
  const loadout: ArtifactLoadout = {};
  let skipped = 0;
  for (const artifact of artifacts) {
    const set = allArtifacts.find((candidate) => candidate.setId === artifact.setId);
    const mainStat = artifact.mainStat === undefined
      ? undefined
      : artifactEquipmentStat(artifact.mainStat.propId, artifact.mainStat.value);
    if (set === undefined || mainStat === undefined || loadout[artifact.slot] !== undefined) {
      skipped += 1;
      continue;
    }
    loadout[artifact.slot] = {
      slot: artifact.slot,
      setId: set.id,
      mainStat,
      substats: artifact.substats
        .map((stat) => artifactEquipmentStat(stat.propId, stat.value))
        .filter((stat): stat is EquipmentStat => stat !== undefined),
    };
  }
  return { ...(Object.keys(loadout).length === 0 ? {} : { loadout }), skipped };
}

export function mapEnkaPayload(payload: NormalizedEnkaPayload, uid: string, fetchedAt = new Date().toISOString(), ttlSeconds = 60): EnkaImportPreview {
  const byId = new Map(allCharacters.map((c) => [c.id, c]));
  const characters: EnkaCharacterPreview[] = payload.characters.map((entry, index) => {
    const id = CHARACTER_ID_BY_ENKA_ID[entry.avatarId];
    const source = id === undefined ? undefined : byId.get(id);
    const issues = id === undefined ? ["角色 ID 未在本地支持映射中，无法导入"] : source === undefined ? ["本地角色数据不可用，无法导入"] : [];
    // Generated character definitions keep level-90 base stats as a snapshot;
    // resolve the imported level from the verified curve before adapting to
    // the legacy page shape. Merely changing `level` would simulate a level-1
    // character with level-90 HP/ATK/DEF.
    const sourceAtLevel = source === undefined ? undefined : {
      ...source,
      level: entry.level,
      baseStats: statsAtLevel(source, source.baseStats, entry.level),
      constellationLevel: entry.constellation,
      ...(entry.talents ? { talentLevels: entry.talents } : {}),
    };
    const character = sourceAtLevel === undefined ? null : toLegacyCharacterDefinition(sourceAtLevel);
    const mappedWeaponId = entry.weapon === undefined ? undefined : WEAPON_ID_BY_ENKA_ID[entry.weapon.itemId];
    const weapon = mappedWeaponId === undefined ? undefined : findWeapon(mappedWeaponId);
    if (entry.weapon !== undefined && weapon === undefined) issues.push("武器 ID 未映射，已省略武器");
    const artifactResult = mapArtifactLoadout(entry.artifacts);
    if (entry.artifactCount > 0 && artifactResult.loadout === undefined) issues.push("圣遗物属性未映射，已保留推荐配置");
    else if (artifactResult.skipped > 0) issues.push(`有 ${artifactResult.skipped} 件圣遗物属性未映射`);
    const artifactSelection = artifactResult.loadout === undefined || character === null
      ? undefined
      : equipArtifactLoadout({}, character.id, artifactResult.loadout)[character.id];
    const equipment = weapon === undefined && artifactSelection === undefined
      ? undefined
      : {
          ...(weapon === undefined ? {} : { weaponId: weapon.id, weaponLevel: entry.weapon!.level, refinement: entry.weapon!.refinement as 1 | 2 | 3 | 4 | 5 }),
          ...(artifactSelection === undefined ? {} : artifactSelection),
        };
    return {
      key: `${entry.avatarId}-${index}`,
      ...(character ? { character } : {}),
      portraitId: id ?? `unknown-${entry.avatarId}`,
      constellation: entry.constellation,
      ...(entry.talents ? { talents: entry.talents } : {}),
      ...(weapon ? { weapon: { id: weapon.id, level: entry.weapon!.level, refinement: entry.weapon!.refinement, name: weapon.nameZh } } : {}),
      ...(equipment === undefined ? {} : { equipment }),
      artifactSummary: artifactResult.loadout === undefined
        ? (entry.artifactCount ? `圣遗物：${entry.artifactCount} 件（属性未导入）` : "圣遗物：未提供")
        : `圣遗物：${Object.keys(artifactResult.loadout).length} 件（主/副词条已导入）`,
      issues,
      selectable: character !== null,
    };
  });
  return { uid, characters, fetchedAt, ttlSeconds, expiresAt: new Date(Date.parse(fetchedAt) + ttlSeconds * 1000).toISOString() };
}
