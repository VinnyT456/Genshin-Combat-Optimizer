import { describe, expect, it } from "vitest";
import type {
  EnemyModifiers,
  EnemyModifierResolver,
  Rotation,
  SimulationConfig,
} from "@/types";
import { NO_ENEMY_MODIFIERS } from "@/types";
import { simulateRotation } from "@/simulation/engine";
import { defMultiplier, MAX_DEF_REDUCTION } from "@/simulation/damage/pipeline";
import { makeTestCharacter, NEUTRAL_ENEMY } from "@/tests/helpers/fixtures";

// ============================================================================
// B1 — the 90% DEF-reduction cap, exercised through the FULL ENGINE PATH.
//
// `enemyShred.test.ts` pins the cap on `defMultiplier` directly. That is a unit
// test on a pure function: it proves the arithmetic, but NOT that the shred a
// caller supplies actually reaches that arithmetic. The seam being wired is a
// separate claim from the formula being right, and only the second one had
// coverage.
//
// These tests drive `simulateRotation(..., { enemyModifierResolver })` — the
// same entry point the optimizer and frontend use — so they fail if anyone
// unhooks `resolveEnemyModifiers` from the pipeline, even with `defMultiplier`
// left perfectly correct.
//
// MUTATION-VERIFIED (outside the tree): setting `MAX_DEF_REDUCTION = 1.0`
// changes the 103%-stack result from 1818.18 to 2000 through this path, i.e.
// the +10% overstatement this cap was added to remove. Setting it back
// restores 1818.18. The cap is therefore observable end-to-end, not just in
// the unit.
// ============================================================================

const NO_CRIT: SimulationConfig = { critMode: "never" };

const SKILL_ONLY: Rotation = [
  { characterId: "a", actionType: "skill", abilityId: "a-e" },
];

/**
 * The real stacked-shred case from the KQM cap discussion:
 * Lisa A4 15% + Klee C2 23% + Ayaka C4 30% + Razor C4 15% + Zhongli 20%.
 * Sums to 103%, which is why the cap exists at all.
 */
const LISA_A4 = 0.15;
const KLEE_C2 = 0.23;
const AYAKA_C4 = 0.3;
const RAZOR_C4 = 0.15;
const ZHONGLI_SHRED = 0.2;
const STACKED_SHRED =
  LISA_A4 + KLEE_C2 + AYAKA_C4 + RAZOR_C4 + ZHONGLI_SHRED;

function resolverWith(defReduction: number): EnemyModifierResolver {
  const modifiers: EnemyModifiers = { ...NO_ENEMY_MODIFIERS, defReduction };
  return () => modifiers;
}

/** Total damage of a single skill under `defReduction`, via the public API. */
function damageAtShred(defReduction: number): number {
  return simulateRotation([makeTestCharacter("a")], SKILL_ONLY, NEUTRAL_ENEMY, {
    ...NO_CRIT,
    enemyModifierResolver: resolverWith(defReduction),
  }).totalDamage;
}

describe("B1 — DEF shred reaches the pipeline through simulateRotation", () => {
  it("a stacked 103% shred is really 103% before clamping", () => {
    // Guards the fixture itself: if someone edits a constant so the stack no
    // longer exceeds the cap, the cap stops being under test and this fails
    // rather than passing vacuously.
    expect(STACKED_SHRED).toBeGreaterThan(MAX_DEF_REDUCTION);
    expect(STACKED_SHRED).toBeCloseTo(1.03, 10);
  });

  it("shred supplied by the resolver increases damage end-to-end", () => {
    // The seam is live: without it, these two would be equal.
    expect(damageAtShred(0.5)).toBeGreaterThan(damageAtShred(0));
  });

  it("clamps a 103% stack to exactly the 90% result", () => {
    expect(damageAtShred(STACKED_SHRED)).toBeCloseTo(
      damageAtShred(MAX_DEF_REDUCTION),
      10,
    );
  });

  it("does not let shred past the cap keep increasing damage", () => {
    // Monotonic up to the cap, flat after it. A missing clamp shows up here as
    // a strictly increasing sequence.
    const atCap = damageAtShred(MAX_DEF_REDUCTION);
    expect(damageAtShred(STACKED_SHRED)).toBeCloseTo(atCap, 10);
    expect(damageAtShred(2)).toBeCloseTo(atCap, 10);
    expect(damageAtShred(50)).toBeCloseTo(atCap, 10);
  });

  it("matches the analytic capped DEF multiplier, not the uncapped one", () => {
    const level = makeTestCharacter("a").level;
    const capped = defMultiplier(level, NEUTRAL_ENEMY.level, MAX_DEF_REDUCTION);
    // What an UNCAPPED 103% would have produced: DEF vanishes, multiplier 1.
    const uncapped = 1;

    const ratio = damageAtShred(STACKED_SHRED) / damageAtShred(0);
    const unshredded = defMultiplier(level, NEUTRAL_ENEMY.level, 0);

    expect(ratio).toBeCloseTo(capped / unshredded, 9);
    expect(ratio).not.toBeCloseTo(uncapped / unshredded, 3);
  });

  it("overstates by ~10.5% if the cap is removed (the corrected error)", () => {
    const level = makeTestCharacter("a").level;
    const capped = defMultiplier(level, NEUTRAL_ENEMY.level, MAX_DEF_REDUCTION);
    // Uncapped 103% drives the defender term to 0, so the multiplier is 1.0.
    const overstatement = 1 / capped - 1;
    expect(overstatement).toBeCloseTo(0.1, 2);
  });

  it("leaves DEF IGNORE uncapped — it is a separate KQM channel", () => {
    // KQM caps DEF REDUCTION only. If ignore were routed through the same
    // clamp, these two would collide.
    const modifiers: EnemyModifiers = {
      ...NO_ENEMY_MODIFIERS,
      defIgnore: 1,
    };
    const ignored = simulateRotation(
      [makeTestCharacter("a")],
      SKILL_ONLY,
      NEUTRAL_ENEMY,
      { ...NO_CRIT, enemyModifierResolver: () => modifiers },
    ).totalDamage;

    // 100% DEF ignore removes the defender term entirely, which is STRICTLY
    // better than the 90%-capped reduction.
    expect(ignored).toBeGreaterThan(damageAtShred(MAX_DEF_REDUCTION));
  });
});
