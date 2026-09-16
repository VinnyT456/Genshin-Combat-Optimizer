import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { NINGGUANG_KIT_METADATA, createNingguangDefinition } from "./ningguangDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: ReturnType<typeof createNingguangDefinition>,
  actionTypes: readonly ("normal" | "charged" | "skill" | "burst")[],
) {
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "ningguang");
}

describe("Ningguang runtime kit", () => {
  it("executes the generated Geo skill and burst damage", () => {
    const ningguang = createNingguangDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const events = damageEvents(run(ningguang, ["skill", "burst"]));

    expect(events).toHaveLength(2);
    expect(events.every((event) => event.damage?.element === "geo")).toBe(true);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A4 Geo DMG only to later damage after Jade Screen", () => {
    const withA4 = createNingguangDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const withoutA4 = createNingguangDefinition(0, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 3 });
    const boosted = damageEvents(run(withA4, ["skill", "burst"]));
    const baseline = damageEvents(run(withoutA4, ["skill", "burst"]));

    expect(boosted[0]?.damage?.finalDamage).toBe(baseline[0]?.damage?.finalDamage);
    expect(boosted[1]?.damage?.finalDamage).toBeGreaterThan(baseline[1]?.damage?.finalDamage ?? 0);
    // At ascension 6 the generated base already includes 24% Geo DMG, so the
    // 12% additive A4 increment changes the final ratio by 1.36 / 1.24.
    expect((boosted[1]?.damage?.finalDamage ?? 0) / (baseline[1]?.damage?.finalDamage ?? 1)).toBeCloseTo(1.36 / 1.24, 8);
  });

  it("retains generated C3 burst and C5 skill talent boosts in actual damage", () => {
    const c0 = createNingguangDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c3 = createNingguangDefinition(3, { normal: 1, skill: 1, burst: 1 });
    const c5 = createNingguangDefinition(5, { normal: 1, skill: 1, burst: 1 });

    expect(run(c3, ["burst"]).totalDamage).toBeGreaterThan(run(c0, ["burst"]).totalDamage);
    expect(run(c5, ["skill"]).totalDamage).toBeGreaterThan(run(c0, ["skill"]).totalDamage);
  });

  it("documents unsupported conditional, multi-target, and minimap channels", () => {
    expect(NINGGUANG_KIT_METADATA.unsupportedChannels).toContain("a1JadeStarStaminaAndChargedAttackProjectileState");
    expect(NINGGUANG_KIT_METADATA.unsupportedChannels).toContain("c1NormalAttackAreaOfEffect");
    expect(NINGGUANG_KIT_METADATA.unsupportedChannels).toContain("c6BurstGrantedJadeStarsAndNextChargedAttackProjectiles");
  });
});
