import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import {
  GAMING_KIT_METADATA,
  createGamingDefinition,
} from "./gamingDefinition";

const noCrit = { critMode: "never" as const };

function snapshotAtHp(character: GenericCharacterDefinition, currentHp: number): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: 0, max: character.maxEnergy, totalGained: 0, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
    currentHp,
    maxHp: character.baseStats.hp,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function skillResult(
  character: GenericCharacterDefinition,
  options: { critMode?: "never" | "expected" } = {},
  currentHp = character.baseStats.hp,
) {
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType: "skill" }],
    testEnemy,
    {
      critMode: options.critMode ?? "never",
      resumeFrom: snapshotAtHp(character, currentHp),
    },
  );
}

describe("Gaming runtime kit", () => {
  it("executes Charmed Cloudstrider as a Pyro plunge hit", () => {
    const result = skillResult(createGamingDefinition());
    const damage = result.timeline.find((event) => event.type === "damage");

    expect(damage?.type).toBe("damage");
    expect(damage?.damage?.element).toBe("pyro");
    expect(damage?.damage?.damageType).toBe("plunge");
    expect(damage?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("applies A4's 20% Charmed Cloudstrider bonus only at or above half HP", () => {
    const highHp = createGamingDefinition(0, undefined, { ascensionPhase: 4 });
    const lowHp = createGamingDefinition(0, undefined, { ascensionPhase: 4 });
    const beforeA4 = createGamingDefinition(0, undefined, { ascensionPhase: 3 });
    const high = skillResult(highHp).totalDamage;
    const low = skillResult(lowHp, {}, lowHp.baseStats.hp * 0.49).totalDamage;
    const noPassive = skillResult(beforeA4).totalDamage;

    expect(high / noPassive).toBeCloseTo(1.2, 8);
    expect(low).toBeCloseTo(noPassive, 8);
    expect(GAMING_KIT_METADATA.a4PlungeDamageBonus).toBe(0.2);
  });

  it("applies C6's plunge crit-rate and crit-damage bonuses to actual damage", () => {
    const c0 = skillResult(createGamingDefinition(0), { critMode: "expected" }).totalDamage;
    const c6 = skillResult(createGamingDefinition(6), { critMode: "expected" }).totalDamage;

    expect(c6).toBeGreaterThan(c0);
  });

  it("keeps generated C3 and C5 talent boosts in the damage path", () => {
    expect(skillResult(createGamingDefinition(3)).totalDamage).toBeGreaterThan(
      skillResult(createGamingDefinition(0)).totalDamage,
    );
    const c0 = createGamingDefinition(0, { normal: 1, skill: 1, burst: 10 });
    const c5 = createGamingDefinition(5, { normal: 1, skill: 1, burst: 10 });
    const burst = (character: GenericCharacterDefinition) => simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [{ characterId: character.id, actionType: "burst" }],
      testEnemy,
      noCrit,
    ).totalDamage;
    expect(burst(c5)).toBeGreaterThan(burst(c0));
  });
});
