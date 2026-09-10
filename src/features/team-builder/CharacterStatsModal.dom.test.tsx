import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { CharacterDefinition } from "@/types";
import { findCharacter } from "@/game-data/characters/registry";
import { toWebsiteCharacter } from "@/features/team-builder/rosterModel";
import { talentBoostsForConstellation } from "@/features/team-builder/characterProgression";
import { CharacterStatsModal } from "./CharacterStatsModal";

// ---------------------------------------------------------------------------
// RENDER TESTS replacing the modal half of the source-text block that lived in
// `progressionWiring.test.ts`.
//
// The string check asserted the file CONTAINED
// `talentBoostsForConstellation(character.id, constellation)` and
// `talentBoost={talentBoosts.skill}`. That proves the text is present; it
// cannot prove the boost survives to the screen, and it would keep passing if
// the modal threw on mount. These drive the real constellation control and
// read the resulting table.
// ---------------------------------------------------------------------------

/** Diluc: C3/C5 grant +3 talent levels to burst/skill, and both are modelled. */
const CHARACTER_ID = "diluc";
const CONSTELLATION_WITH_SKILL_BOOST = 5;

function characterFixture(): CharacterDefinition {
  const kit = findCharacter(CHARACTER_ID);
  if (!kit) throw new Error(`${CHARACTER_ID} missing from roster`);
  return toWebsiteCharacter(kit) as CharacterDefinition;
}

function renderModal() {
  return render(
    <CharacterStatsModal
      open
      character={characterFixture()}
      onClose={() => {}}
      onSave={() => {}}
    />,
  );
}

function openTalentsTab() {
  fireEvent.click(screen.getByRole("button", { name: "天赋与技能" }));
}

function selectConstellation(level: number) {
  fireEvent.click(screen.getByRole("button", { name: /^命之座/ }));
  const option = document.querySelector<HTMLButtonElement>(
    `[data-constellation="${level}"]`,
  );
  if (option === null) throw new Error(`no constellation control for C${level}`);
  fireEvent.click(option);
}

describe("CharacterStatsModal mounts", () => {
  it("renders without throwing, which a source-text check cannot establish", () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("CharacterStatsModal derives boosts from the LIVE constellation", () => {
  it("shows no boost on the talent summary at C0", () => {
    const boosts = talentBoostsForConstellation(
      CHARACTER_ID,
      CONSTELLATION_WITH_SKILL_BOOST,
    );
    // Guard: if the data ever stops granting a boost here, these tests would
    // silently stop testing anything.
    expect(boosts.skill).toBeGreaterThan(0);

    renderModal();
    // `formatTalentLevelSummary` only decorates when something is added.
    expect(screen.queryByText(/→/)).toBeNull();
  });

  it("updates the talent summary when the constellation is raised", () => {
    renderModal();
    selectConstellation(CONSTELLATION_WITH_SKILL_BOOST);

    // The boost reaches the header summary without a save round-trip. This is
    // the "keyed off the radio-group state, not the saved character" property.
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it("hands the boost to the ability tables, not just the summary", () => {
    renderModal();
    selectConstellation(CONSTELLATION_WITH_SKILL_BOOST);
    openTalentsTab();

    // `AbilityCard` renders this notice only when it receives a non-zero
    // `talentBoost`. Its presence is the wiring, observed on screen.
    expect(screen.getAllByText(/命之座使该天赋等级/).length).toBeGreaterThan(0);
  });

  it("shows no boost notice on the ability tables at C0", () => {
    renderModal();
    openTalentsTab();
    expect(screen.queryByText(/命之座使该天赋等级/)).toBeNull();
  });
});

describe("CharacterStatsModal shows the live level in the summary", () => {
  it("updates the header level as the level selector moves", () => {
    renderModal();
    // `getByLabelText` throws when absent, so the optional-control branch has
    // to use the `query*` form.
    const select = screen.queryByLabelText("角色等级") as HTMLSelectElement | null;
    expect(select).not.toBeNull();

    const before = screen.getByText(/等级 \d+ · 天赋/).textContent;
    fireEvent.change(select as HTMLSelectElement, { target: { value: "40" } });
    const after = screen.getByText(/等级 \d+ · 天赋/).textContent;

    // Rendering the saved prop instead of live state left this stale until
    // save, beside talent figures that were already live.
    expect(after).not.toBe(before);
    expect(after).toContain("40");
  });
});
