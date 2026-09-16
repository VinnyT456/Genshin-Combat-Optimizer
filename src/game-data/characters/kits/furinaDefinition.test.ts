import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { FURINA_KIT_METADATA, createFurinaDefinition } from "./furinaDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage");
}

function runFurina(
  furinaDefinition: ReturnType<typeof createFurinaDefinition>,
  actions: { actionType: "skill" | "burst" }[],
) {
  return simulateRotation(
    [{ ...furinaDefinition, burst: { ...furinaDefinition.burst, energyCost: 0 } }],
    actions.map((action) => ({ characterId: "furina", ...action })),
    testEnemy,
    noCrit,
  );
}

describe("Furina runtime kit", () => {
  it("executes the sourced HP-scaling Salon skill damage", () => {
    const result = runFurina(createFurinaDefinition(0), [{ actionType: "skill" }]);

    expect(result.errors).toHaveLength(0);
    expect(damageEvents(result).length).toBe(4);
    expect(damageEvents(result).every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A4 Salon damage conversion only above 30,000 Max HP and caps it", () => {
    const baseline = runFurina(createFurinaDefinition(0, undefined, {
      baseStats: { ...furinaBaseStats(), hp: 30_000 },
    }), [{ actionType: "skill" }]);
    const boosted = runFurina(createFurinaDefinition(0, undefined, {
      baseStats: { ...furinaBaseStats(), hp: 70_000 },
    }), [{ actionType: "skill" }]);

    const baselineDamage = damageEvents(baseline)[0]?.damage?.finalDamage ?? 0;
    const boostedDamage = damageEvents(boosted)[0]?.damage?.finalDamage ?? 0;
    // The sourced skill multiplier is Max-HP scaling, so normalize that
    // independent HP increase before asserting the A4 damage multiplier.
    expect((boostedDamage / 70_000) / (baselineDamage / 30_000)).toBeCloseTo(1.28, 8);
    expect(FURINA_KIT_METADATA.a4MaximumDamageBonus).toBe(0.28);
  });

  it("turns C1's initial Fanfare into a later party damage bonus", () => {
    const c0 = damageEvents(runFurina(createFurinaDefinition(0), [
      { actionType: "burst" }, { actionType: "skill" },
    ]));
    const c1 = damageEvents(runFurina(createFurinaDefinition(1), [
      { actionType: "burst" }, { actionType: "skill" },
    ]));

    const c0Skill = c0.at(-1)?.damage?.finalDamage ?? 0;
    const c1Skill = c1.at(-1)?.damage?.finalDamage ?? 0;
    expect(c1Skill / c0Skill).toBeCloseTo(1.375, 8);
    expect(FURINA_KIT_METADATA.c1InitialFanfare).toBe(150);
  });

  it("preserves the generated C3 burst talent boost in the overlay", () => {
    const c3 = createFurinaDefinition(3);
    expect(c3.constellations.find((constellation) => constellation.id === "furina-c3")?.buffs)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ talentLevelModifiers: [{ slot: "burst", levels: 3 }] }),
      ]));
  });
});

function furinaBaseStats() {
  return createFurinaDefinition(0).baseStats;
}
