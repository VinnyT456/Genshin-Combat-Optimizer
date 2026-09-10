import type { CharacterDefinition, Element } from "@/types";

export interface ElementalResonance {
  id: string;
  name: string;
  element?: Element;
  shortDesc: string;
  fullDesc: string;
}

/**
 * Detect active elemental resonances for a party.
 *
 * In Genshin Impact:
 * - Resonances require a full 4-character party to activate in standard combat.
 * - Having 2 characters of the same element triggers that element's resonance.
 * - Having 4 distinct elements triggers "Protective Canopy".
 * - A 4-character team can have up to two 2-element resonances (e.g. 2 Pyro + 2 Hydro).
 */
export function detectResonances(
  team: readonly (CharacterDefinition | null)[],
): readonly ElementalResonance[] {
  const activeMembers = team.filter((c): c is CharacterDefinition => c !== null);
  if (activeMembers.length < 4) {
    return [];
  }

  const counts = new Map<Element, number>();
  for (const member of activeMembers) {
    counts.set(member.element, (counts.get(member.element) ?? 0) + 1);
  }

  const resonances: ElementalResonance[] = [];

  // Check for pairs
  if ((counts.get("pyro") ?? 0) >= 2) {
    resonances.push({
      id: "pyro-resonance",
      name: "Fervent Flames",
      element: "pyro",
      shortDesc: "ATK +25%",
      fullDesc: "Affected by Cryo for 40% less time. Increases ATK by 25%.",
    });
  }

  if ((counts.get("hydro") ?? 0) >= 2) {
    resonances.push({
      id: "hydro-resonance",
      name: "Soothing Water",
      element: "hydro",
      shortDesc: "Max HP +25%",
      fullDesc: "Affected by Pyro for 40% less time. Increases Max HP by 25%.",
    });
  }

  if ((counts.get("electro") ?? 0) >= 2) {
    resonances.push({
      id: "electro-resonance",
      name: "High Voltage",
      element: "electro",
      shortDesc: "Electro Particles on Reaction",
      fullDesc:
        "Affected by Hydro for 40% less time. Electro reactions have a 100% chance to generate an Electro Particle (CD: 5s).",
    });
  }

  if ((counts.get("anemo") ?? 0) >= 2) {
    resonances.push({
      id: "anemo-resonance",
      name: "Impetuous Winds",
      element: "anemo",
      shortDesc: "Movement SPD +10% · Skill CD -5%",
      fullDesc:
        "Decreases stamina consumption by 15%. Increases Movement SPD by 10%. Shortens Skill CD by 5%.",
    });
  }

  if ((counts.get("cryo") ?? 0) >= 2) {
    resonances.push({
      id: "cryo-resonance",
      name: "Shattering Ice",
      element: "cryo",
      shortDesc: "CRIT Rate +15% vs Cryo/Frozen",
      fullDesc:
        "Affected by Electro for 40% less time. Increases CRIT Rate against enemies that are Frozen or affected by Cryo by 15%.",
    });
  }

  if ((counts.get("geo") ?? 0) >= 2) {
    resonances.push({
      id: "geo-resonance",
      name: "Enduring Rock",
      element: "geo",
      shortDesc: "Shield Strength +15% · DMG +15%",
      fullDesc:
        "Increases shield strength by 15%. Characters protected by a shield deal 15% increased DMG and decrease enemy Geo RES by 20%.",
    });
  }

  if ((counts.get("dendro") ?? 0) >= 2) {
    resonances.push({
      id: "dendro-resonance",
      name: "Sprawling Greenery",
      element: "dendro",
      shortDesc: "EM +50 (up to +150 on reactions)",
      fullDesc:
        "Elemental Mastery increased by 50. Triggering Burning, Quicken, or Bloom grants additional EM.",
    });
  }

  // 4 unique elements triggers Protective Canopy
  if (counts.size === 4 && resonances.length === 0) {
    resonances.push({
      id: "unique-resonance",
      name: "Protective Canopy",
      shortDesc: "All RES +15%",
      fullDesc: "All Elemental RES +15%, Physical RES +15%.",
    });
  }

  return resonances;
}
