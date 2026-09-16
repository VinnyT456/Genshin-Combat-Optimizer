import { describe, expect, it } from "vitest";
import { findCharacter, testEnemy, toLegacyCharacterDefinition } from "@/game-data";
import { toEngineCharacter } from "@/features/simulation/simulationAdapter";
import { simulateRotation } from "@/simulation/engine";
import { DAHLIA_KIT_METADATA, createDahliaDefinition } from "./dahliaDefinition";

const noCrit = { critMode: "never" as const };

function damageFor(
  character: ReturnType<typeof createDahliaDefinition>,
  actionType: "skill" | "burst",
): number {
  const result = simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
  const event = result.timeline.find(
    (entry) => entry.type === "damage" && entry.characterId === character.id,
  );
  if (event?.type !== "damage" || event.damage === undefined) {
    throw new Error(`No Dahlia ${actionType} damage event`);
  }
  return event.damage.finalDamage;
}

describe("Dahlia runtime kit", () => {
  it("executes sourced skill and burst damage", () => {
    expect(damageFor(createDahliaDefinition(), "skill")).toBeGreaterThan(0);
    expect(damageFor(createDahliaDefinition(), "burst")).toBeGreaterThan(0);
  });

  it("resolves sourced per-level skill and burst scaling", () => {
    const levelOne = createDahliaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const levelTen = createDahliaDefinition(0, { normal: 10, skill: 10, burst: 10 });
    expect(damageFor(levelTen, "skill")).toBeGreaterThan(damageFor(levelOne, "skill"));
    expect(damageFor(levelTen, "burst")).toBeGreaterThan(damageFor(levelOne, "burst"));
  });

  it("applies C3 burst and C5 skill talent boosts through damage resolution", () => {
    const c0 = createDahliaDefinition(0);
    const c3 = createDahliaDefinition(3);
    const c5 = createDahliaDefinition(5);

    expect(damageFor(c3, "burst")).toBeGreaterThan(damageFor(c0, "burst"));
    expect(damageFor(c5, "skill")).toBeGreaterThan(damageFor(c0, "skill"));
    expect(DAHLIA_KIT_METADATA.modelledPerks).toEqual([
      "c3BurstTalentLevel",
      "c5SkillTalentLevel",
    ]);
  });

  it("uses the runtime overlay when the website adapter receives Dahlia's legacy projection", () => {
    const rosterCharacter = findCharacter("dahlia");
    if (rosterCharacter === undefined) throw new Error("Dahlia is missing from the roster");
    const legacy = toLegacyCharacterDefinition(rosterCharacter);
    const adapted = toEngineCharacter(legacy);

    expect("normalAttacks" in adapted).toBe(true);
    expect(damageFor(adapted as ReturnType<typeof createDahliaDefinition>, "skill")).toBeGreaterThan(0);
  });
});
