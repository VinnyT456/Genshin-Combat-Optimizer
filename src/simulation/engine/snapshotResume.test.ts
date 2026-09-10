import { describe, expect, it } from "vitest";
import type {
  AuraSnapshot,
  CharacterSnapshot,
  IcdCounterState,
  ResourceSnapshotState,
  SimulationSnapshot,
} from "@/types";
import { planAbility } from "@/simulation/character/execution";
import type { IcdState } from "@/simulation/character/execution";
import {
  syntheticSkill,
  syntheticUnit,
} from "@/simulation/character/fixtures";
import { EMPTY_AURA_STATE } from "@/simulation/reactions/types";
import {
  createResourceStates,
  resourceValueAt,
} from "@/simulation/character/runtime";

// ============================================================================
// B1 — SimulationSnapshot must be able to RESUME a search node.
//
// The defect: `SimulationSnapshot` carried only time / activeCharacterId /
// per-character {energy, cooldowns}. Three pieces of CARRIED state were
// missing — ICD counters, resource values, and enemy aura.
//
// The ICD one is not a cosmetic omission. `evaluateIcd(behaviour, undefined, t)`
// means "first hit ever for this group" and ALWAYS applies its element. So a
// resume that drops the counters re-applies the first hit after every resume,
// overstating reaction damage in proportion to how often the search resumes —
// i.e. in proportion to depth, exactly where a beam search cuts.
//
// These tests prove the bias is CLOSED (a carried snapshot reproduces the
// unbroken run hit-for-hit), not merely that the fields exist.
// ============================================================================

/** ICD verdicts for `count` casts of the skill, starting from `icd`. */
function applySequence(
  icd: IcdState,
  count: number,
  startTime: number,
  step: number,
): boolean[] {
  const out: boolean[] = [];
  for (let i = 0; i < count; i++) {
    const hits = planAbility({
      character: syntheticUnit,
      ability: syntheticSkill,
      startTime: startTime + i * step,
      icd,
    });
    out.push(hits[0]!.appliesElement === true);
  }
  return out;
}

/** Round-trips ICD state through the snapshot contract, as JSON would. */
function throughSnapshot(icd: IcdState): IcdState {
  const snapshot: CharacterSnapshot = {
    characterId: syntheticUnit.id,
    energy: { current: 0, max: 60, totalGained: 0, totalSpent: 0 },
    cooldowns: {},
    icd,
  };
  const serialized = JSON.parse(JSON.stringify(snapshot)) as CharacterSnapshot;
  // The snapshot field is Readonly; the planner needs a mutable container.
  return { ...(serialized.icd ?? {}) };
}

describe("B1 — ICD state survives a snapshot resume", () => {
  const STEP = 0.1; // well inside the 2.5s ICD window
  const HITS_BEFORE_RESUME = 2;
  const HITS_AFTER_RESUME = 4;
  const TOTAL = HITS_BEFORE_RESUME + HITS_AFTER_RESUME;

  it("reproduces the unbroken run exactly when ICD is carried", () => {
    // Ground truth: one continuous run of 6 casts, never interrupted.
    const continuous = applySequence({}, TOTAL, 0, STEP);

    // Same 6 casts, but snapshotted and resumed after the 2nd.
    const live: IcdState = {};
    const before = applySequence(live, HITS_BEFORE_RESUME, 0, STEP);
    const resumed = throughSnapshot(live);
    const after = applySequence(
      resumed,
      HITS_AFTER_RESUME,
      HITS_BEFORE_RESUME * STEP,
      STEP,
    );

    expect([...before, ...after]).toEqual(continuous);
  });

  it("does NOT re-apply the first hit after a resume", () => {
    const live: IcdState = {};
    applySequence(live, HITS_BEFORE_RESUME, 0, STEP);
    const resumed = throughSnapshot(live);

    // Hit 3 of a 3-hit ICD window must NOT apply. This is the exact hit the
    // dropped-counter bug would have turned into an application.
    const [firstAfterResume] = applySequence(
      resumed,
      1,
      HITS_BEFORE_RESUME * STEP,
      STEP,
    );
    expect(firstAfterResume).toBe(false);
  });

  it("DEMONSTRATES the bias that dropping the counters would reintroduce", () => {
    // Same prefix, but the snapshot drops `icd` — the pre-fix contract.
    const live: IcdState = {};
    applySequence(live, HITS_BEFORE_RESUME, 0, STEP);
    const dropped: IcdState = {};

    const [firstAfterBadResume] = applySequence(
      dropped,
      1,
      HITS_BEFORE_RESUME * STEP,
      STEP,
    );
    // The bug: a suppressed hit becomes an applying one. This test exists so
    // that if the carried field is ever removed, the assertion above and this
    // one cannot both hold.
    expect(firstAfterBadResume).toBe(true);
    expect(firstAfterBadResume).not.toBe(
      applySequence(throughSnapshot(live), 1, HITS_BEFORE_RESUME * STEP, STEP)[0],
    );
  });

  it("counts strictly more applications when ICD is dropped at every resume", () => {
    // The bias correlates with resume COUNT, which is what makes it dangerous
    // for a beam search: deeper nodes resume more often.
    const CASTS = 9;
    const continuous = applySequence({}, CASTS, 0, STEP).filter(Boolean).length;

    // Resume before every single cast, dropping the counters each time.
    let dropped = 0;
    for (let i = 0; i < CASTS; i++) {
      if (applySequence({}, 1, i * STEP, STEP)[0]) dropped++;
    }

    // Carried across every resume instead.
    const carried = (() => {
      let icd: IcdState = {};
      let applied = 0;
      for (let i = 0; i < CASTS; i++) {
        if (applySequence(icd, 1, i * STEP, STEP)[0]) applied++;
        icd = throughSnapshot(icd);
      }
      return applied;
    })();

    expect(carried).toBe(continuous);
    expect(dropped).toBeGreaterThan(continuous);
    expect(dropped).toBe(CASTS); // every hit applies — the worst case
  });
});

describe("B1 — resource state survives a snapshot resume", () => {
  it("carries value and lastChanged, so lazy expiry stays correct", () => {
    const DURATION = 5;
    const states = createResourceStates(
      [
        {
          id: "stacks",
          name: "Stacks",
          initial: 3,
          max: 4,
          durationSeconds: DURATION,
        },
      ],
      /* time */ 2,
    );

    const snapshot: CharacterSnapshot = {
      characterId: "c",
      energy: { current: 0, max: 60, totalGained: 0, totalSpent: 0 },
      cooldowns: {},
      resources: states as ResourceSnapshotState,
    };
    const round = JSON.parse(JSON.stringify(snapshot)) as CharacterSnapshot;
    const resumed = round.resources!["stacks"]!;

    // Expiry is (lastChanged + duration), so BOTH fields must survive.
    expect(resourceValueAt(resumed, 2 + DURATION - 1)).toBe(3);
    expect(resourceValueAt(resumed, 2 + DURATION)).toBe(0);
    // A snapshot that dropped `lastChanged` (defaulting it to 0) would expire
    // this resource two seconds early.
    expect(resourceValueAt({ ...resumed, lastChanged: 0 }, 2 + DURATION - 1)).toBe(0);
  });
});

describe("B1 — enemy aura is expressible in the snapshot", () => {
  it("accepts the mechanics layer's AuraState structurally", () => {
    // Compiles only if `AuraSnapshot` is structurally compatible with the
    // mechanics `AuraState`. `src/types` sits BELOW mechanics in the layering
    // and must not import upward, so structural compatibility is the contract.
    const aura: AuraSnapshot = EMPTY_AURA_STATE;
    const live: AuraSnapshot = {
      auras: [{ element: "pyro", gauge: 2, since: 1.5, decayRate: 0.5 }],
      compound: [{ kind: "frozen", gauge: 1, since: 1.5, decayRate: 0.5 }],
    };

    const snapshot: SimulationSnapshot = {
      time: 1.5,
      characters: {},
      enemyAuras: { boss: live, add: aura },
    };
    const round = JSON.parse(JSON.stringify(snapshot)) as SimulationSnapshot;
    expect(round.enemyAuras!["boss"]).toEqual(live);
    expect(round.enemyAuras!["add"]!.auras).toEqual([]);
  });
});

describe("B1 — the extension is additive", () => {
  it("still accepts a snapshot with none of the new fields", () => {
    const legacy: SimulationSnapshot = {
      time: 12,
      activeCharacterId: "a",
      characters: {
        a: {
          characterId: "a",
          energy: { current: 40, max: 60, totalGained: 40, totalSpent: 0 },
          cooldowns: { "a-e": 18 },
        },
      },
    };
    expect(legacy.enemyAuras).toBeUndefined();
    expect(legacy.characters["a"]!.icd).toBeUndefined();

    // Absent ICD reads as an empty counter set, which is exactly the
    // "first hit ever" semantics — correct for a FRESH run, wrong for a
    // resume. The type cannot enforce that, so the doc comment and the tests
    // above carry it.
    const icd: IcdCounterState = legacy.characters["a"]!.icd ?? {};
    expect(Object.keys(icd)).toEqual([]);
  });
});
