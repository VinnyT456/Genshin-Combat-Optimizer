import { describe, expect, it } from "vitest";
import type {
  CharacterDefinition,
  CombatEvent,
  SimulationSnapshot,
} from "@/types";
import { testPyro } from "@/game-data";
import {
  availabilityChip,
  buildEnergyView,
  energySnapshotAt,
  meterLabel,
  scrubTimeOf,
} from "@/features/energy/energyModel";

const BURST_COST = 40;
const MAX_ENERGY = 60;

function character(id: string): CharacterDefinition {
  return {
    ...testPyro,
    id,
    name: `C-${id}`,
    maxEnergy: MAX_ENERGY,
    elementalBurst: {
      ...testPyro.elementalBurst,
      id: `${id}-burst`,
      energyCost: BURST_COST,
    },
  };
}

const a = character("a");
const b = character("b");

function energyEvent(
  timestamp: number,
  byCharacter: Record<string, number>,
): CombatEvent {
  return {
    timestamp,
    type: "energy",
    characterId: "a",
    description: "gain",
    energyByCharacter: byCharacter,
  };
}

/** A damage event, which the engine emits WITHOUT an energy snapshot. */
function damageEvent(timestamp: number, characterId: string): CombatEvent {
  return {
    timestamp,
    type: "damage",
    characterId,
    description: "hit",
    duration: 1,
  };
}

function snapshot(
  time: number,
  characters: Record<string, { energy: number; burstReadyAt?: number }>,
): SimulationSnapshot {
  return {
    time,
    characters: Object.fromEntries(
      Object.entries(characters).map(([id, c]) => [
        id,
        {
          characterId: id,
          energy: {
            current: c.energy,
            max: MAX_ENERGY,
            totalGained: c.energy,
            totalSpent: 0,
          },
          cooldowns:
            c.burstReadyAt === undefined ? {} : { [`${id}-burst`]: c.burstReadyAt },
        },
      ]),
    ),
  };
}

describe("scrubTimeOf — the single selection model", () => {
  const timeline = [damageEvent(0, "a"), damageEvent(6.4, "b")];

  it("derives the time from the selected event, never a second state", () => {
    expect(scrubTimeOf(timeline, 1)).toBe(6.4);
  });

  it("treats no selection as end of rotation", () => {
    expect(scrubTimeOf(timeline, null)).toBeNull();
  });

  it("falls back to end of rotation for an out-of-range index", () => {
    // Can happen for one render after a re-simulate shortens the timeline.
    expect(scrubTimeOf(timeline, 99)).toBeNull();
  });
});

describe("energySnapshotAt", () => {
  const timeline = [
    energyEvent(0, { a: 10, b: 5 }),
    damageEvent(1, "a"),
    energyEvent(2, { a: 25, b: 12 }),
    damageEvent(3, "a"),
  ];

  it("returns the most recent snapshot at or before the time", () => {
    // A damage event carries no snapshot of its own, so the value in force is
    // the last one the engine published.
    expect(energySnapshotAt(timeline, 3)).toEqual({ a: 25, b: 12 });
    expect(energySnapshotAt(timeline, 1)).toEqual({ a: 10, b: 5 });
  });

  it("resolves a tie to the state AFTER everything at that instant", () => {
    expect(energySnapshotAt(timeline, 2)).toEqual({ a: 25, b: 12 });
  });

  it("returns null before any snapshot was published", () => {
    expect(energySnapshotAt([damageEvent(0, "a")], 0)).toBeNull();
  });
});

describe("buildEnergyView", () => {
  const timeline = [
    energyEvent(0, { a: 10, b: 5 }),
    damageEvent(2, "a"),
    energyEvent(4, { a: 45, b: 50 }),
  ];
  const finalState = snapshot(6, {
    a: { energy: 45 },
    b: { energy: 50, burstReadyAt: 9 },
  });
  const team = [a, b, null, null];

  it("reads finalState when nothing is selected", () => {
    const view = buildEnergyView({ team, timeline, finalState, scrubTime: null });
    expect(view.atEndOfRotation).toBe(true);
    expect(view.rows[0]?.current).toBe(45);
  });

  it("reads the published snapshot when scrubbed", () => {
    const view = buildEnergyView({ team, timeline, finalState, scrubTime: 2 });
    expect(view.atEndOfRotation).toBe(false);
    expect(view.rows[0]?.current).toBe(10);
    expect(view.rows[1]?.current).toBe(5);
  });

  it("renders one row per slot, holes included", () => {
    const view = buildEnergyView({ team, timeline, finalState, scrubTime: null });
    expect(view.rows).toHaveLength(4);
    expect(view.rows[2]?.character).toBeNull();
    expect(view.partySize).toBe(2);
  });

  it("reports no reading rather than zero when none was published", () => {
    const view = buildEnergyView({
      team,
      timeline: [damageEvent(0, "a")],
      finalState,
      scrubTime: 0,
    });
    expect(view.rows[0]?.current).toBeNull();
    expect(view.rows[0]?.availability.kind).toBe("unknown");
  });

  it("calls a burst ready at or above its cost and off cooldown", () => {
    const view = buildEnergyView({ team, timeline, finalState, scrubTime: null });
    expect(view.rows[0]?.availability).toEqual({ kind: "ready" });
  });

  it("reports the energy shortfall when below cost", () => {
    const view = buildEnergyView({ team, timeline, finalState, scrubTime: 0 });
    expect(view.rows[0]?.availability).toEqual({
      kind: "needs-energy",
      deficit: BURST_COST - 10,
    });
  });

  it("measures cooldown against the same clock the energy came from", () => {
    // b's burst is ready at t=9. Scrubbed to t=4 that is 5 s away, not 3 s away
    // as it would be if measured from finalState.time.
    const view = buildEnergyView({ team, timeline, finalState, scrubTime: 4 });
    expect(view.rows[1]?.availability).toEqual({ kind: "cooling-down", remaining: 5 });
  });

  it("reports both gates when energy and cooldown both block", () => {
    const view = buildEnergyView({
      team,
      timeline,
      finalState: snapshot(6, { a: { energy: 10, burstReadyAt: 9 } }),
      scrubTime: null,
    });
    expect(view.rows[0]?.availability).toEqual({
      kind: "cooling-down-and-needs-energy",
      remaining: 3,
      deficit: 30,
    });
  });

  it("never produces a fill outside the track", () => {
    const view = buildEnergyView({
      team,
      timeline: [energyEvent(0, { a: MAX_ENERGY * 2 })],
      finalState,
      scrubTime: 0,
    });
    expect(view.rows[0]?.fillFraction).toBe(1);
    expect(view.rows[0]?.costFraction).toBeLessThanOrEqual(1);
  });

  it("counts unavailable bursts across filled slots only", () => {
    const view = buildEnergyView({ team, timeline, finalState, scrubTime: 0 });
    expect(view.unavailableBurstCount).toBe(2);
  });
});

describe("availabilityChip", () => {
  it("states every reason in words, never colour alone", () => {
    expect(availabilityChip({ kind: "ready" })).toEqual({
      text: "Burst ready",
      state: "success",
    });
    expect(availabilityChip({ kind: "needs-energy", deficit: 12 }).text).toBe(
      "Burst unavailable · needs 12 more energy",
    );
    expect(availabilityChip({ kind: "cooling-down", remaining: 4.2 }).text).toBe(
      "Burst unavailable · cooldown 4.2 s",
    );
  });

  it("leads with the later-resolving reason when both gate the burst", () => {
    expect(
      availabilityChip({
        kind: "cooling-down-and-needs-energy",
        remaining: 4.2,
        deficit: 12,
      }).text,
    ).toBe("Burst unavailable · cooldown 4.2 s · +12 energy");
  });
});

describe("meterLabel", () => {
  it("names the character, the value, the cap and the requirement", () => {
    const view = buildEnergyView({
      team: [a],
      timeline: [energyEvent(0, { a: 48 })],
      finalState: snapshot(0, { a: { energy: 48 } }),
      scrubTime: 0,
    });
    const row = view.rows[0];
    expect(row).toBeDefined();
    expect(meterLabel(row!)).toBe("C-a energy, 48 of 60, burst requires 40");
  });
});
