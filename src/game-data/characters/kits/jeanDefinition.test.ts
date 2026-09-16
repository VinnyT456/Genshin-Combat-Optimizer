import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createJeanDefinition } from "./jeanDefinition";

function firstDamage(result: ReturnType<typeof simulateRotation>) {
  const event = result.timeline.find((entry) => entry.type === "damage");
  if (event?.damage === undefined) throw new Error("expected damage event");
  return event.damage;
}

describe("Jean runtime kit", () => {
  it("executes sourced skill and burst damage", () => {
    const jean = createJeanDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const result = simulateRotation(
      [{ ...jean, burst: { ...jean.burst, energyCost: 0 } }],
      [
        { characterId: jean.id, actionType: "skill" },
        { characterId: jean.id, actionType: "burst" },
      ],
      testEnemy,
      { critMode: "never" },
    );

    expect(result.errors).toHaveLength(0);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(3);
  });

  it("applies C3's sourced burst talent boost to actual burst damage", () => {
    const c0 = createJeanDefinition(0, { normal: 1, skill: 1, burst: 10 });
    const c3 = createJeanDefinition(3, { normal: 1, skill: 1, burst: 10 });
    const c0Damage = firstDamage(simulateRotation(
      [{ ...c0, burst: { ...c0.burst, energyCost: 0 } }],
      [{ characterId: c0.id, actionType: "burst" }],
      testEnemy,
      { critMode: "never" },
    ));
    const c3Damage = firstDamage(simulateRotation(
      [{ ...c3, burst: { ...c3.burst, energyCost: 0 } }],
      [{ characterId: c3.id, actionType: "burst" }],
      testEnemy,
      { critMode: "never" },
    ));

    expect(c3Damage.finalDamage).toBeGreaterThan(c0Damage.finalDamage);
  });

  it("applies C5's sourced skill talent boost to actual skill damage", () => {
    const c0 = createJeanDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const c5 = createJeanDefinition(5, { normal: 1, skill: 10, burst: 1 });
    const c0Damage = firstDamage(simulateRotation(
      [c0],
      [{ characterId: c0.id, actionType: "skill" }],
      testEnemy,
      { critMode: "never" },
    ));
    const c5Damage = firstDamage(simulateRotation(
      [c5],
      [{ characterId: c5.id, actionType: "skill" }],
      testEnemy,
      { critMode: "never" },
    ));

    expect(c5Damage.finalDamage).toBeGreaterThan(c0Damage.finalDamage);
  });

  it("applies C4's finite Dandelion Field Anemo RES shred after the burst", () => {
    const c0 = createJeanDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c4 = createJeanDefinition(4, { normal: 1, skill: 1, burst: 1 });
    const c0Ready = { ...c0, burst: { ...c0.burst, energyCost: 0 } };
    const c4Ready = { ...c4, burst: { ...c4.burst, energyCost: 0 } };
    const c0Result = simulateRotation(
      [c0Ready],
      [
        { characterId: c0.id, actionType: "burst" },
        { characterId: c0.id, actionType: "skill" },
      ],
      testEnemy,
      { critMode: "never" },
    );
    const c0Skill = c0Result.timeline.find(
      (event) => event.type === "damage" && event.damage?.abilityId === "jean-skill",
    )?.damage;
    const c4Result = simulateRotation(
      [c4Ready],
      [
        { characterId: c4.id, actionType: "burst" },
        { characterId: c4.id, actionType: "skill" },
      ],
      testEnemy,
      { critMode: "never" },
    );
    const c4Skill = c4Result.timeline.find(
      (event) => event.type === "damage" && event.damage?.abilityId === "jean-skill",
    )?.damage;

    expect(c4Skill?.finalDamage).toBeGreaterThan(c0Skill?.finalDamage ?? 0);
  });

  it("keeps unsupported ascension/passive channels damage-neutral", () => {
    const locked = createJeanDefinition(0, { normal: 10, skill: 1, burst: 1 }, { ascensionPhase: 0 });
    const unlocked = createJeanDefinition(0, { normal: 10, skill: 1, burst: 1 }, { ascensionPhase: 6 });
    const rotation = [{ characterId: locked.id, actionType: "normal" as const }];
    const lockedDamage = firstDamage(simulateRotation([locked], rotation, testEnemy, { critMode: "never" }));
    const unlockedDamage = firstDamage(simulateRotation([unlocked], rotation, testEnemy, { critMode: "never" }));

    expect(unlockedDamage.finalDamage).toBe(lockedDamage.finalDamage);
  });
});
