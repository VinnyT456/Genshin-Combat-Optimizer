// ============================================================================
// UNSUPPORTED / UNCERTAIN mechanics — declared, deliberately NOT implemented.
//
// Project rule (restated by the user for this task): a value that cannot be
// cross-verified is marked UNVERIFIED with a TODO and never guessed, because a
// wrong reaction multiplier is worse than a missing one — it looks right.
// Precedent: `PARTICLE_COLORLESS_MULTIPLIER` in the energy module.
//
// Everything listed here is a KNOWN GAP with a stated reason. Nothing in this
// file is used by the reaction math; it exists so the gaps are visible in code
// review and greppable, rather than living only in a report.
//
// SOURCE used for the entries below marked VERIFIED, read directly from the
// KQM Theorycrafting Library repository (github.com/KQM-git/TCL), which is the
// same content as library.keqingmains.com:
//   [K1] docs/evidence/combat-mechanics/elemental-effects/transformative-reactions.md
//   [K2] docs/combat-mechanics/elemental-effects/transformative-reactions.md
//   [K3] docs/combat-mechanics/elemental-effects/additive-reactions.md
//   [K4] docs/combat-mechanics/_formulas/additive.md
//   [K5] docs/combat-mechanics/elemental-effects/simultaneous-reaction-priority.md
//   [K6] docs/combat-mechanics/elemental-effects/elemental-gauge-theory.md
// [K1] is the EVIDENCE vault (primary testing notes); [K2]/[K3]/[K6] are the
// prose pages derived from it. Where the two agree they are treated as
// corroborating.
//
// CITING [K1] REQUIRES READING ITS ENTRY HEADER. The vault is organised as
// dated entries, each with `Added:` and `Last tested:`. Two statements sitting
// hundreds of lines apart can still belong to ONE entry and therefore count as
// ONE source, and an entry last tested before 3.0 (2022-08-24, the Dendro
// release) may describe mechanics the curated page has since moved into a
// collapsed "Pre-3.0 Findings" block. Both traps were hit in review; see
// `burning-coupled-decay` for the worked example.
// ============================================================================

/** Machine-readable status for a mechanic this layer does not fully model. */
export type MechanicStatus = "unsupported" | "uncertain";

export interface UnsupportedMechanic {
  id: string;
  status: MechanicStatus;
  /** What is missing, and precisely why it was not filled in. */
  note: string;
}

/**
 * The authoritative gap list for the Phase 3 elemental system.
 *
 * Consumers (UI, QA) may render this so a user is told a number is incomplete
 * rather than being shown a confidently wrong one.
 */
export const UNSUPPORTED_MECHANICS: readonly UnsupportedMechanic[] = [
  {
    id: "electro-charged-ticks",
    status: "unsupported",
    note:
      "TIMING NOW VERIFIED [K1 'Electro-Charged'], scheduling still absent. " +
      "EC has a CD of 1 second and can damage a given enemy only once per " +
      "second, ticking from the initial reaction 'as long as there is at " +
      "least 0.5s of Electro and Hydro aura remaining'; the cited 120fps " +
      "video shows ticks 60 frames apart. Per-tick drain of 0.4U from BOTH " +
      "gauges was already verified (Elemental Gauge Theory). " +
      "OBSTACLE (a) IS NOW RESOLVED, and it was mis-stated. The previous note " +
      "claimed EC needs a SECONDS-of-aura bookkeeping model this layer does " +
      "not have. Re-reading [K6 'Electro-Charged'] shows the rule is stated " +
      "in GAUGE, not seconds: 'EC will tick once per second so long as enough " +
      "Electro and Hydro gauge remain', each tick 'consumes 0.4U from both " +
      "gauges', and 'once a gauge is empty, the Element will disappear'. No " +
      "second aura model is required. The seconds-remaining quantity the " +
      "exception is phrased in is DERIVED from gauge, not stored: " +
      "`secondsUntilEmpty(aura)` = gauge / totalConsumptionPerSecond(aura). " +
      "OBSTACLE (b) IS EXPRESSIBLE, and is now quoted exactly rather than " +
      "paraphrased. [K6]: 'When either the Electro or Hydro gauge completely " +
      "decays, the next Electro-Charged tick will prematurely occur at the " +
      "moment when the gauge is completely decayed. However, if one of the " +
      "gauges empties within 0.5s of the last Electro-Charged tick, there " +
      "will not be another tick.' Both branches are computable from " +
      "`timeWhenEmpty()` and the last tick time - the earlier phrasing " +
      "('if the remainder is between 0.5s and 1s') was a lossy restatement " +
      "of the same rule. Corroborated independently by [K1 'Gauge Decay " +
      "Rates of Hydro and Electro Auras'], whose clip ends with the Electro " +
      "aura persisting 0.53s after the Hydro empties - i.e. no further tick, " +
      "consistent with the 0.5s clause. " +
      "STILL UNSUPPORTED for ONE reason only, unchanged: SCHEDULING is the " +
      "engine's domain per AGENTS.md, and no scheduler calls into this layer. " +
      "This layer supplies the state and the queries; it does not own the " +
      "clock. NOT MODELLED, and NOT ASSUMED: " +
      "EC spread to adjacent targets - [K1] states the chain 'simply applies " +
      "the Electro damage. It will not apply auras', and the engine is " +
      "single-target regardless.",
  },
  {
    id: "burning-ticks",
    status: "unsupported",
    note:
      "TICK BEHAVIOUR NOW VERIFIED [K2 'Burning']: Burning 'ticks once every " +
      "0.25s and applies 1U Pyro sometime between 0.25s and 0.42s after the " +
      "Burning text first appears, then once every 2s'. The 0.25s damage " +
      "cadence is independently corroborated by the evidence vault [K1 " +
      "'Burning > Initial Findings'], which prints a 120fps frame table. The " +
      "2s Pyro re-application agrees with the existing, separately-sourced " +
      "`BURNING_ICD_SECONDS`. The 0.25 damage coefficient is per tick. " +
      "DISCREPANCY UPDATE - the 1U/2U half is now RESOLVED, the 2s/2.5s half " +
      "is NOT. Previously both were logged as unresolved vault-vs-page " +
      "conflicts. The 2U claim comes from [K1 'Burning > Initial Findings'], " +
      "Added 2021-11-04 / Last tested 2022-07-04, i.e. BEFORE 3.0 " +
      "(2022-08-24), and [K2 'Burning'] explicitly retires it inside a " +
      "collapsed 'Pre-3.0 Findings' block: 'Burning USED TO apply 2U Pyro in " +
      "a small AoE'. So 1U (current) and 2U (historical) never disagreed " +
      "about the same game version. 1U stands, now for a reason rather than " +
      "by deference. See `burning-coupled-decay` for the same version trap " +
      "applied to the decay rate. " +
      "STILL UNRESOLVED: [K1 'Burning Refresh Mechanics'] is labelled a " +
      "THEORY whose own evidence concludes 'Burning refreshes at 2.5 sec', " +
      "not 2s. That entry is NOT dated pre-3.0, so the version argument does " +
      "not dispose of it. The curated page [K2] is taken as authoritative " +
      "(reviewed output vs working notes) and `BURNING_ICD_SECONDS` stays 2, " +
      "but the split is logged so a future implementer re-checks rather than " +
      "assuming the question was never asked. " +
      "STILL UNSUPPORTED: no tick SCHEDULER exists - timing is the engine's " +
      "domain, not this layer's - so repeating damage is never emitted. Also " +
      "verified and NOT modelled: during Burning the Dendro decay rate is the " +
      "SUM of the natural Dendro and Pyro decay rates [K1], which this " +
      "layer's single-rate decay cannot express; and Burning SNAPSHOTS the " +
      "trigger's EM on trigger and on refresh [K1 'Burning snapshots'], " +
      "unlike most transformative damage.",
  },
  {
    id: "burning-coupled-decay",
    status: "uncertain",
    note:
      "THE MODEL NOW EXPRESSES COUPLED DECAY; THE COEFFICIENT IS DELIBERATELY " +
      "NOT SUPPLIED. `Aura.drains` (see `types.ts`) lets any number of extra, " +
      "attributed consumption sources be added on top of an aura's natural " +
      "decay, and `totalConsumptionPerSecond()` sums them: " +
      "  total = 1/decayRate + sum(drain.ratePerSecond). " +
      "So 'Dendro decays at the SUM of the Dendro and Pyro rates' IS now " +
      "representable - as a drain of 1/pyroDecayRate GU/s on the Dendro aura. " +
      "The blocker that made a tick scheduler unbuildable (a single scalar " +
      "`decayRate` per aura) is therefore GONE. " +
      "WHAT REMAINS UNCERTAIN IS THE NUMBER, AND IT IS WORSE THAN PREVIOUSLY " +
      "RECORDED. The summed-rate claim appears twice in [K1] ('Current " +
      "Burning Mechanics: ... Decay rate of Dendro in Burning is the sum of " +
      "natural decay rate of the Pyro aura and the natural decay rate of the " +
      "Dendro aura', and a later worked proof D1 = D0 + 1/1425). Those two " +
      "statements are ~160 lines apart but sit inside ONE vault entry - " +
      "'Burning > Initial Findings', Added 2021-11-04, Last tested " +
      "2022-07-04 - so they are ONE source, not two, and they fail the " +
      "project's two-independent-sources rule on their own. " +
      "DECISIVELY: both predate 3.0 (Dendro released 2022-08-24), and the " +
      "curated page [K2 'Burning'] files the claim under a COLLAPSED " +
      "'Pre-3.0 Findings' block, in the PAST TENSE: 'Additionally, the decay " +
      "rate of the Dendro aura while Burning WAS the sum of the natural decay " +
      "rate of the Pyro aura and Dendro aura.' The same block retires the 2U " +
      "Pyro AoE re-application from the same entry. That resolves the " +
      "1U/2U discrepancy previously logged under `burning-ticks` - the vault " +
      "is not contradicting the curated page, it is DESCRIBING AN OLDER GAME " +
      "VERSION - and it means the summed rate is explicitly HISTORICAL. " +
      "KQM publishes NO replacement decay rate for Burning post-3.0: [K2] " +
      "states no current rate and [K6] does not mention Burning decay at all. " +
      "CONSEQUENCE, stated plainly: we can express coupled decay but we do " +
      "NOT know today's coefficient, so NO DRAIN IS ATTACHED ANYWHERE. An " +
      "aura with no `drains` key decays at exactly its natural rate, which is " +
      "the pre-existing, separately-verified behaviour. Attaching the " +
      "pre-3.0 summed rate would be the precise failure this project already " +
      "suffered once: a plausible number, structurally valid, sourced-looking, " +
      "and wrong. " +
      "TODO: re-derive the post-3.0 Dendro decay rate under Burning from a " +
      "current 120fps test, or a second source independent of [K1]. Until " +
      "then Burning under-drains Dendro, which is VISIBLY-NOTHING rather " +
      "than INVISIBLY-WRONG, per the project rule. " +
      "NOTE the separately-sourced `BURNING_DENDRO_DRAIN_PER_SECOND` (0.4 " +
      "GU/s) is a DIFFERENT claim from the summed rate and is not affected by " +
      "this entry; it is also still unattached, for want of a scheduler.",
  },
  {
    id: "frozen-duration",
    status: "unsupported",
    note:
      "Frozen is detected and consumes gauge with coefficient 1 (VERIFIED), " +
      "but the Freeze aura's own duration/decay curve and the Frozen-specific " +
      "re-freeze diminishing returns were not cross-verified. Freeze " +
      "therefore produces no compound aura yet and Shatter cannot be " +
      "triggered from simulation state.",
  },
  {
    id: "shatter-trigger",
    status: "unsupported",
    note:
      "Shatter requires a Frozen target hit by a Blunt attack or any Geo " +
      "attack, and consumes the Freeze aura via Poise DMG. `Poise DMG` and " +
      "the Blunt-attack flag are not modelled anywhere in this project, so " +
      "Shatter is never produced. Its damage coefficient (3.0) IS verified " +
      "and available for when the trigger can be detected.",
  },
  {
    id: "bloom-cores",
    status: "unsupported",
    note:
      "CORE LIFECYCLE NOW VERIFIED [K2 'Bloom > Bloom Explosion']: a Dendro " +
      "Core explodes when either (1) it has been on-field 6s, or (2) five " +
      "Cores are on-field and Bloom triggers again - 'as the 6th Dendro Core " +
      "is generated, the 1st one explodes'. So: lifetime 6s, on-field cap 5, " +
      "FIFO eviction. Also verified: Bloom Explosion, Hyperbloom and Burgeon " +
      "SHARE one damage ICD of 2 instances per 0.5s per enemy, and none of " +
      "them applies Dendro despite dealing Dendro DMG [K2 'Bloom']. " +
      "STILL UNSUPPORTED because cores are ENTITIES, not aura state: they " +
      "have their own lifetime, an eviction order, and a shared damage ICD " +
      "keyed to neither attacker nor element, so they need a scheduler this " +
      "layer does not own (the engine owns timing per AGENTS.md). Hyperbloom " +
      "and Burgeon coefficients (3.0 each) remain verified and ready, but " +
      "are untriggerable until an entity/scheduling seam exists. Hyperbloom " +
      "additionally does NOT snapshot EM while Burning does - noted so the " +
      "two are not implemented with one shared assumption.",
  },
  {
    id: "quicken-aggravate-spread",
    status: "unsupported",
    note:
      "SINGLE-SOURCING FLAG LIFTED. The Aggravate / Spread reaction " +
      "multipliers 1.15 / 1.25 are VERIFIED against KQM and no longer rest " +
      "on genshin-optimizer alone: [K4] prints both as the ReactionMultiplier " +
      "cases of the additive formula, and [K3 'Aggravate'] independently " +
      "restates them in prose ('with 1.15 as the Reaction Multiplier as " +
      "opposed to 1.25 like Spread'). Two independent renderings, so the " +
      "coefficients are settled. " +
      "The REMAINING GAP is unchanged and real: the Quicken AURA is not " +
      "created, so neither second-stage reaction can trigger from simulation " +
      "state no matter how correct the coefficients are. Closing it needs " +
      "the aura duration, which KQM does supply [K3]: " +
      "Quicken Duration (s) = min(Dendro gauge, Electro gauge) * 5 + 6. " +
      "That formula is NOT implemented here - it is recorded so the next " +
      "implementer starts from a sourced value instead of a guess. Note it " +
      "yields SECONDS directly rather than a gauge that decays, which is a " +
      "different shape from every other aura this layer models; that " +
      "mismatch, not the number, is the actual work.",
  },
  {
    id: "crystallize-shield",
    status: "unsupported",
    note:
      "Crystallize is detected and consumes aura with coefficient 0.5 " +
      "(VERIFIED), but it produces a SHIELD, not damage. Shield HP uses its " +
      "own level-multiplier column (present in the wiki source but not " +
      "cross-verified against a second source) and this project models no " +
      "shields at all, so no shield is produced.",
  },
  {
    id: "transformative-crit",
    status: "unsupported",
    note:
      "Some transformative reactions CAN crit, but only via specific " +
      "character abilities. Modelling that requires character data this layer " +
      "must not contain. Transformative damage is therefore always non-crit, " +
      "matching the game default.",
  },
  {
    id: "transformative-def-multiplier",
    status: "uncertain",
    note:
      "Transformative reactions technically have a DEF multiplier of " +
      "99999999/(99999999+DEF) (source: Genshin Impact Wiki note). It is " +
      "deliberately treated as exactly 1, as the source itself states the " +
      "difference is negligible. Documented so the omission is a decision, " +
      "not an oversight.",
  },
  {
    id: "simultaneous-reaction-priority",
    status: "uncertain",
    note:
      "STAYS UNVERIFIED, and this is now a SOURCED conclusion rather than an " +
      "unchecked gap. KQM explicitly DECLINES to publish a fixed priority " +
      "order: [K5] states 'SRP is examined on a case by case basis' and " +
      "defers the details to an external working document. There is " +
      "therefore no canonical order to implement, and any order we shipped " +
      "would be an invention. " +
      "What this layer does: it resolves reactions in a FIXED element order " +
      "(pyro, hydro, electro, cryo, dendro). That is a DETERMINISTIC " +
      "CONVENTION chosen so results are reproducible and memo-hashable - it " +
      "is explicitly NOT a claim to match the game. Where the game is " +
      "case-by-case, a fixed order cannot be right in general; it is only " +
      "guaranteed to be STABLE. It is observable only when a single hit " +
      "reacts with 2+ auras and the gauge cannot satisfy both. Do NOT " +
      "'fix' this by picking a different order - the defect would be the " +
      "same, differently arranged.",
  },
  {
    id: "lunar-reactions",
    status: "unsupported",
    note:
      "Lunar-Charged / Lunar-Bloom / Lunar-Crystallize / Stellar reactions " +
      "are recent additions requiring Moonsign mechanics. Out of scope and " +
      "not modelled at all.",
  },
  {
    id: "aura-on-multiple-targets",
    status: "unsupported",
    note:
      "Aura state is per-target and ICD is per (attacker, target) — the model " +
      "supports this — but the combat engine is single-target, so only one " +
      "target is ever tracked. Swirl spreading an element to nearby targets " +
      "is consequently not modelled.",
  },
];

/** Look up one gap by id (used by tests to assert the list stays honest). */
export function findUnsupportedMechanic(
  id: string,
): UnsupportedMechanic | undefined {
  return UNSUPPORTED_MECHANICS.find((mechanic) => mechanic.id === id);
}
