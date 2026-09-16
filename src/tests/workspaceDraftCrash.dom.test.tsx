// ---------------------------------------------------------------------------
// BLANK-PAGE CRASH: `TypeError: Workspace draft contains invalid IDs or values`
//
// Owning module: frontend-engineer
//   `src/features/simulation/workspacePersistence.ts` (`finiteTree` / `validDraft`)
//   `src/features/workspace/WorkspacePage.tsx`        (the unguarded autosave effect)
//
// ROOT CAUSE (found by enumeration, not by guessing):
//
//   `finiteTree` walks `Object.values(value)` and returns `false` for anything
//   that is neither a number, a string, a boolean, `null`, nor an object. An
//   OPTIONAL FIELD THAT IS EXPLICITLY PRESENT WITH THE VALUE `undefined`
//   therefore fails the finiteness check, so `validDraft` rejects a perfectly
//   valid draft and `serializeWorkspaceDraft` throws.
//
//   `noelle.elementalSkill.particles` is exactly such a field. So are the
//   equivalents on 17 other roster entries.
//
// The throw happens inside `WorkspacePage`'s autosave `useEffect`, which has no
// try/catch, so it escapes as an uncaught error, React unmounts the tree, and
// the user gets a client-side exception on a blank page.
//
// SEVERITY: 18 of 132 playable roster entries brick the workspace merely by
// being on the team. `sessionStorage` staleness is not required — it is only
// how the reporter happened to hit it.
// ---------------------------------------------------------------------------

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { CharacterDefinition } from "@/types";
import Page from "@/features/workspace/WorkspacePage";
import { characters, testEnemy } from "@/game-data";
import {
  serializeWorkspaceDraft,
  workspaceDraftKey,
  type WorkspaceDraftSnapshot,
} from "@/features/simulation/workspacePersistence";

const RUN_LABEL = "执行循环模拟";

function required(id: string): CharacterDefinition {
  const found = characters.find((c) => c.id === id);
  if (found === undefined) throw new Error(`missing test character "${id}"`);
  return found;
}

function snapshotWith(team: readonly (CharacterDefinition | null)[]): WorkspaceDraftSnapshot {
  return {
    team,
    enemy: testEnemy,
    rotation: [],
    simConfig: {},
    searchBudget: "standard",
    searchObjective: "total-damage",
    searchDuration: 20,
  };
}

beforeEach(() => {
  window.sessionStorage.clear();
});

describe("the defect, stated at the pure seam", () => {
  it("rejects a character carrying an explicit `undefined` optional field", () => {
    // Minimal repro, no DOM, no storage: one real roster entry.
    const noelle = required("noelle");
    expect(
      Object.prototype.hasOwnProperty.call(noelle.elementalSkill, "particles"),
    ).toBe(true);
    expect(noelle.elementalSkill.particles).toBeUndefined();

    expect(() =>
      serializeWorkspaceDraft(snapshotWith([noelle, null, null, null])),
    ).toThrow(/invalid IDs or values/);
  });

  it("reduces to a single `undefined` property anywhere in the tree", () => {
    const bennett = required("bennett");
    const poisoned = {
      ...bennett,
      elementalSkill: { ...bennett.elementalSkill, particles: undefined },
    } as CharacterDefinition;
    expect(() =>
      serializeWorkspaceDraft(snapshotWith([poisoned, null, null, null])),
    ).toThrow(/invalid IDs or values/);

    // `undefined` survives neither JSON nor the engine — dropping the key is
    // the same draft, and it serializes fine. That is the whole difference.
    const clean = { ...poisoned, elementalSkill: { ...bennett.elementalSkill } };
    delete (clean.elementalSkill as { particles?: number }).particles;
    expect(() =>
      serializeWorkspaceDraft(snapshotWith([clean, null, null, null])),
    ).not.toThrow();
  });

  it("DESIRED: every roster character can be persisted", () => {
    // Currently FAILS, listing the affected ids. `undefined` is absence, and
    // absence must be accepted exactly like a missing key: `JSON.stringify`
    // erases both identically, so rejecting one and accepting the other is a
    // distinction the persisted format cannot even represent.
    const rejected = characters
      .filter((character) => {
        try {
          serializeWorkspaceDraft(snapshotWith([character, null, null, null]));
          return false;
        } catch {
          return true;
        }
      })
      .map((character) => character.id);

    expect(rejected).toEqual([]);
  });
});

describe("the crash, at the page", () => {
  it("DESIRED: a workspace whose URL team includes Noelle still renders", { timeout: 30000 }, async () => {
    window.history.replaceState(
      null,
      "",
      "/workspace?mode=experiment&view=all&team=noelle,bennett,xiangling,xingqiu",
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<Page />);

    // Today this rejects with the TypeError before the button ever appears.
    await expect(
      screen.findByRole("button", { name: RUN_LABEL }),
    ).resolves.toBeTruthy();
  });

  it("DESIRED: a saved draft whose team differs from the URL team does not crash", { timeout: 30000 }, async () => {
    // The reporter's exact path: a draft saved for one team, then a URL naming
    // a different one. The URL team wins, and if ANY of its members carries an
    // `undefined` optional field the first autosave throws.
    window.sessionStorage.setItem(
      workspaceDraftKey("experiment"),
      serializeWorkspaceDraft(
        snapshotWith([required("bennett"), required("xiangling"), null, null]),
      ),
    );
    window.history.replaceState(
      null,
      "",
      "/workspace?mode=experiment&view=all&team=raiden-shogun,xingqiu,noelle,fischl",
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<Page />);

    await expect(
      screen.findByRole("button", { name: RUN_LABEL }),
    ).resolves.toBeTruthy();
  });

  it("DESIRED: a corrupt stored draft is discarded, never fatal", { timeout: 30000 }, async () => {
    // These already pass — the LOAD path is correctly defensive. Kept so a
    // future guard added to the save path cannot regress the load path.
    const corrupt = [
      "{not json",
      "null",
      "[]",
      JSON.stringify({ version: 1 }),
      JSON.stringify({ version: 1, team: "nope" }),
      JSON.stringify({ version: 99, team: [null, null, null, null] }),
    ];
    for (const raw of corrupt) {
      window.sessionStorage.clear();
      window.sessionStorage.setItem(workspaceDraftKey("experiment"), raw);
      window.history.replaceState(
        null,
        "",
        "/workspace?mode=experiment&view=all&team=raiden-shogun,bennett,xiangling,xingqiu",
      );
      vi.spyOn(console, "error").mockImplementation(() => {});

      const { unmount } = render(<Page />);
      await expect(
        screen.findByRole("button", { name: RUN_LABEL }),
      ).resolves.toBeTruthy();
      unmount();
    }
  });
});
