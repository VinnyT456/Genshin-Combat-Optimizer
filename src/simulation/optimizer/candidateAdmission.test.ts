import { describe, expect, it } from "vitest";
import { admitCandidate, hasSkippedActions } from "./candidateAdmission";
import { optimizeRotation } from "./optimizeRotation";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { allCharacters } from "@/game-data/characters/registry";
import { testPyro } from "@/game-data/characters/testPyro";
import { testHydro } from "@/game-data/characters/testHydro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { CONFIG_WARNING_ACTION_INDEX } from "@/types";
import type { Rotation, SimulationConfig } from "@/types";
import type { OptimizerConfig } from "./CONTRACT";

const WINDOW: SimulationConfig = { timeLimit: 30 };

describe("D2 — legal-but-warned candidate admission", () => {
  // -----------------------------------------------------------------------
  // The evidence the ruling rests on.
  // -----------------------------------------------------------------------

  it("an action-level warning means the action was SKIPPED, not merely flagged", () => {
    const def = allCharacters[0]!;
    // burst-first is unaffordable at t=0; the repeated skill is on cooldown.
    const rotation: Rotation = [
      { characterId: def.id, actionType: "burst" },
      { characterId: def.id, actionType: "skill" },
      { characterId: def.id, actionType: "skill" },
    ];
    const result = simulateRotation([def], rotation, testEnemy, WINDOW);

    const actionWarnings = result.structuredWarnings.filter(
      (w) => w.actionIndex >= 0,
    );
    expect(actionWarnings.map((w) => w.actionIndex)).toEqual([0, 2]);

    // The proposal is 3 actions long but only ONE ran. This is the defect a
    // blanket accept would ship: the rotation handed back would not be the
    // rotation that produced the result.
    //
    // "One action ran" is counted via `duration`, NOT via damage-event count.
    // A damage event is emitted per ability INSTANCE, and instances are
    // multi-hit data: `diluc-skill` has three, so the single executed action
    // produces three damage events. `duration` is the engine's own record of
    // the clock advance and is emitted once per executed action, on its first
    // event — so it counts actions, which is what the claim is about.
    expect(rotation).toHaveLength(3);
    const executed = result.timeline.filter(
      (e) => e.type === "damage" && e.duration !== undefined,
    );
    expect(executed).toHaveLength(1);
    // ...and it is the action at index 1, the one NOT warned about.
    expect(executed[0]!.damage?.abilityId).toBe("diluc-skill");
  });

  it("a multi-hit ability emits one damage event per instance, not per action", () => {
    // Guards the assertion above against a data change: if `diluc-skill` ever
    // stops being multi-hit, the `duration`-based count stays correct but this
    // test tells us the fixture no longer exercises the distinction.
    const def = allCharacters[0]!;
    const rotation: Rotation = [{ characterId: def.id, actionType: "skill" }];
    const result = simulateRotation([def], rotation, testEnemy, WINDOW);

    const damageEvents = result.timeline.filter((e) => e.type === "damage");
    const withDuration = damageEvents.filter((e) => e.duration !== undefined);

    expect(hasSkippedActions(result)).toBe(false);
    expect(withDuration).toHaveLength(1); // exactly one ACTION executed
    expect(damageEvents.length).toBeGreaterThan(1); // ...emitting several HITS
  });

  it("repairs by dropping exactly the skipped indices", () => {
    const def = allCharacters[0]!;
    const rotation: Rotation = [
      { characterId: def.id, actionType: "burst" },
      { characterId: def.id, actionType: "skill" },
      { characterId: def.id, actionType: "skill" },
    ];
    const result = simulateRotation([def], rotation, testEnemy, WINDOW);

    const admitted = admitCandidate(rotation, result);
    expect(admitted).toBeDefined();
    expect(admitted!.repaired).toBe(true);
    // Index 1 is the only action that ran.
    expect(admitted!.rotation).toEqual([rotation[1]]);
  });

  it("the repaired rotation actually runs clean — the legality invariant", () => {
    const def = allCharacters[0]!;
    const rotation: Rotation = [
      { characterId: def.id, actionType: "burst" },
      { characterId: def.id, actionType: "skill" },
      { characterId: def.id, actionType: "skill" },
    ];
    const result = simulateRotation([def], rotation, testEnemy, WINDOW);
    const admitted = admitCandidate(rotation, result)!;

    const replay = simulateRotation([def], admitted.rotation, testEnemy, WINDOW);
    expect(hasSkippedActions(replay)).toBe(false);
    expect(replay.structuredWarnings.filter((w) => w.actionIndex >= 0)).toEqual(
      [],
    );
    // And it keeps the damage the good prefix earned — the whole point of not
    // rejecting the node.
    expect(replay.totalDamage).toBeGreaterThan(0);
  });

  // -----------------------------------------------------------------------
  // Per-code decisions.
  // -----------------------------------------------------------------------

  it("REACHABILITY: a rotation reachable only through repair is now returned", () => {
    const def = allCharacters[0]!;
    // A rotation whose FIRST action is unaffordable. Under a blanket reject
    // this whole branch dies; under repair the surviving suffix is admitted.
    const rotation: Rotation = [
      { characterId: def.id, actionType: "burst" },
      { characterId: def.id, actionType: "skill" },
    ];
    const result = simulateRotation([def], rotation, testEnemy, WINDOW);
    expect(result.structuredWarnings.some((w) => w.actionIndex >= 0)).toBe(true);

    // Old behaviour: rejected outright.
    const oldWouldReject =
      result.errors.length > 0 ||
      result.structuredWarnings.some((w) => w.actionIndex >= 0);
    expect(oldWouldReject).toBe(true);

    // New behaviour: admitted, non-empty, and legal.
    const admitted = admitCandidate(rotation, result);
    expect(admitted).toBeDefined();
    expect(admitted!.rotation.length).toBeGreaterThan(0);
  });

  it("invalid-config does NOT trigger repair — it is run-scoped, not per-action", () => {
    const def = allCharacters[0]!;
    const rotation: Rotation = [{ characterId: def.id, actionType: "skill" }];
    const result = simulateRotation([def], rotation, testEnemy, {
      ...WINDOW,
      swapCost: -5,
    });

    // Exactly one warning, and it is config-scoped.
    const configWarnings = result.structuredWarnings.filter(
      (w) => w.actionIndex === CONFIG_WARNING_ACTION_INDEX,
    );
    expect(configWarnings).toHaveLength(1);
    expect(configWarnings[0]!.code).toBe("invalid-config");

    // It must not cause a repair: the action ran, and the engine already
    // clamped the offending config value.
    expect(hasSkippedActions(result)).toBe(false);
    const admitted = admitCandidate(rotation, result)!;
    expect(admitted.repaired).toBe(false);
    expect(admitted.rotation).toBe(rotation);
  });

  it("errors (unknown-character) still REJECT the node", () => {
    const def = allCharacters[0]!;
    const rotation: Rotation = [
      { characterId: "not-in-this-team", actionType: "skill" },
    ];
    const result = simulateRotation([def], rotation, testEnemy, WINDOW);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(admitCandidate(rotation, result)).toBeUndefined();
  });

  it("an all-skipped candidate is rejected — it adds nothing to its parent", () => {
    const def = allCharacters[0]!;
    const rotation: Rotation = [{ characterId: def.id, actionType: "burst" }];
    const result = simulateRotation([def], rotation, testEnemy, WINDOW);
    expect(result.structuredWarnings.some((w) => w.actionIndex >= 0)).toBe(true);
    expect(admitCandidate(rotation, result)).toBeUndefined();
  });

  it("the clean path reuses the proposal array — no hot-loop allocation", () => {
    const def = allCharacters[0]!;
    const rotation: Rotation = [{ characterId: def.id, actionType: "skill" }];
    const result = simulateRotation([def], rotation, testEnemy, WINDOW);
    const admitted = admitCandidate(rotation, result)!;
    expect(admitted.repaired).toBe(false);
    expect(admitted.rotation).toBe(rotation);
  });

  // -----------------------------------------------------------------------
  // End-to-end: the emitted contract is stronger than before.
  // -----------------------------------------------------------------------

  it("every emitted rotation replays with zero skipped actions", () => {
    const team = [testPyro, testHydro];
    const config: OptimizerConfig = {
      beamWidth: 6,
      simulationDuration: 12,
      objective: "total-damage",
      topN: 5,
    };
    const out = optimizeRotation(team, testEnemy, config);
    expect(out.ranked.length).toBeGreaterThan(0);

    for (const ranked of out.ranked) {
      const replay = simulateRotation(team, ranked.rotation, testEnemy, {
        timeLimit: config.simulationDuration,
      });
      expect(hasSkippedActions(replay)).toBe(false);
      expect(replay.errors).toEqual([]);
      // The emitted result must BE the emitted rotation's result.
      expect(replay.totalDamage).toBeCloseTo(ranked.result.totalDamage, 6);
    }
  });

  it("emitted rotations stay legal on a real 4-character generic team", () => {
    const team = allCharacters.slice(0, 4);
    const config: OptimizerConfig = {
      beamWidth: 5,
      simulationDuration: 10,
      objective: "dps",
      topN: 4,
    };
    const out = optimizeRotation(team, testEnemy, config);
    expect(out.ranked.length).toBeGreaterThan(0);

    for (const ranked of out.ranked) {
      const replay = simulateRotation(team, ranked.rotation, testEnemy, {
        timeLimit: config.simulationDuration,
      });
      expect(hasSkippedActions(replay)).toBe(false);
    }
  });

  it("repair does not break determinism", () => {
    const team = allCharacters.slice(0, 3);
    const config: OptimizerConfig = {
      beamWidth: 5,
      simulationDuration: 10,
      objective: "total-damage",
      topN: 4,
    };
    const a = optimizeRotation(team, testEnemy, config);
    const b = optimizeRotation(team, testEnemy, config);
    expect(JSON.stringify(a.ranked.map((r) => r.rotation))).toBe(
      JSON.stringify(b.ranked.map((r) => r.rotation)),
    );
    expect(a.nodesExpanded).toBe(b.nodesExpanded);
  });
});
