import { simulateRotation } from "@/simulation/engine";
import { defMultiplier, resMultiplier } from "@/simulation/damage/pipeline";
import {
  type Equipment,
  type EquipmentStat,
  type ResolvedEquippedStats,
  resolveEquippedStats,
} from "@/simulation/character/equipment";
import { makeResolvers } from "@/simulation/buffs/makeBuffResolver";
import { getRaidenNationalBuffs } from "@/game-data/characters/kits/raidenNationalKit";
import { equipmentConfig } from "@/features/simulation/equipmentAdapter";
import type { EquipmentSelections } from "@/features/team-builder/equipmentSelection";
import type {
  CharacterDefinition,
  Stats,
  EnemyState,
  Rotation,
  SimulationConfig,
  SimulationResult,
} from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";

// ---------------------------------------------------------------------------
// Thin adapter between the React layer and the combat engine. The UI never
// imports the engine directly and never computes damage, energy or reactions —
// this module exists only so component code depends on one narrow seam.
// ---------------------------------------------------------------------------

/** Crit is presented as an expected value; the UI shows no random rolls. */
const UI_SIMULATION_CONFIG: SimulationConfig = { critMode: "expected" };

/**
 * True when the run used the engine's own swap cost rather than a UI override.
 * The adapter owns the config, so it is the only layer that can answer this
 * honestly — the timeline legend must not label a value "default" on a guess.
 */
export function swapCostWasDefault(config: SimulationConfig): boolean {
  return config.swapCost === undefined;
}

/**
 * Enemy mitigation preview, for the enemy configurator's readout.
 *
 * These RE-EXPORT the engine's own `defMultiplier` / `resMultiplier` rather
 * than recomputing them. The configurator previously inlined both formulas,
 * which is a second implementation of engine math in the UI: it would drift
 * from the engine silently and no test would fail (TASK #034 finding H5).
 *
 * `characterLevel` is a required argument, not a default: the DEF multiplier
 * depends on it, and baking in a level the user never chose renders an
 * assumption as if it were a result.
 */
export interface MitigationPreview {
  readonly defMultiplier: number;
  readonly resMultiplier: number;
  /** Combined factor, i.e. the share of raw damage that survives mitigation. */
  readonly totalMultiplier: number;
}

export function previewMitigation(
  characterLevel: number,
  enemyLevel: number,
  resistance: number,
): MitigationPreview {
  const def = defMultiplier(characterLevel, enemyLevel);
  const res = resMultiplier(resistance);
  return { defMultiplier: def, resMultiplier: res, totalMultiplier: def * res };
}

/**
 * Applies equipment to a character's stats using the ENGINE's stat model.
 *
 * The UI previously folded weapon substats in by hand, applying ATK% to the
 * already-final ATK. In game every percentage scales BASE ATK (character base
 * plus weapon base), so the local version inflated the result and compounded
 * with each additional source. `resolveEquippedStats` is the engine's own
 * `base * (1 + Sum pct) + Sum flat` implementation; delegating keeps exactly
 * one stat model in the project (finding H5's rule, applied to stats).
 */
export function applyEquipment(
  characterStats: Stats,
  equipment: Equipment,
): ResolvedEquippedStats {
  return resolveEquippedStats(characterStats, equipment);
}

export type { Equipment, EquipmentStat, ResolvedEquippedStats };

/**
 * Character shape kept by the website while legacy presentation components are
 * being migrated. The nested definition is lossless: multi-hit abilities,
 * scaling terms, passives, constellations, resources and level tables all reach
 * the engine. Top-level legacy fields remain available to existing UI views.
 */
export type WebsiteCharacterDefinition = CharacterDefinition & {
  readonly engineDefinition: GenericCharacterDefinition;
};

export function isWebsiteCharacter(
  character: CharacterDefinition | GenericCharacterDefinition | WebsiteCharacterDefinition,
): character is WebsiteCharacterDefinition {
  return "engineDefinition" in character;
}

/** Applies the editable website build to its lossless engine definition. */
export function toEngineCharacter(
  character: CharacterDefinition | GenericCharacterDefinition | WebsiteCharacterDefinition,
): CharacterDefinition | GenericCharacterDefinition {
  if (!isWebsiteCharacter(character)) return character;
  return {
    ...character.engineDefinition,
    level: character.level,
    baseStats: character.baseStats,
    constellationLevel:
      character.constellation ?? character.engineDefinition.constellationLevel,
    talentLevels:
      character.talentLevels ?? character.engineDefinition.talentLevels,
  };
}

export interface RunSimulationInput {
  team: readonly (
    | CharacterDefinition
    | GenericCharacterDefinition
    | WebsiteCharacterDefinition
  )[];
  rotation: Rotation;
  enemy: EnemyState;
  config?: Partial<SimulationConfig>;
  /**
   * The user's equipment choices, keyed by character id.
   *
   * Optional so every existing caller (and every fixture) keeps its exact
   * previous behaviour: absent selections produce no `equippedStats` and no
   * `equipmentBuffs`, which is the config the adapter built before this wire
   * existed.
   */
  equipment?: EquipmentSelections;
}

export interface RunSimulationOutput {
  result: SimulationResult;
  /** Whether `result.effectiveSwapCost` came from the engine default. */
  swapCostIsDefault: boolean;
}

export function runSimulation({
  team,
  rotation,
  enemy,
  config,
  equipment,
}: RunSimulationInput): RunSimulationOutput {
  const legacyTeam = team.filter(
    (character): character is CharacterDefinition => "normalAttack" in character,
  );
  const nationalBuffs = getRaidenNationalBuffs(legacyTeam);
  const autoResolvers =
    nationalBuffs.length > 0 ? makeResolvers({ buffs: nationalBuffs }) : undefined;

  // The user's gear, translated into the two config fields the engine already
  // reads: `equippedStats` (what the gear is worth) and `equipmentBuffs` (the
  // weapon passives and set bonuses it carries). Built BEFORE the caller's
  // `config` is spread, so an explicit caller-supplied value still wins — the
  // optimizer's build search varies `equippedStats` directly and must not have
  // it overwritten by the team panel's selection.
  const equipmentFields = equipment
    ? equipmentConfig(
        team.map((character) => ({
          id: character.id,
          stats: character.baseStats,
        })),
        equipment,
      )
    : {};

  const mergedConfig: SimulationConfig = {
    ...UI_SIMULATION_CONFIG,
    ...(autoResolvers
      ? {
          buffResolver: autoResolvers.buffResolver,
          enemyModifierResolver: autoResolvers.enemyModifierResolver,
        }
      : {}),
    ...equipmentFields,
    ...config,
  };
  return {
    result: simulateRotation(team.map(toEngineCharacter), rotation, enemy, mergedConfig),
    swapCostIsDefault: swapCostWasDefault(mergedConfig),
  };
}
