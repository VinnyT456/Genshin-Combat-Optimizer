import type {
  CharacterDefinition,
  CharacterForm,
  CharacterFormId,
  CharacterIdentityId,
  CharacterRosterEntry,
  Element,
  SupportClaim,
  SupportTier,
} from "@/types";
import { isFullSupport, LEAST_SUPPORTED_TIER } from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { Rarity, WeaponType } from "@/simulation/character/kit";
import { talentValueAt } from "@/simulation/character/talent";
import { generatedCharacters } from "./generated";
import { generatedCharacterMetaById } from "./generated/meta";
import { generatedCharacterProvenanceById } from "./generated/provenance";
import { getCharacterKitDetails } from "./kits/raidenNationalKit";

// ============================================================================
// Playable Character Registry
//
// The roster is GENERATED, never hand-authored. Every character below comes
// from `./generated`, which `scripts/generate-characters` emits from datamined
// game files cross-verified between two independent sources. The previous
// hand-written roster was removed after the TASK #028 audit found 83% of its
// normal-attack multipliers matched no real game value at any talent level.
//
// This module adds only the things a combat definition does not carry: the
// roster entry (identity + forms) and the support claim. Both are derived —
// nothing here is a judgement call about a specific character.
// ============================================================================

/** A generated character joined with its roster presentation. */
export type PlayableCharacter = GenericCharacterDefinition & {
  rosterEntry: CharacterRosterEntry;
  claim: SupportClaim;
};

/**
 * Support claim for one character, DERIVED from what the generator actually
 * emitted for that character.
 *
 * This used to be a single constant shared by the whole roster: one tier and
 * one identical `tierReason` sentence on all 132 entries. That sentence was
 * true in aggregate and told a reader nothing about the character in front of
 * them — two characters with completely different gaps read identically, so
 * the field carried no information and could not be acted on.
 *
 * The generator now emits per-character counts (`generated/provenance.ts`),
 * and the claim is read from there. The tier itself is still `PARTIAL` for
 * every character — see below — but the REASON is that character's own.
 *
 * A character the generator has no provenance row for fails CLOSED, to the
 * least-supported tier. A missing row means this registry does not know what
 * was modelled, and "unknown" must never resolve to the permissive answer.
 */
function claimFor(character: GenericCharacterDefinition): SupportClaim {
  const provenance = generatedCharacterProvenanceById.get(character.id);
  const tier: SupportTier = provenance?.supportTier ?? LEAST_SUPPORTED_TIER;
  // `SupportClaim` is a discriminated union: `FULL` carries no reason, every
  // other tier REQUIRES one. `isFullSupport` is the shared exhaustive guard, so
  // a tier added to the union later fails to compile there rather than
  // silently taking the reason-less branch here.
  if (isFullSupport(tier)) return { supportTier: tier };
  return {
    supportTier: tier,
    tierReason:
      provenance?.tierReason ??
      "No generated provenance row for this character, so what is and is " +
        "not modelled for it is unknown.",
  };
}

/** Sort key for a character with no sourced release date — orders last. */
const UNDATED_SORT_KEY = "9999-99-99";

function metaFor(character: GenericCharacterDefinition) {
  return generatedCharacterMetaById.get(character.id);
}

/** Identity of a character: shared across the Traveler's forms, else its own id. */
function identityIdOf(character: GenericCharacterDefinition): CharacterIdentityId {
  return (metaFor(character)?.identityId ?? character.id) as CharacterIdentityId;
}

function formIdOf(character: GenericCharacterDefinition): CharacterFormId {
  return character.id as CharacterFormId;
}

function formOf(character: GenericCharacterDefinition): CharacterForm {
  return {
    formId: formIdOf(character),
    element: character.element,
    formLabel: metaFor(character)?.formLabel ?? character.name,
    claim: claimFor(character),
  };
}

/**
 * Release date used for roster ordering, sourced from the primary datamined
 * source. Characters the source does not date sort last rather than being
 * given a plausible-looking date.
 */
export function releaseDateOf(character: GenericCharacterDefinition): string {
  return metaFor(character)?.releaseDate ?? UNDATED_SORT_KEY;
}

/**
 * Roster order: by release date, then rarity, then name.
 *
 * Every term is sourced or intrinsic, and the final term is a total order on a
 * unique field, so the sort is deterministic regardless of input order.
 */
function byRelease(
  a: GenericCharacterDefinition,
  b: GenericCharacterDefinition,
): number {
  const dateA = releaseDateOf(a);
  const dateB = releaseDateOf(b);
  if (dateA !== dateB) return dateA.localeCompare(dateB);
  if (a.rarity !== b.rarity) return b.rarity - a.rarity;
  if (a.name !== b.name) return a.name.localeCompare(b.name);
  return a.id.localeCompare(b.id);
}

// --- Roster entries ---------------------------------------------------------

/**
 * Forms grouped by identity, in roster order.
 *
 * Built before `allCharacters` is consumed because a character's roster entry
 * must list ALL of its identity's forms, including ones that sort elsewhere.
 */
const formsByIdentity: ReadonlyMap<CharacterIdentityId, CharacterForm[]> = (() => {
  const grouped = new Map<CharacterIdentityId, CharacterForm[]>();
  for (const character of [...generatedCharacters].sort(byRelease)) {
    const identityId = identityIdOf(character);
    const forms = grouped.get(identityId);
    if (forms === undefined) {
      grouped.set(identityId, [formOf(character)]);
    } else {
      forms.push(formOf(character));
    }
  }
  return grouped;
})();

const identityNames: ReadonlyMap<CharacterIdentityId, string> = new Map(
  [...generatedCharacters]
    .sort(byRelease)
    .map((character) => [identityIdOf(character), character.name] as const),
);

function rosterEntryForIdentity(
  identityId: CharacterIdentityId,
): CharacterRosterEntry {
  const forms = formsByIdentity.get(identityId) ?? [];
  const [first, ...rest] = forms;
  if (first === undefined) {
    // Unreachable: every identity is derived from at least one character.
    throw new Error(`no forms for identity "${identityId}"`);
  }
  return {
    identityId,
    name: identityNames.get(identityId) ?? identityId,
    forms: [first, ...rest],
  };
}

export const allCharacters: readonly PlayableCharacter[] = [...generatedCharacters]
  .sort(byRelease)
  .map((character) => ({
    ...character,
    rosterEntry: rosterEntryForIdentity(identityIdOf(character)),
    claim: claimFor(character),
  }));

export const charactersById: ReadonlyMap<string, PlayableCharacter> = new Map(
  allCharacters.map((char) => [char.id, char]),
);

/**
 * One entry per CHARACTER, not per form.
 *
 * The Traveler appears exactly once, carrying its elemental forms as a list —
 * the N10 / OQ-4 shape. Because there is one entry per identity, the natural
 * duplicate key (`entry.identityId`) is already the correct one.
 */
export const characterRosterEntries: readonly CharacterRosterEntry[] = (() => {
  const seen = new Set<CharacterIdentityId>();
  const entries: CharacterRosterEntry[] = [];
  for (const character of allCharacters) {
    const identityId = identityIdOf(character);
    if (seen.has(identityId)) continue;
    seen.add(identityId);
    entries.push(rosterEntryForIdentity(identityId));
  }
  return entries;
})();

export const rosterEntriesByIdentity: ReadonlyMap<
  CharacterIdentityId,
  CharacterRosterEntry
> = new Map(characterRosterEntries.map((entry) => [entry.identityId, entry]));

export function findCharacter(id: string): PlayableCharacter | undefined {
  return charactersById.get(id);
}

export function findRosterEntry(
  identityId: string,
): CharacterRosterEntry | undefined {
  return rosterEntriesByIdentity.get(identityId as CharacterIdentityId);
}

export interface CharacterFilterOptions {
  element?: Element;
  weaponType?: WeaponType;
  rarity?: Rarity;
  supportTier?: SupportTier;
}

export function filterCharacters(
  options: CharacterFilterOptions = {},
): readonly PlayableCharacter[] {
  return allCharacters.filter((char) => {
    if (options.element !== undefined && char.element !== options.element) {
      return false;
    }
    if (
      options.weaponType !== undefined &&
      char.weaponType !== options.weaponType
    ) {
      return false;
    }
    if (options.rarity !== undefined && char.rarity !== options.rarity) {
      return false;
    }
    if (
      options.supportTier !== undefined &&
      char.claim.supportTier !== options.supportTier
    ) {
      return false;
    }
    return true;
  });
}

// --- Legacy adapter ---------------------------------------------------------

/**
 * Adapter to the Phase 1 `CharacterDefinition` shape.
 *
 * LOSSY BY CONSTRUCTION, and the losses are the point of the newer shape:
 * `CharacterDefinition` holds ONE scalar multiplier per ability and assumes ATK
 * scaling, so a per-level table has to be collapsed to a single level and a
 * non-ATK scaler cannot be represented at all. The multiplier is therefore
 * resolved at the character's OWN authored talent level via `talentValueAt`
 * rather than being read off index 0, which would silently report every
 * character's level-1 numbers.
 *
 * Prefer `GenericCharacterDefinition` in new code; this exists so Phase 1
 * components keep working.
 */
export function toLegacyCharacterDefinition(
  character: PlayableCharacter,
): CharacterDefinition {
  const n1 = character.normalAttacks.hits[0];
  const ca = character.chargedAttack ?? n1;

  const kitDetails = getCharacterKitDetails(character.id);
  const constellation = character.constellationLevel || (kitDetails ? kitDetails.defaultConstellation : 0);
  const talentLevels = character.talentLevels || (kitDetails ? kitDetails.defaultTalentLevels : { normal: 1, skill: 1, burst: 1 });
  const { normal, skill: skillLevel, burst: burstLevel } = talentLevels;

  return {
    id: character.id,
    name: character.name,
    element: character.element,
    level: character.level,
    baseStats: character.baseStats,
    maxEnergy: character.maxEnergy,
    normalAttack: legacyAbility(n1, "normal", normal, character.element),
    chargedAttack: legacyAbility(ca, "charged", normal, character.element),
    elementalSkill: {
      ...legacyAbility(character.skill, "skill", skillLevel, character.element),
      cooldown: talentValueAt(character.skill.cooldown, skillLevel),
      energyGenerated: character.skill.energyGenerated ?? 0,
      particles: character.skill.particles,
    },
    elementalBurst: {
      ...legacyAbility(character.burst, "burst", burstLevel, character.element),
      cooldown: talentValueAt(character.burst.cooldown, burstLevel),
      energyCost: character.burst.energyCost,
    },
    constellation,
    talentLevels,
  };
}

type LegacyActionType = "normal" | "charged" | "skill" | "burst";

/**
 * Collapses one kit ability to the legacy single-multiplier shape.
 *
 * Sums the ATK-scaling terms of the ability's instances at `talentLevel`. Terms
 * scaling off HP/DEF/EM are OMITTED rather than added in as if they were ATK:
 * the legacy shape has no way to say "this scales off Max HP", and folding an
 * HP coefficient into an ATK field is the precise category error the audit
 * found. An ability with no ATK term therefore reports 0 — visibly nothing,
 * rather than invisibly wrong.
 */
function legacyAbility(
  ability: GenericCharacterDefinition["skill"] | undefined,
  actionType: LegacyActionType,
  talentLevel: number,
  fallbackElement: Element,
): CharacterDefinition["normalAttack"] {
  const instances = ability?.instances ?? [];
  const multiplier = instances.reduce(
    (total, instance) =>
      total +
      instance.scaling
        .filter((scale) => scale.stat === "atk")
        .reduce((sum, scale) => sum + talentValueAt(scale.table, talentLevel), 0),
    0,
  );

  return {
    id: ability?.id ?? `${actionType}-missing`,
    name: ability?.name ?? actionType,
    actionType,
    element: instances[0]?.element ?? fallbackElement,
    damageType: actionType,
    multiplier,
    scaling: "atk",
    castTime: ability?.castTime ?? 0,
    cooldown: 0,
    energyCost: 0,
    energyGenerated: 0,
  };
}
