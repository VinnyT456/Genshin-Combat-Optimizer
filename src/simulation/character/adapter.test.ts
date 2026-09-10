import { describe, expect, it } from "vitest";
import { liftAbility, liftCharacter } from "@/simulation/character/adapter";
import { allAbilities, findAbility } from "@/simulation/character/character";
import { planAbility } from "@/simulation/character/execution";
import { scaledBase } from "@/simulation/character/scaling";
import { testAnemo, testElectro, testHydro, testPyro } from "@/game-data";
import type { CharacterDefinition } from "@/types";

const LEGACY: CharacterDefinition[] = [testPyro, testHydro, testElectro, testAnemo];

describe("legacy adapter — non-destructive migration", () => {
  it("lifts all four existing test characters without error", () => {
    for (const def of LEGACY) {
      const lifted = liftCharacter(def);
      expect(lifted.id).toBe(def.id);
      expect(lifted.name).toBe(def.name);
      expect(lifted.element).toBe(def.element);
      expect(lifted.maxEnergy).toBe(def.maxEnergy);
      expect(lifted.level).toBe(def.level);
    }
  });

  it("does not mutate the legacy definition it was handed", () => {
    const before = structuredClone(testPyro);
    liftCharacter(testPyro);
    expect(testPyro).toEqual(before);
  });

  it("maps all four legacy slots onto the generic kit", () => {
    const lifted = liftCharacter(testPyro);
    expect(lifted.normalAttacks.hits).toHaveLength(1);
    expect(lifted.normalAttacks.hits[0]!.id).toBe(testPyro.normalAttack.id);
    expect(lifted.chargedAttack?.id).toBe(testPyro.chargedAttack.id);
    expect(lifted.skill.id).toBe(testPyro.elementalSkill.id);
    expect(lifted.burst.id).toBe(testPyro.elementalBurst.id);
  });

  it("makes every legacy ability findable by its original id", () => {
    const lifted = liftCharacter(testPyro);
    for (const legacy of [
      testPyro.normalAttack,
      testPyro.chargedAttack,
      testPyro.elementalSkill,
      testPyro.elementalBurst,
    ]) {
      expect(findAbility(lifted, legacy.id)?.name).toBe(legacy.name);
    }
    expect(allAbilities(lifted)).toHaveLength(4);
  });

  it("preserves the legacy multiplier EXACTLY through the talent table", () => {
    // The migration guarantee: a lifted ability must produce byte-identical
    // base damage to the legacy scalar path (multiplier * atk).
    const lifted = liftCharacter(testPyro);
    const hits = planAbility({
      character: lifted,
      ability: lifted.skill,
      startTime: 0,
      icd: {},
    });
    const atk = testPyro.baseStats.atk;
    const base = scaledBase(hits[0]!.scaling, {
      atk,
      hp: 0,
      def: 0,
      elementalMastery: 0,
    });
    expect(base).toBe(testPyro.elementalSkill.multiplier * atk);
  });

  it("is level-invariant: a lifted scalar reads the same at any talent level", () => {
    const base = liftCharacter(testPyro);
    const maxed = liftCharacter(testPyro, {
      talentLevels: { normal: 15, skill: 15, burst: 15 },
    });
    const plan = (c: typeof base) =>
      planAbility({ character: c, ability: c.burst, startTime: 0, icd: {} })[0]!.scaling;
    expect(plan(maxed)).toEqual(plan(base));
  });

  it("preserves cooldown, energy cost, cast time and particles", () => {
    const lifted = liftCharacter(testPyro);
    const legacy = testPyro.elementalSkill;
    expect(lifted.skill.castTime).toBe(legacy.castTime);
    expect(lifted.skill.energyCost).toBe(legacy.energyCost);
    expect(lifted.skill.energyGenerated).toBe(legacy.energyGenerated);
    expect(lifted.skill.particles).toEqual(legacy.particles);
    expect(lifted.burst.energyCost).toBe(testPyro.elementalBurst.energyCost);
  });

  it("lifts each legacy ability to exactly ONE damage instance", () => {
    // Single-hit is the degenerate case of multi-hit — that is why the engine
    // needs no special case for either.
    const lifted = liftAbility(testPyro.elementalBurst);
    expect(lifted.instances).toHaveLength(1);
  });

  it("declares NO elemental application, rather than inventing gauge/ICD", () => {
    // Legacy data has no gauge or ICD; fabricating one would produce wrong
    // reactions. Absent is the honest answer.
    const lifted = liftCharacter(testPyro);
    for (const ability of allAbilities(lifted)) {
      for (const instance of ability.instances) {
        expect(instance.application).toBeUndefined();
      }
    }
  });

  it("returns empty passives/constellations/resources, not fabricated ones", () => {
    const lifted = liftCharacter(testPyro);
    expect(lifted.passives).toEqual([]);
    expect(lifted.constellations).toEqual([]);
    expect(lifted.resources).toEqual([]);
  });

  it("honours weaponType and rarity overrides", () => {
    const lifted = liftCharacter(testPyro, { weaponType: "bow", rarity: 4 });
    expect(lifted.weaponType).toBe("bow");
    expect(lifted.rarity).toBe(4);
  });

  it("produces a JSON-serializable result (Worker-safe)", () => {
    const lifted = liftCharacter(testPyro);
    expect(structuredClone(lifted)).toEqual(lifted);
  });

  it("is deterministic", () => {
    expect(liftCharacter(testPyro)).toEqual(liftCharacter(testPyro));
  });
});
