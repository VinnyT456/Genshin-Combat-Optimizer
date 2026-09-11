import type {
  ArtifactStateEffect,
  HealingArtifactEffect,
  HealingArtifactEffectInput,
  SimulationConfig,
} from "@/types";
import type { Buff } from "@/simulation/buffs/types";
import type { ArtifactLoadout } from "@/simulation/character/equipment";
import {
  FOUR_PIECE_THRESHOLD,
  TWO_PIECE_THRESHOLD,
  activeSetBonusKeys,
} from "@/simulation/character/equipment";
import { withHarvestedBuffs } from "@/simulation/engine/composeResolvers";

// ============================================================================
// Equipment buff harvest — weapon passives and artifact set bonuses.
//
// `resolveEquippedStats()` already answers "what STATS does this gear give?".
// It deliberately answers nothing else: a weapon passive and a set bonus are
// CONDITIONAL effects, and the project has exactly one mechanism for those —
// `Buff` data resolved by `src/simulation/buffs`. Until now that half had no
// entry point, so a passive authored as `Buff` data had nowhere to go and
// contributed nothing to damage.
//
// This module is that entry point. It is the equipment twin of `perkBuffs.ts`
// and shares its composition step, so constellation, weapon and set buffs are
// one list flowing through one seam — not three parallel systems, which
// `docs/planning/ENGINE-OPTIMIZER-PLAN.md` explicitly forbids.
//
// WHAT THIS MODULE DECIDES: only SELECTION.
//
//   REFINEMENT   pick the buffs authored for the refinement the player owns.
//                R1-R5 magnitudes are DATA, indexed — never R1 scaled by
//                arithmetic, and never R1-by-default when the owned
//                refinement is R5.
//   PIECE COUNT  a `:4` bonus is live at 4 pieces and NOT at 3. The gate is
//                `activeSetBonusKeys()`, which already exists and is already
//                tested; re-deriving it here is how a 4pc-at-3pc overclaim
//                gets introduced.
//
// WHAT IT DOES NOT DECIDE: what any buff is WORTH. That is the mechanics
// layer's `Buff` semantics, unchanged and untouched.
//
// NO GAME DATA LIVES HERE. Concrete weapon/set values are `src/game-data`'s.
// This module takes already-authored `Buff` objects, so it works the moment
// that data lands and does not depend on its emitted shape.
//
// DETERMINISM: an ordered walk. Weapon before artifacts; set ids in the
// `activeSetBonusKeys()` sort order; the 2pc tier before the 4pc tier; buffs
// within a tier in authored order. Nothing iterates an unordered bag.
// ============================================================================

/** The refinement levels Genshin defines. R1 is an unrefined weapon. */
export type WeaponRefinement = 1 | 2 | 3 | 4 | 5;

export const MIN_WEAPON_REFINEMENT: WeaponRefinement = 1;
export const MAX_WEAPON_REFINEMENT: WeaponRefinement = 5;

/** Serializable weapon state-effect template before wearer identity is attached. */
export type WeaponStateEffectTemplate = ArtifactStateEffect extends infer Effect
  ? Effect extends { sourceCharacterId: string }
    ? Omit<Effect, "sourceCharacterId">
    : never
  : never;

/**
 * A weapon passive, authored once per refinement level.
 *
 * `buffsByRefinement` is a TABLE, for the same reason talent multipliers are:
 * storing one refinement's magnitude bakes in one refinement and makes the
 * data wrong at the other four. A missing entry means "not authored at this
 * refinement" and yields NO buffs — it never silently falls back to R1, which
 * would understate an R5 build while looking like it worked.
 */
export interface WeaponPassiveBuffs {
  /** Provenance for UI/debugging (e.g. "Deathly Pact"). */
  name: string;
  buffsByRefinement: Readonly<Partial<Record<WeaponRefinement, readonly Buff[]>>>;
  /** Event-driven passive effects selected alongside the owned refinement. */
  stateEffectsByRefinement?: Readonly<
    Partial<Record<WeaponRefinement, readonly WeaponStateEffectTemplate[]>>
  >;
}

/**
 * One artifact set's conditional bonuses, keyed by the tier that unlocks them.
 *
 * The keys mirror the two tiers the game defines and `activeSetBonusKeys()`
 * emits. A 4-piece set is live on BOTH tiers, matching the game: 4pc grants
 * the 2pc bonus as well.
 */
export interface ArtifactSetBonusBuffs {
  /** Set id — must match the `setId` on the equipped {@link ArtifactPiece}s. */
  setId: string;
  /** Buffs granted at one or more pieces (legacy Prayers sets). */
  onePiece?: readonly Buff[];
  /** Buffs granted at 2 or more pieces. */
  twoPiece?: readonly Buff[];
  /** Buffs granted at 4 or more pieces. */
  fourPiece?: readonly Buff[];
  /** Event-driven effects that cannot be represented as stat Buffs. */
  healingEffects?: readonly HealingArtifactEffectInput[];
  /** Event-driven effects unlocked specifically by the 2-piece tier. */
  twoPieceHealingEffects?: readonly HealingArtifactEffectInput[];
  /** Event-driven effects unlocked specifically by the 4-piece tier. */
  fourPieceHealingEffects?: readonly HealingArtifactEffectInput[];
  /** State/lifecycle effects unlocked by the equipped set tiers. */
  stateEffects?: readonly Omit<ArtifactStateEffect, "sourceCharacterId">[];
  /** State effects unlocked specifically by the 2-piece tier. */
  twoPieceStateEffects?: readonly Omit<ArtifactStateEffect, "sourceCharacterId">[];
  /** State effects unlocked specifically by the 4-piece tier. */
  fourPieceStateEffects?: readonly Omit<ArtifactStateEffect, "sourceCharacterId">[];
}

/**
 * The gear a character is wearing, described well enough to SELECT its buffs.
 *
 * This is deliberately NOT the `Equipment` stat description. The two answer
 * different questions and are supplied independently:
 *
 *   `SimulationConfig.equippedStats`     what the gear is WORTH in stats.
 *   `SimulationConfig.equipmentBuffs`    what CONDITIONAL effects it carries.
 *
 * Keeping them apart means a caller that only has stats (every existing
 * caller) keeps working unchanged, and the optimizer's build search can vary
 * one without re-deriving the other.
 */
export interface CharacterEquipmentBuffs {
  /** Owned refinement. Required when `weaponPassive` is present. */
  refinement?: WeaponRefinement;
  weaponPassive?: WeaponPassiveBuffs;
  /**
   * The equipped pieces, used ONLY to count sets. Passing the same loadout the
   * stats were resolved from is what keeps the two views consistent.
   */
  artifacts?: ArtifactLoadout;
  /** Set-bonus buff data for any set that may be equipped. */
  setBonuses?: readonly ArtifactSetBonusBuffs[];
  /** Full runtime-compiled set effects; presentation-facing `setBonuses` may
   * intentionally remain conservative for compatibility. */
  runtimeSetBonuses?: readonly ArtifactSetBonusBuffs[];
}

/** Per-character equipment buff descriptions, keyed by character id. */
export type EquipmentBuffsByCharacter = Readonly<
  Record<string, CharacterEquipmentBuffs>
>;

/**
 * Narrows one `SimulationConfig.equipmentBuffs` entry to the typed view.
 *
 * The config field is `unknown` because `src/types` sits below the mechanics
 * layer that owns `Buff` (see its doc comment). This is the single place that
 * crossing is resolved, and it is a CHECK rather than a cast: an entry that is
 * not an object is ignored, so a malformed caller value degrades to "no
 * equipment buffs" instead of throwing inside the damage pipeline.
 *
 * The buff CONTENTS are not validated here. Mechanics owns `Buff` semantics,
 * and re-checking its fields would be a second, drifting copy of that contract.
 */
function asCharacterEquipmentBuffs(
  value: unknown,
): CharacterEquipmentBuffs | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  return value as CharacterEquipmentBuffs;
}

/** True when `value` is one of the five refinement levels. */
export function isWeaponRefinement(value: number): value is WeaponRefinement {
  return (
    Number.isInteger(value) &&
    value >= MIN_WEAPON_REFINEMENT &&
    value <= MAX_WEAPON_REFINEMENT
  );
}

/**
 * The buffs a weapon passive grants at the OWNED refinement.
 *
 * Returns nothing when no refinement is stated. That is a deliberate
 * fail-closed: defaulting to R1 would make an R5 weapon quietly simulate as R1,
 * which is a wrong damage number that no test asserting "the passive applies"
 * would catch.
 */
export function harvestWeaponPassiveBuffs(
  equipment: CharacterEquipmentBuffs,
): readonly Buff[] {
  const { weaponPassive, refinement } = equipment;
  if (!weaponPassive || refinement === undefined) return [];
  if (!isWeaponRefinement(refinement)) return [];
  return weaponPassive.buffsByRefinement[refinement] ?? [];
}

/** Piece count that unlocks each tier of {@link ArtifactSetBonusBuffs}. */
const SET_BONUS_TIERS = [
  { threshold: 1, key: "onePiece" },
  { threshold: TWO_PIECE_THRESHOLD, key: "twoPiece" },
  { threshold: FOUR_PIECE_THRESHOLD, key: "fourPiece" },
] as const;

/**
 * The buffs the equipped artifact sets grant at their CURRENT piece counts.
 *
 * The active-tier decision is delegated wholesale to `activeSetBonusKeys()`,
 * which already owns "a 4pc set yields both its `:2` and its `:4` key" and is
 * separately tested. This function only maps those keys onto authored buffs.
 *
 * A set with no equipped pieces, or with fewer than its threshold, yields
 * nothing — a 4pc bonus at 3 pieces is absent, not partially applied.
 */
export function harvestArtifactSetBuffs(
  equipment: CharacterEquipmentBuffs,
): readonly Buff[] {
  const setBonuses = equipment.runtimeSetBonuses ?? equipment.setBonuses;
  if (!setBonuses || setBonuses.length === 0) return [];

  // `activeSetBonusKeys` returns set ids sorted, `:2` before `:4` — a fixed
  // order, so membership lookup below cannot reorder the result.
  const counts = activeSetBonusKeys(equipment.artifacts);
  const active = new Set(counts);
  // Legacy 1pc sets are intentionally excluded from activeSetBonusKeys for
  // backwards compatibility. Runtime harvest adds their explicit key here.
  const onePieceSets = new Set(
    Object.values(equipment.artifacts ?? {}).map((piece) => piece.setId),
  );
  for (const setId of onePieceSets) active.add(`${setId}:1`);
  if (active.size === 0) return [];

  const out: Buff[] = [];
  // Walk the AUTHORED set order, then tiers ascending, so two sets' buffs
  // interleave the same way on every run.
  for (const bonus of setBonuses) {
    for (const tier of SET_BONUS_TIERS) {
      if (!active.has(`${bonus.setId}:${tier.threshold}`)) continue;
      for (const buff of bonus[tier.key] ?? []) out.push(buff);
    }
  }
  return out;
}

/** Every equipment buff for one character: weapon passive, then set bonuses. */
export function harvestCharacterEquipmentBuffs(
  equipment: CharacterEquipmentBuffs,
): readonly Buff[] {
  return [
    ...harvestWeaponPassiveBuffs(equipment),
    ...harvestArtifactSetBuffs(equipment),
  ];
}

/** Select non-stat healing effects from the same gated artifact tiers. */
export function harvestArtifactHealingEffects(
  equipment: CharacterEquipmentBuffs,
  sourceCharacterId: string,
): readonly HealingArtifactEffect[] {
  const setBonuses = equipment.runtimeSetBonuses ?? equipment.setBonuses;
  if (!setBonuses || setBonuses.length === 0) return [];
  const active = new Set(activeSetBonusKeys(equipment.artifacts));
  for (const piece of Object.values(equipment.artifacts ?? {})) active.add(`${piece.setId}:1`);
  const out: HealingArtifactEffect[] = [];
  for (const bonus of setBonuses) {
    for (const tier of SET_BONUS_TIERS) {
      if (!active.has(`${bonus.setId}:${tier.threshold}`)) continue;
      const effects = tier.key === "onePiece"
        ? undefined
        : tier.key === "twoPiece"
          ? bonus.twoPieceHealingEffects ?? bonus.healingEffects
          : bonus.fourPieceHealingEffects ?? bonus.healingEffects;
      for (const effect of effects ?? []) {
        if (effect.kind === "healingBonus") {
          out.push({ ...effect, sourceCharacterId });
        } else if (effect.kind === "oceanHuedClam") {
          out.push({ ...effect, sourceCharacterId });
        } else {
          out.push({ ...effect, sourceCharacterId });
        }
      }
    }
  }
  return out;
}

/**
 * Every equipment buff on the team, in TEAM order.
 *
 * Walks `team` rather than the config map's keys: a `Record`'s key order is
 * caller-controlled, and iterating it would let two callers with equal builds
 * produce differently-ordered buff lists. Ids absent from `team` are ignored,
 * exactly as `equippedStats` ignores them.
 */
export function harvestTeamEquipmentBuffs(
  teamIds: readonly string[],
  byCharacter: Readonly<Record<string, unknown>> | undefined,
): readonly Buff[] {
  if (!byCharacter) return [];
  const out: Buff[] = [];
  for (const id of teamIds) {
    const equipment = asCharacterEquipmentBuffs(byCharacter[id]);
    if (!equipment) continue;
    // Resource-gated artifact buffs may read owner:'source'. Attach the
    // wearer identity at harvest time so the declarative condition resolves
    // against the correct character and remains reusable as data.
    out.push(
      ...harvestCharacterEquipmentBuffs(equipment).map((buff) => ({
        ...buff,
        sourceCharacterId: buff.sourceCharacterId ?? id,
      })),
    );
  }
  return out;
}

/** Team-ordered healing effects, preserving equipment selection/gating. */
export function harvestTeamHealingArtifactEffects(
  teamIds: readonly string[],
  byCharacter: Readonly<Record<string, unknown>> | undefined,
): readonly HealingArtifactEffect[] {
  if (!byCharacter) return [];
  const out: HealingArtifactEffect[] = [];
  for (const id of teamIds) {
    const equipment = asCharacterEquipmentBuffs(byCharacter[id]);
    if (!equipment) continue;
    out.push(...harvestArtifactHealingEffects(equipment, id));
  }
  return out;
}

/** Team-ordered lifecycle effects, preserving set tier gating. */
export function harvestTeamArtifactStateEffects(
  teamIds: readonly string[],
  byCharacter: Readonly<Record<string, unknown>> | undefined,
): readonly ArtifactStateEffect[] {
  if (!byCharacter) return [];
  const out: ArtifactStateEffect[] = [];
  for (const id of teamIds) {
    const equipment = asCharacterEquipmentBuffs(byCharacter[id]);
    if (!equipment) continue;
    if (equipment.weaponPassive && equipment.refinement !== undefined && isWeaponRefinement(equipment.refinement)) {
      for (const effect of equipment.weaponPassive.stateEffectsByRefinement?.[equipment.refinement] ?? []) {
        out.push({ ...effect, sourceCharacterId: id } as ArtifactStateEffect);
      }
    }
    const setBonuses = equipment.runtimeSetBonuses ?? equipment.setBonuses;
    if (!setBonuses || setBonuses.length === 0) continue;
    const active = new Set(activeSetBonusKeys(equipment.artifacts));
    for (const piece of Object.values(equipment.artifacts ?? {})) active.add(`${piece.setId}:1`);
    for (const bonus of setBonuses) {
      for (const tier of SET_BONUS_TIERS) {
        if (!active.has(`${bonus.setId}:${tier.threshold}`)) continue;
        const effects = tier.key === "onePiece"
          ? bonus.stateEffects
          : tier.key === "twoPiece"
            ? bonus.twoPieceStateEffects ?? bonus.stateEffects
            : bonus.fourPieceStateEffects ?? bonus.stateEffects;
        for (const effect of effects ?? []) {
          // Compiler records are immutable templates. Attach wearer identity
          // at harvest time so one set definition can serve every character.
          out.push({ ...effect, sourceCharacterId: id } as ArtifactStateEffect);
        }
      }
    }
  }
  return out;
}

/**
 * Config with the team's equipment buffs wired into all three mechanics seams.
 *
 * Additive and non-destructive, exactly like {@link withPerkBuffs}: a
 * caller-supplied resolver is COMPOSED, never replaced, so perk buffs, weapon
 * buffs, set buffs and caller-supplied buffs all coexist. A team with no
 * equipment buffs returns `config` BY IDENTITY.
 */
export function withEquipmentBuffs(
  teamIds: readonly string[],
  config: SimulationConfig,
): SimulationConfig {
  const effects = harvestTeamHealingArtifactEffects(teamIds, config.equipmentBuffs);
  const stateEffects = harvestTeamArtifactStateEffects(teamIds, config.equipmentBuffs);
  const withEffects = effects.length === 0 && stateEffects.length === 0
    ? config
    : {
        ...config,
        ...(effects.length > 0
          ? { healingArtifactEffects: [...(config.healingArtifactEffects ?? []), ...effects] }
          : {}),
        ...(stateEffects.length > 0
          ? { artifactStateEffects: [...(config.artifactStateEffects ?? []), ...stateEffects] }
          : {}),
      };
  return withHarvestedBuffs(
    withEffects,
    harvestTeamEquipmentBuffs(teamIds, config.equipmentBuffs),
  );
}
