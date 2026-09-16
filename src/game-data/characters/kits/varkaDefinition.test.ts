import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createVarkaDefinition, VARKA_KIT_METADATA } from "./varkaDefinition";

const noCrit = { critMode: "never" as const };

function run(constellationLevel: number, actionType: "normal" | "charged" | "plungeHigh" | "skill" | "burst") {
  const character = createVarkaDefinition(constellationLevel);
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [ready],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
}

function firstDamage(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.find((event) => event.type === "damage");
}

describe("Varka runtime kit", () => {
  it("simulates a physical normal hit with positive damage", () => {
    const hit = firstDamage(run(0, "normal"));

    expect(hit?.damage?.damageType).toBe("normal");
    expect(hit?.damage?.element).toBe("physical");
    expect(hit?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("simulates sourced Anemo skill damage with positive damage", () => {
    const hit = firstDamage(run(0, "skill"));

    expect(hit?.damage?.damageType).toBe("skill");
    expect(hit?.damage?.element).toBe("anemo");
    expect(hit?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("simulates sourced Anemo burst damage with positive damage", () => {
    const hit = firstDamage(run(0, "burst"));

    expect(hit?.damage?.damageType).toBe("burst");
    expect(hit?.damage?.element).toBe("anemo");
    expect(hit?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("keeps generated unverified perk effects inert across constellation levels", () => {
    const damage = (level: number, action: "normal" | "skill" | "burst") =>
      firstDamage(run(level, action))?.damage?.finalDamage;

    expect(damage(6, "normal")).toBe(damage(0, "normal"));
    expect(damage(3, "skill")).toBe(damage(0, "skill"));
    expect(damage(5, "burst")).toBe(damage(0, "burst"));
    expect(VARKA_KIT_METADATA.unsupportedChannels).toContain("c3SkillTalentBoostUnverified");
    expect(VARKA_KIT_METADATA.unsupportedChannels).toContain("c5BurstTalentBoostUnverified");
  });
});
