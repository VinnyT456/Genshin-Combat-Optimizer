import { describe, expect, it } from "vitest";
import {
  allCharacters,
  findCharacter,
} from "@/game-data/characters/registry";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { optimizeRotation } from "@/simulation/optimizer/optimizeRotation";
import { computeStatConversion, applyActiveConversions } from "@/simulation/buffs/conversions";
import { applyElement } from "@/simulation/reactions/applyElement";
import { EMPTY_AURA_STATE, type Aura } from "@/simulation/reactions/types";
import { gaugeAt } from "@/simulation/reactions/aura";
import { talentValueAt } from "@/simulation/character/talent";
import { makeBuffResolver } from "@/simulation/buffs/makeBuffResolver";
import type { ActiveBuff, Buff, StatConversionModifier } from "@/simulation/buffs/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { Rotation } from "@/types";
import type { TestEvidence } from "@/tests/coverage/characterCoverage";

// ============================================================================
// All Characters Integration & Simulation Execution Suite (TASK #030 & #037)
//
// Validates end-to-end simulation on real playable characters:
// 1. 4-character real teams (National, Hu Tao Double Hydro, Freeze, etc.)
// 2. Damage calculation, multi-hit instances, and timeline event output
// 3. Energy generation, particle shares, and burst spending
// 4. Reaction triggers (Vaporize, Overload, Electro-Charged, Swirl, Melt, etc.)
// 5. Stat conversions (HP->ATK, DEF->ATK) — engine machinery, not kit data
// 6. Optimizer execution with real character team
// 7. Full roster simulation across the whole generated roster
// 8. Per-level datamined talent table scaling (TASK #037)
// 9. Non-ATK scaling characters (Yelan HP, Noelle DEF) & stat isolation (TASK #037)
// 10. Reactions, aura decay, and ICD carrying across team rotation casts (TASK #037)
// ============================================================================

export const ALL_CHARACTERS_TEST_EVIDENCE: readonly TestEvidence[] = [
  {
    suiteId: "all-characters-execution",
    characterIds: allCharacters.map((c) => c.id),
    asserts: {
      damage: true,
      energy: true,
      reaction: true,
    },
  },
];

// Ids are resolved through `findCharacter` and asserted present, so a future
// rename fails at the lookup with the id in the message rather than throwing
// an opaque "cannot read properties of undefined" from inside the engine.
function requireCharacter(id: string) {
  const character = findCharacter(id);
  if (character === undefined) {
    throw new Error(`character "${id}" is missing from the registry`);
  }
  return character;
}

describe("allCharactersExecution — 4-Character Real Teams", () => {

  const bennett = requireCharacter("bennett");
  const xiangling = requireCharacter("xiangling");
  const xingqiu = requireCharacter("xingqiu");
  const raiden = requireCharacter("raiden-shogun");

  it("loads real characters for National Team cleanly", () => {
    for (const char of [bennett, xiangling, xingqiu, raiden]) {
      expect(char.id).toBeTruthy();
      expect(char.normalAttacks.hits.length).toBeGreaterThan(0);
    }
  });

  it("runs simulateRotation on Raiden National team and validates damage, events, and energy", () => {
    const nationalTeam = [raiden, bennett, xiangling, xingqiu];

    const rotation: Rotation = [
      { characterId: raiden.id, actionType: "skill" },
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "skill" },
      { characterId: xingqiu.id, actionType: "swap" },
      { characterId: xingqiu.id, actionType: "skill" },
      { characterId: raiden.id, actionType: "swap" },
      { characterId: raiden.id, actionType: "normal" },
      { characterId: raiden.id, actionType: "normal" },
      { characterId: raiden.id, actionType: "normal" },
    ];

    const result = simulateRotation(nationalTeam, rotation, testEnemy);

    // The engine must accept every action: a rotation built entirely from real
    // registry ids and legal action types has no reason to warn or error, and
    // a silent rejection would leave the damage assertions passing on a
    // shorter rotation than the one written.
    expect(result.errors).toEqual([]);
    expect(
      result.structuredWarnings.filter((w) => w.actionIndex >= 0),
    ).toEqual([]);

    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.dps).toBeGreaterThan(0);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.timeline.length).toBeGreaterThan(10);

    for (const char of nationalTeam) {
      expect(
        result.damageByCharacter[char.id],
        `${char.id} dealt no damage`,
      ).toBeGreaterThan(0);
    }

    // damageByCharacter must ACCOUNT for the whole total, not merely be
    // non-zero — a dropped contributor is invisible to per-character checks.
    const summed = Object.values(result.damageByCharacter).reduce(
      (a, b) => a + b,
      0,
    );
    expect(summed).toBeCloseTo(result.totalDamage, 6);

    for (const ev of result.timeline) {
      expect(ev.timestamp).toBeGreaterThanOrEqual(0);
      if (ev.duration !== undefined) {
        expect(ev.duration).toBeGreaterThanOrEqual(0);
      }
    }

    // One energy event per skill cast, at minimum: all four skills emit
    // particles, and each is distributed to the party.
    const energyEvents = result.timeline.filter((e) => e.type === "energy");
    expect(energyEvents.length).toBeGreaterThanOrEqual(4);
  });

  /**
   * Burst energy spending, asserted against a DERIVED bound rather than a
   * literal.
   *
   * The previous version compared final energy to the literal `6.75`, which
   * was the fabricated Bennett's 2.25-particle yield times 3. Real Bennett
   * emits 6 particles, so the literal both failed and would have been wrong to
   * simply re-pin: the number encoded a fact about the DATA inside a test about
   * the ENGINE. What actually needs asserting is the relationship — energy
   * after casting a burst is strictly less than energy before it, by the
   * burst's own cost.
   */
  it("verifies burst energy spending in real character rotation", () => {
    const burstCost = 5;
    const readyBennett = {
      ...bennett,
      burst: { ...bennett.burst, energyCost: burstCost },
    };

    const skillOnly = simulateRotation(
      [readyBennett],
      [{ characterId: bennett.id, actionType: "skill" }],
      testEnemy,
    );
    const energyBeforeBurst =
      skillOnly.finalState?.characters[bennett.id]?.energy.current;
    expect(energyBeforeBurst).toBeDefined();
    expect(energyBeforeBurst!).toBeGreaterThanOrEqual(burstCost);

    const result = simulateRotation(
      [readyBennett],
      [
        { characterId: bennett.id, actionType: "skill" },
        { characterId: bennett.id, actionType: "burst" },
      ],
      testEnemy,
    );

    expect(result.errors).toEqual([]);
    expect(result.totalDamage).toBeGreaterThan(0);
    const damageEvents = result.timeline.filter((e) => e.type === "damage");
    expect(damageEvents.some((e) => e.damage?.damageType === "burst")).toBe(true);

    const finalEnergy = result.finalState?.characters[bennett.id]?.energy.current;
    expect(finalEnergy).toBeDefined();
    // Exactly the cost was spent — stronger than "less than some constant".
    expect(finalEnergy!).toBeCloseTo(energyBeforeBurst! - burstCost, 6);
  });

  /**
   * A Pyro/Hydro/Geo team, renamed to what it actually tests now.
   *
   * The old version was "Hu Tao Double Hydro team with infusion and
   * coordinated procs" and asserted Hu Tao's normals turn Pyro. With no
   * infusion in the data her normals are Physical, so that assertion is not
   * repairable by renaming — it is testing a behaviour the model no longer
   * claims. What survives, and is worth keeping, is that a four-character team
   * of real characters executes end-to-end with every member contributing.
   */
  it("runs a four-character Pyro/Hydro/Geo team end to end", () => {
    const hutao = requireCharacter("hu-tao");
    const yelan = requireCharacter("yelan");
    const zhongli = requireCharacter("zhongli");

    const team = [zhongli, xingqiu, yelan, hutao];
    const rotation: Rotation = [
      { characterId: zhongli.id, actionType: "skill" },
      { characterId: xingqiu.id, actionType: "swap" },
      { characterId: xingqiu.id, actionType: "skill" },
      { characterId: yelan.id, actionType: "swap" },
      { characterId: yelan.id, actionType: "skill" },
      { characterId: hutao.id, actionType: "swap" },
      { characterId: hutao.id, actionType: "skill" },
      { characterId: hutao.id, actionType: "normal" },
      { characterId: hutao.id, actionType: "normal" },
    ];

    const result = simulateRotation(team, rotation, testEnemy);
    expect(result.errors).toEqual([]);
    expect(result.totalDamage).toBeGreaterThan(0);
    for (const char of team) {
      expect(
        result.damageByCharacter[char.id],
        `${char.id} dealt no damage`,
      ).toBeGreaterThan(0);
    }

    // Hu Tao's normals land, and land as PHYSICAL. Asserting the element
    // explicitly is deliberate: it records that the infusion is absent, so
    // when a Pyro infusion is modelled this test fails and is updated on
    // purpose rather than a stale expectation surviving unnoticed.
    const hutaoNormals = result.timeline.filter(
      (e) =>
        e.type === "damage" &&
        e.characterId === hutao.id &&
        e.damage?.damageType === "normal",
    );
    expect(hutaoNormals.length).toBeGreaterThan(0);
    for (const ev of hutaoNormals) {
      expect(
        ev.damage?.element,
        "Hu Tao's normals are now infused — the kit behaviour gap has closed; update this expectation",
      ).toBe("physical");
    }
  });

  it("runs Freeze team with Ayaka, Shenhe, Xingqiu, Kazuha", () => {
    const ayaka = requireCharacter("kamisato-ayaka");
    const shenhe = requireCharacter("shenhe");
    const kazuha = requireCharacter("kaedehara-kazuha");

    const freezeTeam = [shenhe, kazuha, xingqiu, ayaka];
    const rotation: Rotation = [
      { characterId: shenhe.id, actionType: "skill" },
      { characterId: kazuha.id, actionType: "swap" },
      { characterId: kazuha.id, actionType: "skill" },
      { characterId: xingqiu.id, actionType: "swap" },
      { characterId: xingqiu.id, actionType: "skill" },
      { characterId: ayaka.id, actionType: "swap" },
      { characterId: ayaka.id, actionType: "skill" },
      { characterId: ayaka.id, actionType: "normal" },
    ];

    const result = simulateRotation(freezeTeam, rotation, testEnemy);
    expect(result.errors).toEqual([]);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.damageByCharacter[ayaka.id]).toBeGreaterThan(0);
    expect(result.damageByElement["cryo"]).toBeGreaterThan(0);
    expect(result.damageByElement["anemo"]).toBeGreaterThan(0);
    expect(result.damageByElement["hydro"]).toBeGreaterThan(0);
  });

  /**
   * DETERMINISM over the real roster: identical inputs produce a byte-identical
   * result. Run on a four-character team so swap ordering, energy distribution
   * and per-character cooldowns are all in play.
   */
  it("produces an identical result when the same team and rotation are re-simulated", () => {
    const team = [raiden, bennett, xiangling, xingqiu];
    const rotation: Rotation = [
      { characterId: raiden.id, actionType: "skill" },
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "skill" },
      { characterId: xiangling.id, actionType: "swap" },
      { characterId: xiangling.id, actionType: "skill" },
    ];

    const first = simulateRotation(team, rotation, testEnemy);
    const second = simulateRotation(team, rotation, testEnemy);

    expect(second.totalDamage).toBe(first.totalDamage);
    expect(second.duration).toBe(first.duration);
    expect(second.timeline).toEqual(first.timeline);
    expect(second.damageByCharacter).toEqual(first.damageByCharacter);
    expect(second.finalState).toEqual(first.finalState);
  });
});

describe("allCharactersExecution — Reaction Triggers", () => {
  it("triggers Vaporize, Overload, Electro-Charged, and Swirl with real character abilities", () => {
    const bennett = findCharacter("bennett")!;
    const xingqiu = findCharacter("xingqiu")!;
    const kazuha = findCharacter("kaedehara-kazuha")!;
    const raiden = findCharacter("raiden-shogun")!;

    /**
     * Picks the first instance that actually APPLIES an element.
     *
     * The old version took `instances[0]` and asserted on `application!`. Under
     * the generated data a skill's first instance is not guaranteed to carry an
     * application (multi-instance skills interleave applying and non-applying
     * hits), so `instances[0].application!` would throw or, worse, silently
     * read `undefined` gauge. Searching for an applying instance and failing
     * loudly if there is none keeps the reaction assertions honest.
     */
    function applyingInstance(character: typeof bennett, label: string) {
      const instance = character.skill.instances.find(
        (i) => i.application !== undefined,
      );
      if (instance?.application === undefined) {
        throw new Error(`${label} skill applies no element`);
      }
      return { element: instance.element, gauge: instance.application.gauge };
    }

    const pyroHit = applyingInstance(bennett, "bennett");
    const hydroHit = applyingInstance(xingqiu, "xingqiu");
    const anemoHit = applyingInstance(kazuha, "kazuha");
    const electroHit = applyingInstance(raiden, "raiden-shogun");

    // The elements are asserted, not assumed: if a character's skill element
    // changed, the reaction below would still fire and mask the change.
    expect(pyroHit.element).toBe("pyro");
    expect(hydroHit.element).toBe("hydro");
    expect(anemoHit.element).toBe("anemo");
    expect(electroHit.element).toBe("electro");

    const hydroState = applyElement(EMPTY_AURA_STATE, "hydro", 1.0, 0).state;
    const revVap = applyElement(hydroState, pyroHit.element, pyroHit.gauge, 1);
    expect(revVap.reactions.some((r) => r.kind === "vaporize")).toBe(true);

    const pyroState = applyElement(EMPTY_AURA_STATE, "pyro", 1.0, 0).state;
    const fwdVap = applyElement(pyroState, hydroHit.element, hydroHit.gauge, 1);
    expect(fwdVap.reactions.some((r) => r.kind === "vaporize")).toBe(true);

    const electroState = applyElement(EMPTY_AURA_STATE, "electro", 1.0, 0).state;
    const overload = applyElement(electroState, pyroHit.element, pyroHit.gauge, 1);
    expect(overload.reactions.some((r) => r.kind === "overloaded")).toBe(true);

    const overloadElectro = applyElement(
      pyroState,
      electroHit.element,
      electroHit.gauge,
      1,
    );
    expect(overloadElectro.reactions.some((r) => r.kind === "overloaded")).toBe(
      true,
    );

    const ec = applyElement(electroState, hydroHit.element, hydroHit.gauge, 1);
    expect(ec.reactions.some((r) => r.kind === "electroCharged")).toBe(true);

    const swirl = applyElement(pyroState, anemoHit.element, anemoHit.gauge, 1);
    expect(swirl.reactions.some((r) => r.kind === "swirl")).toBe(true);
  });
});

describe("allCharactersExecution — Stat Conversions", () => {
  it("verifies Hu Tao HP -> ATK stat conversion formula", () => {
    const hutao = findCharacter("hu-tao")!;
    const conversion: StatConversionModifier = {
      sourceStat: "hp",
      targetStat: "atkFlat",
      ratio: 0.0626, // 6.26% of Max HP at Lv.10
      maxCap: 3000, // custom weapon cap
    };

    const sourceHp = 30000;
    const convertedAtk = computeStatConversion(sourceHp, conversion);
    expect(convertedAtk).toBeCloseTo(30000 * 0.0626, 2);

    // Verify clamping at cap
    const lowCapConversion: StatConversionModifier = {
      ...conversion,
      maxCap: 500,
    };
    expect(computeStatConversion(sourceHp, lowCapConversion)).toBe(500);

    // Apply via applyActiveConversions
    const activeBuff: ActiveBuff = {
      buff: {
        id: "paramita-papilio-buff",
        source: "hutao",
        targets: { scope: "self" },
        stacking: { mode: "refresh" },
        startTime: 0,
        duration: 9,
        conversions: [conversion],
      },
      stacks: 1,
    };

    const boostedStats = applyActiveConversions(
      { ...hutao.baseStats, hp: sourceHp },
      [activeBuff],
      { atk: hutao.baseStats.atk, hp: hutao.baseStats.hp, def: hutao.baseStats.def },
    );

    expect(boostedStats.atk).toBeCloseTo(hutao.baseStats.atk + convertedAtk, 2);
  });

  it("verifies Noelle DEF -> ATK stat conversion formula", () => {
    const noelle = findCharacter("noelle")!;
    expect(noelle).toBeDefined();

    const conversion: StatConversionModifier = {
      sourceStat: "def",
      targetStat: "atkFlat",
      ratio: 0.85, // 85% of DEF at Lv.10 (Sweeping Time)
    };

    const sourceDef = 2000;
    const convertedAtk = computeStatConversion(sourceDef, conversion);
    expect(convertedAtk).toBe(1700);

    const activeBuff: ActiveBuff = {
      buff: {
        id: "sweeping-time-buff",
        source: "noelle",
        targets: { scope: "self" },
        stacking: { mode: "refresh" },
        startTime: 0,
        duration: 15,
        conversions: [conversion],
      },
      stacks: 1,
    };

    const boostedStats = applyActiveConversions(
      { ...noelle.baseStats, def: sourceDef },
      [activeBuff],
      { atk: noelle.baseStats.atk, hp: noelle.baseStats.hp, def: noelle.baseStats.def },
    );

    expect(boostedStats.atk).toBe(noelle.baseStats.atk + 1700);
  });
});

describe("allCharactersExecution — Optimizer with Real Character Team", () => {
  it("generates deterministic top-ranked rotations using optimizeRotation on National Team", () => {
    const bennett = findCharacter("bennett")!;
    const xiangling = findCharacter("xiangling")!;
    const xingqiu = findCharacter("xingqiu")!;
    const raiden = findCharacter("raiden-shogun")!;

    const nationalTeam = [raiden, bennett, xiangling, xingqiu];

    const optResult = optimizeRotation(
      nationalTeam,
      testEnemy,
      {
        simulationDuration: 8,
        beamWidth: 3,
        objective: "total-damage",
        topN: 3,
      },
    );

    expect(optResult.ranked.length).toBeGreaterThan(0);
    expect(optResult.ranked[0]?.rotation.length).toBeGreaterThan(0);
    expect(optResult.ranked[0]?.result.totalDamage).toBeGreaterThan(0);

    // Second run with same parameters yields exact same best result (determinism)
    const optResult2 = optimizeRotation(
      nationalTeam,
      testEnemy,
      {
        simulationDuration: 8,
        beamWidth: 3,
        objective: "total-damage",
        topN: 3,
      },
    );

    expect(optResult2.ranked[0]?.result.totalDamage).toBe(optResult.ranked[0]?.result.totalDamage);
    expect(optResult2.ranked[0]?.rotation).toEqual(optResult.ranked[0]?.rotation);
  });
});

describe("allCharactersExecution — Full Roster Simulation", () => {
  it("verifies every character in the roster can be simulated with damage and energy", () => {
    // Bound rather than a headcount: the roster grows, and an equality here
    // would need editing on every addition, which is where a silent shrink
    // hides. 80 is well under the current 132 and well over any plausible
    // partial-emission accident.
    expect(allCharacters.length).toBeGreaterThanOrEqual(80);

    const noEnergyDespiteParticles: string[] = [];

    for (const char of allCharacters) {
      const rotation: Rotation = [
        { characterId: char.id, actionType: "skill" },
        { characterId: char.id, actionType: "normal" },
      ];

      const result = simulateRotation([char], rotation, testEnemy);
      expect(result.errors, `${char.id} errored`).toEqual([]);
      expect(result.duration, `${char.id} duration`).toBeGreaterThan(0);
      expect(
        Number.isFinite(result.totalDamage),
        `${char.id} produced a non-finite total`,
      ).toBe(true);
      expect(result.totalDamage, `${char.id} dealt no damage`).toBeGreaterThan(0);

      if (
        char.skill.particles !== undefined ||
        (char.skill.energyGenerated ?? 0) > 0
      ) {
        const energyEvents = result.timeline.filter(
          (e) => e.type === "energy" && e.characterId === char.id,
        );
        if (energyEvents.length < 1) noEnergyDespiteParticles.push(char.id);
      }
    }

    // Pinned as an exact SET, not skipped. See the test below for why these
    // two are here and what it means.
    expect(
      noEnergyDespiteParticles.sort(),
      "the set of characters emitting particles but generating no energy has changed",
    ).toEqual(["mavuika", "skirk"]);
  });

  /**
   * DEFECT PIN — an UNVERIFIED value with an OBSERVABLE simulation consequence.
   *
   * Mavuika and Skirk have a burst energy cost neither source publishes, so it
   * is emitted as 0 and `maxEnergy` follows it to 0. That is the correct
   * no-guessing behaviour at the DATA layer, but it does not stay at the data
   * layer: their skills still emit particles (5 Pyro, 4 Cryo), and the engine
   * has nowhere to put the resulting energy, so no energy event is emitted at
   * all. Their energy economy silently vanishes from the timeline.
   *
   * Concrete failing input:
   *   simulateRotation([findCharacter("mavuika")!],
   *                    [{ characterId: "mavuika", actionType: "skill" }],
   *                    testEnemy)
   *   -> timeline contains ZERO events of type "energy",
   *      despite skill.particles === { count: 5, element: "pyro" }
   *
   * This is pinned rather than skipped so that the day a real energy cost is
   * sourced, this test fails and the exemption is removed deliberately.
   * Owning agent: whoever sources the two missing burst costs (game-data).
   */
  it("DEFECT: an unpublished zero burst cost silently suppresses energy events", () => {
    for (const id of ["mavuika", "skirk"] as const) {
      const char = findCharacter(id);
      expect(char, `${id} is missing from the roster`).toBeDefined();

      // Precondition: the cost really is the unpublished zero.
      expect(char!.burst.energyCost, `${id} burst energy cost`).toBe(0);
      expect(char!.maxEnergy, `${id} maxEnergy`).toBe(0);
      // ...and the skill really does emit particles that ought to go somewhere.
      expect(char!.skill.particles, `${id} skill particles`).toBeDefined();
      expect(char!.skill.particles!.count).toBeGreaterThan(0);

      const result = simulateRotation(
        [char!],
        [{ characterId: id, actionType: "skill" }],
        testEnemy,
      );
      expect(result.errors).toEqual([]);

      const energyEvents = result.timeline.filter((e) => e.type === "energy");
      expect(
        energyEvents,
        `${id} now emits energy events — the burst cost was sourced; remove this pin and the exemption above it`,
      ).toEqual([]);
    }
  });

  /**
   * PERFORMANCE REGRESSION GUARD, expressed as work rather than wall-clock.
   *
   * A time budget would be flaky on shared CI, so this asserts the DETERMINISTIC
   * proxy: simulating the whole roster produces a bounded number of timeline
   * events per character. A change that made one action expand into hundreds of
   * instances would blow this long before it showed up as a timeout, and it
   * fails identically on any machine.
   */
  it("keeps per-character timeline size bounded across the whole roster", () => {
    for (const char of allCharacters) {
      const result = simulateRotation(
        [char],
        [
          { characterId: char.id, actionType: "skill" },
          { characterId: char.id, actionType: "normal" },
        ],
        testEnemy,
      );
      expect(
        result.timeline.length,
        `${char.id} emitted ${result.timeline.length} events for two actions`,
      ).toBeLessThanOrEqual(64);
    }
  });
});

// ============================================================================
// TASK #037: Comprehensive Validation Suites
// ============================================================================

describe("allCharactersExecution — Per-Level Datamined Talent Scaling", () => {
  it("proves Bennett Lv10 N1 deals strictly more damage than Lv1 N1, matching exact datamined table ratio", () => {
    const bennett = requireCharacter("bennett");
    const n1 = bennett.normalAttacks.hits[0]!;
    const scaling = n1.instances[0]!.scaling.find((s) => s.stat === "atk")!;
    expect(scaling).toBeDefined();

    const multL1 = talentValueAt(scaling.table, 1);
    const multL10 = talentValueAt(scaling.table, 10);
    expect(multL10).toBeGreaterThan(multL1);

    const expectedRatio = multL10 / multL1;

    const bennettL1: GenericCharacterDefinition = {
      ...bennett,
      talentLevels: { ...bennett.talentLevels, normal: 1 },
    };
    const bennettL10: GenericCharacterDefinition = {
      ...bennett,
      talentLevels: { ...bennett.talentLevels, normal: 10 },
    };

    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "normal" },
    ];

    const resL1 = simulateRotation([bennettL1], rotation, testEnemy);
    const resL10 = simulateRotation([bennettL10], rotation, testEnemy);

    expect(resL1.errors).toEqual([]);
    expect(resL10.errors).toEqual([]);
    expect(resL1.totalDamage).toBeGreaterThan(0);
    expect(resL10.totalDamage).toBeGreaterThan(resL1.totalDamage);

    const actualRatio = resL10.totalDamage / resL1.totalDamage;
    expect(actualRatio).toBeCloseTo(expectedRatio, 6);
  });

  it("proves Xiangling Lv10 N1 deals strictly more damage than Lv1 N1, matching exact datamined table ratio", () => {
    const xiangling = requireCharacter("xiangling");
    const n1 = xiangling.normalAttacks.hits[0]!;
    const scaling = n1.instances[0]!.scaling.find((s) => s.stat === "atk")!;
    expect(scaling).toBeDefined();

    const multL1 = talentValueAt(scaling.table, 1);
    const multL10 = talentValueAt(scaling.table, 10);
    expect(multL10).toBeGreaterThan(multL1);

    const expectedRatio = multL10 / multL1;

    const xianglingL1: GenericCharacterDefinition = {
      ...xiangling,
      talentLevels: { ...xiangling.talentLevels, normal: 1 },
    };
    const xianglingL10: GenericCharacterDefinition = {
      ...xiangling,
      talentLevels: { ...xiangling.talentLevels, normal: 10 },
    };

    const rotation: Rotation = [
      { characterId: xiangling.id, actionType: "normal" },
    ];

    const resL1 = simulateRotation([xianglingL1], rotation, testEnemy);
    const resL10 = simulateRotation([xianglingL10], rotation, testEnemy);

    expect(resL1.errors).toEqual([]);
    expect(resL10.errors).toEqual([]);
    expect(resL1.totalDamage).toBeGreaterThan(0);
    expect(resL10.totalDamage).toBeGreaterThan(resL1.totalDamage);

    const actualRatio = resL10.totalDamage / resL1.totalDamage;
    expect(actualRatio).toBeCloseTo(expectedRatio, 6);
  });

  it("proves Raiden Shogun Lv10 N1 deals strictly more damage than Lv1 N1, matching exact datamined table ratio", () => {
    const raiden = requireCharacter("raiden-shogun");
    const n1 = raiden.normalAttacks.hits[0]!;
    const scaling = n1.instances[0]!.scaling.find((s) => s.stat === "atk")!;
    expect(scaling).toBeDefined();

    const multL1 = talentValueAt(scaling.table, 1);
    const multL10 = talentValueAt(scaling.table, 10);
    expect(multL10).toBeGreaterThan(multL1);

    const expectedRatio = multL10 / multL1;

    const raidenL1: GenericCharacterDefinition = {
      ...raiden,
      talentLevels: { ...raiden.talentLevels, normal: 1 },
    };
    const raidenL10: GenericCharacterDefinition = {
      ...raiden,
      talentLevels: { ...raiden.talentLevels, normal: 10 },
    };

    const rotation: Rotation = [
      { characterId: raiden.id, actionType: "normal" },
    ];

    const resL1 = simulateRotation([raidenL1], rotation, testEnemy);
    const resL10 = simulateRotation([raidenL10], rotation, testEnemy);

    expect(resL1.errors).toEqual([]);
    expect(resL10.errors).toEqual([]);
    expect(resL1.totalDamage).toBeGreaterThan(0);
    expect(resL10.totalDamage).toBeGreaterThan(resL1.totalDamage);

    const actualRatio = resL10.totalDamage / resL1.totalDamage;
    expect(actualRatio).toBeCloseTo(expectedRatio, 6);
  });

  it("proves talent level clamping at boundaries (levels <= 0 clamp to Lv1, levels > 15 clamp to Lv15)", () => {
    const bennett = requireCharacter("bennett");
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "normal" },
    ];

    const bennettL0: GenericCharacterDefinition = {
      ...bennett,
      talentLevels: { ...bennett.talentLevels, normal: 0 },
    };
    const bennettL1: GenericCharacterDefinition = {
      ...bennett,
      talentLevels: { ...bennett.talentLevels, normal: 1 },
    };
    const bennettL15: GenericCharacterDefinition = {
      ...bennett,
      talentLevels: { ...bennett.talentLevels, normal: 15 },
    };
    const bennettL20: GenericCharacterDefinition = {
      ...bennett,
      talentLevels: { ...bennett.talentLevels, normal: 20 },
    };

    const resL0 = simulateRotation([bennettL0], rotation, testEnemy);
    const resL1 = simulateRotation([bennettL1], rotation, testEnemy);
    const resL15 = simulateRotation([bennettL15], rotation, testEnemy);
    const resL20 = simulateRotation([bennettL20], rotation, testEnemy);

    expect(resL0.totalDamage).toBe(resL1.totalDamage);
    expect(resL20.totalDamage).toBe(resL15.totalDamage);
    expect(resL15.totalDamage).toBeGreaterThan(resL1.totalDamage);
  });
});

describe("allCharactersExecution — Non-ATK Scaling & Stat Isolation", () => {
  const flatAtkBuff: Buff = {
    id: "flat-atk-buff-test",
    source: "bennett",
    targets: { scope: "party" },
    stacking: { mode: "refresh" },
    startTime: 0,
    duration: 10,
    modifiers: [{ stat: "atkFlat", value: 2000 }],
  };

  it("proves Yelan skill scales strictly off HP and is completely unaffected by flat ATK buffs", () => {
    const yelan = requireCharacter("yelan");
    // Verify datamined scaling declaration: Yelan skill instance scales on HP only
    const skillInstance = yelan.skill.instances[0]!;
    expect(skillInstance.scaling.length).toBeGreaterThan(0);
    expect(skillInstance.scaling.every((s) => s.stat === "hp")).toBe(true);

    const rotation: Rotation = [
      { characterId: yelan.id, actionType: "skill" },
    ];

    const baseline = simulateRotation([yelan], rotation, testEnemy);
    expect(baseline.errors).toEqual([]);
    expect(baseline.totalDamage).toBeGreaterThan(0);

    // With +2000 flat ATK buff: Yelan's skill damage must be byte-identical to baseline
    const withAtkBuff = simulateRotation([yelan], rotation, testEnemy, {
      buffResolver: makeBuffResolver({ buffs: [flatAtkBuff] }),
    });
    expect(withAtkBuff.errors).toEqual([]);
    expect(withAtkBuff.totalDamage).toBe(baseline.totalDamage);

    // With +10000 flat HP buff: Yelan's skill damage must scale strictly with HP
    const flatHpBuff: Buff = {
      id: "flat-hp-buff-test",
      source: "hydro-resonance",
      targets: { scope: "party" },
      stacking: { mode: "refresh" },
      startTime: 0,
      duration: 10,
      modifiers: [{ stat: "hpFlat", value: 10000 }],
    };
    const withHpBuff = simulateRotation([yelan], rotation, testEnemy, {
      buffResolver: makeBuffResolver({ buffs: [flatHpBuff] }),
    });
    expect(withHpBuff.errors).toEqual([]);
    expect(withHpBuff.totalDamage).toBeGreaterThan(baseline.totalDamage);

    const expectedHpRatio = (yelan.baseStats.hp + 10000) / yelan.baseStats.hp;
    expect(withHpBuff.totalDamage / baseline.totalDamage).toBeCloseTo(expectedHpRatio, 6);
  });

  it("proves Noelle skill scales strictly off DEF and is completely unaffected by flat ATK buffs", () => {
    const noelle = requireCharacter("noelle");
    // Verify datamined scaling declaration: Noelle skill instance scales on DEF only
    const skillInstance = noelle.skill.instances[0]!;
    expect(skillInstance.scaling.length).toBeGreaterThan(0);
    expect(skillInstance.scaling.every((s) => s.stat === "def")).toBe(true);

    const rotation: Rotation = [
      { characterId: noelle.id, actionType: "skill" },
    ];

    const baseline = simulateRotation([noelle], rotation, testEnemy);
    expect(baseline.errors).toEqual([]);
    expect(baseline.totalDamage).toBeGreaterThan(0);

    // With +2000 flat ATK buff: Noelle's skill damage must be byte-identical to baseline
    const withAtkBuff = simulateRotation([noelle], rotation, testEnemy, {
      buffResolver: makeBuffResolver({ buffs: [flatAtkBuff] }),
    });
    expect(withAtkBuff.errors).toEqual([]);
    expect(withAtkBuff.totalDamage).toBe(baseline.totalDamage);

    // With +1000 flat DEF buff: Noelle's skill damage must scale strictly with DEF
    const flatDefBuff: Buff = {
      id: "flat-def-buff-test",
      source: "gorou",
      targets: { scope: "party" },
      stacking: { mode: "refresh" },
      startTime: 0,
      duration: 10,
      modifiers: [{ stat: "defFlat", value: 1000 }],
    };
    const withDefBuff = simulateRotation([noelle], rotation, testEnemy, {
      buffResolver: makeBuffResolver({ buffs: [flatDefBuff] }),
    });
    expect(withDefBuff.errors).toEqual([]);
    expect(withDefBuff.totalDamage).toBeGreaterThan(baseline.totalDamage);

    const expectedDefRatio = (noelle.baseStats.def + 1000) / noelle.baseStats.def;
    expect(withDefBuff.totalDamage / baseline.totalDamage).toBeCloseTo(expectedDefRatio, 6);
  });

  it("verifies ATK-scaling character (Bennett) DOES gain damage from the flat ATK buff (control)", () => {
    const bennett = requireCharacter("bennett");
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
    ];

    const baseline = simulateRotation([bennett], rotation, testEnemy);
    const withAtkBuff = simulateRotation([bennett], rotation, testEnemy, {
      buffResolver: makeBuffResolver({ buffs: [flatAtkBuff] }),
    });

    expect(withAtkBuff.totalDamage).toBeGreaterThan(baseline.totalDamage);
    const expectedAtkRatio = (bennett.baseStats.atk + 2000) / bennett.baseStats.atk;
    expect(withAtkBuff.totalDamage / baseline.totalDamage).toBeCloseTo(expectedAtkRatio, 6);
  });
});

describe("allCharactersExecution — Reactions, Aura Decay & ICD in Team Rotations", () => {
  const bennett = requireCharacter("bennett");
  const xingqiu = requireCharacter("xingqiu");
  const barbara = requireCharacter("barbara");

  it("validates reaction damage carries across casts in a real Xingqiu + Bennett rotation", () => {
    // Bennett solo skill (baseline, unamplified)
    const soloBennett = simulateRotation(
      [bennett],
      [{ characterId: bennett.id, actionType: "skill" }],
      testEnemy,
    );
    expect(soloBennett.errors).toEqual([]);
    const soloBennettFirstHit = soloBennett.timeline.find(
      (e) => e.characterId === bennett.id && e.type === "damage",
    );
    expect(soloBennettFirstHit).toBeDefined();

    // Team rotation: Xingqiu skill -> swap to Bennett -> Bennett skill
    const teamRotation: Rotation = [
      { characterId: xingqiu.id, actionType: "skill" },
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "skill" },
    ];

    const vapeResult = simulateRotation([xingqiu, bennett], teamRotation, testEnemy);
    expect(vapeResult.errors).toEqual([]);

    // Find Bennett's first damage event in team rotation
    const vapeBennettFirstHit = vapeResult.timeline.find(
      (e) => e.characterId === bennett.id && e.type === "damage",
    );
    expect(vapeBennettFirstHit).toBeDefined();

    // Bennett's hit triggered Reverse Vaporize on the Hydro aura applied by Xingqiu!
    // Since Bennett has 0 EM, reverse vaporize multiplier is 1.5x
    expect(vapeBennettFirstHit!.damage!.finalDamage).toBeGreaterThan(
      soloBennettFirstHit!.damage!.finalDamage,
    );
    expect(
      vapeBennettFirstHit!.damage!.finalDamage /
        soloBennettFirstHit!.damage!.finalDamage,
    ).toBeCloseTo(1.5, 6);

    // Verify Hydro aura was consumed by the reaction in finalState
    const unreacted = simulateRotation(
      [xingqiu],
      [{ characterId: xingqiu.id, actionType: "skill" }],
      testEnemy,
    );
    const unreactedHydro = unreacted.finalState?.enemyAuras?.[testEnemy.id]?.auras.find(
      (a) => a.element === "hydro",
    );
    expect(unreactedHydro).toBeDefined();
    expect(unreactedHydro!.gauge).toBeGreaterThan(0);

    // In vapeResult, Bennett's 4 skill hits consumed the Hydro aura completely
    const remainingHydro = vapeResult.finalState?.enemyAuras?.[testEnemy.id]?.auras.find(
      (a) => a.element === "hydro",
    );
    expect(remainingHydro).toBeUndefined();

    // And Bennett's trailing hits applied Pyro aura
    const resultingPyro = vapeResult.finalState?.enemyAuras?.[testEnemy.id]?.auras.find(
      (a) => a.element === "pyro",
    );
    expect(resultingPyro).toBeDefined();
    expect(resultingPyro!.gauge).toBeGreaterThan(0);
  });

  it("validates aura decay over time across rotation casts and expires after duration", () => {
    // 1U Hydro aura from Xingqiu has duration = 2.5 * 1 + 7 = 9.5s.
    // Fast rotation: Xingqiu skill -> swap (0.6s) -> Bennett skill (hits at t=1.4s)
    // Elapsed since application is 0.6s < 9.5s => Hydro aura is alive => Vaporize triggers.
    const fastRotation: Rotation = [
      { characterId: xingqiu.id, actionType: "skill" },
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "skill" },
    ];
    const fastResult = simulateRotation([xingqiu, bennett], fastRotation, testEnemy);
    const fastBennettHit = fastResult.timeline.find(
      (e) => e.characterId === bennett.id && e.type === "damage",
    )!;

    // Slow rotation: Xingqiu skill -> alternating swaps to legally advance clock past 9.5s -> Bennett skill
    // Hydro aura decays to 0 and expires before Bennett attacks!
    const slowSwaps: Rotation = [];
    for (let i = 0; i < 8; i++) {
      slowSwaps.push({ characterId: bennett.id, actionType: "swap" });
      slowSwaps.push({ characterId: xingqiu.id, actionType: "swap" });
    }
    slowSwaps.push({ characterId: bennett.id, actionType: "swap" });
    // 17 alternating swaps = 17 * 0.6s = 10.2s > 9.5s duration!

    const slowRotation: Rotation = [
      { characterId: xingqiu.id, actionType: "skill" },
      ...slowSwaps,
      { characterId: bennett.id, actionType: "skill" },
    ];
    const slowResult = simulateRotation([xingqiu, bennett], slowRotation, testEnemy);
    expect(slowResult.errors).toEqual([]);
    const slowBennettHit = slowResult.timeline.find(
      (e) => e.characterId === bennett.id && e.type === "damage",
    )!;

    // Fast Bennett hit triggered Vaporize (1.5x)
    // Slow Bennett hit had NO aura remaining (decayed past 9.5s), so it dealt unamplified baseline damage!
    expect(fastBennettHit.damage!.finalDamage).toBeGreaterThan(
      slowBennettHit.damage!.finalDamage,
    );
    expect(
      fastBennettHit.damage!.finalDamage / slowBennettHit.damage!.finalDamage,
    ).toBeCloseTo(1.5, 6);

    const soloBennett = simulateRotation(
      [bennett],
      [{ characterId: bennett.id, actionType: "skill" }],
      testEnemy,
    );
    const soloBennettHit = soloBennett.timeline.find(
      (e) => e.characterId === bennett.id && e.type === "damage",
    )!;
    expect(slowBennettHit.damage!.finalDamage).toBeCloseTo(
      soloBennettHit.damage!.finalDamage,
      6,
    );

    // Furthermore, prove monotonic linear aura decay on unreacted target across rotation duration
    const shortWait = simulateRotation(
      [xingqiu, bennett],
      [
        { characterId: xingqiu.id, actionType: "skill" },
        { characterId: bennett.id, actionType: "swap" },
      ],
      testEnemy,
    );
    const longWait = simulateRotation(
      [xingqiu, bennett],
      [
        { characterId: xingqiu.id, actionType: "skill" },
        { characterId: bennett.id, actionType: "swap" },
        { characterId: xingqiu.id, actionType: "swap" },
        { characterId: bennett.id, actionType: "swap" },
        { characterId: xingqiu.id, actionType: "swap" },
      ],
      testEnemy,
    );
    const shortAura = shortWait.finalState?.enemyAuras?.[testEnemy.id]?.auras[0];
    const longAura = longWait.finalState?.enemyAuras?.[testEnemy.id]?.auras[0];
    expect(shortAura).toBeDefined();
    expect(longAura).toBeDefined();

    // Stored aura.gauge is the base gauge at since; gaugeAt evaluates the linear decay at any time t
    const shortDecayed = gaugeAt(shortAura! as unknown as Aura, shortWait.finalState!.time);
    const longDecayed = gaugeAt(longAura! as unknown as Aura, longWait.finalState!.time);
    expect(shortDecayed).toBeLessThan(0.8);
    expect(longDecayed).toBeLessThan(shortDecayed);
    expect(longDecayed).toBeGreaterThan(0);
  });

  it("validates ICD carries across rotation casts, swaps, and 3-hit / 2.5s timer boundaries", () => {
    // Equip Barbara with standard ICD on normal attacks
    const barbaraWithIcd: GenericCharacterDefinition = {
      ...barbara,
      normalAttacks: {
        ...barbara.normalAttacks,
        hits: barbara.normalAttacks.hits.map((hit) => ({
          ...hit,
          instances: hit.instances.map((inst) => ({
            ...inst,
            application: inst.application
              ? { ...inst.application, icdGroup: "barbara-na" }
              : undefined,
          })),
        })),
      },
    };

    // 4 consecutive normals in string: N1, N2, N3, N4
    // N1 (t=0) -> hit 1: applies Hydro (window start)
    // N2 (t=0.4s) -> hit 2: ICD suppresses (<3 hits, <2.5s)
    // N3 (t=0.8s) -> hit 3: ICD suppresses (<3 hits, <2.5s)
    // N4 (t=1.2s) -> hit 4: applies Hydro (3-hit counter rule satisfied!)
    const fourNormals: Rotation = [
      { characterId: barbaraWithIcd.id, actionType: "normal" },
      { characterId: barbaraWithIcd.id, actionType: "normal" },
      { characterId: barbaraWithIcd.id, actionType: "normal" },
      { characterId: barbaraWithIcd.id, actionType: "normal" },
    ];

    const fourNormalsRes = simulateRotation([barbaraWithIcd], fourNormals, testEnemy);
    expect(fourNormalsRes.errors).toEqual([]);

    // Check ICD counter in finalState
    const icdState = fourNormalsRes.finalState?.characters[barbaraWithIcd.id]?.icd;
    expect(icdState).toBeDefined();
    expect(icdState!["barbara-na"]).toBeDefined();
    expect(icdState!["barbara-na"]!.hitsInWindow).toBe(4);

    // Verify ICD persistence across team swaps:
    // Barbara N1 -> swap Bennett -> Bennett skill -> swap Barbara -> Barbara N2
    // N1 is hit 1 at t=0.
    // Swaps and Bennett skill take 0.4s + 0.6s + 0.8s + 0.6s = 2.4s (< 2.5s window).
    // When Barbara casts N2 at t=2.4s, hit 2 is still in window -> ICD counter carried through swap!
    const swapRotation: Rotation = [
      { characterId: barbaraWithIcd.id, actionType: "normal" }, // t=0: N1 (hit 1, applies)
      { characterId: bennett.id, actionType: "swap" },          // t=0.4: swap
      { characterId: bennett.id, actionType: "skill" },         // t=1.0: Bennett E
      { characterId: barbaraWithIcd.id, actionType: "swap" },   // t=1.8: swap back
      { characterId: barbaraWithIcd.id, actionType: "normal" }, // t=2.4: N2 (hit 2, in same window!)
    ];

    const swapRes = simulateRotation([barbaraWithIcd, bennett], swapRotation, testEnemy);
    expect(swapRes.errors).toEqual([]);
    const swapIcd = swapRes.finalState?.characters[barbaraWithIcd.id]?.icd;
    expect(swapIcd!["barbara-na"]!.hitsInWindow).toBe(2);

    // Verify 2.5s timer reset across casts:
    // If instead of 2.4s, Barbara waits > 2.5s via alternating swaps (e.g. 6 swaps = 3.6s):
    // N2 lands at t=4.0s > 2.5s -> window resets to hitsInWindow: 1!
    const resetRotation: Rotation = [
      { characterId: barbaraWithIcd.id, actionType: "normal" }, // t=0: N1 (hit 1, castTime 0.4s)
      { characterId: bennett.id, actionType: "swap" },          // t=0.4: swap (0.6s)
      { characterId: barbaraWithIcd.id, actionType: "swap" },   // t=1.0: swap (0.6s)
      { characterId: bennett.id, actionType: "swap" },          // t=1.6: swap (0.6s)
      { characterId: barbaraWithIcd.id, actionType: "swap" },   // t=2.2: swap (0.6s)
      { characterId: bennett.id, actionType: "swap" },          // t=2.8: swap (0.6s)
      { characterId: barbaraWithIcd.id, actionType: "swap" },   // t=3.4: swap (0.6s)
      { characterId: barbaraWithIcd.id, actionType: "normal" }, // t=4.0s > 2.5s: N2 (window reset!)
    ];
    const resetRes = simulateRotation([barbaraWithIcd, bennett], resetRotation, testEnemy);
    expect(resetRes.errors).toEqual([]);
    const resetIcd = resetRes.finalState?.characters[barbaraWithIcd.id]?.icd;
    expect(resetIcd!["barbara-na"]!.hitsInWindow).toBe(1);
  });

  it("proves sharp aura duration boundary (reaction triggers at t=9.4s, fails at t=9.6s for 1U aura)", () => {
    // 1U Hydro aura base duration is 9.5s (2.5 * 1 + 7).
    // Xingqiu skill cast time is 0.8s (Hydro applied at t=0).
    // Setting swapCost to 8.6s lands Bennett skill at t=9.4s (inside window => Vaporize triggers).
    // Setting swapCost to 8.8s lands Bennett skill at t=9.6s (outside window => Aura expired, no reaction).
    const rotation: Rotation = [
      { characterId: xingqiu.id, actionType: "skill" },
      { characterId: bennett.id, actionType: "swap" },
      { characterId: bennett.id, actionType: "skill" },
    ];

    const insideRes = simulateRotation([xingqiu, bennett], rotation, testEnemy, {
      swapCost: 8.6,
    });
    const outsideRes = simulateRotation([xingqiu, bennett], rotation, testEnemy, {
      swapCost: 8.8,
    });

    const insideHit = insideRes.timeline.find(
      (e) => e.characterId === bennett.id && e.type === "damage",
    )!;
    const outsideHit = outsideRes.timeline.find(
      (e) => e.characterId === bennett.id && e.type === "damage",
    )!;

    // Inside the 9.5s window: Vaporize amplifies damage by 1.5x
    // Outside the 9.5s window: Hydro aura has expired, dealing base unamplified damage
    expect(insideHit.damage!.finalDamage / outsideHit.damage!.finalDamage).toBeCloseTo(1.5, 6);
  });
});

