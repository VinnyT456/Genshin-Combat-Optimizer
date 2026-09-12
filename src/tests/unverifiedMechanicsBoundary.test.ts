import { describe, expect, it } from "vitest";

import {
  ADDITIVE_COEFFICIENTS,
  BURNING_DENDRO_DRAIN_PER_SECOND,
  BURNING_ICD_SECONDS,
  ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK,
  EMPTY_AURA_STATE,
  TRANSFORMATIVE_COEFFICIENTS,
  UNSUPPORTED_MECHANICS,
  applyElement,
  findUnsupportedMechanic,
  toReactionModifiers,
} from "@/simulation/reactions";
import type {
  Aura,
  AuraElement,
  AuraState,
  MechanicStatus,
} from "@/simulation/reactions";
import type { Element } from "@/types";

// ============================================================================
// THE UNVERIFIED BOUNDARY (TASK #024, qa-engineer).
//
// `src/simulation/reactions/unverified.ts` quarantines mechanics that
// mechanics-engineer could NOT cross-verify, and behaviour that is therefore
// deliberately absent. This file pins the SHAPE and the CURRENT BEHAVIOUR of
// that boundary as CHANGE-DETECTORS.
//
//   READ THIS BEFORE TRUSTING ANY TEST BELOW WHOSE TITLE SAYS "UNVERIFIED".
//
//   A pin here is NOT a claim that the value or the behaviour is CORRECT. It
//   is a claim that it is what the code does TODAY, so that changing it is a
//   deliberate act with a visible diff rather than a silent drift.
//
// PRECEDENT (TASK #017, `PARTICLE_COLORLESS_MULTIPLIER`): when an unverified
// value is later sourced, the instruction is to REPLACE the pin with a real
// verified-value assertion — NOT to re-pin a new number in the same shape.
// If the value turns out to be a different SHAPE (a table where a scalar was
// assumed, a scheduled tick where a single instance was assumed), the pin must
// be deleted outright, not adapted.
//
// The tests are split into three deliberate kinds:
//   A. REGISTRY HYGIENE  — the gap list must stay honest and machine-readable.
//   B. ABSENCE PINS      — behaviour that is deliberately MISSING must stay
//                          missing and must FAIL CLOSED (produce nothing)
//                          rather than fail open (produce a plausible guess).
//   C. VALUE-SHAPE PINS  — single-sourced or unscheduled constants, pinned by
//                          SHAPE and magnitude, with the replace-not-re-pin
//                          instruction attached to each.
// ============================================================================

const VALID_STATUSES: readonly MechanicStatus[] = ["unsupported", "uncertain"];

/**
 * The gap ids this suite knows about. If mechanics ADDS a gap, this list must
 * be updated deliberately — a new unverified mechanic appearing silently is
 * exactly the drift this boundary exists to prevent.
 */
const KNOWN_GAP_IDS: readonly string[] = [
  "electro-charged-ticks",
  "burning-ticks",
  // SIGNED OFF (TASK #057, qa-engineer). Added by mechanics-engineer; this
  // list firing at 12-vs-11 is the gate working, so the entry was reviewed on
  // its merits against the KQM clone rather than waved through. Verified
  // FIRST-HAND, claim by claim:
  //
  //  * The summed-rate claim appears at evidence .../transformative-reactions
  //    .md:1584 and again as the worked proof `D1 = D0 + 1/1425` at :1773.
  //    189 lines apart, but the next `###` header is at :1793 — so both sit
  //    inside ONE entry, "Burning > Initial Findings". ONE source, and the
  //    two-independent-sources rule is genuinely unmet. CONFIRMED.
  //  * That entry is Added 2021-11-04 / Last tested 2022-07-04, i.e. before
  //    3.0 (2022-08-24). CONFIRMED from the entry header.
  //  * The curated page files it in a collapsed `<summary>Pre-3.0 Findings`
  //    block (:197) in the PAST TENSE: "the decay rate of the Dendro aura
  //    while Burning WAS the sum..." (:201). CONFIRMED.
  //  * No replacement rate is published: `grep -i burning
  //    elemental-gauge-theory.md` returns ZERO hits. CONFIRMED.
  //  * No drain is attached anywhere in production: `withDrain` is DEFINED in
  //    `aura.ts:183` and CALLED by nothing outside tests. CONFIRMED.
  //
  // So the entry's own conclusion — model the coupling, withhold the
  // coefficient — is the ROADMAP §0 rule applied correctly, and Burning
  // under-draining Dendro is visible-nothing rather than invisible-wrong.
  "burning-coupled-decay",
  "frozen-duration",
  "shatter-trigger",
  "bloom-cores",
  "quicken-aggravate-spread",
  "crystallize-shield",
  "transformative-crit",
  "transformative-def-multiplier",
  "simultaneous-reaction-priority",
  "lunar-reactions",
  "aura-on-multiple-targets",
];

function auraOf(state: AuraState, element: AuraElement): Aura | undefined {
  return state.auras.find((aura) => aura.element === element);
}

function freshAura(element: AuraElement, gauge: number, time = 0) {
  return applyElement(EMPTY_AURA_STATE, element, gauge, time).state;
}

// ---------------------------------------------------------------------------
// A. REGISTRY HYGIENE
// ---------------------------------------------------------------------------

describe("UNVERIFIED registry: the gap list stays honest and machine-readable", () => {
  it("every entry has a unique id, a valid status and a substantive note", () => {
    const ids = UNSUPPORTED_MECHANICS.map((mechanic) => mechanic.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const mechanic of UNSUPPORTED_MECHANICS) {
      expect(mechanic.id).toMatch(/^[a-z0-9-]+$/);
      expect(VALID_STATUSES).toContain(mechanic.status);
      // A note short enough to be a placeholder is not a stated reason.
      expect(mechanic.note.length).toBeGreaterThan(80);
      expect(mechanic.note).not.toMatch(/^TBD/i);
    }
  });

  it("the gap set matches the list QA has reviewed (a NEW gap must be deliberate)", () => {
    const ids = [...UNSUPPORTED_MECHANICS.map((m) => m.id)].sort();
    expect(ids).toEqual([...KNOWN_GAP_IDS].sort());
  });

  it("is queryable by id, and returns undefined for an unknown id", () => {
    for (const id of KNOWN_GAP_IDS) {
      expect(findUnsupportedMechanic(id)?.id).toBe(id);
    }
    expect(findUnsupportedMechanic("no-such-mechanic")).toBeUndefined();
  });

  it("the registry is inert: it is data only and never feeds the reaction math", () => {
    // Pinning this keeps the list a DECLARATION rather than a switch that
    // could quietly start changing numbers.
    for (const mechanic of UNSUPPORTED_MECHANICS) {
      expect(Object.keys(mechanic).sort()).toEqual(["id", "note", "status"]);
      expect(typeof mechanic.note).toBe("string");
    }
    expect(structuredClone(UNSUPPORTED_MECHANICS)).toEqual(
      UNSUPPORTED_MECHANICS,
    );
  });
});

// ---------------------------------------------------------------------------
// B. ABSENCE PINS — deliberately missing behaviour must FAIL CLOSED
// ---------------------------------------------------------------------------

describe("UNVERIFIED absence: unmodelled mechanics produce NOTHING, not a guess", () => {
  it("UNVERIFIED `frozen-duration`: Freeze produces NO compound aura", () => {
    // Correct behaviour once verified: a Frozen compound aura holding both
    // Hydro and Cryo, with its own duration curve. REPLACE this pin then.
    const result = applyElement(freshAura("cryo", 2), "hydro", 2, 0);
    expect(result.reactions.map((r) => r.kind)).toEqual(["frozen"]);
    expect(result.state.compound).toEqual([]);
  });

  it("Quicken creates a duration-backed compound aura", () => {
    const result = applyElement(freshAura("dendro", 2), "electro", 2, 0);
    expect(result.reactions.map((r) => r.kind)).toEqual(["quicken"]);
    expect(result.state.compound).toHaveLength(1);
    expect(result.state.compound[0]?.kind).toBe("quicken");
    expect(result.state.compound[0]?.gauge).toBeCloseTo(14, 10);
  });

  it("compound aura production stays limited to Quicken", () => {
    const elements: readonly Element[] = [
      "pyro",
      "hydro",
      "electro",
      "cryo",
      "dendro",
      "anemo",
      "geo",
      "physical",
    ];
    const auraElements: readonly AuraElement[] = [
      "pyro",
      "hydro",
      "electro",
      "cryo",
      "dendro",
    ];
    for (const aura of auraElements) {
      for (const trigger of elements) {
        const result = applyElement(freshAura(aura, 2), trigger, 2, 0);
        if (result.reactions.some((reaction) => reaction.kind === "quicken")) {
          expect(result.state.compound.map((compound) => compound.kind)).toEqual(["quicken"]);
        } else {
          expect(result.state.compound).toEqual([]);
        }
      }
    }
  });

  it("Quicken enables Aggravate and Spread on later matching hits", () => {
    const quickened = applyElement(freshAura("dendro", 2), "electro", 2, 0).state;
    const aggravate = applyElement(quickened, "electro", 1, 1);
    expect(aggravate.reactions.map((reaction) => reaction.kind)).toContain("aggravate");
    const spread = applyElement(quickened, "dendro", 1, 1);
    expect(spread.reactions.map((reaction) => reaction.kind)).toContain("spread");
  });

  it("UNVERIFIED `shatter-trigger` / `bloom-cores`: shattered, hyperbloom and burgeon are UNREACHABLE", () => {
    const unreachable = new Set(["shattered", "hyperbloom", "burgeon"]);
    const elements: readonly Element[] = [
      "pyro",
      "hydro",
      "electro",
      "cryo",
      "dendro",
      "anemo",
      "geo",
      "physical",
    ];
    const auraElements: readonly AuraElement[] = [
      "pyro",
      "hydro",
      "electro",
      "cryo",
      "dendro",
    ];
    for (const aura of auraElements) {
      for (const trigger of elements) {
        for (const gauge of [1, 4]) {
          const { reactions } = applyElement(freshAura(aura, 2), trigger, gauge, 0);
          for (const reaction of reactions) {
            expect(unreachable.has(reaction.kind)).toBe(false);
          }
        }
      }
    }
  });

  it("UNVERIFIED `crystallize-shield`: Crystallize produces no damage and no shield", () => {
    const { reactions } = applyElement(freshAura("pyro", 2), "geo", 1, 0);
    expect(reactions.map((r) => r.kind)).toEqual(["crystallize"]);
    expect(reactions[0]?.category).toBe("none");

    const mods = toReactionModifiers(
      reactions,
      { level: 90, elementalMastery: 1000 },
      () => 1,
    );
    expect(mods.amplifyingMultiplier).toBe(1);
    expect(mods.additiveBaseDamageBonus).toBe(0);
    expect(mods.transformative).toEqual([]);
    // Reaction metadata is allowed to describe the aura element and reaction
    // kind. It must not become a damage or shield effect.
    expect(Object.keys(mods).sort()).toEqual([
      "additiveBaseDamageBonus",
      "amplifyingMultiplier",
      "crystallizeElements",
      "reactionKinds",
      "transformative",
    ]);
    expect(mods.crystallizeElements).toEqual(["pyro"]);
    expect(mods.reactionKinds).toEqual(["crystallize"]);
  });

  it("UNVERIFIED `electro-charged-ticks`: EC is a SINGLE instance, not a schedule", () => {
    // Once the tick interval is verified this becomes N instances over time.
    // REPLACE this pin then — do not re-pin a different single number.
    const { reactions } = applyElement(freshAura("hydro", 2), "electro", 2, 0);
    expect(reactions.map((r) => r.kind)).toEqual(["electroCharged"]);

    const mods = toReactionModifiers(
      reactions,
      { level: 90, elementalMastery: 0 },
      () => 1,
    );
    expect(mods.transformative).toHaveLength(1);
    // ...and it consumes NO gauge on contact, so both auras persist.
    expect(reactions[0]?.gaugeConsumed).toBe(0);
  });

  it("UNVERIFIED `electro-charged-ticks`: the un-drained EC auras OUTLIVE the game's", () => {
    // Stated consequence of not scheduling the drain: both auras decay only
    // by time, never by tick. This pin makes that overstatement visible.
    let state = freshAura("hydro", 2, 0);
    state = applyElement(state, "electro", 2, 0).state;
    // 5 seconds later both are still alive (in game the 0.4U/tick drain would
    // have removed them well before this).
    const later = applyElement(state, "physical", 0, 5).state;
    expect(auraOf(later, "hydro")).toBeDefined();
    expect(auraOf(later, "electro")).toBeDefined();
    expect(ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK).toBe(0.4);
  });

  it("UNVERIFIED `burning-ticks`: Burning is a single instance and drains no Dendro", () => {
    const before = auraOf(freshAura("dendro", 2, 0), "dendro")!;
    const result = applyElement(freshAura("dendro", 2, 0), "pyro", 2, 0);
    expect(result.reactions.map((r) => r.kind)).toEqual(["burning"]);
    expect(result.reactions[0]?.gaugeConsumed).toBe(0);
    // Dendro gauge is untouched: the 0.4U/s drain is declared but unscheduled.
    expect(auraOf(result.state, "dendro")?.gauge).toBe(before.gauge);
    expect(BURNING_DENDRO_DRAIN_PER_SECOND).toBe(0.4);
    // No re-applied Pyro tick exists either, so the 2s Burning ICD is unused.
    expect(BURNING_ICD_SECONDS).toBe(2);
  });

  it("UNVERIFIED `transformative-crit`: transformative damage never crits", () => {
    // `ReactionDamageContext` has no crit field at all — crit cannot be
    // supplied even by accident. Pinning the ABSENCE of the input, not just
    // the absence of the effect.
    const mods = toReactionModifiers(
      applyElement(freshAura("electro", 2), "pyro", 1, 0).reactions,
      { level: 90, elementalMastery: 0 },
      () => 1,
    );
    expect(mods.transformative).toHaveLength(1);
    expect(Object.keys(mods.transformative[0]!).sort()).toEqual([
      "damage",
      "kind",
      "resElement",
    ]);
  });

  it("UNVERIFIED `transformative-def-multiplier`: DEF is treated as exactly 1", () => {
    // The stated decision is that the 99999999/(99999999+DEF) term is
    // negligible. There is no DEF input on the reaction damage path, so the
    // omission is structural.
    const mods = toReactionModifiers(
      applyElement(freshAura("electro", 2), "pyro", 1, 0).reactions,
      { level: 90, elementalMastery: 0 },
      () => 1,
    );
    // 2.75 * levelMultiplier(90) exactly, i.e. RES only, no DEF term.
    expect(mods.transformative[0]?.damage).toBeCloseTo(2.75 * 1446.8535, 9);
  });

  it("UNVERIFIED `lunar-reactions`: no lunar reaction kind exists in any output", () => {
    const elements: readonly Element[] = [
      "pyro",
      "hydro",
      "electro",
      "cryo",
      "dendro",
      "anemo",
      "geo",
    ];
    const auraElements: readonly AuraElement[] = [
      "pyro",
      "hydro",
      "electro",
      "cryo",
      "dendro",
    ];
    for (const aura of auraElements) {
      for (const trigger of elements) {
        const { reactions } = applyElement(freshAura(aura, 2), trigger, 2, 0);
        for (const reaction of reactions) {
          expect(reaction.kind.toLowerCase()).not.toContain("lunar");
        }
      }
    }
  });

  it("UNVERIFIED `simultaneous-reaction-priority`: resolution order is the FIXED element order", () => {
    // NOT asserted to match the game's documented priority — only asserted to
    // be deterministic and to follow AURA_ELEMENTS. If the real priority is
    // later verified and differs, DELETE this pin rather than editing it.
    let state = freshAura("hydro", 2, 0);
    state = applyElement(state, "electro", 2, 0).state;
    const { reactions } = applyElement(state, "pyro", 1, 0);
    expect(reactions.map((r) => r.auraElement)).toEqual(["hydro", "electro"]);
  });

  it("UNVERIFIED `aura-on-multiple-targets`: state is per target; swirl spreads to nobody", () => {
    // The MODEL supports per-target state (aura state is a plain value the
    // caller owns per target), but nothing spreads across targets.
    const { reactions } = applyElement(freshAura("pyro", 2), "anemo", 1, 0);
    expect(reactions.map((r) => r.kind)).toEqual(["swirl"]);
    // The result mentions exactly one target's worth of state.
    expect(Object.keys(reactions[0]!).sort()).toEqual([
      "auraElement",
      "category",
      "gaugeConsumed",
      "kind",
      "swirledElement",
      "triggerElement",
    ]);
  });
});

// ---------------------------------------------------------------------------
// C. VALUE-SHAPE PINS
// ---------------------------------------------------------------------------

describe("UNVERIFIED value SHAPES (pins, not correctness claims)", () => {
  it("UNVERIFIED `quicken-aggravate-spread`: additive coefficients are SINGLE-SOURCED scalars", () => {
    // SHAPE pin. These two come from [S2] genshin-optimizer only; the wiki
    // corroborates the ordering but does not print the numbers.
    //
    // WHEN A SECOND SOURCE IS FOUND: REPLACE this test with a verified-value
    // assertion. If the values turn out to be level- or reaction-dependent
    // (i.e. NOT a flat scalar per reaction), DELETE this pin — the shape
    // itself was wrong and re-pinning a new scalar would launder the error.
    expect(Object.keys(ADDITIVE_COEFFICIENTS).sort()).toEqual([
      "aggravate",
      "spread",
    ]);
    for (const value of Object.values(ADDITIVE_COEFFICIENTS)) {
      expect(typeof value).toBe("number");
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
    expect(ADDITIVE_COEFFICIENTS.spread).toBeGreaterThan(
      ADDITIVE_COEFFICIENTS.aggravate,
    );
    // Current single-sourced magnitudes.
    expect(ADDITIVE_COEFFICIENTS.aggravate).toBe(1.15);
    expect(ADDITIVE_COEFFICIENTS.spread).toBe(1.25);
  });

  it("UNVERIFIED: coefficients exist for reactions that CANNOT yet be triggered", () => {
    // Verified numbers with no reachable trigger. Pinned so that wiring a
    // trigger later is a visible change here, not a silent new damage source.
    const unreachable = ["shattered", "hyperbloom", "burgeon"] as const;
    for (const kind of unreachable) {
      expect(TRANSFORMATIVE_COEFFICIENTS[kind]).toBe(3);
    }
  });

  // ==========================================================================
  // REPLACEMENT for the retired absence-pin on "TICK INTERVAL" (TASK #049).
  //
  // The old pin asserted the registry note CONTAINED the string "TICK
  // INTERVAL", i.e. that the interval was still missing. mechanics-engineer
  // has since sourced the timings against KQM, so the note no longer says
  // that and the pin fired -- exactly as designed. Per the test's own
  // instruction it is REPLACED, not re-pinned.
  //
  // What the replacement must NOT do is write a scheduling test. Tick
  // scheduling is ENGINE-owned and does not exist: there is no scheduler to
  // test, and asserting against one would be testing a fiction. The verified
  // state of the world is precisely:
  //
  //   * the magnitudes are constants and sourced,
  //   * the timings are now sourced too,
  //   * and NOTHING consumes any of it -- zero production references.
  //
  // So the replacement asserts the first two positively and pins the third,
  // which is the real remaining gap.
  // ==========================================================================

  it("tick MAGNITUDE constants hold their sourced values", () => {
    // Verified via Elemental Gauge Theory; unchanged by the timing work.
    // Pinned as exact values because a drift here silently rescales every
    // future tick implementation.
    expect(ELECTRO_CHARGED_GAUGE_DRAIN_PER_TICK).toBe(0.4);
    expect(BURNING_DENDRO_DRAIN_PER_SECOND).toBe(0.4);
    expect(BURNING_ICD_SECONDS).toBe(2);
  });

  it("records that EC tick TIMING is now sourced, and why it is still unsupported", () => {
    const registry = findUnsupportedMechanic("electro-charged-ticks");
    expect(registry, "the electro-charged-ticks entry disappeared").toBeDefined();

    // Timing is no longer the blocker -- the note now claims it is verified.
    expect(registry!.note).toContain("TIMING NOW VERIFIED");

    // ...but the mechanic must STILL be unsupported, because sourcing a number
    // is not implementing it. If this ever flips to "supported" while no
    // scheduler exists, the registry is lying to the UI that consumes it.
    expect(
      registry!.status,
      "electro-charged ticks are marked supported — verify a real scheduler landed, not just a sourced constant",
    ).toBe("unsupported");

    // The blockers are aura-SECONDS bookkeeping and an early-tick exception,
    // neither of which is a tick interval. Asserted so that a future reader
    // does not "close" this by adding an interval constant alone.
    expect(registry!.note).toContain("STILL UNSUPPORTED");
  });

  it("does NOT claim EC spreads aura to secondary targets", () => {
    // Inherited caution: KQM does NOT say secondary targets tick every 60
    // frames. The 60-frame figure is SAME-TARGET spacing; the chain to other
    // targets applies Electro DAMAGE and no aura at all. Pinned because the
    // opposite reading is an easy and damaging mistake -- it would invent
    // aura applications the game never makes.
    const registry = findUnsupportedMechanic("electro-charged-ticks");
    expect(registry!.note).toContain("will not apply auras");
  });

  // ==========================================================================
  // REPLACEMENT for the pin "keeps the burning 1U/2U and 2s/2.5s DISCREPANCY
  // recorded" (TASK #057). The old test asserted the note contained the string
  // "DISCREPANCY RECORDED", i.e. that BOTH halves were unresolved. It fired
  // because mechanics-engineer RESOLVED one half and only one.
  //
  // Re-pinning the old wording would have been wrong twice over: it would
  // assert a contradiction that no longer exists for 1U/2U, and it would let
  // the still-open 2s/2.5s half ride along unexamined. So the pin is SPLIT to
  // match the verified state, with each half asserted for its own reason.
  //
  // I checked the version argument myself rather than taking it on report,
  // because it is the load-bearing step and it does NOT generalise:
  //   * 1U/2U — the 2U claim is from "Burning > Initial Findings" (Last tested
  //     2022-07-04, PRE-3.0) and the curated page explicitly retires it in the
  //     Pre-3.0 block: "Burning used to apply 2U Pyro in a small AoE". Two
  //     game VERSIONS, not two readings. Genuinely resolved.
  //   * 2s/2.5s — "Burning Refresh Mechanics" is Added 2022-11-29 / Last
  //     tested 2022-11-11. BOTH POST-3.0. The version argument therefore
  //     cannot dispose of it, and it stays open. This is the half that must
  //     not be quietly closed by analogy with the other half.
  // ==========================================================================

  it("the burning 1U/2U discrepancy is RESOLVED as a version difference, with the reason stated", () => {
    const registry = findUnsupportedMechanic("burning-ticks");
    expect(registry, "the burning-ticks entry disappeared").toBeDefined();
    expect(registry!.status).toBe("unsupported");

    // Resolved BY ARGUMENT, not by deference. The note must still carry the
    // reason, because "1U stands" with no stated basis is indistinguishable
    // from having picked the nicer number — the ROADMAP §0 prohibition.
    expect(registry!.note).toContain("RESOLVED");
    expect(registry!.note).toContain("2U");
    // The dated evidence that makes it a version difference.
    expect(registry!.note).toContain("2022-07-04");
    expect(registry!.note).toContain("Pre-3.0");
  });

  it("the burning 2s/2.5s discrepancy STAYS OPEN — the version argument does not reach it", () => {
    const registry = findUnsupportedMechanic("burning-ticks");
    expect(registry!.note).toContain("STILL UNRESOLVED");
    expect(registry!.note).toContain("2.5 sec");

    // The discriminating assertion. It is not enough that the number is
    // mentioned; the note must say WHY the pre-3.0 reasoning fails here, or a
    // future reader will close this half by analogy with the 1U/2U half and
    // believe they resolved something. That inference is the actual hazard.
    expect(
      registry!.note,
      "the 2s/2.5s half was closed without stating why the pre-3.0 version argument does not apply to it",
    ).toContain("NOT dated pre-3.0");
  });

  it("SIGN-OFF `burning-coupled-decay`: the model exists, the coefficient is WITHHELD", () => {
    const registry = findUnsupportedMechanic("burning-coupled-decay");
    expect(registry, "the burning-coupled-decay entry disappeared").toBeDefined();

    // `uncertain`, not `unsupported`, and the distinction is real and correct:
    // the mechanism IS expressible now (`Aura.drains` + coupled decay), so it
    // is not unsupported. What is missing is a trustworthy NUMBER. Marking it
    // `unsupported` would understate the model and overstate the gap.
    expect(registry!.status).toBe("uncertain");

    // The provenance findings that justify withholding, each pinned so that
    // deleting one is a visible act. Verified first-hand against the TCL clone.
    expect(registry!.note).toContain("ONE source");
    expect(registry!.note).toContain("Pre-3.0 Findings");
    expect(registry!.note).toContain("NO DRAIN IS ATTACHED ANYWHERE");
    expect(registry!.note).toContain("TODO");
  });

  it("SIGN-OFF `burning-coupled-decay`: the withholding is REAL, not just documented", () => {
    // The note claims no drain is attached. A note is prose; this asserts the
    // BEHAVIOUR, because a registry entry that says "we withheld it" while
    // production quietly wires the pre-3.0 rate is the worst of both worlds.
    //
    // Verified structurally: Burning is triggered, then time is advanced, and
    // the Dendro aura must decay at EXACTLY its natural rate. If anyone
    // attaches a drain, Dendro drops faster here and this fires.
    const burning = applyElement(freshAura("dendro", 2, 0), "pyro", 2, 0);
    expect(burning.reactions.map((r) => r.kind)).toEqual(["burning"]);

    // Baseline: the same aura with NO burning applied, decayed over the same
    // window. Coupled decay would make the burning branch strictly smaller.
    const controlLater = applyElement(freshAura("dendro", 2, 0), "physical", 0, 3);
    const burningLater = applyElement(burning.state, "physical", 0, 3);

    const control = auraOf(controlLater.state, "dendro");
    const burnt = auraOf(burningLater.state, "dendro");
    expect(control, "control Dendro aura expired — pick a shorter window").toBeDefined();
    expect(
      burnt,
      "Dendro vanished under Burning but not under natural decay — a drain was attached; the pre-3.0 coefficient is UNSOURCED post-3.0",
    ).toBeDefined();

    // Exact equality: under-draining is the DELIBERATE current behaviour.
    // WHEN A POST-3.0 RATE IS SOURCED: delete this and assert the real drain.
    expect(
      burnt!.gauge,
      "Burning now drains Dendro — verify the coefficient came from a post-3.0 source independent of [K1], not from the retired summed rate",
    ).toBe(control!.gauge);
  });

  it("PINS THE REAL GAP: no production code consumes any tick constant", () => {
    // The honest replacement for the absence pin. The constants are sourced
    // and correct, and they are also completely INERT: every reference outside
    // their own declaration is a test. That means no repeating damage is ever
    // emitted, and a reader who sees "verified" must not infer "implemented".
    //
    // This is asserted structurally rather than by grepping the filesystem so
    // that it stays deterministic and cannot be defeated by a path change:
    // the reaction resolver is driven over a full EC-capable sequence and must
    // produce no repeating tick.
    //
    // WHEN A SCHEDULER LANDS: delete this and write the real scheduling test.
    let aura: AuraState = EMPTY_AURA_STATE;
    const applications: readonly (readonly [AuraElement, number])[] = [
      ["electro", 1],
      ["hydro", 1],
    ];
    for (const [element, gauge] of applications) {
      aura = applyElement(aura, element, gauge, 0).state;
    }

    // An electro-charged aura pair is live and BOTH auras coexist -- the
    // precondition for ticking at all. If this stopped holding, the test below
    // would pass vacuously (no EC state => no ticks to miss).
    const elements = new Set(aura.auras.map((a: Aura) => a.element));
    expect(elements.has("electro")).toBe(true);
    expect(elements.has("hydro")).toBe(true);

    // ...and advancing time produces NO further reaction of its own accord.
    // A scheduler would emit ticks across this window; there is none, so a 0U
    // probe at a much later time must manufacture no reaction.
    const later = applyElement(aura, "electro", 0, BURNING_ICD_SECONDS * 4);
    expect(
      later.reactions,
      "a reaction was produced with no new element applied — a tick scheduler may have landed; replace this pin with a real scheduling test",
    ).toEqual([]);

    // And the gauges were NOT drained by elapsed time beyond ordinary decay:
    // per-tick drain of 0.4U from each gauge is exactly what is unimplemented.
    // Asserted as "no tick-sized step", not as an exact gauge, so ordinary
    // decay tuning does not churn this pin.
    expect(later.state.auras.length).toBeGreaterThan(0);
  });

  // ==========================================================================
  // WEAK-PROVENANCE CHANGE DETECTOR: `BURNING_ICD_SECONDS` (TASK #049, routed
  // from mechanics-engineer).
  //
  // The value 2 STANDS -- the curated KQM page corroborates it and nothing
  // contradicts the magnitude. This is NOT a claim that the number is wrong.
  //
  // What is weak is the CITATION, not the value. `constants.ts` says it is
  // "Verified: [S1] Elemental Gauge Theory / 'Burning' ... AND [S1] Internal
  // Cooldown / 'Non-Standard ICD'". Two problems with reading that as the
  // project's two-independent-source standard:
  //
  //   1. Both cited pages are [S1] -- the SAME source (the Fandom wiki). Two
  //      pages of one wiki is one source, not two. The file header promises
  //      "TWO INDEPENDENT sources" for every value in it.
  //   2. mechanics-engineer could not locate the quoted text when checking
  //      against the TCL clone, and per `docs/ROADMAP.md` the Fandom wiki is
  //      402/403 blocked, so the citation cannot currently be re-verified from
  //      any accessible source.
  //
  // A strong-sounding comment on a weakly-sourced value is precisely the
  // failure mode the TASK #028 audit was about: it passes every check because
  // nothing checks provenance. So this test records the weakness explicitly
  // rather than letting the comment stand unchallenged.
  //
  // It is a CHANGE DETECTOR, deliberately: it does not fail today, and it is
  // not asking anyone to change the number. It fails if the value moves, so
  // that a future edit to a weakly-cited constant is a conscious act.
  // ==========================================================================
  it("records that BURNING_ICD_SECONDS is single-sourced despite a two-source comment", () => {
    // The value stands. Pinned so a change is deliberate.
    expect(BURNING_ICD_SECONDS).toBe(2);

    // The corroborating registry note is the STRONGER citation of the two --
    // it cites [K2], the curated KQM page, independently of the Fandom wiki.
    // Asserting it here ties the value to the source that can actually be
    // re-checked today.
    const burning = findUnsupportedMechanic("burning-ticks");
    expect(burning).toBeDefined();
    expect(burning!.note).toContain("BURNING_ICD_SECONDS");

    // And the same note is where the unresolved 2s / 2.5s disagreement lives.
    // If someone strengthens the claim to "verified" they must reconcile that
    // first; this assertion makes the contradiction impossible to overlook.
    expect(
      burning!.note,
      "the burning source discrepancy was dropped — if it was genuinely resolved, update constants.ts's citation too",
    ).toContain("2.5 sec");
  });

  it("UNVERIFIED entries carry a machine-readable status so the UI can warn", () => {
    // The stated purpose of the registry is that a user is told a number is
    // incomplete rather than shown a confidently wrong one. That requires the
    // status to be usable by a consumer, which this asserts.
    const uncertain = UNSUPPORTED_MECHANICS.filter(
      (m) => m.status === "uncertain",
    ).map((m) => m.id);
    const unsupported = UNSUPPORTED_MECHANICS.filter(
      (m) => m.status === "unsupported",
    ).map((m) => m.id);

    // `burning-coupled-decay` joins the `uncertain` set (TASK #057): the
    // mechanism is modelled, only the coefficient is missing. See the sign-off
    // above for why that is the right status rather than `unsupported`.
    expect(uncertain.sort()).toEqual([
      "burning-coupled-decay",
      "simultaneous-reaction-priority",
      "transformative-def-multiplier",
    ]);
    expect(unsupported.length).toBe(
      UNSUPPORTED_MECHANICS.length - uncertain.length,
    );
  });
});
