import { describe, expect, it } from "vitest";
import { testAnemo, testElectro, testEnemy, testHydro, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";

const config = { critMode: "never" as const };

describe("team elemental resonance", () => {
  it("applies Fervent Flames ATK +25% to a complete party with two Pyro members", () => {
    const secondPyro = { ...testPyro, id: "test-pyro-2" };
    const rotation = [{ characterId: testPyro.id, actionType: "skill" as const }];
    const withoutResonance = simulateRotation(
      [testPyro, testHydro, testElectro, testAnemo],
      rotation,
      testEnemy,
      config,
    );
    const withResonance = simulateRotation(
      [testPyro, secondPyro, testHydro, testElectro],
      rotation,
      testEnemy,
      config,
    );

    expect(withResonance.totalDamage).toBeCloseTo(withoutResonance.totalDamage * 1.25, 9);
  });

  it("fails closed for an incomplete party", () => {
    const secondPyro = { ...testPyro, id: "test-pyro-2" };
    const rotation = [{ characterId: testPyro.id, actionType: "skill" as const }];
    const result = simulateRotation(
      [testPyro, secondPyro, testHydro],
      rotation,
      testEnemy,
      config,
    );
    const baseline = simulateRotation([testPyro], rotation, testEnemy, config);

    expect(result.totalDamage).toBeCloseTo(baseline.totalDamage, 9);
  });
});
