import { describe, expect, it } from "vitest";
import type { AbilityDefinition } from "@/types";
import {
  abilityGauge,
  abilityHitCount,
  abilityIcd,
  abilityIcdGroup,
} from "@/simulation/reactions/abilityContract";
import type { ElementalAbility } from "@/simulation/reactions/abilityContract";
import { resolveIcdConfig, STANDARD_ICD_CONFIG } from "@/simulation/reactions/icd";

// ============================================================================
// AbilityDefinition's elemental-application fields (mechanics TASK #023).
//
// Four OPTIONAL fields, and the DEFAULTING RULES matter more than the fields:
// if `src/types` and `src/simulation/reactions` disagree about what an absent
// field means, damage is wrong with NO ERROR ANYWHERE. That is why these tests
// exercise the mechanics-side readers against abilities typed as the engine's
// own `AbilityDefinition`, rather than asserting the declarations in isolation.
//
// A type-level assertion is the other half: mechanics' `ElementalAbility` is an
// INTERSECTION with `AbilityDefinition`, so now that the fields have landed it
// must collapse to a no-op.
// ============================================================================

/** A minimal legacy ability with NONE of the four new fields authored. */
const BARE: AbilityDefinition = {
  id: "test-e",
  name: "Test Skill",
  actionType: "skill",
  element: "pyro",
  damageType: "skill",
  multiplier: 2,
  scaling: "atk",
  castTime: 1,
  cooldown: 6,
  energyCost: 0,
  energyGenerated: 0,
};

describe("the mechanics view collapses to a no-op", () => {
  it("accepts a plain AbilityDefinition as an ElementalAbility", () => {
    // Compiles only because `src/types` now carries all four fields. If one
    // were missing, mechanics' intersection would still add it and this would
    // still compile — so the real proof is the ASSIGNMENT BACK, below.
    const view: ElementalAbility = BARE;
    expect(view.id).toBe(BARE.id);
  });

  it("round-trips: an authored ElementalAbility IS an AbilityDefinition", () => {
    // This is the direction that fails if `src/types` lacks a field.
    const authored: ElementalAbility = {
      ...BARE,
      application: { gauge: 2 },
      icd: { mode: "custom", config: { intervalSeconds: 1, hits: 3 } },
      icdGroup: "shared-na",
      hitCount: 4,
    };
    const asDefinition: AbilityDefinition = authored;
    expect(asDefinition.application?.gauge).toBe(2);
    expect(asDefinition.icdGroup).toBe("shared-na");
    expect(asDefinition.hitCount).toBe(4);
    expect(asDefinition.icd?.mode).toBe("custom");
  });
});

describe("defaulting rule: application absent => 0U, FAILS CLOSED", () => {
  it("reads 0 gauge from an un-authored ability", () => {
    expect(BARE.application).toBeUndefined();
    // The critical one: an un-authored ability must produce NO reactions,
    // never a plausible-looking invented 1U.
    expect(abilityGauge(BARE)).toBe(0);
  });

  it("reads the authored gauge when present", () => {
    const authored: AbilityDefinition = { ...BARE, application: { gauge: 2 } };
    expect(abilityGauge(authored)).toBe(2);
  });

  it("does not treat an explicit 0U as unauthored", () => {
    const zero: AbilityDefinition = { ...BARE, application: { gauge: 0 } };
    expect(abilityGauge(zero)).toBe(0);
    expect(zero.application).toBeDefined();
  });
});

describe("defaulting rule: icd absent => the 2.5s / 3-hit standard", () => {
  it("defaults to standard", () => {
    expect(BARE.icd).toBeUndefined();
    expect(abilityIcd(BARE)).toEqual({ mode: "standard" });
    expect(resolveIcdConfig(abilityIcd(BARE))).toEqual(STANDARD_ICD_CONFIG);
  });

  it("honours an explicit `none` — distinct from unauthored", () => {
    const noIcd: AbilityDefinition = { ...BARE, icd: { mode: "none" } };
    // The whole reason `icd` is a discriminated union rather than optional
    // fields: "no ICD at all" must not be confusable with "not authored yet",
    // which default to OPPOSITE behaviours.
    expect(resolveIcdConfig(abilityIcd(noIcd))).toBeUndefined();
    expect(resolveIcdConfig(abilityIcd(BARE))).toBeDefined();
  });

  it("honours a custom deviation as DATA, not a code branch", () => {
    const custom: AbilityDefinition = {
      ...BARE,
      icd: { mode: "custom", config: { intervalSeconds: 5, hits: 5 } },
    };
    expect(resolveIcdConfig(abilityIcd(custom))).toEqual({
      intervalSeconds: 5,
      hits: 5,
    });
  });
});

describe("defaulting rule: icdGroup absent => the ability's own id", () => {
  it("gives each ability an independent ICD by default", () => {
    expect(BARE.icdGroup).toBeUndefined();
    expect(abilityIcdGroup(BARE)).toBe(BARE.id);
  });

  it("makes ICD sharing OPT-IN, never accidental", () => {
    const a: AbilityDefinition = { ...BARE, id: "na", icdGroup: "sword-na-ca" };
    const b: AbilityDefinition = { ...BARE, id: "ca", icdGroup: "sword-na-ca" };
    expect(abilityIcdGroup(a)).toBe(abilityIcdGroup(b));

    // Without the opt-in they must NOT share, or one ability would silently
    // consume another's application window.
    const c: AbilityDefinition = { ...BARE, id: "na" };
    const d: AbilityDefinition = { ...BARE, id: "ca" };
    expect(abilityIcdGroup(c)).not.toBe(abilityIcdGroup(d));
  });
});

describe("defaulting rule: hitCount absent => 1", () => {
  it("defaults to a single hit", () => {
    expect(BARE.hitCount).toBeUndefined();
    expect(abilityHitCount(BARE)).toBe(1);
  });

  it("reads an authored multi-hit count", () => {
    expect(abilityHitCount({ ...BARE, hitCount: 4 })).toBe(4);
  });
});
