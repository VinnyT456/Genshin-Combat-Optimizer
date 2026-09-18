import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { testPyro } from "@/game-data/characters/testPyro";
import { simulateRotation } from "@/simulation/engine";
import { FURINA_KIT_METADATA, createFurinaDefinition } from "./furinaDefinition";

const noCrit = { critMode: "never" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage");
}

function runFurina(
  furinaDefinition: ReturnType<typeof createFurinaDefinition>,
  actions: { actionType: "skill" | "burst" | "normal" }[],
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
    expect(damageEvents(result).length).toBe(1);
    expect(damageEvents(result).every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("keeps Salon Member attacks as timed field effects", () => {
    const result = runFurina(createFurinaDefinition(0), [
      { actionType: "skill" },
      ...Array.from({ length: 10 }, () => ({ actionType: "normal" as const })),
    ]);
    const members = damageEvents(result).filter((event) => event.damage?.abilityId.startsWith("furina-salon-"));
    expect(members.length).toBeGreaterThan(0);
    expect(members.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A4 Salon damage conversion only above 30,000 Max HP and caps it", () => {
    const baseline = runFurina(createFurinaDefinition(0, undefined, {
      baseStats: { ...furinaBaseStats(), hp: 30_000 },
    }), [
      { actionType: "skill" },
      ...Array.from({ length: 10 }, () => ({ actionType: "normal" as const })),
    ]);
    const boosted = runFurina(createFurinaDefinition(0, undefined, {
      baseStats: { ...furinaBaseStats(), hp: 70_000 },
    }), [
      { actionType: "skill" },
      ...Array.from({ length: 10 }, () => ({ actionType: "normal" as const })),
    ]);

    const baselineDamage = damageEvents(baseline).find((event) => event.damage?.abilityId === "furina-salon-usher")?.damage?.finalDamage ?? 0;
    const boostedDamage = damageEvents(boosted).find((event) => event.damage?.abilityId === "furina-salon-usher")?.damage?.finalDamage ?? 0;
    // The sourced skill multiplier is Max-HP scaling, so normalize that
    // independent HP increase before asserting the A4 damage multiplier. The
    // field hit also has the one-member party-HP bonus, so the expected ratio
    // is (1 + 0.2 + 0.28) / (1 + 0.2).
    expect((boostedDamage / 70_000) / (baselineDamage / 30_000)).toBeCloseTo(1.48 / 1.2, 8);
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
    expect(c1Skill).toBeGreaterThan(c0Skill);
    expect(FURINA_KIT_METADATA.c1InitialFanfare).toBe(150);
    expect(c1.at(-1)?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("applies C1's initial Fanfare to the Burst hit itself", () => {
    const c0Burst = damageEvents(runFurina(createFurinaDefinition(0), [{ actionType: "burst" }]))[0];
    const c1Burst = damageEvents(runFurina(createFurinaDefinition(1), [{ actionType: "burst" }]))[0];
    expect(c1Burst?.damage?.finalDamage).toBeGreaterThan(c0Burst?.damage?.finalDamage ?? 0);
  });

  it("preserves the generated C3 burst talent boost in the overlay", () => {
    const c3 = createFurinaDefinition(3);
    expect(c3.constellations.find((constellation) => constellation.id === "furina-c3")?.buffs)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ talentLevelModifiers: [{ slot: "burst", levels: 3 }] }),
      ]));
  });

  it("tracks C2 Fanfare from Salon HP changes", () => {
    const furina = createFurinaDefinition(2);
    const result = simulateRotation(
      [
        { ...furina, burst: { ...furina.burst, energyCost: 0 } },
        testPyro,
        { ...testPyro, id: "test-pyro-2" },
        { ...testPyro, id: "test-pyro-3" },
      ],
      [
        { characterId: "furina", actionType: "burst" as const },
        { characterId: "furina", actionType: "skill" as const },
        ...Array.from({ length: 40 }, () => ({ characterId: "furina", actionType: "normal" as const })),
      ],
      testEnemy,
      noCrit,
    );
    const fanfare = result.finalState.characters.furina?.resources?.["furina-fanfare"]?.value ?? 0;
    expect(fanfare).toBeGreaterThan(FURINA_KIT_METADATA.c1InitialFanfare);
    expect(createFurinaDefinition(2).resources.find((resource) => resource.id === "furina-fanfare")?.max).toBe(400);
    expect(createFurinaDefinition(2).resources.find((resource) => resource.id === "furina-c2-excess-fanfare")?.max)
      .toBe(FURINA_KIT_METADATA.c2MaxHpFanfareCap);
    expect(result.finalState.characters.furina?.resources?.["furina-c2-excess-fanfare"]?.value ?? 0).toBeGreaterThan(0);
  });

  it("models Pneuma as a non-damaging Singer with active-character healing", () => {
    const definition = createFurinaDefinition(0, undefined, {}, "pneuma");
    expect(definition.skill.instances).toHaveLength(0);
    expect(definition.skill.healing).toHaveLength(1);
    expect(definition.skill.triggers).toHaveLength(0);
    expect(definition.skill.healing?.[0]?.durationSeconds).toBe(30);
  });

  it("restores Furina's C4 energy on the shared Salon cadence", () => {
    const result = runFurina(createFurinaDefinition(4), [
      { actionType: "skill" },
      ...Array.from({ length: 12 }, () => ({ actionType: "normal" as const })),
    ]);
    const energyEvents = result.timeline.filter(
      (event) => event.type === "energy" && event.description.includes("Furina C4 energy"),
    );
    expect(energyEvents.length).toBeGreaterThan(0);
    expect(result.finalState.characters.furina?.energy.current ?? 0).toBeGreaterThan(0);
  });

  it("applies C6's non-overridable Hydro infusion and HP-based attack bonus", () => {
    const c0 = damageEvents(runFurina(createFurinaDefinition(0), [
      { actionType: "skill" },
      { actionType: "normal" },
    ]));
    const c6 = damageEvents(runFurina(createFurinaDefinition(6), [
      { actionType: "skill" },
      { actionType: "normal" },
    ]));
    const c0Normal = c0.at(-1)?.damage;
    const c6Normal = c6.at(-1)?.damage;
    expect(c0Normal?.element).toBe("physical");
    expect(c6Normal?.element).toBe("hydro");
    expect(c6Normal?.finalDamage ?? 0).toBeGreaterThan(c0Normal?.finalDamage ?? 0);
  });

  it("emits C6 Ousia healing from Furina's qualifying attacks", () => {
    const result = runFurina(createFurinaDefinition(6), [
      { actionType: "skill" },
      ...Array.from({ length: 10 }, () => ({ actionType: "normal" as const })),
    ]);
    const healing = result.timeline.filter(
      (event) => event.type === "healing" && event.healing?.sourceCharacterId === "furina",
    );
    expect(healing.length).toBeGreaterThan(0);
  });
});

function furinaBaseStats() {
  return createFurinaDefinition(0).baseStats;
}
