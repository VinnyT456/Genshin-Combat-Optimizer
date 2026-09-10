import { describe, expect, it } from "vitest";
import type { CharacterDefinition, Rotation } from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { DEFAULT_SWAP_COST_SECONDS } from "@/simulation/engine/constants";
import { PARTICLE_OFF_ELEMENT_MULTIPLIER } from "@/simulation/energy/constants";
import { testAnemo, testElectro, testEnemy, testHydro, testPyro, testTeam, teamRotation } from "@/game-data";

// Deep clone so a test mutating a definition cannot leak into another test.
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const enemy = testEnemy;

describe("4-character team energy routing", () => {
  it("routes particle energy to every party member on a single skill cast", () => {
    const team = clone(testTeam);
    const rotation: Rotation = [
      { characterId: "test-hydro", actionType: "skill", abilityId: "test-hydro-e" },
    ];
    const r = simulateRotation(team, rotation, enemy, {});
    const chars = r.finalState.characters;

    // The caster is on-field and gains the full share.
    expect(chars["test-hydro"]!.energy.current).toBeGreaterThan(0);
    // Every off-field member also gains something from the same emission.
    expect(chars["test-pyro"]!.energy.current).toBeGreaterThan(0);
    expect(chars["test-electro"]!.energy.current).toBeGreaterThan(0);
    expect(chars["test-anemo"]!.energy.current).toBeGreaterThan(0);
  });

  it("gives the on-field caster strictly more than an equal-ER off-field peer", () => {
    // Two identical characters except id/name so ER and element cancel out and
    // only the field share differs.
    const a = clone(testPyro);
    const b = clone(testPyro);
    b.id = "test-pyro-b";
    b.name = "Ember B";
    const team: CharacterDefinition[] = [a, b];
    const rotation: Rotation = [
      { characterId: a.id, actionType: "skill", abilityId: "test-pyro-e" },
    ];
    const r = simulateRotation(team, rotation, enemy, {});
    const onField = r.finalState.characters[a.id]!.energy.totalGained;
    const offField = r.finalState.characters[b.id]!.energy.totalGained;
    expect(onField).toBeGreaterThan(offField);
  });

  it("gives a smaller configured partySize a larger off-field gain", () => {
    const team = clone(testTeam);
    const rotation: Rotation = [
      { characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" },
    ];
    const big = simulateRotation(team, rotation, enemy, { partySize: 4 });
    const small = simulateRotation(clone(testTeam), rotation, enemy, { partySize: 2 });
    expect(small.finalState.characters["test-hydro"]!.energy.totalGained)
      .toBeGreaterThan(big.finalState.characters["test-hydro"]!.energy.totalGained);
  });

  it("defaults partySize to the team length (config.partySize is not inert)", () => {
    const team = clone(testTeam);
    const rotation: Rotation = [
      { characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" },
    ];
    const implicit = simulateRotation(team, rotation, enemy, {});
    const explicit = simulateRotation(clone(testTeam), rotation, enemy, {
      partySize: team.length,
    });
    expect(implicit.finalState.characters["test-hydro"]!.energy.totalGained)
      .toBeCloseTo(explicit.finalState.characters["test-hydro"]!.energy.totalGained);
  });

  it("tracks the on-field character across swaps", () => {
    const r = simulateRotation(clone(testTeam), clone(teamRotation), enemy, {});
    expect(r.errors).toEqual([]);
    expect(r.finalState.activeCharacterId).toBe("test-electro");
  });

  it("simulates the full 4-character swap rotation with damage from each member", () => {
    const r = simulateRotation(clone(testTeam), clone(teamRotation), enemy, {});
    expect(r.damageByCharacter["test-pyro"]).toBeGreaterThan(0);
    expect(r.damageByCharacter["test-hydro"]).toBeGreaterThan(0);
    expect(r.damageByCharacter["test-electro"]).toBeGreaterThan(0);
    expect(r.damageByCharacter["test-anemo"]).toBeGreaterThan(0);
  });
});

describe("energy recharge", () => {
  it("multiplies particle energy gained", () => {
    const low = clone(testPyro);
    low.baseStats.energyRecharge = 1.0;
    const high = clone(testPyro);
    high.baseStats.energyRecharge = 2.0;
    // Particle-only ability so the flat grant does not mask the ER effect.
    low.elementalSkill.energyGenerated = 0;
    high.elementalSkill.energyGenerated = 0;

    const rotation: Rotation = [
      { characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" },
    ];
    const lowR = simulateRotation([low], rotation, enemy, {});
    const highR = simulateRotation([high], rotation, enemy, {});
    expect(highR.finalState.characters["test-pyro"]!.energy.totalGained).toBeCloseTo(
      2 * lowR.finalState.characters["test-pyro"]!.energy.totalGained,
    );
  });

  it("changes burst timing: enough ER makes an otherwise illegal burst legal", () => {
    // One skill, then a burst. Particle-only energy, so whether the burst is
    // affordable depends purely on Energy Recharge.
    const make = (er: number): CharacterDefinition => {
      const c = clone(testPyro);
      c.baseStats.energyRecharge = er;
      c.elementalSkill.energyGenerated = 0;
      c.elementalSkill.particles = { count: 4, element: "pyro" };
      c.elementalBurst.energyCost = 20;
      return c;
    };
    const rotation: Rotation = [
      { characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" },
      { characterId: "test-pyro", actionType: "burst", abilityId: "test-pyro-q" },
    ];
    // 4 particles * 3 base = 12 energy at 100% ER -> burst (cost 20) is illegal.
    const lowER = simulateRotation([make(1.0)], rotation, enemy, {});
    // At 200% ER -> 24 energy -> burst is affordable.
    const highER = simulateRotation([make(2.0)], rotation, enemy, {});

    expect(
      lowER.structuredWarnings.some((w) => w.code === "insufficient-energy"),
    ).toBe(true);
    expect(
      highER.structuredWarnings.some((w) => w.code === "insufficient-energy"),
    ).toBe(false);
    expect(highER.totalDamage).toBeGreaterThan(lowER.totalDamage);
  });

  it("does NOT multiply flat energyGenerated by energy recharge", () => {
    const c = clone(testPyro);
    c.baseStats.energyRecharge = 3.0;
    delete c.elementalSkill.particles;
    c.elementalSkill.energyGenerated = 10;
    const r = simulateRotation([c], [
      { characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" },
    ], enemy, {});
    expect(r.finalState.characters["test-pyro"]!.energy.totalGained).toBe(10);
  });
});

describe("off-element and colourless particles", () => {
  it("gives an on-element receiver more than an off-element one at equal ER", () => {
    // Caster emits PYRO particles. Two OFF-FIELD receivers with identical ER
    // and identical field share differ only by element, so the comparison
    // isolates the element multiplier exactly.
    const caster = clone(testPyro);
    caster.elementalSkill.energyGenerated = 0;

    const offFieldPyro = clone(testPyro);
    offFieldPyro.id = "off-pyro";
    offFieldPyro.name = "Off Pyro";
    offFieldPyro.baseStats.energyRecharge = 1;

    const offFieldHydro = clone(testHydro);
    offFieldHydro.baseStats.energyRecharge = 1;

    const r = simulateRotation(
      [caster, offFieldPyro, offFieldHydro],
      [{ characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" }],
      enemy,
      {},
    );
    const onElement = r.finalState.characters["off-pyro"]!.energy.totalGained;
    const offElement = r.finalState.characters["test-hydro"]!.energy.totalGained;
    expect(onElement).toBeGreaterThan(offElement);
    // Ratio is exactly the off-element multiplier.
    expect(offElement / onElement).toBeCloseTo(PARTICLE_OFF_ELEMENT_MULTIPLIER);
  });

  it("values a colourless particle by the colourless multiplier for all elements", () => {
    // Anemo emits colourless particles; two receivers of different elements
    // with equal ER must gain exactly the same amount off-field.
    const anemo = clone(testAnemo);
    const pyro = clone(testPyro);
    const electro = clone(testElectro);
    pyro.baseStats.energyRecharge = 1;
    electro.baseStats.energyRecharge = 1;
    pyro.elementalSkill.energyGenerated = 0;

    const r = simulateRotation([anemo, pyro, electro], [
      { characterId: "test-anemo", actionType: "skill", abilityId: "test-anemo-e" },
    ], enemy, {});
    expect(r.finalState.characters["test-pyro"]!.energy.totalGained).toBeCloseTo(
      r.finalState.characters["test-electro"]!.energy.totalGained,
    );
  });
});

describe("determinism", () => {
  it("produces an identical result for identical inputs", () => {
    const a = simulateRotation(clone(testTeam), clone(teamRotation), enemy, {});
    const b = simulateRotation(clone(testTeam), clone(teamRotation), enemy, {});
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("is stable across repeated runs reusing the same definition objects", () => {
    const team = clone(testTeam);
    const rotation = clone(teamRotation);
    const first = simulateRotation(team, rotation, enemy, {});
    for (let i = 0; i < 3; i++) {
      expect(JSON.stringify(simulateRotation(team, rotation, enemy, {}))).toBe(
        JSON.stringify(first),
      );
    }
  });
});

describe("event + result contract additions", () => {
  it("puts a full per-character energy snapshot on energy events", () => {
    const r = simulateRotation(clone(testTeam), clone(teamRotation), enemy, {});
    const energyEvents = r.timeline.filter((e) => e.type === "energy");
    expect(energyEvents.length).toBeGreaterThan(0);
    for (const ev of energyEvents) {
      expect(ev.energyByCharacter).toBeDefined();
      // Every party member is present, not just the acting character.
      expect(Object.keys(ev.energyByCharacter!).sort()).toEqual(
        ["test-anemo", "test-electro", "test-hydro", "test-pyro"],
      );
      // The scalar stays consistent with the snapshot it was taken alongside.
      expect(ev.energyByCharacter![ev.characterId]).toBeCloseTo(ev.energy!);
    }
  });

  it("records swap duration and origin on swap events", () => {
    const r = simulateRotation(clone(testTeam), clone(teamRotation), enemy, {});
    const swaps = r.timeline.filter((e) => e.type === "swap");
    expect(swaps.length).toBeGreaterThan(0);
    for (const s of swaps) {
      expect(s.duration).toBe(DEFAULT_SWAP_COST_SECONDS);
    }
    // First action is a pyro skill, so the first swap comes FROM pyro.
    expect(swaps[0]!.fromCharacterId).toBe("test-pyro");
    expect(swaps[0]!.characterId).toBe("test-hydro");
  });

  it("omits fromCharacterId when nobody was on-field yet", () => {
    const r = simulateRotation(clone(testTeam), [
      { characterId: "test-hydro", actionType: "swap" },
    ], enemy, {});
    const swap = r.timeline.find((e) => e.type === "swap")!;
    expect(swap.fromCharacterId).toBeUndefined();
    expect(swap.duration).toBe(DEFAULT_SWAP_COST_SECONDS);
  });

  it("reports the effective swap cost, distinguishing an override from the default", () => {
    const team = clone(testTeam);
    const rotation = clone(teamRotation);
    expect(simulateRotation(team, rotation, enemy, {}).effectiveSwapCost).toBe(
      DEFAULT_SWAP_COST_SECONDS,
    );
    const override = 1.25;
    const r = simulateRotation(team, rotation, enemy, { swapCost: override });
    expect(r.effectiveSwapCost).toBe(override);
    expect(r.timeline.filter((e) => e.type === "swap").every((s) => s.duration === override))
      .toBe(true);
  });

  it("exposes structured warnings mirroring the string warnings", () => {
    const team = clone(testTeam);
    // Burst with no energy -> insufficient-energy warning.
    const r = simulateRotation(team, [
      { characterId: "test-hydro", actionType: "burst", abilityId: "test-hydro-q" },
    ], enemy, {});
    expect(r.warnings.length).toBe(1);
    expect(r.structuredWarnings.length).toBe(1);
    const w = r.structuredWarnings[0]!;
    expect(w.code).toBe("insufficient-energy");
    expect(w.characterId).toBe("test-hydro");
    expect(w.actionIndex).toBe(0);
    expect(w.timestamp).toBe(0);
  });

  it("carries availableAt on a cooldown warning", () => {
    const team = clone(testTeam);
    const rotation: Rotation = [
      { characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" },
      { characterId: "test-pyro", actionType: "skill", abilityId: "test-pyro-e" },
    ];
    const r = simulateRotation(team, rotation, enemy, {});
    const w = r.structuredWarnings.find((x) => x.code === "on-cooldown")!;
    expect(w).toBeDefined();
    expect(w.availableAt).toBeCloseTo(testPyro.elementalSkill.cooldown);
  });
});
