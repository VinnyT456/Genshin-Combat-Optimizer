// ---------------------------------------------------------------------------
// §15.3/G4 — ONE swap cost, quoted identically everywhere on the page.
//
// The shipped bug this pins: selecting `0.4秒` in the rules bar left parts of
// the editor still pricing swaps at the 0.6s default constant, so two visible
// numbers for one concept disagreed on the same screen.
//
// Every surface below reads the SAME `simConfig.swapCost` the run executes
// with. Asserting them together is the point: a unit test on one of them
// cannot catch a disagreement between two.
// ---------------------------------------------------------------------------

import { beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import Page from "@/features/workspace/WorkspacePage";
import { addRotationStep } from "@/tests/helpers/seedRotation";

const WORKSPACE_URL =
  "/workspace?mode=experiment&view=all&team=raiden-shogun,bennett,xiangling,xingqiu";
const RUN_LABEL = "执行循环模拟";
const SWAP_GROUP = "角色切人耗时";

beforeEach(() => {
  window.sessionStorage.clear();
  window.history.replaceState(null, "", WORKSPACE_URL);
});

async function renderWorkspace() {
  const utils = render(<Page />);
  await screen.findByRole("button", { name: RUN_LABEL });
  return utils;
}

/** Clicks a swap-cost preset in the global rules bar. */
async function selectSwapCost(label: string): Promise<void> {
  const group = screen.getByRole("group", { name: SWAP_GROUP });
  await act(async () => {
    fireEvent.click(within(group).getByRole("button", { name: label }));
  });
}

/**
 * The `<li>` for the auto-inserted swap row.
 *
 * Scoped to the sequence list: `切至 班尼特` also appears in the `aria-live`
 * announcement region, and matching both would make the query ambiguous.
 */
function swapRow(): HTMLElement {
  const rows = screen
    .getAllByText(/切至 班尼特/)
    .map((node) => node.closest("li"))
    .filter((li): li is HTMLLIElement => li !== null);
  const row = rows[0];
  if (row === undefined) throw new Error("no swap row rendered in the sequence");
  return row;
}

/**
 * The live-region announcement text, which also quotes the swap cost.
 *
 * There are several polite regions on the page; take the one that actually has
 * content rather than assuming document order.
 */
function announcement(): string {
  return Array.from(document.querySelectorAll('[aria-live="polite"]'))
    .map((region) => region.textContent ?? "")
    .filter((text) => text.trim().length > 0)
    .join(" ");
}

describe("the empty-state copy quotes the configured cost", () => {
  it("shows 0.40 after selecting 0.4秒, and never the 0.60 default", { timeout: 30000 }, async () => {
    await renderWorkspace();
    await selectSwapCost("0.4秒 (极速)");

    // The empty-state sentence and the add-bar footnote both live on the page
    // while the rotation is empty.
    const swapSentences = screen.getAllByText(/切换角色时会自动插入/);
    expect(swapSentences.length).toBeGreaterThanOrEqual(1);
    for (const sentence of swapSentences) {
      expect(sentence.textContent).toContain("0.40");
      expect(sentence.textContent).not.toContain("0.60");
    }
  });

  it("follows the cost back to the default when it is reselected", { timeout: 30000 }, async () => {
    await renderWorkspace();
    await selectSwapCost("0.4秒 (极速)");
    await selectSwapCost("0.6秒 (默认)");

    for (const sentence of screen.getAllByText(/切换角色时会自动插入/)) {
      expect(sentence.textContent).toContain("0.60");
      expect(sentence.textContent).not.toContain("0.40");
    }
  });
});

describe("the swap ROW, the header total and the announcement agree", () => {
  it("prices an auto-inserted swap row at the configured cost", { timeout: 30000 }, async () => {
    await renderWorkspace();
    await selectSwapCost("0.4秒 (极速)");

    // Two characters, so §14.6 inserts a swap between them.
    await addRotationStep({ character: "雷电将军", action: "skill" });
    await addRotationStep({ character: "班尼特", action: "burst" });

    // The swap row states 0.40, not the 0.60 constant.
    expect(swapRow().textContent).toContain("0.40");
    expect(swapRow().textContent).not.toContain("0.60");
  });

  it("the live announcement quotes the same cost as the row", { timeout: 30000 }, async () => {
    await renderWorkspace();
    await selectSwapCost("0.4秒 (极速)");
    await addRotationStep({ character: "雷电将军", action: "skill" });
    await addRotationStep({ character: "班尼特", action: "burst" });

    // The announcement is a SEPARATE call site (`announceInsert`) from the row
    // renderer, so agreement between them is the property under test — a unit
    // test on either one alone cannot detect a disagreement.
    expect(announcement()).toContain("0.40 秒");
    expect(announcement()).not.toContain("0.60");
    expect(swapRow().textContent).toContain("0.40");
  });

  it("the header total does not silently price the swap at 0.60", { timeout: 30000 }, async () => {
    await renderWorkspace();
    await selectSwapCost("0.4秒 (极速)");
    await addRotationStep({ character: "雷电将军", action: "skill" });
    await addRotationStep({ character: "班尼特", action: "burst" });

    // Assert by DIFFERENCE rather than by parsing every row: the sequence is
    // fixed, so changing only the swap cost must move the header total by
    // exactly the change in that one swap's price. This is immune to how the
    // rows format their durations, and it is the property that actually
    // matters — the header must be priced from the same cost the row is.
    // The editor header renders the literal `总时长 N.N 秒` (one decimal).
    // Several other strings mention 总时长, so match the figure form.
    const totalAt = (): number => {
      const header = screen.getByText(/^总时长 \d+\.\d 秒/);
      const parsed = /总时长 (\d+\.\d) 秒/.exec(header.textContent ?? "")?.[1];
      expect(parsed).toBeDefined();
      return Number(parsed);
    };

    const at040 = totalAt();
    expect(swapRow().textContent).toContain("0.40");

    await selectSwapCost("0.8秒 (高延迟)");
    const at080 = totalAt();
    expect(swapRow().textContent).toContain("0.80");

    // One swap in the sequence, so the total grows by exactly 0.8 - 0.4.
    expect(at080 - at040).toBeCloseTo(0.4, 1);
  });

  it("follows a THIRD cost, proving nothing is hardcoded to two values", { timeout: 30000 }, async () => {
    await renderWorkspace();
    await selectSwapCost("0.8秒 (高延迟)");

    await addRotationStep({ character: "雷电将军", action: "skill" });
    await addRotationStep({ character: "班尼特", action: "burst" });

    expect(swapRow().textContent).toContain("0.80");
    expect(announcement()).toContain("0.80 秒");
  });
});
