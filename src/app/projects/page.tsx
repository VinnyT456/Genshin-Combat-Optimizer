"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReplayPack, ReplayPackImportPreview, StorageLike } from "@/features/simulation/workspacePersistence";
import { copyImportedProject, deleteProjectRecord, exportReplayPack, listProjects, loadProjectRecord, previewProjectImport, replayPackFromText, saveProjectRecord, type ProjectListEntry } from "@/features/projects/projectsModel";

function browserStorage(): StorageLike | null {
  try { return window.localStorage; } catch { return null; }
}

export default function ProjectsPage() {
  const [storage, setStorage] = useState<StorageLike | null | undefined>(undefined);
  const [projects, setProjects] = useState<readonly ProjectListEntry[]>([]);
  const [selected, setSelected] = useState<ReplayPack | null>(null);
  const [preview, setPreview] = useState<ReplayPackImportPreview | null>(null);
  const [importText, setImportText] = useState("");
  const [title, setTitle] = useState("导入项目");
  const [message, setMessage] = useState("加载中…");

  const refresh = (announce = true) => { const next = browserStorage(); setStorage(next); setProjects(listProjects(next)); if (announce) setMessage(next === null ? "本机存储不可用，项目不会自动保存。" : "项目库已就绪。"); };
  useEffect(refresh, []);
  const reasonOf = (value: unknown) => typeof value === "object" && value !== null && "reason" in value && typeof value.reason === "string" ? value.reason : "项目不存在";
  const load = (id: string) => { const result = loadProjectRecord(storage ?? null, id); setSelected(result.pack); setMessage(result.status.state === "loaded" ? "已载入预览；当前工作未改变。" : `载入失败：${reasonOf(result.status)}`); };
  const remove = (id: string) => { if (!window.confirm("确定删除这个本地项目吗？此操作不可恢复。")) return; const result = deleteProjectRecord(storage ?? null, id, true); setMessage(result.state === "saved" ? "项目已删除。" : `删除失败：${reasonOf(result)}`); refresh(false); if (selected?.projectId === id) setSelected(null); };
  const save = () => { const pack = replayPackFromText(importText); if (pack === null) { setMessage("保存失败：请先使用有效的 ReplayPack 预览。"); return; } const result = saveProjectRecord(storage ?? null, pack, title); setMessage(result.state === "saved" || result.state === "quota" ? "项目已保存。" : `保存失败：${reasonOf(result)}`); refresh(false); };
  const doImportPreview = () => { const next = previewProjectImport(importText); setPreview(next); setMessage(next === null ? "导入失败：文件格式、版本或完整性校验不通过。" : "导入预览已生成；确认后才会复制，不会覆盖当前工作。"); };
  const copy = () => { if (preview === null) return; copyImportedProject(preview); setMessage("已复制为新的工作草稿；当前项目未被覆盖。"); };
  const download = () => { if (selected === null) return; const url = URL.createObjectURL(new Blob([exportReplayPack(selected)], { type: "application/json" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${selected.projectId}.replay.json`; anchor.click(); URL.revokeObjectURL(url); };

  return <main id="main-content" className="mx-auto max-w-5xl p-6">
    <nav className="mb-8 text-sm text-slate-400"><Link href="/">首页</Link><span className="mx-2">/</span>项目库</nav>
    <h1 className="text-3xl font-semibold">本地项目库</h1>
    <p className="mt-2 text-slate-400">保存实验、导入 ReplayPack，或导出可复现的输入。导入不会覆盖当前工作。</p>
    <p role="status" className="mt-4 rounded border border-slate-700 p-3 text-sm text-slate-300">{message}</p>
    <section className="mt-6 grid gap-6 md:grid-cols-[1fr_1.4fr]">
      <div><h2 className="text-xl font-medium">已保存项目</h2>{projects.length === 0 ? <p className="mt-3 text-sm text-slate-400">暂无本地项目。</p> : <ul className="mt-3 space-y-2">{projects.map((project) => <li key={project.projectId} className="flex items-center justify-between rounded border border-slate-700 p-3"><button className="text-left text-sky-300 underline" onClick={() => load(project.projectId)}>{project.title}</button><button className="text-xs text-rose-300 underline" onClick={() => remove(project.projectId)}>删除</button></li>)}</ul>}</div>
      <div><h2 className="text-xl font-medium">ReplayPack 导入</h2><textarea aria-label="ReplayPack JSON" className="mt-3 min-h-40 w-full rounded border border-slate-700 bg-slate-950 p-3 font-mono text-xs" value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="粘贴 ReplayPack JSON" /><button className="mt-2 rounded bg-sky-700 px-4 py-2" onClick={doImportPreview}>预览导入</button>
        {preview && <div className="mt-4 rounded border border-emerald-700/60 p-4"><h3 className="font-medium">导入预览：{preview.projectId}</h3><p className="mt-1 text-sm text-slate-400">引擎 {preview.identities.engine} · 数据 {preview.identities.data} · 规则 {preview.identities.rules}</p><p className="mt-1 text-sm text-slate-400">限制：{preview.assumptions.limitations.join("、") || "无"}</p><div className="mt-3 flex gap-2"><button className="rounded bg-emerald-700 px-3 py-2" onClick={copy}>复制为新草稿</button><input aria-label="项目名称" className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-2" value={title} onChange={(event) => setTitle(event.target.value)} /><button className="rounded border border-slate-600 px-3 py-2" onClick={save}>保存项目</button></div></div>}
      </div>
    </section>
    {selected && <section className="mt-6 rounded border border-slate-700 p-4"><h2 className="text-xl font-medium">项目详情：{selected.projectId}</h2><p className="mt-2 text-sm text-slate-400">版本 v{selected.version} · 输入指纹 {selected.canonicalInputHash}</p><p className="mt-1 text-sm text-slate-400">限制：{selected.assumptions.limitations.join("、") || "无"}</p><button className="mt-3 rounded border border-slate-600 px-3 py-2" onClick={download}>导出 ReplayPack</button></section>}
  </main>;
}
