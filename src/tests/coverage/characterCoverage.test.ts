import { describe, expect, it } from "vitest";
import * as fs from "node:fs";

import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { syntheticUnit } from "@/simulation/character/fixtures";
import { flatTalent, talentTable } from "@/simulation/character/talent";
import type { KitAbility } from "@/simulation/character/kit";
import {
  buildCharacterCoverage,
  buildCoverageMatrix,
  compareTiers,
  deriveTier,
  derivedTierForClaim,
  findClaimDisagreements,
  reconcileClaim,
  renderCoverageReport,
  unverifiedMechanicIds,
  worstTier,
} from "@/tests/coverage/characterCoverage";
import type {
  CoverageGap,
  SupportTier,
  TestEvidence,
} from "@/tests/coverage/characterCoverage";
import type { SupportClaim } from "@/types";
import { allCharacters } from "@/game-data/characters/registry";
import { ALL_CHARACTERS_TEST_EVIDENCE } from "@/tests/allCharactersExecution.test";

// ============================================================================
// CHARACTER COVERAGE MATRIX — proof on synthetic fixtures (TASK #024).
//
// No real character data exists yet (Phase B is gated on cross-source
// verification), so this proves the MACHINERY, not any roster.
//
// The load-bearing assertion in this file is not "the report renders". It is
// that the tier is DERIVED: mutating a character's kit or its test evidence
// must move the tier, with no list anywhere to edit. Every derivation test
// below therefore builds a MUTATED clone of a fixture and asserts the tier
// changed — that is the same discipline as mutation-verifying an assertion.
// ============================================================================

// ---------------------------------------------------------------------------
// Fixture helpers. Clones are structural so no test mutates a shared fixture.
// ---------------------------------------------------------------------------

function clone(def: GenericCharacterDefinition): GenericCharacterDefinition {
  return structuredClone(def) as GenericCharacterDefinition;
}

/**
 * A minimal, fully-expressible character: no resources, no summons, no
 * infusion, no EM-only instance, no untriggerable reaction. This is the ONLY
 * shape that can reach FULLY SUPPORTED, and building it by hand proves the
 * tier is reachable rather than vacuously unreachable.
 */
function simpleAbility(overrides: Partial<KitAbility> = {}): KitAbility {
  return {
    id: "simple-skill",
    name: "Simple Skill",
    slot: "skill",
    castTime: 1,
    cooldown: flatTalent(6),
    energyCost: 0,
    particles: { count: 3, element: "geo" },
    instances: [
      {
        id: "simple-hit",
        name: "Hit",
        damageType: "skill",
        element: "geo",
        scaling: [{ stat: "atk", table: flatTalent(2) }],
        application: { element: "geo", gauge: 1 },
      },
    ],
    ...overrides,
  };
}

/**
 * A single modelled effect, so a fixture can represent a perk that IS
 * simulatable. `simpleUnit` is the "nothing detectably wrong" fixture, and
 * since TASK #049 an effectless perk IS something detectably wrong
 * (`unmodelled-perk-effects`), so its perks must carry real effects to keep
 * FULLY SUPPORTED reachable.
 */
const modelledEffect = {
  resourceId: "simple-stacks",
  kind: "gain",
  amount: 1,
} as const;

const simpleUnit: GenericCharacterDefinition = {
  ...clone(syntheticUnit),
  id: "simple-unit",
  name: "Simple Geo Unit",
  element: "geo",
  resources: [],
  // Perks are MODELLED here. `syntheticUnit` deliberately leaves most of its
  // perks effectless (it is the maximal not-supported fixture); inheriting
  // that would make the top tier unreachable and this fixture vacuous.
  passives: clone(syntheticUnit).passives.map((passive) => ({
    ...passive,
    effects: [modelledEffect],
  })),
  constellations: clone(syntheticUnit).constellations.map((constellation) => ({
    ...constellation,
    effects: [modelledEffect],
  })),
  normalAttacks: {
    hits: [
      simpleAbility({
        id: "simple-n1",
        name: "Simple N1",
        slot: "normal",
        castTime: 0.5,
        cooldown: flatTalent(0),
        instances: [
          {
            id: "simple-n1-hit",
            name: "Hit",
            damageType: "normal",
            element: "physical",
            scaling: [{ stat: "atk", table: flatTalent(0.5) }],
          },
        ],
      }),
    ],
    loops: true,
  },
  skill: simpleAbility(),
  burst: simpleAbility({
    id: "simple-burst",
    name: "Simple Burst",
    slot: "burst",
    energyCost: 40,
    cooldown: flatTalent(15),
    castTime: 1.5,
  }),
};

/** Full evidence: every assertion channel covered. */
function fullEvidence(characterId: string, suiteId = "suite-a"): TestEvidence {
  return {
    suiteId,
    characterIds: [characterId],
    asserts: { damage: true, energy: true, reaction: true },
  };
}

function tierOf(
  def: GenericCharacterDefinition,
  evidence: readonly TestEvidence[],
): SupportTier {
  return buildCharacterCoverage(def, evidence).tier;
}

function gapKinds(gaps: readonly CoverageGap[]): readonly string[] {
  return gaps.map((gap) => gap.kind);
}

// ---------------------------------------------------------------------------
// Tier algebra
// ---------------------------------------------------------------------------

describe("support tier algebra", () => {
  it("orders tiers best-to-worst", () => {
    expect(
      compareTiers("FULLY SUPPORTED", "BASIC SUPPORT"),
    ).toBeLessThan(0);
    expect(
      compareTiers("BASIC SUPPORT", "SPECIAL MECHANICS NOT YET IMPLEMENTED"),
    ).toBeLessThan(0);
    expect(compareTiers("BASIC SUPPORT", "BASIC SUPPORT")).toBe(0);
  });

  it("worstTier picks the lower of two, in either argument order", () => {
    expect(worstTier("FULLY SUPPORTED", "BASIC SUPPORT")).toBe("BASIC SUPPORT");
    expect(worstTier("BASIC SUPPORT", "FULLY SUPPORTED")).toBe("BASIC SUPPORT");
    expect(
      worstTier("BASIC SUPPORT", "SPECIAL MECHANICS NOT YET IMPLEMENTED"),
    ).toBe("SPECIAL MECHANICS NOT YET IMPLEMENTED");
  });

  it("no gaps means FULLY SUPPORTED; the worst gap wins", () => {
    expect(deriveTier([])).toBe("FULLY SUPPORTED");
    expect(
      deriveTier([
        { kind: "untested", scope: "c", detail: "x", forcesTier: "BASIC SUPPORT" },
      ]),
    ).toBe("BASIC SUPPORT");
    expect(
      deriveTier([
        { kind: "untested", scope: "c", detail: "x", forcesTier: "BASIC SUPPORT" },
        {
          kind: "element-infusion",
          scope: "a",
          detail: "y",
          forcesTier: "SPECIAL MECHANICS NOT YET IMPLEMENTED",
        },
      ]),
    ).toBe("SPECIAL MECHANICS NOT YET IMPLEMENTED");
  });

  it("gap order does not change the derived tier", () => {
    const a: CoverageGap = {
      kind: "untested",
      scope: "c",
      detail: "x",
      forcesTier: "BASIC SUPPORT",
    };
    const b: CoverageGap = {
      kind: "healing-or-shielding",
      scope: "a",
      detail: "y",
      forcesTier: "SPECIAL MECHANICS NOT YET IMPLEMENTED",
    };
    expect(deriveTier([a, b])).toBe(deriveTier([b, a]));
  });
});

// ---------------------------------------------------------------------------
// The matrix columns
// ---------------------------------------------------------------------------

describe("matrix columns: Character -> Skills -> Damage -> Element -> Energy -> Cooldown", () => {
  const coverage = buildCharacterCoverage(
    syntheticUnit,
    [fullEvidence(syntheticUnit.id)],
  );

  it("covers EVERY ability the character exposes, in the contract order", () => {
    // `allAbilities()` guarantees N-string, charged, plunges, skill, burst.
    expect(coverage.abilities.map((a) => a.id)).toEqual([
      "synthetic-n1",
      "synthetic-skill",
      "synthetic-burst",
    ]);
    expect(coverage.abilities.map((a) => a.slot)).toEqual([
      "normal",
      "skill",
      "burst",
    ]);
  });

  it("DAMAGE column records every instance and its scaling stats", () => {
    const n1 = coverage.abilities.find((a) => a.id === "synthetic-n1")!;
    expect(n1.instances).toHaveLength(2);
    expect(n1.instances.map((i) => i.id)).toEqual(["n1-hit1", "n1-hit2"]);
    expect(n1.instances[0]?.scalingStats).toEqual(["atk"]);

    // Hybrid scaling is preserved in authored order, deduplicated.
    const skill = coverage.abilities.find((a) => a.id === "synthetic-skill")!;
    expect(skill.instances[0]?.scalingStats).toEqual(["atk", "hp"]);
  });

  it("ELEMENT column records the element and the applied gauge separately", () => {
    const n1 = coverage.abilities.find((a) => a.id === "synthetic-n1")!;
    // Physical N1 applies nothing.
    expect(n1.instances[0]?.element).toBe("physical");
    expect(n1.instances[0]?.gauge).toBe(0);

    const skill = coverage.abilities.find((a) => a.id === "synthetic-skill")!;
    expect(skill.instances[0]?.element).toBe("hydro");
    expect(skill.instances[0]?.gauge).toBe(1);
    expect(skill.instances[0]?.icdGroup).toBe("synthetic-skill");

    // The burst declares no icdGroup, so the column is absent, not guessed.
    const burst = coverage.abilities.find((a) => a.id === "synthetic-burst")!;
    expect(burst.instances[0]?.gauge).toBe(2);
    expect(burst.instances[0]?.icdGroup).toBeUndefined();
  });

  it("ENERGY column separates cost, particles and flat generation", () => {
    const skill = coverage.abilities.find((a) => a.id === "synthetic-skill")!;
    expect(skill.energyCost).toBe(0);
    expect(skill.particleCount).toBe(3);
    expect(skill.particleElement).toBe("hydro");
    expect(skill.flatEnergyGenerated).toBe(0);

    const burst = coverage.abilities.find((a) => a.id === "synthetic-burst")!;
    expect(burst.energyCost).toBe(40);
    expect(burst.particleCount).toBe(0);
    expect(burst.particleElement).toBeUndefined();
  });

  it("COOLDOWN column resolves the talent table at the character's OWN talent level", () => {
    // The fixture's skill table is [6, 5.5, 5] and its skill talent is 2.
    expect(syntheticUnit.talentLevels.skill).toBe(2);
    const skill = coverage.abilities.find((a) => a.id === "synthetic-skill")!;
    expect(skill.cooldownSeconds).toBe(5.5);

    // Not the level-1 value — the lookup is real, not a first-entry read.
    expect(skill.cooldownSeconds).not.toBe(6);
  });

  it("COOLDOWN column moves when the talent level moves (the lookup is live)", () => {
    const levelled = clone(syntheticUnit);
    levelled.talentLevels = { ...levelled.talentLevels, skill: 3 };
    const skill = buildCharacterCoverage(levelled, []).abilities.find(
      (a) => a.id === "synthetic-skill",
    )!;
    expect(skill.cooldownSeconds).toBe(5);
  });

  it("REACTION column is derived from the reaction TABLE, not a per-character list", () => {
    // The synthetic unit applies hydro, so exactly hydro's table row appears.
    const kinds = coverage.reactions.map((r) => `${r.kind}:${r.auraElement}`);
    expect(kinds).toEqual([
      "vaporize:pyro",
      "electroCharged:electro",
      "frozen:cryo",
      "bloom:dendro",
    ]);
    expect(coverage.reactions.every((r) => r.asTrigger)).toBe(true);
  });

  it("REACTION column changes when the applied element changes", () => {
    const pyroised = clone(syntheticUnit);
    for (const instance of pyroised.skill.instances) {
      instance.element = "pyro";
      if (instance.application) instance.application.element = "pyro";
    }
    for (const instance of pyroised.burst.instances) {
      instance.element = "pyro";
      if (instance.application) instance.application.element = "pyro";
    }
    const kinds = buildCharacterCoverage(pyroised, []).reactions.map(
      (r) => `${r.kind}:${r.auraElement}`,
    );
    expect(kinds).toEqual([
      "vaporize:hydro",
      "overloaded:electro",
      "melt:cryo",
      "burning:dendro",
    ]);
  });

  it("a character applying NO element reaches no reactions at all", () => {
    const inert = clone(syntheticUnit);
    for (const ability of [inert.skill, inert.burst]) {
      for (const instance of ability.instances) delete instance.application;
    }
    expect(buildCharacterCoverage(inert, []).reactions).toEqual([]);
  });

  it("SPECIAL MECHANICS column lists resources, passives and constellations", () => {
    expect(coverage.resourceIds).toEqual(["synthetic-stacks"]);
    expect(coverage.passiveIds).toEqual(["synthetic-a1", "synthetic-a4"]);
    expect(coverage.constellationIds).toEqual([
      "synthetic-c1",
      "synthetic-c4",
    ]);
    const skill = coverage.abilities.find((a) => a.id === "synthetic-skill")!;
    expect(skill.stateEffectResourceIds).toEqual(["synthetic-stacks"]);
  });

  it("TESTS column reflects the evidence it was given, and only that", () => {
    expect(coverage.tests.suiteIds).toEqual(["suite-a"]);
    expect(coverage.tests.damageAsserted).toBe(true);

    const partial = buildCharacterCoverage(syntheticUnit, [
      {
        suiteId: "suite-b",
        characterIds: [syntheticUnit.id],
        asserts: { damage: true },
      },
    ]);
    expect(partial.tests.suiteIds).toEqual(["suite-b"]);
    expect(partial.tests.damageAsserted).toBe(true);
    expect(partial.tests.energyAsserted).toBe(false);
    expect(partial.tests.reactionAsserted).toBe(false);
  });

  it("evidence for a DIFFERENT character does not count", () => {
    const wrong = buildCharacterCoverage(syntheticUnit, [
      fullEvidence("some-other-character"),
    ]);
    expect(wrong.tests.suiteIds).toEqual([]);
    expect(wrong.tests.damageAsserted).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// THE LOAD-BEARING PART: tiers are DERIVED, not listed
// ---------------------------------------------------------------------------

describe("support tier is DERIVED from kit data + test evidence", () => {
  it("FULLY SUPPORTED is REACHABLE (the top tier is not vacuous)", () => {
    expect(tierOf(simpleUnit, [fullEvidence(simpleUnit.id)])).toBe(
      "FULLY SUPPORTED",
    );
    expect(
      buildCharacterCoverage(simpleUnit, [fullEvidence(simpleUnit.id)]).gaps,
    ).toEqual([]);
  });

  it("removing test evidence demotes FULLY SUPPORTED -> BASIC SUPPORT", () => {
    const covered = buildCharacterCoverage(simpleUnit, []);
    expect(covered.tier).toBe("BASIC SUPPORT");
    expect(gapKinds(covered.gaps)).toEqual(["untested"]);
    expect(covered.gaps[0]?.detail).toContain("No test suite");
  });

  it("PARTIAL test evidence still demotes, and names what is missing", () => {
    const covered = buildCharacterCoverage(simpleUnit, [
      {
        suiteId: "suite-partial",
        characterIds: [simpleUnit.id],
        asserts: { damage: true, energy: true },
      },
    ]);
    expect(covered.tier).toBe("BASIC SUPPORT");
    expect(covered.gaps[0]?.detail).toContain("reaction");
    expect(covered.gaps[0]?.detail).not.toContain("damage");
  });

  it("declaring a RESOURCE demotes to SPECIAL MECHANICS NOT YET IMPLEMENTED", () => {
    const withResource = clone(simpleUnit);
    withResource.resources = [
      { id: "some-stacks", name: "Some Stacks", initial: 0, max: 3 },
    ];
    const covered = buildCharacterCoverage(withResource, [
      fullEvidence(simpleUnit.id),
    ]);
    expect(covered.tier).toBe("SPECIAL MECHANICS NOT YET IMPLEMENTED");
    expect(gapKinds(covered.gaps)).toContain("conditional-resource-effect");
    expect(covered.gaps[0]?.detail).toContain("some-stacks");
  });

  it("an ability with NO damage instances is flagged as healing/shielding", () => {
    const healer = clone(simpleUnit);
    healer.skill = { ...healer.skill, instances: [] };
    const covered = buildCharacterCoverage(healer, [fullEvidence(simpleUnit.id)]);
    expect(covered.tier).toBe("SPECIAL MECHANICS NOT YET IMPLEMENTED");
    expect(gapKinds(covered.gaps)).toContain("healing-or-shielding");
  });

  it("an instance landing AFTER its cast ends is flagged as an off-field source", () => {
    const summoner = clone(simpleUnit);
    summoner.skill = {
      ...summoner.skill,
      castTime: 1,
      instances: [{ ...summoner.skill.instances[0]!, delay: 4 }],
    };
    const covered = buildCharacterCoverage(summoner, [
      fullEvidence(simpleUnit.id),
    ]);
    expect(covered.tier).toBe("SPECIAL MECHANICS NOT YET IMPLEMENTED");
    expect(gapKinds(covered.gaps)).toContain("offfield-persistent-source");

    // ...but an instance INSIDE the cast window is fine (no false positive).
    const multihit = clone(simpleUnit);
    multihit.skill = {
      ...multihit.skill,
      castTime: 1,
      instances: [{ ...multihit.skill.instances[0]!, delay: 0.5 }],
    };
    expect(
      gapKinds(buildCharacterCoverage(multihit, [fullEvidence(simpleUnit.id)]).gaps),
    ).not.toContain("offfield-persistent-source");
  });

  it("an applied element differing from the priced element is flagged as INFUSION", () => {
    const infused = clone(simpleUnit);
    infused.skill = {
      ...infused.skill,
      instances: [
        {
          ...infused.skill.instances[0]!,
          element: "physical",
          application: { element: "geo", gauge: 1 },
        },
      ],
    };
    const covered = buildCharacterCoverage(infused, [fullEvidence(simpleUnit.id)]);
    expect(covered.tier).toBe("SPECIAL MECHANICS NOT YET IMPLEMENTED");
    expect(gapKinds(covered.gaps)).toContain("element-infusion");
  });

  it("an EM-only instance is flagged as a reaction-scaling instance", () => {
    const emScaler = clone(simpleUnit);
    emScaler.skill = {
      ...emScaler.skill,
      instances: [
        {
          ...emScaler.skill.instances[0]!,
          scaling: [{ stat: "elementalMastery", table: flatTalent(6) }],
        },
      ],
    };
    const covered = buildCharacterCoverage(emScaler, [
      fullEvidence(simpleUnit.id),
    ]);
    expect(covered.tier).toBe("SPECIAL MECHANICS NOT YET IMPLEMENTED");
    expect(gapKinds(covered.gaps)).toContain("reaction-scaling-instance");

    // A HYBRID instance that merely includes EM is NOT flagged — the detector
    // is specific, not a blanket "mentions EM" match.
    const hybrid = clone(simpleUnit);
    hybrid.skill = {
      ...hybrid.skill,
      instances: [
        {
          ...hybrid.skill.instances[0]!,
          scaling: [
            { stat: "atk", table: flatTalent(2) },
            { stat: "elementalMastery", table: flatTalent(6) },
          ],
        },
      ],
    };
    expect(
      gapKinds(buildCharacterCoverage(hybrid, [fullEvidence(simpleUnit.id)]).gaps),
    ).not.toContain("reaction-scaling-instance");
  });

  it("an ability with an explicit INFUSION is recognized and not flagged as an inexpressible gap (TASK #025)", () => {
    const infused = clone(simpleUnit);
    infused.skill = {
      ...infused.skill,
      infusion: {
        id: "geo-infusion",
        element: "geo",
        durationSeconds: 10,
        canBeOverridden: false,
      },
      instances: [
        {
          ...infused.skill.instances[0]!,
          element: "physical",
          application: { element: "geo", gauge: 1 },
        },
      ],
    };
    const covered = buildCharacterCoverage(infused, [fullEvidence(simpleUnit.id)]);
    expect(gapKinds(covered.gaps)).not.toContain("element-infusion");
    const skillCov = covered.abilities.find((a) => a.id === infused.skill.id);
    expect(skillCov?.infusion).toBeDefined();
    expect(skillCov?.infusion?.element).toBe("geo");
    expect(skillCov?.infusion?.durationSeconds).toBe(10);
  });

  it("coordinated attacks / TRIGGERS are captured in ability coverage (TASK #025 / #026)", () => {
    const withTriggers = clone(simpleUnit);
    withTriggers.burst = {
      ...withTriggers.burst,
      triggers: [
        {
          id: "coordinated-raincutter",
          name: "Raincutter Proc",
          trigger: "onNormalAttack",
          durationSeconds: 15,
          icdSeconds: 1,
          sourceCharacterId: withTriggers.id,
        },
      ],
    };
    const covered = buildCharacterCoverage(withTriggers, [fullEvidence(simpleUnit.id)]);
    const burstCov = covered.abilities.find((a) => a.id === withTriggers.burst.id);
    expect(burstCov?.triggers).toHaveLength(1);
    expect(burstCov?.triggers![0]?.id).toBe("coordinated-raincutter");
    expect(burstCov?.triggers![0]?.trigger).toBe("onNormalAttack");
  });

  it("alternate combat STANCE is captured in ability coverage (TASK #025 / #026)", () => {
    const withStance = clone(simpleUnit);
    withStance.skill = {
      ...withStance.skill,
      stance: {
        id: "oni-stance",
        name: "Raging Oni King",
        durationSeconds: 11,
      },
    };
    const covered = buildCharacterCoverage(withStance, [fullEvidence(simpleUnit.id)]);
    const skillCov = covered.abilities.find((a) => a.id === withStance.skill.id);
    expect(skillCov?.hasStance).toBe(true);
  });

  it("STAT CONVERSIONS are captured in character coverage (TASK #025 / #026)", () => {
    const withConversions = {
      ...clone(simpleUnit),
      statConversions: [{ sourceStat: "hp", targetStat: "atkFlat" }],
    };
    const covered = buildCharacterCoverage(withConversions as GenericCharacterDefinition, [
      fullEvidence(simpleUnit.id),
    ]);
    expect(covered.statConversions).toContain("hp -> atkFlat");
  });

  it("the synthetic fixture is correctly NOT fully supported (it declares a resource)", () => {
    // The fixture is deliberately maximal, so this is the honest answer. If
    // this ever reports FULLY SUPPORTED, the detectors have gone blind.
    const covered = buildCharacterCoverage(syntheticUnit, [
      fullEvidence(syntheticUnit.id),
    ]);
    expect(covered.tier).toBe("SPECIAL MECHANICS NOT YET IMPLEMENTED");
    // TWO gaps since TASK #049: the declared resource (which forces the worst
    // tier) and the fixture's deliberately effectless perks. `gapKinds` is
    // sorted, so this order is stable.
    expect(gapKinds(covered.gaps)).toEqual([
      "conditional-resource-effect",
      "unmodelled-perk-effects",
    ]);
  });

  it("every gap carries a substantive, non-placeholder reason", () => {
    const withEverything = clone(syntheticUnit);
    withEverything.skill = { ...withEverything.skill, instances: [] };
    const covered = buildCharacterCoverage(withEverything, []);
    expect(covered.gaps.length).toBeGreaterThanOrEqual(3);
    for (const gap of covered.gaps) {
      expect(gap.detail.length).toBeGreaterThan(40);
      expect(gap.detail).not.toMatch(/^TBD/i);
      expect(gap.scope.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Matrix + report
// ---------------------------------------------------------------------------

describe("coverage matrix and report generation", () => {
  const registry: readonly GenericCharacterDefinition[] = [
    syntheticUnit,
    simpleUnit,
  ];
  const evidence: readonly TestEvidence[] = [
    fullEvidence(simpleUnit.id, "coverage-suite"),
  ];

  it("counts characters per tier", () => {
    const matrix = buildCoverageMatrix(registry, evidence);
    expect(matrix.characters).toHaveLength(2);
    expect(matrix.tierCounts).toEqual({
      "FULLY SUPPORTED": 1,
      "BASIC SUPPORT": 0,
      "SPECIAL MECHANICS NOT YET IMPLEMENTED": 1,
    });
  });

  it("output order is by character id, NOT registry order", () => {
    const forward = buildCoverageMatrix(registry, evidence);
    const reversed = buildCoverageMatrix([...registry].reverse(), evidence);
    expect(reversed).toEqual(forward);
    expect(forward.characters.map((c) => c.id)).toEqual([
      "simple-unit",
      "synthetic-unit",
    ]);
  });

  it("does not mutate the registry it is given", () => {
    const before = structuredClone(registry);
    buildCoverageMatrix(registry, evidence);
    expect(registry).toEqual(before);
  });

  it("the report is DETERMINISTIC — byte-identical across runs", () => {
    const matrix = buildCoverageMatrix(registry, evidence);
    const a = renderCoverageReport(matrix);
    const b = renderCoverageReport(buildCoverageMatrix(registry, evidence));
    expect(b).toBe(a);
    // No timestamp, no locale-dependent number formatting.
    expect(a).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it("the report contains every required matrix column heading", () => {
    const report = renderCoverageReport(buildCoverageMatrix(registry, evidence));
    for (const heading of [
      "Skills / Damage / Element / Energy / Cooldown",
      "Reactions reachable",
      "Special mechanics",
      "Tests",
      "Gaps forcing the tier",
    ]) {
      expect(report).toContain(heading);
    }
  });

  it("the report states each character's tier and its gap reasons", () => {
    const report = renderCoverageReport(buildCoverageMatrix(registry, evidence));
    expect(report).toContain("**Support tier:** FULLY SUPPORTED");
    expect(report).toContain(
      "**Support tier:** SPECIAL MECHANICS NOT YET IMPLEMENTED",
    );
    expect(report).toContain("conditional-resource-effect");
    expect(report).toContain("synthetic-stacks");
  });

  it("the report reflects a tier CHANGE (it is generated, not pasted)", () => {
    const withoutEvidence = renderCoverageReport(
      buildCoverageMatrix(registry, []),
    );
    expect(withoutEvidence).toContain("**Support tier:** BASIC SUPPORT");
    expect(withoutEvidence).not.toContain("**Support tier:** FULLY SUPPORTED");
  });

  it("an EMPTY registry produces a valid, empty report rather than throwing", () => {
    const matrix = buildCoverageMatrix([], []);
    expect(matrix.characters).toEqual([]);
    expect(matrix.tierCounts).toEqual({
      "FULLY SUPPORTED": 0,
      "BASIC SUPPORT": 0,
      "SPECIAL MECHANICS NOT YET IMPLEMENTED": 0,
    });
    const report = renderCoverageReport(matrix);
    expect(report).toContain("# Character Coverage Matrix");
  });

  it("the matrix is JSON-serializable (a UI or CI job can consume it)", () => {
    const matrix = buildCoverageMatrix(registry, evidence);
    const roundTripped = JSON.parse(JSON.stringify(matrix)) as unknown;
    expect(roundTripped).toEqual(JSON.parse(JSON.stringify(matrix)));
    expect(structuredClone(matrix)).toEqual(matrix);
  });

  it("cites the live unverified-mechanics registry rather than a copy", () => {
    const ids = unverifiedMechanicIds();
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain("bloom-cores");
    // Sorted, so the citation order is stable.
    expect([...ids].sort()).toEqual(ids);
  });
});

// ---------------------------------------------------------------------------
// Phase gate
// ---------------------------------------------------------------------------

describe("Playable Character Coverage Matrix & Zero-Overclaim Verification (TASK #030)", () => {
  it("verifies all 80+ playable characters exist in the registry and can build a coverage matrix", () => {
    expect(allCharacters.length).toBeGreaterThanOrEqual(80);
    const matrix = buildCoverageMatrix(allCharacters, ALL_CHARACTERS_TEST_EVIDENCE);
    expect(matrix.characters.length).toBe(allCharacters.length);
    // Every tier bucket must be accounted for, and the counts must sum to the
    // roster. Note this no longer asserts FULLY SUPPORTED > 0: since the
    // `unmodelled-perk-effects` detector landed (TASK #049), NO real character
    // reaches the top tier, because none has a single modelled perk effect.
    // Asserting a non-empty top tier here would be asserting the overclaim.
    const total = Object.values(matrix.tierCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(allCharacters.length);
    expect(matrix.tierCounts["FULLY SUPPORTED"]).toBe(0);
  });

  it("ZERO OVERCLAIM DEFECTS: asserts that NO character in the registry overclaims its support tier", () => {
    const matrix = buildCoverageMatrix(allCharacters, ALL_CHARACTERS_TEST_EVIDENCE);
    const claims: Record<string, SupportClaim> = Object.fromEntries(
      allCharacters.map((c) => [c.id, c.claim]),
    );

    const disagreements = findClaimDisagreements(matrix, claims);
    const overclaims = disagreements.filter((d) => d.verdict === "overclaims");

    expect(overclaims, "No character in the registry should overclaim its support tier").toEqual([]);
  });

  // ==========================================================================
  // REPLACEMENT for the retired pin "the derived tier reads an EMPTY kit as
  // fully supported" (TASK #049, qa-engineer).
  //
  // THE PIN FIRED FOR THE RIGHT REASON AND THE FIX IS THE ONE IT PRESCRIBED.
  //
  // The old pin's own FIX note said: "add a gap kind for MISSING modelling --
  // empty `passives`/`constellations` on a character whose real kit has them
  // -- so absence is detectable." That has now been done:
  // `unmodelled-perk-effects` in `characterCoverage.ts` fires on any passive
  // or constellation row carrying `effects: []`.
  //
  // WHY THIS IS NOT THE SAME OVERCLAIM IN A NEW COSTUME. The rows are now
  // populated (132 characters x 6 constellations, plus 3-4 passives each), so
  // a naive "has constellations => modelled" derivation would flip the whole
  // roster to FULLY SUPPORTED on data that gained no simulatable behaviour
  // whatsoever -- all 1235 entries still carry zero effects. That is exactly
  // the trap: the data got STRUCTURALLY richer and SEMANTICALLY no richer.
  //
  // The detector keys on `effects.length === 0`, not on row presence, so
  // populating the rows does NOT improve the tier. This is verified positively
  // below: zero characters reach FULLY SUPPORTED, and the reason each is held
  // back is the unmodelled-effects gap specifically.
  //
  // Independent corroboration that this reading is right, not merely
  // conservative: the data agent's own generated provenance says the same
  // thing in prose -- "Of 9 constellations and passives, 0 are modelled as
  // buffs and 9 are not". Two independently-derived views agree.
  // ==========================================================================

  it("no character reaches FULLY SUPPORTED while its perks carry zero effects", () => {
    const matrix = buildCoverageMatrix(allCharacters, ALL_CHARACTERS_TEST_EVIDENCE);

    // Precondition: the roster really does still have effectless perks. If
    // effects land, this flips and the assertions below must be revisited
    // rather than silently passing on an empty set.
    const effectless = allCharacters.filter((c) =>
      [...(c.passives ?? []), ...(c.constellations ?? [])].some(
        (perk) => (perk.effects?.length ?? 0) === 0,
      ),
    );
    expect(
      effectless.length,
      "no character has effectless perks any more — effects have landed; replace this test with positive effect assertions",
    ).toBe(allCharacters.length);

    // THE CLAIM UNDER TEST: a populated-but-effectless kit must NOT read as
    // fully supported. This is the assertion the old pin protected, restated
    // positively now that the detector exists.
    const fullySupported = matrix.characters.filter(
      (c) => c.tier === "FULLY SUPPORTED",
    );
    expect(
      fullySupported.map((c) => c.id),
      "a character with unmodelled perk effects is being reported as FULLY SUPPORTED — the derivation has gone blind again",
    ).toEqual([]);
  });

  it("attributes the demotion to the unmodelled-effects gap specifically", () => {
    // Guards against passing for the WRONG reason. Every character is held
    // below full today; this asserts that `unmodelled-perk-effects` is
    // actually among the reasons, rather than the tier merely happening to be
    // low because of `untested` or an unrelated gap.
    const matrix = buildCoverageMatrix(allCharacters, ALL_CHARACTERS_TEST_EVIDENCE);
    const missing: string[] = [];
    for (const coverage of matrix.characters) {
      const kinds = new Set(coverage.gaps.map((g) => g.kind));
      if (!kinds.has("unmodelled-perk-effects")) missing.push(coverage.id);
    }
    expect(
      missing,
      "these characters have effectless perks but no unmodelled-perk-effects gap — the detector is not firing on them",
    ).toEqual([]);

    // The gap's detail must name what is missing, not be a placeholder. A
    // report row that says nothing is indistinguishable from no row at all.
    for (const coverage of matrix.characters) {
      const gap = coverage.gaps.find((g) => g.kind === "unmodelled-perk-effects");
      expect(gap).toBeDefined();
      expect(gap!.detail).toContain("carry no effects");
      expect(gap!.detail.length).toBeGreaterThan(80);
    }
  });

  it("still reports ZERO overclaims: the derived tier never promises more than the authored claim", () => {
    // The half of the original pin that was always sound, kept intact. This
    // is the actual safety property -- under-promising is recoverable,
    // over-promising is the failure mode (docs/ROADMAP.md §0).
    const matrix = buildCoverageMatrix(allCharacters, ALL_CHARACTERS_TEST_EVIDENCE);
    const claims: Record<string, SupportClaim> = Object.fromEntries(
      allCharacters.map((c) => [c.id, c.claim]),
    );
    const disagreements = findClaimDisagreements(matrix, claims);

    expect(
      disagreements.filter((d) => d.verdict === "overclaims"),
      "a character overclaims its support tier",
    ).toEqual([]);
  });

  it("DISCRIMINATES: a kit with real perk effects is NOT demoted by this detector", () => {
    // THE MUTATION GUARD, in-test. A detector that demotes everything
    // unconditionally would pass every assertion above while carrying no
    // information -- the "signal with zero variance" failure.
    //
    // So: take a real character, give its perks real effects, and prove the
    // unmodelled-effects gap DISAPPEARS. This proves the detector keys on
    // effects rather than merely on being a generated character.
    const base = allCharacters.find((c) => c.id === "bennett");
    expect(base, "bennett missing from the roster").toBeDefined();

    const effect = { resourceId: "test-resource", kind: "gain", amount: 1 } as const;
    const modelled: GenericCharacterDefinition = {
      ...base!,
      passives: (base!.passives ?? []).map((p) => ({ ...p, effects: [effect] })),
      constellations: (base!.constellations ?? []).map((c) => ({
        ...c,
        effects: [effect],
      })),
    };

    const before = buildCharacterCoverage(base!, ALL_CHARACTERS_TEST_EVIDENCE);
    const after = buildCharacterCoverage(modelled, ALL_CHARACTERS_TEST_EVIDENCE);

    expect(
      before.gaps.some((g) => g.kind === "unmodelled-perk-effects"),
      "the unmodelled-effects gap does not fire on the real bennett — nothing is being tested",
    ).toBe(true);
    expect(
      after.gaps.some((g) => g.kind === "unmodelled-perk-effects"),
      "the gap still fires after every perk gained an effect — the detector is not reading effects at all",
    ).toBe(false);
  });

  it("DISCRIMINATES: one effectless perk among many is still detected", () => {
    // Boundary case. The detector must fire on a PARTIALLY modelled kit, not
    // only an entirely empty one -- otherwise modelling 9 of 10 perks would
    // silently read as complete.
    const base = allCharacters.find((c) => c.id === "bennett");
    expect(base).toBeDefined();

    const effect = { resourceId: "test-resource", kind: "gain", amount: 1 } as const;
    const passives = (base!.passives ?? []).map((p) => ({ ...p, effects: [effect] }));
    const constellations = (base!.constellations ?? []).map((c, index) => ({
      ...c,
      // Exactly ONE perk left unmodelled.
      effects: index === 0 ? [] : [effect],
    }));

    const partial = buildCharacterCoverage(
      { ...base!, passives, constellations },
      ALL_CHARACTERS_TEST_EVIDENCE,
    );
    const gap = partial.gaps.find((g) => g.kind === "unmodelled-perk-effects");
    expect(
      gap,
      "a single unmodelled perk among nine modelled ones went undetected",
    ).toBeDefined();
    // And the detail must report the true ratio, not "all".
    expect(gap!.detail).toContain(
      `1 of ${passives.length + constellations.length}`,
    );
  });

  /**
   * Bounds the blind spot: the detectors that CAN still fire, do.
   *
   * Characters are tiered below full on `unmodelled-perk-effects`, plus
   * `healing-or-shielding` and `reaction-scaling-instance` gaps derived from
   * data that survived the cutover. Asserting this stops the tests above from
   * being read as "the coverage module is entirely broken": the machinery
   * works, and two of its detectors are simply unreachable on today's INPUT.
   */
  it("confirms the surviving gap detectors still fire on the real roster", () => {
    const matrix = buildCoverageMatrix(allCharacters, ALL_CHARACTERS_TEST_EVIDENCE);
    const kinds = new Set<string>();
    for (const coverage of matrix.characters) {
      for (const gap of coverage.gaps) kinds.add(gap.kind);
    }
    expect(
      kinds.size,
      "no gap kind fires anywhere on the real roster — the matrix has gone entirely blind",
    ).toBeGreaterThan(0);

    // Infusion remains absent from the generated roster, while the explicit
    // Skirk/Mavuika resource channel is now intentionally visible to the
    // coverage detector.
    expect(kinds.has("element-infusion")).toBe(false);
    expect(kinds.has("conditional-resource-effect")).toBe(true);
  });

  it("generates a full markdown coverage report for all 80+ playable characters", () => {
    const matrix = buildCoverageMatrix(allCharacters, ALL_CHARACTERS_TEST_EVIDENCE);
    const report = renderCoverageReport(matrix);

    expect(report).toContain("# Character Coverage Matrix");
    expect(report.length).toBeGreaterThan(15000);

    for (const char of allCharacters) {
      expect(report).toContain(char.name);
      expect(report).toContain(`\`${char.id}\``);
    }

    // Persist full coverage report to brain artifact directory
    const artifactPath =
      "/Users/vincent/.gemini/antigravity/brain/2059beda-07b8-4ce1-b8e6-d6e07e60cb44/CHARACTER-COVERAGE-REPORT.md";
    try {
      fs.writeFileSync(artifactPath, report, "utf-8");
    } catch {
      // ignore if path not writable in environment
    }
  });

  it("no coverage machinery names a character or branches on an id", () => {
    // Structural proof: the same character with a different id produces an
    // identical row except for the id/name fields.
    const renamed = clone(simpleUnit);
    renamed.id = "zzz-renamed";
    renamed.name = "Renamed";

    const original = buildCharacterCoverage(simpleUnit, [
      fullEvidence(simpleUnit.id),
    ]);
    const other = buildCharacterCoverage(renamed, [
      fullEvidence("zzz-renamed"),
    ]);

    expect(other.tier).toBe(original.tier);
    expect(other.abilities).toEqual(original.abilities);
    expect(other.reactions).toEqual(original.reactions);
    expect(other.gaps).toEqual(original.gaps);
  });

  it("talentTable-backed cooldowns are read, not hardcoded", () => {
    // Guards the private `talentValue` helper against silently returning the
    // first entry regardless of level.
    const varied = clone(simpleUnit);
    varied.skill = { ...varied.skill, cooldown: talentTable([10, 20, 30]) };
    for (const [level, expected] of [
      [1, 10],
      [2, 20],
      [3, 30],
      [99, 30],
      [0, 10],
    ] as const) {
      varied.talentLevels = { ...varied.talentLevels, skill: level };
      const skill = buildCharacterCoverage(varied, []).abilities.find(
        (a) => a.id === varied.skill.id,
      )!;
      expect(skill.cooldownSeconds).toBe(expected);
    }
  });
});


// ---------------------------------------------------------------------------
// CLAIM (N9, authored) vs CHECK (derived here)
// ---------------------------------------------------------------------------

describe("authored SupportClaim vs derived tier: a disagreement is a DEFECT", () => {
  const supported = buildCharacterCoverage(simpleUnit, [
    fullEvidence(simpleUnit.id),
  ]);
  const special = buildCharacterCoverage(syntheticUnit, [
    fullEvidence(syntheticUnit.id),
  ]);

  it("lines the two vocabularies up without deriving either from the other", () => {
    expect(derivedTierForClaim("FULL")).toBe("FULLY SUPPORTED");
    expect(derivedTierForClaim("BASIC")).toBe("BASIC SUPPORT");
    expect(derivedTierForClaim("PARTIAL")).toBe(
      "SPECIAL MECHANICS NOT YET IMPLEMENTED",
    );
  });

  it("agrees when the claim matches what is implemented and tested", () => {
    const claim: SupportClaim = { supportTier: "FULL" };
    expect(reconcileClaim(supported, claim).verdict).toBe("agrees");

    const partialClaim: SupportClaim = {
      supportTier: "PARTIAL",
      tierReason: "Stack-gated behaviour is not simulated.",
    };
    expect(reconcileClaim(special, partialClaim).verdict).toBe("agrees");
  });

  it("OVERCLAIM: `full` on a character with an inexpressible mechanic is caught", () => {
    // This is the case worth surfacing loudly: the author promises a number
    // the engine cannot produce, and every other test in the suite is green.
    const reconciliation = reconcileClaim(special, { supportTier: "FULL" });
    expect(reconciliation.verdict).toBe("overclaims");
    expect(reconciliation.claimed).toBe("FULL");
    expect(reconciliation.derived).toBe(
      "SPECIAL MECHANICS NOT YET IMPLEMENTED",
    );
    // The reconciliation NAMES the gaps the claim ignores, so a reviewer does
    // not have to go looking.
    expect([...reconciliation.ignoredGaps.map((g) => g.kind)].sort()).toEqual([
      "conditional-resource-effect",
      "unmodelled-perk-effects",
    ]);
  });

  it("OVERCLAIM: `full` on an untested character is caught too", () => {
    const untested = buildCharacterCoverage(simpleUnit, []);
    const reconciliation = reconcileClaim(untested, { supportTier: "FULL" });
    expect(reconciliation.verdict).toBe("overclaims");
    expect(reconciliation.ignoredGaps.map((g) => g.kind)).toEqual(["untested"]);
  });

  it("UNDERCLAIM is reported separately and carries no ignored gaps", () => {
    const reconciliation = reconcileClaim(supported, {
      supportTier: "PARTIAL",
      tierReason: "Author was being cautious.",
    });
    expect(reconciliation.verdict).toBe("underclaims");
    expect(reconciliation.ignoredGaps).toEqual([]);
  });

  it("findClaimDisagreements returns ONLY the rows that disagree", () => {
    const matrix = buildCoverageMatrix(
      [syntheticUnit, simpleUnit],
      [fullEvidence(simpleUnit.id), fullEvidence(syntheticUnit.id)],
    );
    const honest = findClaimDisagreements(matrix, {
      "simple-unit": { supportTier: "FULL" },
      "synthetic-unit": {
        supportTier: "PARTIAL",
        tierReason: "Stacks are not simulated.",
      },
    });
    expect(honest).toEqual([]);

    const dishonest = findClaimDisagreements(matrix, {
      "simple-unit": { supportTier: "FULL" },
      "synthetic-unit": { supportTier: "FULL" },
    });
    expect(dishonest).toHaveLength(1);
    expect(dishonest[0]?.characterId).toBe("synthetic-unit");
    expect(dishonest[0]?.verdict).toBe("overclaims");
  });

  it("a character with NO authored claim is skipped, not defaulted", () => {
    // Defaulting a missing claim to `full` would invent agreement; defaulting
    // it to `partial` would invent a defect. Neither is honest.
    const matrix = buildCoverageMatrix([syntheticUnit], []);
    expect(findClaimDisagreements(matrix, {})).toEqual([]);
  });

  it("the two tiers are INDEPENDENT: changing the claim never moves the derived tier", () => {
    const before = buildCharacterCoverage(syntheticUnit, [
      fullEvidence(syntheticUnit.id),
    ]).tier;
    for (const claim of ["FULL", "BASIC", "PARTIAL"] as const) {
      const reconciliation = reconcileClaim(special, {
        supportTier: claim,
        // tierReason accompanies any claim that is NOT full support.
        ...(claim === "FULL" ? {} : { tierReason: "x" }),
      } as SupportClaim);
      expect(reconciliation.derived).toBe(before);
    }
  });
});
