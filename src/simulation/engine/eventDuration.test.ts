import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import { simulateRotation, MIN_SWAP_COST_SECONDS } from "@/simulation/engine";
import { makeTestCharacter, NEUTRAL_ENEMY } from "@/tests/helpers/fixtures";

const NO_CRIT: SimulationConfig = { critMode: "never" };

describe("CombatEvent.duration on damage events (N5)", () => {
  it("carries the ability's applied cast time", () => {
    const a = makeTestCharacter("a");
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT,
    );
    const hit = r.timeline.find((e) => e.type === "damage")!;
    expect(hit.duration).toBe(a.elementalSkill.castTime);
  });

  it("reports the duration the clock actually advanced by, derived from timestamps", () => {
    // Strongest form of the guarantee: each event's duration must equal the gap
    // to the next event's timestamp, so a duration that disagreed with the
    // clock would fail here even if it matched the definition.
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "a", actionType: "charged", abilityId: "a-ca" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const r = simulateRotation([makeTestCharacter("a")], rotation, NEUTRAL_ENEMY, NO_CRIT);
    const hits = r.timeline.filter((e) => e.type === "damage");
    expect(hits).toHaveLength(3);

    for (let i = 0; i < hits.length - 1; i++) {
      expect(hits[i]!.duration).toBeCloseTo(
        hits[i + 1]!.timestamp - hits[i]!.timestamp,
      );
    }
    // The final event's duration must carry the run out to the total duration.
    const last = hits[hits.length - 1]!;
    expect(last.timestamp + last.duration!).toBeCloseTo(r.duration);
  });

  it("reports a per-ability duration, not one shared constant", () => {
    const a = makeTestCharacter("a", {
      normalAttack: { castTime: 0.25 },
      elementalSkill: { castTime: 2.5 },
    });
    const r = simulateRotation(
      [a],
      [
        { characterId: "a", actionType: "normal", abilityId: "a-na" },
        { characterId: "a", actionType: "skill", abilityId: "a-e" },
      ],
      NEUTRAL_ENEMY,
      NO_CRIT,
    );
    const hits = r.timeline.filter((e) => e.type === "damage");
    expect(hits[0]!.duration).toBeCloseTo(0.25);
    expect(hits[1]!.duration).toBeCloseTo(2.5);
  });

  it("emits duration on a zero-cast-time ability rather than omitting it", () => {
    const a = makeTestCharacter("a", { normalAttack: { castTime: 0 } });
    const r = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "normal", abilityId: "a-na" }],
      NEUTRAL_ENEMY,
      NO_CRIT,
    );
    const hit = r.timeline.find((e) => e.type === "damage")!;
    expect(hit.duration).toBe(0);
    expect(hit.duration).toBeDefined();
  });

  it("still carries duration on swap events (unchanged)", () => {
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      [
        { characterId: "a", actionType: "normal", abilityId: "a-na" },
        { characterId: "b", actionType: "swap" },
      ],
      NEUTRAL_ENEMY,
      { ...NO_CRIT, swapCost: 1.25 },
    );
    expect(r.timeline.find((e) => e.type === "swap")!.duration).toBe(1.25);
  });

  it("reports the post-clamp swap cost, not the configured one", () => {
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      [
        { characterId: "a", actionType: "normal", abilityId: "a-na" },
        { characterId: "b", actionType: "swap" },
      ],
      NEUTRAL_ENEMY,
      { ...NO_CRIT, swapCost: -5 },
    );
    expect(r.timeline.find((e) => e.type === "swap")!.duration).toBe(
      MIN_SWAP_COST_SECONDS,
    );
  });

  it("omits duration on energy events, which consume no time", () => {
    const r = simulateRotation(
      [makeTestCharacter("a")],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      NEUTRAL_ENEMY,
      NO_CRIT,
    );
    const energyEvents = r.timeline.filter((e) => e.type === "energy");
    expect(energyEvents.length).toBeGreaterThan(0);
    for (const e of energyEvents) expect(e.duration).toBeUndefined();
  });

  it("lets a consumer reconstruct the timeline without a definition lookup", () => {
    // The point of N5: sum of every event duration == run duration, using only
    // the timeline. No CharacterDefinition needed.
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "b", actionType: "swap" },
      { characterId: "b", actionType: "normal", abilityId: "b-na" },
    ];
    const r = simulateRotation(
      [makeTestCharacter("a"), makeTestCharacter("b")],
      rotation,
      NEUTRAL_ENEMY,
      NO_CRIT,
    );
    const total = r.timeline.reduce((sum, e) => sum + (e.duration ?? 0), 0);
    expect(total).toBeCloseTo(r.duration);
  });
});
