import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import { createThomaDefinition, THOMA_KIT_METADATA } from "./thomaDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: ReturnType<typeof createThomaDefinition>,
  actionType: "normal" | "charged" | "skill" | "burst",
) {
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  );
}

describe("Thoma runtime kit", () => {
  it("executes sourced baseline Normal, Skill, and Burst damage", () => {
    for (const actionType of ["normal", "skill", "burst"] as const) {
      expect(run(createThomaDefinition(), actionType).totalDamage).toBeGreaterThan(0);
    }
  });

  it("adds A4 Max-HP scaling only to Fiery Collapse at Ascension 4", () => {
    const baseStats = createThomaDefinition().baseStats;
    const lowerAscension = createThomaDefinition(0, undefined, { ascensionPhase: 3 });
    const highHp = createThomaDefinition(0, undefined, {
      baseStats: { ...baseStats, hp: 30_000 },
    });
    const preA4HighHp = createThomaDefinition(0, undefined, {
      ascensionPhase: 3,
      baseStats: { ...baseStats, hp: 30_000 },
    });

    expect(run(highHp, "burst").totalDamage)
      .toBeGreaterThan(run(lowerAscension, "burst").totalDamage);
    expect(run(preA4HighHp, "burst").totalDamage)
      .toBe(run(lowerAscension, "burst").totalDamage);
    expect(run(highHp, "skill").totalDamage)
      .toBe(run(createThomaDefinition(0, undefined, { baseStats: { ...baseStats, hp: 10_000 } }), "skill").totalDamage);
    expect(THOMA_KIT_METADATA.a4FieryCollapseHpRatio).toBe(0.022);
  });

  it("increases actual Blazing Blessing damage at C3 via the generated talent boost", () => {
    expect(run(createThomaDefinition(3), "skill").totalDamage)
      .toBeGreaterThan(run(createThomaDefinition(0), "skill").totalDamage);
  });

  it("increases actual Crimson Ooyoroi damage at C5 via the generated talent boost", () => {
    expect(run(createThomaDefinition(5), "burst").totalDamage)
      .toBeGreaterThan(run(createThomaDefinition(0), "burst").totalDamage);
  });

  it("fails closed for shield-refresh-gated and other unsupported perk channels", () => {
    expect(THOMA_KIT_METADATA.unsupportedChannels)
      .toContain("c6BarrierRefreshNormalChargedPlungeDamageWindow");
    expect(run(createThomaDefinition(6), "normal").totalDamage)
      .toBe(run(createThomaDefinition(0), "normal").totalDamage);
  });
});
