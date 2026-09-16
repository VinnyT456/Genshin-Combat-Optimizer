import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { SHENHE_KIT_METADATA, createShenheDefinition } from "./shenheDefinition";

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage");
}

function runShenhe(
  constellationLevel: number,
  actionTypes: ("skill" | "burst")[],
  options: { ascensionPhase?: number; critMode?: "never" | "expected"; talentLevel?: number } = {},
) {
  const character = createShenheDefinition(
    constellationLevel,
    { normal: 1, skill: options.talentLevel ?? 1, burst: options.talentLevel ?? 1 },
    { ascensionPhase: options.ascensionPhase ?? 6 },
  );
  return simulateRotation(
    [{ ...character, burst: { ...character.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: "shenhe", actionType })),
    testEnemy,
    { critMode: options.critMode ?? "never" },
  );
}

describe("Shenhe runtime kit", () => {
  it("preserves generated baseline skill damage and both sourced skill hits", () => {
    const baseline = runShenhe(0, ["skill"], { ascensionPhase: 0 });
    const events = damageEvents(baseline);

    expect(baseline.errors).toHaveLength(0);
    expect(events).toHaveLength(2);
    expect(events.every((event) => (event.damage?.finalDamage ?? 0) > 0)).toBe(true);
  });

  it("applies A1's 15% Cryo DMG only after the burst field and only when unlocked", () => {
    const locked = damageEvents(runShenhe(0, ["burst", "skill"], { ascensionPhase: 0 }));
    const unlocked = damageEvents(runShenhe(0, ["burst", "skill"], { ascensionPhase: 1 }));
    const baselineSkill = locked.at(-1)?.damage?.finalDamage ?? 0;
    const buffedSkill = unlocked.at(-1)?.damage?.finalDamage ?? 0;

    expect(buffedSkill / baselineSkill).toBeCloseTo(1.15, 8);
    expect(SHENHE_KIT_METADATA.a1CryoDamageBonus).toBe(0.15);
  });

  it("gates C2 Cryo CRIT DMG and its extended field to C2+", () => {
    const c0 = damageEvents(runShenhe(0, ["burst", "skill"], { critMode: "expected" }));
    const c2 = damageEvents(runShenhe(2, ["burst", "skill"], { critMode: "expected" }));
    const baselineSkill = c0.at(-1)?.damage?.finalDamage ?? 0;
    const c2Skill = c2.at(-1)?.damage?.finalDamage ?? 0;

    // Includes the independent 15% A1 Cryo DMG bonus in both cases; C2 adds 15% Cryo CRIT DMG.
    expect(c2Skill).toBeGreaterThan(baselineSkill);
    expect(SHENHE_KIT_METADATA.c2CryoCritDamage).toBe(0.15);
    expect(SHENHE_KIT_METADATA.c2FieldDurationSeconds).toBe(18);
  });

  it("uses generated C3 skill talent levels in simulated damage", () => {
    const c0 = damageEvents(runShenhe(0, ["skill"], { ascensionPhase: 0, talentLevel: 1 }));
    const c3 = damageEvents(runShenhe(3, ["skill"], { ascensionPhase: 0, talentLevel: 1 }));

    expect((c3[0]?.damage?.finalDamage ?? 0)).toBeGreaterThan(c0[0]?.damage?.finalDamage ?? 0);
  });

  it("uses generated C5 burst talent levels in simulated damage", () => {
    const c0 = damageEvents(runShenhe(0, ["burst"], { ascensionPhase: 0, talentLevel: 1 }));
    const c5 = damageEvents(runShenhe(5, ["burst"], { ascensionPhase: 0, talentLevel: 1 }));

    expect(c5[0]?.damage?.finalDamage ?? 0).toBeGreaterThan(c0[0]?.damage?.finalDamage ?? 0);
  });
});
