import { describe, expect, it } from "vitest";
import { findAura } from "@/simulation/reactions/aura";
import {
  abilityGauge,
  abilityIcd,
  abilityIcdGroup,
  abilityHitCount,
  type ElementalAbility,
} from "@/simulation/reactions/abilityContract";
import {
  EMPTY_ELEMENTAL_STATE,
  NO_REACTION_MODIFIERS,
  resolveElementalHit,
  toReactionModifiers,
  type ElementalHit,
  type ElementalState,
} from "@/simulation/reactions/resolver";
import { STANDARD_ICD } from "@/simulation/reactions/types";
import {
  UNSUPPORTED_MECHANICS,
  findUnsupportedMechanic,
} from "@/simulation/reactions/unverified";

function hit(overrides: Partial<ElementalHit> = {}): ElementalHit {
  return {
    time: 0,
    attackerId: "attacker",
    targetId: "target",
    icdGroup: "skill",
    element: "pyro",
    gauge: 1,
    icd: STANDARD_ICD,
    ...overrides,
  };
}

describe("resolveElementalHit — ICD gates elemental application", () => {
  it("the first hit applies and creates an aura", () => {
    const result = resolveElementalHit(EMPTY_ELEMENTAL_STATE, hit());
    expect(result.applied).toBe(true);
    expect(findAura(result.state.aura, "pyro", 0)).toBeDefined();
  });

  it("an ICD-suppressed hit applies NO element and triggers NO reaction", () => {
    // Pyro aura up, then two Hydro hits in quick succession from one ability:
    // only the first may vaporize.
    let state: ElementalState = resolveElementalHit(
      EMPTY_ELEMENTAL_STATE,
      hit({ element: "pyro", gauge: 4, icdGroup: "pyroSkill" }),
    ).state;

    const first = resolveElementalHit(
      state,
      hit({ element: "hydro", gauge: 1, icdGroup: "hydroNA", time: 0.1 }),
    );
    expect(first.applied).toBe(true);
    expect(first.reactions.map((r) => r.kind)).toEqual(["vaporize"]);
    state = first.state;

    const second = resolveElementalHit(
      state,
      hit({ element: "hydro", gauge: 1, icdGroup: "hydroNA", time: 0.2 }),
    );
    expect(second.applied).toBe(false);
    expect(second.reactions).toHaveLength(0);
  });

  it("aura still decays during an ICD-suppressed hit", () => {
    let state = resolveElementalHit(
      EMPTY_ELEMENTAL_STATE,
      hit({ element: "pyro", gauge: 1, icdGroup: "p" }),
    ).state;
    const before = findAura(state.aura, "pyro", 0)!.gauge;

    // A suppressed hit from a DIFFERENT ability at t=5 must not freeze decay.
    state = resolveElementalHit(
      state,
      hit({ element: "cryo", gauge: 0, icdGroup: "c", time: 5 }),
    ).state;
    const after = findAura(state.aura, "pyro", 5)!.gauge;
    expect(after).toBeLessThan(before);
  });

  it("ICD is tracked separately per attacker", () => {
    let state = EMPTY_ELEMENTAL_STATE;
    const a = resolveElementalHit(state, hit({ attackerId: "a" }));
    state = a.state;
    // A different attacker's first hit with the same group must still apply.
    const b = resolveElementalHit(state, hit({ attackerId: "b", time: 0.1 }));
    expect(b.applied).toBe(true);
  });

  it("ICD is tracked separately per target", () => {
    let state = EMPTY_ELEMENTAL_STATE;
    state = resolveElementalHit(state, hit({ targetId: "t1" })).state;
    const other = resolveElementalHit(
      state,
      hit({ targetId: "t2", time: 0.1 }),
    );
    expect(other.applied).toBe(true);
  });

  it("abilities sharing an icdGroup share one counter", () => {
    let state = EMPTY_ELEMENTAL_STATE;
    state = resolveElementalHit(state, hit({ icdGroup: "shared" })).state;
    const second = resolveElementalHit(
      state,
      hit({ icdGroup: "shared", time: 0.1 }),
    );
    expect(second.applied).toBe(false);
  });

  it("abilities with different groups have independent counters", () => {
    let state = EMPTY_ELEMENTAL_STATE;
    state = resolveElementalHit(state, hit({ icdGroup: "na" })).state;
    const second = resolveElementalHit(
      state,
      hit({ icdGroup: "skill", time: 0.1 }),
    );
    expect(second.applied).toBe(true);
  });

  it("does not mutate the input state", () => {
    const state = EMPTY_ELEMENTAL_STATE;
    const snapshot = structuredClone(state);
    resolveElementalHit(state, hit());
    expect(state).toEqual(snapshot);
  });

  it("is deterministic and serializable", () => {
    const a = resolveElementalHit(EMPTY_ELEMENTAL_STATE, hit());
    const b = resolveElementalHit(EMPTY_ELEMENTAL_STATE, hit());
    expect(a).toEqual(b);
    expect(structuredClone(a.state)).toEqual(a.state);
  });
});

// ---------------------------------------------------------------------------
// The pipeline seam: the three channels must stay separate.
// ---------------------------------------------------------------------------

describe("toReactionModifiers — pipeline channel separation", () => {
  const stats = { level: 90, elementalMastery: 0 };
  const noRes = () => 1;

  it("no reactions => neutral modifiers", () => {
    expect(toReactionModifiers([], stats, noRes)).toEqual(
      NO_REACTION_MODIFIERS,
    );
  });

  it("an amplifying reaction only touches the multiplier channel", () => {
    const { reactions } = resolveElementalHit(
      resolveElementalHit(
        EMPTY_ELEMENTAL_STATE,
        hit({ element: "pyro", gauge: 4, icdGroup: "p" }),
      ).state,
      hit({ element: "hydro", gauge: 1, icdGroup: "h", time: 0.1 }),
    );
    const mods = toReactionModifiers(reactions, stats, noRes);
    expect(mods.amplifyingMultiplier).toBeCloseTo(2, 10);
    expect(mods.additiveBaseDamageBonus).toBe(0);
    expect(mods.transformative).toHaveLength(0);
  });

  it("a transformative reaction only produces a separate instance", () => {
    const { reactions } = resolveElementalHit(
      resolveElementalHit(
        EMPTY_ELEMENTAL_STATE,
        hit({ element: "electro", gauge: 4, icdGroup: "e" }),
      ).state,
      hit({ element: "pyro", gauge: 1, icdGroup: "p", time: 0.1 }),
    );
    const mods = toReactionModifiers(reactions, stats, noRes);
    // Amplifying channel must stay exactly neutral — an overload must never
    // silently multiply the triggering hit.
    expect(mods.amplifyingMultiplier).toBe(1);
    expect(mods.additiveBaseDamageBonus).toBe(0);
    expect(mods.transformative).toHaveLength(1);
    expect(mods.transformative[0]!.kind).toBe("overloaded");
    expect(mods.transformative[0]!.damage).toBeCloseTo(2.75 * 1446.8535, 3);
  });

  it("swirl damage uses the SWIRLED element's RES, not anemo's", () => {
    const { reactions } = resolveElementalHit(
      resolveElementalHit(
        EMPTY_ELEMENTAL_STATE,
        hit({ element: "cryo", gauge: 4, icdGroup: "c" }),
      ).state,
      hit({ element: "anemo", gauge: 1, icdGroup: "a", time: 0.1 }),
    );
    const seen: string[] = [];
    const mods = toReactionModifiers(reactions, stats, (element) => {
      seen.push(element);
      return 1;
    });
    expect(mods.transformative[0]!.resElement).toBe("cryo");
    expect(seen).toContain("cryo");
    expect(seen).not.toContain("anemo");
  });

  it("burgeon/hyperbloom RES element is dendro, not the trigger element", () => {
    // Guards the non-obvious mapping even though the trigger is not yet
    // reachable from simulation state (see unverified: bloom-cores).
    const mods = toReactionModifiers(
      [
        {
          kind: "hyperbloom",
          category: "transformative",
          triggerElement: "electro",
          gaugeConsumed: 0,
        },
      ],
      stats,
      noRes,
    );
    expect(mods.transformative[0]!.resElement).toBe("dendro");
  });

  it("an additive reaction only touches the base-damage channel", () => {
    const mods = toReactionModifiers(
      [
        {
          kind: "aggravate",
          category: "additive",
          triggerElement: "electro",
          gaugeConsumed: 0,
        },
      ],
      stats,
      noRes,
    );
    expect(mods.amplifyingMultiplier).toBe(1);
    expect(mods.transformative).toHaveLength(0);
    expect(mods.additiveBaseDamageBonus).toBeCloseTo(1.15 * 1446.8535, 3);
  });

  it("category 'none' reactions contribute to no damage channel", () => {
    const mods = toReactionModifiers(
      [
        {
          kind: "crystallize",
          category: "none",
          triggerElement: "geo",
          gaugeConsumed: 0.5,
        },
        {
          kind: "frozen",
          category: "none",
          triggerElement: "cryo",
          gaugeConsumed: 1,
        },
      ],
      stats,
      noRes,
    );
    expect(mods).toEqual(NO_REACTION_MODIFIERS);
  });

  it("applies per-reaction DMG bonuses additively with the EM bonus", () => {
    const mods = toReactionModifiers(
      [
        {
          kind: "vaporize",
          category: "amplifying",
          direction: "forward",
          triggerElement: "hydro",
          gaugeConsumed: 1,
        },
      ],
      { level: 90, elementalMastery: 0, reactionBonus: { vaporize: 0.15 } },
      noRes,
    );
    expect(mods.amplifyingMultiplier).toBeCloseTo(2 * 1.15, 10);
  });

  it("EM raises the amplifying multiplier as verified", () => {
    const mods = toReactionModifiers(
      [
        {
          kind: "vaporize",
          category: "amplifying",
          direction: "forward",
          triggerElement: "hydro",
          gaugeConsumed: 1,
        },
      ],
      { level: 90, elementalMastery: 200 },
      noRes,
    );
    expect(mods.amplifyingMultiplier).toBeCloseTo(2 * (1 + 0.3475), 6);
  });
});

// ---------------------------------------------------------------------------
// Ability contract defaults
// ---------------------------------------------------------------------------

describe("ability contract defaults", () => {
  const bare = { id: "ability-1" } as ElementalAbility;

  it("FAILS CLOSED: an ability with no application data applies 0U", () => {
    // Critical: defaulting to a nonzero gauge would fabricate reactions and
    // therefore damage for every un-authored ability.
    expect(abilityGauge(bare)).toBe(0);
  });

  it("defaults ICD to the documented standard", () => {
    expect(abilityIcd(bare)).toEqual({ mode: "standard" });
  });

  it("defaults the ICD group to the ability id", () => {
    expect(abilityIcdGroup(bare)).toBe("ability-1");
  });

  it("honours an explicit shared ICD group", () => {
    expect(
      abilityIcdGroup({ ...bare, icdGroup: "normalAndCharged" }),
    ).toBe("normalAndCharged");
  });

  it("defaults hit count to 1 and floors invalid values", () => {
    expect(abilityHitCount(bare)).toBe(1);
    expect(abilityHitCount({ ...bare, hitCount: 3 })).toBe(3);
    expect(abilityHitCount({ ...bare, hitCount: -1 })).toBe(0);
  });

  it("reads authored application and ICD data", () => {
    const ability = {
      ...bare,
      application: { gauge: 2 },
      icd: { mode: "none" as const },
    };
    expect(abilityGauge(ability)).toBe(2);
    expect(abilityIcd(ability)).toEqual({ mode: "none" });
  });
});

describe("unsupported mechanics are declared, not hidden", () => {
  it("every entry has a non-trivial explanation", () => {
    expect(UNSUPPORTED_MECHANICS.length).toBeGreaterThan(0);
    for (const mechanic of UNSUPPORTED_MECHANICS) {
      expect(mechanic.note.length).toBeGreaterThan(40);
      expect(["unsupported", "uncertain"]).toContain(mechanic.status);
    }
  });

  it("ids are unique", () => {
    const ids = UNSUPPORTED_MECHANICS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // -------------------------------------------------------------------------
  // KQM re-verification pass. These pin the SOURCED figures so a later edit
  // cannot quietly drop the citation and leave a bare number behind.
  // -------------------------------------------------------------------------

  function note(id: string): string {
    const found = findUnsupportedMechanic(id);
    expect(found, `missing unsupported-mechanic entry: ${id}`).toBeDefined();
    return found?.note ?? "";
  }

  it("electro-charged records the verified 1s cadence and 0.5s aura floor", () => {
    const text = note("electro-charged-ticks");
    expect(text).toContain("1 second");
    expect(text).toContain("0.5s");
    expect(text).toContain("60 frames");
    // The early-tick exception must stay recorded: a flat 1s cadence is wrong.
    expect(text).toContain("exception");
  });

  it("burning records the verified 0.25s damage tick", () => {
    const text = note("burning-ticks");
    expect(text).toContain("0.25s");
    expect(text).toContain("1U Pyro");
    expect(text).toContain("once every 2s");
    // The vault-vs-prose disagreement must stay logged, not quietly dropped.
    // The 1U/2U half is now RESOLVED as a game-VERSION difference (the vault's
    // 2U entry was last tested before 3.0, and [K2] retires it explicitly), so
    // the note records a resolution rather than an open conflict. The 2s/2.5s
    // half has no such version argument and stays open.
    expect(text).toContain("2U");
    expect(text).toContain("2.5 sec");
    expect(text).toContain("DISCREPANCY UPDATE");
    expect(text).toContain("STILL UNRESOLVED");
  });

  it("bloom-cores records the verified 6s lifetime, cap 5, FIFO eviction", () => {
    const text = note("bloom-cores");
    expect(text).toContain("6s");
    expect(text).toContain("cap 5");
    expect(text).toContain("FIFO");
  });

  it("aggravate/spread coefficients are no longer single-sourced", () => {
    const text = note("quicken-aggravate-spread");
    expect(text).toContain("1.15");
    expect(text).toContain("1.25");
    expect(text).toContain("SINGLE-SOURCING FLAG LIFTED");
    // genshin-optimizer is no longer the load-bearing source.
    expect(text).not.toContain("genshin-optimizer only");
    // The real remaining gap (no Quicken aura) must NOT be claimed as closed.
    expect(findUnsupportedMechanic("quicken-aggravate-spread")?.status).toBe(
      "unsupported",
    );
  });

  it("simultaneous-reaction-priority STAYS unverified, by source", () => {
    // KQM explicitly declines to publish a fixed order, so our element order
    // is a deterministic convention and must never be sold as game-matching.
    const entry = findUnsupportedMechanic("simultaneous-reaction-priority");
    expect(entry?.status).toBe("uncertain");
    expect(entry?.note).toContain("case by case basis");
    expect(entry?.note).toContain("CONVENTION");
    expect(entry?.note).not.toContain("VERIFIED order");
  });
});
