import { describe, expect, it } from "vitest";
import type { CharacterDefinition } from "@/types";
import { testPyro } from "@/game-data";
import {
  type Team,
  TEAM_SIZE,
  applyBuildEdit,
  describeSelection,
  emptyTeam,
  isEmpty,
  isFull,
  memberCount,
  members,
  moveSlot,
  referenceCharacterLevel,
  retainTeamActions,
  orphanedActionCount,
  resolveActiveId,
  setSlot,
  slotOf,
  teamFrom,
} from "@/features/team-builder/teamModel";

/** Distinct roster entries derived from the single shipped test character. */
function characterWithId(id: string): CharacterDefinition {
  return { ...testPyro, id, name: `Character ${id}` };
}

const a = characterWithId("a");
const b = characterWithId("b");
const c = characterWithId("c");
const d = characterWithId("d");

describe("emptyTeam / teamFrom", () => {
  it("always produces exactly TEAM_SIZE positional slots", () => {
    expect(emptyTeam()).toHaveLength(TEAM_SIZE);
    expect(teamFrom([a])).toHaveLength(TEAM_SIZE);
    expect(teamFrom([a, b, c, d])).toHaveLength(TEAM_SIZE);
  });

  it("pads a short roster with holes and preserves order", () => {
    expect(teamFrom([a, b])).toEqual([a, b, null, null]);
  });

  it("ignores roster entries beyond the party size", () => {
    expect(memberCount(teamFrom([a, b, c, d, characterWithId("e")]))).toBe(TEAM_SIZE);
  });
});

describe("membership queries", () => {
  it("counts only filled slots", () => {
    expect(memberCount(emptyTeam())).toBe(0);
    expect(memberCount(teamFrom([a, b]))).toBe(2);
  });

  it("reports empty and full", () => {
    expect(isEmpty(emptyTeam())).toBe(true);
    expect(isFull(teamFrom([a, b, c, d]))).toBe(true);
    expect(isFull(teamFrom([a, b, c]))).toBe(false);
  });

  it("returns members in party order with holes removed", () => {
    const team = setSlot(setSlot(emptyTeam(), 2, a), 0, b);
    expect(members(team).map((m) => m.id)).toEqual(["b", "a"]);
  });

  it("finds the slot holding a character, or -1", () => {
    expect(slotOf(teamFrom([a, b]), "b")).toBe(1);
    expect(slotOf(teamFrom([a, b]), "z")).toBe(-1);
  });
});

describe("setSlot", () => {
  it("fills an empty slot", () => {
    expect(setSlot(emptyTeam(), 1, a)[1]).toBe(a);
  });

  it("clears a slot with null", () => {
    expect(setSlot(teamFrom([a, b]), 0, null)).toEqual([null, b, null, null]);
  });

  it("swaps rather than duplicating when the character is already teamed", () => {
    const team = setSlot(teamFrom([a, b]), 3, a);
    expect(team).toEqual([null, b, null, a]);
    expect(members(team).filter((m) => m.id === "a")).toHaveLength(1);
  });

  it("is a no-op for out-of-range slots", () => {
    const team = teamFrom([a]);
    expect(setSlot(team, TEAM_SIZE, b)).toBe(team);
    expect(setSlot(team, -1, b)).toBe(team);
  });

  it("does not mutate the input", () => {
    const team = teamFrom([a]);
    setSlot(team, 1, b);
    expect(team).toEqual([a, null, null, null]);
  });
});

describe("moveSlot", () => {
  it("shifts intervening slots when moving forward", () => {
    expect(moveSlot(teamFrom([a, b, c, d]), 0, 2)).toEqual([b, c, a, d]);
  });

  it("shifts intervening slots when moving backward", () => {
    expect(moveSlot(teamFrom([a, b, c, d]), 3, 1)).toEqual([a, d, b, c]);
  });

  it("can move a character across a hole", () => {
    expect(moveSlot(teamFrom([a, b]), 0, 3)).toEqual([b, null, null, a]);
  });

  it("is a no-op for identical or out-of-range indices", () => {
    const team = teamFrom([a, b]);
    expect(moveSlot(team, 1, 1)).toBe(team);
    expect(moveSlot(team, 0, TEAM_SIZE)).toBe(team);
  });

  it("preserves party size", () => {
    expect(moveSlot(teamFrom([a, b, c]), 2, 0)).toHaveLength(TEAM_SIZE);
  });
});

describe("resolveActiveId", () => {
  it("keeps a valid preference", () => {
    expect(resolveActiveId(teamFrom([a, b]), "b")).toBe("b");
  });

  it("falls back to the first occupied slot when the preference left the team", () => {
    expect(resolveActiveId(teamFrom([a, b]), "z")).toBe("a");
  });

  it("falls back to the first occupied slot when no preference is set", () => {
    const team = setSlot(emptyTeam(), 2, c);
    expect(resolveActiveId(team, null)).toBe("c");
  });

  it("returns null for an empty team", () => {
    expect(resolveActiveId(emptyTeam(), null)).toBeNull();
  });
});

describe("orphanedActionCount", () => {
  it("counts actions whose character is no longer teamed", () => {
    expect(orphanedActionCount(teamFrom([a]), ["a", "b", "b"])).toBe(2);
  });

  it("returns zero when every action is covered", () => {
    expect(orphanedActionCount(teamFrom([a, b]), ["a", "b"])).toBe(0);
  });

  it("counts every action for an empty team", () => {
    expect(orphanedActionCount(emptyTeam(), ["a", "b"])).toBe(2);
  });
});

describe("retainTeamActions", () => {
  it("removes restored actions for characters outside the current team", () => {
    const rotation = [
      { characterId: "a", actionType: "skill" as const },
      { characterId: "old-character", actionType: "burst" as const },
      { characterId: "a", actionType: "normal" as const },
    ];

    expect(retainTeamActions(teamFrom([a]), rotation)).toEqual([
      rotation[0],
      rotation[2],
    ]);
  });

  it("returns an empty sequence when no restored action belongs to the team", () => {
    expect(retainTeamActions(teamFrom([a]), [
      { characterId: "old-character", actionType: "skill" },
    ])).toEqual([]);
  });
});

describe("describeSelection", () => {
  it("announces a simple add", () => {
    expect(describeSelection(emptyTeam(), 1, a)).toBe("Character a added to slot 2.");
  });

  it("names BOTH characters when setSlot swaps two occupied slots", () => {
    // a in slot 0, b in slot 1; choosing a for slot 1 swaps the pair.
    expect(describeSelection(teamFrom([a, b]), 1, a)).toBe(
      "Character a moved to slot 2, Character b moved to slot 1.",
    );
  });

  it("announces a move when the destination slot was empty", () => {
    expect(describeSelection(teamFrom([a]), 2, a)).toBe(
      "Character a moved to slot 3.",
    );
  });

  it("announces a replacement when a different character held the slot", () => {
    expect(describeSelection(teamFrom([a]), 0, b)).toBe(
      "Character a replaced by Character b in slot 1.",
    );
  });

  it("treats re-selecting the same character in the same slot as an add", () => {
    expect(describeSelection(teamFrom([a]), 0, a)).toBe("Character a added to slot 1.");
  });
});

describe("referenceCharacterLevel", () => {
  const at = (level: number): CharacterDefinition =>
    ({ ...testPyro, id: `c${level}`, level }) as CharacterDefinition;

  it("returns the first member's level", () => {
    expect(referenceCharacterLevel(teamFrom([at(80), at(90)]))).toBe(80);
  });

  it("returns null for an empty team rather than assuming a level", () => {
    // The hardcoded `90` this replaced rendered an assumption as a result;
    // null makes the caller hide the preview instead (finding H5).
    expect(referenceCharacterLevel(emptyTeam())).toBeNull();
  });

  it("ignores leading holes and uses the first real member", () => {
    const team = [null, at(70), null, null] as Team;
    expect(referenceCharacterLevel(team)).toBe(70);
  });
});

describe("applyBuildEdit", () => {
  function character(): CharacterDefinition {
    return {
      id: "bennett",
      name: "Bennett",
      element: "pyro",
      level: 90,
      constellation: 0,
      talentLevels: { normal: 6, skill: 9, burst: 10 },
      baseStats: {
        atk: 191,
        hp: 12397,
        def: 771,
        critRate: 0.05,
        critDmg: 0.5,
        energyRecharge: 1,
        elementalMastery: 0,
        dmgBonus: 0,
        elementalDmgBonus: {},
      },
    } as unknown as CharacterDefinition;
  }

  it("persists a changed level alongside its resolved stats", () => {
    const next = applyBuildEdit(character(), {
      baseStats: { ...character().baseStats, atk: 16 },
      level: 1,
    });
    // Both must move together. Dropping either half is a distinct real bug.
    expect(next.level).toBe(1);
    expect(next.baseStats.atk).toBe(16);
  });

  it("leaves level unchanged when the edit omits it", () => {
    const next = applyBuildEdit(character(), {
      baseStats: character().baseStats,
    });
    expect(next.level).toBe(90);
  });

  it("treats an absent field as unchanged, never as a reset", () => {
    const start = { ...character(), constellation: 4 };
    const next = applyBuildEdit(start, { baseStats: start.baseStats });
    expect(next.constellation).toBe(4);
    expect(next.talentLevels).toEqual({ normal: 6, skill: 9, burst: 10 });
  });

  it("applies constellation and talent levels when supplied", () => {
    const next = applyBuildEdit(character(), {
      baseStats: character().baseStats,
      constellation: 6,
      talentLevels: { normal: 10, skill: 10, burst: 10 },
    });
    expect(next.constellation).toBe(6);
    expect(next.talentLevels).toEqual({ normal: 10, skill: 10, burst: 10 });
  });

  it("accepts level 0-adjacent edges without treating them as absent", () => {
    // `!== undefined` rather than a truthiness check: level 1 is real.
    const next = applyBuildEdit(character(), {
      baseStats: character().baseStats,
      level: 1,
      constellation: 0,
    });
    expect(next.level).toBe(1);
    expect(next.constellation).toBe(0);
  });
});
