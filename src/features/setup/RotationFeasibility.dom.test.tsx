import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { RotationFeasibility } from "@/features/setup/RotationFeasibility";
import { nationalTeam } from "@/game-data";
import type { Rotation, SimulationWarning } from "@/types";

// ---------------------------------------------------------------------------
// RENDER TESTS for the 判定 cell, from the §15 review.
//
// Both findings are about what ONE CELL claims, which only a rendered DOM can
// show: the model is correct in isolation in either case, and the defect is
// created by how `Verdict` composes the structural F2 flag with the engine's
// verdict.
//
//   Finding 10 — F2 (`无前置动作`) rendered ABOVE `充能可达` in the same cell:
//   two contradictory claims about one fact, with the false one on top. The
//   engine's verdict is the true one (the character did charge, off-field), so
//   F2 must be suppressed whenever the verdict is `sufficient`.
//
//   Finding 2 — with no run, rows without an F2 flag rendered an empty
//   `<span>`, leaving a blank cell under a column headed 判定. Blank reads as
//   "no verdict was reached", which is a different claim from "no run yet".
// ---------------------------------------------------------------------------

const [raiden, bennett] = nationalTeam;
const RAIDEN = raiden!;
const BENNETT = bennett!;

const team = [RAIDEN, BENNETT, null, null] as const;

/** Raiden bursts with no prior action of her own — F2 is true for her row. */
const burstFirst: Rotation = [
  { characterId: BENNETT.id, actionType: "skill" },
  { characterId: RAIDEN.id, actionType: "burst" },
];

function energyFailure(characterId: string, actionIndex: number): SimulationWarning {
  return {
    actionIndex,
    timestamp: 0,
    characterId,
    code: "insufficient-energy",
    message: "not enough energy",
  };
}

function verdictCell(characterName: string): HTMLElement {
  const row = screen.getByRole("row", { name: new RegExp(characterName) });
  const cells = within(row).getAllByRole("cell");
  // 判定 is the last cell in every row at every breakpoint.
  return cells[cells.length - 1]!;
}

describe("RotationFeasibility — 判定 cell (§15 review)", () => {
  it("suppresses the F2 chip when the engine says 充能可达 (finding 10)", () => {
    // A fresh run with NO energy warning: the burst succeeded despite having no
    // prior on-field action, because the character charged off-field.
    render(
      <RotationFeasibility rotation={burstFirst} team={[...team]} runWarnings={[]} />,
    );

    const cell = verdictCell("雷电将军");
    expect(within(cell).getByText("充能可达")).toBeInTheDocument();
    expect(within(cell).queryByText("无前置动作")).toBeNull();
    expect(cell.textContent).not.toContain("序列中该角色在元素爆发前没有任何动作");
  });

  it("never co-renders F2 and 充能可达 anywhere in the panel (finding 10)", () => {
    render(
      <RotationFeasibility rotation={burstFirst} team={[...team]} runWarnings={[]} />,
    );

    expect(screen.getByText("充能可达")).toBeInTheDocument();
    expect(screen.queryByText("无前置动作")).toBeNull();
  });

  it("keeps F2 stacked with 充能不足, where it corroborates (finding 10)", () => {
    render(
      <RotationFeasibility
        rotation={burstFirst}
        team={[...team]}
        runWarnings={[energyFailure(RAIDEN.id, 1)]}
      />,
    );

    const cell = verdictCell("雷电将军");
    expect(within(cell).getByText("充能不足")).toBeInTheDocument();
    expect(within(cell).getByText("无前置动作")).toBeInTheDocument();
  });

  it("renders 待模拟 rather than a blank 判定 cell when there is no run (finding 2)", () => {
    const noF2: Rotation = [
      { characterId: RAIDEN.id, actionType: "skill" },
      { characterId: RAIDEN.id, actionType: "burst" },
    ];

    render(
      <RotationFeasibility rotation={noF2} team={[...team]} runWarnings={null} />,
    );

    const cell = verdictCell("雷电将军");
    expect(within(cell).getByText("待模拟")).toBeInTheDocument();
    expect(cell.textContent?.trim()).not.toBe("");
  });

  it("does not repeat 共需 <n> 能 inside the 判定 cell on mobile (finding 1)", () => {
    render(
      <RotationFeasibility rotation={burstFirst} team={[...team]} runWarnings={null} />,
    );

    // The demand figure belongs to the row header's stacked mobile line only.
    const cell = verdictCell("雷电将军");
    expect(cell.textContent).not.toContain("共需");
  });

  it("labels the table by its visible heading instead of an sr-only caption (finding 9)", () => {
    const { container } = render(
      <RotationFeasibility rotation={burstFirst} team={[...team]} runWarnings={null} />,
    );

    expect(container.querySelector("caption")).toBeNull();
    expect(
      screen.getByRole("table", { name: "能量与可行性" }),
    ).toBeInTheDocument();
  });
});
