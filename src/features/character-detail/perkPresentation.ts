import {
  perkEffectsForCharacter,
  type GeneratedPerkEffect,
  type PerkSupport,
} from "@/game-data/characters/generated";

// ---------------------------------------------------------------------------
// Constellation / passive presentation — the FOUR-ROW TRUTH TABLE.
// (CHARACTER-DETAIL-046 §15.5; ruling on UI-AUDIT-055 F2.)
//
// The bug this module exists to kill:
//
//   The modal branched on `kitDetails.constellations.length > 0`, which asks
//   "does this character have hand-authored kit prose". That is TRUE for 4 of
//   132 characters and it collapses four independent data states into two. The
//   unlocked rows were then labelled 已激活生效 — "activated, in effect" — while
//   the website used to pass lossy legacy definitions on the live simulation
//   path. So the engine ran C0, the UI said C6, and the user read a C0 number
//   labelled C6.
//
// `effects` presence and prose presence are INDEPENDENT and both matter. This
// module branches on the two axes separately, so a data drop landing one
// without the other renders honestly instead of wrongly.
//
//   connected prose     treatment
//   --------- --------  ------------------------------------------------
//   yes       present   full row, support + unlock state (SIMULATED)
//   yes       absent    row + "暂无中文描述文本。"       (SIMULATED_NO_TEXT)
//   no        present   row + "尚未参与计算"             (DESCRIBED_ONLY)
//   no        absent    honest empty state               (ABSENT)
//
// Verified against the live data at the time of writing: 1234 perk rows, with
// 266 marked `modelled`. The reconciled 259-row talent-level subset reaches the
// engine through generated `ConstellationDefinition.buffs`; the other seven
// modelled rows and all 968 non-modelled rows remain DESCRIBED_ONLY.
//
// Pure: no React, no DOM. Reads game-data through its public `generated` index,
// never by reaching into an individual generated file.
// ---------------------------------------------------------------------------

/** How a single perk row should be presented. */
export type PerkRowKind =
  /** Effects are modelled AND prose exists. The only fully-good state. */
  | "simulated"
  /** Effects are modelled but no Chinese prose exists yet. */
  | "simulated-no-text"
  /** Prose exists but this effect channel does not reach the engine. */
  | "described-only";

/** Chinese prose for a perk, when the data layer has any. */
export interface PerkProse {
  readonly descriptionZh?: string;
  /** Source prose (English). Always emitted by the generator. */
  readonly text?: string;
}

/** One constellation or passive, resolved for display. */
export interface PerkRow {
  readonly id: string;
  readonly name: string;
  readonly kind: PerkRowKind;
  /** C1..C6; absent for passives. */
  readonly constellationLevel?: number;
  /** Ascension phase required by a passive, when sourced. */
  readonly unlockAscension?: number;
  /** Honest support flag straight from the data layer. Never inferred here. */
  readonly support: PerkSupport;
  readonly descriptionZh?: string;
  readonly text?: string;
  /** Why the row is not modelled, when the data layer says. */
  readonly reason?: string;
}

/**
 * Whether a perk's effects actually reach the engine.
 *
 * VERIFIED, and narrower than it looks. `support === "modelled"` is the data
 * layer's word for "EXPRESSIBLE in the Buff vocabulary with no invented
 * mechanism". It is NOT by itself a statement that the effect is applied.
 *
 * The generated presentation table and live character definitions contain the
 * same 259 talent-level boosts. That channel has been reconciled field for
 * field and is carried through the website adapter. Seven other rows marked
 * `modelled` use different channels and remain unsupported here.
 *
 * The check below is intentionally channel-specific. Widening it to every
 * `modelled` row would falsely label seven other expressible but unconnected
 * effects as simulated.
 */
function isSimulated(perk: GeneratedPerkEffect): boolean {
  return perk.support === "modelled" && perk.talentLevelBoost !== undefined;
}

function hasText(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

/** Classifies one perk against the two independent axes. */
export function classifyPerk(
  perk: GeneratedPerkEffect,
  prose: PerkProse = {},
): PerkRowKind {
  const simulated = isSimulated(perk);
  const described = hasText(prose.descriptionZh);
  if (simulated) return described ? "simulated" : "simulated-no-text";
  return "described-only";
}

/**
 * Builds display rows for one character's constellations, in unlock order.
 *
 * `proseFor` supplies hand-authored Chinese prose where it exists; the four
 * characters with authored kits have it, the rest do not. Absence is a
 * first-class state here, not an error.
 */
export function buildConstellationRows(
  characterId: string,
  proseFor: (perkId: string) => PerkProse = () => ({}),
): readonly PerkRow[] {
  return perkEffectsForCharacter(characterId)
    .filter((perk) => perk.kind === "constellation")
    .map((perk) => toRow(perk, proseFor(perk.id)))
    .slice()
    .sort((a, b) => (a.constellationLevel ?? 0) - (b.constellationLevel ?? 0));
}

/** Builds display rows for one character's passives, in emitted order. */
export function buildPassiveRows(
  characterId: string,
  proseFor: (perkId: string) => PerkProse = () => ({}),
): readonly PerkRow[] {
  return perkEffectsForCharacter(characterId)
    .filter((perk) => perk.kind === "passive")
    .map((perk) => toRow(perk, proseFor(perk.id)));
}

function toRow(perk: GeneratedPerkEffect, prose: PerkProse): PerkRow {
  return {
    id: perk.id,
    name: perk.name,
    kind: classifyPerk(perk, prose),
    ...(perk.constellationLevel === undefined
      ? {}
      : { constellationLevel: perk.constellationLevel }),
    ...(perk.unlockAscension === undefined ? {} : { unlockAscension: perk.unlockAscension }),
    support: perk.support,
    ...(hasText(prose.descriptionZh) ? { descriptionZh: prose.descriptionZh } : {}),
    ...(hasText(perk.text) ? { text: perk.text } : {}),
    ...(hasText(perk.reason) ? { reason: perk.reason } : {}),
  };
}

/**
 * Whether ANY of these rows actually changes a simulated number.
 *
 * Drives the tab-level warning. A true value means at least one reconciled
 * talent-level boost is supported; it does not claim the whole kit is modelled.
 */
export function anyRowSimulated(rows: readonly PerkRow[]): boolean {
  return rows.some((row) => row.kind !== "described-only");
}

/** Per-character counts backing the coverage statement (§15.6). */
export interface PerkCoverage {
  readonly total: number;
  /** Rows whose reconciled talent-level effect reaches the engine. */
  readonly simulated: number;
  /** Rows with prose but no simulated effect. */
  readonly describedOnly: number;
}

/**
 * Counts one character's perk coverage for the honesty statement.
 *
 * Numeric slots, not assembled clauses: the component formats a fixed Chinese
 * template around these numbers. That satisfies DESIGN-SYSTEM's ban on building
 * a sentence from concatenated fragments, and — unlike substring-matching the
 * generator's English prose — it cannot silently go stale when wording changes.
 */
export function perkCoverage(rows: readonly PerkRow[]): PerkCoverage {
  let simulated = 0;
  for (const row of rows) {
    if (row.kind !== "described-only") simulated += 1;
  }
  return {
    total: rows.length,
    simulated,
    describedOnly: rows.length - simulated,
  };
}
