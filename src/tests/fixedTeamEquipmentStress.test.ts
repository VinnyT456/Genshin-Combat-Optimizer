import { describe, expect, it } from "vitest";
import { nationalRotation, nationalTeam, testEnemy } from "@/game-data";
import {
  characterEquipmentBuffs,
} from "@/features/simulation/equipmentAdapter";
import {
  equipArtifactSet,
  equipWeapon,
  type EquipmentSelections,
} from "@/features/team-builder/equipmentSelection";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import {
  ARTIFACT_SLOTS,
  type ArtifactLoadout,
  type ArtifactSlot,
  type EquipmentStat,
} from "@/simulation/character/equipment";
import { weaponPassiveBuffsById } from "@/game-data/weapons/weaponBuffs";
import type { CharacterEquipmentBuffs } from "@/simulation/engine/equipmentBuffs";

// ============================================================================
// Fixed-team equipment stress matrix.
//
// The team and rotation stay constant while one build dimension changes. The
// assertions target engine invariants (finite output, exact aggregation,
// deterministic replay) and directional changes supported by authored data.
// They intentionally do not assert a single magic total for the whole team:
// that would only prove that this test duplicated the engine's calculation.
// ============================================================================

/** Make every burst executable so the matrix exercises burst buffs and C-levels. */
function fixedTeam(constellations: Readonly<Record<string, number>> = {}) {
  return nationalTeam.map((character) => ({
    ...character,
    constellation: constellations[character.id] ?? 0,
    elementalBurst: { ...character.elementalBurst, energyCost: 0 },
  }));
}

function emptyLoadout(): ArtifactLoadout {
  const loadout: Partial<Record<ArtifactSlot, ArtifactLoadout[ArtifactSlot]>> = {};
  for (const slot of ARTIFACT_SLOTS) {
    loadout[slot] = {
      slot,
      setId: "synthetic-stress-set",
      mainStat: { stat: "atkFlat", value: 0 },
      substats: [],
    };
  }
  return loadout;
}

function statLoadout(
  stats: Readonly<Partial<Record<ArtifactSlot, EquipmentStat>>>,
): ArtifactLoadout {
  const loadout = emptyLoadout();
  for (const slot of ARTIFACT_SLOTS) {
    const piece = loadout[slot];
    if (!piece) continue;
    const mainStat = stats[slot];
    if (mainStat) piece.mainStat = mainStat;
  }
  return loadout;
}

function run(
  team = fixedTeam(),
  equipment: EquipmentSelections = {},
) {
  return runSimulation({
    team,
    rotation: nationalRotation,
    enemy: testEnemy,
    equipment,
    config: { critMode: "expected" },
  }).result;
}

function sum(values: Readonly<Record<string, number>>): number {
  return Object.values(values).reduce((total, value) => total + value, 0);
}

function expectSoundResult(result: ReturnType<typeof run>): void {
  expect(result.errors).toEqual([]);
  expect(Number.isFinite(result.totalDamage)).toBe(true);
  expect(Number.isFinite(result.dps)).toBe(true);
  expect(result.totalDamage).toBeGreaterThan(0);

  const timelineDamage = result.timeline
    .filter((event) => event.type === "damage" && event.damage !== undefined)
    .reduce((total, event) => total + (event.damage?.finalDamage ?? 0), 0);
  expect(result.totalDamage).toBeCloseTo(timelineDamage, 8);
  expect(result.totalDamage).toBeCloseTo(sum(result.damageByAbility), 8);
  expect(result.totalDamage).toBeCloseTo(sum(result.damageByCharacter), 8);
  expect(result.totalDamage).toBeCloseTo(sum(result.damageByElement), 8);
}

/** Compare the public result, excluding internal resolver graphs in finalState. */
function resultDigest(result: ReturnType<typeof run>): string {
  return JSON.stringify({
    totalDamage: result.totalDamage,
    dps: result.dps,
    duration: result.duration,
    damageByAbility: result.damageByAbility,
    damageByCharacter: result.damageByCharacter,
    damageByElement: result.damageByElement,
    timeline: result.timeline,
    errors: result.errors,
    warnings: result.warnings,
  });
}

const matrix: readonly {
  name: string;
  team?: ReturnType<typeof fixedTeam>;
  equipment?: EquipmentSelections;
}[] = [
  { name: "bare C0 team" },
  {
    name: "Raiden authored artifact stats",
    equipment: {
      ["raiden-shogun"]: {
        artifactLoadout: statLoadout({
          plume: { stat: "atkFlat", value: 311 },
          sands: { stat: "atkPercent", value: 0.466 },
          goblet: { stat: "elementalDmgBonus", element: "electro", value: 0.466 },
          circlet: { stat: "critRate", value: 0.311 },
        }),
      },
    },
  },
  {
    name: "The Catch R1",
    equipment: equipWeapon({}, "raiden-shogun", "thecatch", 1),
  },
  {
    name: "The Catch R5",
    equipment: equipWeapon({}, "raiden-shogun", "thecatch", 5),
  },
  {
    name: "Staff of Homa R1",
    equipment: equipWeapon({}, "raiden-shogun", "staffofhoma", 1),
  },
  {
    name: "Xingqiu 祭礼剑 R5",
    equipment: equipWeapon({}, "xingqiu", "sacrificialsword", 5),
  },
  {
    name: "Bennett Noblesse 2pc",
    equipment: equipArtifactSet({}, "bennett", "noblesse-oblige", 2),
  },
  {
    name: "Raiden Emblem 4pc",
    equipment: equipArtifactSet({}, "raiden-shogun", "emblem-of-severed-fate", 4),
  },
  {
    name: "Raiden C2",
    team: fixedTeam({ "raiden-shogun": 2 }),
  },
  {
    name: "Raiden C6",
    team: fixedTeam({ "raiden-shogun": 6 }),
  },
];

describe("fixed National-team equipment stress matrix", () => {
  it.each(matrix)("keeps $name finite and internally reconciled", (scenario) => {
    const result = run(scenario.team, scenario.equipment);
    expectSoundResult(result);
  });

  it("changes only the intended dimensions in directional sweeps", () => {
    const bare = run();
    const stats = run(fixedTeam(), {
      ["raiden-shogun"]: {
        artifactLoadout: statLoadout({
          plume: { stat: "atkFlat", value: 311 },
          sands: { stat: "atkPercent", value: 0.466 },
          goblet: { stat: "elementalDmgBonus", element: "electro", value: 0.466 },
        }),
      },
    });
    const catchR1 = run(fixedTeam(), equipWeapon({}, "raiden-shogun", "thecatch", 1));
    const catchR5 = run(fixedTeam(), equipWeapon({}, "raiden-shogun", "thecatch", 5));
    const noblesse = run(fixedTeam(), equipArtifactSet({}, "bennett", "noblesse-oblige", 2));
    const c0 = bare;
    const c2 = run(fixedTeam({ "raiden-shogun": 2 }));

    expect(stats.totalDamage).toBeGreaterThan(bare.totalDamage);
    expect(catchR1.totalDamage).toBeGreaterThan(bare.totalDamage);
    expect(catchR5.totalDamage).toBeGreaterThan(catchR1.totalDamage);
    expect(noblesse.totalDamage).toBeGreaterThan(bare.totalDamage);
    expect(c2.totalDamage).toBeGreaterThan(c0.totalDamage);
  });

  it("is byte-deterministic across repeated runs for every matrix case", () => {
    for (const scenario of matrix) {
      const first = run(scenario.team, scenario.equipment);
      const second = run(scenario.team, scenario.equipment);
      expect(resultDigest(first), scenario.name).toBe(resultDigest(second));
    }
  });

  it("handles 祭礼剑 stats without falsely applying its chance-based reset passive", () => {
    const selection = equipWeapon({}, "xingqiu", "sacrificialsword", 5)["xingqiu"]!;
    const passive: CharacterEquipmentBuffs | undefined = characterEquipmentBuffs(selection);

    // The generated passive is explicitly unverified because its random
    // cooldown reset cannot be represented by the deterministic engine yet.
    // The safety invariant is that it contributes no invented always-on buff.
    expect(weaponPassiveBuffsById("sacrificialsword")).toBeUndefined();
    expect(passive).toBeUndefined();

    // The weapon's sourced base ATK/substat still reaches the run normally.
    const result = run(fixedTeam(), { xingqiu: selection });
    expectSoundResult(result);
    expect(result.timeline.some((event) => event.type === "damage" && event.characterId === "xingqiu")).toBe(true);
  });
});
