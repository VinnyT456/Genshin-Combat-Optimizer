import { act, fireEvent, screen, within } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Seeds a rotation in a rendered workspace through the REAL add bar
// (COMPONENTS.md §14.3-C), replacing the rotation-preset buttons that §14.10
// removed.
//
// This is deliberately not a state-injection helper. The preset buttons these
// tests used to click were a shortcut that happened to exist; driving the add
// bar means every test that seeds a rotation also exercises the authoring path
// users actually take, including the §14.6 auto-swap insertion.
// ---------------------------------------------------------------------------

/** Action types the add bar can author. `swap` is inferred, never clicked. */
export type SeedActionType = "skill" | "burst" | "normal" | "charged";

const ACTION_LABEL_ZH: Record<SeedActionType, string> = {
  skill: "元素战技",
  burst: "元素爆发",
  normal: "普通攻击",
  charged: "重击",
};

export interface SeedStep {
  /** Chinese character name as it appears on the add-bar pill, e.g. "班尼特". */
  readonly character: string;
  readonly action: SeedActionType;
}

/** The add bar, scoped so its buttons cannot collide with the team builder's. */
function addBar(): HTMLElement {
  const heading = screen.getByRole("heading", { name: "添加到插入位置" });
  const bar = heading.parentElement;
  if (bar === null) throw new Error("add bar heading has no container");
  return bar;
}

/**
 * Appends one action. The editor's insertion cursor starts at — and returns
 * to — the end of the sequence, and each add advances it, so successive calls
 * build the sequence in order.
 */
export async function addRotationStep(step: SeedStep): Promise<void> {
  const bar = addBar();

  // The pill's accessible name is `<element> <name>` because it carries an
  // `ElementTag`, so match on the character name rather than equality.
  await act(async () => {
    fireEvent.click(
      within(bar).getByRole("button", { name: new RegExp(`${step.character}$`) }),
    );
  });

  // The add button's accessible name states its full outcome (§14.4), so match
  // on the two facts under test rather than on the whole sentence. Characters
  // with a tap/hold skill now expose two matching controls; this legacy seed
  // intentionally uses the first, tap, form unless a test asks for hold.
  const pattern = new RegExp(`${step.character}.*${ACTION_LABEL_ZH[step.action]}`);
  await act(async () => {
    const matches = within(addBar()).getAllByRole("button", { name: pattern });
    const button = step.action === "skill"
      ? matches.find((candidate) => candidate.getAttribute("aria-label")?.includes("点按施放")) ?? matches[0]
      : matches[0];
    if (button === undefined) throw new Error(`missing add control for ${step.character} ${step.action}`);
    fireEvent.click(button);
  });
}

/** True once the editor holds at least one action. */
function hasRotation(): boolean {
  return screen.queryByRole("button", { name: "清空序列" }) !== null;
}

/**
 * Seeds the sequence, once.
 *
 * Idempotent because the removed preset buttons were: they REPLACED the
 * rotation, so a test calling this twice (run, tweak equipment, re-run) got the
 * same sequence both times. Appending instead would silently double the
 * rotation between two runs the test compares, which is exactly the kind of
 * hidden difference those assertions exist to rule out.
 */
export async function seedRotation(steps: readonly SeedStep[]): Promise<void> {
  if (hasRotation()) return;
  for (const step of steps) {
    await addRotationStep(step);
  }
}

/**
 * The Raiden National opening the removed `雷神国家队标准循环` preset seeded.
 *
 * Swaps are omitted on purpose: §14.6 inserts them automatically when the
 * acting character changes, so authoring them here would double them.
 */
export const RAIDEN_NATIONAL_SEED: readonly SeedStep[] = [
  { character: "雷电将军", action: "skill" },
  { character: "班尼特", action: "burst" },
  { character: "班尼特", action: "skill" },
  { character: "香菱", action: "burst" },
  { character: "香菱", action: "skill" },
  { character: "行秋", action: "burst" },
  { character: "行秋", action: "skill" },
  { character: "雷电将军", action: "burst" },
  { character: "雷电将军", action: "normal" },
];

/**
 * A short multi-character sequence: one auto-swap, damage from two elements.
 *
 * For tests that only need "a rotation that produces damage". Each step is a
 * click through `act()`, so a nine-step seed on a workspace that re-renders the
 * whole dashboard is measurably slower than the single preset click it
 * replaced — long enough to brush the default 5s test timeout under parallel
 * load. Use the full `RAIDEN_NATIONAL_SEED` only where the sequence itself is
 * what is under test.
 */
export const SHORT_TWO_CHARACTER_SEED: readonly SeedStep[] = [
  { character: "雷电将军", action: "skill" },
  { character: "班尼特", action: "burst" },
  { character: "雷电将军", action: "normal" },
];

/**
 * The cheapest seed that produces non-zero damage: Raiden alone, two steps, no
 * swap. For tests where the rotation is only scaffolding for something else
 * (equipment wiring, staleness) and its contents are never asserted on.
 */
export const MINIMAL_RAIDEN_SEED: readonly SeedStep[] = [
  { character: "雷电将军", action: "skill" },
  { character: "雷电将军", action: "normal" },
];

/** The solo-Bennett sequence the removed `班尼特单人循环` preset seeded. */
export const SOLO_BENNETT_SEED: readonly SeedStep[] = [
  { character: "班尼特", action: "skill" },
  { character: "班尼特", action: "normal" },
  { character: "班尼特", action: "burst" },
];
