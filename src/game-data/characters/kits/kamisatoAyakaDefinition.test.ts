import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { simulateRotation } from "@/simulation/engine";
import {
  KAMISATO_AYAKA_KIT_METADATA,
  createKamisatoAyakaDefinition,
} from "./kamisatoAyakaDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: GenericCharacterDefinition,
  actionTypes: readonly ("normal" | "charged" | "skill" | "burst")[],
) {
  const ready = actionTypes.includes("burst")
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation(
    [ready],
    actionTypes.map((actionType) => ({ characterId: ready.id, actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Kamisato Ayaka runtime kit", () => {
  it("executes generated skill, charged attack, and burst damage", () => {
    const ayaka = createKamisatoAyakaDefinition();
    const result = run(ayaka, ["skill", "charged"]);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(4);
  });

  it("applies A1 only to normal/charged damage after skill cast", () => {
    const ayaka = createKamisatoAyakaDefinition();
    const withoutA1 = {
      ...ayaka,
      skill: { ...ayaka.skill, buffs: [] },
    };
    const withA1 = run(ayaka, ["skill", "charged"]);
    const without = run(withoutA1, ["skill", "charged"]);
    expect(withA1.totalDamage).toBeGreaterThan(without.totalDamage);

    const skillDamage = withA1.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "skill");
    const baselineSkillDamage = without.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "skill");
    expect(skillDamage?.damage?.finalDamage).toBe(baselineSkillDamage?.damage?.finalDamage);
  });

  it("adds C2's two 20% storm copies to actual burst damage", () => {
    const c0 = createKamisatoAyakaDefinition(0);
    const c2 = createKamisatoAyakaDefinition(2);
    const c0Result = run(c0, ["burst"]);
    const c2Result = run(c2, ["burst"]);
    expect(c0Result.timeline.filter((event) => event.type === "damage")).toHaveLength(2);
    expect(c2Result.timeline.filter((event) => event.type === "damage")).toHaveLength(4);
    expect(c2Result.totalDamage / c0Result.totalDamage).toBeCloseTo(1.4, 8);
  });

  it("retains generated C3 and C5 talent boosts in actual damage", () => {
    const c0 = createKamisatoAyakaDefinition(0);
    const c3 = createKamisatoAyakaDefinition(3);
    const c5 = createKamisatoAyakaDefinition(5);
    expect(run(c3, ["burst"]).totalDamage).toBeGreaterThan(run(c0, ["burst"]).totalDamage);
    expect(run(c5, ["skill"]).totalDamage).toBeGreaterThan(run(c0, ["skill"]).totalDamage);
  });

  it("documents unsupported conditional channels", () => {
    expect(KAMISATO_AYAKA_KIT_METADATA.unsupportedChannels).toContain("c4BurstHitGatedEnemyDefReduction");
    expect(KAMISATO_AYAKA_KIT_METADATA.unsupportedChannels).toContain("c6TimedUsurahiButouChargedAttackBuff");
  });
});
