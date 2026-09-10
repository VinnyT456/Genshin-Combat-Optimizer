import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import type { Buff } from "@/simulation/buffs/types";
import { makeBuffResolver } from "@/simulation/buffs/makeBuffResolver";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { resolveEquippedStats } from "@/simulation/character/equipment";
import { testPyro } from "@/game-data/characters/testPyro";
import { testEnemy } from "@/game-data/enemies/testEnemy";

// ============================================================================
// ONE MECHANISM FOR CONDITIONAL EFFECTS.
//
// Weapon passives, artifact set bonuses and constellations are the SAME idea:
// an effect that is live under some condition. The project explicitly forbids
// giving each its own mechanism — that would be three implementations of one
// concept.
//
// This file is the executable form of that claim. Each of the three is authored
// as ORDINARY `Buff` DATA and resolved by the EXISTING buff resolver. No
// equipment-specific resolver, no set-bonus engine, no passive interpreter
// exists or is used anywhere below.
//
// The only thing the equipment model contributes is WHICH set bonuses are
// active (`activeSetBonusKeys`); what they DO is buff data. That split is what
// keeps set bonuses from becoming a second buff system.
//
// All values are SYNTHETIC. No real weapon, artifact or constellation numbers
// are pinned here — those are `src/game-data`'s to source and verify.
// ============================================================================

const ROTATION: Rotation = [
  { characterId: testPyro.id, actionType: "skill" },
  { characterId: testPyro.id, actionType: "normal" },
];

/** Base ATK 1800 + weapon base 600 = 2400, no other gear. */
const GEARED = resolveEquippedStats(testPyro.baseStats, {
  weapon: { baseAtk: 600 },
});

const ALWAYS_ON = {
  startTime: 0,
  duration: Number.POSITIVE_INFINITY,
  stacking: { mode: "refresh" as const },
  targets: { scope: "party" as const },
};

function runWith(buffs: readonly Buff[]): number {
  const config: SimulationConfig = {
    equippedStats: { [testPyro.id]: GEARED.stats },
    // The mechanics resolver reads base values from ITS OWN map keyed by
    // character id — it does not (yet) read `Stats.base`. See the handoff:
    // this duplication is reported to the Manager rather than fixed here,
    // because `src/simulation/buffs` is mechanics-owned.
    buffResolver: makeBuffResolver({
      buffs,
      baseStats: { [testPyro.id]: GEARED.base },
    }),
  };
  return simulateRotation([testPyro], ROTATION, testEnemy, config).totalDamage;
}

const UNBUFFED = runWith([]);

describe("all three conditional-effect kinds are ordinary Buff data", () => {
  it("an artifact 2-piece set bonus is a Buff", () => {
    // "+18% ATK" 2pc: permanently on, no condition.
    const twoPiece: Buff = {
      ...ALWAYS_ON,
      id: "synthetic-set:2",
      source: "Synthetic Set (2pc)",
      modifiers: [{ stat: "atkPercent", value: 0.18 }],
    };
    // ATK% scales BASE (2400), so ATK goes 2400 -> 2832.
    expect(runWith([twoPiece]) / UNBUFFED).toBeCloseTo(2832 / 2400, 6);
  });

  it("an artifact 4-piece set bonus is a Buff — including a CONDITIONAL one", () => {
    // "+X% skill DMG" 4pc, gated on damage type. This is the shape that would
    // otherwise tempt a bespoke set-bonus engine; the existing `conditions`
    // field already expresses it.
    const fourPiece: Buff = {
      ...ALWAYS_ON,
      id: "synthetic-set:4",
      source: "Synthetic Set (4pc)",
      conditions: { damageTypes: ["skill"] },
      modifiers: [{ stat: "dmgBonus", value: 0.35 }],
    };
    const buffed = runWith([fourPiece]);
    expect(buffed).toBeGreaterThan(UNBUFFED);

    // The gate must actually gate: a 4pc restricted to a damage type the
    // rotation never uses changes nothing.
    const inertGate: Buff = {
      ...fourPiece,
      id: "synthetic-set:4-inert",
      conditions: { damageTypes: ["plunge"] },
    };
    expect(runWith([inertGate])).toBe(UNBUFFED);
  });

  it("a weapon passive is a Buff, with refinement expressed as its value", () => {
    // Refinement is DATA — the magnitude authored for the owned refinement —
    // not a code branch. R1 and R5 are the same buff with different values.
    const passiveAt = (value: number): Buff => ({
      ...ALWAYS_ON,
      id: "synthetic-weapon-passive",
      source: "Synthetic Weapon Passive",
      modifiers: [{ stat: "atkPercent", value }],
    });

    const r1 = runWith([passiveAt(0.2)]);
    const r5 = runWith([passiveAt(0.4)]);
    expect(r1).toBeGreaterThan(UNBUFFED);
    expect(r5).toBeGreaterThan(r1);
    // ATK 2400 -> 2880 (R1) and 3360 (R5), both scaling BASE.
    expect(r1 / UNBUFFED).toBeCloseTo(2880 / 2400, 6);
    expect(r5 / UNBUFFED).toBeCloseTo(3360 / 2400, 6);
  });

  it("a constellation is a Buff — structurally identical to the other two", () => {
    const constellation: Buff = {
      ...ALWAYS_ON,
      id: "synthetic-c2",
      source: "Synthetic C2",
      modifiers: [{ stat: "critDmg", value: 0.4 }],
    };
    expect(runWith([constellation])).toBeGreaterThan(UNBUFFED);
  });

  it("the three compose additively through ONE resolver", () => {
    // A set bonus, a weapon passive and a constellation active at once. Same
    // channel (ATK%) => additive, which is the in-game rule and falls out of
    // the single resolver rather than needing three systems to agree.
    const setBonus: Buff = {
      ...ALWAYS_ON,
      id: "s",
      source: "set",
      modifiers: [{ stat: "atkPercent", value: 0.18 }],
    };
    const weaponPassive: Buff = {
      ...ALWAYS_ON,
      id: "w",
      source: "weapon",
      modifiers: [{ stat: "atkPercent", value: 0.2 }],
    };
    const constellation: Buff = {
      ...ALWAYS_ON,
      id: "c",
      source: "constellation",
      modifiers: [{ stat: "atkPercent", value: 0.12 }],
    };

    const all = runWith([setBonus, weaponPassive, constellation]);
    // 2400 * (1 + 0.18 + 0.20 + 0.12) = 2400 * 1.5 = 3600.
    // Multiplicative composition would give 2400*1.18*1.2*1.12 = 3806 (+5.7%).
    expect(all / UNBUFFED).toBeCloseTo(3600 / 2400, 6);
  });

  it("order of authoring does not change the result", () => {
    // Determinism: the resolver folds a set of buffs, so authoring order is
    // not observable.
    const a: Buff = {
      ...ALWAYS_ON,
      id: "a",
      source: "a",
      modifiers: [{ stat: "atkPercent", value: 0.18 }],
    };
    const b: Buff = {
      ...ALWAYS_ON,
      id: "b",
      source: "b",
      modifiers: [{ stat: "critDmg", value: 0.4 }],
    };
    expect(runWith([a, b])).toBe(runWith([b, a]));
  });
});

describe("percentage buffs require the base channel the split introduced", () => {
  it("an ATK% buff is applied — not skipped — because gear carries base", () => {
    // Before the base/final split the resolver SKIPPED percentage modifiers
    // whenever base was unavailable. With `resolveEquippedStats` attaching the
    // base channel, ATK% now resolves. If this ever returns to equalling the
    // unbuffed value, the base channel has been lost somewhere in the seam.
    const atkPercent: Buff = {
      ...ALWAYS_ON,
      id: "atk-percent",
      source: "synthetic",
      modifiers: [{ stat: "atkPercent", value: 0.5 }],
    };
    expect(runWith([atkPercent])).toBeGreaterThan(UNBUFFED);
  });
});
