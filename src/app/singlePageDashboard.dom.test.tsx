import { beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Page from "@/app/page";

// ---------------------------------------------------------------------------
// RENDER TESTS for the single-page collapse (TASK #069).
//
// The product is ONE dashboard. Eight stub routes (`/team`, `/rotation`,
// `/analysis`, `/optimizer`, `/library`, `/simulation`, `/dashboard`,
// `/workspace`) and the `AppShell` / `AppNavigation` / `RouteCard` scaffolding
// around them were deleted.
//
// The defect this guards is the one that gate actually caused: `page.tsx` held
//
//     setShowDashboard(pathname === "/" && search === "")
//
// so a BARE visit to `/` rendered a grid of navigation cards and the real
// workspace was only reachable with a query string or via `/workspace`. Every
// pre-existing DOM test mounted with `?view=all`, so all of them passed while
// the product's front door showed link cards instead of the tool.
//
// These tests therefore mount at the BARE root — the URL a first-time visitor
// actually opens — and assert the workspace itself is what renders. A
// typecheck, a lint and the route tests were all green with the launchpad in
// place; only a render at `/` distinguishes the two.
// ---------------------------------------------------------------------------

/** The front door: no query string, no hash. */
const ROOT_URL = "/";
const RUN_LABEL = "执行循环模拟";
const VIEW_SWITCHER_LABEL = "工作区视图";

/** Section headings that must be present for the page to be the real tool. */
const TEAM_SECTION = "队伍阵容配置";
const SETUP_SECTION = "战斗环境与动作时序编排";
const SEARCH_SECTION = "循环搜索";
/** Result-region headings; these exist only after a run. */
const RESULTS_SECTION = "核心输出数据看板";
const ENERGY_SECTION = "能量微粒流转";
const TIMELINE_SECTION = "动作时序与换人节奏";
const BREAKDOWN_SECTION = "伤害多维拆解";

beforeEach(() => {
  window.history.replaceState(null, "", ROOT_URL);
});

/** Mounts at the bare root and waits for the workspace to hydrate. */
async function renderRoot() {
  const utils = render(<Page />);
  await screen.findByRole("button", { name: RUN_LABEL });
  return utils;
}

describe("the bare root renders the dashboard, not a launchpad", () => {
  it("mounts the workspace at / with no query string", async () => {
    await renderRoot();
    expect(screen.getByRole("button", { name: RUN_LABEL })).toBeInTheDocument();
  });

  it("renders the team builder, setup and search on one page", async () => {
    await renderRoot();
    // The whole tool is on this single surface. Each of these lived behind a
    // separate route's RouteCard before the collapse.
    for (const section of [TEAM_SECTION, SETUP_SECTION, SEARCH_SECTION]) {
      expect(screen.getByRole("heading", { name: section })).toBeInTheDocument();
    }
  });

  it("starts with the Raiden National recommended builds", async () => {
    await renderRoot();
    expect(screen.getAllByText("符合 KQM 基准")).toHaveLength(4);
  });

  it("reaches the results, breakdown and timeline without leaving the page", async () => {
    await renderRoot();
    // The timeline and breakdown are inside the results region, which by
    // design does not exist before a run. `/analysis` and `/simulation` used
    // to "lead" here; on one page the run itself is the only step.
    expect(screen.queryByRole("heading", { name: TIMELINE_SECTION })).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: RUN_LABEL }));
    });

    // `getAllBy`: some of these titles appear on both the section and a panel
    // nested inside it, which is existing structure and not what is under test
    // here — presence on the single page is.
    for (const section of [RESULTS_SECTION, ENERGY_SECTION, TIMELINE_SECTION, BREAKDOWN_SECTION]) {
      expect(screen.getAllByRole("heading", { name: section }).length).toBeGreaterThan(0);
    }
  });

  it("shows no navigation cards to the deleted routes", async () => {
    await renderRoot();
    // The launchpad's card labels. Their presence would mean the routing shell
    // came back; "完整工作台" in particular only ever made sense when the
    // dashboard was somewhere OTHER than the page you were already on.
    for (const deadCard of ["完整工作台", "资料库", "模拟分析"]) {
      expect(screen.queryByRole("link", { name: new RegExp(deadCard) })).toBeNull();
    }
  });

  it("links to no deleted route from anywhere on the page", async () => {
    const { container } = await renderRoot();
    const deletedRoutes = [
      "/team",
      "/rotation",
      "/analysis",
      "/optimizer",
      "/library",
      "/simulation",
      "/dashboard",
      "/workspace",
    ];
    const hrefs = Array.from(container.querySelectorAll("a[href]")).map(
      (anchor) => anchor.getAttribute("href") ?? "",
    );
    for (const route of deletedRoutes) {
      expect(hrefs.some((href) => href.startsWith(route))).toBe(false);
    }
  });
});

describe("the surviving view switcher scopes the single page", () => {
  it("exposes the selected view to assistive tech, not by colour alone", async () => {
    await renderRoot();
    // With the routed nav gone this is the page's only navigation control, so
    // its selected state must be programmatically determinable.
    const group = screen.getByRole("group", { name: VIEW_SWITCHER_LABEL });
    expect(group).toBeInTheDocument();

    // `all` is the default view, so it starts pressed.
    expect(screen.getByRole("button", { name: "全部总览", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "战术配置", pressed: false })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "数据看板", pressed: false })).toBeInTheDocument();
  });

  it("moves the pressed state when a different view is chosen", async () => {
    await renderRoot();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "战术配置" }));
    });

    expect(screen.getByRole("button", { name: "战术配置", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "全部总览", pressed: false })).toBeInTheDocument();
  });

  it("writes the chosen view into the URL so it stays shareable", async () => {
    await renderRoot();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "数据看板" }));
    });

    // Deep-linkable state is a shipped feature; collapsing the routes must not
    // have cost it.
    expect(new URLSearchParams(window.location.search).get("view")).toBe("results");
  });
});

describe("deep-link state survives the single-page collapse", () => {
  it("honours ?view=setup on load", async () => {
    window.history.replaceState(null, "", "/?view=setup");
    await renderRoot();

    expect(screen.getByRole("heading", { name: TEAM_SECTION })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "战术配置", pressed: true })).toBeInTheDocument();
  });

  it("honours a ?team= deep link on load", async () => {
    // Positional encoding: slots 1 and 3 filled, slot 2 empty.
    window.history.replaceState(null, "", "/?team=bennett,,xingqiu");
    await renderRoot();

    // The named characters reached the team builder's slots.
    expect(screen.getByLabelText(/^1 号位：/)).toHaveAccessibleName(/班尼特/);
    expect(screen.getByLabelText(/^3 号位：/)).toHaveAccessibleName(/行秋/);
  });

  it("keeps the team deep link intact when the view changes", async () => {
    window.history.replaceState(null, "", "/?team=bennett,,xingqiu");
    await renderRoot();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "数据看板" }));
    });

    // Switching scope must not drop the configuration out of the URL — that
    // was the job `preserveRouteQuery` did across routes, and on one page it
    // has to keep holding.
    const params = new URLSearchParams(window.location.search);
    expect(params.get("view")).toBe("results");
    expect(params.get("team")).toBe("bennett,,xingqiu");
  });
});

describe("page chrome and landmarks survive the routing removal", () => {
  it("keeps the main landmark the skip link targets", async () => {
    const { container } = await renderRoot();
    // `layout.tsx` renders a skip link to `#main`; deleting AppShell must not
    // have taken the target with it.
    const main = container.querySelector("main#main");
    expect(main).not.toBeNull();
  });

  it("keeps a single top-level heading for the product", async () => {
    await renderRoot();
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("原神战斗循环模拟器");
  });
});
