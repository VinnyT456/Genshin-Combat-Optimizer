import type { CharacterDefinition } from "@/types";
import type { CharacterEquipmentSelection } from "@/features/team-builder/equipmentSelection";

export interface EnkaCharacterPreview {
  readonly key: string;
  readonly character?: CharacterDefinition;
  readonly portraitId: string;
  readonly constellation: number;
  readonly talents?: Readonly<{ normal: number; skill: number; burst: number }>;
  readonly weapon?: Readonly<{ id: string; level: number; refinement: number; name: string }>;
  /** Static equipment reconstructed from the API's equipped items. */
  readonly equipment?: CharacterEquipmentSelection;
  readonly artifactSummary: string;
  readonly issues: readonly string[];
  readonly selectable: boolean;
}

export interface EnkaImportPreview {
  readonly uid: string;
  readonly characters: readonly EnkaCharacterPreview[];
  readonly fetchedAt: string;
  readonly ttlSeconds: number;
  readonly expiresAt: string;
}

export interface EnkaImportResponse {
  readonly ok: true;
  readonly preview: EnkaImportPreview;
}

export interface EnkaImportError {
  readonly ok: false;
  readonly code: "invalid-uid" | "private" | "not-found" | "rate-limited" | "upstream" | "timeout" | "invalid-response";
  readonly message: string;
  readonly retryAfterSeconds?: number;
}

export type EnkaImportResult = EnkaImportResponse | EnkaImportError;

export interface EnkaCommit {
  readonly characters: readonly CharacterDefinition[];
  /** Every locally supported character returned by Enka, not just the team selection. */
  readonly availableCharacters: readonly CharacterDefinition[];
  readonly equipment: Readonly<Record<string, CharacterEquipmentSelection>>;
}

/** Enka currently documents nine-digit UIDs; keep the validator ready for the
 * ten-digit format without accepting leading zeroes or arbitrary text. */
export const ENKA_UID_PATTERN = /^[1-9][0-9]{8,9}$/;
export function isValidEnkaUid(uid: string): boolean {
  return ENKA_UID_PATTERN.test(uid.trim());
}
