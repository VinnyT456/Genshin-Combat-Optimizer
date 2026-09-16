import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { LOHEN_KIT_METADATA, createLohenDefinition } from "./lohenDefinition";

const noCrit = { critMode: "never" as const };

function damageFor(
  character: ReturnType<typeof createLohenDefinition>,
  actionType: "skill" | "burst",
): number {
  const result = simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    [{ characterId: character.id, actionType }],
    testEnemy,
    noCrit,
  );
  const event = result.timeline.find(
    (entry) => entry.type === "damage" && entry.characterId === character.id &&
      entry.damage?.damageType === actionType,
  );
  if (event?.type !== "damage" || event.damage === undefined) {
    throw new Error(`No ${actionType} damage event for Lohen`);
  }
  return event.damage.finalDamage;
}

describe("Lohen runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    expect(damageFor(createLohenDefinition(), "skill")).toBeGreaterThan(0);
    expect(damageFor(createLohenDefinition(), "burst")).toBeGreaterThan(0);
  });

  it("applies C3's skill talent level increase through actual damage", () => {
    const c0 = createLohenDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c3 = createLohenDefinition(3, { normal: 1, skill: 1, burst: 1 });
    expect(damageFor(c3, "skill")).toBeGreaterThan(damageFor(c0, "skill"));
    expect(damageFor(c3, "burst")).toBe(damageFor(c0, "burst"));
  });

  it("applies C5's burst talent level increase through actual damage", () => {
    const c0 = createLohenDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c5 = createLohenDefinition(5, { normal: 1, skill: 1, burst: 1 });
    expect(damageFor(c5, "burst")).toBeGreaterThan(damageFor(c0, "burst"));
    // C5 also owns C3, so its skill includes the supported C3 increase.
    expect(damageFor(c5, "skill")).toBeGreaterThan(damageFor(c0, "skill"));
  });

  it("fails closed for unsupported Masterstroke and passive state", () => {
    const c0 = createLohenDefinition(0);
    // C2 has no executable talent boost; its Masterstroke/energy behavior is
    // unsupported and must not invent a damage multiplier.
    const c2 = createLohenDefinition(2);
    expect(damageFor(c2, "skill")).toBe(damageFor(c0, "skill"));
    expect(damageFor(c2, "burst")).toBe(damageFor(c0, "burst"));
    expect(LOHEN_KIT_METADATA.unsupportedChannels).toContain(
      "a1WillToWinAccumulationAndMasterstrokeState",
    );
    expect(LOHEN_KIT_METADATA.unsupportedChannels).toContain(
      "c6JoyCritDamageAndMasterstrokeExtension",
    );
  });
});
