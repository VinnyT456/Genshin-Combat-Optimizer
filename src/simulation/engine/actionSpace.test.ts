import { describe, expect, it } from "vitest";
import type { ActionType, DamageType, Rotation } from "@/types";
import {
  ABILITY_ACTION_TYPES,
  ALL_ACTION_TYPES,
  FIRST_NORMAL_STRING_INDEX,
  advanceNormalStringIndex,
  SWAP_DAMAGE_TYPE,
  damageTypeForActionType,
  isAbilityActionType,
  normalStringIndexOf,
  resolveNormalStringIndex,
} from "@/simulation/engine/actionSpace";
import { abilityForAction, validateAction } from "@/simulation/engine/validateAction";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import type { AbilitySlot } from "@/simulation/character/kit";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";

const NO_CRIT = { critMode: "never" } as const;

// ============================================================================
// B2 — the kit's action space must be ADDRESSABLE.
//
// `AbilitySlot` had six members; `ActionType` had four. Plunges and
// normal-string positions could be AUTHORED and DESCRIBED but never REQUESTED.
// That is worse than a validation gap: `validateAction()` never under-reported,
// those candidates simply could not be constructed. Pruning cannot see a branch
// that was never proposed, so the search silently explored a smaller space.
// ============================================================================

describe("B2 — every ability slot is addressable as an action", () => {
  it("covers every AbilitySlot member", () => {
    // Compile-time proof: this mapping is exhaustive in BOTH directions, so
    // adding a slot without adding an action type fails typecheck here.
    const slotToAction: Record<AbilitySlot, ActionType> = {
      normal: "normal",
      charged: "charged",
      plungeLow: "plungeLow",
      plungeHigh: "plungeHigh",
      skill: "skill",
      burst: "burst",
    };
    for (const action of Object.values(slotToAction)) {
      expect(ALL_ACTION_TYPES).toContain(action);
    }
  });

  it("keeps every legacy action type valid (additive widening)", () => {
    for (const legacy of ["normal", "charged", "skill", "burst", "swap"] as const) {
      expect(ALL_ACTION_TYPES).toContain(legacy);
    }
  });

  it("separates ability actions from swap", () => {
    expect(ABILITY_ACTION_TYPES).not.toContain("swap");
    expect(ALL_ACTION_TYPES.filter(isAbilityActionType)).toEqual(
      ABILITY_ACTION_TYPES,
    );
  });

  it("enumerates in a fixed order (determinism of generated candidates)", () => {
    expect([...ALL_ACTION_TYPES]).toEqual([
      "normal",
      "charged",
      "plungeLow",
      "plungeHigh",
      "skill",
      "burst",
      "swap",
    ]);
  });
});

describe("B2 — ActionType -> DamageType is a real mapping, not a cast", () => {
  it("collapses both plunge slots onto one damage type", () => {
    // Manager ruling: DamageType stays COARSE. Low/high plunge are distinct
    // ACTIONS but the same KIND of damage, so the split must not reach the
    // damage pipeline, where it would have no meaning.
    expect(damageTypeForActionType("plungeLow")).toBe("plunge");
    expect(damageTypeForActionType("plungeHigh")).toBe("plunge");
  });

  it("is identity for the four legacy slots", () => {
    expect(damageTypeForActionType("normal")).toBe("normal");
    expect(damageTypeForActionType("charged")).toBe("charged");
    expect(damageTypeForActionType("skill")).toBe("skill");
    expect(damageTypeForActionType("burst")).toBe("burst");
  });

  it("is TOTAL over ActionType, including swap", () => {
    // Total so a caller never needs its own `=== "swap"` ternary — which is
    // exactly the ad-hoc conversion that broke when ActionType widened.
    expect(damageTypeForActionType("swap")).toBe(SWAP_DAMAGE_TYPE);
    for (const action of ALL_ACTION_TYPES) {
      expect(damageTypeForActionType(action)).toBeDefined();
    }
  });

  it("maps every ActionType to a real DamageType member", () => {
    const DAMAGE_TYPES: readonly DamageType[] = [
      "normal",
      "charged",
      "plunge",
      "skill",
      "burst",
    ];
    for (const action of ALL_ACTION_TYPES) {
      expect(DAMAGE_TYPES).toContain(damageTypeForActionType(action));
    }
  });

  it("preserves the pre-existing swap convention", () => {
    // qa's fixture used `"skill"` as the filler for swap; keeping it means the
    // routed one-line fixture change is behaviour-preserving.
    expect(SWAP_DAMAGE_TYPE).toBe("skill");
  });
});

describe("B2 — a plunge is REJECTED, not unrepresentable", () => {
  const states = new Map([
    [
      testPyro.id,
      {
        definition: testPyro,
        currentEnergy: 0,
        energy: { current: 0, max: testPyro.maxEnergy, totalGained: 0, totalSpent: 0 },
        cooldowns: {},
      },
    ],
  ]);

  it("resolves no ability for a plunge on a legacy character", () => {
    expect(
      abilityForAction(testPyro, {
        characterId: testPyro.id,
        actionType: "plungeHigh",
      }),
    ).toBeUndefined();
  });

  it("returns a machine-readable unknown-ability the optimizer can prune on", () => {
    const verdict = validateAction({
      action: { characterId: testPyro.id, actionType: "plungeLow" },
      states,
      time: 0,
      config: {},
    });
    expect(verdict.valid).toBe(false);
    if (verdict.valid) throw new Error("unreachable");
    expect(verdict.code).toBe("unknown-ability");
  });

  it("is skipped with a warning by the engine, never thrown", () => {
    const rotation: Rotation = [
      { characterId: testPyro.id, actionType: "plungeHigh" },
      { characterId: testPyro.id, actionType: "skill" },
    ];
    const r = simulateRotation([testPyro], rotation, testEnemy, NO_CRIT);
    expect(r.errors).toEqual([]);
    expect(r.structuredWarnings.map((w) => w.code)).toEqual(["unknown-ability"]);
    // The legal action after it still ran.
    expect(r.totalDamage).toBeGreaterThan(0);
  });
});

describe("B2 — normal-string positions are addressable", () => {
  it("defaults to the first hit when nothing is tracked", () => {
    expect(normalStringIndexOf({})).toBe(FIRST_NORMAL_STRING_INDEX);
    expect(normalStringIndexOf({ normalStringIndex: 2 })).toBe(2);
  });

  it("lets an action PIN a position, overriding tracked state", () => {
    const state = { normalStringIndex: 0 };
    expect(
      resolveNormalStringIndex({ characterId: "a", actionType: "normal" }, state),
    ).toBe(0);
    // The whole point: N2 WITHOUT having performed N1 is now expressible.
    expect(
      resolveNormalStringIndex(
        { characterId: "a", actionType: "normal", normalIndex: 1 },
        state,
      ),
    ).toBe(1);
  });

  it("walks and loops a string", () => {
    const LEN = 5;
    let i = FIRST_NORMAL_STRING_INDEX;
    const seen: number[] = [i];
    for (let n = 0; n < LEN; n++) {
      i = advanceNormalStringIndex(i, LEN, true);
      seen.push(i);
    }
    expect(seen).toEqual([0, 1, 2, 3, 4, 0]);
  });

  it("saturates rather than wrapping when the string does not loop", () => {
    expect(advanceNormalStringIndex(3, 4, false)).toBe(3);
    expect(advanceNormalStringIndex(3, 4, true)).toBe(0);
  });

  it("never returns a negative or out-of-range index for an empty string", () => {
    expect(advanceNormalStringIndex(0, 0, true)).toBe(FIRST_NORMAL_STRING_INDEX);
    expect(advanceNormalStringIndex(0, 0, false)).toBe(FIRST_NORMAL_STRING_INDEX);
  });

  it("rejects an out-of-range index on a legacy 1-entry string", () => {
    // NOT clamped to N1: silently running a different ability would produce
    // plausible-but-wrong numbers, which is the failure mode being closed.
    expect(
      abilityForAction(testPyro, {
        characterId: testPyro.id,
        actionType: "normal",
        normalIndex: 1,
      }),
    ).toBeUndefined();
    expect(
      abilityForAction(testPyro, {
        characterId: testPyro.id,
        actionType: "normal",
        normalIndex: 0,
      }),
    ).toBe(testPyro.normalAttack);
  });

  it("tracks the index through a run and reports it in the snapshot", () => {
    const rotation: Rotation = [
      { characterId: testPyro.id, actionType: "normal" },
      { characterId: testPyro.id, actionType: "normal" },
    ];
    const r = simulateRotation([testPyro], rotation, testEnemy, NO_CRIT);
    // Legacy characters have a 1-entry LOOPING string, so it wraps to 0.
    expect(r.finalState.characters[testPyro.id]!.normalStringIndex).toBe(0);
    expect(r.structuredWarnings).toEqual([]);
  });
});

describe("S1 — damageByAbility is keyed by ability id", () => {
  it("keys by id and exposes names separately", () => {
    const r = simulateRotation(
      [testPyro],
      [{ characterId: testPyro.id, actionType: "skill" }],
      testEnemy,
      NO_CRIT,
    );
    expect(Object.keys(r.damageByAbility)).toEqual([testPyro.elementalSkill.id]);
    expect(r.abilityNamesById[testPyro.elementalSkill.id]).toBe(
      testPyro.elementalSkill.name,
    );
  });

  it("does NOT merge two distinct abilities that share a display name", () => {
    // The exact collision the name key hid. Same name, different ids.
    const SHARED_NAME = "Twinned Strike";
    const collided = {
      ...testPyro,
      elementalSkill: { ...testPyro.elementalSkill, name: SHARED_NAME },
      elementalBurst: {
        ...testPyro.elementalBurst,
        name: SHARED_NAME,
        energyCost: 0,
      },
    };
    const r = simulateRotation(
      [collided],
      [
        { characterId: collided.id, actionType: "skill" },
        { characterId: collided.id, actionType: "burst" },
      ],
      testEnemy,
      NO_CRIT,
    );

    const keys = Object.keys(r.damageByAbility).sort();
    expect(keys).toEqual(
      [collided.elementalSkill.id, collided.elementalBurst.id].sort(),
    );
    expect(keys).toHaveLength(2);
    // Both map back to the same label, which is exactly why the id is needed.
    expect(r.abilityNamesById[collided.elementalSkill.id]).toBe(SHARED_NAME);
    expect(r.abilityNamesById[collided.elementalBurst.id]).toBe(SHARED_NAME);
    // And the totals did not collapse into one bucket.
    const sum = Object.values(r.damageByAbility).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(r.totalDamage, 10);
  });
});
