import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { SimulationConfig } from "@/types";
import {
  NEUVILLETTE_KIT_METADATA,
  createNeuvilletteDefinition,
} from "./neuvilletteDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: ReturnType<typeof createNeuvilletteDefinition>,
  actionType: "normal" | "charged" | "skill" | "burst",
  config: SimulationConfig = noCrit,
) {
  return simulateRotation(
    [character],
    [{ characterId: character.id, actionType }],
    testEnemy,
    config,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "neuvillette");
}

describe("Neuvillette runtime kit", () => {
  it("executes sourced HP-scaled skill and burst damage", () => {
    const character = createNeuvilletteDefinition();
    const result = simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [
        { characterId: character.id, actionType: "skill" },
        { characterId: character.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result)).toHaveLength(4);
    expect(damageEvents(result).every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("scales Equitable Judgment damage with supplied Past Draconic Glories stacks", () => {
    const base = damageEvents(run(createNeuvilletteDefinition(0, undefined, {}, { draconicGloriesStacks: 0 }), "charged"))[0]?.damage?.finalDamage ?? 0;
    const stacked = damageEvents(run(createNeuvilletteDefinition(0, undefined, {}, { draconicGloriesStacks: 3 }), "charged"))[0]?.damage?.finalDamage ?? 0;

    expect(stacked).toBeGreaterThan(base);
    expect(NEUVILLETTE_KIT_METADATA.a1ChargedHpRatioPerStack).toBe(0.28);
  });

  it("applies C2 charged-attack CRIT DMG through actual expected damage", () => {
    const c1 = createNeuvilletteDefinition(1, undefined, {}, { draconicGloriesStacks: 1 });
    const c2 = createNeuvilletteDefinition(2, undefined, {}, { draconicGloriesStacks: 1 });
    const forcedCrit = { critMode: "always" as const };
    const c1Damage = damageEvents(run(c1, "charged", forcedCrit))[0]?.damage?.finalDamage ?? 0;
    const c2Damage = damageEvents(run(c2, "charged", forcedCrit))[0]?.damage?.finalDamage ?? 0;

    expect(c2Damage).toBeGreaterThan(c1Damage);
    const baseCritMultiplier = 1 + c1.baseStats.critDmg;
    const expectedRatio = (baseCritMultiplier + NEUVILLETTE_KIT_METADATA.c2CritDmgPerStack) / baseCritMultiplier;
    expect(c2Damage / c1Damage).toBeCloseTo(expectedRatio, 8);
  });

  it("retains generated C3 normal and C5 burst talent boosts in actual damage", () => {
    const c0 = createNeuvilletteDefinition(0);
    const c3 = createNeuvilletteDefinition(3);
    const c5 = createNeuvilletteDefinition(5);
    const burst = (character: ReturnType<typeof createNeuvilletteDefinition>) => ({
      ...character,
      burst: { ...character.burst, energyCost: 0 },
    });

    expect(run(c3, "normal").totalDamage).toBeGreaterThan(run(c0, "normal").totalDamage);
    expect(run(burst(c5), "burst").totalDamage).toBeGreaterThan(run(burst(c0), "burst").totalDamage);
  });

  it("documents unsupported reaction and lifecycle channels fail-closed", () => {
    expect(NEUVILLETTE_KIT_METADATA.unsupportedChannels).toContain("a1ReactionTriggeredStackGeneration");
    expect(NEUVILLETTE_KIT_METADATA.unsupportedChannels).toContain("a4CurrentHpDependentHydroDamageBonus");
    expect(NEUVILLETTE_KIT_METADATA.unsupportedChannels).toContain("c4SourcewaterDropletGenerationFromHealing");
    expect(NEUVILLETTE_KIT_METADATA.unsupportedChannels).toContain("c6AdditionalEquitableJudgmentWaterfallsAndStackConsumption");
  });
});
