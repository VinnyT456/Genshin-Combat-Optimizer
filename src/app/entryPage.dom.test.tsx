import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Page from "@/app/page";

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("UID-first entry page", () => {
  it("renders the entry heading hierarchy and both available channels", () => {
    render(<Page />);

    const headings = screen.getAllByRole("heading");
    expect(headings.map((heading) => heading.tagName)).toEqual(["H1", "H2", "H3", "H3", "H2", "H2", "H2"]);
    expect(screen.getByRole("heading", { level: 1, name: "把每一次出手，编译成可信循环。" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "选择进入方式" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "读取公开角色" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "自由实验" })).toBeInTheDocument();

    const channelNav = screen.getByRole("navigation", { name: "入口通道" });
    expect(within(channelNav).getByRole("link", { name: /01 UID 公开数据/ })).toBeVisible();
    expect(within(channelNav).getByRole("link", { name: /02 自由实验/ })).toBeVisible();

    const experimentLink = screen.getByRole("link", { name: "进入空白工作区" });
    expect(experimentLink).toBeVisible();
    expect(experimentLink).toHaveAttribute("href", "/workspace?mode=experiment");

    expect(screen.queryByRole("button", { name: "执行循环模拟" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "队伍阵容配置" })).toBeNull();
  });

  it("exposes the UID region and expected input attributes", () => {
    render(<Page />);

    const uidRegion = screen.getByRole("region", { name: "公开角色读取" });
    const uidInput = within(uidRegion).getByRole("textbox", { name: "公开 UID" });

    expect(uidInput).toHaveAttribute("id", "enka-uid");
    expect(uidInput).toHaveAttribute("name", "enka-uid");
    expect(uidInput).toHaveAttribute("type", "text");
    expect(uidInput).toHaveAttribute("inputmode", "numeric");
    expect(uidInput).toHaveAttribute("autocomplete", "off");
    expect(uidInput).toHaveAttribute("spellcheck", "false");
    expect(uidInput).toHaveAttribute("aria-describedby", "enka-help");
    expect(uidInput).toHaveAttribute("aria-invalid", "false");
    expect(uidInput).toHaveAttribute("placeholder", "例如 987654321…");
  });

  it("shows an accessible visible error when an empty UID is submitted", () => {
    render(<Page />);

    const uidRegion = screen.getByRole("region", { name: "公开角色读取" });
    const uidInput = within(uidRegion).getByRole("textbox", { name: "公开 UID" });
    fireEvent.submit(uidInput.closest("form")!);

    const error = screen.getByRole("alert");
    expect(error).toBeVisible();
    expect(error).toHaveTextContent("请输入 9–10 位公开 UID。");
    expect(uidInput).toHaveAttribute("aria-invalid", "true");
    expect(uidInput).toHaveAttribute("aria-describedby", "enka-help enka-invalid-error");
  });

  it("delays partial UID validation until the field is blurred or submitted", () => {
    render(<Page />);

    const uidInput = screen.getByRole("textbox", { name: "公开 UID" });
    fireEvent.change(uidInput, { target: { value: "12345678" } });

    expect(screen.queryByRole("alert")).toBeNull();
    expect(uidInput).toHaveAttribute("aria-invalid", "false");

    fireEvent.blur(uidInput);

    expect(screen.getByRole("alert")).toBeVisible();
    expect(uidInput).toHaveAttribute("aria-invalid", "true");
    expect(uidInput).toHaveAttribute("aria-describedby", "enka-help enka-invalid-error");
  });

  it("moves focus between the UID collapse and reopen controls", async () => {
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: "收起输入" }));

    const expandButton = screen.getByRole("button", { name: "展开 UID 输入" });
    await waitFor(() => expect(expandButton).toHaveFocus());

    fireEvent.click(expandButton);

    await waitFor(() => expect(screen.getByRole("textbox", { name: "公开 UID" })).toHaveFocus());
  });

  it("keeps experimentation visibly UID-free", () => {
    render(<Page />);

    expect(screen.getByText(/无需 UID 或账号/)).toBeInTheDocument();
    expect(screen.getByText(/从空队伍和空动作序列开始/)).toBeInTheDocument();
  });
});
