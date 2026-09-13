import { describe, expect, it } from "vitest";
import type { CharacterDefinition, CombatEvent, SimulationWarning } from "@/types";
import { testPyro } from "@/game-data";
import {
  MIN_SPAN_PERCENT,
  buildTicks,
  buildTimelineModel,
  chooseTickStep,
  laneIndexOfEvent,
  nearestInLane,
  neighbourInLane,
  selectableEventIndices,
  swapTimeFraction,
  abilityLabelZh,
  eventDescriptionZh,
} from "@/features/rotation-timeline/timelineModel";

/** formatSeconds joins value and unit with a non-breaking space by design. */
const NBSP = "\u00a0";

function character(id: string): CharacterDefinition {
  return { ...testPyro, id, name: `C-${id}` };
}

const a = character("a");
const b = character("b");

/** Cast time of a testPyro ability, by id. Test fixture convenience only. */
function abilityCastTime(abilityId: string): number {
  const abilities = [
    testPyro.normalAttack,
    testPyro.chargedAttack,
    testPyro.elementalSkill,
    testPyro.elementalBurst,
  ];
  return abilities.find((x) => x.id === abilityId)?.castTime ?? 0;
}

/**
 * Mirrors what the engine emits: `duration` is the on-field time it actually
 * advanced the clock by, published ON THE EVENT. Defaults to the definition's
 * cast time for convenience, but callers may pass a different value — that
 * divergence is the whole reason the UI reads the event instead of the
 * definition.
 */
function damageEvent(
  timestamp: number,
  characterId: string,
  abilityId: string,
  duration = abilityCastTime(abilityId),
): CombatEvent {
  return {
    timestamp,
    type: "damage",
    characterId,
    description: "hit",
    duration,
    damage: {
      timestamp,
      sourceCharacterId: characterId,
      abilityId,
      abilityName: abilityId,
      element: "pyro",
      damageType: "skill",
      rawDamage: 100,
      finalDamage: 100,
      nonCritDamage: 80,
      critDamage: 200,
    },
  };
}

function swapEvent(
  timestamp: number,
  to: string,
  from: string | undefined,
  duration: number,
): CombatEvent {
  return {
    timestamp,
    type: "swap",
    characterId: to,
    description: "swap",
    ...(from !== undefined ? { fromCharacterId: from } : {}),
    duration,
  };
}

const NO_WARNINGS: SimulationWarning[] = [];

describe("chooseTickStep", () => {
  it("uses a fine step for short rotations and a coarse one for long", () => {
    expect(chooseTickStep(8)).toBeLessThanOrEqual(2);
    expect(chooseTickStep(90)).toBeGreaterThanOrEqual(5);
  });

  it("never returns zero, even for a zero-length rotation", () => {
    expect(chooseTickStep(0)).toBeGreaterThan(0);
  });
});

describe("Chinese timeline presentation", () => {
  it("maps engine damage names to Chinese action labels", () => {
    expect(abilityLabelZh("test-pyro-e", "skill")).toBe("元素战技");
    expect(abilityLabelZh("unknown-ability")).toBe("未知动作");
    expect(abilityLabelZh("electroCharged:tick")).toBe("反应：感电（持续伤害）");
  });

  it("constructs descriptions without engine English prose", () => {
    const event = damageEvent(0, "a", testPyro.elementalSkill.id);
    expect(eventDescriptionZh(event, new Map([["a", a]]))).toContain("元素战技");
    expect(eventDescriptionZh(event, new Map([["a", a]]))).not.toContain("hit");
  });

  it("uses Chinese fallbacks for unresolved character IDs", () => {
    const event = damageEvent(0, "unknown-id", testPyro.elementalSkill.id);
    expect(eventDescriptionZh(event, new Map())).toContain("未知角色");
    expect(eventDescriptionZh(event, new Map())).not.toContain("unknown-id");
    const model = buildTimelineModel({
      timeline: [swapEvent(1, "unknown-id", undefined, 0.5)],
      duration: 5,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.swaps[0]?.label).toContain("未知角色");
    expect(model.swaps[0]?.label).not.toContain("unknown-id");
  });
});

describe("buildTicks", () => {
  it("starts at zero and marks the unit on the first and last tick only", () => {
    const ticks = buildTicks(10);
    expect(ticks[0]?.time).toBe(0);
    expect(ticks[0]?.showUnit).toBe(true);
    expect(ticks[ticks.length - 1]?.showUnit).toBe(true);
    expect(ticks.slice(1, -1).every((t) => !t.showUnit)).toBe(true);
  });

  it("keeps every tick offset within the track", () => {
    for (const tick of buildTicks(12.4)) {
      expect(tick.leftPercent).toBeGreaterThanOrEqual(0);
      expect(tick.leftPercent).toBeLessThanOrEqual(100);
    }
  });
});

describe("buildTimelineModel — lanes", () => {
  it("renders one lane per slot, including empty slots", () => {
    const model = buildTimelineModel({
      timeline: [],
      duration: 5,
      team: [a, null, b, null],
      warnings: NO_WARNINGS,
    });
    expect(model.lanes).toHaveLength(4);
    expect(model.lanes.map((l) => l.character?.id ?? null)).toEqual([
      "a",
      null,
      "b",
      null,
    ]);
  });

  it("assigns each damage event to its own character's lane", () => {
    const model = buildTimelineModel({
      timeline: [damageEvent(0, "a", testPyro.elementalSkill.id), damageEvent(2, "b", testPyro.normalAttack.id)],
      duration: 4,
      team: [a, b, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.lanes[0]?.actions.map((x) => x.eventIndex)).toEqual([0]);
    expect(model.lanes[1]?.actions.map((x) => x.eventIndex)).toEqual([1]);
  });

  it("drops events for characters not on the team rather than throwing", () => {
    const model = buildTimelineModel({
      timeline: [damageEvent(0, "ghost", testPyro.normalAttack.id)],
      duration: 4,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.lanes.flatMap((l) => l.actions)).toHaveLength(0);
  });

  it("ignores energy and info events", () => {
    const model = buildTimelineModel({
      timeline: [
        { timestamp: 1, type: "energy", characterId: "a", description: "gain" },
        { timestamp: 2, type: "info", characterId: "a", description: "note" },
      ],
      duration: 4,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.lanes[0]?.actions).toHaveLength(0);
  });
});

describe("buildTimelineModel — span geometry", () => {
  it("derives span width from the duration the engine published on the event", () => {
    // elementalSkill castTime is 1.0 over a 10s track => 10%.
    const model = buildTimelineModel({
      timeline: [damageEvent(0, "a", testPyro.elementalSkill.id)],
      duration: 10,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    const span = model.lanes[0]?.actions[0];
    expect(span?.duration).toBe(testPyro.elementalSkill.castTime);
    expect(span?.widthPercent).toBeCloseTo(10);
    expect(span?.clamped).toBe(false);
  });

  it("reports the event's duration even when it differs from the definition", () => {
    // The engine may apply an effective cast time that is not the static one.
    // Reading the definition instead would silently misreport the rotation.
    const effective = testPyro.elementalSkill.castTime + 2;
    const model = buildTimelineModel({
      timeline: [damageEvent(0, "a", testPyro.elementalSkill.id, effective)],
      duration: 10,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.lanes[0]?.actions[0]?.duration).toBe(effective);
    expect(model.lanes[0]?.actions[0]?.widthPercent).toBeCloseTo(30);
  });

  it("clamps a very short span to a clickable minimum and flags it", () => {
    const model = buildTimelineModel({
      timeline: [damageEvent(0, "a", testPyro.normalAttack.id)],
      duration: 600,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    const span = model.lanes[0]?.actions[0];
    expect(span?.widthPercent).toBe(MIN_SPAN_PERCENT);
    expect(span?.clamped).toBe(true);
  });

  it("positions spans proportionally along the track", () => {
    const model = buildTimelineModel({
      timeline: [damageEvent(5, "a", testPyro.normalAttack.id)],
      duration: 10,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.lanes[0]?.actions[0]?.leftPercent).toBeCloseTo(50);
  });

  it("does not produce NaN or Infinity for a zero-duration run", () => {
    const model = buildTimelineModel({
      timeline: [damageEvent(0, "a", testPyro.normalAttack.id)],
      duration: 0,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    const span = model.lanes[0]?.actions[0];
    expect(Number.isFinite(span?.leftPercent ?? NaN)).toBe(true);
    expect(Number.isFinite(span?.widthPercent ?? NaN)).toBe(true);
  });

  it("marks ability class from the definition, not the damage type alone", () => {
    const model = buildTimelineModel({
      timeline: [
        damageEvent(0, "a", testPyro.elementalBurst.id),
        damageEvent(2, "a", testPyro.normalAttack.id),
      ],
      duration: 10,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.lanes[0]?.actions.map((x) => x.abilityClass)).toEqual(["Q", "N"]);
  });
});

describe("buildTimelineModel — swaps", () => {
  it("renders a swap as a span of real width, never a point", () => {
    const model = buildTimelineModel({
      timeline: [swapEvent(3, "b", "a", 0.6)],
      duration: 10,
      team: [a, b, null, null],
      warnings: NO_WARNINGS,
    });
    const swap = model.swaps[0];
    expect(swap?.duration).toBe(0.6);
    expect(swap?.widthPercent).toBeGreaterThan(0);
    expect(swap?.fromCharacterId).toBe("a");
    expect(swap?.toCharacterId).toBe("b");
  });

  it("handles an opening swap that has no origin character", () => {
    const model = buildTimelineModel({
      timeline: [swapEvent(0, "a", undefined, 0.6)],
      duration: 10,
      team: [a, b, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.swaps[0]?.fromCharacterId).toBeNull();
    expect(model.swaps[0]?.label).toContain("切换至");
  });

  it("totals swap time and count for the Tier-2 stat", () => {
    const model = buildTimelineModel({
      timeline: [swapEvent(1, "b", "a", 0.6), swapEvent(5, "a", "b", 0.6)],
      duration: 12,
      team: [a, b, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.swapCount).toBe(2);
    expect(model.totalSwapTime).toBeCloseTo(1.2);
    expect(swapTimeFraction(model)).toBeCloseTo(0.1);
  });

  it("reports a zero swap fraction for a zero-duration run", () => {
    const model = buildTimelineModel({
      timeline: [],
      duration: 0,
      team: [a, null, null, null],
      warnings: NO_WARNINGS,
    });
    expect(swapTimeFraction(model)).toBe(0);
  });

  it("names both ends and the cost in the accessible label", () => {
    const model = buildTimelineModel({
      timeline: [swapEvent(4.1, "b", "a", 0.6)],
      duration: 10,
      team: [a, b, null, null],
      warnings: NO_WARNINGS,
    });
    expect(model.swaps[0]?.label).toBe(
      `C-a 切换至 C-b，时间 4.10${NBSP}s，耗时 0.60${NBSP}s`,
    );
  });
});

describe("buildTimelineModel — skip markers", () => {
  it("places a warning in the owning lane at the attempted timestamp", () => {
    const warnings: SimulationWarning[] = [
      {
        actionIndex: 2,
        timestamp: 3,
        characterId: "b",
        code: "on-cooldown",
        message: "Flame Strike on cooldown until 6.00s",
        availableAt: 6,
      },
    ];
    const model = buildTimelineModel({
      timeline: [],
      duration: 10,
      team: [a, b, null, null],
      warnings,
    });
    expect(model.lanes[0]?.skips).toHaveLength(0);
    expect(model.lanes[1]?.skips).toHaveLength(1);
    expect(model.lanes[1]?.skips[0]?.leftPercent).toBeCloseTo(30);
    expect(model.lanes[1]?.skips[0]?.label).toContain("已跳过：");
  });

  it("drops warnings for characters that are not on the team", () => {
    const model = buildTimelineModel({
      timeline: [],
      duration: 10,
      team: [a, null, null, null],
      warnings: [
        {
          actionIndex: 0,
          timestamp: 1,
          characterId: "ghost",
          code: "unknown-character",
          message: "no such character",
        },
      ],
    });
    expect(model.lanes.flatMap((l) => l.skips)).toHaveLength(0);
  });
});

describe("keyboard navigation helpers", () => {
  const model = buildTimelineModel({
    timeline: [
      damageEvent(0, "a", testPyro.elementalSkill.id),
      swapEvent(2, "b", "a", 0.6),
      damageEvent(3, "b", testPyro.normalAttack.id),
      damageEvent(5, "a", testPyro.normalAttack.id),
    ],
    duration: 10,
    team: [a, b, null, null],
    warnings: NO_WARNINGS,
  });

  it("orders every selectable event chronologically", () => {
    expect(selectableEventIndices(model)).toEqual([0, 1, 2, 3]);
  });

  it("steps within a lane, not across the whole rotation", () => {
    const laneA = model.lanes[0]!;
    expect(neighbourInLane(laneA, 0, 1)).toBe(3);
  });

  it("returns null at a lane boundary instead of wrapping", () => {
    const laneA = model.lanes[0]!;
    expect(neighbourInLane(laneA, 0, -1)).toBeNull();
    expect(neighbourInLane(laneA, 3, 1)).toBeNull();
  });

  it("returns null for an event that is not in the given lane", () => {
    expect(neighbourInLane(model.lanes[0]!, 2, 1)).toBeNull();
  });

  it("lands on the nearest event in time when changing lane", () => {
    expect(nearestInLane(model.lanes[1]!, 5)).toBe(2);
    expect(nearestInLane(model.lanes[2]!, 5)).toBeNull();
  });

  it("locates the lane holding an event, and -1 for a swap", () => {
    expect(laneIndexOfEvent(model, 0)).toBe(0);
    expect(laneIndexOfEvent(model, 2)).toBe(1);
    expect(laneIndexOfEvent(model, 1)).toBe(-1);
  });
});
