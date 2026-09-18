import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createFurinaDefinition } from "./furinaDefinition";
import { createSkirkDefinition, SKIRK_KIT_METADATA } from "./skirkDefinition";

const noCrit = { critMode: "never" as const };

function damage(constellationLevel: number, actionType: "normal" | "skill" | "burst", talentLevel = 10) {
  const character = createSkirkDefinition(constellationLevel, {
    normal: actionType === "normal" ? talentLevel : 10,
    skill: actionType === "skill" ? talentLevel : 10,
    burst: actionType === "burst" ? talentLevel : 10,
  });
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
  expect(result.errors).toEqual([]);
  return Object.values(result.damageByAbility).reduce((sum, value) => sum + value, 0);
}

describe("Skirk runtime kit", () => {
  it("preserves executable sourced baseline talent damage", () => {
    expect(damage(0, "normal")).toBeGreaterThan(0);
    expect(damage(0, "skill")).toBe(0);
    expect(damage(0, "burst")).toBeGreaterThan(0);
  });

  it("uses configured talent levels in simulated damage", () => {
    expect(damage(0, "normal", 10)).toBeGreaterThan(damage(0, "normal", 1));
    expect(damage(0, "burst", 10)).toBeGreaterThan(damage(0, "burst", 1));
  });

  it("gates the sourced C3 Burst talent increase at constellation 3", () => {
    expect(damage(3, "burst")).toBeGreaterThan(damage(2, "burst"));
    // C2 adds the skill's 10 Serpent's Subtlety and raises the Burst overflow
    // cap, so it is intentionally stronger than C0 before C3's talent boost.
    expect(damage(2, "burst")).toBeGreaterThan(damage(0, "burst"));
  });

  it("gates the sourced C5 Skill talent increase at constellation 5", () => {
    const flashDamage = (constellationLevel: number) => {
      const character = createSkirkDefinition(constellationLevel);
      const result = simulateRotation(
        [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
        [
          { characterId: character.id, actionType: "skill" },
          { characterId: character.id, actionType: "normal" },
        ],
        testEnemy,
        noCrit,
      );
      return Object.values(result.damageByAbility).reduce((sum, value) => sum + value, 0);
    };
    expect(flashDamage(5)).toBeGreaterThan(flashDamage(2));
    expect(flashDamage(4)).toBe(flashDamage(2));
  });

  it("documents the supported C2 state channels", () => {
    expect(SKIRK_KIT_METADATA.supportedConstellations).toEqual([2, 4, 6]);
    expect(SKIRK_KIT_METADATA.supportedChannels).toContain("sevenPhaseFlashStanceAndCryoInfusion");
    expect(SKIRK_KIT_METADATA.supportedChannels).toContain("serpentsSubtletyBurstOverflowScaling");
    expect(SKIRK_KIT_METADATA.supportedChannels).toContain("a1HoldSkillAbsorption");
  });

  it("applies C4 Death's Crossing attack scaling during Seven-Phase Flash", () => {
    const run = (constellationLevel: number) => {
      const character = createSkirkDefinition(constellationLevel);
      const readyCharacter = {
        ...character,
        burst: { ...character.burst, energyCost: 0 },
        resources: character.resources.map((resource) => ({ ...resource, initial: resource.max })),
      };
      const result = simulateRotation(
        [readyCharacter],
        [
          { characterId: readyCharacter.id, actionType: "skill" as const },
          { characterId: readyCharacter.id, actionType: "normal" as const },
        ],
        testEnemy,
        noCrit,
      );
      return result.timeline.find((event) => event.type === "damage" && event.damage?.damageType === "normal")?.damage?.finalDamage ?? 0;
    };

    expect(run(4)).toBeGreaterThan(run(2));
  });

  it("creates C6 Havoc: Sever coordinated attacks after rift absorption", () => {
    const baseCharacter = createSkirkDefinition(6);
    const character = {
      ...baseCharacter,
      resources: baseCharacter.resources.map((resource) =>
        resource.id === "serpents-subtlety" || resource.id === "skirk-havoc-sever"
          ? { ...resource, initial: resource.id === "serpents-subtlety" ? 55 : 3 }
          : resource,
      ),
    };
    const readyCharacter = {
      ...character,
      burst: { ...character.burst, energyCost: 0 },
    };
    const result = simulateRotation(
      [readyCharacter],
      [
        { characterId: readyCharacter.id, actionType: "burst" as const },
      ],
      testEnemy,
      noCrit,
    );
    const coordinated = result.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId === "skirk-c6-havoc-sever-burst-attack",
    );
    expect(coordinated).toHaveLength(1);
    expect(coordinated[0]?.damage?.finalDamage).toBeGreaterThan(0);
    expect(result.finalState.characters.skirk?.resources?.["skirk-havoc-sever"]?.value).toBe(0);
  });

  it("enters Seven-Phase Flash and exposes the C2 replacement burst", () => {
    const character = createSkirkDefinition(2);
    expect(character.maxEnergy).toBe(0);
    expect(character.burst.energyCost).toBe(0);
    expect(character.burst.cost?.resources).toEqual([
      { resourceId: "serpents-subtlety", amount: 50, consume: "all" },
    ]);
    const result = simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [
        { characterId: character.id, actionType: "skill" },
        { characterId: character.id, actionType: "normal" },
        { characterId: character.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );
    const damageEvents = result.timeline.filter((event) => event.type === "damage");
    expect(result.errors).toEqual([]);
    expect(damageEvents.some((event) => event.damage?.element === "cryo" && event.damage.damageType === "normal")).toBe(true);
    expect(damageEvents.some((event) => event.damage?.abilityId === "skirk-havoc-extinction")).toBe(false);
    const serpents = result.finalState.characters.skirk?.resources?.["serpents-subtlety"]?.value ?? 0;
    expect(serpents).toBeGreaterThan(0);
    expect(serpents).toBeLessThan(55);
  });

  it("grants 55 Serpent's Subtlety from one C2 Skill cast", () => {
    const character = createSkirkDefinition(2);
    const skillGains = (character.skill.effects ?? [])
      .filter((effect) => effect.resourceId === "serpents-subtlety" && effect.kind === "gain")
      .map((effect) => effect.amount);

    expect(skillGains).toEqual([45, 10]);
    expect(skillGains.reduce((total, amount) => total + amount, 0)).toBe(55);
  });

  it("keeps Hold-generated Serpent's Subtlety for the regular Burst", () => {
    const skirk = createSkirkDefinition(2);
    const furina = createFurinaDefinition(0);
    const result = simulateRotation(
      [skirk, furina],
      [
        { characterId: skirk.id, actionType: "skill", skillVariant: "hold" },
        { characterId: furina.id, actionType: "swap" },
        { characterId: skirk.id, actionType: "swap" },
        { characterId: skirk.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );

    const skirkBurst = result.timeline.find(
      (event) => event.type === "damage" && event.characterId === skirk.id,
    );
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(skirkBurst?.damage?.abilityId).toBe("skirk-burst");
    expect(skirkBurst?.damage?.finalDamage).toBeGreaterThan(0);
    expect(result.finalState.characters[skirk.id]?.resources?.["serpents-subtlety"]?.value).toBe(0);
  });

  it("absorbs up to three Void Rifts on Hold and summons C1 Crystal Blades", () => {
    const baseCharacter = createSkirkDefinition(2);
    const character = {
      ...baseCharacter,
      resources: baseCharacter.resources.map((resource) =>
        resource.id === "skirk-void-rifts"
          ? { ...resource, initial: 3 }
          : resource,
      ),
    };
    const result = simulateRotation(
      [character],
      [{ characterId: character.id, actionType: "skill", skillVariant: "hold" }],
      testEnemy,
      noCrit,
    );
    const crystalBlade = result.timeline.find(
      (event) => event.type === "damage" && event.damage?.abilityId === "skirk-skill",
    );

    expect(result.errors).toEqual([]);
    expect(result.finalState.characters[character.id]?.resources?.["skirk-void-rifts"]?.value).toBe(0);
    expect(result.finalState.characters[character.id]?.resources?.["serpents-subtlety"]?.value).toBe(79);
    expect(result.finalState.characters[character.id]?.resources?.["skirk-seven-phase-flash-active"]?.value).toBe(0);
    expect(crystalBlade?.damage?.finalDamage).toBeGreaterThan(0);
  });

  it("uses the Skill talent channel for every Seven-Phase Flash attack", () => {
    const character = createSkirkDefinition(2, { normal: 1, skill: 10, burst: 1 });
    const stance = character.skill.stance;
    expect(stance?.normalAttacks?.hits[0]?.talentChannel).toBe("skill");
    expect(stance?.chargedAttack?.talentChannel).toBe("skill");
    expect(stance?.plungeLow?.instances[0]?.id).toBe("skirk-skill-8");
    expect(stance?.plungeHigh?.instances[0]?.id).toBe("skirk-skill-9");

    const result = simulateRotation(
      [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
      [
        { characterId: character.id, actionType: "skill" },
        { characterId: character.id, actionType: "normal" },
      ],
      testEnemy,
      noCrit,
    );
    const hit = result.timeline.find((event) => event.type === "damage");
    expect(hit?.damage?.finalDamage).toBeGreaterThan(0);
    expect(result.errors).toEqual([]);
  });

  it("activates C2's attack bonus after Havoc: Extinction", () => {
    const run = (constellationLevel: number, includeSpecialBurst: boolean) => {
      const character = createSkirkDefinition(constellationLevel);
      const actions = [
        { characterId: character.id, actionType: "skill" as const },
        ...(includeSpecialBurst ? [{ characterId: character.id, actionType: "burst" as const }] : []),
        { characterId: character.id, actionType: "normal" as const },
      ];
      const result = simulateRotation(
        [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
        actions,
        testEnemy,
        noCrit,
      );
      return result.timeline
        .filter((event) => event.type === "damage")
        .reduce((total, event) => total + (event.damage?.finalDamage ?? 0), 0);
    };

    expect(run(2, false)).toBe(run(0, false));
    expect(run(2, true)).toBeGreaterThan(run(0, true));
  });

  it("adds C1's crystal blade for each Void Rift absorbed", () => {
    const createReady = (constellationLevel: number) => {
      const character = createSkirkDefinition(constellationLevel);
      return {
        ...character,
        burst: { ...character.burst, energyCost: 0 },
        skill: {
          ...character.skill,
          // Simulate rifts being created after Seven-Phase Flash begins. The
          // C1 blade must read the charged action's pre-cost resource state,
          // not the stance-entry snapshot.
          effects: [
            ...(character.skill.effects ?? []),
            { resourceId: "skirk-void-rifts", kind: "gain" as const, amount: 3 },
          ],
        },
      };
    };
    const run = (constellationLevel: number) => {
      const character = createReady(constellationLevel);
      const result = simulateRotation(
        [character],
        [
          { characterId: character.id, actionType: "skill" },
          { characterId: character.id, actionType: "charged" },
        ],
        testEnemy,
        noCrit,
      );
      expect(result.errors).toEqual([]);
      return result;
    };

    const c0 = run(0);
    const c1 = run(1);
    const c0ChargedEvents = c0.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId === "skirk-seven-phase-charged",
    );
    const c1ChargedEvents = c1.timeline.filter(
      (event) => event.type === "damage" && event.damage?.abilityId === "skirk-seven-phase-charged",
    );
    expect(c0ChargedEvents).toHaveLength(3);
    expect(c1ChargedEvents).toHaveLength(4);
    expect(c1ChargedEvents.at(-1)?.damage?.damageType).toBe("charged");
    expect(c1ChargedEvents.at(-1)?.damage?.element).toBe("cryo");
    expect(c1ChargedEvents.at(-1)?.damage?.finalDamage).toBeGreaterThan(0);
  });
});
