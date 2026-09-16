import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { LAN_YAN_KIT_METADATA, createLanYanDefinition } from "./lanYanDefinition";

const noCrit = { critMode: "never" as const };

function run(character: ReturnType<typeof createLanYanDefinition>, actionTypes: ("skill" | "burst")[]) {
  const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
  return simulateRotation(
    [ready],
    actionTypes.map((actionType) => ({ characterId: ready.id, actionType })),
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage");
}

describe("Lan Yan runtime kit", () => {
  it("executes the generated baseline skill and burst damage", () => {
    const result = run(createLanYanDefinition(0, { normal: 1, skill: 1, burst: 1 }), ["skill", "burst"]);

    expect(result.totalDamage).toBeGreaterThan(0);
    expect(damageEvents(result)).toHaveLength(4);
    expect(damageEvents(result).every((event) => event.damage?.element === "anemo")).toBe(true);
  });

  it("adds A4 EM scaling only after ascension 4 and changes actual damage", () => {
    const locked = createLanYanDefinition(0, { normal: 1, skill: 1, burst: 1 }, {
      ascensionPhase: 3,
      baseStats: { ...lanYanBaseStats(), elementalMastery: 200 },
    });
    const unlocked = createLanYanDefinition(0, { normal: 1, skill: 1, burst: 1 }, {
      ascensionPhase: 4,
      baseStats: { ...lanYanBaseStats(), elementalMastery: 200 },
    });

    expect(run(unlocked, ["skill"]).totalDamage).toBeGreaterThan(run(locked, ["skill"]).totalDamage);
    expect(run(unlocked, ["burst"]).totalDamage).toBeGreaterThan(run(locked, ["burst"]).totalDamage);
    expect(LAN_YAN_KIT_METADATA.a4SkillEmRatio).toBe(3.09);
    expect(LAN_YAN_KIT_METADATA.a4BurstEmRatio).toBe(7.74);
  });

  it("applies C4's 60 EM party buff to post-burst A4 damage", () => {
    const baseStats = { ...lanYanBaseStats(), elementalMastery: 200 };
    const c3 = createLanYanDefinition(3, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 4, baseStats });
    const c4 = createLanYanDefinition(4, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 4, baseStats });
    const c3Result = run(c3, ["burst", "skill"]);
    const c4Result = run(c4, ["burst", "skill"]);

    expect(damageEvents(c4Result).at(-1)?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(c3Result).at(-1)?.damage?.finalDamage ?? 0,
    );
    expect(LAN_YAN_KIT_METADATA.c4PartyEm).toBe(60);
    expect(LAN_YAN_KIT_METADATA.c4DurationSeconds).toBe(12);
  });

  it("keeps generated C3 and C5 talent boosts in the damage path", () => {
    expect(run(createLanYanDefinition(3), ["skill"]).totalDamage)
      .toBeGreaterThan(run(createLanYanDefinition(0), ["skill"]).totalDamage);
    expect(run(createLanYanDefinition(5), ["burst"]).totalDamage)
      .toBeGreaterThan(run(createLanYanDefinition(0), ["burst"]).totalDamage);
  });
});

function lanYanBaseStats() {
  return createLanYanDefinition(0).baseStats;
}
