import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { CharacterDefinition } from "@/types";
import { findCharacter } from "@/game-data/characters/registry";
import { toWebsiteCharacter } from "@/features/team-builder/rosterModel";
import { FilledTeamSlot } from "./TeamSlot";

function renderSlot(character: CharacterDefinition) {
  return render(
    <FilledTeamSlot
      slotIndex={0}
      character={character}
      isActive
      activeFollowsTimeline={false}
      canMoveEarlier={false}
      canMoveLater={false}
      onChange={vi.fn()}
      onRemove={vi.fn()}
      onSetActive={vi.fn()}
      onMove={vi.fn()}
      onEditStats={vi.fn()}
    />,
  );
}

describe("FilledTeamSlot talent hierarchy", () => {
  it("shows the effective talent level without extra constellation copy", () => {
    const bennett = findCharacter("bennett");
    if (!bennett) throw new Error("bennett missing from roster");

    renderSlot({
      ...toWebsiteCharacter(bennett),
      constellation: 3,
      talentLevels: { normal: 1, skill: 7, burst: 1 },
    });

    const talents = screen.getByLabelText("天赋等级");
    expect(within(talents).getByText("战技")).toBeInTheDocument();
    expect(within(talents).getByText("10")).toBeInTheDocument();
    expect(within(talents).queryByText("+3命")).toBeNull();
    expect(
      screen.getByRole("group", {
        name: "元素战技基础等级 7，当前计算等级 10",
      }),
    ).toBeInTheDocument();
  });

  it("does not add a constellation line at C0", () => {
    const bennett = findCharacter("bennett");
    if (!bennett) throw new Error("bennett missing from roster");

    renderSlot({
      ...toWebsiteCharacter(bennett),
      constellation: 0,
      talentLevels: { normal: 1, skill: 7, burst: 1 },
    });

    const talents = screen.getByLabelText("天赋等级");
    expect(within(talents).getByText("7")).toBeInTheDocument();
    expect(screen.queryByText(/命座 \+/)).toBeNull();
  });

  it("keeps configuration and slot movement actions visible", () => {
    const character = findCharacter("bennett");
    if (!character) throw new Error("bennett missing from roster");

    render(
      <FilledTeamSlot
        slotIndex={1}
        character={toWebsiteCharacter(character)}
        isActive={false}
        activeFollowsTimeline={false}
        canMoveEarlier
        canMoveLater
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onSetActive={vi.fn()}
        onMove={vi.fn()}
        onEditStats={vi.fn()}
      />,
    );

    expect(screen.getByText("配置")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /编辑班尼特角色配置/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "将 班尼特 提前一位" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "将 班尼特 后移一位" })).toBeEnabled();
    expect(screen.queryByText("当前登场")).toBeNull();
  });
});
