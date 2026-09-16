import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { MONA_KIT_METADATA, createMonaDefinition } from "./monaDefinition";

const noCrit = { critMode: "never" as const };

function damageFor(
  character: ReturnType<typeof createMonaDefinition>,
  actionType: "charged" | "skill" | "burst",
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
    throw new Error(`No ${actionType} damage event for Mona`);
  }
  return event.damage.finalDamage;
}

describe("Mona runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    expect(damageFor(createMonaDefinition(), "skill")).toBeGreaterThan(0);
    expect(damageFor(createMonaDefinition(), "burst")).toBeGreaterThan(0);
  });

  it("applies Waterborne Destiny ER conversion through actual Hydro damage", () => {
    const withoutA4 = createMonaDefinition(0, { normal: 10, skill: 10, burst: 10 }, { ascensionPhase: 3 });
    const withA4 = createMonaDefinition(0, { normal: 10, skill: 10, burst: 10 }, { ascensionPhase: 4 });

    expect(damageFor(withA4, "skill")).toBeGreaterThan(damageFor(withoutA4, "skill"));
    expect(damageFor(withA4, "burst")).toBeGreaterThan(damageFor(withoutA4, "burst"));
  });

  it("applies C3 burst and C5 skill talent levels through actual damage", () => {
    const c0 = createMonaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const c3 = createMonaDefinition(3, { normal: 1, skill: 1, burst: 1 });
    const c5 = createMonaDefinition(5, { normal: 1, skill: 1, burst: 1 });

    expect(damageFor(c3, "burst")).toBeGreaterThan(damageFor(c0, "burst"));
    expect(damageFor(c3, "skill")).toBe(damageFor(c0, "skill"));
    expect(damageFor(c5, "skill")).toBeGreaterThan(damageFor(c0, "skill"));
    expect(damageFor(c5, "burst")).toBeGreaterThan(damageFor(c0, "burst"));
  });

  it("fails closed for Omen and movement-dependent damage channels", () => {
    const c0 = createMonaDefinition(0);
    const c4 = createMonaDefinition(4);
    const c6 = createMonaDefinition(6);

    expect(damageFor(c4, "skill")).toBe(damageFor(c0, "skill"));
    expect(damageFor(c6, "charged")).toBe(damageFor(c0, "charged"));
    expect(MONA_KIT_METADATA.unsupportedChannels).toContain("c4OmenConditionalCritRate");
    expect(MONA_KIT_METADATA.unsupportedChannels).toContain("c6MovementDurationChargedAttackBonus");
  });
});
