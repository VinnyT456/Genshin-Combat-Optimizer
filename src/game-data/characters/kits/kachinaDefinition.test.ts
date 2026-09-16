import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { CharacterSnapshot, SimulationSnapshot } from "@/types";
import { KACHINA_KIT_METADATA, createKachinaDefinition } from "./kachinaDefinition";

function snapshot(character: ReturnType<typeof createKachinaDefinition>): SimulationSnapshot {
  const entry: CharacterSnapshot = {
    characterId: character.id,
    energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
    cooldowns: {},
    normalStringIndex: 0,
  };
  return { time: 0, activeCharacterId: character.id, characters: { [character.id]: entry } };
}

function run(
  character: ReturnType<typeof createKachinaDefinition>,
  actionTypes: ("skill" | "burst")[],
) {
  return simulateRotation(
    [character],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    { critMode: "never", resumeFrom: snapshot(character) },
  );
}

function lastDamage(result: ReturnType<typeof simulateRotation>): number {
  const event = result.timeline.filter((entry) => entry.type === "damage").at(-1);
  if (event?.type !== "damage" || event.damage === undefined) throw new Error("expected damage event");
  return event.damage.finalDamage;
}

describe("Kachina runtime kit", () => {
  it("executes baseline Turbo Twirly Skill and DEF-scaling Burst damage", () => {
    const result = run(createKachinaDefinition(), ["skill", "burst"]);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(3);
  });

  it("adds A4's 20% DEF scaling to Turbo Twirly only after ascension 4", () => {
    const a4 = run(createKachinaDefinition(0, undefined, { ascensionPhase: 4 }), ["skill"]).totalDamage;
    const locked = run(createKachinaDefinition(0, undefined, { ascensionPhase: 3 }), ["skill"]).totalDamage;

    expect(a4).toBeGreaterThan(locked);
    expect(KACHINA_KIT_METADATA.a4TurboTwirlyDefRatio).toBe(0.2);
  });

  it("applies C4's explicit Turbo Drill Field DEF bonus to a later hit", () => {
    const c3 = lastDamage(run(createKachinaDefinition(3), ["burst", "skill"]));
    const c4 = lastDamage(run(createKachinaDefinition(4, undefined, {}, { turboDrillFieldOpponents: 4 }), ["burst", "skill"]));

    expect(c4).toBeGreaterThan(c3);
    expect(KACHINA_KIT_METADATA.c4DefBonusByFieldOpponents[4]).toBe(0.2);
  });

  it("keeps C4 inert without explicit Turbo Drill Field state and preserves C3/C5 talent boosts", () => {
    expect(lastDamage(run(createKachinaDefinition(4), ["burst", "skill"])))
      .toBe(lastDamage(run(createKachinaDefinition(3), ["burst", "skill"])));
    expect(run(createKachinaDefinition(3), ["skill"]).totalDamage)
      .toBeGreaterThan(run(createKachinaDefinition(0), ["skill"]).totalDamage);
    expect(run(createKachinaDefinition(5), ["burst"]).totalDamage)
      .toBeGreaterThan(run(createKachinaDefinition(0), ["burst"]).totalDamage);
  });
});
