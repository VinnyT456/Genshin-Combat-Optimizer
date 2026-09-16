import { describe, expect, it } from "vitest";
import { testEnemy, testPyro } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { createAloyDefinition } from "./aloyDefinition";

function damageFor(
  aloy: ReturnType<typeof createAloyDefinition>,
  rotation: Parameters<typeof simulateRotation>[1],
  team: Parameters<typeof simulateRotation>[0] = [aloy],
): number {
  const result = simulateRotation(team, rotation, testEnemy, { critMode: "never" });
  return result.totalDamage;
}

describe("Aloy runtime kit", () => {
  it("executes sourced skill damage through the generic simulation path", () => {
    const aloy = createAloyDefinition(0, { normal: 1, skill: 10, burst: 1 });
    const result = simulateRotation(
      [aloy],
      [{ characterId: "aloy", actionType: "skill" }],
      testEnemy,
      { critMode: "never" },
    );

    expect(result.totalDamage).toBeGreaterThan(0);
    expect(result.timeline.some((event) => event.type === "damage" && event.characterId === "aloy")).toBe(true);
  });

  it("applies Combat Override's 16% self ATK bonus after Frozen Wilds", () => {
    const c0 = createAloyDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const rotation = [
      { characterId: "aloy", actionType: "skill" as const },
      { characterId: "aloy", actionType: "normal" as const },
    ];

    expect(damageFor(c0, rotation)).toBeGreaterThan(
      damageFor(c0, [{ characterId: "aloy", actionType: "normal" }]),
    );
  });

  it("applies Combat Override's 8% party ATK bonus to an active teammate", () => {
    const aloy = createAloyDefinition(0, { normal: 1, skill: 1, burst: 1 });
    const rotation = [
      { characterId: "aloy", actionType: "skill" as const },
      { characterId: "test-pyro", actionType: "swap" as const },
      { characterId: "test-pyro", actionType: "normal" as const },
    ];
    const withOverride = damageFor(aloy, rotation, [aloy, testPyro]);
    const withoutOverride = damageFor(
      aloy,
      [
        { characterId: "test-pyro", actionType: "normal" as const },
      ],
      [aloy, testPyro],
    );

    expect(withOverride).toBeGreaterThan(withoutOverride);
  });

  it("keeps Aloy's flavor-only constellation rows damage-neutral", () => {
    const rotation = [{ characterId: "aloy", actionType: "burst" as const }];
    const c0 = createAloyDefinition(0);
    const c6 = createAloyDefinition(6);
    expect(damageFor(c6, rotation)).toBe(damageFor(c0, rotation));
  });
});

