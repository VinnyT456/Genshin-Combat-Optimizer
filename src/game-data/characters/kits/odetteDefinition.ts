/** Runtime Odette overlay for the generated, damage-executable constellation perks. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { odette } from "../generated/cryo";

/**
 * The generated source currently exposes only C3/C5 talent boosts as executable
 * effects. Other passives and constellations intentionally remain inert until
 * their mechanics have a sourced, supported runtime representation.
 */
export function createOdetteDefinition(
  constellationLevel = odette.constellationLevel,
  talentLevels: TalentLevels = odette.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const level = Math.max(0, Math.min(6, Math.trunc(constellationLevel)));
  return {
    ...odette,
    ...overrides,
    constellationLevel: level,
    talentLevels,
    skill: { ...odette.skill },
    burst: { ...odette.burst },
    constellations: odette.constellations.map((constellation) => ({
      ...constellation,
      ...(constellation.buffs ? { buffs: [...constellation.buffs] } : {}),
    })),
  };
}

export const odetteWithKit = createOdetteDefinition();

export const ODETTE_KIT_METADATA = {
  modeledConstellationTalentLevels: { c3Skill: 3, c5Burst: 3 },
  unsupportedChannels: [
    "a1SpringRiteOfTheChosenOne",
    "a4PathetiqueOfPateticheskaya",
    "c1OnThisDancelessMorn",
    "c2SnowSwansUnseenDream",
    "c4UpUpTheLongDeliriousBurningBlue",
    "c6TouchedTheFaceOfTheDivine",
    "p3StellarJubileeDanceOfAurore",
    "p4EchoOfWinterDaydreams",
  ],
} as const;
