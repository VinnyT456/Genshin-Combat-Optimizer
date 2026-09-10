import { describe, expect, it } from "vitest";
import {
  canTriggerProc,
  isTriggerEffectActive,
  evaluateTriggerProc,
  type TriggeredEffectDefinition,
  type TriggerInstanceState,
} from "@/simulation/buffs/triggers";
import {
  createStanceBuff,
  createStancePackage,
  type StanceDefinition,
} from "@/simulation/buffs/types";

// ============================================================================
// Triggers & Stances unit test suite.
//
// Verifies:
//  - canTriggerProc: first proc, elapsed ICD, unelapsed ICD, zero ICD, rewind
//  - isTriggerEffectActive and evaluateTriggerProc
//  - Stance helper packages and endsOnSwap condition mapping
// ============================================================================

describe("canTriggerProc", () => {
  it("returns true when lastProcTime is undefined (first proc)", () => {
    expect(canTriggerProc(undefined, 0, 1.0)).toBe(true);
    expect(canTriggerProc(undefined, 10.5, 2.0)).toBe(true);
  });

  it("returns true when currentTime - lastProcTime >= icdSeconds", () => {
    // 1.0s ICD, last proc at t=1.0, current time t=2.0
    expect(canTriggerProc(1.0, 2.0, 1.0)).toBe(true);
    expect(canTriggerProc(1.0, 2.5, 1.0)).toBe(true);
  });

  it("returns false when currentTime - lastProcTime < icdSeconds", () => {
    // 1.0s ICD, last proc at t=1.0, current time t=1.5
    expect(canTriggerProc(1.0, 1.5, 1.0)).toBe(false);
    expect(canTriggerProc(1.0, 1.99, 1.0)).toBe(false);
  });

  it("handles float precision gracefully at the boundary", () => {
    // 0.3 - 0.1 = 0.20000000000000004 or similar
    expect(canTriggerProc(0.1, 0.3, 0.2)).toBe(true);
  });

  it("returns true for zero or negative icdSeconds", () => {
    expect(canTriggerProc(5.0, 5.0, 0)).toBe(true);
    expect(canTriggerProc(5.0, 5.0, -1)).toBe(true);
  });

  it("returns false on time rewind (currentTime < lastProcTime)", () => {
    expect(canTriggerProc(5.0, 4.0, 1.0)).toBe(false);
  });
});

describe("isTriggerEffectActive", () => {
  const effect: TriggeredEffectDefinition = {
    id: "raincutter",
    name: "Guhua Sword: Raincutter",
    trigger: "onNormalAttack",
    durationSeconds: 15,
    icdSeconds: 1.0,
    maxProcs: 15,
    sourceCharacterId: "char-xingqiu",
  };

  it("is false before start time", () => {
    expect(isTriggerEffectActive(effect, 5, 4.9)).toBe(false);
  });

  it("is true within active window and below proc cap", () => {
    expect(isTriggerEffectActive(effect, 5, 10, 5)).toBe(true);
  });

  it("is false when duration has elapsed", () => {
    expect(isTriggerEffectActive(effect, 5, 20, 5)).toBe(false);
  });

  it("is false when maxProcs is reached", () => {
    expect(isTriggerEffectActive(effect, 5, 10, 15)).toBe(false);
  });

  it("supports infinite duration effects", () => {
    const permEffect: TriggeredEffectDefinition = {
      ...effect,
      durationSeconds: Number.POSITIVE_INFINITY,
      maxProcs: undefined,
    };
    expect(isTriggerEffectActive(permEffect, 0, 1000, 50)).toBe(true);
  });
});

describe("evaluateTriggerProc", () => {
  const effect: TriggeredEffectDefinition = {
    id: "eye-of-storm",
    name: "Coordinated Slash",
    trigger: "onDamageDealt",
    durationSeconds: 25,
    icdSeconds: 0.9,
    sourceCharacterId: "char-raiden",
  };

  it("allows first proc and updates lastProcTime and procCount", () => {
    const initial: TriggerInstanceState = {
      startTime: 0,
      lastProcTime: undefined,
      procCount: 0,
    };
    const result = evaluateTriggerProc(effect, initial, 1.0);
    expect(result.canProc).toBe(true);
    expect(result.nextState).toEqual({
      startTime: 0,
      lastProcTime: 1.0,
      procCount: 1,
    });
  });

  it("blocks proc if ICD has not elapsed and leaves state unchanged", () => {
    const state: TriggerInstanceState = {
      startTime: 0,
      lastProcTime: 1.0,
      procCount: 1,
    };
    // 1.5 - 1.0 = 0.5 < 0.9
    const result = evaluateTriggerProc(effect, state, 1.5);
    expect(result.canProc).toBe(false);
    expect(result.nextState).toEqual(state);
  });

  it("allows subsequent proc once ICD has elapsed", () => {
    const state: TriggerInstanceState = {
      startTime: 0,
      lastProcTime: 1.0,
      procCount: 1,
    };
    // 2.0 - 1.0 = 1.0 >= 0.9
    const result = evaluateTriggerProc(effect, state, 2.0);
    expect(result.canProc).toBe(true);
    expect(result.nextState).toEqual({
      startTime: 0,
      lastProcTime: 2.0,
      procCount: 2,
    });
  });
});

describe("Stance packages and snapshot helpers", () => {
  it("createStanceBuff maps endsOnSwap: true to requiresOnField condition", () => {
    const stance: StanceDefinition = {
      id: "paramita-papilio",
      name: "Guide to Afterlife",
      durationSeconds: 9,
      endsOnSwap: true,
      modifiers: [{ stat: "atkFlat", value: 1000 }],
    };
    const buff = createStanceBuff(stance, "char-hutao", 2.0);
    expect(buff.id).toBe("paramita-papilio");
    expect(buff.sourceCharacterId).toBe("char-hutao");
    expect(buff.startTime).toBe(2.0);
    expect(buff.duration).toBe(9);
    expect(buff.conditions?.requiresOnField).toBe(true);
    expect(buff.modifiers).toEqual([{ stat: "atkFlat", value: 1000 }]);
  });

  it("createStanceBuff maps endsOnSwap: false to no requiresOnField condition", () => {
    const stance: StanceDefinition = {
      id: "sweeping-time",
      name: "Sweeping Time",
      durationSeconds: 15,
      endsOnSwap: false,
    };
    const buff = createStanceBuff(stance, "char-noelle", 0);
    expect(buff.conditions).toBeUndefined();
  });

  it("createStancePackage bundles buff, infusion entry, and triggers cleanly", () => {
    const stance: StanceDefinition = {
      id: "musou-isshin",
      name: "Secret Art: Musou Shinsetsu",
      durationSeconds: 7,
      endsOnSwap: true,
      infusion: {
        id: "raiden-infusion",
        element: "electro",
        durationSeconds: 7,
        canBeOverridden: false,
      },
      conversions: [
        {
          sourceStat: "energyRecharge",
          targetStat: "elementalDmgBonus",
          element: "electro",
          ratio: 0.4,
        },
      ],
      triggers: [
        {
          id: "energy-restore-on-hit",
          name: "Musou Isshin Energy Restore",
          trigger: "onNormalAttack",
          durationSeconds: 7,
          icdSeconds: 1.0,
          maxProcs: 5,
          sourceCharacterId: "char-raiden",
        },
      ],
    };

    const pkg = createStancePackage(stance, "char-raiden", 3.0);
    expect(pkg.buff.id).toBe("musou-isshin");
    expect(pkg.buff.startTime).toBe(3.0);
    expect(pkg.buff.conversions).toHaveLength(1);
    expect(pkg.infusion).toBeDefined();
    expect(pkg.infusion?.startTime).toBe(3.0);
    expect(pkg.infusion?.infusion.element).toBe("electro");
    expect(pkg.infusion?.infusion.canBeOverridden).toBe(false);
    expect(pkg.triggers).toHaveLength(1);
  });
});
