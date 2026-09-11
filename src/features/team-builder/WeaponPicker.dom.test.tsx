import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WeaponPicker } from "./WeaponPicker";

describe("WeaponPicker Chinese passive copy", () => {
  it("does not expose generated English passive prose", () => {
    render(
      <WeaponPicker
        open
        characterName="宵宫"
        weaponType="bow"
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    const passiveTitle = screen.getByText(/特效：速射弓斗/);
    const card = passiveTitle.closest("li");
    expect(card).not.toBeNull();
    expect(card?.textContent).toContain("普通攻击造成的伤害提升40%");
    expect(card?.textContent).not.toMatch(/Normal Attack|DMG|ATK|increased by/);
  });

  it("renders the selected weapon level and exact level stats", () => {
    const onSelect = vi.fn();
    render(
      <WeaponPicker
        open
        characterName="雷电将军"
        weaponType="polearm"
        currentWeaponId="thecatch"
        currentWeaponLevel={20}
        onClose={vi.fn()}
        onSelect={onSelect}
      />,
    );

    const card = screen.getByText("“渔获”").closest('[role="button"]');
    expect(card).not.toBeNull();
    fireEvent.click(card as HTMLElement);
    expect(onSelect).not.toHaveBeenCalled();
    expect((screen.getByLabelText("武器等级") as HTMLInputElement).value).toBe(
      "20",
    );
    const details = screen.getByRole("region", { name: "武器属性" });
    expect(details).toHaveTextContent("当前等级属性 · 20级");
    expect(details).toHaveTextContent("武器副词条");
    expect(details).toHaveTextContent("109");

    fireEvent.click(screen.getByRole("button", { name: "装备此武器" }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "thecatch" }),
      1,
      20,
    );
  });

  it("restores focus when returning from weapon details", () => {
    render(
      <WeaponPicker
        open
        characterName="雷电将军"
        weaponType="polearm"
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("“渔获”").closest('[role="button"]') as HTMLElement);
    expect(screen.getByRole("heading", { name: "“渔获”" })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "返回武器列表" }));
    expect(screen.getByText("“渔获”").closest('[role="button"]')).toHaveFocus();
  });
});
