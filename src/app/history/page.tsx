"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HistoryEntry } from "@/features/history";
import { sessionHistoryLabel } from "@/features/history";

const KEY = "genshin-optimizer:run-history:v1";

export default function HistoryPage() {
  const [entries, setEntries] = useState<readonly HistoryEntry[]>([]);
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(KEY);
      if (raw) setEntries(JSON.parse(raw) as HistoryEntry[]);
    } catch { setEntries([]); }
  }, []);
  return <main id="main-content" className="mx-auto max-w-6xl p-6">
    <nav className="mb-8 text-sm text-slate-400"><Link href="/">首页</Link> <span className="mx-2">/</span> 历史</nav>
    <h1 className="text-3xl font-semibold">模拟历史</h1>
    <p className="mt-2 text-slate-400">仅保存在本次会话；不会覆盖当前配置，也不会自动持久化。</p>
    {entries.length === 0 ? <section className="mt-8 rounded-lg border border-slate-700 p-6 text-slate-300">本次会话还没有可查看的模拟记录。</section> : <div className="mt-8 grid gap-3">{entries.map((entry) => <article key={entry.metadata.id} className="rounded-lg border border-slate-700 p-4"><h2>{sessionHistoryLabel(entry)}</h2><p className="mt-1 text-sm text-slate-400">总伤害：{entry.run.result.totalDamage}</p></article>)}</div>}
  </main>;
}
