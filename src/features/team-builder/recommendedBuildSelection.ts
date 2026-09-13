import type { CharacterDefinition } from "@/types";
import type { WeaponDefinition } from "@/game-data/weapons/types";
import { findWeapon, getDefaultWeapon } from "@/game-data/weapons/registry";
import {
  baseBuildArtifactLoadout,
  recommendedBuildFor,
  type BaseBuild,
} from "@/game-data/characters/recommendedBuilds";
import { getCharacterMetadata } from "@/features/team-builder/rosterModel";
import { applyWeaponStats } from "@/features/team-builder/weaponModel";
import {
  DEFAULT_REFINEMENT,
  DEFAULT_WEAPON_LEVEL,
  equipArtifactLoadout,
  equipWeapon,
  selectionFor,
  type EquipmentSelections,
} from "@/features/team-builder/equipmentSelection";

/** The resolved baseline used when a character enters the team. */
export interface RecommendedBuildResolution {
  readonly build: BaseBuild | undefined;
  readonly weapon: WeaponDefinition;
}

/** Resolve the authored recommended build, then fall back to the weapon-type default. */
export function resolveRecommendedBuild(
  character: CharacterDefinition,
): RecommendedBuildResolution {
  const build = recommendedBuildFor(character.id);
  const weapon =
    (build ? findWeapon(build.weaponId) : undefined) ??
    getDefaultWeapon(
      character.weaponType ?? getCharacterMetadata(character.id).weaponType,
    );
  return { build, weapon };
}

/**
 * Creates the character snapshot used by a newly selected team slot.
 *
 * The lossless engine kit already lives on `engineDefinition`; this function
 * applies only the resolved starter weapon to the legacy stats snapshot. The
 * complete equipment selection is returned separately for the simulation
 * adapter, so UI state and engine state start from the same baseline.
 */
export function prepareCharacterWithRecommendedBuild(
  character: CharacterDefinition,
): RecommendedBuildResolution & { readonly character: CharacterDefinition } {
  const resolved = resolveRecommendedBuild(character);
  return {
    ...resolved,
    character: {
      ...character,
      baseStats: applyWeaponStats(
        character.baseStats,
        resolved.weapon,
        DEFAULT_WEAPON_LEVEL,
      ),
    },
  };
}

/**
 * Adds a character's recommended baseline to selections without overwriting
 * an explicit user choice. A completely new character receives its authored
 * weapon plus five-piece artifact loadout; partial legacy state is completed
 * only where a field is absent.
 */
export function mergeRecommendedBuildEquipment(
  selections: EquipmentSelections,
  character: CharacterDefinition,
): EquipmentSelections {
  const { build, weapon } = resolveRecommendedBuild(character);
  const current = selectionFor(selections, character.id);
  const isNewSelection =
    current.weaponId === undefined &&
    current.artifactSetId === undefined &&
    current.artifactLoadout === undefined;

  let next = selections;
  if (current.weaponId === undefined) {
    next = equipWeapon(
      next,
      character.id,
      weapon.id,
      DEFAULT_REFINEMENT,
      DEFAULT_WEAPON_LEVEL,
    );
  }
  if (build && isNewSelection) {
    next = equipArtifactLoadout(
      next,
      character.id,
      baseBuildArtifactLoadout(build),
    );
  }
  return next;
}
