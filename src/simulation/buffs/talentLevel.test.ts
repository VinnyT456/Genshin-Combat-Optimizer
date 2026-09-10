import { describe, expect, it } from "vitest";
import type { BuffContext } from "@/types";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import {
  MAX_TALENT_LEVEL,
  MIN_TALENT_LEVEL,
  talentTable,
  talentValueAt,
} from "@/simulation/character/talent";
import { makeTalentLevelResolver } from "@/simulation/buffs/makeBuffResolver";
import {
  MAX_TALENT_LEVEL_BOUND,
  MIN_TALENT_LEVEL_BOUND,
  effectiveTalentLevel,
  resolveTalentLevel,
  sumTalentLevelBoosts,
} from "@/simulation/buffs/talentLevel";
import type { ActiveBuff, Buff } from "@/simulation/buffs/types";

// A buff carrying ONLY a talent-level boost — the exact shape of the 259
// emitted "Increases the Level of X by 3" constellation effects.
function boostBuff(overrides: Partial<Buff> = {}): Buff {
  return {
    id: "c3-skill-boost",
    source: "test-constellation",
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "party" },
    talentLevelModifiers: [{ slot: "skill", levels: 3 }],
    ...overrides,
  };
}

function active(buff: Buff, stacks = 1): ActiveBuff {
  return { buff, stacks };
}

function makeContext(time = 0): BuffContext {
  return {
    time,
    character: testPyro,
    ability: testPyro.elementalSkill,
    activeCharacterId: testPyro.id,
    snapshot: { time, activeCharacterId: testPyro.id, characters: {} },
    enemy: testEnemy,
  };
}

// ---------------------------------------------------------------------------
// The bound must agree with the authoritative definition
// ---------------------------------------------------------------------------

describe("talent-level bounds mirror the character module", () => {
  // `talentLevel.ts` re-declares these because mechanics may not import upward.
  // That is only safe if they actually agree, so pin it: if the game ever
  // raises the cap and only ONE constant moves, this fails.
  it("MAX_TALENT_LEVEL_BOUND equals the authoritative MAX_TALENT_LEVEL", () => {
    expect(MAX_TALENT_LEVEL_BOUND).toBe(MAX_TALENT_LEVEL);
  });

  it("MIN_TALENT_LEVEL_BOUND equals the authoritative MIN_TALENT_LEVEL", () => {
    expect(MIN_TALENT_LEVEL_BOUND).toBe(MIN_TALENT_LEVEL);
  });
});

// ---------------------------------------------------------------------------
// ACCEPTANCE 1 — a conditional boost applies ONLY when its condition holds
// ---------------------------------------------------------------------------

describe("conditional talent-level boosts resolve through the buff machinery", () => {
  it("applies when the buff's condition matches the hit", () => {
    const buff = boostBuff({ conditions: { damageTypes: ["skill"] } });
    const resolver = makeTalentLevelResolver({ buffs: [buff] });

    // testPyro's elementalSkill is a `skill` damage type, so the gate passes.
    expect(resolver(makeContext())).toEqual({ skill: 3 });
  });

  it("does NOT apply when the condition fails", () => {
    const buff = boostBuff({ conditions: { damageTypes: ["burst"] } });
    const resolver = makeTalentLevelResolver({ buffs: [buff] });

    // Skill hit vs a burst-only gate: no boost, and the key is OMITTED.
    expect(resolver(makeContext())).toEqual({});
  });

  it("does NOT apply outside its activation window", () => {
    const buff = boostBuff({ startTime: 5, duration: 10 });
    const resolver = makeTalentLevelResolver({ buffs: [buff] });

    expect(resolver(makeContext(4.9))).toEqual({});
    expect(resolver(makeContext(5))).toEqual({ skill: 3 });
    // Half-open window: expired exactly at start + duration.
    expect(resolver(makeContext(15))).toEqual({});
  });

  it("does NOT apply when targeting excludes the character", () => {
    const buff = boostBuff({
      targets: { scope: "characters", characterIds: ["someone-else"] },
    });
    const resolver = makeTalentLevelResolver({ buffs: [buff] });

    expect(resolver(makeContext())).toEqual({});
  });

  // This is the constellation gate in its real form: a C3 effect is authored
  // as a buff that is only PRESENT in the buff list when constellation >= 3.
  // Nothing in this module knows what a constellation is.
  it("a C3-gated boost is absent below C3 and present at C3+", () => {
    const c3Buff = boostBuff();
    const buffsFor = (constellation: number): readonly Buff[] =>
      constellation >= 3 ? [c3Buff] : [];

    expect(makeTalentLevelResolver({ buffs: buffsFor(2) })(makeContext())).toEqual({});
    expect(makeTalentLevelResolver({ buffs: buffsFor(3) })(makeContext())).toEqual({
      skill: 3,
    });
    expect(makeTalentLevelResolver({ buffs: buffsFor(6) })(makeContext())).toEqual({
      skill: 3,
    });
  });
});

// ---------------------------------------------------------------------------
// ACCEPTANCE 2 — multiple boosts compose
// ---------------------------------------------------------------------------

describe("talent-level boosts compose", () => {
  it("two boosts to the SAME slot add", () => {
    const boosts = sumTalentLevelBoosts([
      active(boostBuff({ id: "c3" })),
      active(boostBuff({ id: "c5", talentLevelModifiers: [{ slot: "skill", levels: 3 }] })),
    ]);
    expect(boosts).toEqual({ skill: 6 });
  });

  it("boosts to DIFFERENT slots stay independent", () => {
    const boosts = sumTalentLevelBoosts([
      active(boostBuff({ id: "c3", talentLevelModifiers: [{ slot: "burst", levels: 3 }] })),
      active(boostBuff({ id: "c5", talentLevelModifiers: [{ slot: "skill", levels: 3 }] })),
    ]);
    expect(boosts).toEqual({ skill: 3, burst: 3 });
  });

  it("several modifiers on ONE buff each land in their own slot", () => {
    const boosts = sumTalentLevelBoosts([
      active(
        boostBuff({
          talentLevelModifiers: [
            { slot: "normal", levels: 1 },
            { slot: "skill", levels: 3 },
            { slot: "burst", levels: 5 },
          ],
        }),
      ),
    ]);
    expect(boosts).toEqual({ normal: 1, skill: 3, burst: 5 });
  });

  it("scales by stack count, like every other buff channel", () => {
    const buff = boostBuff({
      stacking: { mode: "stack", maxStacks: 3 },
      talentLevelModifiers: [{ slot: "skill", levels: 2 }],
    });
    expect(sumTalentLevelBoosts([active(buff, 3)])).toEqual({ skill: 6 });
  });

  it("OMITS a slot whose boosts cancel to zero (sparse-key invariant)", () => {
    // `{}` and `{ skill: 0 }` are behaviourally identical but hash differently,
    // which would split optimizer memo entries for zero information.
    const boosts = sumTalentLevelBoosts([
      active(boostBuff({ id: "up" })),
      active(boostBuff({ id: "down", talentLevelModifiers: [{ slot: "skill", levels: -3 }] })),
    ]);
    expect(boosts).toEqual({});
    expect(Object.keys(boosts)).toHaveLength(0);
  });

  it("returns an empty bag for no buffs, and never mutates its input", () => {
    const buff = boostBuff();
    const input = [active(buff)];
    sumTalentLevelBoosts(input);
    expect(sumTalentLevelBoosts([])).toEqual({});
    // The authored modifier list is untouched by folding.
    expect(buff.talentLevelModifiers).toEqual([{ slot: "skill", levels: 3 }]);
    expect(input).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ACCEPTANCE 3 — the resulting LEVEL clamps at 15
// ---------------------------------------------------------------------------

describe("talent level clamps at the game maximum", () => {
  it("clamps a boosted level-15 talent to 15, not 18", () => {
    expect(resolveTalentLevel(15, 3)).toBe(15);
  });

  it("clamps at the boundary and just under it", () => {
    expect(resolveTalentLevel(12, 3)).toBe(15);
    expect(resolveTalentLevel(11, 3)).toBe(14);
    expect(resolveTalentLevel(13, 3)).toBe(15);
  });

  it("clamps composed boosts that individually would fit", () => {
    // +3 and +3 on a level-10 talent is +6 => 16, which must clamp.
    const boosts = sumTalentLevelBoosts([
      active(boostBuff({ id: "c3" })),
      active(boostBuff({ id: "c5" })),
    ]);
    expect(effectiveTalentLevel("skill", 10, boosts)).toBe(15);
  });

  it("clamps a negative result at the minimum level", () => {
    expect(resolveTalentLevel(1, -5)).toBe(1);
  });

  it("leaves an in-range level untouched", () => {
    expect(resolveTalentLevel(8, 3)).toBe(11);
  });

  it("resolves an unboosted slot to its configured level", () => {
    expect(effectiveTalentLevel("burst", 9, { skill: 3 })).toBe(9);
  });

  // The reason the clamp matters in practice: a 15-entry table must never be
  // indexed past its end, and the REPORTED level must stay honest.
  it("a clamped level reads the last real row of a 15-entry table", () => {
    const table = talentTable(
      Array.from({ length: MAX_TALENT_LEVEL }, (_, i) => (i + 1) / 100),
    );
    const level = effectiveTalentLevel("skill", 15, { skill: 3 });
    expect(level).toBe(15);
    expect(talentValueAt(table, level)).toBe(0.15);
    expect(talentValueAt(table, level)).not.toBeUndefined();
  });

  it("a boost genuinely selects a different row than the unboosted level", () => {
    // Mutation guard: if the delta were dropped, both lookups would agree.
    const table = talentTable(
      Array.from({ length: MAX_TALENT_LEVEL }, (_, i) => (i + 1) / 100),
    );
    const boosts = sumTalentLevelBoosts([active(boostBuff())]);
    const boosted = effectiveTalentLevel("skill", 9, boosts);
    expect(boosted).toBe(12);
    expect(talentValueAt(table, boosted)).toBe(0.12);
    expect(talentValueAt(table, boosted)).not.toBe(talentValueAt(table, 9));
  });
});

// ---------------------------------------------------------------------------
// Purity / determinism of the seam
// ---------------------------------------------------------------------------

describe("makeTalentLevelResolver purity", () => {
  it("returns a FRESH object each call (no shared accumulator)", () => {
    const resolver = makeTalentLevelResolver({ buffs: [boostBuff()] });
    const first = resolver(makeContext());
    const second = resolver(makeContext());
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });

  it("is deterministic and unaffected by buff array order", () => {
    const a = boostBuff({ id: "a", talentLevelModifiers: [{ slot: "skill", levels: 3 }] });
    const b = boostBuff({ id: "b", talentLevelModifiers: [{ slot: "burst", levels: 2 }] });
    const forward = makeTalentLevelResolver({ buffs: [a, b] })(makeContext());
    const reversed = makeTalentLevelResolver({ buffs: [b, a] })(makeContext());
    expect(forward).toEqual(reversed);
    expect(forward).toEqual({ skill: 3, burst: 2 });
  });

  it("mutating the caller's array after construction cannot change results", () => {
    const buffs: Buff[] = [boostBuff()];
    const resolver = makeTalentLevelResolver({ buffs });
    buffs.push(boostBuff({ id: "sneaky" }));
    expect(resolver(makeContext())).toEqual({ skill: 3 });
  });

  it("does not mutate the context it is handed", () => {
    const resolver = makeTalentLevelResolver({ buffs: [boostBuff()] });
    const context = makeContext();
    const before = structuredClone(context.snapshot);
    resolver(context);
    expect(context.snapshot).toEqual(before);
  });

  it("a buff carrying no talent modifiers contributes nothing", () => {
    const statOnly = boostBuff({
      talentLevelModifiers: undefined,
      modifiers: [{ stat: "atkPercent", value: 0.2 }],
    });
    expect(makeTalentLevelResolver({ buffs: [statOnly] })(makeContext())).toEqual({});
  });
});
