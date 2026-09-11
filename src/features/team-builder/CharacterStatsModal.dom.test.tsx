import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { CharacterDefinition } from "@/types";
import { findCharacter } from "@/game-data/characters/registry";
import { toWebsiteCharacter } from "@/features/team-builder/rosterModel";
import {
  baseStatsAtLevel,
  talentBoostsForConstellation,
} from "@/features/team-builder/characterProgression";
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

function renderModal(
  equipment?: {
    weaponId?: string;
    refinement?: 1 | 2 | 3 | 4 | 5;
    weaponLevel?: number;
    artifactSetId?: string;
    artifactPieces?: 1 | 2 | 4;
  },
  characterId = CHARACTER_ID,
) {
  const character = findCharacter(characterId);
  if (!character) throw new Error(`${characterId} missing from roster`);
  return render(
    <CharacterStatsModal
      open
      character={toWebsiteCharacter(character) as CharacterDefinition}
      equipment={equipment}
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

  it("does not render the internal base-state status label", () => {
    renderModal();
    expect(screen.queryByText("基础状态 · 已解锁")).toBeNull();
  });

  it("shows selected gear and permanent effects in the initial panel", () => {
    renderModal({
      weaponId: "wolfsgravestone",
      refinement: 5,
      artifactSetId: "gladiators-finale",
      artifactPieces: 2,
    });

    const panel = screen.getByRole("region", { name: "计算起始面板" });
    expect(panel).toHaveTextContent("装备与常驻效果已合并");
    expect(panel).toHaveTextContent("圣遗物：角斗士的终幕礼");
    expect(panel).toHaveTextContent("武器：狼的末路");
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

  it("rebuilds the level curve without dropping the selected weapon level", () => {
    const raiden = findCharacter("raiden-shogun");
    if (!raiden) throw new Error("raiden-shogun missing from roster");
    const expected = baseStatsAtLevel(raiden, 40)?.atk;
    if (expected === undefined) throw new Error("Raiden level 40 curve missing");

    renderModal(
      { weaponId: "thecatch", refinement: 5, weaponLevel: 20 },
      "raiden-shogun",
    );
    fireEvent.change(screen.getByLabelText("角色等级"), {
      target: { value: "40" },
    });

    const panel = screen.getByRole("region", { name: "计算起始面板" });
    // The Catch contributes 109 base ATK at level 20. A level change must keep
    // that contribution while replacing only the character's curve point.
    expect(panel).toHaveTextContent(`攻击力${(expected + 109).toLocaleString("zh-CN")}`);
    expect(panel).toHaveTextContent("基础攻击 109 · 20级");
  });

  it("keeps the visible starter weapon when saving unchanged fields", () => {
    const raiden = findCharacter("raiden-shogun");
    if (!raiden) throw new Error("raiden-shogun missing from roster");
    const onSave = vi.fn();

    render(
      <CharacterStatsModal
        open
        character={toWebsiteCharacter(raiden) as CharacterDefinition}
        equipment={{ weaponId: "staffofhoma", refinement: 1, weaponLevel: 90 }}
        onClose={() => {}}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "保存并套用配置" }));

    const savedStats = onSave.mock.calls[0]?.[0] as CharacterDefinition["baseStats"] | undefined;
    expect(savedStats?.base?.atk).toBe(raiden.baseStats.atk + 608);
    expect(savedStats?.atk).toBe(raiden.baseStats.atk + 608);
  });

  it("restores the preset at the selected character and weapon levels", () => {
    const raiden = findCharacter("raiden-shogun");
    if (!raiden) throw new Error("raiden-shogun missing from roster");
    const expectedCharacterAtk = baseStatsAtLevel(raiden, 40)?.atk;
    if (expectedCharacterAtk === undefined) {
      throw new Error("Raiden level 40 curve missing");
    }

    const websiteRaiden = toWebsiteCharacter(raiden) as CharacterDefinition;
    render(
      <CharacterStatsModal
        open
        character={websiteRaiden}
        defaultCharacter={websiteRaiden}
        equipment={{ weaponId: "thecatch", refinement: 5, weaponLevel: 20 }}
        onClose={() => {}}
        onSave={() => {}}
      />,
    );

    fireEvent.change(screen.getByLabelText("角色等级"), {
      target: { value: "40" },
    });
    fireEvent.click(screen.getByRole("button", { name: "恢复基础预设" }));

    const panel = screen.getByRole("region", { name: "计算起始面板" });
    // Reset must keep the selected level 40 curve and The Catch's level-20
    // base ATK, rather than restoring the roster's level-90 snapshot.
    expect(panel).toHaveTextContent(
      `攻击力${(expectedCharacterAtk + 109).toLocaleString("zh-CN")}`,
    );
  });
});
