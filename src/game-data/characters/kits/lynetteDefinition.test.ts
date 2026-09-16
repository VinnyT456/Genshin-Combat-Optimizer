import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { LYNETTE_KIT_METADATA, createLynetteDefinition } from "./lynetteDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: ReturnType<typeof createLynetteDefinition>,
  actionType: "skill" | "burst" | "normal",
) {
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation([ready], [{ characterId: ready.id, actionType }], testEnemy, noCrit);
}

describe("Lynette runtime kit", () => {
  it("executes generated skill and burst damage", () => {
    expect(run(createLynetteDefinition(), "skill").totalDamage).toBeGreaterThan(0);
    expect(run(createLynetteDefinition(), "burst").totalDamage).toBeGreaterThan(0);
  });

  it("retains generated C3 burst and C5 skill talent boosts in damage", () => {
    expect(run(createLynetteDefinition(3), "burst").totalDamage)
      .toBeGreaterThan(run(createLynetteDefinition(0), "burst").totalDamage);
    expect(run(createLynetteDefinition(5), "skill").totalDamage)
      .toBeGreaterThan(run(createLynetteDefinition(0), "skill").totalDamage);
  });

  it("applies C6 Anemo infusion and bonus to a normal attack after Skill", () => {
    const c0 = createLynetteDefinition(0);
    const c6 = createLynetteDefinition(6);
    const c0Result = simulateRotation([c0], [
      { characterId: c0.id, actionType: "skill" },
      { characterId: c0.id, actionType: "normal" },
    ], testEnemy, noCrit);
    const c6Result = simulateRotation([c6], [
      { characterId: c6.id, actionType: "skill" },
      { characterId: c6.id, actionType: "normal" },
    ], testEnemy, noCrit);
    const normal = c6Result.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "normal");
    const c0Normal = c0Result.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "normal");

    expect(normal?.damage?.element).toBe("anemo");
    expect(normal?.damage?.finalDamage).toBeGreaterThan(c0Normal?.damage?.finalDamage ?? 0);
  });

  it("documents unsupported conditional and utility channels", () => {
    expect(LYNETTE_KIT_METADATA.unsupportedChannels).toContain("a1PartyElementCountAtkBonus");
    expect(LYNETTE_KIT_METADATA.unsupportedChannels).toContain("c2AdditionalVividShot");
  });
});
