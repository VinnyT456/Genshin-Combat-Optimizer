import { describe, expect, it } from "vitest";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { syntheticUnit } from "@/simulation/character/fixtures";
import { flatTalent } from "@/simulation/character/talent";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { KitAbility } from "@/simulation/character/kit";
import type { EnemyState, Stats } from "@/types";

function reactionSkill(id: string, element: "pyro" | "electro"): KitAbility {
  return {
    id,
    name: id,
    slot: "skill",
    castTime: 0,
    cooldown: flatTalent(0),
    energyCost: 0,
    instances: [{
      id: `${id}-hit`,
      name: id,
      damageType: "skill",
      element,
      scaling: [{ stat: "atk", table: flatTalent(0) }],
      application: { element, gauge: 2 },
    }],
  };
}

function character(id: string, element: "pyro" | "electro"): GenericCharacterDefinition {
  return {
    ...syntheticUnit,
    id,
    name: id,
    element,
    skill: reactionSkill(`${id}-skill`, element),
    passives: [],
    constellations: [],
    resources: [],
    constellationLevel: 0,
  };
}

const enemy: EnemyState = {
  id: "reaction-hp-target",
  name: "Reaction HP Target",
  level: 90,
  resistances: {},
  maxHp: 1_000,
  currentHp: 1_000,
};

describe("reaction damage updates enemy HP state", () => {
  it("lets transformative damage change later HP-gated hits", () => {
    const pyro = character("hp-pyro", "pyro");
    const electro = character("hp-electro", "electro");
    const result = simulateRotation(
      [pyro, electro],
      [
        { characterId: pyro.id, actionType: "skill" },
        { characterId: electro.id, actionType: "swap" },
        { characterId: electro.id, actionType: "skill" },
        { characterId: pyro.id, actionType: "swap" },
        { characterId: pyro.id, actionType: "normal" },
      ],
      enemy,
      {
        critMode: "never",
        buffResolver: (base: Stats, context) =>
          context.enemy?.currentHp === 0
            ? { ...base, dmgBonus: base.dmgBonus + 1 }
            : base,
      },
    );

    const normal = result.timeline.find(
      (event) => event.characterId === pyro.id && event.damage?.damageType === "normal",
    );
    expect(result.timeline.some((event) => event.damage?.abilityName === "overloaded")).toBe(true);
    expect(normal?.damage?.finalDamage).toBeGreaterThan(50);
  });
});
