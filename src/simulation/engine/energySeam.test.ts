import { describe, expect, it } from "vitest";
import type {
  BuffContext,
  BuffResolver,
  CharacterState,
  Rotation,
  Stats,
} from "@/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { makeEnergyRechargeResolver } from "@/simulation/engine/energySeam";
import { distributeParticles } from "@/simulation/energy";
import { createEnergyState } from "@/simulation/energy/energyState";
import { testEnemy, testHydro, testPyro, testTeam } from "@/game-data";

// ============================================================================
// Energy-time seam: ER buffs must reach the ENERGY path, resolved at the
// instant each particle is collected — not snapshotted at rotation start.
// ============================================================================

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stateOf(def: CharacterState["definition"]): CharacterState {
  const energy = createEnergyState(def);
  return { definition: def, currentEnergy: energy.current, energy, cooldowns: {} };
}

const enemy = testEnemy;

/** The emitting ability; only its identity matters to the seam. */
const PYRO_SKILL = testPyro.elementalSkill;

/** ER buff of `+bonus` (fraction) that is live only on `[from, to)`. */
function erWindowResolver(bonus: number, from: number, to: number): BuffResolver {
  return (base: Stats, context: BuffContext): Stats => {
    const live = context.time >= from && context.time < to;
    // Fresh object: never mutate `base` (frozen resolver contract).
    return live ? { ...base, energyRecharge: base.energyRecharge + bonus } : { ...base };
  };
}

// A rotation of repeated pyro skills. The 6s cooldown spaces the casts out, so
// a time-windowed buff can cover some collections and not others.
const SKILL: Rotation[number] = {
  characterId: "test-pyro",
  actionType: "skill",
  abilityId: "test-pyro-e",
};
const WAIT = { characterId: "test-pyro", actionType: "normal" } as const;

/** Enough 0.5s normals to clear the pyro skill's 6s cooldown after a 1.0s cast. */
const NORMALS_PER_CYCLE = 11;

function pyroSkillRotation(casts: number): Rotation {
  const rotation: Rotation = [];
  for (let i = 0; i < casts; i++) {
    rotation.push({ ...SKILL });
    // Normals fill the 6s skill cooldown so the next cast is legal.
    // Skill castTime 1.0s + 11 normals x 0.5s => next skill starts at 6.5s.
    for (let j = 0; j < NORMALS_PER_CYCLE; j++) rotation.push({ ...WAIT });
  }
  return rotation;
}

/**
 * Total energy `id` gained. Prefer an OFF-FIELD receiver: the pyro caster also
 * gets flat `energyGenerated` (deliberately NOT ER-scaled), which would dilute
 * the ratios these tests assert on.
 */
function gainedBy(id: string, rotation: Rotation, resolver?: BuffResolver): number {
  const r = simulateRotation(clone(testTeam), rotation, enemy, {
    ...(resolver !== undefined ? { buffResolver: resolver } : {}),
  });
  return r.finalState.characters[id]!.energy.totalGained;
}

describe("energy-time seam — regression guard (no buffs)", () => {
  it("leaves particle gains byte-identical when no resolver is configured", () => {
    // Pins today's numbers: the seam must be inert unless a resolver is wired.
    const rotation = pyroSkillRotation(1);
    const before = simulateRotation(clone(testTeam), rotation, enemy, {});
    const after = simulateRotation(clone(testTeam), rotation, enemy, {});
    expect(JSON.stringify(after)).toBe(JSON.stringify(before));
  });

  it("applies the receiver's unbuffed base ER with no resolver", () => {
    const rotation: Rotation = [{ ...SKILL }];
    const r = simulateRotation(clone(testTeam), rotation, enemy, {});
    // Off-field hydro: pyro particle (off-element), off-field 4-party share,
    // scaled by HYDRO's own base ER. Particles only — no flat energy path.
    const PYRO_PARTICLE_COUNT = 4;
    const BASE = 3;
    const OFF_ELEMENT = 1 / 3;
    const OFF_FIELD_SHARE_4 = 0.6;
    expect(r.finalState.characters["test-hydro"]!.energy.totalGained).toBeCloseTo(
      PYRO_PARTICLE_COUNT * BASE * OFF_ELEMENT * OFF_FIELD_SHARE_4 *
        testHydro.baseStats.energyRecharge,
    );
  });

  it("an identity resolver produces the same energy as no resolver at all", () => {
    const rotation = pyroSkillRotation(1);
    const identity: BuffResolver = (base) => ({ ...base });
    expect(gainedBy("test-pyro", rotation, identity)).toBeCloseTo(
      gainedBy("test-pyro", rotation),
    );
  });
});

describe("energy-time seam — ER buff active for the whole rotation", () => {
  const ALWAYS = erWindowResolver(1.0, 0, Number.POSITIVE_INFINITY);

  it("scales energy gain by the buffed ER, not base ER", () => {
    const rotation: Rotation = [{ ...SKILL }];
    // Off-field hydro receives particles ONLY, so the ratio is exact.
    const base = testHydro.baseStats.energyRecharge;
    const buffed = gainedBy("test-hydro", rotation, ALWAYS);
    const unbuffed = gainedBy("test-hydro", rotation);
    // +100% ER => gain scales by (base + 1) / base.
    expect(buffed).toBeCloseTo(unbuffed * ((base + 1.0) / base));
  });

  it("applies the buff to OFF-FIELD receivers too (ER belongs to the collector)", () => {
    const rotation: Rotation = [{ ...SKILL }];
    const buffed = gainedBy("test-hydro", rotation, ALWAYS);
    const unbuffed = gainedBy("test-hydro", rotation);
    expect(buffed).toBeGreaterThan(unbuffed);
  });

  it("is deterministic — identical inputs give a byte-identical result", () => {
    const rotation = pyroSkillRotation(2);
    const a = simulateRotation(clone(testTeam), rotation, enemy, { buffResolver: ALWAYS });
    const b = simulateRotation(clone(testTeam), rotation, enemy, { buffResolver: ALWAYS });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("energy-time seam — PARTIAL window proves per-particle time resolution", () => {
  it("buffs only the collections inside the window, not the whole rotation", () => {
    // 2 casts: t=0 (inside window) and t>=6 (outside). A rotation-start
    // SNAPSHOT would buff both; a per-particle time resolution buffs only the
    // first. This is the test that distinguishes the two implementations.
    const rotation = pyroSkillRotation(2);
    const WINDOW_END = 1.0;
    const partial = erWindowResolver(1.0, 0, WINDOW_END);

    const unbuffed = gainedBy("test-hydro", rotation);
    const partialGain = gainedBy("test-hydro", rotation, partial);
    const always = gainedBy("test-hydro", rotation, erWindowResolver(1.0, 0, Number.POSITIVE_INFINITY));

    // Strictly between: more than unbuffed (first cast was buffed) and less
    // than fully buffed (the second cast was not).
    expect(partialGain).toBeGreaterThan(unbuffed);
    expect(partialGain).toBeLessThan(always);

    // Exactly one of the two casts was buffed: the delta is half the full delta.
    expect(partialGain - unbuffed).toBeCloseTo((always - unbuffed) / 2);
  });

  it("a window covering NO collection instant leaves energy unchanged", () => {
    const rotation = pyroSkillRotation(1);
    // Cast happens at t=0; this window opens strictly after it.
    const late = erWindowResolver(5.0, 100, 200);
    expect(gainedBy("test-hydro", rotation, late)).toBeCloseTo(
      gainedBy("test-hydro", rotation),
    );
  });
});

describe("makeEnergyRechargeResolver", () => {
  const party = testTeam.map(stateOf);

  it("returns undefined with no resolver, so the energy module takes its base path", () => {
    expect(
      makeEnergyRechargeResolver({
        time: 0,
        ability: PYRO_SKILL,
        activeCharacterId: testPyro.id,
        snapshot: { time: 0, characters: {} },
        enemy,
        resolver: undefined,
      }),
    ).toBeUndefined();
  });

  it("passes the RECEIVER (not the caster) as context.character", () => {
    const seen: string[] = [];
    const spy: BuffResolver = (base, context) => {
      seen.push(context.character.id);
      return { ...base };
    };
    const resolve = makeEnergyRechargeResolver({
      time: 3,
      ability: PYRO_SKILL,
      activeCharacterId: testPyro.id,
      snapshot: { time: 3, characters: {} },
      enemy,
      resolver: spy,
    })!;
    for (const member of party) resolve(member);
    // Every receiver is resolved as itself, in party order.
    expect(seen).toEqual(party.map((p) => p.definition.id));
  });

  it("reports the applied ER on each gain", () => {
    const BONUS = 0.5;
    const resolve = makeEnergyRechargeResolver({
      time: 0,
      ability: PYRO_SKILL,
      activeCharacterId: testPyro.id,
      snapshot: { time: 0, characters: {} },
      enemy,
      resolver: erWindowResolver(BONUS, 0, Number.POSITIVE_INFINITY),
    })!;
    const gains = distributeParticles({
      emission: { count: 4, element: "pyro" },
      party,
      activeCharacterId: testPyro.id,
      partySize: party.length,
      energyRechargeFor: resolve,
    });
    for (const gain of gains) {
      const def = party.find((p) => p.definition.id === gain.characterId)!.definition;
      expect(gain.energyRecharge).toBeCloseTo(def.baseStats.energyRecharge + BONUS);
    }
  });
});
