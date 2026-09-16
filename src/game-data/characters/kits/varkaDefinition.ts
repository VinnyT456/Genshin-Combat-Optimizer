/** Runtime overlay for Varka's sourced baseline damage. Unverified perks stay inert. */

import type { GenericCharacterDefinition, TalentLevels } from "@/simulation/character/character";
import { varka } from "../generated/anemo";

export function createVarkaDefinition(
  constellationLevel = varka.constellationLevel,
  talentLevels: TalentLevels = varka.talentLevels,
  overrides: Partial<Pick<GenericCharacterDefinition, "level" | "ascensionPhase" | "baseStats">> = {},
): GenericCharacterDefinition {
  const safeConstellation = Number.isFinite(constellationLevel)
    ? Math.max(0, Math.min(6, Math.trunc(constellationLevel)))
    : 0;

  return {
    ...varka,
    ...overrides,
    constellationLevel: safeConstellation,
    talentLevels,
  };
}

export const VARKA_KIT_METADATA = {
  executableDamage: [
    "generatedPhysicalNormalChargedAndPlungeDamage",
    "generatedAnemoSkillAndBurstDamage",
  ],
  unsupportedChannels: [
    "a1AttackThresholdPartyElementPriorityAndSturmUndDrangStateMultipliersUnverified",
    "a4SwirlTriggeredAzureFangsOathStacksUnverifiedAndStateful",
    "c1SturmUndDrangEntryExtraSkillUseAndLyricalLibationUnverified",
    "c2AzureDevourAndFourWindsAscensionAdditionalStrikeUnverified",
    "c3SkillTalentBoostUnverified",
    "c4SwirlTriggeredPartyDamageBonusUnverified",
    "c5BurstTalentBoostUnverified",
    "c6SturmUndDrangFollowUpAndAzureFangsOathCritDamageUnverified",
    "p3DomainDependentHoldSkillCooldownReductionUnverified",
    "p4HexereiPartyNormalHitCooldownReductionUnverified",
    "sturmUndDrangAndAzureFangsOathResourcesNotDeclared",
    "castTimesUseEngineDefaultsNotSourced",
  ],
} as const;

export const varkaWithKit = createVarkaDefinition();
