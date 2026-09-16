import type { CharacterDefinition, EnemyState, Rotation, SimulationConfig } from "@/types";
import { equipmentStorageKey, type CharacterEquipmentSelection } from "@/features/team-builder/equipmentSelection";
import { canonicalizeSerializable, fingerprintSerializable } from "@/features/optimizer/searchTransport";

export const WORKSPACE_SCHEMA_VERSION = 1;
const KEY = "genshin-workspace-draft-v1";
const CONTEXT_PREFIX = "genshin-workspace-context-v1";
const REPLAY_KIND = "genshin-replay-pack";

export interface WorkspaceDraftSnapshot {
  readonly team: readonly (CharacterDefinition | null)[];
  readonly enemy: EnemyState;
  readonly rotation: Rotation;
  readonly simConfig: Partial<SimulationConfig>;
  readonly searchBudget: string;
  readonly searchObjective: string;
  readonly searchDuration: number;
}
export interface ProjectIdentity { readonly engine: string; readonly data: string; readonly rules: string; }
export interface ReplayPackAssumptions { readonly assumptions: readonly string[]; readonly limitations: readonly string[]; }
export interface ReplayPack {
  readonly kind: typeof REPLAY_KIND;
  readonly version: typeof WORKSPACE_SCHEMA_VERSION;
  readonly projectId: string;
  readonly identities: ProjectIdentity;
  readonly dataReleaseId: string;
  readonly engineVersion: string;
  readonly rulesetVersion: string;
  readonly assumptions: ReplayPackAssumptions;
  readonly inputFingerprint: string;
  readonly canonicalInputHash: string;
  readonly requiredDataSubsetHash: string;
  readonly payloadHash: string;
  readonly draft: WorkspaceDraftSnapshot;
}
export interface ReplayPackImportPreview {
  readonly projectId: string;
  readonly inputFingerprint: string;
  readonly identities: ProjectIdentity;
  readonly assumptions: ReplayPackAssumptions;
  readonly draft: WorkspaceDraftSnapshot;
  readonly copy: () => WorkspaceDraftSnapshot;
}
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}
export type ProjectStorageStatus =
  | { readonly state: "saved" | "loaded" | "missing"; readonly projectId: string }
  | { readonly state: "invalid" | "disabled" | "quota"; readonly projectId: string; readonly reason: string; readonly evictedProjectId?: string };

export type WorkspaceStorageMode = "uid" | "experiment";
export interface WorkspaceImportContext {
  readonly uid: string;
  /** The selected four characters that should seed the first UID workspace. */
  readonly characters: readonly CharacterDefinition[];
  readonly availableCharacters: readonly CharacterDefinition[];
  readonly equipment: Readonly<Record<string, CharacterEquipmentSelection>>;
}
export function workspaceDraftKey(mode: WorkspaceStorageMode = "experiment"): string {
  return `${KEY}:${mode}`;
}
export function workspaceContextKey(mode: WorkspaceStorageMode): string {
  return `${CONTEXT_PREFIX}:${mode}`;
}
export function clearWorkspaceStorage(storage: StorageLike | null, mode: WorkspaceStorageMode): void {
  if (storage === null) return;
  try {
    storage.removeItem(workspaceDraftKey(mode));
    storage.removeItem(workspaceContextKey(mode));
    storage.removeItem(`genshin-team-equipment-v2:${mode}`);
  } catch { /* session storage can be disabled; clearing is best effort */ }
}
export function saveWorkspaceImportContext(storage: StorageLike | null, mode: WorkspaceStorageMode, context: WorkspaceImportContext): void {
  if (storage === null) return;
  storage.setItem(workspaceContextKey(mode), JSON.stringify(context));
  // An explicit import replaces this mode's configuration. Never let an older
  // UID draft or loadout override the newly selected public characters.
  storage.removeItem(workspaceDraftKey(mode));
  storage.removeItem(equipmentStorageKey(mode));
}
export function loadWorkspaceImportContext(storage: StorageLike | null, mode: WorkspaceStorageMode): WorkspaceImportContext | null {
  if (storage === null) return null;
  try {
    const value = JSON.parse(storage.getItem(workspaceContextKey(mode)) ?? "null") as unknown;
    if (!isRecord(value) || typeof value.uid !== "string" || !Array.isArray(value.characters) || !Array.isArray(value.availableCharacters) || !isRecord(value.equipment)) return null;
    if (value.characters.length > 4 || value.characters.some((character) => !isRecord(character) || !nonEmptyId(character.id))) return null;
    if (value.availableCharacters.some((character) => !isRecord(character) || !nonEmptyId(character.id))) return null;
    return value as unknown as WorkspaceImportContext;
  } catch { return null; }
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function nonEmptyId(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= 256; }
/**
 * Validates that every value the persisted format can express is representable.
 *
 * `undefined` is treated exactly as `JSON.stringify` treats it — as absence.
 * An optional field that is explicitly present with the value `undefined`
 * serializes to the same bytes as a missing key, so rejecting one while
 * accepting the other would enforce a distinction the storage format cannot
 * represent. Non-finite numbers (`NaN`, `±Infinity`) and cyclic structures are
 * still rejected: the former round-trip to `null`, the latter make
 * `JSON.stringify` throw.
 *
 * In an array, `undefined` stringifies to `null` rather than vanishing, which
 * is a lossy but representable round-trip, so it is accepted there too.
 */
function finiteTree(value: unknown, active = new Set<object>()): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (value === undefined || value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value !== "object" || active.has(value)) return false;
  active.add(value);
  try {
    return Array.isArray(value)
      ? value.every((item) => finiteTree(item, active))
      : Object.values(value).every((item) => finiteTree(item, active));
  } finally {
    active.delete(value);
  }
}
function validDraft(value: unknown): value is WorkspaceDraftSnapshot {
  if (!isRecord(value) || !Array.isArray(value.team) || !isRecord(value.enemy) || !Array.isArray(value.rotation) || !isRecord(value.simConfig) ||
      typeof value.searchBudget !== "string" || typeof value.searchObjective !== "string" || typeof value.searchDuration !== "number" ||
      !Number.isFinite(value.searchDuration) || value.searchDuration < 0 || !finiteTree(value)) return false;
  const enemy = value.enemy;
  if (!nonEmptyId(enemy.id) || typeof enemy.name !== "string" || typeof enemy.level !== "number" || !Number.isFinite(enemy.level) || enemy.level < 1 || !isRecord(enemy.resistances)) return false;
  if (value.team.some((character) => character !== null && (!isRecord(character) || !nonEmptyId(character.id)))) return false;
  return value.rotation.every((action) => isRecord(action) && nonEmptyId(action.characterId) && nonEmptyId(action.actionType) &&
    (action.abilityId === undefined || nonEmptyId(action.abilityId)) && (action.normalIndex === undefined || (typeof action.normalIndex === "number" && Number.isInteger(action.normalIndex) && action.normalIndex >= 0)));
}
function clone<T>(value: T): T { return JSON.parse(canonicalizeSerializable(value)) as T; }

function portableDraft(snapshot: WorkspaceDraftSnapshot): WorkspaceDraftSnapshot {
  const team = snapshot.team.map((character) => {
    if (character === null) return null;
    const build = { ...character } as CharacterDefinition & { engineDefinition?: unknown };
    delete build.engineDefinition;
    return build;
  });
  return { ...snapshot, team };
}

export function serializeWorkspaceDraft(snapshot: WorkspaceDraftSnapshot): string {
  const draft = portableDraft(snapshot);
  if (!validDraft(draft)) throw new TypeError("Workspace draft contains invalid IDs or values");
  return JSON.stringify({ version: WORKSPACE_SCHEMA_VERSION, ...draft });
}
/**
 * Autosave-safe serializer: returns `null` for any snapshot that cannot be
 * persisted, instead of throwing.
 *
 * The autosave effect runs on every state change, so a serialization failure
 * there must degrade to "this draft was not saved" — a throw inside a
 * `useEffect` escapes as an uncaught error and React unmounts the whole tree,
 * turning a lost autosave into a blank page. The throwing
 * `serializeWorkspaceDraft` remains for the replay-pack export path, where the
 * user explicitly asked for a file and silence would be worse than an error.
 */
export function trySerializeWorkspaceDraft(snapshot: WorkspaceDraftSnapshot): string | null {
  try {
    return serializeWorkspaceDraft(snapshot);
  } catch {
    return null;
  }
}

/** Migrate the explicitly tagged v0 shape; untagged data is rejected. */
export function migrateWorkspaceDraft(raw: unknown): WorkspaceDraftSnapshot | null {
  if (!isRecord(raw) || (raw.version !== 0 && raw.version !== WORKSPACE_SCHEMA_VERSION)) return null;
  const draft = { ...raw };
  delete draft.version;
  return validDraft(draft) ? clone(draft) : null;
}
export function parseWorkspaceDraft(raw: string): WorkspaceDraftSnapshot | null { try { return migrateWorkspaceDraft(JSON.parse(raw)); } catch { return null; } }

function validIdentities(value: unknown): value is ProjectIdentity { return isRecord(value) && nonEmptyId(value.engine) && nonEmptyId(value.data) && nonEmptyId(value.rules); }
function validAssumptions(value: unknown): value is ReplayPackAssumptions {
  return isRecord(value) && Array.isArray(value.assumptions) && Array.isArray(value.limitations) && value.assumptions.every((x) => typeof x === "string") && value.limitations.every((x) => typeof x === "string");
}
function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}
export function createReplayPack(projectId: string, draft: WorkspaceDraftSnapshot, identities: ProjectIdentity, assumptions: ReplayPackAssumptions): ReplayPack {
  const draftWithoutRuntimeDefinitions = portableDraft(draft);
  if (!nonEmptyId(projectId) || !validDraft(draftWithoutRuntimeDefinitions) || !validIdentities(identities) || !validAssumptions(assumptions)) throw new TypeError("ReplayPack contains invalid metadata or draft");
  const portable = clone(draftWithoutRuntimeDefinitions);
  const inputFingerprint = fingerprintSerializable(portable);
  return { kind: REPLAY_KIND, version: WORKSPACE_SCHEMA_VERSION, projectId, identities: clone(identities), dataReleaseId: identities.data, engineVersion: identities.engine, rulesetVersion: identities.rules, assumptions: clone(assumptions), inputFingerprint, canonicalInputHash: inputFingerprint, requiredDataSubsetHash: fingerprintSerializable(identities.data), payloadHash: fingerprintSerializable({ projectId, identities, assumptions, draft: portable }), draft: portable };
}
export function serializeReplayPack(pack: ReplayPack): string { if (parseReplayPack(JSON.stringify(pack)) === null) throw new TypeError("Invalid ReplayPack"); return JSON.stringify(pack); }
export function parseReplayPack(raw: string): ReplayPack | null {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!isRecord(value) || !hasOnlyKeys(value, ["kind", "version", "projectId", "identities", "dataReleaseId", "engineVersion", "rulesetVersion", "assumptions", "inputFingerprint", "canonicalInputHash", "requiredDataSubsetHash", "payloadHash", "draft"]) || value.kind !== REPLAY_KIND || value.version !== WORKSPACE_SCHEMA_VERSION || !nonEmptyId(value.projectId) || !validIdentities(value.identities) || value.dataReleaseId !== value.identities.data || value.engineVersion !== value.identities.engine || value.rulesetVersion !== value.identities.rules || !validAssumptions(value.assumptions) || typeof value.inputFingerprint !== "string" || value.canonicalInputHash !== value.inputFingerprint || typeof value.requiredDataSubsetHash !== "string" || value.requiredDataSubsetHash !== fingerprintSerializable(value.identities.data) || typeof value.payloadHash !== "string" || !validDraft(value.draft)) return null;
    if (value.inputFingerprint !== fingerprintSerializable(value.draft) || value.payloadHash !== fingerprintSerializable({ projectId: value.projectId, identities: value.identities, assumptions: value.assumptions, draft: value.draft })) return null;
    return clone(value) as unknown as ReplayPack;
  } catch { return null; }
}
export function previewReplayPackImport(raw: string): ReplayPackImportPreview | null {
  const pack = parseReplayPack(raw); if (pack === null) return null;
  const draft = clone(pack.draft);
  return { projectId: pack.projectId, inputFingerprint: pack.inputFingerprint, identities: clone(pack.identities), assumptions: clone(pack.assumptions), draft, copy: () => clone(draft) };
}
export function copyReplayPackDraft(preview: ReplayPackImportPreview): WorkspaceDraftSnapshot { return clone(preview.copy()); }

function storageKey(projectId: string): string { return `genshin-project-v1:${encodeURIComponent(projectId)}`; }
export function saveProject(storage: StorageLike | null, projectId: string, pack: ReplayPack): ProjectStorageStatus {
  if (projectId !== pack.projectId) return { state: "invalid", projectId, reason: "project-id-mismatch" };
  if (storage === null) return { state: "disabled", projectId, reason: "storage-unavailable" };
  try { storage.setItem(storageKey(projectId), serializeReplayPack(pack)); return { state: "saved", projectId }; }
  catch (error) {
    if (error instanceof Error && /security|disabled|denied|unavailable/i.test(`${error.name} ${error.message}`)) {
      return { state: "disabled", projectId, reason: error.message };
    }
    const evicted = evictOldestProject(storage, projectId);
    try { storage.setItem(storageKey(projectId), serializeReplayPack(pack)); return { state: "quota", projectId, evictedProjectId: evicted ?? undefined, reason: error instanceof Error ? error.message : "quota-exceeded" }; }
    catch (retryError) { return { state: "quota", projectId, evictedProjectId: evicted ?? undefined, reason: retryError instanceof Error ? retryError.message : "quota-exceeded" }; }
  }
}
export function loadProject(storage: StorageLike | null, projectId: string): { readonly status: ProjectStorageStatus; readonly pack: ReplayPack | null } {
  if (storage === null) return { status: { state: "disabled", projectId, reason: "storage-unavailable" }, pack: null };
  try { const raw = storage.getItem(storageKey(projectId)); if (raw === null) return { status: { state: "missing", projectId }, pack: null }; const pack = parseReplayPack(raw); return pack === null ? { status: { state: "invalid", projectId, reason: "schema-or-integrity" }, pack: null } : { status: { state: "loaded", projectId }, pack }; }
  catch (error) { return { status: { state: "disabled", projectId, reason: error instanceof Error ? error.message : "storage-unavailable" }, pack: null }; }
}
function evictOldestProject(storage: StorageLike, protectedProjectId: string): string | null {
  for (let i = 0; i < storage.length; i += 1) { const key = storage.key(i); if (key?.startsWith("genshin-project-v1:") && key !== storageKey(protectedProjectId)) { const id = decodeURIComponent(key.slice("genshin-project-v1:".length)); try { storage.removeItem(key); return id; } catch { return null; } } }
  return null;
}
