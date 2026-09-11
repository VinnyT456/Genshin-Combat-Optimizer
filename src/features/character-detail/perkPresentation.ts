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
// 266 marked `modelled`. Every one of those rows reaches the engine through a
// generated `ConstellationDefinition.buffs` / `PassiveDefinition.buffs`
// entry; the remaining 968 non-modelled rows remain DESCRIBED_ONLY.
// Character-specific runtime overlays may additionally promote a row only in
// `buildConstellationRows`; Raiden's six rows are the first such overlay.
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
 * `support === "modelled"` means the generator recovered an unconditional
 * effect in the Buff vocabulary. The payload check is kept alongside it as a
 * guard against a malformed generated row claiming support with no executable
 * channel at all. Talent levels, stat modifiers, conversions and enemy-side
 * modifiers are all harvested from the character definition by the simulator.
 */
function isSimulated(perk: GeneratedPerkEffect): boolean {
  if (perk.support !== "modelled") return false;
  return (
    perk.talentLevelBoost !== undefined ||
    (perk.modifiers?.length ?? 0) > 0 ||
    (perk.conversions?.length ?? 0) > 0 ||
    (perk.enemyModifiers?.length ?? 0) > 0
  );
}

/** Runtime kit overlays that are executable before generated provenance is regenerated. */
const RUNTIME_SIMULATED_PERKS = new Set([
  "raiden-shogun-c1",
  "raiden-shogun-c2",
  "raiden-shogun-c3",
  "raiden-shogun-c4",
  "raiden-shogun-c5",
  "raiden-shogun-c6",
]);

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
    .map((perk) =>
      toRow(perk, proseFor(perk.id), RUNTIME_SIMULATED_PERKS.has(perk.id)),
    )
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

function toRow(
  perk: GeneratedPerkEffect,
  prose: PerkProse,
  runtimeSimulated = false,
): PerkRow {
  return {
    id: perk.id,
    name: perk.name,
    kind: runtimeSimulated ? "simulated" : classifyPerk(perk, prose),
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
