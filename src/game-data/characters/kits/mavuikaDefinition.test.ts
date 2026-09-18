import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { MAVUIKA_KIT_METADATA, createMavuikaDefinition } from "./mavuikaDefinition";

const noCrit = { critMode: "never" as const };

function damageFor(
  character: ReturnType<typeof createMavuikaDefinition>,
  actionType: "skill" | "burst",
): number {
  // Fighting Spirit is an explicit prerequisite of the Burst. Seed the
  // scenario so this test measures the sourced damage channel rather than
  // intentionally testing the resource-validation failure path.
  const readyCharacter = {
    ...character,
    resources: character.resources.map((resource) => ({
      ...resource,
      initial: resource.max,
    })),
  };
  const result = simulateRotation(
    [readyCharacter],
    [{ characterId: readyCharacter.id, actionType }],
    testEnemy,
    noCrit,
  );
  const event = result.timeline.find(
    (entry) => entry.type === "damage" && entry.characterId === readyCharacter.id &&
      entry.damage?.damageType === actionType,
  );
  if (event?.type !== "damage" || event.damage === undefined) {
    throw new Error(`No ${actionType} damage event for Mavuika`);
  }
  return event.damage.finalDamage;
}

function damageEventCount(
  character: ReturnType<typeof createMavuikaDefinition>,
  actionType: "skill" | "burst",
): number {
  const readyCharacter = {
    ...character,
    resources: character.resources.map((resource) => ({
      ...resource,
      initial: resource.max,
    })),
  };
  const result = simulateRotation(
    [readyCharacter],
    [{ characterId: readyCharacter.id, actionType }],
    testEnemy,
    noCrit,
  );
  return result.timeline.filter(
    (entry) => entry.type === "damage" && entry.characterId === readyCharacter.id &&
      entry.damage?.damageType === actionType,
  ).length;
}

describe("Mavuika runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    const mavuika = createMavuikaDefinition();
    expect(damageFor(mavuika, "skill")).toBeGreaterThan(0);
    expect(damageFor(mavuika, "burst")).toBeGreaterThan(0);
  });

  it("applies C3's burst talent level increase through actual damage", () => {
    const c0 = createMavuikaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c3 = createMavuikaDefinition(3, { normal: 1, skill: 1, burst: 1 });
    expect(damageFor(c3, "burst")).toBeGreaterThan(damageFor(c0, "burst"));
    expect(damageFor(c3, "skill")).toBe(damageFor(c0, "skill"));
  });

  it("applies C5's skill talent level increase through actual damage", () => {
    const c0 = createMavuikaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c5 = createMavuikaDefinition(5, { normal: 1, skill: 1, burst: 1 });
    expect(damageFor(c5, "skill")).toBeGreaterThan(damageFor(c0, "skill"));
    // C5 also owns C3, so its burst includes the supported C3 increase.
    expect(damageFor(c5, "burst")).toBeGreaterThan(damageFor(c0, "burst"));
  });

  it("fails closed for Fighting Spirit, Nightsoul, and form-dependent state", () => {
    const c0 = createMavuikaDefinition(0);
    const c2 = createMavuikaDefinition(2);
    const c6 = createMavuikaDefinition(6);

    // No Fighting Spirit/Nightsoul input exists in this generic scenario, so
    // unsupported passive and form effects must not invent damage or hits.
    expect(damageFor(c2, "burst")).toBe(damageFor(c0, "burst"));
    // C6 includes the supported C5 skill level increase; it must not add any
    // additional form-dependent hit beyond that known talent change.
    expect(damageFor(c2, "skill")).toBe(damageFor(c0, "skill"));
    expect(damageEventCount(c6, "skill")).toBe(damageEventCount(c0, "skill"));
    expect(MAVUIKA_KIT_METADATA.unsupportedChannels).toContain(
      "a4FightingSpiritBurstDamageBuffAndDecay",
    );
    expect(MAVUIKA_KIT_METADATA.unsupportedChannels).toContain(
      "c6FormDependentRingFollowUpAndDefReduction",
    );
  });
});
