import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { LYNEY_KIT_METADATA, createLyneyDefinition } from "./lyneyDefinition";

const noCrit = { critMode: "never" as const };

function run(
  character: ReturnType<typeof createLyneyDefinition>,
  actionTypes: readonly ("normal" | "charged" | "skill" | "burst")[],
) {
  const ready = {
    ...character,
    burst: { ...character.burst, energyCost: 0 },
  };
  return simulateRotation(
    [ready],
    actionTypes.map((actionType) => ({ characterId: ready.id, actionType })),
    testEnemy,
    noCrit,
  );
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "lyney");
}

describe("Lyney runtime kit", () => {
  it("executes sourced baseline skill and burst damage", () => {
    const events = damageEvents(run(createLyneyDefinition(0), ["skill", "burst"]));

    expect(events).toHaveLength(3);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A4's Pyro-aura damage bonus to a following Pyro hit", () => {
    const withPassive = run(createLyneyDefinition(0), ["skill", "burst"]);
    const withPassiveDefinition = createLyneyDefinition(0);
    const withoutPassive = {
      ...withPassiveDefinition,
      passives: withPassiveDefinition.passives.map((passive) =>
        passive.id === "lyney-a4" ? { ...passive, buffs: [] } : passive,
      ),
    };
    const baseline = run(withoutPassive, ["skill", "burst"]);
    const boostedBurst = damageEvents(withPassive).at(-1)?.damage?.finalDamage ?? 0;
    const baselineBurst = damageEvents(baseline).at(-1)?.damage?.finalDamage ?? 0;

    expect(boostedBurst).toBeGreaterThan(baselineBurst);
  });

  it("retains generated C3 Normal Attack talent levels in actual damage", () => {
    const c0 = damageEvents(run(createLyneyDefinition(0), ["normal"]))[0]?.damage?.finalDamage ?? 0;
    const c3 = damageEvents(run(createLyneyDefinition(3), ["normal"]))[0]?.damage?.finalDamage ?? 0;

    expect(c3).toBeGreaterThan(c0);
  });

  it("retains generated C5 Burst talent levels in actual damage", () => {
    const c0 = damageEvents(run(createLyneyDefinition(0), ["burst"]))[0]?.damage?.finalDamage ?? 0;
    const c5 = damageEvents(run(createLyneyDefinition(5), ["burst"]))[0]?.damage?.finalDamage ?? 0;

    expect(c5).toBeGreaterThan(c0);
  });

  it("documents state and party-composition channels that remain fail-closed", () => {
    expect(LYNEY_KIT_METADATA.unsupportedChannels).toContain("c2CrispFocusCritDamageStacksAndSwapReset");
    expect(LYNEY_KIT_METADATA.unsupportedChannels).toContain("a4AdditionalTwentyPercentPerOtherPyroPartyMember");
    expect(LYNEY_KIT_METADATA.unsupportedChannels).toContain("c6PyrotechnicStrikeReprisedPropArrowFollowUp");
  });
});
