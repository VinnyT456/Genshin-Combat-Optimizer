import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { RotationEditor } from "@/features/setup/RotationEditor";
import { DEFAULT_EDITOR_SWAP_COST_SECONDS } from "@/features/setup/rotationEditing";
import { nationalTeam } from "@/game-data";
import type { Rotation } from "@/types";

// ---------------------------------------------------------------------------
// RENDER TESTS for the two honesty affordances that only exist in a rendered
// DOM, from the §14.14 review:
//
//   Finding R — a chip's reason sentence is `hidden sm:inline` in the row, so
//   below 640px it is present but not REACHABLE. The reason must therefore also
//   live in the row menu. A chip whose only explanation is an off-screen
//   sentence is tooltip-as-sole-source.
//
//   Finding S — refusing to duplicate a no-op swap announced only to the live
//   region, so a sighted user saw the menu close and nothing happen.
//
// Both are about REACHABILITY, which a source-text or pure-logic assertion
// cannot prove. `jsdom` does not evaluate Tailwind's responsive classes, so
// these assert the structural guarantee — the reason exists inside the row
// menu, whose visibility is not width-gated — rather than a computed style.
// ---------------------------------------------------------------------------

const [raiden, bennett] = nationalTeam;

function openRowMenu(row: HTMLElement): void {
  fireEvent.click(within(row).getByRole("button", { name: /步操作$/ }));
}

// ---------------------------------------------------------------------------
// §15.3/G4 — the configured swap cost must reach the editor.
//
// `SWAP_COST_SECONDS` used to be a module CONSTANT, so selecting `0.4秒 (极速)`
// in 模拟计算参数 left the editor pricing every swap at 0.6s while the engine
// ran at 0.4s: two visible numbers, one concept, silently disagreeing on the
// same screen. That is the confidently-wrong class this project exists to
// avoid, so it is pinned rather than left to review.
// ---------------------------------------------------------------------------
describe("RotationEditor — swap cost comes from config, not a constant (§15.3/G4)", () => {
  const FAST_SWAP_COST = 0.4;

  // Exactly two swap rows and no other action, so the header total IS the swap
  // bill with no cast time mixed in. At 0.4s that is 0.80 秒; under the old
  // module constant it rendered 1.20 秒.
  const twoSwaps: Rotation = [
    { characterId: bennett!.id, actionType: "swap" },
    { characterId: raiden!.id, actionType: "swap" },
  ];

  it("bills two swaps at the configured 0.4s (0.80 秒), not the 0.6s default (1.20 秒)", () => {
    render(
      <RotationEditor
        rotation={twoSwaps}
        onRotationChange={() => {}}
        team={[raiden!, bennett!, null, null]}
        swapCost={FAST_SWAP_COST}
      />,
    );

    expect(screen.getByText(/总时长 0\.8 秒/)).toBeTruthy();
    expect(screen.queryByText(/总时长 1\.2 秒/)).toBeNull();
    expect(screen.getByText(/2 次切人\s+0\.8 秒/)).toBeTruthy();
  });

  it("still uses the default when that is what is configured", () => {
    render(
      <RotationEditor
        rotation={twoSwaps}
        onRotationChange={() => {}}
        team={[raiden!, bennett!, null, null]}
        swapCost={DEFAULT_EDITOR_SWAP_COST_SECONDS}
      />,
    );

    expect(screen.getByText(/总时长 1\.2 秒/)).toBeTruthy();
  });

  it("quotes the configured cost in the add-bar footnote too", () => {
    render(
      <RotationEditor
        rotation={twoSwaps}
        onRotationChange={() => {}}
        team={[raiden!, bennett!, null, null]}
        swapCost={FAST_SWAP_COST}
      />,
    );

    // The footnote and the header must not be able to disagree.
    expect(screen.getByText("0.40")).toBeTruthy();
  });

  it("quotes the configured cost in the empty-state copy", () => {
    render(
      <RotationEditor
        rotation={[]}
        onRotationChange={() => {}}
        team={[raiden!, bennett!, null, null]}
        swapCost={FAST_SWAP_COST}
      />,
    );

    expect(screen.getAllByText("0.40").length).toBeGreaterThan(0);
  });
});

describe("RotationEditor — chip reasons are reachable at every width", () => {
  it("puts the 未出战 reason in the row menu, not only in the width-gated row text", () => {
    // An action whose character is not in the team is orphaned.
    const rotation: Rotation = [
      { characterId: "not-in-this-team", actionType: "normal" },
    ];
    render(
      <RotationEditor
        rotation={rotation}
        onRotationChange={() => {}}
        team={[raiden!, bennett!, null, null]}
        swapCost={DEFAULT_EDITOR_SWAP_COST_SECONDS}
      />,
    );

    const row = screen.getByRole("listitem");
    expect(within(row).getByText("未出战")).toBeTruthy();

    openRowMenu(row);
    const reason = "该角色已不在队伍中，此动作不会执行。";
    // Reachable from the menu — the path that survives below 640px.
    expect(within(row).getAllByText(reason).length).toBeGreaterThan(1);
  });

  it("puts the 未切换 reason in the row menu (the Finding R defect)", () => {
    // Bennett acts with no swap bringing him on field: reachable-but-unreached.
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "normal" },
      { characterId: raiden!.id, actionType: "swap" },
      { characterId: bennett!.id, actionType: "normal" },
    ];
    render(
      <RotationEditor
        rotation={rotation}
        onRotationChange={() => {}}
        team={[raiden!, bennett!, null, null]}
        swapCost={DEFAULT_EDITOR_SWAP_COST_SECONDS}
      />,
    );

    const unreachableRow = screen
      .getAllByRole("listitem")
      .find((row) => within(row).queryByText("未切换") !== null);
    expect(unreachableRow).toBeTruthy();

    openRowMenu(unreachableRow!);
    const reason = "此动作前缺少切人，该角色当时不在场上。";
    expect(within(unreachableRow!).getAllByText(reason).length).toBeGreaterThan(1);
  });
});

describe("RotationEditor — a refused duplicate explains itself visibly", () => {
  it("holds the refusal open at the row instead of only announcing it", () => {
    // Duplicating a swap is a no-op: the copy would swap to whoever the
    // original just put on field, so normalization removes it.
    const rotation: Rotation = [
      { characterId: raiden!.id, actionType: "normal" },
      { characterId: bennett!.id, actionType: "swap" },
      { characterId: bennett!.id, actionType: "normal" },
    ];
    render(
      <RotationEditor
        rotation={rotation}
        onRotationChange={() => {}}
        team={[raiden!, bennett!, null, null]}
        swapCost={DEFAULT_EDITOR_SWAP_COST_SECONDS}
      />,
    );

    const swapRow = screen
      .getAllByRole("listitem")
      .find((row) => within(row).queryByText(/切至/) !== null);
    expect(swapRow).toBeTruthy();

    openRowMenu(swapRow!);
    fireEvent.click(within(swapRow!).getByRole("button", { name: /复制/ }));

    // The refusal is visible text at the row, not live-region-only.
    expect(within(swapRow!).getByText(/重复的切人不会执行/)).toBeTruthy();
  });
});
