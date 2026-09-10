import { describe, expect, it } from "vitest";
import { testAnemo, testElectro, testHydro, testPyro } from "@/game-data";
import { detectResonances } from "@/features/team-builder/resonance";

describe("detectResonances", () => {
  it("returns empty when team has fewer than 4 members", () => {
    expect(detectResonances([testPyro, testPyro, null, null])).toEqual([]);
    expect(detectResonances([testPyro, testHydro, testElectro, null])).toEqual([]);
  });

  it("detects 4 unique elements as Protective Canopy", () => {
    const team = [testPyro, testHydro, testElectro, testAnemo];
    const res = detectResonances(team);
    expect(res).toHaveLength(1);
    expect(res[0]?.name).toBe("Protective Canopy");
    expect(res[0]?.shortDesc).toBe("All RES +15%");
  });

  it("detects double Pyro as Fervent Flames", () => {
    const pyro2 = { ...testPyro, id: "test-pyro-2" };
    const team = [testPyro, pyro2, testHydro, testAnemo];
    const res = detectResonances(team);
    expect(res).toHaveLength(1);
    expect(res[0]?.name).toBe("Fervent Flames");
    expect(res[0]?.element).toBe("pyro");
    expect(res[0]?.shortDesc).toBe("ATK +25%");
  });

  it("detects dual resonances (e.g. 2 Pyro + 2 Hydro)", () => {
    const pyro2 = { ...testPyro, id: "test-pyro-2" };
    const hydro2 = { ...testHydro, id: "test-hydro-2" };
    const team = [testPyro, pyro2, testHydro, hydro2];
    const res = detectResonances(team);
    expect(res).toHaveLength(2);
    expect(res.map((r) => r.name)).toContain("Fervent Flames");
    expect(res.map((r) => r.name)).toContain("Soothing Water");
  });
});
