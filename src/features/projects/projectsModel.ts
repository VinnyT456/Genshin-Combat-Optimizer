import {
  copyReplayPackDraft,
  loadProject,
  parseReplayPack,
  previewReplayPackImport,
  saveProject,
  serializeReplayPack,
  type ProjectStorageStatus,
  type ReplayPack,
  type ReplayPackImportPreview,
  type StorageLike,
  type WorkspaceDraftSnapshot,
} from "@/features/simulation/workspacePersistence";

export const PROJECT_INDEX_KEY = "genshin-project-index-v1";
export interface ProjectListEntry { readonly projectId: string; readonly title: string; readonly updatedAt: number; }
export type ProjectAction = ProjectStorageStatus | { readonly state: "confirmation-required"; readonly projectId: string };

const keyFor = (id: string) => `genshin-project-v1:${encodeURIComponent(id)}`;
const validId = (id: string) => id.trim().length > 0 && id.length <= 256;

export function listProjects(storage: StorageLike | null): readonly ProjectListEntry[] {
  if (storage === null) return [];
  try {
    const raw = storage.getItem(PROJECT_INDEX_KEY);
    if (raw === null) return [];
    const entries = JSON.parse(raw) as unknown;
    if (!Array.isArray(entries)) return [];
    return entries.filter((entry): entry is ProjectListEntry => typeof entry === "object" && entry !== null &&
      validId((entry as ProjectListEntry).projectId) && typeof (entry as ProjectListEntry).title === "string" && typeof (entry as ProjectListEntry).updatedAt === "number" && Number.isFinite((entry as ProjectListEntry).updatedAt));
  } catch { return []; }
}

function writeIndex(storage: StorageLike, entries: readonly ProjectListEntry[]): void { storage.setItem(PROJECT_INDEX_KEY, JSON.stringify(entries)); }

export function saveProjectRecord(storage: StorageLike | null, pack: ReplayPack, title: string, updatedAt = Date.now()): ProjectAction {
  if (!validId(title) || !Number.isFinite(updatedAt)) return { state: "invalid", projectId: pack.projectId, reason: "invalid-project-metadata" };
  const status = saveProject(storage, pack.projectId, pack);
  if (status.state !== "saved" && status.state !== "quota") return status;
  if (storage !== null) {
    try { writeIndex(storage, [...listProjects(storage).filter((entry) => entry.projectId !== pack.projectId), { projectId: pack.projectId, title, updatedAt }]); }
    catch (error) { return { state: "disabled", projectId: pack.projectId, reason: error instanceof Error ? error.message : "index-write-failed" }; }
  }
  return status;
}

export function loadProjectRecord(storage: StorageLike | null, projectId: string): { readonly status: ProjectStorageStatus; readonly pack: ReplayPack | null } { return loadProject(storage, projectId); }

export function deleteProjectRecord(storage: StorageLike | null, projectId: string, confirmed: boolean): ProjectAction {
  if (!confirmed) return { state: "confirmation-required", projectId };
  if (storage === null) return { state: "disabled", projectId, reason: "storage-unavailable" };
  try {
    storage.removeItem(keyFor(projectId));
    writeIndex(storage, listProjects(storage).filter((entry) => entry.projectId !== projectId));
    return { state: "saved", projectId };
  } catch (error) { return { state: "disabled", projectId, reason: error instanceof Error ? error.message : "delete-failed" }; }
}

export function exportReplayPack(pack: ReplayPack): string { return serializeReplayPack(pack); }
export function previewProjectImport(raw: string): ReplayPackImportPreview | null { return previewReplayPackImport(raw); }
export function copyImportedProject(preview: ReplayPackImportPreview): WorkspaceDraftSnapshot { return copyReplayPackDraft(preview); }
export function replayPackFromText(raw: string): ReplayPack | null { return parseReplayPack(raw); }
