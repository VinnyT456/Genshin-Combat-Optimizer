import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { DEFAULT_SWAP_COST_SECONDS } from "@/simulation/engine/constants";
import { noOpBuffResolver } from "@/simulation/engine/buffSeam";
import type {
  BuffResolver,
  CharacterDefinition,
  EnemyState,
  Rotation,
  Stats,
} from "@/types";

const baseStats: Stats = {
  atk: 1000,
  hp: 0,
  def: 0,
  elementalMastery: 0,
  critRate: 0,
  critDmg: 0,
  energyRecharge: 1,
  dmgBonus: 0,
  elementalDmgBonus: {},
};

function makeChar(id: string): CharacterDefinition {
  const ability = (
    aid: string,
    actionType: CharacterDefinition["normalAttack"]["actionType"],
    multiplier: number,
    castTime: number,
    cooldown: number,
    energyCost: number,
    energyGenerated: number,
  ) => ({
    id: `${id}-${aid}`,
    name: aid.toUpperCase(),
    actionType,
    element: "pyro" as const,
    damageType: "skill" as const,
    multiplier,
    scaling: "atk" as const,
    castTime,
    cooldown,
    energyCost,
    energyGenerated,
  });
  return {
    id,
    name: id,
    element: "pyro",
    level: 0,
    maxEnergy: 40,
    baseStats,
    normalAttack: ability("na", "normal", 1, 0.5, 0, 0, 0),
    chargedAttack: ability("ca", "charged", 1, 0.5, 0, 0, 0),
    elementalSkill: ability("e", "skill", 2, 1, 6, 0, 20),
    elementalBurst: ability("q", "burst", 4, 1, 15, 40, 0),
  };
}

const enemy: EnemyState = { id: "en", name: "En", level: 0, resistances: {} };
const cfg = { critMode: "never" as const };

describe("simulation contract", () => {
  it("uses the default 0.6s swap cost", () => {
    const a = makeChar("a");
    const b = makeChar("b");
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" }, // 0.5s
      { characterId: "b", actionType: "swap" },
    ];
    const r = simulateRotation([a, b], rotation, enemy, cfg);
    expect(DEFAULT_SWAP_COST_SECONDS).toBe(0.6);
    expect(r.duration).toBeCloseTo(0.5 + 0.6);
  });

  it("honours a configured swap cost", () => {
    const a = makeChar("a");
    const b = makeChar("b");
    const rotation: Rotation = [{ characterId: "b", actionType: "swap" }];
    const r = simulateRotation([a, b], rotation, enemy, {
      ...cfg,
      swapCost: 1.25,
    });
    expect(r.duration).toBeCloseTo(1.25);
  });

  it("rejects a redundant swap to the on-field character", () => {
    const a = makeChar("a");
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "a", actionType: "swap" },
    ];
    const r = simulateRotation([a], rotation, enemy, cfg);
    expect(r.duration).toBeCloseTo(0.5);
    expect(r.warnings.length).toBe(1);
  });

  it("enforces the time limit", () => {
    const a = makeChar("a");
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" }, // 0 -> 0.5
      { characterId: "a", actionType: "normal", abilityId: "a-na" }, // 0.5 -> 1.0
      { characterId: "a", actionType: "normal", abilityId: "a-na" }, // at 1.0, blocked
    ];
    const r = simulateRotation([a], rotation, enemy, { ...cfg, timeLimit: 1 });
    expect(r.totalDamage).toBeCloseTo(1000); // 2 hits * 1000*1*0.5
    expect(r.warnings.some((w) => w.includes("time limit"))).toBe(true);
  });

  it("exposes post-run per-character energy and cooldowns", () => {
    const a = makeChar("a");
    const b = makeChar("b");
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // +20, CD until 6
    ];
    const r = simulateRotation([a, b], rotation, enemy, cfg);
    expect(r.finalState.time).toBeCloseTo(1);
    expect(r.finalState.activeCharacterId).toBe("a");
    expect(r.finalState.characters["a"]!.energy.current).toBe(20);
    expect(r.finalState.characters["a"]!.energy.totalGained).toBe(20);
    expect(r.finalState.characters["a"]!.cooldowns["a-e"]).toBe(6);
    expect(r.finalState.characters["b"]!.energy.current).toBe(0);
  });

  it("records energy spent by a burst in the final state", () => {
    const a = makeChar("a");
    a.elementalSkill.cooldown = 0;
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "burst", abilityId: "a-q" },
    ];
    const r = simulateRotation([a], rotation, enemy, cfg);
    const s = r.finalState.characters["a"]!;
    expect(s.energy.current).toBe(0);
    expect(s.energy.totalSpent).toBe(40);
  });

  it("caps energy at maxEnergy", () => {
    const a = makeChar("a");
    a.elementalSkill.cooldown = 0;
    a.elementalSkill.energyGenerated = 30;
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const r = simulateRotation([a], rotation, enemy, cfg);
    expect(r.finalState.characters["a"]!.energy.current).toBe(40);
  });

  it("defaults to a no-op buff resolver (identity)", () => {
    const a = makeChar("a");
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    const withDefault = simulateRotation([a], rotation, enemy, cfg);
    const withNoOp = simulateRotation([a], rotation, enemy, {
      ...cfg,
      buffResolver: noOpBuffResolver,
    });
    expect(withNoOp.totalDamage).toBeCloseTo(withDefault.totalDamage);
  });

  it("folds injected buff stats into damage via the seam", () => {
    const a = makeChar("a");
    const doubleAtk: BuffResolver = (base) => ({ ...base, atk: base.atk * 2 });
    const rotation: Rotation = [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    const plain = simulateRotation([a], rotation, enemy, cfg);
    const buffed = simulateRotation([a], rotation, enemy, {
      ...cfg,
      buffResolver: doubleAtk,
    });
    expect(buffed.totalDamage).toBeCloseTo(plain.totalDamage * 2);
  });

  it("hands the resolver a snapshot of live state", () => {
    const a = makeChar("a");
    let seenEnergy = -1;
    const spy: BuffResolver = (base, ctx) => {
      seenEnergy = ctx.snapshot.characters["a"]!.energy.current;
      return base;
    };
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // +20 after damage
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    simulateRotation([a], rotation, enemy, { ...cfg, buffResolver: spy });
    expect(seenEnergy).toBe(20);
  });

  it("is deterministic across repeated runs", () => {
    const a = makeChar("a");
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    const r1 = simulateRotation([a], rotation, enemy, cfg);
    const r2 = simulateRotation([a], rotation, enemy, cfg);
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
  });

  // WAS: "warns that resumeFrom is not implemented yet".
  //
  // That assertion pinned the INERT behaviour — the engine pushed a warning
  // and simulated from t=0 anyway. B2 implemented resume, so the warning is
  // gone by design and the test is inverted rather than deleted: the contract
  // it guards (supplying `resumeFrom` is accepted and does something) still
  // needs a test, only the expected answer changed.
  it("accepts resumeFrom silently and resumes from the snapshot's clock", () => {
    const a = makeChar("a");
    const seed = simulateRotation(
      [a],
      [{ characterId: "a", actionType: "skill", abilityId: "a-e" }],
      enemy,
      cfg,
    );
    const r = simulateRotation([a], [], enemy, {
      ...cfg,
      resumeFrom: seed.finalState,
    });

    expect(
      r.warnings.some((w) => w.includes("resumeFrom is not implemented")),
    ).toBe(false);
    expect(r.errors).toHaveLength(0);
    // Resumed at the checkpoint rather than restarting at zero.
    expect(seed.finalState.time).toBeGreaterThan(0);
    expect(r.finalState.time).toBe(seed.finalState.time);
  });
});
