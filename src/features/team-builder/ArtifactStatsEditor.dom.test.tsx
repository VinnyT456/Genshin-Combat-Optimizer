import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ArtifactLoadout } from "@/simulation/character/equipment";
import { ArtifactStatsEditor } from "./ArtifactStatsEditor";

const initialLoadout: ArtifactLoadout = {
  goblet: {
    slot: "goblet",
    setId: "test-set",
    mainStat: { stat: "atkFlat", value: 0 },
    substats: [],
  },
};

const rolledCritDamageLoadout: ArtifactLoadout = {
  goblet: {
    slot: "goblet",
    setId: "test-set",
    mainStat: { stat: "atkFlat", value: 0 },
    substats: [{ stat: "critDmg", value: 0.078 }],
  },
};

function EditorHarness() {
  const [value, setValue] = useState(initialLoadout);
  return (
    <ArtifactStatsEditor
      slots={["goblet"]}
      slotSetIds={{ goblet: "test-set" }}
      value={value}
      onChange={setValue}
    />
  );
}

function RollEditorHarness() {
  const [value, setValue] = useState(rolledCritDamageLoadout);
  return (
    <ArtifactStatsEditor
      slots={["goblet"]}
      slotSetIds={{ goblet: "test-set" }}
      value={value}
      onChange={setValue}
    />
  );
}

describe("ArtifactStatsEditor elemental damage labels", () => {
  it("offers element-specific damage options and preserves the selected element", () => {
    render(<EditorHarness />);

    const typeSelect = screen.getByLabelText("主词条类型");
    const optionLabels = Array.from(typeSelect.querySelectorAll("option")).map(
      (option) => option.textContent,
    );
    for (const element of ["风", "岩", "雷", "草", "水", "火", "冰"]) {
      expect(optionLabels).toContain(`${element}元素伤害`);
    }

    fireEvent.change(typeSelect, {
      target: { value: "elementalDmgBonus:anemo" },
    });

    expect(typeSelect).toHaveValue("elementalDmgBonus:anemo");
    expect(screen.getByLabelText("主词条数值")).toBeInTheDocument();
  });

  it("rounds displayed values without exposing a manual enhancement control", () => {
    render(<RollEditorHarness />);

    expect(screen.getByLabelText("副词条 1数值")).toHaveValue(7.8);
    expect(screen.queryByLabelText("副词条 1强化档位")).not.toBeInTheDocument();
  });
});
