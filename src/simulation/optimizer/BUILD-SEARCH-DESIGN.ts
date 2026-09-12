// ============================================================================
// D1 — HISTORICAL BUILD-SEARCH DESIGN SNAPSHOT. NOTHING HERE IS IMPLEMENTED OR
// EXPORTED AS AN ALGORITHM.
//
// The current implementation plan is:
// docs/planning/OPTIMAL-SEARCH-AND-FEATURE-ROADMAP.md
//
// That plan supersedes two assumptions below: equipment can now affect legality
// through cooldown, resources, HP thresholds, triggers and action availability,
// not only ER; and exact search needs complete executable-effect identity rather
// than a resolved stat bag plus set keys. The analysis below remains useful
// historical rationale for alternating search, but is not an implementation
// contract.
//
// This file states, in compilable form, what a build-optimisation pass would
// require. It follows the precedent set by `CONTRACT.ts`: write the
// requirements down while changing them is still cheap, and do NOT implement
// against a data contract that is still moving.
//
// WHY NOT IMPLEMENT NOW. Weapon and artifact game data (ROADMAP B3) is being
// generated in parallel. The SHAPE exists (`resolveEquippedStats`,
// `countSetPieces`, `activeSetBonusKeys`); the VALUES do not, and weapon
// passives are still prose awaiting authoring as `Buff` data. Building a
// search over a space whose members do not yet exist would bake in assumptions
// about a contract that has not settled — the specific failure this project
// has already paid for once.
//
// ============================================================================
// 1. THE STRUCTURAL CLAIM: a build changes SCORING, not LEGALITY.
// ============================================================================
//
// This is the observation the whole design rests on, and it is verifiable
// against the current engine rather than assumed.
//
// `validateAction()` decides legality from cooldowns, energy, the combat
// window, the on-field character and ability existence. Equipment reaches the
// engine ONLY through `SimulationConfig.equippedStats`, a resolved `Stats` bag
// (src/types/index.ts). The engine, by explicit design, "does NOT know what a
// weapon or an artifact is".
//
// CONSEQUENCE: changing a build cannot make a legal rotation illegal, with ONE
// exception that must be handled rather than waved away —
//
//   ENERGY RECHARGE. ER is a stat, and energy availability IS a legality
//   condition (`insufficient-energy`). A build with less ER can make a burst
//   that was affordable become unaffordable. So the claim is precisely:
//
//     a build changes scoring, and changes legality ONLY through the energy
//     channel.
//
//   The D2 machinery already handles exactly this: an unaffordable burst is
//   skipped by the engine and reported as an action-level warning, which
//   `admitCandidate` detects. Re-scoring a rotation under a new build must
//   therefore go through the same admission check, and a rotation that fails
//   it under a given build is INVALID FOR THAT BUILD and must not be scored.
//   Silently scoring the truncated run would rank a build on a rotation it
//   cannot actually execute — the exact overclaim the project forbids.
//
// This is the reason the decomposition below is ALTERNATING rather than a
// single joint search: joint search over (rotation x build) is the product of
// two large spaces, while alternating exploits that the coupling is weak and
// one-directional almost everywhere.
//
// ============================================================================
// 2. THE DECOMPOSITION: alternating optimisation.
// ============================================================================
//
//   build_0   := a fixed, declared starting build
//   rotation_1 := optimizeRotation(team, enemy, cfg, { equippedStats: build_0 })
//   build_1   := optimizeBuild(team, enemy, rotation_1)
//   rotation_2 := optimizeRotation(team, enemy, cfg, { equippedStats: build_1 })
//   ... until neither pass improves the objective, or a round cap is hit.
//
// PROPERTIES, stated honestly:
//
//  * MONOTONE. Each pass optimises the same objective with the other argument
//    fixed, so the objective is non-decreasing across passes if each pass
//    keeps the incumbent as a candidate. That must be enforced explicitly:
//    a pass that cannot reproduce its own input can go DOWN.
//
//  * NOT GLOBALLY OPTIMAL, and it must never be described as such. Alternating
//    optimisation converges to a coordinate-wise local optimum. There exist
//    (rotation, build) pairs reachable only by changing both at once — e.g. a
//    build that is worse for the current rotation but enables a burst-heavy
//    rotation that is better overall. Reporting this as "the best build" would
//    be an overclaim. It is "the best build found by alternating search from
//    the declared starting point", and the starting point must be reported
//    with the result.
//
//  * TERMINATION needs a round cap regardless of the improvement test, because
//    a tie broken differently in two passes can cycle. With byte-identical
//    determinism a cycle is reproducible, not random, but it is still a hang.
//
// ============================================================================
// 3. WHY BUILD SEARCH IS NOT BEAM SEARCH.
// ============================================================================
//
// Rotation search is SEQUENTIAL: action i+1's legality and value depend on
// everything before it, which is what makes beam search (a partial-order
// frontier over prefixes) the right tool.
//
// A build has NO such sequence. It is a fixed-arity tuple over a STATIC space:
//
//     (weapon, flower, plume, sands, goblet, circlet, mainstats, ...)
//
// There is no "prefix of a build" whose score is meaningful — a half-equipped
// character is not a stage on the way to a full one, it is a different and
// worse character. Beam search over build slots would therefore prune on
// scores that do not predict the final score, which is the classic way to get
// a fast search that finds bad answers.
//
// The structure to exploit instead is that most of the space is DOMINATED:
// for a fixed slot and set, a strictly-worse-in-every-stat piece can never win.
// Candidate generation should be dominance-filtered per slot BEFORE any
// simulation, which is a data operation, not a search one.
//
// ============================================================================
// 4. NODE KEYING.
// ============================================================================
//
// A build node is keyed by the RESOLVED STAT BAG, not by the gear that
// produced it. Two different loadouts that resolve to the same `Stats` and the
// same active set-bonus keys are indistinguishable to the engine, so they must
// share a memo entry.
//
//   buildKey := for each character id, in SORTED id order:
//                 quantized(stat bag, fixed key order)
//                 + sorted(setBonusKeys)
//
// NOTES, each of which is a real hazard rather than boilerplate:
//
//  * SORTED KEY ORDER, always. `Object.entries` order on a stat bag depends on
//    construction order, which depends on which gear was folded in first. The
//    same determinism rule as `stateKey` applies verbatim.
//
//  * QUANTIZE the stats, for the same reason `stateKey` quantizes: a stat bag
//    is the result of accumulated arithmetic (`base * (1 + sum(pct)) + flat`),
//    so two builds equal in game terms can differ in the last ULP and hash
//    apart, silently disabling the memo.
//
//  * `setBonusKeys` MUST be part of the key and must NOT be re-derived from
//    the stat bag. A set bonus can be conditional (resolved by the mechanics
//    layer into a `Buff`) and therefore not visible in the flat bag at all.
//    Keying on the bag alone would merge two builds that behave differently.
//
//  * The key does NOT include the rotation. During a build pass the rotation
//    is FIXED, so it is a constant of the pass and belongs in the pass
//    identity, not in the per-node key.
//
// ============================================================================
// 5. AVOIDING RE-DERIVATION OF THE TIMELINE PER BUILD.
// ============================================================================
//
// This is the question that decides whether build search is affordable, and it
// is worth being precise about what CAN and CANNOT be reused.
//
// THE TEMPTING ANSWER, AND WHY IT IS WRONG. "Damage is linear in ATK, so
// simulate the timeline once and re-scale the damage numbers per build."
// That is false in this engine, for reasons that are all real game mechanics:
//
//   * CRIT is a weighted average of crit/non-crit; crit rate and crit damage
//     enter multiplicatively, not as a scalar on a fixed number.
//   * REACTIONS depend on EM non-linearly (the amplifying-reaction EM term is
//     a saturating rational function), and transformative reaction damage does
//     not scale with ATK at all.
//   * ER changes ENERGY, which changes WHICH ACTIONS EXECUTE (see §1). A
//     different burst cadence is a different timeline, not a rescaled one.
//   * Conditional buffs (set bonuses, weapon passives) have thresholds on
//     stats, so a build can switch a buff on or off discontinuously.
//
// So the damage numbers cannot be reused. What CAN be reused:
//
//  (a) THE ACTION SEQUENCE. During a build pass the rotation is fixed input,
//      so candidate generation — the part that calls `validateAction` per
//      candidate per step — does not run at all. Build search performs ONE
//      `simulateRotation` per build, not one per action per build. This is the
//      dominant saving and it is structural, not an optimisation.
//
//  (b) DOMINANCE FILTERING before simulation, as in §3: the space is cut down
//      by data inspection, at zero engine cost.
//
//  (c) THE MEMO in §4: distinct loadouts resolving to one stat bag simulate
//      once.
//
// COST MODEL, using the numbers measured in `performance.test.ts`: a
// from-zero `simulateRotation` of a realistic rotation costs on the order of
// 30-200 us. A build pass is therefore ~B simulations for B surviving
// candidate builds, i.e. roughly `B * 100us`. B is the number that must be
// controlled by (b), and it is a DATA question that cannot be answered until
// B3 lands. That is the second reason this file is design-only: the
// feasibility of the pass depends on a candidate count nobody can currently
// measure.
//
// NOTE ON `resumeFrom`: it does NOT help build search. Resume replays a
// SUFFIX under the SAME configuration; a build change alters the stat bag from
// t=0, so no prefix snapshot taken under build X is valid under build Y.
// Build search is one full simulation per candidate, unavoidably.
//
// ============================================================================
// 6. WHAT IS NEEDED FROM THE ENGINE.
// ============================================================================
//
// GOOD NEWS: the required seam ALREADY EXISTS and no engine change is needed
// to start. `SimulationConfig.equippedStats` is per-character resolved
// `Stats`, explicitly additive, and `resolveEquippedStats()` produces exactly
// that from an `Equipment`. Verified present, not assumed.
//
// Outstanding needs, to be raised with the Manager only when B3 lands and the
// pass is actually scheduled:
//
//   1. SET-BONUS RESOLUTION. `resolveEquippedStats` returns `setBonusKeys`
//      "for the mechanics layer to resolve into buffs". The optimizer must NOT
//      resolve them itself (that would be reimplementing mechanics). Needed:
//      a documented path for handing `setBonusKeys` to the engine alongside
//      `equippedStats`. If none exists, conditional set bonuses are silently
//      absent from every build score, which would make build search rank on
//      an incomplete model — fail closed and report, do not guess.
//
//   2. Nothing else. Damage, energy and reaction math stay entirely inside the
//      engine, as the black-box rule requires.
//
// ============================================================================
// 7. SCOPE QUESTION FOR THE PRODUCT OWNER (ROADMAP §6, open question 3).
// ============================================================================
//
// "Is build optimisation in scope, or does the tool stay rotation-only?" is
// listed as an OPEN product decision. This design does not settle it; it makes
// the cost and the honesty constraints explicit so the decision can be made
// with real information:
//
//   * Cost is ~one engine call per candidate build per pass, times a small
//     number of passes.
//   * The result is a LOCAL optimum and must be labelled as such in the UI.
//   * Its quality is bounded by artifact/weapon data quality, which is
//     currently unauthored, and by whether conditional set bonuses can be
//     resolved (need 1 above).
//
// ============================================================================

export {};
