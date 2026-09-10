import type { CharacterDefinition, EnemyState, Rotation, SimulationConfig } from "@/types";

const VERSION = 1;
const KEY = "genshin-workspace-draft-v1";
export interface WorkspaceDraftSnapshot { readonly team: readonly (CharacterDefinition | null)[]; readonly enemy: EnemyState; readonly rotation: Rotation; readonly simConfig: Partial<SimulationConfig>; readonly searchBudget: string; readonly searchObjective: string; readonly searchDuration: number; }
export function workspaceDraftKey(): string { return KEY; }
export function serializeWorkspaceDraft(snapshot: WorkspaceDraftSnapshot): string {
  const team = snapshot.team.map((character) => {
    if (character === null) return null;
    // The roster is the canonical source for executable generic definitions;
    // persist the editable legacy/build fields without replacing its methods.
    const build = { ...character } as CharacterDefinition & { engineDefinition?: unknown };
    delete build.engineDefinition;
    return build;
  });
  return JSON.stringify({ version: VERSION, ...snapshot, team });
}
export function parseWorkspaceDraft(raw: string): WorkspaceDraftSnapshot | null {
  try { const value = JSON.parse(raw) as Partial<WorkspaceDraftSnapshot> & { version?: number }; if (value.version !== VERSION || !Array.isArray(value.team) || !value.enemy || !Array.isArray(value.rotation) || !value.simConfig || typeof value.searchDuration !== "number" || !Number.isFinite(value.searchDuration) || typeof value.searchBudget !== "string" || typeof value.searchObjective !== "string") return null; delete value.version; return value as WorkspaceDraftSnapshot; } catch { return null; }
}
