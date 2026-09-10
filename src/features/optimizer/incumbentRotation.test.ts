import { describe, expect, it } from "vitest";
import {
  NO_ADOPTION,
  adoptCandidate,
  canRestore,
  clearAdoptionOnManualEdit,
  restoreIncumbent,
} from "./incumbentRotation";
import type { Rotation } from "@/types";

const handAuthored: Rotation = [
  { characterId: "xiangling", actionType: "burst" },
  { characterId: "bennett", actionType: "burst" },
];

const candidateA: Rotation = [{ characterId: "raiden", actionType: "burst" }];
const candidateB: Rotation = [{ characterId: "xingqiu", actionType: "skill" }];

describe("adoptCandidate", () => {
  it("puts the candidate in the editor", () => {
    const next = adoptCandidate(handAuthored, candidateA, 1, NO_ADOPTION);
    expect(next.rotation).toBe(candidateA);
  });

  it("preserves the rotation being replaced", () => {
    const next = adoptCandidate(handAuthored, candidateA, 1, NO_ADOPTION);
    expect(next.adoption.incumbent).toBe(handAuthored);
    expect(next.adoption.adoptedRank).toBe(1);
  });

  it("keeps the ORIGINAL incumbent across successive adoptions", () => {
    // The destructive bug this guards: adopting rank 1 then rank 2 must still
    // restore the user's hand-authored rotation, not rank 1's suggestion.
    const first = adoptCandidate(handAuthored, candidateA, 1, NO_ADOPTION);
    const second = adoptCandidate(
      first.rotation,
      candidateB,
      2,
      first.adoption,
    );

    expect(second.rotation).toBe(candidateB);
    expect(second.adoption.incumbent).toBe(handAuthored);
    expect(second.adoption.adoptedRank).toBe(2);
  });

  it("does not mutate the incoming rotations", () => {
    const before = [...handAuthored];
    adoptCandidate(handAuthored, candidateA, 1, NO_ADOPTION);
    expect(handAuthored).toEqual(before);
  });
});

describe("restoreIncumbent", () => {
  it("returns null when nothing was adopted", () => {
    // Guards against blanking the editor by restoring from a clean state.
    expect(restoreIncumbent(NO_ADOPTION)).toBeNull();
  });

  it("restores the preserved rotation and clears the adoption", () => {
    const adopted = adoptCandidate(handAuthored, candidateA, 1, NO_ADOPTION);
    const restored = restoreIncumbent(adopted.adoption);

    expect(restored).not.toBeNull();
    expect(restored?.rotation).toBe(handAuthored);
    expect(restored?.adoption).toEqual(NO_ADOPTION);
  });

  it("round-trips: adopt then restore returns the exact original", () => {
    const adopted = adoptCandidate(handAuthored, candidateA, 1, NO_ADOPTION);
    const restored = restoreIncumbent(adopted.adoption);
    expect(restored?.rotation).toEqual(handAuthored);
  });

  it("cannot restore twice", () => {
    const adopted = adoptCandidate(handAuthored, candidateA, 1, NO_ADOPTION);
    const restored = restoreIncumbent(adopted.adoption);
    expect(restoreIncumbent(restored!.adoption)).toBeNull();
  });
});

describe("clearAdoptionOnManualEdit", () => {
  it("drops the restore offer once the user edits by hand", () => {
    // After a manual edit the editor no longer holds the adopted candidate, so
    // "restore" would overwrite the user's fresh work with an older rotation.
    const adopted = adoptCandidate(handAuthored, candidateA, 1, NO_ADOPTION);
    expect(canRestore(adopted.adoption)).toBe(true);
    expect(canRestore(clearAdoptionOnManualEdit())).toBe(false);
  });
});
