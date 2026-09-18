import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type {
  AbilityChargeDefinition,
  ResourceDefinition,
  ResourceCost,
  StateEffect,
} from "@/simulation/character/kit";
import {
  characterTalentZhById,
  type CharacterTalentZh,
} from "@/lib/characterTalentZh";
import {
  parseResourceGainEvidence,
  parseTalentUsageEvidence,
  type CharacterUsageEvidence,
  type TalentUsageEvidence,
  type UsageEvidenceQuote,
} from "@/lib/characterUsageEvidence";
import { elementalSkillUsesAtConstellation } from "./elementalSkillUsageData";

// ============================================================================
// Character usage/resource profile
//
// Talent text is the source of truth for usage signals. This module only
// supplies the small amount of metadata the text cannot contain: stable
// resource ids and verified caps. It must never guess a charge from a vague
// phrase such as "can cast again" or a stack cap such as "up to 3 stacks".
// ============================================================================

interface AlternateResourceSpec {
  readonly id: string;
  readonly name: string;
  /** The cap is not present in the talent prose, so keep its provenance here. */
  readonly max: number;
}

/**
 * Verified resource caps for the two currently non-energy bursts.
 *
 * The talent descriptions identify the resource and its threshold but omit a
 * numeric cap. Keeping that missing fact explicit prevents the parser from
 * inventing one while still allowing the engine to validate a cast. The caps
 * should be rechecked whenever the game data version changes.
 */
const alternateResourceSpecsByName: Readonly<
  Record<string, AlternateResourceSpec>
> = {
  蛇之狡谋: { id: "serpents-subtlety", name: "Serpent's Subtlety", max: 100 },
  战意: { id: "fighting-spirit", name: "Fighting Spirit", max: 200 },
};

function talentEvidenceFor(
  characterId: string,
): Readonly<Partial<Record<"normal" | "skill" | "burst", TalentUsageEvidence>>> {
  const talent: CharacterTalentZh | undefined = characterTalentZhById[characterId];
  if (talent === undefined) return {};
  const result: CharacterUsageEvidence = {};
  for (const slot of ["normal", "skill", "burst"] as const) {
    const description = talent.abilities[slot]?.descriptionZh;
    if (description !== undefined) result[slot] = parseTalentUsageEvidence(description);
  }
  return result;
}

function skillChargeDefinition(
  evidence: TalentUsageEvidence | undefined,
  characterId: string,
  constellationLevel: number,
): AbilityChargeDefinition | undefined {
  const authoredCount = elementalSkillUsesAtConstellation(
    characterId,
    constellationLevel,
  );
  const count = authoredCount ?? evidence?.initialCharges?.count;
  if (count === undefined || !Number.isInteger(count) || count < 2) {
    return undefined;
  }
  // Manual rows override text-derived counts when present, including an
  // explicit C0 value of 1. Conditional extra uses from prose remain in the
  // evidence/status view until the state model can express their trigger.
  return { maxCharges: count };
}

function alternateResourceCost(
  burstEvidence: TalentUsageEvidence | undefined,
): {
  resource: ResourceDefinition;
  cost: ResourceCost;
} | undefined {
  const evidence = burstEvidence?.alternateResource;
  if (evidence === undefined || evidence.minimum === undefined || !evidence.consumesAll) {
    return undefined;
  }
  const spec = alternateResourceSpecsByName[evidence.resourceName];
  if (spec === undefined) return undefined;

  const minimumAmount =
    evidence.minimum.unit === "percent"
      ? (spec.max * evidence.minimum.amount) / 100
      : evidence.minimum.amount;
  if (!(minimumAmount >= 0) || !Number.isFinite(minimumAmount)) return undefined;

  return {
    resource: {
      id: spec.id,
      name: spec.name,
      initial: 0,
      max: spec.max,
      startAtMaxWithFullEnergy: true,
    },
    cost: {
      resourceId: spec.id,
      amount: minimumAmount,
      consume: "all",
    },
  };
}

function withSkillResourceGains(
  skill: GenericCharacterDefinition["skill"],
  resource: ResourceDefinition | undefined,
  resourceName: string | undefined,
  talent: CharacterTalentZh | undefined,
): GenericCharacterDefinition["skill"] {
  if (resource === undefined || resourceName === undefined || talent === undefined) {
    return skill;
  }
  const gains = parseResourceGainEvidence(
    talent.abilities.skill?.descriptionZh ?? "",
    resourceName,
  );
  if (gains.length === 0) return skill;
  const existingEffects = skill.effects ?? [];
  const seenAmounts = new Set<number>();
  const newGains = gains.filter((gain) => {
    const alreadyDeclared = existingEffects.some(
      (effect) =>
        effect.resourceId === resource.id &&
        effect.kind === "gain" &&
        effect.amount === gain.amount,
    );
    if (alreadyDeclared || seenAmounts.has(gain.amount)) return false;
    seenAmounts.add(gain.amount);
    return true;
  });
  if (newGains.length === 0) return skill;
  const effects: StateEffect[] = [
    ...existingEffects,
    ...newGains.map((gain) => ({
      resourceId: resource.id,
      kind: "gain" as const,
      amount: gain.amount,
    })),
  ];
  return { ...skill, effects };
}

/** Applies the text-derived usage/resource profile to one definition. */
export function withCharacterUsage(
  character: GenericCharacterDefinition,
): GenericCharacterDefinition {
  const talent = characterTalentZhById[character.id];
  const evidence = talentEvidenceFor(character.id);
  const charges = skillChargeDefinition(
    evidence.skill,
    character.id,
    character.constellationLevel,
  );
  const burstResource = alternateResourceCost(evidence.burst);

  let skill = character.skill;
  if (charges !== undefined) skill = { ...skill, charges };
  if (burstResource !== undefined) {
    skill = withSkillResourceGains(
      skill,
      burstResource.resource,
      evidence.burst?.alternateResource?.resourceName,
      talent,
    );
  }

  const burst =
    burstResource === undefined
      ? character.burst
      : {
          ...character.burst,
          // The alternate resource is the burst's cost channel; no ordinary
          // energy is consumed because generated maxEnergy/energyCost are 0.
          cost: { resources: [burstResource.cost] },
        };
  const resources =
    burstResource === undefined
      ? character.resources
      : [
          ...character.resources.filter(
            (resource) => resource.id !== burstResource.resource.id,
          ),
          burstResource.resource,
        ];

  return { ...character, skill, burst, resources };
}

export interface SkillUsageStatus {
  characterId: string;
  kind: "single" | "charges";
  maxUses: number;
  inputVariants: "tap-hold" | "single";
  canRecast: boolean;
  additionalUses: readonly {
    count: number;
    condition: UsageEvidenceQuote;
  }[];
  source: "talent-text" | "manual-data" | "definition";
  evidence: readonly UsageEvidenceQuote[];
}

export type BurstResourceStatus =
  | {
      kind: "energy";
      max: number;
      cost: number;
      source: "definition";
      evidence: readonly UsageEvidenceQuote[];
    }
  | {
      kind: "alternate-resource";
      resourceId: string;
      resourceName: string;
      max: number;
      minimumCost: number;
      consume: "amount" | "all";
      specialZeroCostVariant: boolean;
      source: "talent-text";
      evidence: readonly UsageEvidenceQuote[];
    }
  | {
      kind: "none";
      source: "definition";
      evidence: readonly UsageEvidenceQuote[];
    };

export interface CharacterUsageStatus {
  characterId: string;
  skill: SkillUsageStatus;
  burst: BurstResourceStatus;
}

function evidenceQuotesFor(
  evidence: TalentUsageEvidence | undefined,
): readonly UsageEvidenceQuote[] {
  if (evidence === undefined) return [];
  const quotes: UsageEvidenceQuote[] = [];
  if (evidence.initialCharges !== undefined) quotes.push(evidence.initialCharges.evidence);
  quotes.push(...evidence.additionalUses.map((entry) => entry.condition));
  if (evidence.alternateResource !== undefined) {
    quotes.push(...evidence.alternateResource.evidence);
  }
  return quotes;
}

/** Returns the resolved, evidence-backed usage/resource status. */
export function characterUsageStatus(
  character: GenericCharacterDefinition,
): CharacterUsageStatus {
  const evidence = talentEvidenceFor(character.id);
  const skillEvidence = evidence.skill;
  const resolved = withCharacterUsage(character);
  const authoredSkillUses = elementalSkillUsesAtConstellation(
    character.id,
    character.constellationLevel,
  );
  const charges = resolved.skill.charges;
  const skill: SkillUsageStatus = {
    characterId: character.id,
    kind: charges === undefined ? "single" : "charges",
    maxUses: charges?.maxCharges ?? 1,
    inputVariants: skillEvidence?.inputVariants ?? "single",
    canRecast: skillEvidence?.canRecast ?? false,
    additionalUses: skillEvidence?.additionalUses ?? [],
    source:
      authoredSkillUses !== undefined
        ? "manual-data"
        : charges === undefined
          ? "definition"
          : "talent-text",
    evidence: evidenceQuotesFor(skillEvidence),
  };

  const resourceCost = resolved.burst.cost?.resources?.[0];
  const resource = resourceCost
    ? resolved.resources.find((entry) => entry.id === resourceCost.resourceId)
    : undefined;
  const burstEvidence = evidence.burst;
  if (
    resourceCost !== undefined &&
    resource !== undefined &&
    burstEvidence?.alternateResource !== undefined
  ) {
    return {
      characterId: character.id,
      skill,
      burst: {
        kind: "alternate-resource",
        resourceId: resource.id,
        resourceName: resource.name,
        max: resource.max,
        minimumCost: resourceCost.amount,
        consume: resourceCost.consume ?? "amount",
        specialZeroCostVariant: burstEvidence.alternateResource.zeroCostVariant,
        source: "talent-text",
        evidence: evidenceQuotesFor(burstEvidence),
      },
    };
  }

  const energyCost = resolved.burst.cost?.energy ?? resolved.burst.energyCost;
  return {
    characterId: character.id,
    skill,
    burst:
      resolved.maxEnergy > 0 || energyCost > 0
        ? {
            kind: "energy",
            max: resolved.maxEnergy,
            cost: energyCost,
            source: "definition",
            evidence: evidenceQuotesFor(burstEvidence),
          }
        : {
            kind: "none",
            source: "definition",
            evidence: evidenceQuotesFor(burstEvidence),
          },
  };
}

/** Total roster audit helper: every definition returns a status. */
export function characterUsageStatuses(
  characters: readonly GenericCharacterDefinition[],
): readonly CharacterUsageStatus[] {
  return characters.map(characterUsageStatus);
}
