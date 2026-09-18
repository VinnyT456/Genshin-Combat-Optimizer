import type { AppView } from "@/features/simulation/urlState";
import Link from "next/link";
import { useLanguage } from "@/components/ui/LanguageProvider";
import styles from "./workspace.module.css";

export type WorkspaceTarget = "team" | "environment" | "search" | "results";

interface Props {
  activeView: AppView;
  hasResults: boolean;
  onNavigate: (target: WorkspaceTarget) => void;
}

const ITEMS: readonly { target: WorkspaceTarget; zh: string; en: string; hint: string }[] = [
  { target: "team", zh: "队伍与装备", en: "Team & gear", hint: "01" },
  { target: "environment", zh: "敌人与规则", en: "Enemy & rules", hint: "02" },
  { target: "search", zh: "优化搜索", en: "Optimize", hint: "03" },
  { target: "results", zh: "结果分析", en: "Results", hint: "04" },
];

export function WorkspaceNavigation({ activeView, hasResults, onNavigate }: Props) {
  const { locale } = useLanguage();
  const isEnglish = locale === "en";
  return (
    <nav className={styles.navigation} aria-label={isEnglish ? "Workspace navigation" : "工作区导航"}>
      <div className={styles.navigationLabel}>{isEnglish ? "Workspace navigation" : "工作区导航"}</div>
      <Link className={styles.navigationLink} href="/" aria-label={isEnglish ? "Back to home" : "返回首页"}>
        <span className={styles.navigationIndex}>00</span>
        <span>{isEnglish ? "Home" : "首页"}</span>
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
          <span>{isEnglish ? item.en : item.zh}</span>
        </button>
      ))}
      <p className={styles.navigationNote}>
        {hasResults ? (isEnglish ? "Results reflect the latest run" : "结果对应最近一次执行") : (isEnglish ? "Configure the run, then simulate" : "完成配置后执行一次模拟")}
      </p>
    </nav>
  );
}
