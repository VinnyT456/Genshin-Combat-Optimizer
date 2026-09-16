import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import type { SimulationSnapshot } from "@/types";
import { HU_TAO_KIT_METADATA, createHuTaoDefinition } from "./huTaoDefinition";

function damageEvents(result: ReturnType<typeof simulateRotation>) {
  return result.timeline.filter((event) => event.type === "damage");
}

function runHuTao(
  definition: ReturnType<typeof createHuTaoDefinition>,
  actionTypes: ("skill" | "charged" | "burst")[],
  critMode: "never" | "expected" = "never",
  resumeFrom?: SimulationSnapshot,
) {
  return simulateRotation(
    [{ ...definition, burst: { ...definition.burst, energyCost: 0 } }],
    actionTypes.map((actionType) => ({ characterId: "hu-tao", actionType })),
    testEnemy,
    { critMode, ...(resumeFrom ? { resumeFrom } : {}) },
  );
}

describe("Hu Tao runtime kit", () => {
  it("starts Paramita Papilio without inventing a direct skill hit and infuses a charged attack", () => {
    const result = runHuTao(createHuTaoDefinition(0), ["skill", "charged"]);
    const events = damageEvents(result);

    expect(result.errors).toHaveLength(0);
    expect(events).toHaveLength(1);
    expect(events[0]?.damage?.element).toBe("pyro");
    expect(events[0]?.damage?.finalDamage ?? 0).toBeGreaterThan(0);
  });

  it("increases charged damage through the Paramita HP-to-ATK conversion", () => {
    const noSkill = damageEvents(runHuTao(createHuTaoDefinition(0), ["charged"]))[0]?.damage?.finalDamage ?? 0;
    const inStance = damageEvents(runHuTao(createHuTaoDefinition(0), ["skill", "charged"]))[0]?.damage?.finalDamage ?? 0;

    expect(inStance).toBeGreaterThan(noSkill);
    expect(HU_TAO_KIT_METADATA.hpToAtkAtTalentLevel10).toBeCloseTo(0.06912, 8);
  });

  it("grants C6's low-HP CRIT Rate, changing expected charged damage", () => {
    const setup = runHuTao(createHuTaoDefinition(0), ["skill"]);
    const snapshot = setup.finalState;
    const huTaoSnapshot = snapshot.characters["hu-tao"];
    if (!huTaoSnapshot) throw new Error("Expected Hu Tao snapshot");
    const lowHpSnapshot: SimulationSnapshot = {
      ...snapshot,
      characters: {
        ...snapshot.characters,
        "hu-tao": { ...huTaoSnapshot, currentHp: (huTaoSnapshot.maxHp ?? 1) * 0.2 },
      },
    };
    const c0 = damageEvents(runHuTao(createHuTaoDefinition(0), ["charged"], "expected", lowHpSnapshot))[0]?.damage?.finalDamage ?? 0;
    const c6 = damageEvents(runHuTao(createHuTaoDefinition(6), ["charged"], "expected", lowHpSnapshot))[0]?.damage?.finalDamage ?? 0;

    expect(c6).toBeGreaterThan(c0);
  });
});
