import type { SimulationRun } from "@/features/simulation/runState";

export interface RunHistoryMetadata {
  readonly id: string;
  readonly createdAt: number;
  /** Until durable storage exists this must remain visible to the user. */
  readonly scope: "session";
  readonly label: string;
}

export interface HistoryEntry {
  readonly metadata: RunHistoryMetadata;
  readonly run: SimulationRun;
}

function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Creates a defensive, immutable history snapshot. No persistence is implied. */
export function createHistoryEntry(
  run: SimulationRun,
  metadata: Pick<RunHistoryMetadata, "id" | "createdAt"> & Partial<Pick<RunHistoryMetadata, "label">>,
): HistoryEntry {
  const snapshot = structuredClone(run) as SimulationRun;
  return freeze({
    metadata: {
      id: metadata.id,
      createdAt: metadata.createdAt,
      scope: "session",
      label: metadata.label ?? "本次模拟",
    },
    run: snapshot,
  });
}

export function addHistoryEntry(history: readonly HistoryEntry[], entry: HistoryEntry): readonly HistoryEntry[] {
  return [...history, entry];
}

export function sessionHistoryLabel(entry: HistoryEntry): string {
  return `${entry.metadata.label}（仅本次会话）`;
}
