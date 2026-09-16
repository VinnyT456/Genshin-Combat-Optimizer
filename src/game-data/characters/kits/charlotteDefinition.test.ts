import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createCharlotteDefinition } from "./charlotteDefinition";

function firstDamage(result: ReturnType<typeof simulateRotation>) {
  const event = result.timeline.find((entry) => entry.type === "damage");
  if (event?.damage === undefined) throw new Error("expected damage event");
  return event.damage;
}

describe("Charlotte runtime kit", () => {
  it("executes the sourced baseline skill damage", () => {
    const charlotte = createCharlotteDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const damage = firstDamage(
      simulateRotation([charlotte], [{ characterId: charlotte.id, actionType: "skill" }], testEnemy),
    );
    expect(damage.rawDamage).toBeGreaterThan(0);
    expect(damage.element).toBe("cryo");
  });

  it("applies A4 Cryo DMG bonus from explicit non-Fontainian party count", () => {
    const base = createCharlotteDefinition(0, { normal: 1, skill: 1, burst: 1 }, {}, { nonFontainianCount: 0 });
    const buffed = createCharlotteDefinition(0, { normal: 1, skill: 1, burst: 1 }, {}, { nonFontainianCount: 3 });
    const rotation = [{ characterId: base.id, actionType: "skill" as const }];
    const baseDamage = firstDamage(simulateRotation([base], rotation, testEnemy));
    const buffedDamage = firstDamage(
      simulateRotation([buffed], [{ characterId: buffed.id, actionType: "skill" }], testEnemy),
    );
    expect(buffedDamage.finalDamage).toBeGreaterThan(baseDamage.finalDamage);
  });

  it("keeps A4 locked before ascension 4", () => {
    const locked = createCharlotteDefinition(
      0,
      { normal: 1, skill: 1, burst: 1 },
      { ascensionPhase: 3 },
      { nonFontainianCount: 3 },
    );
    const unlocked = createCharlotteDefinition(
      0,
      { normal: 1, skill: 1, burst: 1 },
      { ascensionPhase: 4 },
      { nonFontainianCount: 3 },
    );
    const lockedDamage = firstDamage(simulateRotation([locked], [{ characterId: locked.id, actionType: "skill" }], testEnemy));
    const unlockedDamage = firstDamage(simulateRotation([unlocked], [{ characterId: unlocked.id, actionType: "skill" }], testEnemy));
    expect(unlockedDamage.finalDamage).toBeGreaterThan(lockedDamage.finalDamage);
  });

  it("raises burst damage through the sourced C3 burst talent boost", () => {
    const c0 = createCharlotteDefinition(0, { normal: 1, skill: 1, burst: 10 });
    const c3 = createCharlotteDefinition(3, { normal: 1, skill: 1, burst: 10 });
    const c0Ready = { ...c0, burst: { ...c0.burst, energyCost: 0 } };
    const c3Ready = { ...c3, burst: { ...c3.burst, energyCost: 0 } };
    const c0Damage = firstDamage(simulateRotation([c0Ready], [{ characterId: c0.id, actionType: "burst" }], testEnemy));
    const c3Damage = firstDamage(simulateRotation([c3Ready], [{ characterId: c3.id, actionType: "burst" }], testEnemy));
    expect(c3Damage.finalDamage).toBeGreaterThan(c0Damage.finalDamage);
  });

  it("raises skill damage through the sourced C5 skill talent boost", () => {
    const c0 = createCharlotteDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const c5 = createCharlotteDefinition(5, { normal: 1, skill: 10, burst: 1 });
    const c0Damage = firstDamage(simulateRotation([c0], [{ characterId: c0.id, actionType: "skill" }], testEnemy));
    const c5Damage = firstDamage(simulateRotation([c5], [{ characterId: c5.id, actionType: "skill" }], testEnemy));
    expect(c5Damage.finalDamage).toBeGreaterThan(c0Damage.finalDamage);
  });
});
