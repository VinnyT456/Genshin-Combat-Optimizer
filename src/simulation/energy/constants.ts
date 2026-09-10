// ============================================================================
// Energy / particle model constants.
//
// Phase 2 uses a particle model scaled by party size.
//
// Sources (verified 2026-09-02):
//   - KQM Theorycrafting Library — library.keqingmains.com/combat-mechanics/energy
//   - Genshin Impact Wiki — "Energy"
//
// Items below marked VERIFIED were checked against both sources. Items still
// marked UNCERTAIN could NOT be confirmed from an accessible source and must be
// validated before any result depending on them is treated as authoritative.
// ============================================================================

/**
 * Base energy a single particle is worth to an ON-ELEMENT receiver who is
 * ON-FIELD, before Energy Recharge.
 *
 * VERIFIED (KQM, Wiki): on-field, same-element, 100% ER == 3 energy.
 * Orbs are worth 9; game-data expresses an orb via
 * `ParticleEmission.baseEnergyPerUnit` rather than a second constant.
 */
export const PARTICLE_BASE_ENERGY = 3;

/**
 * Energy an ON-FIELD receiver gains from a particle of a DIFFERENT element,
 * before Energy Recharge. VERIFIED (KQM, Wiki): 1 energy.
 *
 * Declared explicitly so the documented 3-energy / 1-energy pair stays visible
 * in the source; the multiplier below is derived from it rather than written as
 * an unexplained float.
 */
const OFF_ELEMENT_PARTICLE_ENERGY = 1;

/**
 * Multiplier applied when the receiving character's element MATCHES the
 * particle element. VERIFIED (KQM, Wiki).
 */
export const PARTICLE_MATCHING_ELEMENT_MULTIPLIER = 1;

/**
 * Multiplier when the particle is elemental but does NOT match the receiver's
 * element.
 *
 * VERIFIED (KQM, Wiki): a different-element particle gives 1 energy where a
 * same-element particle gives 3, so the ratio is exactly 1/3 (NOT 0.5, which
 * an earlier revision used and which overstated every off-element gain by ~50%).
 *
 * Derived from the two documented energy values so the 3 -> 1 relationship is
 * legible and a correction to either number flows through automatically.
 * Cross-check: KQM's off-field figures are 1.8 same-element and 0.6
 * different-element in a 4-party — exactly 3*0.6 and (3*1/3)*0.6 — confirming
 * the element factor and the party-size factor each apply exactly once.
 */
export const PARTICLE_OFF_ELEMENT_MULTIPLIER =
  OFF_ELEMENT_PARTICLE_ENERGY / PARTICLE_BASE_ENERGY;

/**
 * Multiplier for colourless particles (modelled as `element: "physical"`).
 * Community figure: 0.6.
 *
 * UNCERTAIN — NOT verified. Could not be confirmed from an accessible source,
 * and it may additionally be party-size dependent (in which case this scalar is
 * the wrong shape and it should become a table like the one below). Left at the
 * community value deliberately rather than guessed at something else.
 */
export const PARTICLE_COLORLESS_MULTIPLIER = 0.6;

/**
 * Off-field share of a particle's value, indexed by party size. Applied to
 * OFF-FIELD members only; the on-field collector always receives full value.
 *
 * VERIFIED (KQM): off-field units gain 60% in a 4-party, 70% in a 3-party and
 * 80% in a 2-party. This factor is SEPARATE from the element multiplier above —
 * the two compose, they do not double-count.
 *
 * Kept as data so a future correction is a one-line change here, never an
 * engine edit.
 */
export const OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE: Readonly<
  Record<number, number>
> = { 1: 1.0, 2: 0.8, 3: 0.7, 4: 0.6 };

/** Fallback share for party sizes outside the table above (full 4-party value). */
export const OFF_FIELD_PARTICLE_SHARE_FALLBACK = 0.6;
