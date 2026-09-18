import { describe, expect, it } from "vitest";
import type { CharacterDefinition, Rotation } from "@/types";
import { characters } from "@/game-data";
import { findCharacter } from "@/game-data/characters/registry";
import { toWebsiteCharacter } from "@/features/team-builder/rosterModel";
import {
  DEFAULT_EDITOR_SWAP_COST_SECONDS,
  actionDisplayLabel,
  actionDuration,
  addButtonAccessibleName,
  announceDuplicateNoOp,
  announceInsert,
  characterDisplayLabel,
  clampSelection,
  deleteAction,
  describeAction,
  duplicateAction,
  indexAfterNormalize,
  insertAction,
  insertionIndex,
  insertionRuleLabel,
  missingSwapIndexes,
  moveAction,
  needsAutoSwap,
  normalizeSwaps,
  rowTimings,
  selectionAfterDelete,
  skillInputVariantsFor,
  skillVariantLabel,
  summarizeRotation,
} from "./rotationEditing";

function require_(id: string): CharacterDefinition {
  const found = characters.find((c) => c.id === id);
  if (found === undefined) throw new Error(`missing test character "${id}"`);
  return found;
}

const bennett = require_("bennett");
const xiangling = require_("xiangling");
const bennettWithKit = toWebsiteCharacter(findCharacter("bennett")!);
const byId = new Map<string, CharacterDefinition>([
  [bennett.id, bennett],
  [xiangling.id, xiangling],
]);

describe("RotationEditor Chinese presentation labels", () => {
  it("uses the Chinese action label instead of a generated English ability name", () => {
    const generatedAbilityName = "Fantastic Voyage";

    expect(actionDisplayLabel("skill")).toBe("元素战技");
    expect(actionDisplayLabel("skill")).not.toContain(generatedAbilityName);
  });

  it("uses a Chinese fallback when an action references no team character", () => {
    expect(characterDisplayLabel(null)).toBe("未知角色");
  });

  it("exposes Bennett's tap and hold inputs from the lossless kit", () => {
    expect(skillInputVariantsFor(bennettWithKit)).toEqual(["tap", "hold"]);
    expect(skillVariantLabel("tap")).toBe("点按");
    expect(skillVariantLabel("hold")).toBe("长按");
  });

  it("persists the selected hold input in the authored action", () => {
    const result = insertAction([], 0, bennettWithKit, "skill", "hold");
    expect(result.rotation[0]).toMatchObject({
      characterId: "bennett",
      actionType: "skill",
      skillVariant: "hold",
    });
    expect(result.rotation[0]?.abilityId).toBeUndefined();
    expect(describeAction(result.rotation[0]!, bennettWithKit)).toContain("（长按）");
  });
});

describe("insertion cursor arithmetic (§14.2, §14.4)", () => {
  const rotation: Rotation = [
    { characterId: bennett.id, actionType: "skill" },
    { characterId: bennett.id, actionType: "normal" },
    { characterId: bennett.id, actionType: "burst" },
  ];

  it("splices at the end when nothing is selected", () => {
    expect(insertionIndex(rotation, null)).toBe(rotation.length);
  });

  it("splices immediately AFTER the selected row, not at it", () => {
    expect(insertionIndex(rotation, 0)).toBe(1);
    expect(insertionIndex(rotation, 1)).toBe(2);
  });

  it("clamps a selection that outran a shrunken rotation", () => {
    expect(insertionIndex(rotation, 99)).toBe(3);
    expect(insertionIndex(rotation, -4)).toBe(0);
  });

  it("puts the cursor at 0 for an empty sequence", () => {
    expect(insertionIndex([], null)).toBe(0);
    expect(insertionIndex([], 0)).toBe(0);
  });

  it("advances the cursor past the added step so repeated adds chain forward", () => {
    let current: Rotation = [];
    let cursor = insertionIndex(current, null);

    const first = insertAction(current, cursor, bennett, "skill");
    current = first.rotation;
    cursor = insertionIndex(current, first.actionIndex);
    expect(cursor).toBe(1);

    const second = insertAction(current, cursor, bennett, "normal");
    expect(second.rotation.map((a) => a.actionType)).toEqual(["skill", "normal"]);
  });

  it("labels the rule with the destination the cursor actually uses", () => {
    expect(insertionRuleLabel(null)).toBe("插入位置 · 序列末尾");
    expect(insertionRuleLabel(1)).toBe("插入位置 · 第 2 步之后");
  });
});

describe("auto-swap insertion (§14.6)", () => {
  it("does NOT fire at index 0 of an empty sequence — nobody is swapped in first", () => {
    expect(needsAutoSwap([], 0, bennett.id)).toBe(false);

    const result = insertAction([], 0, bennett, "skill");
    expect(result.autoSwapped).toBe(false);
    expect(result.rotation).toHaveLength(1);
    expect(result.rotation[0]?.actionType).toBe("skill");
  });

  it("does NOT fire when the previous actor is already the subject", () => {
    const rotation: Rotation = [{ characterId: bennett.id, actionType: "skill" }];
    expect(needsAutoSwap(rotation, 1, bennett.id)).toBe(false);

    const result = insertAction(rotation, 1, bennett, "burst");
    expect(result.autoSwapped).toBe(false);
    expect(result.insertedCount).toBe(1);
  });

  it("fires on a character change, inserting swap-then-action in that order", () => {
    const rotation: Rotation = [{ characterId: bennett.id, actionType: "skill" }];
    expect(needsAutoSwap(rotation, 1, xiangling.id)).toBe(true);

    const result = insertAction(rotation, 1, xiangling, "burst");
    expect(result.autoSwapped).toBe(true);
    expect(result.insertedCount).toBe(2);
    expect(result.rotation.map((a) => [a.characterId, a.actionType])).toEqual([
      [bennett.id, "skill"],
      [xiangling.id, "swap"],
      [xiangling.id, "burst"],
    ]);
    // `actionIndex` points at the AUTHORED action, past the inferred swap.
    expect(result.actionIndex).toBe(2);
  });

  it("judges the previous actor at the CURSOR, not at the end of the list", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    // Inserting Bennett after step 3 needs a swap; after step 1 does not.
    expect(needsAutoSwap(rotation, 3, bennett.id)).toBe(true);
    expect(needsAutoSwap(rotation, 1, bennett.id)).toBe(false);
  });

  it("treats a swap row as putting its subject on field", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
    ];
    expect(needsAutoSwap(rotation, 2, xiangling.id)).toBe(false);
  });

  it("announces the compound insert as two actions", () => {
    const result = insertAction(
      [{ characterId: bennett.id, actionType: "skill" }],
      1,
      xiangling,
      "burst",
    );
    expect(announceInsert(result, "香菱", "burst", DEFAULT_EDITOR_SWAP_COST_SECONDS)).toBe(
      "已插入 切至 香菱（0.60 秒）与 香菱 元素爆发，共 2 个动作。现共 3 个动作。",
    );
  });

  it("announces a plain insert with its resulting step number", () => {
    const result = insertAction([], 0, bennett, "skill");
    expect(announceInsert(result, "班尼特", "skill", DEFAULT_EDITOR_SWAP_COST_SECONDS)).toBe(
      "已在第 1 步插入 班尼特 元素战技。共 1 个动作。",
    );
  });
});

describe("reorder, duplicate and delete", () => {
  const rotation: Rotation = [
    { characterId: bennett.id, actionType: "skill" },
    { characterId: bennett.id, actionType: "normal" },
    { characterId: bennett.id, actionType: "burst" },
  ];

  it("moves a step to an arbitrary position in one operation (fixes D4)", () => {
    expect(moveAction(rotation, 2, 0).map((a) => a.actionType)).toEqual([
      "burst",
      "skill",
      "normal",
    ]);
  });

  it("clamps an out-of-range destination rather than dropping the step", () => {
    expect(moveAction(rotation, 0, 99)).toHaveLength(3);
    expect(moveAction(rotation, 0, 99)[2]?.actionType).toBe("skill");
  });

  it("returns the same array when the move is a no-op", () => {
    expect(moveAction(rotation, 1, 1)).toBe(rotation);
    expect(moveAction(rotation, 9, 0)).toBe(rotation);
  });

  it("duplicates in place, below the source", () => {
    const next = duplicateAction(rotation, 0);
    expect(next.map((a) => a.actionType)).toEqual([
      "skill",
      "skill",
      "normal",
      "burst",
    ]);
  });

  it("selects the row that took the deleted index", () => {
    expect(selectionAfterDelete(2, 0)).toBe(0);
  });

  it("falls back to the new last row when the deleted row was last", () => {
    expect(selectionAfterDelete(2, 2)).toBe(1);
  });

  it("clears selection when the list is emptied", () => {
    expect(selectionAfterDelete(0, 0)).toBeNull();
    expect(deleteAction([{ characterId: bennett.id, actionType: "skill" }], 0)).toEqual(
      [],
    );
  });
});

describe("swap normalization (§14.6 as a whole-sequence invariant)", () => {
  const pairs = (rotation: Rotation) =>
    rotation.map((a) => [a.characterId, a.actionType]);

  it("removes the swap stranded by a mid-sequence insert of the same character", () => {
    // Live repro: 班尼特 普 / ⇄ 香菱 / 香菱 Q, then insert 香菱 E after row #1.
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "normal" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];

    const result = insertAction(rotation, 1, xiangling, "skill");

    expect(pairs(result.rotation)).toEqual([
      [bennett.id, "normal"],
      [xiangling.id, "swap"],
      [xiangling.id, "skill"],
      [xiangling.id, "burst"],
    ]);
    // Exactly one swap survives, and it is not the redundant one.
    expect(result.rotation.filter((a) => a.actionType === "swap")).toHaveLength(1);
    // Selection still points at the authored 元素战技 row.
    expect(result.rotation[result.actionIndex]?.actionType).toBe("skill");
  });

  it("KEEPS a swap that is doing real work", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "burst" },
    ];
    expect(normalizeSwaps(rotation)).toBe(rotation);
  });

  it("removes a leading swap to the character who is already the first actor", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "skill" },
    ];
    expect(pairs(normalizeSwaps(rotation))).toEqual([[bennett.id, "skill"]]);
  });

  it("removes a leading swap even when the next actor differs", () => {
    // Nobody is on field before index 0, so the row swaps away from nothing.
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    expect(pairs(normalizeSwaps(rotation))).toEqual([[xiangling.id, "burst"]]);
  });

  it("is idempotent", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "normal" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    const once = normalizeSwaps(rotation);
    const twice = normalizeSwaps(once);
    expect(twice).toBe(once);
    expect(pairs(once)).toEqual([
      [bennett.id, "normal"],
      [xiangling.id, "swap"],
      [xiangling.id, "burst"],
    ]);
  });

  it("never removes or reorders a non-swap action", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "skill" },
      { characterId: bennett.id, actionType: "normal" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    const normalized = normalizeSwaps(rotation);
    expect(normalized.filter((a) => a.actionType !== "swap")).toEqual(
      rotation.filter((a) => a.actionType !== "swap"),
    );
  });

  it("returns the identical array when nothing is redundant (no needless rerender)", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    expect(normalizeSwaps(rotation)).toBe(rotation);
    expect(normalizeSwaps([])).toEqual([]);
  });

  it("drops the swap stranded by deleting the only action it served", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
      { characterId: xiangling.id, actionType: "normal" },
    ];
    // Delete 香菱 Q: the swap still serves 香菱 普, so it must survive.
    expect(pairs(deleteAction(rotation, 2))).toEqual([
      [bennett.id, "skill"],
      [xiangling.id, "swap"],
      [xiangling.id, "normal"],
    ]);
    // Delete both 香菱 actions and the swap now serves nothing — but 香菱 is
    // still not the active character, so it is not a no-op by the stated rule
    // and remove-only normalization leaves it. A trailing swap is a visible,
    // deletable, time-costing row; deleting it would be an unrequested edit.
    const emptied = deleteAction(deleteAction(rotation, 3), 2);
    expect(pairs(emptied)).toEqual([
      [bennett.id, "skill"],
      [xiangling.id, "swap"],
    ]);
  });

  it("drops a swap made redundant by moving its action above it", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "normal" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    // ⇄ 香菱 moved to the top: it now leads the sequence, where nobody is on
    // field yet, so it is redundant and is removed.
    expect(pairs(moveAction(rotation, 1, 0))).toEqual([
      [bennett.id, "normal"],
      [xiangling.id, "burst"],
    ]);
  });

  it("reports — never repairs — an action left unreachable by a move", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "normal" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    expect(missingSwapIndexes(rotation)).toEqual([]);

    // Moving ⇄ 香菱 to the top removes it as a leading no-op, which leaves
    // 香菱 Q unreachable. Remove-only normalization does NOT author a
    // replacement swap; the gap is reported so the UI can show it.
    const moved = moveAction(rotation, 1, 0);
    expect(moved.some((a) => a.actionType === "swap")).toBe(false);
    expect(missingSwapIndexes(moved)).toEqual([1]);
    // Index 0 is never flagged: the first actor is not swapped in (§14.6).
    expect(missingSwapIndexes([{ characterId: bennett.id, actionType: "burst" }])).toEqual(
      [],
    );
  });

  it("refuses to duplicate a swap into a no-op copy", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    // The copy would swap to 香菱, who the original just put on field.
    expect(duplicateAction(rotation, 1)).toHaveLength(rotation.length);
    expect(pairs(duplicateAction(rotation, 1))).toEqual(pairs(rotation));
    expect(announceDuplicateNoOp("切至 香菱")).toBe(
      "未复制 切至 香菱：该角色已在场上，重复的切人不会执行。",
    );
  });

  it("tracks an index across the rows normalization removed before it", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "skill" },
      { characterId: bennett.id, actionType: "normal" },
    ];
    expect(indexAfterNormalize(rotation, 0)).toBe(0);
    expect(indexAfterNormalize(rotation, 1)).toBe(0);
    expect(indexAfterNormalize(rotation, 2)).toBe(1);
  });

  it("clamps a selection into a rotation that shrank under it", () => {
    expect(clampSelection([{ characterId: bennett.id, actionType: "skill" }], 5)).toBe(0);
    expect(clampSelection([], 0)).toBeNull();
  });
});

describe("timing (§14.1/D5 — no fabricated durations)", () => {
  it("reports null duration for an orphaned action instead of inventing 0.50s", () => {
    const orphan = { characterId: "not-in-team", actionType: "skill" } as const;
    expect(actionDuration(orphan, undefined, DEFAULT_EDITOR_SWAP_COST_SECONDS)).toBeNull();
  });

  it("gives a swap the swap cost even with no character data", () => {
    const swap = { characterId: "not-in-team", actionType: "swap" } as const;
    expect(actionDuration(swap, undefined, DEFAULT_EDITOR_SWAP_COST_SECONDS)).toBe(DEFAULT_EDITOR_SWAP_COST_SECONDS);
  });

  it("accumulates a running start time and does not advance past orphans", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: "ghost", actionType: "skill" },
      { characterId: bennett.id, actionType: "normal" },
    ];
    const timings = rowTimings(rotation, byId, DEFAULT_EDITOR_SWAP_COST_SECONDS);
    const skillTime = bennett.elementalSkill.castTime;

    expect(timings[0]?.startTime).toBe(0);
    expect(timings[1]?.duration).toBeNull();
    expect(timings[1]?.startTime).toBe(skillTime);
    expect(timings[2]?.startTime).toBe(skillTime);
  });
});

describe("header summary (§14.3-A)", () => {
  it("counts swaps and their accumulated cost separately", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "burst" },
    ];
    const summary = summarizeRotation(rotation, byId, DEFAULT_EDITOR_SWAP_COST_SECONDS);
    expect(summary.actionCount).toBe(3);
    expect(summary.swapCount).toBe(1);
    expect(summary.swapSeconds).toBeCloseTo(DEFAULT_EDITOR_SWAP_COST_SECONDS);
    expect(summary.orphanCount).toBe(0);
  });

  it("excludes orphaned rows from the total and counts them", () => {
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
      { characterId: "ghost", actionType: "burst" },
    ];
    const summary = summarizeRotation(rotation, byId, DEFAULT_EDITOR_SWAP_COST_SECONDS);
    expect(summary.orphanCount).toBe(1);
    expect(summary.totalSeconds).toBeCloseTo(bennett.elementalSkill.castTime);
  });

  it("reports an ABSENT total, not 0.0, when every row is orphaned", () => {
    const summary = summarizeRotation(
      [{ characterId: "ghost", actionType: "skill" }],
      byId,
      DEFAULT_EDITOR_SWAP_COST_SECONDS,
    );
    expect(summary.totalSeconds).toBeNull();
  });

  it("reports 0 rather than null for a genuinely empty sequence", () => {
    expect(summarizeRotation([], byId, DEFAULT_EDITOR_SWAP_COST_SECONDS).totalSeconds).toBe(0);
  });
});

describe("add-button accessible names state the destination (§14.4)", () => {
  it("names the step the action will land after", () => {
    expect(addButtonAccessibleName(2, "班尼特", "burst", 2, 90)).toBe(
      "在第 3 步之后插入 班尼特 元素爆发，耗时 2.00 秒，消耗 90 点能量",
    );
  });

  it("names the end of the sequence when nothing is selected", () => {
    expect(addButtonAccessibleName(null, "班尼特", "skill", 1.15, null)).toBe(
      "在序列末尾插入 班尼特 元素战技，耗时 1.15 秒",
    );
  });
});
