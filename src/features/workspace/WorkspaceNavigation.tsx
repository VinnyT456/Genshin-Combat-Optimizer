import type { AppView } from "@/features/simulation/urlState";
import Link from "next/link";
import styles from "./workspace.module.css";

export type WorkspaceTarget = "team" | "environment" | "search" | "results";

interface Props {
  activeView: AppView;
  hasResults: boolean;
  onNavigate: (target: WorkspaceTarget) => void;
}

const ITEMS: readonly { target: WorkspaceTarget; label: string; hint: string }[] = [
  { target: "team", label: "队伍与装备", hint: "01" },
  { target: "environment", label: "敌人与规则", hint: "02" },
  { target: "search", label: "优化搜索", hint: "03" },
  { target: "results", label: "结果分析", hint: "04" },
];

export function WorkspaceNavigation({ activeView, hasResults, onNavigate }: Props) {
  return (
    <nav className={styles.navigation} aria-label="工作区导航">
      <div className={styles.navigationLabel}>工作区导航</div>
      <Link className={styles.navigationLink} href="/" aria-label="返回首页">
        <span className={styles.navigationIndex}>00</span>
        <span>首页</span>
      </Link>
      {ITEMS.map((item) => (
        <button
          className={styles.navigationLink}
          key={item.target}
          type="button"
          onClick={() => onNavigate(item.target)}
          aria-current={item.target === "results" && activeView === "results" ? "page" : undefined}
        >
          <span className={styles.navigationIndex}>{item.hint}</span>
          <span>{item.label}</span>
        </button>
      ))}
      <p className={styles.navigationNote}>
        {hasResults ? "结果对应最近一次执行" : "完成配置后执行一次模拟"}
      </p>
    </nav>
  );
}
