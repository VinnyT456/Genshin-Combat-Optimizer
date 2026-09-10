import { describe, expect, it } from "vitest";
import {
  cooldownFor,
  planAbility,
  resolveScaling,
  talentChannelForSlot,
  talentLevelFor,
} from "@/simulation/character/execution";
import type { IcdState } from "@/simulation/character/execution";
import type { TalentLevelBoostMap } from "@/types";
import {
  syntheticBurst,
  syntheticN1,
  syntheticSkill,
  syntheticUnit,
} from "@/simulation/character/fixtures";
import { scaledBase } from "@/simulation/character/scaling";

describe("talent channel mapping", () => {
  it("routes normal/charged/plunge to the normal-attack talent", () => {
    for (const slot of ["normal", "charged", "plungeLow", "plungeHigh"] as const) {
      expect(talentChannelForSlot({ ...syntheticN1, slot })).toBe("normal");
    }
  });

  it("routes skill and burst to their own talents", () => {
    expect(talentChannelForSlot(syntheticSkill)).toBe("skill");
    expect(talentChannelForSlot(syntheticBurst)).toBe("burst");
  });

  it("reads the per-talent level, not one global level", () => {
    // fixture: normal 3, skill 2, burst 1 — all distinct on purpose.
    expect(talentLevelFor(syntheticUnit, syntheticN1)).toBe(3);
    expect(talentLevelFor(syntheticUnit, syntheticSkill)).toBe(2);
    expect(talentLevelFor(syntheticUnit, syntheticBurst)).toBe(1);
  });
});

describe("planAbility — multi-hit expansion", () => {
  it("yields one PlannedHit per damage instance", () => {
    const icd: IcdState = {};
    const hits = planAbility({
      character: syntheticUnit,
      ability: syntheticN1,
      startTime: 0,
      icd,
    });
    expect(hits).toHaveLength(2);
    expect(hits.map((h) => h.instanceId)).toEqual(["n1-hit1", "n1-hit2"]);
  });

  it("offsets each hit by its own delay from the cast start", () => {
    const hits = planAbility({
      character: syntheticUnit,
      ability: syntheticN1,
      startTime: 10,
      icd: {},
    });
    expect(hits[0]!.timestamp).toBe(10);
    expect(hits[1]!.timestamp).toBeCloseTo(10.2);
  });

  it("resolves multipliers at the ability's own talent level", () => {
    // N1 table is [0.1..0.5]; normal talent level 3 => 0.3.
    const hits = planAbility({
      character: syntheticUnit,
      ability: syntheticN1,
      startTime: 0,
      icd: {},
    });
    expect(hits[0]!.scaling).toEqual([{ stat: "atk", multiplier: 0.3 }]);
  });

  it("applies a slot boost exactly once when selecting the multiplier row", () => {
    const boosts: TalentLevelBoostMap = { normal: 1 };
    const configured = planAbility({
      character: syntheticUnit,
      ability: syntheticN1,
      startTime: 0,
      icd: {},
      talentLevelBoosts: boosts,
    });
    const equivalent = planAbility({
      character: {
        ...syntheticUnit,
        talentLevels: { ...syntheticUnit.talentLevels, normal: 4 },
      },
      ability: syntheticN1,
      startTime: 0,
      icd: {},
    });

    expect(configured.map((hit) => hit.scaling)).toEqual(
      equivalent.map((hit) => hit.scaling),
    );
  });

  it("preserves authoring order rather than re-sorting by delay", () => {
    // Hit 2 has a later delay but must stay second; a stable authored order is
    // itself meaningful.
    const reordered = {
      ...syntheticN1,
      instances: [syntheticN1.instances[1]!, syntheticN1.instances[0]!],
    };
    const hits = planAbility({
      character: syntheticUnit,
      ability: reordered,
      startTime: 0,
      icd: {},
    });
    expect(hits.map((h) => h.instanceId)).toEqual(["n1-hit2", "n1-hit1"]);
  });

  it("is deterministic across repeated identical plans", () => {
    const a = planAbility({ character: syntheticUnit, ability: syntheticSkill, startTime: 0, icd: {} });
    const b = planAbility({ character: syntheticUnit, ability: syntheticSkill, startTime: 0, icd: {} });
    expect(a).toEqual(b);
  });
});

describe("planAbility — elemental application", () => {
  it("applies every hit when no ICD group is declared", () => {
    const icd: IcdState = {};
    for (let i = 0; i < 5; i++) {
      const hits = planAbility({
        character: syntheticUnit,
        ability: syntheticBurst,
        startTime: i * 0.1,
        icd,
      });
      expect(hits[0]!.appliesElement).toBe(true);
      expect(hits[0]!.gauge).toBe(2);
    }
  });

  it("shares one ICD counter across repeated casts of the same group", () => {
    const icd: IcdState = {};
    const applied: (boolean | undefined)[] = [];
    for (let i = 0; i < 4; i++) {
      const hits = planAbility({
        character: syntheticUnit,
        ability: syntheticSkill,
        startTime: i * 0.1,
        icd,
      });
      applied.push(hits[0]!.appliesElement);
    }
    expect(applied).toEqual([true, false, false, true]);
  });

  it("omits gauge on a non-applying hit but still emits the hit", () => {
    const icd: IcdState = {};
    planAbility({ character: syntheticUnit, ability: syntheticSkill, startTime: 0, icd });
    const second = planAbility({
      character: syntheticUnit,
      ability: syntheticSkill,
      startTime: 0.1,
      icd,
    });
    expect(second).toHaveLength(1);
    expect(second[0]!.appliesElement).toBe(false);
    expect(second[0]!.gauge).toBeUndefined();
  });

  it("leaves application fields undefined when the instance declares none", () => {
    const hits = planAbility({
      character: syntheticUnit,
      ability: syntheticN1,
      startTime: 0,
      icd: {},
    });
    expect(hits[0]!.appliesElement).toBeUndefined();
  });
});

describe("hybrid scaling", () => {
  it("sums ATK and HP terms", () => {
    const terms = resolveScaling(syntheticSkill.instances[0]!, 2);
    // skill table [1.0,1.1,1.2] at level 2 => 1.1 ATK, plus flat 0.05 HP.
    const base = scaledBase(terms, {
      atk: 1000,
      hp: 20000,
      def: 0,
      elementalMastery: 0,
    });
    expect(base).toBeCloseTo(1.1 * 1000 + 0.05 * 20000);
  });
});

describe("cooldownFor", () => {
  it("reads the cooldown table at the skill talent level", () => {
    // skill cooldown table [6,5.5,5], skill talent level 2 => 5.5
    expect(cooldownFor(syntheticUnit, syntheticSkill)).toBe(5.5);
  });

  it("selects the cooldown row using the same effective boosted level", () => {
    expect(cooldownFor(syntheticUnit, syntheticSkill, { skill: 1 })).toBe(5);
  });

  it("fails closed when a direct definition has an absent talent table", () => {
    const missingTable = {
      ...syntheticSkill,
      cooldown: undefined,
      instances: [
        {
          ...syntheticSkill.instances[0]!,
          scaling: [{ stat: "atk", table: undefined }],
        },
      ],
    } as unknown as typeof syntheticSkill;

    expect(cooldownFor(syntheticUnit, missingTable)).toBe(0);
    expect(planAbility({
      character: syntheticUnit,
      ability: missingTable,
      startTime: 0,
      icd: {},
    })[0]!.scaling).toEqual([{ stat: "atk", multiplier: 0 }]);
  });
});
