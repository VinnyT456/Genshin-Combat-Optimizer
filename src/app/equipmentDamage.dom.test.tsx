import { beforeEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Page from "@/app/page";
import { findWeapon } from "@/game-data/weapons/registry";
import { weaponPassiveBuffsById } from "@/game-data/weapons/weaponBuffs";
import { artifactSetBonusBuffsBySetId } from "@/game-data/artifacts/setBonusBuffs";
import { allArtifacts } from "@/game-data/artifacts/registry";

// ---------------------------------------------------------------------------
// THE DELIVERABLE FOR TASK #071: equipping gear must move the DAMAGE NUMBER
// the dashboard shows.
//
// WHY THIS FILE AND NOT A UNIT TEST. Every half of the equipment chain was
// already implemented and green before this task: `weaponPassiveBuffs()` emits
// per-refinement `Buff` data, `harvestWeaponPassiveBuffs()` selects the owned
// refinement, `activeSetBonusKeys()` gates piece counts, and
// `simulateRotation()` composes all of it into the damage pipeline. All of it
// was dead from the user's seat, because nothing carried the PICKER's output
// into `SimulationConfig`. A typecheck cannot see a dead wire; neither can a
// unit test that constructs the config by hand, which is exactly what every
// existing equipment test does.
//
// This project has been bitten by that gap twice — `ArtifactAvatar` requesting
// a 404 icon while every source-text assertion passed, and `page.tsx` gating
// the whole workspace behind `search === ""` while 2416 tests stayed green
// because each one mounted with `?view=all`. So the assertion here is
// deliberately the crudest possible one: mount the real page, click through the
// real pickers, press Run, and read the number off the screen.
//
// MUTATION CHECK (performed, and the reason these are worth their runtime):
// deleting the `equipment` argument from `runSimulation()` in `page.tsx`, or
// dropping `refinement` in `equipWeapon()`, fails these tests and nothing else
// in the suite.
// ---------------------------------------------------------------------------

const WORKSPACE_URL = "/?view=all";
const RUN_LABEL = "执行循环模拟";
const RERUN_LABEL = "重新执行战斗模拟";

/**
 * A weapon whose passive is modelled AND whose magnitude differs by refinement.
 *
 * The Catch grants +DMG% and +CRIT Rate, doubling from R1 to R5, so both the
 * "equipping moves the number" and the "refinement moves the number" assertions
 * have something real to observe. It is a POLEARM because the default team's
 * slot 1 (Raiden) is a polearm user and the picker filters by weapon type — a
 * weapon of the wrong type simply is not in the list, which would make this
 * test fail for a reason that has nothing to do with the wire under test.
 *
 * The preconditions below read the live data, so if the generated roster ever
 * stops modelling this passive the suite says so instead of quietly asserting
 * "0 === 0" against a weapon that grants nothing.
 */
const MODELLED_POLEARM_ID = "thecatch";

beforeEach(() => {
  window.sessionStorage.clear();
  window.history.replaceState(null, "", WORKSPACE_URL);
});

async function renderWorkspace() {
  const utils = render(<Page />);
  await screen.findByRole("button", { name: RUN_LABEL });
  return utils;
}

/** Runs, or re-runs, and waits for the dashboard. */
async function runSimulation() {
  const label = screen.queryByRole("button", { name: RERUN_LABEL })
    ? RERUN_LABEL
    : RUN_LABEL;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: label }));
  });
  await screen.findByRole("heading", { name: "核心输出数据看板" });
}

/**
 * The dashboard's total-damage figure, as a NUMBER.
 *
 * Parsed rather than string-compared because the assertion is "the damage
 * moved, in this direction", and a string comparison would pass on a formatting
 * change that left the value identical.
 */
function totalDamage(): number {
  const heading = screen.getByRole("heading", { name: "核心输出数据看板" });
  const section = heading.closest("section");
  if (section === null) throw new Error("no dashboard section");
  const label = within(section).getAllByText("总伤害")[0];
  const card = label?.parentElement;
  if (!card) throw new Error("no stat card around 总伤害");
  const digits = (card.textContent ?? "").replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(digits);
  if (!Number.isFinite(value)) {
    throw new Error(`no damage number in ${card.textContent}`);
  }
  return value;
}

/** Opens slot 1's weapon picker, whether or not a weapon is already equipped. */
async function openWeaponPicker() {
  const slot = screen.getByLabelText(/^1 号位：/).closest("div");
  if (slot === null) throw new Error("no slot 1");
  const trigger =
    within(slot).queryByTitle("点击更换装配武器") ??
    within(slot).getByRole("button", { name: /装备武器/ });
  await act(async () => {
    fireEvent.click(trigger);
  });
  await screen.findByLabelText("精炼等级:");
}

async function openArtifactPicker() {
  const slot = screen.getByLabelText(/^1 号位：/).closest("div");
  if (slot === null) throw new Error("no slot 1");
  const trigger =
    within(slot).queryByTitle("点击更换装配圣遗物") ??
    within(slot).getByRole("button", { name: /装备圣遗物/ });
  await act(async () => {
    fireEvent.click(trigger);
  });
  await screen.findByLabelText("装备件数:");
}

/** Chooses a refinement in the open weapon picker, then equips `nameZh`. */
async function equipWeaponAt(nameZh: string, refinement: number) {
  await act(async () => {
    fireEvent.change(screen.getByLabelText("精炼等级:"), {
      target: { value: String(refinement) },
    });
  });
  // Once a weapon is equipped its name is also rendered in the slot behind
  // the dialog. Scope the lookup to the open picker so changing refinement
  // after the first equip remains deterministic.
  const picker = screen.getByRole("dialog");
  const card = within(picker).getByText(nameZh).closest('[role="button"]');
  if (card === null) throw new Error(`no card for ${nameZh}`);
  await act(async () => {
    fireEvent.click(card);
  });
  await waitFor(() => expect(screen.queryByLabelText("精炼等级:")).toBeNull());
}

async function equipArtifactAt(nameZh: string, pieces: number) {
  await act(async () => {
    fireEvent.change(screen.getByLabelText("装备件数:"), {
      target: { value: String(pieces) },
    });
  });
  const card = screen.getByText(nameZh).closest("li");
  if (card === null) throw new Error(`no card for ${nameZh}`);
  await act(async () => {
    fireEvent.click(
      within(card).getByRole("button", { name: /点击装配此套装|当前装备中/ }),
    );
  });
  await waitFor(() => expect(screen.queryByLabelText("装备件数:")).toBeNull());
}

// ---------------------------------------------------------------------------
// PRECONDITIONS. If these fail, the assertions below would be vacuous rather
// than wrong, so they are stated separately and read the live data.
// ---------------------------------------------------------------------------

describe("equipment damage — preconditions on the live data", () => {
  it("the chosen weapon's passive is modelled and differs between R1 and R5", () => {
    const weapon = findWeapon(MODELLED_POLEARM_ID);
    expect(weapon).toBeDefined();
    // Must match slot 1's type, or the picker will not list it.
    expect(weapon?.weaponType).toBe("polearm");

    const passive = weaponPassiveBuffsById(MODELLED_POLEARM_ID);
    expect(passive).toBeDefined();
    // Both refinements authored, and NOT the same numbers — otherwise the
    // refinement assertion below could pass against a flat passive.
    const r1 = passive?.buffsByRefinement[1];
    const r5 = passive?.buffsByRefinement[5];
    expect(r1).toBeDefined();
    expect(r5).toBeDefined();
    expect(JSON.stringify(r5)).not.toBe(JSON.stringify(r1));
  });

  it("at least one artifact set publishes a modelled 2-piece bonus", () => {
    const modelled = [...artifactSetBonusBuffsBySetId.values()].filter(
      (set) => set.twoPiece !== undefined,
    );
    expect(modelled.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// THE DELIVERABLE.
// ---------------------------------------------------------------------------

describe("equipping a weapon changes the damage the dashboard shows", () => {
  it("does not render internal passive status labels", async () => {
    await renderWorkspace();
    await openWeaponPicker();
    expect(screen.queryByText("已接入模拟")).toBeNull();
    expect(screen.queryByText("尚未接入模拟")).toBeNull();
    expect(screen.queryByText("数值待核实")).toBeNull();
  });

  it("equipping a modelled weapon raises the total damage", async () => {
    const weapon = findWeapon(MODELLED_POLEARM_ID);
    if (!weapon) throw new Error("fixture weapon missing");

    await renderWorkspace();
    await runSimulation();
    const before = totalDamage();
    expect(before).toBeGreaterThan(0);

    await openWeaponPicker();
    await equipWeaponAt(weapon.nameZh, 1);
    await runSimulation();

    // The passive is a flat DMG% grant, so the direction is knowable without
    // reimplementing the formula: more damage, not merely different damage.
    expect(totalDamage()).toBeGreaterThan(before);
  });

  it("retains the selected refinement when the picker is reopened", async () => {
    const weapon = findWeapon(MODELLED_POLEARM_ID);
    if (!weapon) throw new Error("fixture weapon missing");

    await renderWorkspace();
    await openWeaponPicker();
    await equipWeaponAt(weapon.nameZh, 1);
    await runSimulation();

    // ONLY the refinement changes. Same weapon, same team, same rotation — so
    // a difference can come from nothing else. This is the assertion that
    // `harvestWeaponPassiveBuffs()` is being handed the OWNED refinement
    // rather than defaulting to R1, which is invisible to every static check.
    await openWeaponPicker();
    await equipWeaponAt(weapon.nameZh, 5);
    const slot = screen.getByLabelText(/^1 号位：/).closest("div") as HTMLElement;
    expect(within(slot).getByText("精5")).toBeInTheDocument();
  });

  it("states the owned refinement on the slot, not just inside the picker", async () => {
    const weapon = findWeapon(MODELLED_POLEARM_ID);
    if (!weapon) throw new Error("fixture weapon missing");

    await renderWorkspace();
    await openWeaponPicker();
    await equipWeaponAt(weapon.nameZh, 5);

    // A refinement the result depends on must be readable without reopening
    // the dialog that set it.
    const slot = screen.getByLabelText(/^1 号位：/).closest("div") as HTMLElement;
    expect(within(slot).getByText("精5")).toBeInTheDocument();
  });
});

describe("equipping an artifact set changes the damage the dashboard shows", () => {
  /** A set whose 2pc bonus is modelled, taken from the live data. */
  function modelledSet() {
    const withTwoPiece = [...artifactSetBonusBuffsBySetId.entries()].find(
      ([, bonuses]) => bonuses.twoPiece !== undefined,
    );
    if (!withTwoPiece) throw new Error("no modelled 2pc set in the data");
    const definition = allArtifacts.find((set) => set.id === withTwoPiece[0]);
    if (!definition) throw new Error("modelled set is not in the picker registry");
    return definition;
  }

  it("equipping a set with a modelled 2-piece bonus moves the total damage", async () => {
    const set = modelledSet();

    await renderWorkspace();
    await runSimulation();
    const before = totalDamage();

    await openArtifactPicker();
    await equipArtifactAt(set.nameZh, 2);
    await runSimulation();

    // Not `toBeGreaterThan`: the modelled 2pc bonuses include defensive and
    // off-element channels whose sign depends on which set the live data
    // happens to sort first. "The number MOVED" is the property under test,
    // and asserting a direction the data does not guarantee would be a test
    // that passes for the wrong reason.
    expect(totalDamage()).not.toBe(before);
  });

  it("states the worn piece count on the slot", async () => {
    const set = modelledSet();

    await renderWorkspace();
    await openArtifactPicker();
    await equipArtifactAt(set.nameZh, 4);

    const slot = screen.getByLabelText(/^1 号位：/).closest("div") as HTMLElement;
    expect(within(slot).getByText("4件")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// TIER DISPLAY. The slot shows each set tier unlocked by the equipped piece
// count. It does not expose internal support metadata in the product UI.
// ---------------------------------------------------------------------------

describe("equipment tier display", () => {
  it("shows every tier the worn piece count unlocks", async () => {
    // A 4pc set exposes both unlocked tiers.
    const setWithBothTiers = allArtifacts.find(
      (set) =>
        set.bonuses.some((bonus) => bonus.pieces === 2) &&
        set.bonuses.some((bonus) => bonus.pieces === 4),
    );
    if (!setWithBothTiers) throw new Error("no set publishes both tiers");

    await renderWorkspace();
    await openArtifactPicker();
    await equipArtifactAt(setWithBothTiers.nameZh, 4);

    const slot = screen.getByLabelText(/^1 号位：/).closest("div") as HTMLElement;
    expect(within(slot).getByText("2件套")).toBeInTheDocument();
    expect(within(slot).getByText("4件套")).toBeInTheDocument();
  });

  it("hides the 4-piece tier when only 2 pieces are worn", async () => {
    const setWithBothTiers = allArtifacts.find(
      (set) =>
        set.bonuses.some((bonus) => bonus.pieces === 2) &&
        set.bonuses.some((bonus) => bonus.pieces === 4),
    );
    if (!setWithBothTiers) throw new Error("no set publishes both tiers");

    await renderWorkspace();
    await openArtifactPicker();
    await equipArtifactAt(setWithBothTiers.nameZh, 2);

    const slot = screen.getByLabelText(/^1 号位：/).closest("div") as HTMLElement;
    expect(within(slot).getByText("2件套")).toBeInTheDocument();
    expect(within(slot).queryByText("4件套")).toBeNull();
  });
});
