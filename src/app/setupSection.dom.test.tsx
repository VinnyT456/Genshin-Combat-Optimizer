import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Page from "@/features/workspace/WorkspacePage";

// ---------------------------------------------------------------------------
// RENDER TESTS for the Setup-section redesign (COMPONENTS.md §15).
//
// These assert the STRUCTURE the ruling is about — that the global rules are a
// full-width bar above the grid rather than a sidebar card, that the grid no
// longer stretches its columns (the 140px gap), that the enemy card labels its
// derived zone, and that the feasibility panel obeys §15.5's render /
// do-not-render table. None of that is observable without a rendered DOM.
// ---------------------------------------------------------------------------

const WORKSPACE_URL =
  "/workspace?mode=experiment&view=all&team=raiden-shogun,bennett,xiangling,xingqiu";
const RUN_LABEL = "执行循环模拟";

beforeEach(() => {
  window.sessionStorage.clear();
  window.history.replaceState(null, "", WORKSPACE_URL);
});

async function renderWorkspace() {
  const utils = render(<Page />);
  await screen.findByRole("button", { name: RUN_LABEL });
  return utils;
}

describe("§15.2 — global rules are a section-wide bar, not a sidebar card", () => {
  it("renders the rules bar with its scope line stated, not implied (G1)", async () => {
    await renderWorkspace();

    expect(screen.getByRole("heading", { name: "全局计算规则" })).toBeTruthy();
    // The scope sentence is the whole point of the component, not optional copy.
    expect(screen.getByText("影响本页所有伤害与时长数值")).toBeTruthy();
    // The relocated card is gone.
    expect(screen.queryByText("模拟计算参数")).toBeNull();
  });

  it("associates each rule group with a legend rather than a loose span", async () => {
    await renderWorkspace();

    expect(screen.getByRole("group", { name: "暴击计算模式" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "角色切人耗时" })).toBeTruthy();
  });

  it("marks a non-default critMode instead of blocking it", async () => {
    await renderWorkspace();

    expect(screen.queryByText(/结果并非期望值/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "必定暴击" }));
    expect(screen.getByText(/当前为「必定暴击」，结果并非期望值。/)).toBeTruthy();
  });

  it("marks a non-default swapCost, formatted like the editor header (§15.10)", async () => {
    await renderWorkspace();

    fireEvent.click(screen.getByRole("button", { name: "0.4秒 (极速)" }));
    // The numeral lives in its own `font-mono tabular-nums` span and reads
    // `0.40`, matching `formatSeconds` — the same rendering the editor header
    // gives this concept — so the chip is matched on its normalized text.
    const chip = screen
      .getAllByText((_, el) => el?.textContent?.includes("切人耗时已调整为") === true)
      .at(-1);
    expect(chip?.textContent?.replace(/\s+/g, "")).toContain(
      "切人耗时已调整为0.40秒，循环总时长随之变化。",
    );
  });
});

describe("§15.3/G4 — the configured swap cost reaches the editor", () => {
  it("re-prices the editor's swap copy when the rule changes", async () => {
    await renderWorkspace();

    // Empty sequence: the editor's empty-state copy quotes the swap cost.
    expect(screen.getAllByText("0.60").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "0.4秒 (极速)" }));

    expect(screen.getAllByText("0.40").length).toBeGreaterThan(0);
    expect(screen.queryByText("0.60")).toBeNull();
  });
});

describe("§15.4 — the enemy card separates inputs from derived readout", () => {
  it("labels both zones so the derived number reads as a result (N1/E4)", async () => {
    await renderWorkspace();

    expect(screen.getByText("场景输入")).toBeTruthy();
    expect(screen.getByText("由上述输入推导")).toBeTruthy();
  });
});

describe("§15.5 — feasibility renders only when it has something to say", () => {
  it("renders NOTHING for an empty sequence — no empty box under an empty box", async () => {
    await renderWorkspace();

    expect(screen.queryByRole("heading", { name: "能量与可行性" })).toBeNull();
  });
});

describe("§15.7/H1 — the grid does not stretch its columns", () => {
  it("uses items-start, which is what removes the measured 140px gap", async () => {
    const { container } = await renderWorkspace();

    const grid = container.querySelector(".lg\\:grid-cols-12");
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("lg:items-start");
  });
});
