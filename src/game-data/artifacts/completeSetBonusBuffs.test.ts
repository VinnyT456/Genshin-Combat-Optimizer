import { describe, expect, it } from "vitest";
import { generatedArtifactSets } from "./generated/artifactSets";
import {
  completeArtifactSetBonusBuffs,
  completeSetBonusBuffsById,
} from "./completeSetBonusBuffs";
import { generatedArtifactEffects } from "./generated/setEffects";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { equipArtifactSet } from "@/features/team-builder/equipmentSelection";

describe("complete artifact set compiler", () => {
  it("publishes a deterministic runtime record for every set with a damage/stat effect", () => {
    const ids = new Set(completeArtifactSetBonusBuffs.map((entry) => entry.setId));
    expect(ids.size).toBeGreaterThan(40);
    expect(completeArtifactSetBonusBuffs).toEqual(
      completeArtifactSetBonusBuffs.map((entry) => ({ ...entry })),
    );
  });

  it("publishes an inert record for every generated set, including unsupported mechanics", () => {
    const generatedIds = new Set(generatedArtifactEffects.map((effect) => effect.setSlug));
    const runtimeIds = new Set(completeArtifactSetBonusBuffs.map((entry) => entry.setId));
    expect(completeArtifactSetBonusBuffs).toHaveLength(generatedIds.size);
    for (const set of generatedArtifactSets) {
      expect(runtimeIds.has(set.id), set.id).toBe(true);
      expect(completeSetBonusBuffsById(set.id)?.setId, set.id).toBe(set.id);
    }
  });

  it("wires defensive, aura, and healing sets", () => {
    for (const id of [
      "prayers-for-illumination",
      "prayers-for-destiny",
      "prayers-for-wisdom",
      "prayers-to-springtime",
    ]) {
      const record = completeSetBonusBuffsById(id);
      expect(record?.onePiece?.length, id).toBeGreaterThan(0);
    }
    expect(completeSetBonusBuffsById("prayers-for-illumination")?.onePiece?.[0]?.auraDurationModifiers)
      .toEqual([{ value: 0.4 }]);
    expect(completeSetBonusBuffsById("ocean-hued-clam")?.healingEffects).toEqual([
      { kind: "oceanHuedClam", healingBonus: 0.15 },
    ]);
    expect(completeSetBonusBuffsById("ocean-hued-clam")?.twoPieceHealingEffects).toEqual([
      { kind: "healingBonus", healingBonus: 0.15 },
    ]);
    expect(completeSetBonusBuffsById("song-of-days-past")?.healingEffects).toEqual([
      { kind: "songOfDaysPast", healingBonus: 0.15 },
    ]);
    expect(completeSetBonusBuffsById("traveling-doctor")?.twoPieceHealingEffects).toEqual([
      { kind: "healingReceivedBonus", healingBonus: 0.2 },
    ]);
    expect(completeSetBonusBuffsById("maiden-beloved")?.twoPieceHealingEffects).toEqual([
      { kind: "healingBonus", healingBonus: 0.15 },
    ]);
    expect(completeSetBonusBuffsById("maiden-beloved")?.fourPieceStateEffects).toHaveLength(2);
    expect(completeSetBonusBuffsById("maiden-beloved")?.fourPieceHealingEffects).toEqual([
      { kind: "conditionalHealingReceivedBonus", healingBonus: 0.2, resourceId: "artifact:maiden-beloved", targetScope: "party" },
    ]);
  });

  it("compiles representative four-piece damage mechanics", () => {
    for (const id of [
      "gladiators-finale",
      "viridescent-venerer",
      "emblem-of-severed-fate",
      "deepwood-memories",
      "golden-troupe",
    ]) {
      const row = completeSetBonusBuffsById(id);
      expect(row, id).toBeDefined();
      expect(row?.fourPiece?.length, id).toBeGreaterThan(0);
    }
    expect(completeSetBonusBuffsById("emblem-of-severed-fate")?.fourPiece?.[0]).toMatchObject({
      conditions: { damageTypes: ["burst"] },
      conversions: [{ sourceStat: "energyRecharge", targetStat: "dmgBonus", ratio: 0.25, maxCap: 0.75 }],
    });
  });

  it("wires the remaining deterministic stat and damage rows", () => {
    const expected = [
      ["adventurer", "twoPiece"],
      ["lucky-dog", "twoPiece"],
      ["thundersoother", "fourPiece"],
      ["lavawalker", "fourPiece"],
      ["retracing-bolide", "fourPiece"],
    ] as const;

    for (const [setId, tier] of expected) {
      const record = completeSetBonusBuffsById(setId);
      expect(record, setId).toBeDefined();
      expect(record?.[tier]?.length, `${setId} ${tier}`).toBeGreaterThan(0);
    }

    expect(completeSetBonusBuffsById("tiny-miracle")?.twoPiece?.[0]?.resistanceModifiers)
      .toHaveLength(7);
    expect(completeSetBonusBuffsById("thundersoother")?.twoPiece?.[0]?.resistanceModifiers)
      .toEqual([{ element: "electro", value: 0.4 }]);
    expect(completeSetBonusBuffsById("lavawalker")?.twoPiece?.[0]?.resistanceModifiers)
      .toEqual([{ element: "pyro", value: 0.4 }]);
    expect(completeSetBonusBuffsById("retracing-bolide")?.twoPiece?.[0]?.shieldStrengthModifiers)
      .toEqual([{ value: 0.35 }]);
  });

  it("keeps every generated artifact row addressable", () => {
    for (const effect of generatedArtifactEffects) {
      const record = completeSetBonusBuffsById(effect.setSlug);
      expect(record, effect.id).toBeDefined();
      if (effect.pieces === 1) expect(record?.onePiece, effect.id).toBeDefined();
    }
  });

  it("does not leak higher-tier effects into a one-piece loadout", () => {
    const clam = completeSetBonusBuffsById("ocean-hued-clam");
    expect(clam?.onePiece).toBeUndefined();
    expect(clam?.twoPiece).toBeUndefined();
    const prayers = completeSetBonusBuffsById("prayers-for-illumination");
    expect(prayers?.onePiece?.length).toBe(1);
  });

  it("publishes lifecycle effects for the newly available artifact state channels", () => {
    expect(completeSetBonusBuffsById("gambler")?.fourPieceStateEffects).toEqual([
      { kind: "cooldownResetOnDefeat", cooldownSeconds: 15, abilityTypes: ["skill"] },
    ]);
    expect(completeSetBonusBuffsById("the-exile")?.fourPieceStateEffects).toEqual([
      { kind: "partyEnergyOverTimeAfterBurst", amount: 2, intervalSeconds: 2, durationSeconds: 6, excludeSource: true },
    ]);
    expect(completeSetBonusBuffsById("scholar")?.fourPieceStateEffects).toEqual([
      { kind: "energyOnParticlePickup", amount: 3, cooldownSeconds: 3, targetWeaponTypes: ["bow", "catalyst"] },
    ]);
    expect(completeSetBonusBuffsById("adventurer")?.fourPieceStateEffects).toEqual([
      { kind: "healOnPickup", pickupKind: "item", maxHpFraction: 0.3, durationSeconds: 5, tickIntervalSeconds: 1 },
    ]);
    expect(completeSetBonusBuffsById("lucky-dog")?.fourPieceStateEffects).toEqual([
      { kind: "healOnPickup", pickupKind: "mora", amount: 300 },
    ]);
    expect(completeSetBonusBuffsById("traveling-doctor")?.fourPieceStateEffects).toEqual([
      { kind: "healOnBurst", maxHpFraction: 0.2 },
    ]);
    expect(completeSetBonusBuffsById("scroll-of-the-hero-of-cinder-city")?.twoPieceStateEffects).toEqual([
      { kind: "energyOnNightsoulBurst", amount: 6 },
    ]);
  });

  it("keeps lifecycle effects on their authored tier so 4pc sets cannot double-trigger", () => {
    for (const id of ["gambler", "the-exile", "scholar", "adventurer", "lucky-dog", "traveling-doctor"] as const) {
      const record = completeSetBonusBuffsById(id);
      expect(record?.twoPieceStateEffects, `${id} 2pc`).toBeUndefined();
      expect(record?.fourPieceStateEffects?.length, `${id} 4pc`).toBe(1);
    }
    const scroll = completeSetBonusBuffsById("scroll-of-the-hero-of-cinder-city");
    expect(scroll?.twoPieceStateEffects?.length).toBe(1);
    expect(scroll?.fourPieceStateEffects?.length).toBe(1);
  });

  it("compiles stack-based and externally triggered artifact effects", () => {
    const husk = completeSetBonusBuffsById("husk-of-opulent-dreams");
    expect(husk?.fourPiece?.length).toBe(4);
    expect(husk?.fourPieceStateEffects?.[0]).toMatchObject({
      kind: "resourceOnTrigger",
      trigger: "damageDealt",
      elements: ["geo"],
      resourceId: "artifact:husk-of-opulent-dreams",
    });

    const vourukasha = completeSetBonusBuffsById("vourukashas-glow");
    expect(vourukasha?.fourPiece?.length).toBe(6);
    expect(vourukasha?.fourPieceStateEffects?.[0]).toMatchObject({
      trigger: "resourceEvent",
      eventResourceId: "damageTaken",
    });

    expect(completeSetBonusBuffsById("marechaussee-hunter")?.fourPieceStateEffects?.[0]).toMatchObject({
      trigger: "resourceEvent",
      eventResourceId: "hpChange",
    });
    expect(completeSetBonusBuffsById("fragment-of-harmonic-whimsy")?.fourPieceStateEffects?.[0]).toMatchObject({
      trigger: "resourceEvent",
      eventResourceId: "bondOfLife",
    });
  });

  it("publishes trigger resources for conditional damage windows", () => {
    expect(completeSetBonusBuffsById("martial-artist")?.fourPieceStateEffects).toEqual([
      {
        kind: "resourceOnTrigger",
        resourceId: "artifact:martial-artist",
        trigger: "skillCast",
        value: 1,
        durationSeconds: 8,
        cooldownSeconds: 8,
        maxStacks: 1,
        stackMode: "refresh",
      },
    ]);
    expect(completeSetBonusBuffsById("shimenawas-reminiscence")?.fourPieceStateEffects).toEqual([
      {
        kind: "resourceOnTrigger",
        resourceId: "artifact:shimenawa",
        trigger: "skillCast",
        value: 1,
        durationSeconds: 10,
        cooldownSeconds: 0,
        maxStacks: 1,
        stackMode: "refresh",
        consumeEnergy: 15,
      },
    ]);
  });

  it("compiles typed stack lifecycles for Nymph and Long Night", () => {
    const nymph = completeSetBonusBuffsById("nymphs-dream");
    expect(nymph?.fourPieceStateEffects).toEqual([{
      kind: "resourceOnTrigger",
      resourceId: "artifact:nymphs-dream",
      trigger: "damageDealt",
      value: 1,
      durationSeconds: 8,
      cooldownSeconds: 0,
      maxStacks: 3,
      stackMode: "add",
      damageTypes: ["normal", "charged", "plunge", "skill", "burst"],
    }]);
    const longNight = completeSetBonusBuffsById("long-nights-oath");
    expect(longNight?.fourPieceStateEffects?.[0]).toMatchObject({
      resourceId: "artifact:long-nights-oath",
      trigger: "damageDealt",
      valuesByDamageType: { plunge: 1, charged: 2, skill: 2 },
      damageTypes: ["plunge", "charged", "skill"],
      maxStacks: 5,
    });
    expect(longNight?.fourPiece?.[0]?.conditions?.resources).toEqual([
      { resourceId: "artifact:long-nights-oath", comparator: "gte", value: 1, owner: "source" },
    ]);
  });

  it("gates Deepwood RES shred behind skill and burst hit windows", () => {
    const record = completeSetBonusBuffsById("deepwood-memories");
    expect(record?.fourPiece?.[0]?.conditions).toEqual({
      resources: [{ resourceId: "artifact:deepwood", comparator: "gte", value: 1, owner: "source" }],
    });
    expect(record?.fourPiece?.[0]?.targets).toEqual({ scope: "party" });
    expect(record?.fourPiece?.[0]?.enemyModifiers).toEqual([
      { key: "resReduction", element: "dendro", value: 0.3 },
    ]);
    expect(record?.fourPieceStateEffects).toEqual([
      {
        kind: "resourceOnTrigger",
        resourceId: "artifact:deepwood",
        trigger: "skillCast",
        value: 1,
        durationSeconds: 8,
        cooldownSeconds: 8,
        maxStacks: 1,
        stackMode: "refresh",
      },
      {
        kind: "resourceOnTrigger",
        resourceId: "artifact:deepwood",
        trigger: "burstCast",
        value: 1,
        durationSeconds: 8,
        cooldownSeconds: 8,
        maxStacks: 1,
        stackMode: "refresh",
      },
    ]);
  });

  it("keeps Tenacity party ATK and shield strength in one timed buff", () => {
    const buff = completeSetBonusBuffsById("tenacity-of-the-millelith")?.fourPiece?.[0];
    expect(buff?.targets).toEqual({ scope: "party" });
    expect(buff?.modifiers).toEqual([{ stat: "atkPercent", value: 0.2 }]);
    expect(buff?.shieldStrengthModifiers).toEqual([{ value: 0.3 }]);
    expect(buff?.conditions?.resources).toEqual([
      { resourceId: "artifact:tenacity", comparator: "gte", value: 1, owner: "source" },
    ]);
  });

  it("does not leave a damage-relevant generated row falsely inert", () => {
    const damageWords = /(DMG|damage|CRIT|攻击|伤害|暴击)/i;
    for (const effect of generatedArtifactEffects) {
      if (!damageWords.test(effect.text) && !damageWords.test(effect.textZh)) continue;
      const record = completeSetBonusBuffsById(effect.setSlug);
      const tier = effect.pieces === 2 ? record?.twoPiece : record?.fourPiece;
      const hasRuntimeEffect = (tier?.length ?? 0) > 0;
      const explicitlyUnsupported = effect.support !== "modelled" && effect.reason !== undefined;
      expect(hasRuntimeEffect || explicitlyUnsupported, effect.id).toBe(true);
    }
  });

  it("does not invent a buff for unsupported pickup/healing-only rows", () => {
    const unsupported = generatedArtifactEffects.find(
      (effect) => effect.id === "lucky-dog-4pc",
    );
    expect(unsupported?.support).toBe("unimplemented");
    const compiled = completeSetBonusBuffsById("lucky-dog");
    expect(compiled?.fourPiece).toBeUndefined();
  });

  it("keeps set ids aligned with the generated catalog", () => {
    for (const entry of completeArtifactSetBonusBuffs) {
      expect(generatedArtifactSets.some((set) => set.id === entry.setId)).toBe(
        true,
      );
    }
  });

  it("routes a four-piece effect through the public damage adapter", () => {
    const rotation = [{ characterId: testPyro.id, actionType: "normal" as const }];
    const base = runSimulation({ team: [testPyro], rotation, enemy: testEnemy }).result;
    const equipped = runSimulation({
      team: [testPyro],
      rotation,
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "gladiators-finale", 4),
    }).result;
    expect(equipped.totalDamage).toBeGreaterThan(base.totalDamage);
  });

  it("models Echoes proc damage as deterministic expected additive damage", () => {
    const base = runSimulation({
      team: [testPyro],
      rotation: [{ characterId: testPyro.id, actionType: "normal" }],
      enemy: testEnemy,
    }).result;
    const equipped = runSimulation({
      team: [testPyro],
      rotation: [{ characterId: testPyro.id, actionType: "normal" }],
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "echoes-of-an-offering", 4),
    }).result;
    expect(equipped.totalDamage).toBeGreaterThan(base.totalDamage);
  });

  it("activates skill-triggered set buffs after the triggering cast", () => {
    const rotation = [
      { characterId: testPyro.id, actionType: "skill" as const },
      { characterId: testPyro.id, actionType: "normal" as const },
    ];
    const twoPiece = runSimulation({
      team: [testPyro],
      rotation,
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "martial-artist", 2),
    }).result;
    const fourPiece = runSimulation({
      team: [testPyro],
      rotation,
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "martial-artist", 4),
    }).result;
    expect(fourPiece.totalDamage).toBeGreaterThan(twoPiece.totalDamage);

    const normalOnly = [{ characterId: testPyro.id, actionType: "normal" as const }];
    const twoPieceNormal = runSimulation({
      team: [testPyro],
      rotation: normalOnly,
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "martial-artist", 2),
    }).result;
    const fourPieceNormal = runSimulation({
      team: [testPyro],
      rotation: normalOnly,
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "martial-artist", 4),
    }).result;
    expect(fourPieceNormal.totalDamage).toBe(twoPieceNormal.totalDamage);
  });

  it("applies burst-triggered party buffs only to later actions", () => {
    const rotation = [
      { characterId: testPyro.id, actionType: "skill" as const },
      { characterId: testPyro.id, actionType: "burst" as const },
      { characterId: testPyro.id, actionType: "normal" as const },
    ];
    const twoPiece = runSimulation({
      team: [testPyro],
      rotation,
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "noblesse-oblige", 2),
    }).result;
    const fourPiece = runSimulation({
      team: [testPyro],
      rotation,
      enemy: testEnemy,
      equipment: equipArtifactSet({}, testPyro.id, "noblesse-oblige", 4),
    }).result;
    expect(fourPiece.totalDamage).toBeGreaterThan(twoPiece.totalDamage);
    const burstTwo = twoPiece.timeline.find((event) => event.damage?.damageType === "burst")?.damage?.finalDamage;
    const burstFour = fourPiece.timeline.find((event) => event.damage?.damageType === "burst")?.damage?.finalDamage;
    expect(burstFour).toBeCloseTo(burstTwo ?? 0, 8);
  });
});
