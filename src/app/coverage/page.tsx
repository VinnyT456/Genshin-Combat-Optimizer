import { allCharacters } from "@/game-data/characters/registry";
import { buildCoverageMatrix } from "@/tests/coverage/characterCoverage";
import { coverageRows, coverageStateZh } from "@/features/coverage";
import Link from "next/link";

export default function CoveragePage() {
  const rows = coverageRows(buildCoverageMatrix(allCharacters, []));
  const states = ["sourced", "represented", "executable", "live-wired", "regression-tested"] as const;
  return <main id="main-content" className="mx-auto max-w-7xl p-6">
    <nav className="mb-8 text-sm text-slate-400"><Link href="/">首页</Link> <span className="mx-2">/</span> 覆盖情况</nav>
    <h1 className="text-3xl font-semibold">实现覆盖情况</h1>
    <p className="mt-2 max-w-3xl text-slate-400">各状态分别展示证据链，不合并为一个百分比。未知状态不会被计入“已覆盖”。</p>
    <div className="mt-6 overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-700 text-slate-300"><th className="p-3">角色</th>{states.map((state) => <th key={state} className="p-3">{coverageStateZh(state)}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-slate-800"><th className="p-3 font-medium">{row.name}</th>{states.map((state) => <td key={state} className="p-3">{row.states[state] === true ? "是" : row.states[state] === "unknown" ? "未知" : "否"}</td>)}</tr>)}</tbody></table>
    </div>
  </main>;
}
