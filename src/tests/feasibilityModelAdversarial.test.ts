// ---------------------------------------------------------------------------
// Adversarial coverage for `src/features/setup/feasibilityModel.ts`
// (COMPONENTS.md §15.5).
//
// The module's whole claim is that it computes NOTHING the engine owns. These
// tests attack that claim from two sides:
//   1. it must never invent a verdict the engine did not supply;
//   2. it must never invent an energy number (an orphan has no `maxEnergy`).
// Plus the degenerate inputs: empty rotation, no bursts, zero/absent maxEnergy,
// and a rotation naming a character who is not in the team.
// ---------------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import type {
  CharacterDefinition,
  Rotation,
  SimulationWarning,
} from "@/types";
import { characters } from "@/game-data";
import { buildFeasibilityReport } from "@/features/setup/feasibilityModel";

function required(id: string): CharacterDefinition {
  const found = characters.find((c) => c.id === id);
  if (found === undefined) throw new Error(`missing test character "${id}"`);
  return found;
}

const A = required("bennett");
const B = required("xiangling");

const byId = new Map<string, CharacterDefinition>([
  [A.id, A],
  [B.id, B],
]);

function energyWarning(
  actionIndex: number,
  characterId: string,
): SimulationWarning {
  return {
    actionIndex,
    timestamp: 0,
    characterId,
    code: "insufficient-energy",
    message: "insufficient energy",
  };
}

describe("degenerate inputs", () => {
  it("an empty rotation yields no rows and no verdict claim", () => {
    const report = buildFeasibilityReport([], byId, 0, null);
    expect(report.rows).toEqual([]);
    expect(report.unreachableCount).toBe(0);
    expect(report.hasEngineVerdict).toBe(false);
  });

  it("an empty rotation WITH warnings still yields no rows", () => {
    const report = buildFeasibilityReport([], byId, 0, []);
    expect(report.rows).toEqual([]);
    expect(report.hasEngineVerdict).toBe(true);
  });

  it("a rotation with no bursts produces no rows at all", () => {
    const rotation: Rotation = [
      { characterId: A.id, actionType: "skill" },
      { characterId: A.id, actionType: "normal" },
      { characterId: B.id, actionType: "swap" },
      { characterId: B.id, actionType: "charged" },
    ];
    expect(buildFeasibilityReport(rotation, byId, 0, []).rows).toEqual([]);
  });

  it("a rotation of nothing but swaps produces no rows", () => {
    const rotation: Rotation = [
      { characterId: A.id, actionType: "swap" },
      { characterId: B.id, actionType: "swap" },
    ];
    expect(buildFeasibilityReport(rotation, byId, 0, []).rows).toEqual([]);
  });
});

describe("characters the team does not contain", () => {
  it("drops an orphaned burst rather than inventing a maxEnergy for it", () => {
    const rotation: Rotation = [
      { characterId: "not-on-the-team", actionType: "burst" },
      { characterId: A.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, byId, 1, []);
    expect(report.rows).toHaveLength(1);
    expect(report.rows[0]?.characterId).toBe(A.id);
    // No fabricated zero row, no NaN demand.
    expect(
      report.rows.some((row) => row.characterId === "not-on-the-team"),
    ).toBe(false);
  });

  it("drops EVERY row when no rotation character is in the team", () => {
    const rotation: Rotation = [
      { characterId: "ghost-a", actionType: "burst" },
      { characterId: "ghost-b", actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, new Map(), 2, []);
    expect(report.rows).toEqual([]);
    // `unreachableCount` is passed in, not derived — it must survive verbatim.
    expect(report.unreachableCount).toBe(2);
  });

  it("an orphan's energy warning cannot leak onto another character's row", () => {
    const rotation: Rotation = [
      { characterId: "ghost", actionType: "burst" }, // index 0, rejected
      { characterId: A.id, actionType: "burst" }, // index 1, fine
    ];
    const report = buildFeasibilityReport(rotation, byId, 1, [
      energyWarning(0, "ghost"),
    ]);
    expect(report.rows).toHaveLength(1);
    expect(report.rows[0]?.verdict).toBe("sufficient");
    expect(report.rows[0]?.failedBurstOrdinals).toEqual([]);
  });
});

describe("maxEnergy edge values", () => {
  function withMaxEnergy(
    source: CharacterDefinition,
    maxEnergy: number,
  ): CharacterDefinition {
    return { ...source, maxEnergy };
  }

  it("a maxEnergy of 0 reports a demand of 0, not an absence", () => {
    const zero = withMaxEnergy(A, 0);
    const rotation: Rotation = [
      { characterId: A.id, actionType: "burst" },
      { characterId: A.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(
      rotation,
      new Map([[A.id, zero]]),
      0,
      [],
    );
    expect(report.rows[0]?.energyPerBurst).toBe(0);
    expect(report.rows[0]?.burstCount).toBe(2);
    expect(report.rows[0]?.totalDemand).toBe(0);
    // Zero demand is still a sufficient verdict when the engine raised nothing.
    expect(report.rows[0]?.verdict).toBe("sufficient");
  });

  it("an ABSENT maxEnergy surfaces as NaN rather than a silent 0", () => {
    // Characterizes current behaviour: the module reads `character.maxEnergy`
    // with no guard. Under TS strict the field is required, so this is only
    // reachable from untyped/persisted data — but if it ever is, the number
    // rendered must not be a plausible-looking 0.
    // `maxEnergy` is required under TS strict, so the absence has to be built
    // through a widened type — which is exactly how it would arrive: from
    // persisted or externally imported data that never met the type.
    const widened: Record<string, unknown> = { ...A };
    delete widened.maxEnergy;
    const missing = widened as unknown as CharacterDefinition;
    const report = buildFeasibilityReport(
      [{ characterId: A.id, actionType: "burst" }],
      new Map([[A.id, missing]]),
      0,
      [],
    );
    // `energyPerBurst` passes the absent value straight through (`undefined`
    // at runtime, typed `number`), and `totalDemand` becomes NaN. Neither is a
    // fabricated 0, which is what matters; both are visibly broken values the
    // renderer must handle rather than plausible numbers it would print.
    expect(report.rows[0]?.energyPerBurst).toBeUndefined();
    expect(Number.isNaN(report.rows[0]?.totalDemand as number)).toBe(true);
  });

  it("demand is exactly burstCount * maxEnergy for 1..5 bursts", () => {
    for (let count = 1; count <= 5; count += 1) {
      const rotation: Rotation = Array.from({ length: count }, () => ({
        characterId: A.id,
        actionType: "burst" as const,
      }));
      const report = buildFeasibilityReport(rotation, byId, 0, []);
      expect(report.rows[0]?.burstCount).toBe(count);
      expect(report.rows[0]?.totalDemand).toBe(count * A.maxEnergy);
    }
  });
});

describe("the verdict is ONLY ever the engine's (§15.5/F1)", () => {
  const rotation: Rotation = [
    { characterId: A.id, actionType: "burst" },
    { characterId: B.id, actionType: "swap" },
    { characterId: B.id, actionType: "burst" },
    { characterId: A.id, actionType: "swap" },
    { characterId: A.id, actionType: "burst" },
  ];

  it("null warnings drop EVERY row to unknown, whatever the demand is", () => {
    const report = buildFeasibilityReport(rotation, byId, 0, null);
    expect(report.hasEngineVerdict).toBe(false);
    for (const row of report.rows) {
      expect(row.verdict).toBe("unknown");
      expect(row.failedBurstOrdinals).toEqual([]);
    }
  });

  it("an empty warning list is a REAL sufficient verdict, not unknown", () => {
    // `[]` and `null` must not collapse into one another: an engine that ran
    // and complained about nothing is a different fact from no run at all.
    const report = buildFeasibilityReport(rotation, byId, 0, []);
    expect(report.hasEngineVerdict).toBe(true);
    for (const row of report.rows) expect(row.verdict).toBe("sufficient");
  });

  it("maps a rejected rotation index to the right 1-based burst ordinal", () => {
    // Index 4 is A's SECOND burst. The ordinal is per character, not global.
    const report = buildFeasibilityReport(rotation, byId, 0, [
      energyWarning(4, A.id),
    ]);
    const rowA = report.rows.find((row) => row.characterId === A.id);
    expect(rowA?.verdict).toBe("insufficient");
    expect(rowA?.failedBurstOrdinals).toEqual([2]);
    const rowB = report.rows.find((row) => row.characterId === B.id);
    expect(rowB?.verdict).toBe("sufficient");
  });

  it("ignores warning codes that are not insufficient-energy", () => {
    const report = buildFeasibilityReport(rotation, byId, 0, [
      {
        actionIndex: 0,
        timestamp: 0,
        characterId: A.id,
        code: "on-cooldown",
        message: "on cooldown",
      },
    ]);
    for (const row of report.rows) expect(row.verdict).toBe("sufficient");
  });

  it("reads the structured code, never the human-readable message", () => {
    const report = buildFeasibilityReport(rotation, byId, 0, [
      {
        actionIndex: 0,
        timestamp: 0,
        characterId: A.id,
        code: "on-cooldown",
        // A message that would match any naive substring parse.
        message: "insufficient-energy insufficient energy 能量不足",
      },
    ]);
    expect(report.rows.every((row) => row.verdict === "sufficient")).toBe(true);
  });

  it("an out-of-range warning index matches no burst and changes no verdict", () => {
    const report = buildFeasibilityReport(rotation, byId, 0, [
      energyWarning(99, A.id),
      energyWarning(-1, A.id),
    ]);
    for (const row of report.rows) {
      expect(row.verdict).toBe("sufficient");
      expect(row.failedBurstOrdinals).toEqual([]);
    }
  });
});

describe("burstBeforeAnyAction (F2) — a statement about the array, not physics", () => {
  it("is true when the character's first appearance is their burst", () => {
    const rotation: Rotation = [
      { characterId: A.id, actionType: "skill" },
      { characterId: B.id, actionType: "burst" },
    ];
    const report = buildFeasibilityReport(rotation, byId, 0, []);
    expect(
      report.rows.find((row) => row.characterId === B.id)?.burstBeforeAnyAction,
    ).toBe(true);
  });

  it("is false when any earlier action belongs to the character", () => {
    const rotation: Rotation = [
      { characterId: B.id, actionType: "skill" },
      { characterId: B.id, actionType: "burst" },
    ];
    expect(
      buildFeasibilityReport(rotation, byId, 0, [])
        .rows[0]?.burstBeforeAnyAction,
    ).toBe(false);
  });

  it("counts an auto-inserted SWAP as an earlier action", () => {
    // A swap row names the character being swapped to, so it is that
    // character's first appearance. Pinning current behaviour: a burst
    // immediately after its own swap is NOT flagged, even though the swap
    // generates no energy. This is the known conservatism of F2.
    const rotation: Rotation = [
      { characterId: A.id, actionType: "skill" },
      { characterId: B.id, actionType: "swap" },
      { characterId: B.id, actionType: "burst" },
    ];
    expect(
      buildFeasibilityReport(rotation, byId, 0, [])
        .rows.find((row) => row.characterId === B.id)?.burstBeforeAnyAction,
    ).toBe(false);
  });

  it("is false when a LATER burst follows an earlier one", () => {
    const rotation: Rotation = [
      { characterId: A.id, actionType: "burst" },
      { characterId: A.id, actionType: "burst" },
    ];
    const row = buildFeasibilityReport(rotation, byId, 0, []).rows[0];
    // Keyed off the FIRST burst, which is also the first action.
    expect(row?.burstBeforeAnyAction).toBe(true);
    expect(row?.burstCount).toBe(2);
  });
});

describe("determinism and purity", () => {
  const rotation: Rotation = [
    { characterId: A.id, actionType: "burst" },
    { characterId: B.id, actionType: "burst" },
    { characterId: A.id, actionType: "burst" },
  ];

  it("row order follows first-burst order in the sequence, deterministically", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(
        buildFeasibilityReport(rotation, byId, 0, []).rows.map(
          (row) => row.characterId,
        ),
      ).toEqual([A.id, B.id]);
    }
  });

  it("does not mutate the rotation or the character map", () => {
    const snapshot = JSON.stringify(rotation);
    const sizeBefore = byId.size;
    buildFeasibilityReport(rotation, byId, 0, [energyWarning(0, A.id)]);
    expect(JSON.stringify(rotation)).toBe(snapshot);
    expect(byId.size).toBe(sizeBefore);
  });
});
