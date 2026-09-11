import type { CharacterDefinition, Stats } from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { ActiveBuff, Buff } from "@/simulation/buffs/types";
import { foldBuffsIntoStats } from "@/simulation/buffs/resolver";
import {
  harvestCharacterEquipmentBuffs,
  type CharacterEquipmentBuffs,
} from "@/simulation/engine/equipmentBuffs";
import { harvestCharacterPerkBuffs } from "@/simulation/engine/perkBuffs";
import { equipmentConfig } from "@/features/simulation/equipmentAdapter";
import type { CharacterEquipmentSelection } from "@/features/team-builder/equipmentSelection";

/** A legacy or generic character accepted by the team builder. */
type AnyCharacter = CharacterDefinition | GenericCharacterDefinition;

type WebsiteCharacter = CharacterDefinition & {
  readonly engineDefinition: GenericCharacterDefinition;
};

/**
 * Read-only values shown in the build editor before a rotation runs.
 *
 * `stats` contains gear stats plus permanent, self-applicable modifiers. Time,
 * resource, HP, enemy-aura and action-scoped effects stay out of this snapshot;
 * the combat engine resolves them at each hit. This prevents a conditional
 * passive from being shown as permanent while still making the panel agree with
 * the engine for the deterministic initial state.
 */
export interface InitialStatsPreview {
  readonly stats: Stats;
  readonly permanentBuffs: number;
  readonly conditionalBuffs: number;
}

function appliesToCharacter(buff: Buff, characterId: string): boolean {
  switch (buff.targets.scope) {
    case "party":
      return true;
    case "active":
      // The preview describes this character as the prospective active unit.
      return true;
    case "self":
      return buff.sourceCharacterId === characterId;
    case "characters":
      return buff.targets.characterIds?.includes(characterId) ?? false;
  }
}

function isPermanentPanelBuff(buff: Buff, characterId: string): boolean {
  return (
    buff.conditions === undefined &&
    buff.startTime <= 0 &&
    buff.duration > 0 &&
    appliesToCharacter(buff, characterId) &&
    ((buff.modifiers?.length ?? 0) > 0 || (buff.conversions?.length ?? 0) > 0)
  );
}

function attachSource(
  buffs: readonly Buff[],
  characterId: string,
): readonly Buff[] {
  return buffs.map((buff) => ({
    ...buff,
    sourceCharacterId: buff.sourceCharacterId ?? characterId,
  }));
}

function engineDefinitionOf(
  character: AnyCharacter | WebsiteCharacter,
): GenericCharacterDefinition | undefined {
  if ("normalAttacks" in character) return character;
  if ("engineDefinition" in character) return character.engineDefinition;
  return undefined;
}

function baseForPreview(stats: Stats, intrinsic: Stats | undefined): Stats {
  if (stats.base !== undefined) return stats;
  return {
    ...stats,
    base: {
      atk: intrinsic?.atk ?? stats.atk,
      hp: intrinsic?.hp ?? stats.hp,
      def: intrinsic?.def ?? stats.def,
    },
  };
}

/**
 * Resolve the initial panel from the same equipment and perk data used by the
 * simulation. Conditional buffs are counted for the UI note, but never folded
 * into `stats`, because their value depends on the rotation state.
 */
export function resolveInitialStatsPreview(input: {
  readonly character: AnyCharacter;
  readonly intrinsicCharacter?: AnyCharacter | null;
  readonly selection?: CharacterEquipmentSelection;
}): InitialStatsPreview {
  const { character, intrinsicCharacter, selection = {} } = input;
  const characterId = character.id;
  const fields = equipmentConfig(
    [
      {
        id: characterId,
        stats: character.baseStats,
        intrinsicStats: intrinsicCharacter?.baseStats,
      },
    ],
    { [characterId]: selection },
  );
  const equippedStats = baseForPreview(
    fields.equippedStats?.[characterId] ?? character.baseStats,
    intrinsicCharacter?.baseStats,
  );

  const equipmentEntry = fields.equipmentBuffs?.[characterId] as
    | CharacterEquipmentBuffs
    | undefined;
  const equipmentBuffs = equipmentEntry
    ? attachSource(harvestCharacterEquipmentBuffs(equipmentEntry), characterId)
    : [];
  const engineDefinition = engineDefinitionOf(character);
  const perkBuffs = engineDefinition
    ? attachSource(harvestCharacterPerkBuffs(engineDefinition), characterId)
    : [];
  const allBuffs = [...equipmentBuffs, ...perkBuffs];
  const permanent = allBuffs.filter((buff) =>
    isPermanentPanelBuff(buff, characterId),
  );
  const conditionalBuffs = allBuffs.length - permanent.length;
  const active: ActiveBuff[] = permanent.map((buff) => ({ buff, stacks: 1 }));

  return {
    stats: foldBuffsIntoStats(equippedStats, active, {
      [characterId]: equippedStats.base,
    }),
    permanentBuffs: permanent.length,
    conditionalBuffs,
  };
}
