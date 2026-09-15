import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import WorkspacePage from "@/features/workspace/WorkspacePage";
import { characters, testEnemy } from "@/game-data";
import { equipmentStorageKey, serializeSelections } from "@/features/team-builder/equipmentSelection";
import {
  saveWorkspaceImportContext,
  serializeWorkspaceDraft,
  workspaceDraftKey,
} from "@/features/simulation/workspacePersistence";

const bennett = characters.find((character) => character.id === "bennett")!;
const raiden = characters.find((character) => character.id === "raiden-shogun")!;
const importedEquipment = { bennett: { weaponId: "favonius-sword", refinement: 3 as const, weaponLevel: 80 } };
const oldDraft = {
  team: [raiden, null, null, null], enemy: testEnemy, rotation: [], simConfig: {},
  searchBudget: "balanced", searchObjective: "total-damage", searchDuration: 20,
};

function importBennett() {
  saveWorkspaceImportContext(window.sessionStorage, "uid", {
    uid: "987654321", characters: [bennett], availableCharacters: [bennett], equipment: importedEquipment,
  });
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/workspace?mode=uid");
});

describe("UID entry handoff", () => {
  it("uses a fresh import instead of the previous UID's team and equipment", async () => {
    window.sessionStorage.setItem(workspaceDraftKey("uid"), serializeWorkspaceDraft(oldDraft));
    window.sessionStorage.setItem(equipmentStorageKey("uid"), serializeSelections({ bennett: { weaponId: "sacrificial-sword", refinement: 5 } }));
    importBennett();
    render(<WorkspacePage />);

    await screen.findByRole("button", { name: "执行循环模拟" });
    expect(screen.getByLabelText(/^1 号位：/)).toHaveAccessibleName(/班尼特/);
    expect(screen.queryByLabelText(/^1 号位：.*雷电/)).toBeNull();
    await waitFor(() => {
      const saved = JSON.parse(window.sessionStorage.getItem(equipmentStorageKey("uid"))!);
      expect(saved.byCharacter.bennett).toMatchObject(importedEquipment.bennett);
      expect(JSON.stringify(saved)).not.toContain("sacrificial-sword");
    });
  });

  it("filters old saved characters through the current public roster", async () => {
    importBennett();
    window.sessionStorage.setItem(workspaceDraftKey("uid"), serializeWorkspaceDraft(oldDraft));
    render(<WorkspacePage />);

    await screen.findByRole("button", { name: "执行循环模拟" });
    expect(screen.getByRole("button", { name: "添加角色至 1 号位" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "执行循环模拟" })).toBeDisabled();
  });
});
