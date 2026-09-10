import { describe, expect, it } from "vitest";
import type { EnemyState, Rotation } from "@/types";
import {
  generatedCharacters,
  generatedPerkEffects,
} from "@/game-data/characters/generated";
import { simulateRotation } from "@/simulation/engine/simulateRotation";

interface TalentBoostRecord {
  characterId: string;
  perkId: string;
  buffId: string;
  kind: "constellation";
  name: string;
  buffSource: string;
  sourceCharacterId: string;
  unlockLevel: number;
  slot: "normal" | "skill" | "burst";
  levels: number;
  targetScope: "self";
  startTime: number;
  duration: number;
}

function presentationBoosts(): TalentBoostRecord[] {
  return generatedPerkEffects
    .filter((perk) => perk.talentLevelBoost !== undefined)
    .map((perk) => ({
      characterId: perk.characterId,
      perkId: perk.id,
      buffId: perk.id,
      kind: "constellation" as const,
      name: perk.name,
      buffSource: perk.name,
      sourceCharacterId: perk.characterId,
      unlockLevel: perk.constellationLevel!,
      slot: perk.talentLevelBoost!.slot,
      levels: perk.talentLevelBoost!.levels,
      targetScope: "self" as const,
      startTime: 0,
      duration: Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => a.perkId.localeCompare(b.perkId));
}

function engineBoosts(): TalentBoostRecord[] {
  const records: TalentBoostRecord[] = [];
  for (const character of generatedCharacters) {
    for (const constellation of character.constellations) {
      for (const buff of constellation.buffs ?? []) {
        for (const modifier of buff.talentLevelModifiers ?? []) {
          records.push({
            characterId: character.id,
            perkId: constellation.id,
            buffId: buff.id,
            kind: "constellation",
            name: constellation.name,
            buffSource: buff.source,
            sourceCharacterId: buff.sourceCharacterId ?? "",
            unlockLevel: constellation.level,
            slot: modifier.slot,
            levels: modifier.levels,
            targetScope: buff.targets.scope as "self",
            startTime: buff.startTime,
            duration: buff.duration,
          });
        }
      }
    }
  }
  return records.sort((a, b) => a.perkId.localeCompare(b.perkId));
}

describe("generated talent-boost channel reconciliation", () => {
  it("keeps every presentation effect identical to its live engine buff", () => {
    const presentation = presentationBoosts();
    const engine = engineBoosts();

    expect(presentation).toHaveLength(259);
    expect(engine).toHaveLength(259);
    expect(engine).toEqual(presentation);

    for (const perk of generatedPerkEffects.filter(
      (row) => row.talentLevelBoost !== undefined,
    )) {
      expect(perk.kind).toBe("constellation");
      expect(perk.support).toBe("modelled");
      expect(perk.constellationLevel).toBeDefined();
    }
  });

  it("applies Bennett C3's reconciled +3 skill boost to real roster damage", () => {
    const bennett = generatedCharacters.find((character) => character.id === "bennett");
    expect(bennett).toBeDefined();
    if (bennett === undefined) return;

    const enemy: EnemyState = {
      id: "talent-reconciliation-enemy",
      name: "Talent Reconciliation Enemy",
      level: 90,
      resistances: {},
    };
    const rotation: Rotation = [
      { characterId: bennett.id, actionType: "skill" },
    ];

    const beforeUnlock = simulateRotation(
      [{ ...bennett, constellationLevel: 2 }],
      rotation,
      enemy,
    );
    const boosted = simulateRotation(
      [{ ...bennett, constellationLevel: 3 }],
      rotation,
      enemy,
    );
    const equivalentLevel = simulateRotation(
      [
        {
          ...bennett,
          constellationLevel: 0,
          talentLevels: { ...bennett.talentLevels, skill: 13 },
        },
      ],
      rotation,
      enemy,
    );

    expect(boosted.totalDamage).toBeGreaterThan(beforeUnlock.totalDamage);
    expect(boosted.totalDamage).toBeCloseTo(equivalentLevel.totalDamage, 9);
  });
});
