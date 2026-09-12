import { describe, expect, it } from "vitest";
import { createReplayPack, type StorageLike } from "@/features/simulation/workspacePersistence";
import { copyImportedProject, deleteProjectRecord, exportReplayPack, listProjects, previewProjectImport, saveProjectRecord } from "./projectsModel";

class Storage implements StorageLike {
  readonly data = new Map<string, string>();
  get length(): number { return this.data.size; }
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
  key(index: number): string | null { return [...this.data.keys()][index] ?? null; }
}
const pack = createReplayPack("p1", { team: [null], enemy: { id: "e", name: "敌人", level: 1, resistances: {} }, rotation: [], simConfig: {}, searchBudget: "fast", searchObjective: "dps", searchDuration: 10 }, { engine: "e1", data: "d1", rules: "r1" }, { assumptions: [], limitations: ["仅供验证"] });

describe("projects model", () => {
  it("saves and lists durable projects without replacing the draft", () => {
    const storage = new Storage();
    expect(saveProjectRecord(storage, pack, "我的项目", 1).state).toBe("saved");
    expect(listProjects(storage)).toEqual([{ projectId: "p1", title: "我的项目", updatedAt: 1 }]);
  });
  it("requires confirmation before delete", () => {
    const storage = new Storage(); saveProjectRecord(storage, pack, "我的项目", 1);
    expect(deleteProjectRecord(storage, "p1", false).state).toBe("confirmation-required");
    expect(deleteProjectRecord(storage, "p1", true).state).toBe("saved");
    expect(listProjects(storage)).toEqual([]);
  });
  it("previews and copies imports, preserving the source pack", () => {
    const preview = previewProjectImport(exportReplayPack(pack));
    expect(preview?.projectId).toBe("p1");
    expect(copyImportedProject(preview!).enemy.id).toBe("e");
  });
});
