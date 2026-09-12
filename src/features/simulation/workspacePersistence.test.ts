import { describe, expect, it } from "vitest";
import {
  copyReplayPackDraft,
  createReplayPack,
  loadProject,
  parseReplayPack,
  parseWorkspaceDraft,
  previewReplayPackImport,
  saveProject,
  serializeReplayPack,
  serializeWorkspaceDraft,
  type StorageLike,
} from "./workspacePersistence";

const draft = { team: [null], enemy: { id: "e", name: "敌人", level: 1, resistances: {} }, rotation: [], simConfig: { critMode: "never" as const }, searchBudget: "fast", searchObjective: "dps", searchDuration: 10 };
const pack = () => createReplayPack("p1", draft, { engine: "engine@1", data: "data@1", rules: "rules@1" }, { assumptions: ["deterministic"], limitations: ["single target"] });

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
}

describe("workspace draft persistence", () => {
  it("round trips a versioned draft", () => {
    expect(parseWorkspaceDraft(serializeWorkspaceDraft(draft))).toEqual(draft);
  });
  it("rejects malformed or unsupported snapshots", () => {
    expect(parseWorkspaceDraft("{}" )).toBeNull();
    expect(parseWorkspaceDraft(JSON.stringify({ version: 99 }))).toBeNull();
    expect(parseWorkspaceDraft(JSON.stringify({ version: 1, ...draft, searchDuration: Infinity }))).toBeNull();
    expect(parseWorkspaceDraft(JSON.stringify({ version: 1, ...draft, team: [{ id: "" }] }))).toBeNull();
  });
  it("round trips and integrity-checks a lossless ReplayPack", () => {
    const restored = parseReplayPack(serializeReplayPack(pack()));
    expect(restored?.draft).toEqual(draft);
    const tampered = JSON.parse(serializeReplayPack(pack())) as Record<string, unknown>;
    tampered.projectId = "other";
    expect(parseReplayPack(JSON.stringify(tampered))).toBeNull();
  });
  it("previews imports and requires an explicit defensive copy", () => {
    const preview = previewReplayPackImport(serializeReplayPack(pack()));
    expect(preview).not.toBeNull();
    const copied = copyReplayPackDraft(preview!);
    copied.enemy.name = "changed";
    expect(preview!.draft.enemy.name).toBe("敌人");
  });
  it("reports disabled, missing, invalid, and saved project states", () => {
    expect(loadProject(null, "p1").status.state).toBe("disabled");
    const storage = new MemoryStorage();
    expect(loadProject(storage, "p1").status.state).toBe("missing");
    storage.setItem("genshin-project-v1:p1", "not-json");
    expect(loadProject(storage, "p1").status.state).toBe("invalid");
    expect(saveProject(storage, "p1", pack()).state).toBe("saved");
    expect(loadProject(storage, "p1").status.state).toBe("loaded");
  });
});
