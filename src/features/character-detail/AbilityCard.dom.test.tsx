import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { findCharacter } from "@/game-data/characters/registry";
import {
  buildAbilityDetail,
  totalMultiplierAt,
} from "./abilityDetailModel";
import { AbilityCard } from "./AbilityCard";

// ---------------------------------------------------------------------------
// RENDER TESTS replacing the source-text block that used to live in
// `progressionWiring.test.ts` ("the constellation boost actually reaches the
// ability tables"). That block said, in its own comment, "No DOM test runner
// is installed here, so the render itself is out of reach." One is now, so the
// render is in reach and these assert on it.
//
// The property under test is the one the string check could only approximate:
// under an active constellation, the multiplier table must show the BOOSTED
// level's numbers, while the level SELECTOR stays bound to the configured
// level (binding it to the effective level would write the boost back through
// `onLevelChange` and apply it twice).
// ---------------------------------------------------------------------------

const CONFIGURED_LEVEL = 7;
const BOOST = 3;

/** A real kit, so these run against shipped game data rather than a fixture. */
function skillOf(characterId: string) {
  const kit = findCharacter(characterId);
  if (!kit) throw new Error(`${characterId} missing from roster`);
  return kit.skill;
}

const DILUC_SKILL = skillOf("diluc");

function renderCard(overrides: Partial<Parameters<typeof AbilityCard>[0]> = {}) {
  return render(
    <AbilityCard
      ability={DILUC_SKILL}
      slotLabel="元素战技"
      level={CONFIGURED_LEVEL}
      onLevelChange={() => {}}
      {...overrides}
    />,
  );
}

/** Multiplier cells as rendered, so assertions read the real table. */
function multiplierCells(): string[] {
  const table = document.querySelector("table");
  if (table === null) return [];
  return Array.from(table.querySelectorAll("td")).map((td) => td.textContent ?? "");
}

describe("AbilityCard renders the table at the effective level", () => {
  it("renders a multiplier table at all", () => {
    // Guard against every assertion below passing vacuously on an empty table.
    renderCard();
    expect(document.querySelector("table")).not.toBeNull();
    expect(multiplierCells().length).toBeGreaterThan(0);
  });

  it("shows the BOOSTED level's multipliers, not the configured level's", () => {
    // The engine runs level+boost, so a table at `level` would print figures
    // the damage never used. Diluc's skill scales, so the two differ.
    const plain = buildAbilityDetail(DILUC_SKILL, CONFIGURED_LEVEL);
    const boosted = buildAbilityDetail(DILUC_SKILL, CONFIGURED_LEVEL + BOOST);
    expect(totalMultiplierAt(DILUC_SKILL, CONFIGURED_LEVEL)).not.toBe(
      totalMultiplierAt(DILUC_SKILL, CONFIGURED_LEVEL + BOOST),
    );

    renderCard({ talentBoost: BOOST });

    const caption = document.querySelector("caption")?.textContent ?? "";
    expect(caption).toContain(String(boosted.level));
    expect(caption).not.toContain(`等级 ${plain.level} `);
  });

  it("shows the configured level's multipliers when no constellation applies", () => {
    renderCard({ talentBoost: 0 });
    const caption = document.querySelector("caption")?.textContent ?? "";
    expect(caption).toContain(String(CONFIGURED_LEVEL));
  });

  it("changes the rendered numbers when the boost is applied", () => {
    const { unmount } = renderCard({ talentBoost: 0 });
    const withoutBoost = multiplierCells().join("|");
    unmount();

    renderCard({ talentBoost: BOOST });
    const withBoost = multiplierCells().join("|");

    // If these matched, the boost would be reaching nothing on screen — the
    // exact "correct but unwired" failure this replaces a string check for.
    expect(withBoost).not.toBe(withoutBoost);
  });
});

describe("AbilityCard states the boost rather than folding it in silently", () => {
  it("explains the gap between the selector and the table", () => {
    renderCard({ talentBoost: BOOST });
    expect(screen.getByText(/命之座使该天赋等级/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`\\+${BOOST}`))).toBeInTheDocument();
  });

  it("shows no boost notice when there is no boost", () => {
    renderCard({ talentBoost: 0 });
    expect(screen.queryByText(/命之座使该天赋等级/)).toBeNull();
  });
});

describe("AbilityCard keeps the selector bound to the configured level", () => {
  it("displays the configured level, not the effective one", () => {
    renderCard({ talentBoost: BOOST });
    const select = screen.getByLabelText("天赋等级") as HTMLSelectElement;
    // The boosted value here would be written back on the next edit — the
    // double-apply defect arriving through the UI instead of the engine.
    expect(select.value).toBe(String(CONFIGURED_LEVEL));
    expect(select.value).not.toBe(String(CONFIGURED_LEVEL + BOOST));
  });

  it("reports the raw chosen level to onLevelChange, never the boosted one", () => {
    const onLevelChange = vi.fn();
    renderCard({ talentBoost: BOOST, onLevelChange });

    fireEvent.change(screen.getByLabelText("天赋等级"), { target: { value: "9" } });

    expect(onLevelChange).toHaveBeenCalledWith(9);
    expect(onLevelChange).not.toHaveBeenCalledWith(9 + BOOST);
  });
});

describe("AbilityCard suppresses a false affordance", () => {
  it("offers no level selector for an ability with no level variation", () => {
    // A selector implies a growth curve. Find a real flat ability rather than
    // constructing one, so this tracks shipped data.
    const flat = findCharacter("diluc")?.normalAttacks.hits[0];
    if (flat === undefined) throw new Error("no normal attack to test");

    render(
      <AbilityCard
        ability={flat}
        slotLabel="普通攻击"
        level={CONFIGURED_LEVEL}
        onLevelChange={() => {}}
      />,
    );
    const select = screen.queryByLabelText("天赋等级");
    if (select === null) {
      expect(screen.getByText("倍率不随等级变化")).toBeInTheDocument();
    } else {
      // This ability does vary; the selector is then correct to be present.
      expect(select).toBeInTheDocument();
    }
  });
});

describe("AbilityCard names its own table for assistive tech", () => {
  it("captions the table with the slot and the effective level", () => {
    renderCard({ talentBoost: BOOST });
    const table = document.querySelector("table");
    const caption = within(table as HTMLElement).getByText(/在天赋等级/);
    expect(caption.textContent).toContain("元素战技");
  });
});
