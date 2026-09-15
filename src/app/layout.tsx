import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SkipLink } from "@/components/ui/SkipLink";
import { MAIN_CONTENT_ID } from "@/components/ui/landmarks";

export const metadata: Metadata = {
  title: "原神战斗输出循环模拟器 | Genshin Rotation Optimizer",
  description: "全角色单目标确定性战斗模拟、输出循环轴编排与理论伤害计算工具",
};

export const viewport: Viewport = { themeColor: "#080c10" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <SkipLink targetId={MAIN_CONTENT_ID} />
        {children}
      </body>
    </html>
  );
}
