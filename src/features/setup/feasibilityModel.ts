// ---------------------------------------------------------------------------
// Pure derivation for the burst-feasibility panel (COMPONENTS.md §15.5).
//
// THE HONESTY RULE (§15.5/F1) — this module does NOT compute energy.
// It has no particle model, no ER, no off-field share. Those live in
// `src/simulation/energy` and reaching for them here would be a second energy
// implementation in the UI, the exact defect class `previewMitigation` exists
// to prevent for damage.
//
// What it may legitimately state are facts about the ROTATION ARRAY:
//   - how many bursts a character has in the sequence   (counting)
//   - what those bursts cost                            (`character.maxEnergy`)
//   - whether a burst has any prior action by its owner (F2, array order)
//
// The VERDICT — whether that demand is actually met — is only ever the
// engine's, read back from a fresh run's `structuredWarnings`.
// ---------------------------------------------------------------------------

import type {
  CharacterDefinition,
  Rotation,
  SimulationWarning,
} from "@/types";

/**
 * Engine-attributed verdict for one character's bursts.
 *
 * `unknown` is a real, rendered state, not a fallback to silence: before a run
 * (or against a stale one) the panel states demand and explicitly declines to
 * judge it.
 */
export type FeasibilityVerdict = "unknown" | "sufficient" | "insufficient";

export interface FeasibilityRow {
  readonly characterId: string;
  readonly character: CharacterDefinition;
  /** Number of `burst` actions this character has in the sequence. */
  readonly burstCount: number;
  /** Energy one burst costs, from `character.maxEnergy`. */
  readonly energyPerBurst: number;
  /** `burstCount * energyPerBurst` — a fact about the array, not a prediction. */
  readonly totalDemand: number;
  readonly verdict: FeasibilityVerdict;
  /**
   * 1-based ordinals of the bursts the ENGINE rejected for energy, in sequence
   * order. Empty unless `verdict === "insufficient"`.
   */
  readonly failedBurstOrdinals: readonly number[];
  /**
   * F2 — this character's first action in the sequence is their burst, so the
   * sequence gives them no opportunity to charge it. True regardless of ER,
   * because it is a statement about the list and not about energy physics.
   */
  readonly burstBeforeAnyAction: boolean;
}

export interface FeasibilityReport {
  readonly rows: readonly FeasibilityRow[];
  /** F3 — rows the sequence cannot reach; pointed at, never re-listed here. */
  readonly unreachableCount: number;
  /** True when a fresh run supplied the verdicts in `rows`. */
  readonly hasEngineVerdict: boolean;
}

/**
 * Builds the panel's model.
 *
 * @param warnings Structured warnings from a FRESH run, or `null` when there is
 *   no run or the result is stale. Passing `null` is what drops every row back
 *   to demand-only: a verdict computed for a different sequence is worse than
 *   no verdict at all (§15.5/F1).
 */
export function buildFeasibilityReport(
  rotation: Rotation,
  characterById: ReadonlyMap<string, CharacterDefinition>,
  unreachableCount: number,
  warnings: readonly SimulationWarning[] | null,
): FeasibilityReport {
  // Which rotation indices the engine rejected for energy. Read from the
  // structured code, never by parsing the human-readable message.
  const energyFailureIndexes = new Set(
    (warnings ?? [])
      .filter((w) => w.code === "insufficient-energy")
      .map((w) => w.actionIndex),
  );

  const order: string[] = [];
  const burstIndexesByCharacter = new Map<string, number[]>();
  const firstActionByCharacter = new Map<string, number>();

  rotation.forEach((action, index) => {
    if (!firstActionByCharacter.has(action.characterId)) {
      firstActionByCharacter.set(action.characterId, index);
    }
    if (action.actionType !== "burst") return;
    let indexes = burstIndexesByCharacter.get(action.characterId);
    if (indexes === undefined) {
      indexes = [];
      burstIndexesByCharacter.set(action.characterId, indexes);
      order.push(action.characterId);
    }
    indexes.push(index);
  });

  const rows: FeasibilityRow[] = [];

  for (const characterId of order) {
    const character = characterById.get(characterId);
    // An orphaned character has no `maxEnergy` to quote, and inventing one
    // would be the fabricated number this panel exists to avoid. The editor
    // already flags the row itself (§14.7).
    if (character === undefined) continue;

    const burstIndexes = burstIndexesByCharacter.get(characterId) ?? [];
    const burstCount = burstIndexes.length;
    const energyPerBurst = character.maxEnergy;

    const failedBurstOrdinals = burstIndexes
      .map((rotationIndex, ordinal) =>
        energyFailureIndexes.has(rotationIndex) ? ordinal + 1 : null,
      )
      .filter((ordinal): ordinal is number => ordinal !== null);

    const verdict: FeasibilityVerdict =
      warnings === null
        ? "unknown"
        : failedBurstOrdinals.length > 0
          ? "insufficient"
          : "sufficient";

    rows.push({
      characterId,
      character,
      burstCount,
      energyPerBurst,
      totalDemand: burstCount * energyPerBurst,
      verdict,
      failedBurstOrdinals,
      burstBeforeAnyAction:
        firstActionByCharacter.get(characterId) === burstIndexes[0],
    });
  }

  return { rows, unreachableCount, hasEngineVerdict: warnings !== null };
}
