import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Page from "@/features/workspace/WorkspacePage";
import { mapEnkaPayload } from "@/features/enka-import/mapper";
import { normalizeEnkaPayload } from "@/features/enka-import/normalize";

const avatar = (avatarId: number, level: number, equipList: readonly unknown[] = []) => ({
  avatarId,
  propMap: { "4001": { val: String(level) } },
  skillLevelMap: { "10001": 8, "10002": 9, "10003": 10 },
  talentIdList: [],
  equipList,
});

describe("Enka character-pool restriction", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/workspace?mode=experiment");
    window.sessionStorage.clear();
    window.localStorage.clear();
    const preview = mapEnkaPayload(normalizeEnkaPayload({
      avatarInfoList: [
        avatar(10000032, 90, [{
          flat: {
            setId: 15001,
            equipType: "EQUIP_BRACER",
            reliquaryMainstat: { mainPropId: "FIGHT_PROP_HP", statValue: 4780 },
            reliquarySubstats: [{ appendPropId: "FIGHT_PROP_CRITICAL", statValue: 6.2 }],
          },
          reliquary: { level: 21 },
        }]),
        avatar(10000025, 80),
      ],
      ttl: 31,
    }), "987654321", "2026-01-01T00:00:00.000Z", 31);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, preview }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("limits the picker to imported characters while leaving equipment controls available", async () => {
    render(<Page />);
    await screen.findByRole("button", { name: "执行循环模拟" });

    fireEvent.click(screen.getByRole("button", { name: "从 UID 导入" }));
    expect(screen.getByRole("region", { name: "从公开 UID 同步你的角色" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.change(screen.getByLabelText("公开 UID"), { target: { value: "987654321" } });
    fireEvent.click(screen.getByRole("button", { name: "读取角色" }));

    await screen.findByText("已读取 2 个角色，可导入 2 个");
    fireEvent.click(screen.getByRole("button", { name: "导入已选角色（2）" }));

    expect(screen.getByLabelText(/^1 号位：/)).toHaveAccessibleName(/班尼特/);
    expect(screen.getByLabelText(/^2 号位：/)).toHaveAccessibleName(/行秋/);
    expect(screen.getByRole("button", { name: /编辑班尼特的武器配置/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /编辑班尼特的圣遗物配置/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "添加角色至 3 号位" }));
    await waitFor(() => expect(screen.getByRole("dialog", { name: "选择出战角色 — 席位 3" })).toBeInTheDocument());

    expect(screen.getByText(/已匹配 2 \/ 2 位角色/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /迪卢克/ })).toBeNull();
  });
});
