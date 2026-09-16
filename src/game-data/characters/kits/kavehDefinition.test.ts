import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { KAVEH_KIT_METADATA, createKavehDefinition } from "./kavehDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: ReturnType<typeof createKavehDefinition>,
  actionTypes: readonly ("skill" | "burst" | "normal" | "charged")[],
) {
  const burst = actionTypes.includes("burst")
    ? { ...character.burst, energyCost: 0 }
    : character.burst;
  return simulateRotation(
    [{ ...character, burst }],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

describe("Kaveh runtime kit", () => {
  it("executes the sourced baseline skill and burst damage", () => {
    expect(run(createKavehDefinition(), ["skill"]).totalDamage).toBeGreaterThan(0);
    expect(run(createKavehDefinition(), ["burst"]).totalDamage).toBeGreaterThan(0);
  });

  it("infuses Normal Attacks with Dendro during Painted Dome", () => {
    const kaveh = createKavehDefinition();
    const result = run(kaveh, ["burst", "normal"]);
    const normalHit = result.timeline.find(
      (event) => event.type === "damage" && event.damage?.damageType === "normal",
    );

    expect(normalHit?.damage?.element).toBe("dendro");
    expect(normalHit?.damage?.finalDamage).toBeGreaterThan(0);
    expect(KAVEH_KIT_METADATA.paintedDomeDurationSeconds).toBe(12);
  });

  it("adds C6 Pairidaeza's Light damage on a Normal Attack during Painted Dome", () => {
    const c0 = run(createKavehDefinition(0), ["burst", "normal"]);
    const c6 = run(createKavehDefinition(6), ["burst", "normal"]);
    const c6Damage = c6.timeline.filter((event) => event.type === "damage");

    expect(c6Damage).toHaveLength(3);
    expect(c6.totalDamage).toBeGreaterThan(c0.totalDamage);
    expect(c6Damage.some((event) => event.type === "damage" && event.damage?.abilityId === "kaveh-c6-pairidaeza-light")).toBe(true);
    expect(KAVEH_KIT_METADATA.pairidaezaLightAtkRatio).toBe(0.618);
  });

  it("applies generated C3 burst and C5 skill talent boosts to damage", () => {
    expect(run(createKavehDefinition(3), ["burst"]).totalDamage).toBeGreaterThan(
      run(createKavehDefinition(0), ["burst"]).totalDamage,
    );
    expect(run(createKavehDefinition(5), ["skill"]).totalDamage).toBeGreaterThan(
      run(createKavehDefinition(0), ["skill"]).totalDamage,
    );
  });

  it("documents unsupported conditional Kaveh channels rather than inventing uptime", () => {
    expect(KAVEH_KIT_METADATA.unsupportedChannels).toContain("c4KavehTriggeredBloomCoreDamageBonus");
    expect(KAVEH_KIT_METADATA.unsupportedChannels).toContain("a4PaintedDomeNormalChargedPlungeTriggeredEmStacks");
    expect(KAVEH_KIT_METADATA.unsupportedChannels).toContain("c6PairidaezaLightPlungeAttackTrigger");
  });
});
