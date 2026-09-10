import type {
  ArtifactLoadout,
  ArtifactPiece,
} from "@/simulation/character/equipment";
import { ARTIFACT_SLOTS } from "@/simulation/character/equipment";
import type {
  ArtifactSetBonusBuffs,
  CharacterEquipmentBuffs,
  EquipmentBuffsByCharacter,
  WeaponPassiveBuffs,
} from "@/simulation/engine/equipmentBuffs";
import { isWeaponRefinement } from "@/simulation/engine/equipmentBuffs";

// ============================================================================
// Build description -> `SimulationConfig.equipmentBuffs`.
//
// THE GAP THIS CLOSES. Three pieces of the artifact set-bonus chain existed
// and none of them touched:
//
//   `setBonusBuffs()`              (game-data) turns generated rows into `Buff`s.
//   `CharacterEquipmentBuffs`      (here)      the shape the engine harvests.
//   `harvestArtifactSetBuffs()`    (engine)    gates them on piece count.
//
// The first produced a value; the third consumed a field; NOTHING assembled
// one into the other. `harvestArtifactSetBuffs()` therefore returned `[]` on
// every real run, and all 46 modelled set bonuses contributed exactly zero
// damage while every unit test on either end passed. This module is the
// assembly step, so the chain has an actual middle.
//
// WHY IT LIVES IN THE ENGINE AND NOT IN THE GAME-DATA LAYER. The layering is
// one-way: game-data -> mechanics -> combat-engine, and no module under
// `src/simulation` imports the game-data layer at all -- `layering.test.ts`
// enforces that. A builder that reached for the generated set-bonus roster
// directly would invert it. So the set-bonus DATA is
// INJECTED: the caller passes the lookup, this module owns only the assembly.
// That is also what lets the optimizer vary a build without re-deriving the
// whole roster, and what lets tests drive it with synthetic sets.
//
// WHAT THIS MODULE DECIDES: only WHICH set-bonus entries a build needs to
// carry, and how a per-character build maps onto the harvest's shape.
//
// WHAT IT DOES NOT DECIDE: piece-count gating (that is
// `harvestArtifactSetBuffs()` via `activeSetBonusKeys()`, unchanged, and
// re-deriving it here is how a 4pc-at-3pc overclaim gets introduced), and what
// any buff is WORTH (mechanics).
//
// DETERMINISM: every walk is over `ARTIFACT_SLOTS` in its fixed order, or over
// the caller's array in authored order. Nothing iterates an unordered bag, so
// two callers with equal builds produce byte-identical output.
// ============================================================================

/**
 * One character's gear, described well enough to look its buffs up.
 *
 * Deliberately the DESCRIPTION (ids and a loadout), not the resolved buffs:
 * this is the shape a UI build state or an optimizer candidate already has.
 * Turning it into buffs is this module's job.
 */
export interface CharacterBuildDescription {
  /** Weapon id, resolved through the injected `weaponPassive` lookup. */
  weaponId?: string;
  /** Owned refinement. Without it the weapon passive is inert — never R1. */
  refinement?: number;
  /** Equipped pieces. Piece counting stays with `activeSetBonusKeys()`. */
  artifacts?: ArtifactLoadout;
}

/**
 * The data lookups the assembly needs, injected rather than imported.
 *
 * Both return `undefined` for an unknown id, which is the fail-closed answer:
 * an unrecognised weapon or set contributes NOTHING rather than falling back
 * to a neighbouring entry, which would attribute one item's damage to another.
 */
export interface EquipmentBuffSources {
  weaponPassive?: (weaponId: string) => WeaponPassiveBuffs | undefined;
  setBonus?: (setId: string) => ArtifactSetBonusBuffs | undefined;
}

/**
 * The DISTINCT set ids in a loadout, in fixed slot order, first appearance
 * first.
 *
 * Deduplicated because `harvestArtifactSetBuffs()` walks the `setBonuses`
 * array once per entry: the same set listed twice would apply its bonus twice,
 * which is a doubled buff that a "the set applies" test passes straight
 * through. The order is `ARTIFACT_SLOTS`, never `Object.keys(loadout)`, whose
 * order the caller controls.
 */
export function equippedSetIds(
  loadout: ArtifactLoadout | undefined,
): readonly string[] {
  if (!loadout) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const slot of ARTIFACT_SLOTS) {
    const piece: ArtifactPiece | undefined = loadout[slot];
    if (!piece || seen.has(piece.setId)) continue;
    seen.add(piece.setId);
    ids.push(piece.setId);
  }
  return ids;
}

/**
 * The set-bonus entries a loadout needs, looked up and in fixed order.
 *
 * Only the EQUIPPED sets are carried. Passing the whole roster would also be
 * correct — the harvest gates on piece count — but it makes every config carry
 * 46 entries whose gating then has to be trusted, and it makes the assembled
 * value useless for telling which sets a build actually involves. A set with
 * no modelled bonus yields no entry.
 */
export function setBonusesForLoadout(
  loadout: ArtifactLoadout | undefined,
  lookup: EquipmentBuffSources["setBonus"],
): readonly ArtifactSetBonusBuffs[] {
  if (!lookup) return [];
  const out: ArtifactSetBonusBuffs[] = [];
  for (const setId of equippedSetIds(loadout)) {
    const bonus = lookup(setId);
    if (bonus) out.push(bonus);
  }
  return out;
}

/**
 * One character's build as the `CharacterEquipmentBuffs` the harvest reads.
 *
 * Returns `undefined` when the build yields NOTHING to harvest — no weapon
 * passive and no set bonus. An entry that carries neither is inert, and
 * omitting it keeps `withEquipmentBuffs()`'s by-identity return reachable for
 * an ungeared team, so such runs stay byte-identical to before this module.
 *
 * `artifacts` is carried through whenever any set bonus is, because it is what
 * the piece-count gate counts: dropping it would make every 2pc bonus inert.
 * The refinement is carried ONLY when it is one of the five real levels — an
 * out-of-range value makes the passive inert rather than silently clamping to
 * a level the player does not own.
 */
export function buildCharacterEquipmentBuffs(
  build: CharacterBuildDescription,
  sources: EquipmentBuffSources,
): CharacterEquipmentBuffs | undefined {
  const passive =
    build.weaponId !== undefined && sources.weaponPassive
      ? sources.weaponPassive(build.weaponId)
      : undefined;
  const setBonuses = setBonusesForLoadout(build.artifacts, sources.setBonus);

  if (!passive && setBonuses.length === 0) return undefined;

  const entry: CharacterEquipmentBuffs = {};
  if (passive) {
    entry.weaponPassive = passive;
    // `isWeaponRefinement` is a type guard, so no cast is needed here — and
    // an out-of-range value simply leaves `refinement` unset, which makes the
    // passive inert rather than clamping to a level the player does not own.
    if (build.refinement !== undefined && isWeaponRefinement(build.refinement)) {
      entry.refinement = build.refinement;
    }
  }
  if (setBonuses.length > 0) {
    entry.artifacts = build.artifacts;
    entry.setBonuses = setBonuses;
  }
  return entry;
}

/**
 * A whole team's builds as the `SimulationConfig.equipmentBuffs` value.
 *
 * Keyed by character id, exactly as the harvest reads it. Characters whose
 * build yields nothing are OMITTED rather than given an empty entry, so an
 * ungeared team produces `undefined` and the config field stays absent.
 *
 * Iteration is over the caller's array in order; the returned record's key
 * order therefore follows team order. The harvest walks `team` rather than
 * these keys, so ordering here cannot change a damage number — it is kept
 * fixed anyway so the value is comparable between runs.
 */
export function buildTeamEquipmentBuffs(
  builds: readonly (CharacterBuildDescription & { characterId: string })[],
  sources: EquipmentBuffSources,
): EquipmentBuffsByCharacter | undefined {
  const out: Record<string, CharacterEquipmentBuffs> = {};
  let any = false;
  for (const build of builds) {
    const entry = buildCharacterEquipmentBuffs(build, sources);
    if (!entry) continue;
    out[build.characterId] = entry;
    any = true;
  }
  return any ? out : undefined;
}
