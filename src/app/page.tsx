"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { cn } from "@/components/ui/cn";
import { FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";
import { OrbitalField } from "@/components/ui/OrbitalField";
import { EnkaImportDialog } from "@/features/enka-import/EnkaImportDialog";
import type { EnkaCommit } from "@/features/enka-import/contracts";
import { saveWorkspaceImportContext } from "@/features/simulation/workspacePersistence";
import styles from "./home.module.css";

export default function Home() {
  const { locale } = useLanguage();
  const isEnglish = locale === "en";
  const [enkaOpen, setEnkaOpen] = useState(true);
  const [focusUidOnOpen, setFocusUidOnOpen] = useState(false);

  useEffect(() => {
    if (!enkaOpen) document.getElementById("uid-expand-trigger")?.focus();
  }, [enkaOpen]);

  function commitUid(commit: EnkaCommit) {
    saveWorkspaceImportContext(window.sessionStorage, "uid", commit);
    window.history.pushState(null, "", "/workspace?mode=uid");
    window.location.reload();
  }

  return (
    <main id="main" className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={cn(styles.wordmark, FOCUS_RING)} aria-label="GENSHIN ROTATION LAB 首页"><span>GENSHIN</span><b>{"//"}</b><strong>ROTATION LAB</strong></Link>
          <span className={styles.modelState}>{isEnglish ? "Deterministic combat model" : "确定性战斗模型"}</span>
          <div className={styles.headerActions}>
            <nav aria-label={isEnglish ? "Main navigation" : "主导航"} className={styles.nav}>
              <Link href="/workspace" className={cn(styles.navLink, FOCUS_RING)}>{isEnglish ? "Workspace" : "工作区"}</Link>
              <Link href="/coverage" className={cn(styles.navLink, FOCUS_RING)}>{isEnglish ? "Coverage" : "数据覆盖"}</Link>
            </nav>
            <LanguageToggle />
          </div>
        </header>

        <div className={styles.launch}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><span>ENTRY / 2026</span> {isEnglish ? "Combat rotation compiler" : "战斗循环编译器"}</p>
            <h1 id="hero-title">{isEnglish ? <>Compile every move into an <em>auditable</em> rotation.</> : <>把每一次出手，<em>编译成</em>可信循环。</>}</h1>
            <p className={styles.intro}>{isEnglish ? "Start from a public UID or a free experiment. Configure the team, equipment, and action timing, then replay the result with a deterministic model." : "从公开 UID 或自由实验开始，构建队伍、装备与动作时序，再用确定性模型复盘结果。"}</p>
            <div className={styles.metaRow} aria-label={isEnglish ? "Model status" : "模型状态"}><span><b>MODEL</b> v0.1</span><span><b>SCOPE</b> {isEnglish ? "Single target" : "单目标"}</span><span><b>RNG</b> {isEnglish ? "None" : "无随机数"}</span></div>
          </div>
          <div className={styles.art}><OrbitalField /></div>
        </section>

        <div className={styles.entryColumn}>
          <nav aria-label={isEnglish ? "Entry modes" : "入口通道"} className={styles.channelNav}>
          <a href="#uid-entry" className={cn(styles.channel, styles.channelActive, TRANSITION_COLORS, FOCUS_RING)}><span>01</span> {isEnglish ? "Public UID" : "UID 公开数据"}</a>
          <Link href="/workspace?mode=experiment" className={cn(styles.channel, TRANSITION_COLORS, FOCUS_RING)}><span>02</span> {isEnglish ? "Free experiment" : "自由实验"}</Link>
        </nav>

        <section aria-labelledby="entry-title" className={styles.entries}>
          <h2 id="entry-title" className="sr-only">选择进入方式</h2>
          <article id="uid-entry" className={cn(styles.entryCard, styles.uidCard)}>
            <div className={styles.cardTop}><span className={styles.cardIndex}>01 / UID IMPORT</span>{enkaOpen && <Button variant="quiet" size="sm" className={styles.collapse} onClick={() => { setFocusUidOnOpen(false); setEnkaOpen(false); }}>{isEnglish ? "Collapse" : "收起输入"}</Button>}</div>
            <h3>{isEnglish ? "Load public roster" : "读取公开角色"}</h3><p className={styles.cardLead}>{isEnglish ? "Enter a public UID to bring in the visible roster and displayed build data." : "输入公开 UID，带入角色选择与已展示的配置数据。"}</p>
            <EnkaImportDialog open={enkaOpen} onClose={() => setEnkaOpen(false)} onCommit={commitUid} presentation="entry" focusInputOnOpen={focusUidOnOpen} />
            {!enkaOpen && <Button id="uid-expand-trigger" variant="primary" className={cn(styles.primaryAction, "min-h-11 w-full")} onClick={() => { setFocusUidOnOpen(true); setEnkaOpen(true); }}>{isEnglish ? "Expand UID input" : "展开 UID 输入"}</Button>}
            <p className={styles.disclosure}>{isEnglish ? "Characters are limited to Enka's public roster; weapons and artifacts remain editable." : "角色仅限 Enka 公开展示名单；武器与圣遗物仍可自由调整。"}</p>
          </article>
          <article id="experiment-entry" className={cn(styles.entryCard, styles.experimentCard)}>
            <span className={styles.cardIndex}>02 / OPEN LAB</span>
            <h3>{isEnglish ? "Free experiment" : "自由实验"}</h3><p className={styles.cardLead}>{isEnglish ? "No UID or account data required. Start with an empty team and action sequence." : "无需 UID 或账号数据，从空队伍和空动作序列开始。"}</p>
            <Link href="/workspace?mode=experiment" className={cn(styles.experimentAction, FOCUS_RING)}>{isEnglish ? "Open blank workspace" : "进入空白工作区"}</Link>
          </article>
        </section>
        </div>
        </div>
        <section className={styles.proof} aria-label={isEnglish ? "How it works" : "工作方式"}><div><span>01</span><h2>{isEnglish ? "Configure" : "配置"}</h2><p>{isEnglish ? "Turn the team and build into readable inputs." : "把队伍与装备变成可读的输入。"}</p></div><div><span>02</span><h2>{isEnglish ? "Simulate" : "模拟"}</h2><p>{isEnglish ? "Run the deterministic combat core against your action timing." : "按动作时序运行确定性战斗内核。"}</p></div><div><span>03</span><h2>{isEnglish ? "Explain" : "解释"}</h2><p>{isEnglish ? "Trace every result back to the configuration that produced it." : "让每个结果都能回到对应配置。"}</p></div></section>
        <footer className={styles.footer}><span>ROTATION LAB / ENTRY NODE</span><span>{isEnglish ? "BUILT FOR REPEATABLE EXPERIMENTS" : "BUILD FOR REPEATABLE EXPERIMENTS"}</span></footer>
      </div>
    </main>
  );
}
