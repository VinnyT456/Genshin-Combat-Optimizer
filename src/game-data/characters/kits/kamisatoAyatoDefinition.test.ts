import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine";
import type { EnemyState } from "@/types";
import {
  KAMISATO_AYATO_KIT_METADATA,
  createKamisatoAyatoDefinition,
} from "./kamisatoAyatoDefinition";

const noCrit = { critMode: "never" as const };
const lowHpEnemy: EnemyState = {
  id: "low-hp-dummy",
  name: "Low HP Dummy",
  level: 90,
  maxHp: 100000,
  currentHp: 40000,
  resistances: { hydro: 0.1, physical: 0.1 },
};

describe("Kamisato Ayato runtime kit", () => {
  it("turns Normal Attacks into Hydro skill damage during Takimeguri Kanka", () => {
    const ayato = createKamisatoAyatoDefinition();
    const result = simulateRotation(
      [ayato],
      [{ characterId: ayato.id, actionType: "skill" }, { characterId: ayato.id, actionType: "normal" }],
      lowHpEnemy,
      noCrit,
    );
    const normalHit = result.timeline.find(
      (event) => event.type === "damage" && event.damage?.abilityId === "kamisato-ayato-shunsuiken-1",
    );
    expect(normalHit?.damage?.element).toBe("hydro");
    expect(normalHit?.damage?.damageType).toBe("skill");
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies C1's 40% Shunsuiken bonus against an enemy below half HP", () => {
    const c0 = createKamisatoAyatoDefinition(0);
    const c1 = createKamisatoAyatoDefinition(1);
    const rotation = [{ characterId: c0.id, actionType: "skill" as const }, { characterId: c0.id, actionType: "normal" as const }];
    const run = (character: typeof c0) => simulateRotation(
      [character],
      rotation.map((action) => ({ ...action, characterId: character.id })),
      lowHpEnemy,
      noCrit,
    );
    expect(run(c1).totalDamage).toBeGreaterThan(run(c0).totalDamage);
  });

  it("uses Namisen HP scaling and C2's three-stack HP increase in actual damage", () => {
    const c0 = createKamisatoAyatoDefinition(0);
    const c2 = createKamisatoAyatoDefinition(2);
    const rotation = [{ characterId: c0.id, actionType: "skill" as const }, { characterId: c0.id, actionType: "normal" as const }];
    const run = (character: typeof c0) => simulateRotation(
      [character],
      rotation.map((action) => ({ ...action, characterId: character.id })),
      lowHpEnemy,
      noCrit,
    );
    expect(run(c0).totalDamage).toBeGreaterThan(0);
    expect(run(c2).totalDamage).toBeGreaterThan(run(c0).totalDamage);
  });

  it("retains generated C3 and C5 talent boosts in damage output", () => {
    const c0 = createKamisatoAyatoDefinition(0);
    const c3 = createKamisatoAyatoDefinition(3);
    const c5 = createKamisatoAyatoDefinition(5);
    const skill = (character: typeof c0) => simulateRotation(
      [character],
      [{ characterId: character.id, actionType: "skill" }],
      lowHpEnemy,
      noCrit,
    );
    const burst = (character: typeof c0) => simulateRotation(
      [character],
      [{ characterId: character.id, actionType: "burst" }],
      lowHpEnemy,
      { ...noCrit, resumeFrom: {
        time: 0,
        activeCharacterId: character.id,
        characters: {
          [character.id]: {
            characterId: character.id,
            energy: { current: character.maxEnergy, max: character.maxEnergy, totalGained: character.maxEnergy, totalSpent: 0 },
            cooldowns: {},
            normalStringIndex: 0,
          },
        },
      } },
    );
    expect(skill(c3).totalDamage).toBeGreaterThan(skill(c0).totalDamage);
    expect(burst(c5).totalDamage).toBeGreaterThan(burst(c0).totalDamage);
  });

  it("documents channels that the generic runtime cannot execute safely", () => {
    expect(KAMISATO_AYATO_KIT_METADATA.unsupportedChannels).toContain("c6ShunsuikenAdditionalFollowUpHits");
    expect(KAMISATO_AYATO_KIT_METADATA.unsupportedChannels).toContain("a4OffFieldEnergyRegenerationBelow40Energy");
  });
});
