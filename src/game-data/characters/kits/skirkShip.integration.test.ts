import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import { runSearch } from "@/features/optimizer/optimizerAdapter";
import { simulateRotation } from "@/simulation/engine";
import type { EquipmentSelections } from "@/features/team-builder/equipmentSelection";
import {
  equipArtifactLoadout,
  equipWeapon,
} from "@/features/team-builder/equipmentSelection";
import {
  baseBuildArtifactLoadout,
  recommendedBuildFor,
} from "@/game-data/characters/recommendedBuilds";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { createEscoffierDefinition } from "./escoffierDefinition";
import { createFurinaDefinition } from "./furinaDefinition";
import { createSkirkDefinition } from "./skirkDefinition";
import { createYelanDefinition } from "./yelanDefinition";

const noCrit = { critMode: "never" as const };

function ready<T extends GenericCharacterDefinition>(definition: T): T {
  return {
    ...definition,
    burst: { ...definition.burst, energyCost: 0 },
  };
}

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage" && event.damage);
}

function recommendedEquipment(
  team: readonly GenericCharacterDefinition[],
  omitArtifactCharacterId?: string,
): EquipmentSelections {
  let equipment: EquipmentSelections = {};
  for (const character of team) {
    const build = recommendedBuildFor(character.id);
    expect(build, `missing recommended build for ${character.id}`).toBeDefined();
    if (!build) continue;
    if (character.id !== omitArtifactCharacterId) {
      equipment = equipArtifactLoadout(
        equipment,
        character.id,
        baseBuildArtifactLoadout(build),
      );
    }
    if (build.weaponId) {
      equipment = equipWeapon(equipment, character.id, build.weaponId, 1, 90);
    }
  }
  return equipment;
}

describe("Skirk ship runtime integration", () => {
  it("applies Furina and Yelan Burst damage buffs to Skirk's later attacks", () => {
    const runShip = ({ furinaConstellation, enableYelanBurst }: {
      furinaConstellation: number;
      enableYelanBurst: boolean;
    }) => {
      const skirk = ready(createSkirkDefinition(2, undefined, {}, {
        allHydroCryo: true,
        hasHydro: true,
        hasCryo: true,
      }));
      const furina = ready(createFurinaDefinition(furinaConstellation));
      const escoffier = ready(createEscoffierDefinition(0, undefined, {}, { hydroOrCryoCount: 4 }));
      const yelan = ready(createYelanDefinition(6, undefined, {}, { distinctElementCount: 2 }));
      const result = simulateRotation(
        [furina, yelan, escoffier, skirk],
        [
          { characterId: furina.id, actionType: "burst" as const },
          { characterId: furina.id, actionType: "skill" },
          { characterId: escoffier.id, actionType: "swap" },
          { characterId: escoffier.id, actionType: "skill" },
          { characterId: escoffier.id, actionType: "burst" },
          { characterId: yelan.id, actionType: "swap" },
          ...(enableYelanBurst ? [{ characterId: yelan.id, actionType: "burst" as const }] : []),
          { characterId: yelan.id, actionType: "normal" },
          { characterId: skirk.id, actionType: "swap" },
          { characterId: skirk.id, actionType: "skill" },
          { characterId: skirk.id, actionType: "burst" },
          ...Array.from({ length: 5 }, () => ({ characterId: skirk.id, actionType: "normal" as const })),
        ],
        testEnemy,
        noCrit,
      );
      return {
        result,
        skirkDamage: damageEvents(result).find(
          (event) => event.characterId === skirk.id && event.damage?.damageType === "normal",
        )?.damage?.finalDamage ?? 0,
      };
    };

    const c0Furina = runShip({ furinaConstellation: 0, enableYelanBurst: true });
    const c2Furina = runShip({ furinaConstellation: 2, enableYelanBurst: true });
    const withoutYelanBurst = runShip({ furinaConstellation: 2, enableYelanBurst: false });
    expect(c0Furina.result.errors).toEqual([]);
    expect(c2Furina.result.errors).toEqual([]);
    expect(withoutYelanBurst.result.errors).toEqual([]);
    expect(c0Furina.skirkDamage).toBeGreaterThan(0);
    expect(c2Furina.skirkDamage).toBeGreaterThan(c0Furina.skirkDamage);
    expect(c2Furina.skirkDamage).toBeGreaterThan(withoutYelanBurst.skirkDamage);
    expect(c2Furina.result.finalState.runtimeBuffs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "furina-fanfare-party-damage" }),
        expect.objectContaining({ id: "yelan-a4-adapt-with-ease" }),
      ]),
    );
  });

  it("creates and absorbs a Void Rift from a teammate's Freeze reaction", () => {
    const furina = ready(createFurinaDefinition(2));
    const escoffier = ready(createEscoffierDefinition(0, undefined, {}, { hydroOrCryoCount: 3 }));
    const skirk = ready(createSkirkDefinition(2, undefined, {}, {
      allHydroCryo: true,
      hasHydro: true,
      hasCryo: true,
    }));
    const result = simulateRotation(
      [furina, escoffier, skirk],
      [
        { characterId: furina.id, actionType: "skill" },
        { characterId: escoffier.id, actionType: "swap" },
        { characterId: escoffier.id, actionType: "skill" },
        { characterId: skirk.id, actionType: "swap" },
        { characterId: skirk.id, actionType: "skill" },
        { characterId: skirk.id, actionType: "charged" },
      ],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toEqual([]);
    expect(result.timeline).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "resource",
        resource: expect.objectContaining({
          resourceId: "skirk-void-rifts",
          kind: "gain",
          amount: 1,
        }),
      }),
    ]));
    // The charged attack consumes the rift it just earned for Serpent's
    // Subtlety, so the post-rotation value is expected to be empty.
    expect(result.finalState.characters.skirk?.resources?.["skirk-void-rifts"]?.value).toBe(0);
    expect(result.finalState.characters.skirk?.resources?.["serpents-subtlety"]?.value).toBeGreaterThan(0);
  });

  it("runs the C2R1/C2R0/C6R1/C0R0 team through a full burst window", () => {
    const skirk = ready(createSkirkDefinition(2, undefined, {}, {
      allHydroCryo: true,
      hasHydro: true,
      hasCryo: true,
    }));
    const furina = ready(createFurinaDefinition(2));
    const yelan = ready(createYelanDefinition(6, undefined, {}, { distinctElementCount: 2 }));
    const escoffier = ready(createEscoffierDefinition(0, undefined, {}, { hydroOrCryoCount: 4 }));
    const result = simulateRotation(
      [furina, yelan, escoffier, skirk],
      [
        { characterId: furina.id, actionType: "burst" },
        { characterId: furina.id, actionType: "skill" },
        { characterId: escoffier.id, actionType: "swap" },
        { characterId: escoffier.id, actionType: "skill" },
        { characterId: escoffier.id, actionType: "burst" },
        { characterId: yelan.id, actionType: "swap" },
        { characterId: yelan.id, actionType: "burst" },
        { characterId: yelan.id, actionType: "normal" },
        { characterId: skirk.id, actionType: "swap" },
        { characterId: skirk.id, actionType: "skill" },
        { characterId: skirk.id, actionType: "burst" },
        ...Array.from({ length: 5 }, () => ({ characterId: skirk.id, actionType: "normal" as const })),
      ],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toEqual([]);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(damageEvents(result).some((event) => event.characterId === "furina")).toBe(true);
    expect(damageEvents(result).some((event) => event.damage?.abilityId === "yelan-c2-water-arrow")).toBe(true);
    expect(damageEvents(result).some((event) => event.damage?.abilityId === "yelan-c6-breakthrough-barb")).toBe(true);
    expect(damageEvents(result).some((event) => event.characterId === "escoffier")).toBe(true);
    expect(damageEvents(result).filter((event) => event.characterId === "skirk").length).toBeGreaterThan(5);
    expect(result.timeline.some((event) => event.type === "healing" && event.characterId === "escoffier")).toBe(true);
    expect(result.finalState.characters.furina?.resources?.["furina-fanfare"]?.value).toBeGreaterThan(0);
  });

  it("executes the reference-style split rotation without dropping Skirk actions", () => {
    const skirk = createSkirkDefinition(2, undefined, {}, {
      allHydroCryo: true,
      hasHydro: true,
      hasCryo: true,
    });
    const furina = createFurinaDefinition(2);
    const escoffier = createEscoffierDefinition(0, undefined, {}, { hydroOrCryoCount: 4 });
    const yelan = createYelanDefinition(6, undefined, {}, { distinctElementCount: 2 });
    const result = runSimulation({
      team: [furina, escoffier, yelan, skirk],
      rotation: [
        { characterId: furina.id, actionType: "skill" },
        { characterId: furina.id, actionType: "burst" },
        { characterId: escoffier.id, actionType: "swap" },
        { characterId: escoffier.id, actionType: "skill" },
        { characterId: escoffier.id, actionType: "burst" },
        { characterId: yelan.id, actionType: "swap" },
        { characterId: yelan.id, actionType: "burst" },
        { characterId: yelan.id, actionType: "skill" },
        { characterId: yelan.id, actionType: "skill" },
        ...Array.from({ length: 5 }, () => ({ characterId: yelan.id, actionType: "normal" as const })),
        { characterId: skirk.id, actionType: "swap" },
        { characterId: skirk.id, actionType: "burst" },
        { characterId: skirk.id, actionType: "skill" },
        { characterId: skirk.id, actionType: "charged" },
        ...Array.from({ length: 10 }, () => ({ characterId: skirk.id, actionType: "normal" as const })),
      ],
      enemy: testEnemy,
      config: { ...noCrit, startWithFullEnergy: true },
      equipment: recommendedEquipment([furina, escoffier, yelan, skirk]),
    }).result;

    const events = damageEvents(result);
    const skirkEvents = events.filter((event) => event.characterId === skirk.id);
    expect(result.errors).toEqual([]);
    expect(result.structuredWarnings).toEqual([]);
    expect(new Set(events.map((event) => event.characterId))).toEqual(
      new Set([furina.id, escoffier.id, yelan.id, skirk.id]),
    );
    expect(skirkEvents.filter((event) => event.damage?.abilityId === "skirk-burst")).toHaveLength(6);
    expect(skirkEvents.filter((event) => event.damage?.abilityId.startsWith("skirk-seven-phase-normal-"))).toHaveLength(10);
    // The three ordinary Seven-Phase charged hits plus the C1 crystal blade
    // prove that all three generated Void Rifts were carried into the cast.
    expect(skirkEvents.filter((event) => event.damage?.abilityId === "skirk-seven-phase-charged")).toHaveLength(4);
    expect(result.finalState.characters.furina?.resources?.["furina-fanfare"]?.value).toBeGreaterThan(0);
  });

  it("keeps legacy editor slot ids executable across stateful replacements", () => {
    const yelan = ready(createYelanDefinition(6, undefined, {}, { distinctElementCount: 2 }));
    const skirk = ready(createSkirkDefinition(2, undefined, {}, {
      allHydroCryo: true,
      hasHydro: true,
      hasCryo: true,
    }));
    const result = simulateRotation(
      [yelan, skirk],
      [
        { characterId: yelan.id, actionType: "burst" },
        // These are the ids written by the pre-fix rotation editor.
        { characterId: yelan.id, actionType: "normal", abilityId: "yelan-na-1" },
        { characterId: skirk.id, actionType: "swap" },
        { characterId: skirk.id, actionType: "skill", abilityId: "skirk-skill" },
        { characterId: skirk.id, actionType: "normal", abilityId: "skirk-na-1" },
        { characterId: skirk.id, actionType: "charged", abilityId: "skirk-charged" },
      ],
      testEnemy,
      noCrit,
    );

    expect(result.errors).toEqual([]);
    expect(result.structuredWarnings.filter((warning) => warning.code === "mismatched-ability")).toEqual([]);
    expect(damageEvents(result).some((event) => event.damage?.abilityId === "yelan-c6-breakthrough-barb")).toBe(true);
    expect(damageEvents(result).some((event) => event.damage?.abilityId === "skirk-seven-phase-normal-1")).toBe(true);
    expect(damageEvents(result).some((event) => event.damage?.abilityId === "skirk-seven-phase-charged")).toBe(true);
  });

  it("starts Skirk's alternate burst resource full with the full-energy scenario", () => {
    const skirk = createSkirkDefinition(2, undefined, {}, {
      allHydroCryo: true,
      hasHydro: true,
      hasCryo: true,
    });
    const result = simulateRotation(
      [skirk],
      [{ characterId: skirk.id, actionType: "burst", abilityId: "skirk-burst" }],
      testEnemy,
      { ...noCrit, startWithFullEnergy: true },
    );

    expect(result.errors).toEqual([]);
    expect(result.structuredWarnings).toEqual([]);
    expect(damageEvents(result).filter((event) => event.characterId === skirk.id)).toHaveLength(6);
    expect(result.finalState.characters[skirk.id]?.resources?.["serpents-subtlety"]?.value).toBe(0);
  });

  it("keeps the four imported signature weapons on the adapter-to-engine path", () => {
    const skirk = ready(createSkirkDefinition(2, undefined, {}, {
      allHydroCryo: true,
      hasHydro: true,
      hasCryo: true,
    }));
    const furina = ready(createFurinaDefinition(2));
    const yelan = ready(createYelanDefinition(6, undefined, {}, { distinctElementCount: 2 }));
    const escoffier = ready(createEscoffierDefinition(0, undefined, {}, { hydroOrCryoCount: 4 }));
    const team = [skirk, furina, yelan, escoffier];
    const equipment: EquipmentSelections = {
      [skirk.id]: { weaponId: "azurelight", weaponLevel: 90, refinement: 1 },
      [furina.id]: { weaponId: "splendoroftranquilwaters", weaponLevel: 90, refinement: 1 },
      [yelan.id]: { weaponId: "aquasimulacra", weaponLevel: 90, refinement: 1 },
      [escoffier.id]: { weaponId: "symphonistofscents", weaponLevel: 90, refinement: 1 },
    };
    const result = runSimulation({
      team,
      rotation: [
        { characterId: furina.id, actionType: "burst" },
        { characterId: furina.id, actionType: "skill" },
        { characterId: escoffier.id, actionType: "swap" },
        { characterId: escoffier.id, actionType: "burst" },
        { characterId: yelan.id, actionType: "swap" },
        { characterId: yelan.id, actionType: "burst" },
        { characterId: skirk.id, actionType: "swap" },
        { characterId: skirk.id, actionType: "skill" },
        { characterId: skirk.id, actionType: "burst" },
        ...Array.from({ length: 5 }, () => ({ characterId: skirk.id, actionType: "normal" as const })),
      ],
      enemy: testEnemy,
      config: noCrit,
      equipment,
    }).result;

    expect(result.errors).toEqual([]);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.some((event) => event.type === "healing" && event.characterId === escoffier.id)).toBe(true);
    expect(result.finalState.characters[skirk.id]?.resources?.["weapon:azurelight-skill-window"]?.value).toBe(1);
    expect(result.finalState.characters[furina.id]?.resources?.["weapon:splendor-skill-stacks"]?.value).toBeGreaterThan(0);
    expect(result.finalState.characters[furina.id]?.resources?.["weapon:splendor-hp-stacks"]?.value).toBeGreaterThan(0);
    expect(result.finalState.characters[escoffier.id]?.resources?.["weapon:symphonist-sweet-echoes"]?.value).toBe(1);
  });

  it("runs the user's full-energy rotation with recommended artifacts and keeps set effects scoped", () => {
    const skirk = createSkirkDefinition(2, undefined, {}, {
      allHydroCryo: true,
      hasHydro: true,
      hasCryo: true,
    });
    const furina = createFurinaDefinition(2);
    const yelan = createYelanDefinition(6, undefined, {}, { distinctElementCount: 2 });
    const escoffier = createEscoffierDefinition(0, undefined, {}, { hydroOrCryoCount: 4 });
    const team = [skirk, furina, yelan, escoffier];
    const rotation = [
      { characterId: skirk.id, actionType: "skill" as const },
      { characterId: furina.id, actionType: "swap" as const },
      { characterId: furina.id, actionType: "skill" as const },
      { characterId: furina.id, actionType: "burst" as const },
      { characterId: escoffier.id, actionType: "swap" as const },
      { characterId: escoffier.id, actionType: "skill" as const },
      { characterId: escoffier.id, actionType: "burst" as const },
      { characterId: yelan.id, actionType: "swap" as const },
      { characterId: yelan.id, actionType: "skill" as const },
      { characterId: yelan.id, actionType: "skill" as const },
      { characterId: yelan.id, actionType: "burst" as const },
      { characterId: yelan.id, actionType: "normal" as const },
      { characterId: skirk.id, actionType: "swap" as const },
      { characterId: skirk.id, actionType: "skill" as const },
      { characterId: skirk.id, actionType: "burst" as const },
      ...Array.from({ length: 5 }, () => ({
        characterId: skirk.id,
        actionType: "normal" as const,
      })),
    ];
    const base = runSimulation({
      team,
      rotation,
      enemy: testEnemy,
      config: { ...noCrit, startWithFullEnergy: true },
    }).result;
    const equipped = runSimulation({
      team,
      rotation,
      enemy: testEnemy,
      config: { ...noCrit, startWithFullEnergy: true },
      equipment: recommendedEquipment(team),
    }).result;
    const withoutSkirkArtifacts = runSimulation({
      team,
      rotation,
      enemy: testEnemy,
      config: { ...noCrit, startWithFullEnergy: true },
      equipment: recommendedEquipment(team, skirk.id),
    }).result;

    expect(base.errors).toEqual([]);
    expect(equipped.errors).toEqual([]);
    expect(equipped.totalDamage).toBeGreaterThan(base.totalDamage);

    const events = damageEvents(equipped);
    expect(new Set(events.map((event) => event.characterId))).toEqual(
      new Set([skirk.id, furina.id, yelan.id, escoffier.id]),
    );
    expect(new Set(events.map((event) => event.characterId))).toEqual(
      new Set([skirk.id, furina.id, yelan.id, escoffier.id]),
    );
    expect(events.some((event) => event.damage?.abilityId === "yelan-c2-water-arrow")).toBe(true);
    expect(events.some((event) => event.damage?.abilityId === "yelan-c6-breakthrough-barb")).toBe(true);
    const skirkDamage = events
      .filter((event) => event.characterId === skirk.id)
      .reduce((total, event) => total + (event.damage?.finalDamage ?? 0), 0);
    const skirkDamageWithoutArtifacts = damageEvents(withoutSkirkArtifacts)
      .filter((event) => event.characterId === skirk.id)
      .reduce((total, event) => total + (event.damage?.finalDamage ?? 0), 0);
    const supportDamage = events
      .filter((event) => event.characterId !== skirk.id)
      .reduce((total, event) => total + (event.damage?.finalDamage ?? 0), 0);
    const supportDamageWithoutSkirkArtifacts = damageEvents(withoutSkirkArtifacts)
      .filter((event) => event.characterId !== skirk.id)
      .reduce((total, event) => total + (event.damage?.finalDamage ?? 0), 0);
    expect(skirkDamage).toBeGreaterThan(skirkDamageWithoutArtifacts);
    // Finale of the Deep Galleries is wearer-only. Adding Skirk's set must
    // not change Furina, Yelan, or Escoffier's damage.
    expect(supportDamage).toBe(supportDamageWithoutSkirkArtifacts);
    expect(equipped.finalState.characters[skirk.id]?.resources?.["weapon:azurelight-skill-window"]?.value).toBe(1);
    expect(equipped.finalState.characters[furina.id]?.resources?.["furina-fanfare"]?.value).toBeGreaterThan(0);
    expect(equipped.finalState.characters[furina.id]?.resources?.["weapon:splendor-skill-stacks"]?.value).toBeGreaterThan(0);
    expect(equipped.finalState.characters[escoffier.id]?.resources?.["weapon:symphonist-sweet-echoes"]?.value).toBe(1);
  });

  it("can search the four-character ship from a full-energy start", () => {
    const skirk = createSkirkDefinition(2, undefined, {}, {
      allHydroCryo: true,
      hasHydro: true,
      hasCryo: true,
    });
    const furina = createFurinaDefinition(2);
    const yelan = createYelanDefinition(6, undefined, {}, { distinctElementCount: 2 });
    const escoffier = createEscoffierDefinition(0, undefined, {}, { hydroOrCryoCount: 4 });
    const outcome = runSearch({
      team: [furina, yelan, escoffier, skirk],
      enemy: testEnemy,
      initialRotation: [
        { characterId: furina.id, actionType: "burst" },
        { characterId: furina.id, actionType: "skill" },
        { characterId: escoffier.id, actionType: "swap" },
        { characterId: escoffier.id, actionType: "burst" },
        { characterId: yelan.id, actionType: "swap" },
        { characterId: yelan.id, actionType: "burst" },
        { characterId: skirk.id, actionType: "swap" },
        { characterId: skirk.id, actionType: "skill" },
        { characterId: skirk.id, actionType: "burst" },
      ],
      budget: "fast",
      objective: "total-damage",
      durationSeconds: 20,
      config: { critMode: "never" },
    });

    expect(outcome.candidates.length).toBeGreaterThan(0);
    expect(outcome.stopReason).not.toBe("no-candidates");
  });
});
