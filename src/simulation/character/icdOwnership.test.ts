import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateIcd } from "@/simulation/reactions/icd";
import { STANDARD_ICD } from "@/simulation/reactions/types";
import type { IcdCounter } from "@/simulation/reactions/types";
import { planAbility } from "@/simulation/character/execution";
import type { IcdState } from "@/simulation/character/execution";
import { syntheticSkill, syntheticUnit } from "@/simulation/character/fixtures";

// ============================================================================
// ICD CONSOLIDATION — Manager ruling (2026-09-03).
//
// `src/simulation/reactions/icd.ts` is the SINGLE owner of the ICD rule. ICD is
// an elemental-application mechanic (mechanics' domain), and the reactions
// implementation is the strict superset: it has `icdKey()` for per-sequence
// grouping and `resolveIcdConfig()` for per-ability deviation.
// `src/simulation/character/icd.ts` was a second implementation of the same
// 3-hit / 2.5s concept and is DELETED.
//
// These tests keep it deleted. A duplicate that silently reappears is the exact
// failure this consolidation exists to prevent — two sources of truth drift,
// and the drift shows up as wrong reaction damage, not as a test failure.
// ============================================================================

const CHARACTER_DIR = join(process.cwd(), "src", "simulation", "character");

describe("ICD has exactly one owner", () => {
  it("does not reintroduce src/simulation/character/icd.ts", () => {
    expect(existsSync(join(CHARACTER_DIR, "icd.ts"))).toBe(false);
  });

  it("routes the character module's ICD through the mechanics layer", () => {
    const execution = readFileSync(join(CHARACTER_DIR, "execution.ts"), "utf8");
    const kit = readFileSync(join(CHARACTER_DIR, "kit.ts"), "utf8");

    // The planner calls the mechanics implementation, not a local one.
    expect(execution).toContain('from "@/simulation/reactions/icd"');
    expect(execution).not.toContain('from "@/simulation/character/icd"');
    // The kit's per-ability ICD field is the mechanics `IcdBehaviour`, so an
    // ability override feeds `resolveIcdConfig()` rather than a parallel model.
    expect(kit).toContain("IcdBehaviour");
    expect(kit).not.toContain('from "@/simulation/character/icd"');
  });
});

describe("the planner's ICD verdicts match the owning implementation", () => {
  it("agrees hit-for-hit with evaluateIcd across a window boundary", () => {
    // Independent replay, exactly like the engine/validateAction agreement
    // test: if the planner ever forks the rule, this fails loudly instead of
    // hiding behind shared code.
    const times = [0, 0.1, 0.2, 0.3, 0.4, 2.5, 2.6];

    const planned: boolean[] = [];
    const icd: IcdState = {};
    for (const t of times) {
      const hits = planAbility({
        character: syntheticUnit,
        ability: syntheticSkill,
        startTime: t,
        icd,
      });
      planned.push(hits[0]!.appliesElement === true);
    }

    const replayed: boolean[] = [];
    let counter: IcdCounter | undefined;
    for (const t of times) {
      const decision = evaluateIcd(STANDARD_ICD, counter, t);
      replayed.push(decision.applies);
      counter = decision.counter;
    }

    expect(planned).toEqual(replayed);
    // Pin the actual sequence too, so an agreeing-but-wrong pair still fails.
    // 1st/4th apply inside the window; 2.5s after windowStart the timer resets.
    expect(planned).toEqual([true, false, false, true, false, true, false]);
  });
});
