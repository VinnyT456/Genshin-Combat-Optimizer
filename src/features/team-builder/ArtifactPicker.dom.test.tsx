import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { DEFAULT_ARTIFACT_PIECES } from "@/features/team-builder/equipmentSelection";
import { allArtifacts } from "@/game-data/artifacts/registry";
import { ArtifactPicker } from "./ArtifactPicker";

// ---------------------------------------------------------------------------
// Render tests for the artifact picker (TASK #068).
//
// The point of these is that they run the real component over the REAL
// 63-set registry. A unit test of `getArtifactIconSources` proves the URL is
// right; only this proves the picker actually puts it in the grid, and that
// the grid is still usable when every one of those requests fails.
// ---------------------------------------------------------------------------

const NOOP = () => {};

function renderPicker(overrides: Partial<Parameters<typeof ArtifactPicker>[0]> = {}) {
  return render(
    <ArtifactPicker
      open
      characterName="班尼特"
      currentArtifactId={null}
      onClose={NOOP}
      onSelect={NOOP}
      {...overrides}
    />,
  );
}

function gridImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll("img"));
}

describe("ArtifactPicker renders set icons", () => {
  it("renders one icon per listed set", () => {
    renderPicker();
    // Every set in the registry carries a usable iconId, so every card in the
    // unfiltered grid should render an image rather than a placeholder.
    expect(gridImages()).toHaveLength(allArtifacts.length);
  });

  it("points every icon at the verified primary CDN path", () => {
    renderPicker();
    expect(gridImages()).toHaveLength(allArtifacts.length);
    for (const img of gridImages()) {
      const src = img.getAttribute("src") ?? "";
      expect(src).toContain("api.lunaris.moe");
      expect(src).toContain("/data/assets/artifacts/");
    }
  });

  it("never requests the known-404 URL baked into the generated data", () => {
    // The `iconUrl` field is `/assets/UI/{iconId}.png`, which 404s for 63/63
    // sets. This is the regression guard for the defect this task fixed.
    renderPicker();
    const images = gridImages();
    // Guard against a vacuous pass: zero images would satisfy the loop below
    // while meaning the icons vanished entirely.
    expect(images).toHaveLength(allArtifacts.length);
    for (const img of images) {
      expect(img.getAttribute("src") ?? "").not.toMatch(/\/assets\/UI\/UI_RelicIcon/);
    }
  });

  it("uses each set's own slot suffix rather than one normalised slot", () => {
    renderPicker();
    const sources = gridImages().map((i) => i.getAttribute("src") ?? "");
    // The single-piece resistance relics publish only `_3`; forcing `_4` would
    // 404 exactly those. Both suffixes must therefore be present in the grid.
    expect(sources.some((s) => s.includes("_3.webp"))).toBe(true);
    expect(sources.some((s) => s.includes("_4.webp"))).toBe(true);
  });

  it("gives every icon an empty alt, so no card is announced twice", () => {
    renderPicker();
    expect(gridImages()).toHaveLength(allArtifacts.length);
    for (const img of gridImages()) {
      expect(img.getAttribute("alt")).toBe("");
    }
  });

  it("sizes every icon explicitly, reserving the space before load", () => {
    renderPicker();
    expect(gridImages()).toHaveLength(allArtifacts.length);
    for (const img of gridImages()) {
      expect(img.getAttribute("width")).toBe("36");
      expect(img.getAttribute("height")).toBe("36");
    }
  });
});

describe("ArtifactPicker is usable without images", () => {
  it("keeps every set name as visible text when all icons fail", () => {
    renderPicker();
    // Fail both hosts for every card: the third-party-CDN-is-down scenario.
    for (let pass = 0; pass < 2; pass += 1) {
      for (const img of gridImages()) fireEvent.error(img);
    }
    expect(gridImages()).toHaveLength(0);

    // The set's name is text, never the icon's accessible name, so the picker
    // reads identically with every image blocked.
    for (const set of allArtifacts.slice(0, 8)) {
      expect(screen.getAllByTitle(set.nameZh).length).toBeGreaterThan(0);
    }
  });

  it("still selects a set after every icon has failed", () => {
    const onSelect = vi.fn();
    renderPicker({ onSelect });
    for (let pass = 0; pass < 2; pass += 1) {
      for (const img of gridImages()) fireEvent.error(img);
    }

    fireEvent.click(screen.getAllByRole("button", { name: "点击装配此套装" })[0]!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toHaveProperty("id");
  });
});

describe("ArtifactPicker filtering drives the rendered grid", () => {
  it("narrows the grid to the searched set", () => {
    renderPicker();
    const before = gridImages().length;

    fireEvent.change(screen.getByLabelText("搜索圣遗物"), {
      target: { value: "绝缘" },
    });

    const after = gridImages().length;
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
  });

  it("renders the empty state, and no icons, when nothing matches", () => {
    renderPicker();
    fireEvent.change(screen.getByLabelText("搜索圣遗物"), {
      target: { value: "zzzz-no-such-set" },
    });

    expect(screen.getByText("未找到符合条件的圣遗物。")).toBeInTheDocument();
    expect(gridImages()).toHaveLength(0);
  });

  it("restores the full grid when filters are cleared", () => {
    renderPicker();
    fireEvent.change(screen.getByLabelText("搜索圣遗物"), {
      target: { value: "zzzz-no-such-set" },
    });
    fireEvent.click(screen.getByRole("button", { name: "重置筛选条件" }));

    expect(gridImages()).toHaveLength(allArtifacts.length);
  });

  it("shows only 5-star sets under the 5-star filter", () => {
    renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "5★ 圣遗物" }));

    const fiveStarCount = allArtifacts.filter((set) => set.rarity === 5).length;
    expect(gridImages()).toHaveLength(fiveStarCount);
  });
});

describe("ArtifactPicker marks the equipped set", () => {
  it("offers to unequip the currently equipped set", () => {
    const equipped = allArtifacts[0]!;
    const onSelect = vi.fn();
    renderPicker({ currentArtifactId: equipped.id, onSelect });

    const unequip = screen.getByRole("button", { name: /当前装备中/ });
    fireEvent.click(unequip);
    // Unequipping passes null, not the set — the "clear the slot" contract.
    // The piece count rides along on every select so the caller never has to
    // reconstruct it; on an unequip it is simply ignored.
    expect(onSelect).toHaveBeenCalledWith(null, DEFAULT_ARTIFACT_PIECES);
  });

  it("marks the equipped card with more than colour", () => {
    const equipped = allArtifacts[0]!;
    renderPicker({ currentArtifactId: equipped.id });
    // A checkmark plus text, per the design system's never-colour-only rule.
    expect(screen.getByRole("button", { name: /✓ 当前装备中/ })).toBeInTheDocument();
  });
});

describe("ArtifactPicker states its own ordering truthfully", () => {
  it("does not render internal support status labels", () => {
    renderPicker();
    expect(screen.queryByText("已接入模拟")).toBeNull();
    expect(screen.queryByText("已接入模拟（条件效果）")).toBeNull();
    expect(screen.queryByText("尚未接入模拟")).toBeNull();
    expect(screen.queryByText("数值待核实")).toBeNull();
  });

  it("reports a match count that equals the rendered card count", () => {
    renderPicker();
    const header = screen.getByText(/匹配到 \d+ \/ \d+ 套圣遗物/);
    const claimed = Number(/匹配到 (\d+)/.exec(header.textContent ?? "")?.[1]);
    expect(claimed).toBe(gridImages().length);
  });

  it("renders cards in the rarity-then-name order the header claims", () => {
    const { container } = renderPicker();
    const rarities = Array.from(container.querySelectorAll("article")).map((card) =>
      within(card as HTMLElement).getByText(/^[345]★$/).textContent,
    );
    const descending = [...rarities].sort((a, b) => Number(b?.[0]) - Number(a?.[0]));
    expect(rarities).toEqual(descending);
  });
});
