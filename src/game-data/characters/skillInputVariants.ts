import type { GenericCharacterDefinition } from "@/simulation/character/character";
import type { DamageInstanceDefinition } from "@/simulation/character/kit";
import type { SkillInputVariant } from "@/types";

// These are only the variants whose generated damage rows have an unambiguous
// tap/hold label. Conditional charge levels, aim duration and field lifecycle
// stay out of this table until the engine can represent those choices without
// fabricating a result.
interface SkillVariantInstanceSpec {
  readonly tap: readonly string[];
  readonly hold: readonly string[];
  readonly holdPrefixes?: readonly string[];
}

const SKILL_VARIANT_INSTANCE_SPECS: Readonly<
  Record<string, SkillVariantInstanceSpec>
> = {
  alyosha: {
    tap: ["alyosha-skill-1"],
    hold: ["alyosha-skill-2"],
  },
  bennett: {
    tap: ["bennett-skill-1"],
    // The binary UI uses Bennett's highest sourced charge level. The two rows
    // are the charged attack plus its final explosion.
    hold: ["bennett-skill-3", "bennett-skill-4"],
  },
  candace: {
    tap: ["candace-skill-1"],
    hold: ["candace-skill-2"],
  },
  charlotte: {
    tap: ["charlotte-skill-1", "charlotte-skill-2"],
    hold: ["charlotte-skill-3", "charlotte-skill-4"],
  },
  chevreuse: {
    tap: ["chevreuse-skill-1"],
    // The conditional Overcharged Ball has its own state requirement and is
    // intentionally not folded into the ordinary Hold variant.
    hold: ["chevreuse-skill-2"],
    holdPrefixes: ["chevreuse-c2-explosion-"],
  },
  eula: {
    tap: ["eula-skill-1"],
    hold: ["eula-skill-2"],
  },
  illuga: {
    tap: ["illuga-skill-1"],
    hold: ["illuga-skill-2"],
  },
  "kaedehara-kazuha": {
    tap: ["kaedehara-kazuha-skill-1"],
    hold: ["kaedehara-kazuha-skill-2"],
  },
  lauma: {
    tap: ["lauma-skill-1"],
    hold: ["lauma-skill-2", "lauma-skill-3"],
  },
  lisa: {
    tap: ["lisa-skill-1"],
    // Conductive-stack Hold rows need a separate stack selector. Use the
    // directly sourced non-conductive Hold row for this binary input.
    hold: ["lisa-skill-2"],
  },
  nahida: {
    tap: ["nahida-skill-1"],
    hold: ["nahida-skill-2"],
  },
  razor: {
    tap: ["razor-skill-1"],
    hold: ["razor-skill-2"],
  },
  sayu: {
    tap: ["sayu-skill-4"],
    // Hold rolls before ending with the stronger kick. The generated rows
    // expose both roll hits and the hold-only kick, so keep them together.
    hold: ["sayu-skill-1", "sayu-skill-2", "sayu-skill-3", "sayu-skill-5"],
  },
  shenhe: {
    tap: ["shenhe-skill-1"],
    hold: ["shenhe-skill-2"],
  },
  venti: {
    tap: ["venti-skill-1"],
    hold: ["venti-skill-2"],
  },
  "yun-jin": {
    tap: ["yun-jin-skill-1"],
    // Use the highest sourced charge level for the binary hold control.
    hold: ["yun-jin-skill-3"],
  },
  zhongli: {
    tap: ["zhongli-skill-1"],
    hold: ["zhongli-skill-3"],
  },
};

function instanceMatches(
  instance: DamageInstanceDefinition,
  ids: readonly string[],
  prefixes: readonly string[] = [],
): boolean {
  return ids.includes(instance.id) || prefixes.some((prefix) => instance.id.startsWith(prefix));
}

function variantAbility(
  definition: GenericCharacterDefinition,
  variant: SkillInputVariant,
  ids: readonly string[],
  prefixes?: readonly string[],
): GenericCharacterDefinition["skill"] | undefined {
  const instances = definition.skill.instances.filter((instance) =>
    instanceMatches(instance, ids, prefixes),
  );
  if (instances.length === 0) return undefined;
  return {
    ...definition.skill,
    name: `${definition.skill.name} (${variant === "tap" ? "Tap" : "Hold"})`,
    instances,
  };
}

/** Adds explicit tap/hold Skill alternatives to a generic character. */
export function withSkillInputVariants(
  definition: GenericCharacterDefinition,
): GenericCharacterDefinition {
  const spec = SKILL_VARIANT_INSTANCE_SPECS[definition.id];
  if (spec === undefined) return definition;

  const tap = variantAbility(definition, "tap", spec.tap);
  const hold = variantAbility(definition, "hold", spec.hold, spec.holdPrefixes);
  // A malformed or stale row map must not publish a one-sided variant pair.
  if (tap === undefined || hold === undefined) return definition;

  return {
    ...definition,
    // Default unqualified `skill` actions to Tap so older rotations do not
    // accidentally execute every generated Tap/Hold row at once.
    skill: tap,
    skillVariants: { tap, hold },
  };
}

export const skillInputVariantCharacters = Object.freeze(
  Object.keys(SKILL_VARIANT_INSTANCE_SPECS),
);
