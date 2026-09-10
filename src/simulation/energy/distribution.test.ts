import { describe, expect, it } from "vitest";
import type { CharacterState, ParticleEmission } from "@/types";
import { distributeParticles } from "@/simulation/energy/distribution";
import { createEnergyState } from "@/simulation/energy/energyState";
import {
  PARTICLE_BASE_ENERGY,
  PARTICLE_COLORLESS_MULTIPLIER,
  PARTICLE_OFF_ELEMENT_MULTIPLIER,
  OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE,
} from "@/simulation/energy/constants";
import { testAnemo, testElectro, testHydro, testPyro } from "@/game-data";

const FULL_PARTY = 4;
const OFF_FIELD_SHARE_4 = OFF_FIELD_PARTICLE_SHARE_BY_PARTY_SIZE[FULL_PARTY]!;

function stateOf(def: CharacterState["definition"]): CharacterState {
  const energy = createEnergyState(def);
  return { definition: def, currentEnergy: energy.current, energy, cooldowns: {} };
}

const party: CharacterState[] = [testPyro, testHydro, testElectro, testAnemo].map(
  stateOf,
);

describe("distributeParticles", () => {
  const pyroEmission: ParticleEmission = { count: 4, element: "pyro" };

  it("gives every party member a gain, in team order", () => {
    const gains = distributeParticles({
      emission: pyroEmission,
      party,
      activeCharacterId: testPyro.id,
      partySize: FULL_PARTY,
    });
    expect(gains.map((g) => g.characterId)).toEqual([
      "test-pyro",
      "test-hydro",
      "test-electro",
      "test-anemo",
    ]);
  });

  it("gives the on-field receiver the full share and marks it on-field", () => {
    const gains = distributeParticles({
      emission: pyroEmission,
      party,
      activeCharacterId: testPyro.id,
      partySize: FULL_PARTY,
    });
    const pyro = gains[0]!;
    expect(pyro.onField).toBe(true);
    // on-element, on-field, full share, scaled by pyro's own ER.
    expect(pyro.amount).toBeCloseTo(
      4 * PARTICLE_BASE_ENERGY * 1 * 1 * testPyro.baseStats.energyRecharge,
    );
  });

  it("scales off-field members by the party-size share", () => {
    const gains = distributeParticles({
      emission: pyroEmission,
      party,
      activeCharacterId: testPyro.id,
      partySize: FULL_PARTY,
    });
    const hydro = gains[1]!;
    expect(hydro.onField).toBe(false);
    // off-element pyro particle received by hydro, off-field, hydro's own ER.
    expect(hydro.amount).toBeCloseTo(
      4 *
        PARTICLE_BASE_ENERGY *
        PARTICLE_OFF_ELEMENT_MULTIPLIER *
        OFF_FIELD_SHARE_4 *
        testHydro.baseStats.energyRecharge,
    );
  });

  it("applies the colourless multiplier to every receiver regardless of element", () => {
    const colorless: ParticleEmission = { count: 3, element: "physical" };
    const gains = distributeParticles({
      emission: colorless,
      party,
      activeCharacterId: testAnemo.id,
      partySize: FULL_PARTY,
    });
    const anemo = gains[3]!;
    expect(anemo.onField).toBe(true);
    expect(anemo.amount).toBeCloseTo(
      3 * PARTICLE_BASE_ENERGY * PARTICLE_COLORLESS_MULTIPLIER * 1 *
        testAnemo.baseStats.energyRecharge,
    );
  });

  it("honours baseEnergyPerUnit so an orb differs from a particle", () => {
    const orb: ParticleEmission = {
      count: 1,
      element: "electro",
      baseEnergyPerUnit: 9,
    };
    const gains = distributeParticles({
      emission: orb,
      party,
      activeCharacterId: testElectro.id,
      partySize: FULL_PARTY,
    });
    // 1 orb * 9 base, on-element, on-field, electro's own ER.
    expect(gains[2]!.amount).toBeCloseTo(9 * testElectro.baseStats.energyRecharge);
  });

  it("gives a smaller party a larger off-field share", () => {
    const four = distributeParticles({
      emission: pyroEmission,
      party,
      activeCharacterId: testPyro.id,
      partySize: 4,
    })[1]!.amount;
    const two = distributeParticles({
      emission: pyroEmission,
      party,
      activeCharacterId: testPyro.id,
      partySize: 2,
    })[1]!.amount;
    expect(two).toBeGreaterThan(four);
  });

  it("gives everyone the off-field share when nobody is on-field", () => {
    const gains = distributeParticles({
      emission: pyroEmission,
      party,
      activeCharacterId: undefined,
      partySize: FULL_PARTY,
    });
    expect(gains.every((g) => !g.onField)).toBe(true);
  });
});
