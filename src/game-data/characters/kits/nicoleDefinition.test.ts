import { describe, expect, it } from "vitest";
import { testEnemy, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  NICOLE_KIT_METADATA,
  createNicoleDefinition,
} from "./nicoleDefinition";

const noCrit = { critMode: "never" as const };

function run(
  nicoleCharacter: ReturnType<typeof createNicoleDefinition>,
  actions: Parameters<typeof simulateRotation>[1],
) {
  return simulateRotation([nicoleCharacter, testPyro], actions, testEnemy, noCrit);
}

describe("Nicole runtime kit", () => {
  it("executes generated baseline skill and burst damage", () => {
    const character = createNicoleDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
    const result = run(ready, [
      { characterId: ready.id, actionType: "skill" },
      { characterId: ready.id, actionType: "burst" },
    ]);
    const events = result.timeline.filter((event) => event.type === "damage" && event.characterId === ready.id);

    expect(events).toHaveLength(3);
    expect(events.every((event) => event.damage?.element === "pyro")).toBe(true);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A1's post-skill 300 flat ATK to another active party member", () => {
    const unlocked = createNicoleDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const locked = createNicoleDefinition(0, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 0 });
    const actions = [
      { characterId: unlocked.id, actionType: "skill" as const },
      { characterId: testPyro.id, actionType: "swap" as const },
      { characterId: testPyro.id, actionType: "normal" as const },
    ];
    const unlockedHit = run(unlocked, actions).timeline.find(
      (event) => event.type === "damage" && event.characterId === testPyro.id,
    );
    const lockedHit = run(locked, actions).timeline.find(
      (event) => event.type === "damage" && event.characterId === testPyro.id,
    );

    expect(unlockedHit?.damage?.finalDamage).toBeGreaterThan(lockedHit?.damage?.finalDamage ?? 0);
    expect(unlocked.skill.buffs?.[0]?.modifiers).toEqual([
      { stat: "atkFlat", value: NICOLE_KIT_METADATA.a1AtkBonus },
    ]);
  });

  it("retains C3 skill and C5 burst talent boosts in actual damage", () => {
    const c0 = createNicoleDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const c3 = createNicoleDefinition(3, { normal: 1, skill: 10, burst: 1 });
    const c5 = createNicoleDefinition(5, { normal: 1, skill: 1, burst: 10 });
    const ready = (character: ReturnType<typeof createNicoleDefinition>) => ({
      ...character,
      burst: { ...character.burst, energyCost: 0 },
    });

    expect(run(c3, [{ characterId: c3.id, actionType: "skill" }]).totalDamage).toBeGreaterThan(
      run(c0, [{ characterId: c0.id, actionType: "skill" }]).totalDamage,
    );
    expect(run(ready(c5), [{ characterId: c5.id, actionType: "burst" }]).totalDamage).toBeGreaterThan(
      run(ready(c0), [{ characterId: c0.id, actionType: "burst" }]).totalDamage,
    );
  });

  it("documents unsupported stateful and coordinated channels fail-closed", () => {
    expect(NICOLE_KIT_METADATA.unsupportedChannels).toContain("a4ElementalHitTriggeredGuidanceUpgrade");
    expect(NICOLE_KIT_METADATA.unsupportedChannels).toContain("c1ElementalTypeCoordinatedArcaneProjection");
    expect(NICOLE_KIT_METADATA.unsupportedChannels).toContain("c4PathfindersBlessingStackedDamageBonus");
    expect(NICOLE_KIT_METADATA.unsupportedChannels).toContain("c6PartyGuidancePropagationAndDefIgnore");
  });
});
