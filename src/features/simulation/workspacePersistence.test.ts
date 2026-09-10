import { describe, expect, it } from "vitest";
import { parseWorkspaceDraft, serializeWorkspaceDraft } from "./workspacePersistence";

describe("workspace draft persistence", () => {
  it("round trips a versioned draft", () => {
    const draft = { team: [null], enemy: { id: "e", name: "敌人", level: 1, resistances: {} }, rotation: [], simConfig: { critMode: "never" as const }, searchBudget: "fast", searchObjective: "dps", searchDuration: 10 };
    expect(parseWorkspaceDraft(serializeWorkspaceDraft(draft))).toEqual(draft);
  });
  it("rejects malformed or unsupported snapshots", () => {
    expect(parseWorkspaceDraft("{}" )).toBeNull();
    expect(parseWorkspaceDraft(JSON.stringify({ version: 99 }))).toBeNull();
  });
});
