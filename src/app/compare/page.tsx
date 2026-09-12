"use client";

import Link from "next/link";

export default function ComparePage() {
  return <main id="main-content" className="mx-auto max-w-6xl p-6">
    <nav className="mb-8 text-sm text-slate-400"><Link href="/">首页</Link> <span className="mx-2">/</span> 对比</nav>
    <h1 className="text-3xl font-semibold">A/B 模拟对比</h1>
    <p className="mt-2 text-slate-400">只有阵容、敌人和模拟配置一致的记录才可比较；配置变更后的记录会标记为过期。</p>
    <section className="mt-8 rounded-lg border border-slate-700 p-6 text-slate-300">请先在模拟历史中选择两次记录。</section>
  </main>;
}
