import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createKujouSaraDefinition, KUJOU_SARA_KIT_METADATA } from "./kujouSaraDefinition";

const noCrit = { critMode: "never" as const };
const expectedCrit = { critMode: "expected" as const };

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.characterId === "kujou-sara");
}

describe("Kujou Sara runtime kit", () => {
  it("applies Crowfeather's source-Base-ATK buff to the active follow-up", () => {
    const withBuff = createKujouSaraDefinition(0);
    const withoutBuff = { ...withBuff, skill: { ...withBuff.skill, buffs: [] } };
    const rotation = [
      { characterId: withBuff.id, actionType: "skill" as const },
      { characterId: withBuff.id, actionType: "charged" as const },
    ];
    const buffed = simulateRotation([withBuff], rotation, testEnemy, noCrit);
    const baseline = simulateRotation([withoutBuff], rotation, testEnemy, noCrit);

    expect(damageEvents(buffed)[1]?.damage?.finalDamage).toBeGreaterThan(
      damageEvents(baseline)[1]?.damage?.finalDamage ?? 0,
    );
    expect(KUJOU_SARA_KIT_METADATA.crowfeatherDurationSeconds).toBe(6);
  });

  it("adds C2's weaker Crowfeather damage hit", () => {
    const c0 = createKujouSaraDefinition(0);
    const c2 = createKujouSaraDefinition(2);
    const run = (character: typeof c0) => simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [{ characterId: character.id, actionType: "skill" as const }],
      testEnemy,
      noCrit,
    );

    expect(damageEvents(run(c0))).toHaveLength(1);
    expect(damageEvents(run(c2))).toHaveLength(2);
    expect(run(c2).totalDamage).toBeGreaterThan(run(c0).totalDamage);
  });

  it("emits six Stormclusters at C4", () => {
    const c0 = createKujouSaraDefinition(0);
    const c4 = createKujouSaraDefinition(4);
    const run = (character: typeof c0) => simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [{ characterId: character.id, actionType: "burst" as const }],
      testEnemy,
      noCrit,
    );

    expect(damageEvents(run(c0))).toHaveLength(2);
    expect(damageEvents(run(c4))).toHaveLength(7);
    expect(run(c4).totalDamage).toBeGreaterThan(run(c0).totalDamage);
  });

  it("applies C6 Electro CRIT DMG after Sara grants Crowfeather", () => {
    const c0 = createKujouSaraDefinition(0);
    const c6 = createKujouSaraDefinition(6);
    const run = (character: typeof c0) => simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [
        { characterId: character.id, actionType: "skill" as const },
        { characterId: character.id, actionType: "burst" as const },
      ],
      testEnemy,
      expectedCrit,
    );
    const c0Hits = damageEvents(run(c0));
    const c6Hits = damageEvents(run(c6));

    expect(c6Hits[2]?.damage?.finalDamage).toBeGreaterThan(c0Hits[1]?.damage?.finalDamage ?? 0);
    expect(KUJOU_SARA_KIT_METADATA.c6ElectroCritDmg).toBe(0.6);
  });
});
