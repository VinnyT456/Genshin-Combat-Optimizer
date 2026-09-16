import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import { testEnemy } from "@/game-data";
import {
  LAYLA_KIT_METADATA,
  createLaylaDefinition,
} from "./laylaDefinition";

const noCrit = { critMode: "never" as const };

function damage(
  character: ReturnType<typeof createLaylaDefinition>,
  actionType: "skill" | "burst",
): number {
  const ready = actionType === "burst"
    ? { ...character, burst: { ...character.burst, energyCost: 0 } }
    : character;
  return simulateRotation([ready], [{ characterId: ready.id, actionType }], testEnemy, noCrit).totalDamage;
}

describe("Layla runtime kit", () => {
  it("executes the sourced skill and burst damage rows", () => {
    const character = createLaylaDefinition();

    expect(damage(character, "skill")).toBeGreaterThan(0);
    expect(damage(character, "burst")).toBeGreaterThan(0);
  });

  it("adds Sweet Slumber Undisturbed HP scaling only to Shooting Star damage", () => {
    const baseStats = createLaylaDefinition().baseStats;
    const preA4LowHp = createLaylaDefinition(0, undefined, {
      ascensionPhase: 3,
      baseStats: { ...baseStats, hp: 10_000 },
    });
    const preA4HighHp = createLaylaDefinition(0, undefined, {
      ascensionPhase: 3,
      baseStats: { ...baseStats, hp: 30_000 },
    });
    const lowHp = createLaylaDefinition(0, undefined, { baseStats: { ...baseStats, hp: 10_000 } });
    const highHp = createLaylaDefinition(0, undefined, { baseStats: { ...baseStats, hp: 30_000 } });

    expect(damage(preA4HighHp, "skill")).toBe(damage(preA4LowHp, "skill"));
    expect(damage(highHp, "skill")).toBeGreaterThan(damage(lowHp, "skill"));
    expect(damage(highHp, "burst")).toBeGreaterThan(damage(lowHp, "burst"));
    expect(LAYLA_KIT_METADATA.a4ShootingStarHpRatio).toBe(0.015);
  });

  it("applies C6's 40% increase to Shooting Stars and Starlight Slugs", () => {
    const c0 = createLaylaDefinition(0);
    const c6 = createLaylaDefinition(6);

    expect(damage(c6, "skill")).toBeGreaterThan(damage(c0, "skill"));
    expect(damage(c6, "burst")).toBeGreaterThan(damage(c0, "burst"));
    expect(LAYLA_KIT_METADATA.c6ShootingStarDamageMultiplier).toBe(1.4);
    expect(LAYLA_KIT_METADATA.c6StarlightSlugDamageMultiplier).toBe(1.4);
  });

  it("retains generated C3 skill and C5 burst talent boosts", () => {
    expect(damage(createLaylaDefinition(3), "skill")).toBeGreaterThan(damage(createLaylaDefinition(0), "skill"));
    expect(damage(createLaylaDefinition(5), "burst")).toBeGreaterThan(damage(createLaylaDefinition(0), "burst"));
  });
});
