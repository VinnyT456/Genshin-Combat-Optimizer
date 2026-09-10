import { beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Page from "@/app/page";

// ---------------------------------------------------------------------------
// RENDER TESTS for the run/staleness contract, replacing the parts of
// `runWiring.test.ts` that asserted against `page.tsx`'s SOURCE TEXT.
//
// The string checks proved the file mentions `run.inputs.team` and does not
// mention `enemy.name` inside the results region. They could not prove the
// page renders, that clicking Run produces numbers, or that editing the
// configuration afterwards leaves those numbers labelled with the inputs they
// were computed from. That last property IS the defect the guard exists for,
// and it is only observable in a rendered DOM.
//
// The page reads its view from the URL, so each test sets the location before
// mounting rather than clicking through the hub.
// ---------------------------------------------------------------------------

const WORKSPACE_URL = "/?view=all";
const RUN_LABEL = "执行循环模拟";
/**
 * The stale banner's own section heading. Matching the heading rather than the
 * notice prose keeps this from breaking on a copy edit, and avoids colliding
 * with the live-region announcement, which is a DIFFERENT string.
 */
const STALE_SECTION = "测算状态提示";

beforeEach(() => {
  window.history.replaceState(null, "", WORKSPACE_URL);
});

/** Mounts the workspace and waits for the URL-hydrated view to appear. */
async function renderWorkspace() {
  const utils = render(<Page />);
  await screen.findByRole("button", { name: RUN_LABEL });
  return utils;
}

async function runSimulation() {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: RUN_LABEL }));
  });
  await screen.findByRole("heading", { name: "核心输出数据看板" });
}

/**
 * The dashboard's total-damage figure.
 *
 * "总伤害" appears twice once results exist — once on the stat card and once in
 * the breakdown table — so the query is scoped to the dashboard section rather
 * than matching on text alone.
 */
function totalDamageText(): string {
  const heading = screen.getByRole("heading", { name: "核心输出数据看板" });
  const section = heading.closest("section");
  if (section === null) throw new Error("no dashboard section");
  const label = within(section).getAllByText("总伤害")[0];
  const card = label?.parentElement;
  if (!card) throw new Error("no stat card around 总伤害");
  return card.textContent ?? "";
}

describe("workspace renders and runs", () => {
  it("mounts the workspace view without throwing", async () => {
    await renderWorkspace();
    expect(screen.getByRole("button", { name: RUN_LABEL })).toBeInTheDocument();
  });

  it("shows no results before the first run", async () => {
    await renderWorkspace();
    expect(screen.queryByRole("heading", { name: "核心输出数据看板" })).toBeNull();
  });

  it("produces damage numbers when Run is clicked", async () => {
    await renderWorkspace();
    await runSimulation();

    // The adapter really ran: a total, a DPS and a duration are on the
    // dashboard. Several of these labels also appear in the breakdown tables,
    // so the queries are scoped to the dashboard section.
    const dashboard = screen
      .getByRole("heading", { name: "核心输出数据看板" })
      .closest("section");
    expect(dashboard).not.toBeNull();
    const panel = within(dashboard as HTMLElement);
    expect(panel.getAllByText("总伤害").length).toBeGreaterThan(0);
    expect(panel.getAllByText("秒伤 (DPS)").length).toBeGreaterThan(0);
    expect(panel.getAllByText("循环总耗时").length).toBeGreaterThan(0);
    // A real number, not a placeholder.
    expect(totalDamageText()).toMatch(/[1-9]/);
  });
});

describe("workspace marks a result stale when the inputs change", () => {
  it("shows no stale notice immediately after a run", async () => {
    await renderWorkspace();
    await runSimulation();
    expect(screen.queryByRole("heading", { name: STALE_SECTION })).toBeNull();
  });

  it("announces staleness after the configuration is edited", async () => {
    await renderWorkspace();
    await runSimulation();

    // Any edit that changes the fingerprint. The enemy level selector is the
    // simplest live input on this surface.
    const levelInput = screen.getByLabelText(/敌人等级/);
    await act(async () => {
      fireEvent.change(levelInput, { target: { value: "80" } });
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: STALE_SECTION })).toBeInTheDocument();
    });
  });

  it("keeps the ORIGINAL numbers on screen while stale", async () => {
    await renderWorkspace();
    await runSimulation();
    const before = totalDamageText();

    const levelInput = screen.getByLabelText(/敌人等级/);
    await act(async () => {
      fireEvent.change(levelInput, { target: { value: "80" } });
    });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: STALE_SECTION })).toBeInTheDocument(),
    );

    // The result belongs to the PREVIOUS inputs and must not silently change
    // to match the new ones — a recomputed figure with no run would be the
    // plausible-but-wrong output this product treats as its worst failure.
    expect(totalDamageText()).toBe(before);
  });

  it("offers a re-run affordance while stale", async () => {
    await renderWorkspace();
    await runSimulation();

    const levelInput = screen.getByLabelText(/敌人等级/);
    await act(async () => {
      fireEvent.change(levelInput, { target: { value: "80" } });
    });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: STALE_SECTION })).toBeInTheDocument(),
    );

    // Staleness is never a dead end: the fix is one visible control away.
    expect(
      screen.getByRole("button", { name: "重新执行战斗模拟" }),
    ).toBeInTheDocument();
  });

  it("clears the stale notice when the simulation is re-run", async () => {
    await renderWorkspace();
    await runSimulation();

    const levelInput = screen.getByLabelText(/敌人等级/);
    await act(async () => {
      fireEvent.change(levelInput, { target: { value: "80" } });
    });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: STALE_SECTION })).toBeInTheDocument(),
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "重新执行战斗模拟" }));
    });

    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: STALE_SECTION })).toBeNull(),
    );
  });
});

describe("workspace labels a stale result with the run's own inputs", () => {
  it("keeps the run's team in the breakdown after a slot is emptied", async () => {
    await renderWorkspace();
    await runSimulation();

    const breakdownOf = () =>
      within(
        screen.getByRole("heading", { name: "伤害多维拆解" }).closest("section") as HTMLElement,
      );
    // The per-character breakdown names the team the run used.
    expect(breakdownOf().getAllByText(/雷电将军/).length).toBeGreaterThan(0);

    // Empty slot 1. The result now describes a team the page no longer shows.
    const slot = screen.getByLabelText(/^1 号位：/);
    await act(async () => {
      fireEvent.keyDown(slot, { key: "Delete" });
    });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: STALE_SECTION })).toBeInTheDocument(),
    );

    // The breakdown must still attribute damage to the RUN's team. Mapping a
    // stale result onto the live team attributes one team's damage to
    // another's slots — and, because the live team now has a hole, it throws.
    expect(breakdownOf().getAllByText(/雷电将军/).length).toBeGreaterThan(0);
  });

  it("survives emptying a slot while a result is on screen", async () => {
    // Regression guard for the crash the above defect produces: reading the
    // live team here dereferences the now-null slot.
    await renderWorkspace();
    await runSimulation();

    await act(async () => {
      fireEvent.keyDown(screen.getByLabelText(/^1 号位：/), { key: "Delete" });
    });

    // Still rendered, still showing the previous run's dashboard.
    expect(
      screen.getByRole("heading", { name: "核心输出数据看板" }),
    ).toBeInTheDocument();
  });
});
