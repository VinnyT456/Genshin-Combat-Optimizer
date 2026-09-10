import { formatSupportTier, type FormattedSupportTier } from "./rosterModel";

// ---------------------------------------------------------------------------
// Tier AT SCALE (COMPONENTS.md §7.3; ruling on UI-AUDIT-055 F1).
//
// The baseline is keyed on `supportTier` ALONE, never on (tier, reason).
//
// Why that distinction is load-bearing, verified against the live roster of 132
// characters:
//
//   supportTier  — 1 distinct value  ("PARTIAL", on every character)
//   tierReason   — 34 distinct values (each quotes that character's own counts,
//                  e.g. "Of 10 constellations and passives, 0 are modelled…")
//
// An earlier version required BOTH to match. Task A3 then made reasons
// per-character, `uniform` went false, `baseline` went null, and every card
// fell back to its own chip — reaching the exact 132-chip state this module
// exists to prevent, by the opposite path, with nothing failing. That is the
// hazard being designed against here, not a hypothetical.
//
// The tier is what the chip COMMUNICATES: "this character is not fully
// modelled". All 132 share that, so it is stated once at the roster level and
// no per-card chip is warranted. The 34 distinct reasons are per-character
// DETAIL and belong on the character detail surface (CHARACTER-DETAIL-046
// §15.6), which §7.3 explicitly does not suppress, plus the card's accessible
// name — not 132 visually identical chips.
//
// A chip therefore appears only where a character's TIER deviates from the
// baseline. Today that is zero characters. When constellation effects land it
// will be the interesting few, which is the entire point: a signal with zero
// variance is not a signal.
//
// Pure: no React, no DOM.
// ---------------------------------------------------------------------------

/** Minimal shape needed to reason about a character's tier claim. */
export interface TierClaimLike {
  readonly supportTier?: string;
  readonly tierReason?: string;
}

/**
 * The tier shared by the roster.
 *
 * Deliberately carries NO `tierReason`. Per-character reasons differ even at an
 * identical tier, so a reason on the baseline would be one character's sentence
 * presented as the whole roster's — a false statement. The roster sentence says
 * what the tier means and points at the detail view for specifics.
 */
export interface TierBaseline {
  readonly supportTier: string | undefined;
}

/**
 * Result of deciding how to present tier for a roster.
 *
 * `baseline` is non-null only when every rendered character shares one tier.
 * With a mixed roster there is no single true statement to make at the header,
 * so every card falls back to carrying its own chip — verbosity, never a hidden
 * caveat, which is the safe direction.
 */
export interface TierPresentation {
  readonly baseline: TierBaseline | null;
  /** True when the roster is uniform and the header states the claim. */
  readonly showRosterStatement: boolean;
}

/** Tier equality. Reason is deliberately NOT compared — see the header. */
function sameTier(a: TierClaimLike, b: { readonly supportTier?: string }): boolean {
  return a.supportTier === b.supportTier;
}

/**
 * Decides whether the roster's tier claim can be stated once at the top.
 *
 * An empty roster has no claim to state. A roster whose members disagree on
 * tier has no single claim either, so `baseline` is null and per-card chips
 * carry the information.
 */
export function computeTierPresentation(
  characters: readonly TierClaimLike[],
): TierPresentation {
  const first = characters[0];
  if (first === undefined) {
    return { baseline: null, showRosterStatement: false };
  }

  const uniform = characters.every((c) => sameTier(c, first));
  if (!uniform) {
    return { baseline: null, showRosterStatement: false };
  }

  return {
    baseline: { supportTier: first.supportTier },
    showRosterStatement: true,
  };
}

/**
 * Whether THIS character needs its own chip, given the roster presentation.
 *
 * Deviation in TIER is the only thing worth a per-card chip. When the roster
 * statement is showing and this character's tier matches it, the chip would
 * repeat what the header already said.
 */
export function shouldShowCardTier(
  character: TierClaimLike,
  presentation: TierPresentation,
): boolean {
  const { baseline, showRosterStatement } = presentation;
  if (!showRosterStatement || baseline === null) return true;
  return !sameTier(character, baseline);
}

/**
 * Whether the per-card explanatory sentence should render.
 *
 * While a roster statement is showing, this is ALWAYS false: the per-character
 * reason is a ~250-character paragraph quoting that character's own counts, and
 * rendering 132 of them is the noise §7.3 forbids. The reason is not lost — it
 * is rendered unconditionally on the character detail surface.
 *
 * Without a roster statement the card is the only surface making the claim, so
 * a reason renders alongside its chip.
 */
export function shouldShowCardReason(
  character: TierClaimLike,
  presentation: TierPresentation,
): boolean {
  if (presentation.showRosterStatement) return false;
  return (
    character.tierReason !== undefined && shouldShowCardTier(character, presentation)
  );
}

/** Semantic chip formatting for the roster-level baseline statement. */
export function formatBaseline(baseline: TierBaseline): FormattedSupportTier {
  return formatSupportTier(baseline.supportTier);
}
