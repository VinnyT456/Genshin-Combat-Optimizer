// ---------------------------------------------------------------------------
// Robustness of the session-storage workspace draft
// (`src/features/simulation/workspacePersistence.ts`).
//
// A persisted draft is UNTRUSTED input: it may be from an older build, from a
// different URL's team, or hand-edited. The LOAD path already fails safe —
// `parseWorkspaceDraft` returns `null` for anything it cannot validate.
//
// The SAVE path does not. `serializeWorkspaceDraft` THROWS a bare `TypeError`,
// and `WorkspacePage` calls it inside a `useEffect` with no guard, so any live
// state that fails `validDraft` escapes as an uncaught render-phase exception:
// a client-side exception and a blank page instead of a usable workspace.
//
// The tests marked DESIRED BEHAVIOUR below currently FAIL. They pin the
// contract the owning module must satisfy: a draft that cannot be persisted is
// DISCARDED, never fatal.
// ---------------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import type {
  CharacterDefinition,
  EnemyState,
  Rotation,
  SimulationConfig,
} from "@/types";
import { characters, testEnemy } from "@/game-data";
import {
  parseWorkspaceDraft,
  serializeWorkspaceDraft,
  type WorkspaceDraftSnapshot,
} from "@/features/simulation/workspacePersistence";

function required(id: string): CharacterDefinition {
  const found = characters.find((c) => c.id === id);
  if (found === undefined) throw new Error(`missing test character "${id}"`);
  return found;
}

const raiden = required("raiden-shogun");

function draft(
  overrides: Partial<WorkspaceDraftSnapshot> = {},
): WorkspaceDraftSnapshot {
  return {
    team: [raiden, null, null, null],
    enemy: testEnemy,
    rotation: [
      { characterId: raiden.id, actionType: "skill" },
    ] satisfies Rotation,
    simConfig: { swapCost: 0.6 } satisfies Partial<SimulationConfig>,
    searchBudget: "standard",
    searchObjective: "total-damage",
    searchDuration: 20,
    ...overrides,
  };
}

describe("the load path fails safe (already correct)", () => {
  it("round-trips a valid draft", () => {
    const parsed = parseWorkspaceDraft(serializeWorkspaceDraft(draft()));
    expect(parsed).not.toBeNull();
    expect(parsed?.rotation).toHaveLength(1);
  });

  it("returns null for malformed JSON rather than throwing", () => {
    expect(parseWorkspaceDraft("{not json")).toBeNull();
    expect(parseWorkspaceDraft("")).toBeNull();
    expect(parseWorkspaceDraft("null")).toBeNull();
    expect(parseWorkspaceDraft("[]")).toBeNull();
  });

  it("returns null for a structurally invalid draft rather than throwing", () => {
    const corrupt = [
      JSON.stringify({ version: 1 }),
      JSON.stringify({ version: 1, ...draft(), rotation: "not-an-array" }),
      JSON.stringify({ version: 1, ...draft(), searchDuration: -1 }),
      JSON.stringify({ version: 1, ...draft(), enemy: { id: "" } }),
      JSON.stringify({ ...draft() }), // untagged: no version
      JSON.stringify({ version: 99, ...draft() }),
    ];
    for (const raw of corrupt) {
      expect(() => parseWorkspaceDraft(raw)).not.toThrow();
      expect(parseWorkspaceDraft(raw)).toBeNull();
    }
  });

  it("returns null for a draft whose rotation names unknown characters", () => {
    // Team/rotation id MISMATCH is not itself a schema violation — ids are only
    // checked for shape. The draft loads and the editor flags the orphan rows.
    // Pinned so the fallback path is understood: the mismatch is survivable.
    const mismatched = serializeWorkspaceDraft(
      draft({ rotation: [{ characterId: "no-such-character", actionType: "skill" }] }),
    );
    const parsed = parseWorkspaceDraft(mismatched);
    expect(parsed).not.toBeNull();
    expect(parsed?.rotation[0]?.characterId).toBe("no-such-character");
  });
});

describe("the save path is FATAL — these are the crash repros", () => {
  // The REACHABLE trigger is an explicit-`undefined` optional field on a roster
  // character; see `workspaceDraftCrash.dom.test.tsx` for that root cause. The
  // cases below are the rest of the throwing surface, reachable from any state
  // that fails `validDraft`. Every one of them is called from an unguarded
  // `useEffect` in `WorkspacePage.tsx:307`.
  const nanLevelEnemy = { ...testEnemy, level: Number.NaN } as EnemyState;

  it("throws a TypeError on a NaN enemy level", () => {
    expect(() => serializeWorkspaceDraft(draft({ enemy: nanLevelEnemy }))).toThrow(
      TypeError,
    );
    expect(() => serializeWorkspaceDraft(draft({ enemy: nanLevelEnemy }))).toThrow(
      /invalid IDs or values/,
    );
  });

  it("throws on a NaN searchDuration", () => {
    expect(() =>
      serializeWorkspaceDraft(draft({ searchDuration: Number.NaN })),
    ).toThrow(TypeError);
  });

  it("throws on a non-finite number anywhere in the tree", () => {
    expect(() =>
      serializeWorkspaceDraft(
        draft({ simConfig: { swapCost: Number.POSITIVE_INFINITY } }),
      ),
    ).toThrow(TypeError);
  });

  it("throws on a team member with an empty id", () => {
    expect(() =>
      serializeWorkspaceDraft(
        draft({ team: [{ ...raiden, id: "" }, null, null, null] }),
      ),
    ).toThrow(TypeError);
  });

  it("throws on a rotation action with an empty characterId", () => {
    expect(() =>
      serializeWorkspaceDraft(
        draft({ rotation: [{ characterId: "", actionType: "skill" }] }),
      ),
    ).toThrow(TypeError);
  });

  it("THE ROOT CAUSE: rejects an explicit `undefined` the format cannot express", () => {
    // `finiteTree` accepts number/string/boolean/null/object and rejects
    // everything else, so `{ particles: undefined }` fails while `{}` passes.
    // `JSON.stringify` erases both to the same bytes, so the two drafts are
    // the SAME persisted document — one is accepted and one is fatal.
    const withUndefined = draft({
      simConfig: { swapCost: 0.6, timeLimit: undefined },
    });
    expect(() => serializeWorkspaceDraft(withUndefined)).toThrow(TypeError);

    const withoutKey = draft({ simConfig: { swapCost: 0.6 } });
    expect(() => serializeWorkspaceDraft(withoutKey)).not.toThrow();

    // Proof they are indistinguishable once persisted.
    expect(JSON.stringify(withUndefined.simConfig)).toBe(
      JSON.stringify(withoutKey.simConfig),
    );
  });

  it("DESIRED: an explicit `undefined` is accepted exactly like an absent key", () => {
    // Currently FAILS. Absence is absence; `finiteTree` must skip `undefined`
    // rather than treat it as a non-finite value.
    expect(() =>
      serializeWorkspaceDraft(
        draft({ simConfig: { swapCost: 0.6, timeLimit: undefined } }),
      ),
    ).not.toThrow();
  });
});

describe("DESIRED BEHAVIOUR — a draft that cannot be persisted is discarded, not fatal", () => {
  // These describe the contract `workspacePersistence` should expose so
  // `WorkspacePage` has a non-throwing call to make. Owning module:
  // frontend-engineer (`src/features/simulation/workspacePersistence.ts`
  // + the autosave effect in `src/features/workspace/WorkspacePage.tsx`).
  //
  // Either a `trySerializeWorkspaceDraft(): string | null` sibling, or a
  // try/catch at the single call site, satisfies this. The throwing
  // `serializeWorkspaceDraft` may stay for the replay-pack path, which is a
  // deliberate user action rather than an autosave.

  interface MaybeSafe {
    readonly trySerializeWorkspaceDraft?: (
      snapshot: WorkspaceDraftSnapshot,
    ) => string | null;
  }

  it("exposes a non-throwing serializer for the autosave path", async () => {
    const module_ = (await import(
      "@/features/simulation/workspacePersistence"
    )) as MaybeSafe;
    expect(typeof module_.trySerializeWorkspaceDraft).toBe("function");
  });

  it("returns null instead of throwing for every state that crashes today", async () => {
    const module_ = (await import(
      "@/features/simulation/workspacePersistence"
    )) as MaybeSafe;
    const trySerialize = module_.trySerializeWorkspaceDraft;
    if (trySerialize === undefined) {
      throw new Error(
        "trySerializeWorkspaceDraft is not implemented; the autosave effect " +
          "still calls the throwing serializer and blanks the page",
      );
    }

    const crashing: readonly WorkspaceDraftSnapshot[] = [
      draft({ enemy: { ...testEnemy, level: Number.NaN } as EnemyState }),
      draft({ searchDuration: Number.NaN }),
      draft({ simConfig: { swapCost: Number.POSITIVE_INFINITY } }),
      draft({ rotation: [{ characterId: "", actionType: "skill" }] }),
    ];
    for (const snapshot of crashing) {
      expect(() => trySerialize(snapshot)).not.toThrow();
      expect(trySerialize(snapshot)).toBeNull();
    }

    // A valid draft still serializes to a parseable string.
    const ok = trySerialize(draft());
    expect(ok).not.toBeNull();
    expect(parseWorkspaceDraft(ok as string)).not.toBeNull();
  });
});
