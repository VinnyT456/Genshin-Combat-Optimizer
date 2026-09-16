import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createAlyoshaDefinition } from "./alyoshaDefinition";

const noCrit = { critMode: "never" as const };

function damageFor(
  character: ReturnType<typeof createAlyoshaDefinition>,
  actionType: "skill" | "burst",
): number {
  const result = simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
  const event = result.timeline.find(
    (entry) => entry.type === "damage" && entry.characterId === character.id &&
      entry.damage?.damageType === actionType,
  );
  if (event?.type !== "damage" || event.damage === undefined) {
    throw new Error(`No ${actionType} damage event for Alyosha`);
  }
  return event.damage.finalDamage;
}

describe("Alyosha runtime kit", () => {
  it("executes the sourced baseline skill and burst damage", () => {
    expect(damageFor(createAlyoshaDefinition(), "skill")).toBeGreaterThan(0);
    expect(damageFor(createAlyoshaDefinition(), "burst")).toBeGreaterThan(0);
  });

  it("applies A4 Energy Recharge scaling only to Skill and Burst damage", () => {
    const beforeA4 = createAlyoshaDefinition(0, undefined, { ascensionPhase: 3 });
    const afterA4 = createAlyoshaDefinition(0, undefined, { ascensionPhase: 4 });
    expect(damageFor(afterA4, "skill")).toBeGreaterThan(damageFor(beforeA4, "skill"));
    expect(damageFor(afterA4, "burst")).toBeGreaterThan(damageFor(beforeA4, "burst"));
  });

  it("caps A4 at the sourced 70% DMG increase", () => {
    const capped = createAlyoshaDefinition(0, undefined, {
      baseStats: { ...alyoshaBaseStats(), energyRecharge: 4 },
    });
    const overCap = createAlyoshaDefinition(0, undefined, {
      baseStats: { ...alyoshaBaseStats(), energyRecharge: 8 },
    });
    expect(damageFor(capped, "skill")).toBe(damageFor(overCap, "skill"));
  });

  it("applies the generated C3 and C5 talent-level boosts through damage", () => {
    const c0 = createAlyoshaDefinition();
    expect(damageFor(createAlyoshaDefinition(3), "skill")).toBeGreaterThan(damageFor(c0, "skill"));
    expect(damageFor(createAlyoshaDefinition(5), "burst")).toBeGreaterThan(damageFor(c0, "burst"));
  });
});

function alyoshaBaseStats() {
  return createAlyoshaDefinition().baseStats;
}

