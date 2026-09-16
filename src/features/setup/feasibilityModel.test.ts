import { describe, expect, it } from "vitest";
import type {
  CharacterDefinition,
  Rotation,
  SimulationWarning,
} from "@/types";
import { characters, nationalTeam } from "@/game-data";
import { buildFeasibilityReport } from "./feasibilityModel";

const [raiden, bennett] = nationalTeam;

function require_(id: string): CharacterDefinition {
  const found = characters.find((c) => c.id === id);
  if (found === undefined) throw new Error(`missing test character "${id}"`);
  return found;
}

const byId = new Map<string, CharacterDefinition>([
  [raiden!.id, raiden!],
  [bennett!.id, bennett!],
]);

function warning(
  actionIndex: number,
  characterId: string,
): SimulationWarning {
  return {
    actionIndex,
    timestamp: 1,
    characterId,
    code: "insufficient-energy",
    message: "needs energy",
  };
}

describe("feasibility reports DEMAND, never computed energy (§15.5/F1)", () => {
  it("multiplies burst count by maxEnergy and nothing else", () => {
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "burst" },
      { characterId: raiden!.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, byId, 0, null);
    const row = report.rows[0];

    expect(row?.burstCount).toBe(2);
    expect(row?.energyPerBurst).toBe(raiden!.maxEnergy);
    expect(row?.totalDemand).toBe(raiden!.maxEnergy * 2);
  });

  it("declines to judge without a fresh run", () => {
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, byId, 0, null);

    expect(report.hasEngineVerdict).toBe(false);
    expect(report.rows[0]?.verdict).toBe("unknown");
  });

  it("renders a verdict only from engine warnings, attributed to the burst", () => {
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "skill" },
      { characterId: raiden!.id, actionType: "burst" },
      { characterId: raiden!.id, actionType: "burst" },
    ];
    // The engine rejected the SECOND burst (rotation index 2 => ordinal 2).
    const report = buildFeasibilityReport(rotation, byId, 0, [
      warning(2, raiden!.id),
    ]);

    expect(report.rows[0]?.verdict).toBe("insufficient");
    expect(report.rows[0]?.failedBurstOrdinals).toEqual([2]);
  });

  it("reports sufficient when a fresh run raised no energy warning", () => {
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, byId, 0, []);

    expect(report.rows[0]?.verdict).toBe("sufficient");
  });

  it("ignores warnings that are not about energy", () => {
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, byId, 0, [
      { ...warning(0, raiden!.id), code: "on-cooldown" },
    ]);

    expect(report.rows[0]?.verdict).toBe("sufficient");
  });
});

describe("structural facts about the array (F2/F3)", () => {
  it("flags a burst that is the character's first action", () => {
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, byId, 0, null);

    expect(report.rows[0]?.burstBeforeAnyAction).toBe(true);
  });

  it("does not flag a burst preceded by that character's own action", () => {
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "skill" },
      { characterId: raiden!.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, byId, 0, null);

    expect(report.rows[0]?.burstBeforeAnyAction).toBe(false);
  });

  it("passes the unreachable count through for the pointer line", () => {
    const report = buildFeasibilityReport([], byId, 3, null);
    expect(report.unreachableCount).toBe(3);
  });
});

describe("rows the panel must not fabricate", () => {
  it("emits no row for a sequence with no bursts", () => {
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "skill" },
    ];
    expect(buildFeasibilityReport(rotation, byId, 0, null).rows).toHaveLength(0);
  });

  it("skips an orphaned character rather than inventing a maxEnergy", () => {
    const rotation: Rotation = [
      { characterId: "not-in-team", actionType: "burst" },
    ];
    expect(buildFeasibilityReport(rotation, byId, 0, null).rows).toHaveLength(0);
  });

  it("gives each bursting character exactly one row, in first-burst order", () => {
    const xiangling = require_("xiangling");
    const withXiangling = new Map(byId).set(xiangling.id, xiangling);
    const rotation: Rotation = [
      { characterId: bennett!.id, actionType: "burst" },
      { characterId: xiangling.id, actionType: "burst" },
      { characterId: bennett!.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, withXiangling, 0, null);

    expect(report.rows.map((r) => r.characterId)).toEqual([
      bennett!.id,
      xiangling.id,
    ]);
    expect(report.rows[0]?.burstCount).toBe(2);
  });
});
