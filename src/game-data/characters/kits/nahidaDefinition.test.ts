import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import { NAHIDA_KIT_METADATA, createNahidaDefinition } from "./nahidaDefinition";

const noCrit = { critMode: "never" as const };

function runNahida(
  character: ReturnType<typeof createNahidaDefinition>,
  actions: Array<"skill" | "normal" | "charged">,
  config = noCrit,
) {
  return simulateRotation(
    [character],
    actions.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    config,
  );
}

describe("Nahida runtime kit", () => {
  it("executes the sourced tap/hold skill damage and post-skill Tri-Karma window", () => {
    const nahida = createNahidaDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const result = runNahida(nahida, ["skill", "normal"]);
    const damage = result.timeline.filter((event) => event.type === "damage");

    expect(damage.length).toBeGreaterThanOrEqual(3);
    expect(damage.some((event) => event.damage?.abilityId === "nahida-tri-karma-purification")).toBe(true);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies A4 EM scaling to actual Tri-Karma damage only after its ascension unlock", () => {
    const lowEm = createNahidaDefinition(0, undefined, { baseStats: { ...createNahidaDefinition().baseStats, elementalMastery: 200 } });
    const highEm = createNahidaDefinition(0, undefined, { baseStats: { ...createNahidaDefinition().baseStats, elementalMastery: 1000 } });
    const locked = createNahidaDefinition(0, undefined, { ascensionPhase: 0, baseStats: { ...highEm.baseStats } });

    expect(runNahida(highEm, ["skill", "normal"]).totalDamage).toBeGreaterThan(runNahida(lowEm, ["skill", "normal"]).totalDamage);
    expect(runNahida(locked, ["skill", "normal"]).totalDamage).toBeLessThan(runNahida(highEm, ["skill", "normal"]).totalDamage);
  });

  it("adds C6 Karmic Oblivion damage with the authored EM/ATK scaling", () => {
    const c0 = createNahidaDefinition(0);
    const c6 = createNahidaDefinition(6);
    const c0Result = runNahida(c0, ["skill", "normal"]);
    const c6Result = runNahida(c6, ["skill", "normal"]);
    const c6Hits = c6Result.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId === "nahida-tri-karma-purification",
    );

    expect(c6Hits.length).toBeGreaterThan(0);
    expect(c6Result.totalDamage).toBeGreaterThan(c0Result.totalDamage);
    expect(NAHIDA_KIT_METADATA.c6MaxProcs).toBe(6);
  });

  it("retains generated C3 skill talent levels as real damage output", () => {
    const c0 = runNahida(createNahidaDefinition(0), ["skill"]);
    const c3 = runNahida(createNahidaDefinition(3), ["skill"]);
    expect(c3.totalDamage).toBeGreaterThan(c0.totalDamage);
  });
});
