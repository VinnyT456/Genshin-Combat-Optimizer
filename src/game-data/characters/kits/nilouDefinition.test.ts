import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  NILOU_KIT_METADATA,
  createNilouDefinition,
} from "./nilouDefinition";

function run(
  character: ReturnType<typeof createNilouDefinition>,
  actionType: "skill" | "burst",
  critMode: "never" | "always" = "never",
) {
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    { critMode },
  );
}

describe("Nilou runtime kit", () => {
  it("executes the sourced HP-scaled skill and burst damage rows", () => {
    const skill = run(createNilouDefinition(), "skill");
    const burst = run(createNilouDefinition(), "burst");

    expect(skill.totalDamage).toBeGreaterThan(0);
    expect(burst.totalDamage).toBeGreaterThan(0);
    expect(skill.timeline.filter((event) => event.type === "damage")).toHaveLength(7);
    expect(burst.timeline.filter((event) => event.type === "damage")).toHaveLength(2);
  });

  it("applies C1's 65% multiplier only to Luminous Illusion", () => {
    const c0 = run(createNilouDefinition(0), "skill");
    const c1 = run(createNilouDefinition(1), "skill");
    const c0Events = c0.timeline.filter((event) => event.type === "damage");
    const c1Events = c1.timeline.filter((event) => event.type === "damage");

    expect(c1.totalDamage).toBeGreaterThan(c0.totalDamage);
    expect(c1Events).toHaveLength(c0Events.length);
    expect(c1Events[5]?.damage?.finalDamage).toBeCloseTo(
      (c0Events[5]?.damage?.finalDamage ?? 0) * NILOU_KIT_METADATA.c1LuminousIllusionMultiplier,
      8,
    );
    expect(c1Events[0]?.damage?.finalDamage).toBe(c0Events[0]?.damage?.finalDamage);
  });

  it("applies C6 HP-derived CRIT stats in actual burst damage", () => {
    const baseStats = createNilouDefinition().baseStats;
    const highHp = { ...baseStats, hp: 80_000 };
    const c5 = createNilouDefinition(5, undefined, { baseStats: highHp });
    const c6 = createNilouDefinition(6, undefined, { baseStats: highHp });
    const c5Damage = run(c5, "burst", "always").totalDamage;
    const c6Damage = run(c6, "burst", "always").totalDamage;
    const steps = Math.floor((highHp.hp - 30_000) / 1_000);
    const expectedRatio =
      (1 + baseStats.critDmg + steps * NILOU_KIT_METADATA.c6CritDmgPerHpStep)
      / (1 + baseStats.critDmg);

    expect(c6Damage).toBeGreaterThan(c5Damage);
    expect(c6Damage / c5Damage).toBeCloseTo(expectedRatio, 8);
  });

  it("retains generated C3 burst and C5 skill talent boosts", () => {
    expect(run(createNilouDefinition(3), "burst").totalDamage)
      .toBeGreaterThan(run(createNilouDefinition(0), "burst").totalDamage);
    expect(run(createNilouDefinition(5), "skill").totalDamage)
      .toBeGreaterThan(run(createNilouDefinition(0), "skill").totalDamage);
  });

  it("documents unsupported party, reaction, and lifecycle channels", () => {
    expect(NILOU_KIT_METADATA.unsupportedChannels).toContain(
      "a1GoldenChalicesBountyPartyCompositionAndBountifulCoreConversion",
    );
    expect(NILOU_KIT_METADATA.unsupportedChannels).toContain(
      "c4ThirdDanceStepHitEnergyAndBurstDamageWindow",
    );
    expect(createNilouDefinition().resources).toEqual([]);
  });
});
