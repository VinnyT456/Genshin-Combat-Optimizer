import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import {
  NAVIA_KIT_METADATA,
  createNaviaDefinition,
} from "./naviaDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: ReturnType<typeof createNaviaDefinition>,
  actionTypes: readonly ("normal" | "charged" | "skill" | "burst")[],
) {
  return simulateRotation(
    [character],
    actionTypes.map((actionType) => ({ characterId: character.id, actionType })),
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "navia");
}

describe("Navia runtime kit", () => {
  it("executes generated skill and burst damage", () => {
    const navia = createNaviaDefinition(0, { normal: 1, skill: 10, burst: 10 });
    const ready = { ...navia, burst: { ...navia.burst, energyCost: 0 } };
    const events = damageEvents(run(ready, ["skill", "burst"]));

    expect(events).toHaveLength(4);
    expect(events.every((event) => event.damage?.element === "geo")).toBe(true);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A1's four-second Geo infusion and 40% attack damage bonus after skill", () => {
    const withA1 = createNaviaDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const withoutA1 = createNaviaDefinition(0, { normal: 1, skill: 1, burst: 1 }, { ascensionPhase: 0 });
    const withResult = run(withA1, ["skill", "normal"]);
    const withoutResult = run(withoutA1, ["skill", "normal"]);
    const normal = damageEvents(withResult).find((event) => event.damage?.damageType === "normal");

    expect(normal?.damage?.element).toBe("geo");
    expect(withResult.totalDamage).toBeGreaterThan(withoutResult.totalDamage);
    expect(withA1.skill.stance?.infusion).toEqual(expect.objectContaining({
      element: "geo",
      durationSeconds: NAVIA_KIT_METADATA.a1DurationSeconds,
      canBeOverridden: false,
    }));
  });

  it("scales actual skill damage with the explicit A4 elemental party count", () => {
    const noMembers = createNaviaDefinition(0, { normal: 1, skill: 10, burst: 1 }, {}, {
      pyroElectroCryoHydroCount: 0,
    });
    const twoMembers = createNaviaDefinition(0, { normal: 1, skill: 10, burst: 1 }, {}, {
      pyroElectroCryoHydroCount: 2,
    });
    const noMembersDamage = damageEvents(run(noMembers, ["skill"]))[0]?.damage?.finalDamage ?? 0;
    const twoMembersDamage = damageEvents(run(twoMembers, ["skill"]))[0]?.damage?.finalDamage ?? 0;

    expect(twoMembersDamage).toBeGreaterThan(noMembersDamage);
    expect(twoMembers.passives.find((passive) => passive.id === "navia-a4")?.buffs?.[0]?.modifiers).toEqual([
      { stat: "atkPercent", value: 0.4 },
    ]);
  });

  it("retains generated C3 skill and C5 burst talent boosts in actual damage", () => {
    const c0 = createNaviaDefinition(0);
    const c3 = createNaviaDefinition(3);
    const c5 = createNaviaDefinition(5);
    const burstReady = (character: ReturnType<typeof createNaviaDefinition>) => ({
      ...character,
      burst: { ...character.burst, energyCost: 0 },
    });

    expect(run(c3, ["skill"]).totalDamage).toBeGreaterThan(run(c0, ["skill"]).totalDamage);
    expect(run(burstReady(c5), ["burst"]).totalDamage).toBeGreaterThan(
      run(burstReady(c0), ["burst"]).totalDamage,
    );
  });

  it("documents unsupported stack- and enemy-state channels fail-closed", () => {
    expect(NAVIA_KIT_METADATA.unsupportedChannels).toContain("c1CrystalShrapnelEnergyAndBurstCooldownReduction");
    expect(NAVIA_KIT_METADATA.unsupportedChannels).toContain("c2CrystalShrapnelConditionalSkillCritRateAndCannonFireSupport");
    expect(NAVIA_KIT_METADATA.unsupportedChannels).toContain("c4BurstHitGatedGeoResistanceReduction");
    expect(NAVIA_KIT_METADATA.unsupportedChannels).toContain("c6CrystalShrapnelConditionalSkillCritDamageAndRefund");
  });
});
