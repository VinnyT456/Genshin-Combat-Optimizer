import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { talentValueAt } from "@/simulation/character/talent";
import {
  LISA_KIT_METADATA,
  createLisaDefinition,
} from "./lisaDefinition";

const noCrit = { critMode: "never" as const };

function damage(
  character: ReturnType<typeof createLisaDefinition>,
  actionType: "skill" | "burst",
): number {
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [ready],
    [{ characterId: ready.id, actionType }],
    testEnemy,
    noCrit,
  ).totalDamage;
}

describe("Lisa runtime kit", () => {
  it("executes the generated skill and burst damage rows", () => {
    const character = createLisaDefinition();

    expect(damage(character, "skill")).toBeGreaterThan(0);
    expect(damage(character, "burst")).toBeGreaterThan(0);
  });

  it("applies C3's burst talent boost to actual burst damage", () => {
    const c0 = createLisaDefinition(0);
    const c3 = createLisaDefinition(3);

    expect(damage(c3, "burst")).toBeGreaterThan(damage(c0, "burst"));
    expect(LISA_KIT_METADATA.c3BurstTalentLevels).toBe(3);
  });

  it("applies C5's skill talent boost to actual skill damage", () => {
    const c0 = createLisaDefinition(0);
    const c5 = createLisaDefinition(5);

    expect(damage(c5, "skill")).toBeGreaterThan(damage(c0, "skill"));
    expect(LISA_KIT_METADATA.c5SkillTalentLevels).toBe(3);
  });

  it("retains distinct sourced hold-skill conductive-stack damage rows", () => {
    const skillInstances = createLisaDefinition().skill.instances;
    const noStacks = skillInstances.find((instance) => instance.id === "lisa-skill-2");
    const fullStacks = skillInstances.find((instance) => instance.id === "lisa-skill-5");

    expect(talentValueAt(noStacks!.scaling[0]!.table, 10)).toBeLessThan(
      talentValueAt(fullStacks!.scaling[0]!.table, 10),
    );
    expect(LISA_KIT_METADATA.unsupportedChannels).toContain("a1ChargedAttackConductiveStatus");
  });
});
