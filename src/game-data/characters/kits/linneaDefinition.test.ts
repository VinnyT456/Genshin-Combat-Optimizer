import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { makeEnemyModifierResolver } from "@/simulation/buffs/makeBuffResolver";
import { makeTestCharacter } from "@/tests/helpers/fixtures";
import type { Buff } from "@/simulation/buffs/types";
import type { EnemyState } from "@/types";
import {
  LINNEA_KIT_METADATA,
  createLinneaDefinition,
} from "./linneaDefinition";

const enemy: EnemyState = {
  id: "linnea-test-target",
  name: "Target",
  level: 90,
  resistances: { geo: 0.5 },
};
const noCrit = { critMode: "never" as const };

function damage(character: ReturnType<typeof createLinneaDefinition>, actionType: "normal" | "skill" | "burst", resumeFrom?: ReturnType<typeof simulateRotation>["finalState"]): number {
  return simulateRotation([character], [{ characterId: character.id, actionType }], enemy, {
    ...noCrit,
    ...(resumeFrom === undefined ? {} : { resumeFrom }),
  }).totalDamage;
}

function afterSkill(character: ReturnType<typeof createLinneaDefinition>) {
  const state = structuredClone(simulateRotation(
    [character],
    [{ characterId: character.id, actionType: "skill" }],
    enemy,
    noCrit,
  ).finalState);
  state.time = 20;
  state.characters[character.id]!.cooldowns = {};
  return state;
}

describe("Linnea runtime kit", () => {
  it("executes sourced baseline Skill damage", () => {
    expect(damage(createLinneaDefinition(0), "skill")).toBeGreaterThan(0);
  });

  it("applies A1 Geo RES reduction after Lumi's Skill cast", () => {
    const c0 = createLinneaDefinition(0);
    const a1 = createLinneaDefinition(0);
    const resumed = afterSkill(a1);

    expect(resumed.runtimeBuffs).toHaveLength(1);
    const enemyModifiers = makeEnemyModifierResolver({ buffs: (resumed.runtimeBuffs ?? []) as Buff[] })({
      time: resumed.time,
      character: makeTestCharacter("linnea"),
      ability: makeTestCharacter("linnea").elementalSkill,
      activeCharacterId: a1.id,
      snapshot: resumed,
      enemy,
    });
    expect(enemyModifiers.resReduction.geo).toBe(0.15);
    expect(damage(a1, "normal", resumed)).toBe(
      damage(c0, "normal", afterSkill(c0)),
    );
  });

  it("retains generated C3 Skill talent boost in actual damage", () => {
    expect(damage(createLinneaDefinition(3), "skill")).toBeGreaterThan(
      damage(createLinneaDefinition(0), "skill"),
    );
  });

  it("adds C5 Burst talent boost while documenting zero sourced Burst damage", () => {
    const c5 = createLinneaDefinition(5);
    expect(c5.constellations.find((row) => row.id === "linnea-c5")?.buffs?.[0]).toMatchObject({
      talentLevelModifiers: [{ slot: "burst", levels: 3 }],
    });
    expect(damage(c5, "burst")).toBe(0);
  });

  it("fails closed for unsupported reaction and lifecycle channels", () => {
    expect(LINNEA_KIT_METADATA.unsupportedChannels).toContain("c1FieldCatalogStacksAndLunarCrystallizeDamage");
    expect(LINNEA_KIT_METADATA.unsupportedChannels).toContain("p3HydroCrystallizeToLunarCrystallizeConversionAndDefScaling");
  });
});
