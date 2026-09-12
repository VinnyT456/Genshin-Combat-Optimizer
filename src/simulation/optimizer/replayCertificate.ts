import type { CharacterDefinition, EnemyState, Rotation } from "@/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

export function replayFingerprint(value: unknown): string {
  let hash = 2166136261;
  const text = stable(value);
  for (let i = 0; i < text.length; i += 1) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createReplayInputFingerprint(
  team: readonly (CharacterDefinition | GenericCharacterDefinition)[],
  enemy: EnemyState,
  config: unknown,
): string {
  return replayFingerprint({ team, enemy, config });
}

export function rotationFingerprint(rotation: Rotation, score: number, totalDamage: number): string {
  return replayFingerprint({ rotation, score, totalDamage });
}
