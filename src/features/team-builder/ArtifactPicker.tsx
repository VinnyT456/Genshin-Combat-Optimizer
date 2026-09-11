"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ArtifactSetDefinition } from "@/game-data/artifacts/types";
import { allArtifacts } from "@/game-data/artifacts/registry";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { DISABLED, FOCUS_RING, TOUCH_TARGET } from "@/components/ui/tokens";
import { ArtifactAvatar } from "@/components/ui/ArtifactAvatar";
import { LiveRegion } from "@/components/ui/LiveRegion";
import { filterArtifacts, type ArtifactRarityFilter } from "@/features/team-builder/artifactModel";
import { artifactBonusSupport } from "@/features/team-builder/artifactSupportPresentation";
import {
  artifactCombinationLabel,
  type ArtifactPieceCount,
  DEFAULT_ARTIFACT_PIECES,
} from "@/features/team-builder/equipmentSelection";
import {
  ARTIFACT_SLOTS,
  type ArtifactLoadout,
  type ArtifactPiece,
  type ArtifactSlot,
} from "@/simulation/character/equipment";
import {
  ArtifactStatsEditor,
  applyArtifactStatPreset,
  ARTIFACT_STAT_PRESETS,
  type ArtifactStatPresetId,
  normalizeArtifactLoadout,
  normalizeArtifactLoadoutForSlots,
} from "@/features/team-builder/ArtifactStatsEditor";

const SLOT_LABELS: Record<ArtifactSlot, string> = {
  flower: "生之花",
  plume: "死之羽",
  sands: "时之沙",
  goblet: "空之杯",
  circlet: "理之冠",
};

const RARITY_OPTIONS: readonly { id: ArtifactRarityFilter; label: string }[] = [
  { id: "all", label: "全部品质" },
  { id: 5, label: "5★ 圣遗物" },
  { id: 4, label: "4★ 圣遗物" },
];

function emptyArtifactPiece(slot: ArtifactSlot, setId: string): ArtifactPiece {
  return {
    slot,
    setId,
    mainStat: { stat: "atkFlat", value: 0 },
    substats: [],
  };
}

function initialLoadout(
  setId: string | null | undefined,
  pieces: ArtifactPieceCount | undefined,
  source: ArtifactLoadout | undefined,
): ArtifactLoadout {
  if (source && Object.keys(source).length > 0) return source;
  if (setId && pieces !== undefined) return normalizeArtifactLoadout(setId, pieces);
  return {};
}

function statKey(value: { stat: string; value: number; element?: string } | undefined): string {
  if (!value) return "";
  return `${value.stat}:${value.value}:${value.element ?? ""}`;
}

/** Stable draft identity used for dirty-state detection and deterministic UI. */
function loadoutKey(loadout: ArtifactLoadout): string {
  return ARTIFACT_SLOTS.map((slot) => {
    const piece = loadout[slot];
    if (!piece) return `${slot}:`;
    return [
      slot,
      piece.setId,
      statKey(piece.mainStat),
      ...piece.substats.map(statKey),
    ].join("|");
  }).join(";");
}

function dominantSet(loadout: ArtifactLoadout): { setId: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const slot of ARTIFACT_SLOTS) {
    const setId = loadout[slot]?.setId;
    if (setId) counts.set(setId, (counts.get(setId) ?? 0) + 1);
  }
  let winner: { setId: string; count: number } | null = null;
  for (const slot of ARTIFACT_SLOTS) {
    const setId = loadout[slot]?.setId;
    if (!setId) continue;
    const count = counts.get(setId) ?? 0;
    if (winner === null || count > winner.count) winner = { setId, count };
  }
  return winner;
}

interface Props {
  open: boolean;
  characterName: string;
  currentArtifactId?: string | null;
  currentPieces?: ArtifactPieceCount;
  currentArtifactLoadout?: ArtifactLoadout;
  onClose: () => void;
  onSelect: (
    artifact: ArtifactSetDefinition | null,
    pieces: ArtifactPieceCount,
    artifactLoadout?: ArtifactLoadout,
  ) => void;
}

export function ArtifactPicker({
  open,
  characterName,
  currentArtifactId,
  currentPieces = DEFAULT_ARTIFACT_PIECES,
  currentArtifactLoadout,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<ArtifactRarityFilter>("all");
  const [selectedSlot, setSelectedSlot] = useState<ArtifactSlot>("flower");
  const [quickSetId, setQuickSetId] = useState(currentArtifactId ?? "");
  const [quickPreset, setQuickPreset] = useState<ArtifactStatPresetId>("main");
  const [quickPresetScope, setQuickPresetScope] = useState<"current" | "assigned">("current");
  const [draft, setDraft] = useState<ArtifactLoadout>(() =>
    initialLoadout(currentArtifactId, currentPieces, currentArtifactLoadout),
  );
  const [discardPrompt, setDiscardPrompt] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const continueRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(
    () => filterArtifacts(allArtifacts, { rarity: rarityFilter, query }),
    [rarityFilter, query],
  );
  const slotSetIds = useMemo(
    () =>
      Object.fromEntries(
        ARTIFACT_SLOTS.map((slot) => [slot, draft[slot]?.setId ?? null]),
      ) as Partial<Record<ArtifactSlot, string | null>>,
    [draft],
  );
  const assignedSlots = ARTIFACT_SLOTS.filter((slot) => draft[slot]);
  const combination = artifactCombinationLabel(draft);
  const initialKey = useMemo(
    () => loadoutKey(initialLoadout(currentArtifactId, currentPieces, currentArtifactLoadout)),
    [currentArtifactId, currentPieces, currentArtifactLoadout],
  );
  const dirty = loadoutKey(draft) !== initialKey;
  const selectedPiece = draft[selectedSlot];
  const selectedArtifact = selectedPiece
    ? allArtifacts.find((artifact) => artifact.id === selectedPiece.setId)
    : undefined;

  useEffect(() => {
    if (discardPrompt) continueRef.current?.focus();
  }, [discardPrompt]);

  function assignSetToSlot(setId: string, slot = selectedSlot) {
    setQuickSetId(setId);
    setDraft((current) => {
      const previous = current[slot];
      const nextPiece = previous?.setId === setId
        ? previous
        : {
            ...(previous ?? emptyArtifactPiece(slot, setId)),
            slot,
            setId,
          };
      return { ...current, [slot]: nextPiece };
    });
    const artifact = allArtifacts.find((candidate) => candidate.id === setId);
    setAnnouncement(
      artifact
        ? `已将${artifact.nameZh}配置到${SLOT_LABELS[slot]}，尚未保存。`
        : `已配置${SLOT_LABELS[slot]}，尚未保存。`,
    );
  }

  function equipQuickSet() {
    if (!quickSetId) return;
    setDraft((current) => {
      const next: ArtifactLoadout = { ...current };
      for (const slot of ARTIFACT_SLOTS) {
        const previous = current[slot];
        next[slot] = previous?.setId === quickSetId
          ? previous
          : {
              ...(previous ?? emptyArtifactPiece(slot, quickSetId)),
              slot,
              setId: quickSetId,
            };
      }
      return next;
    });
    const artifact = allArtifacts.find((candidate) => candidate.id === quickSetId);
    setAnnouncement(artifact ? `已将${artifact.nameZh}快速配置到五个部位，尚未保存。` : "已快速配置五个部位，尚未保存。");
  }

  function applyQuickPreset() {
    const slots = quickPresetScope === "current" ? [selectedSlot] : ARTIFACT_SLOTS;
    if (quickPresetScope === "current" && !draft[selectedSlot]) {
      setAnnouncement(`请先为${SLOT_LABELS[selectedSlot]}选择套装。`);
      return;
    }
    if (quickPresetScope === "assigned" && assignedSlots.length === 0) {
      setAnnouncement("请先选择至少一个套装部位。");
      return;
    }
    setDraft((current) => applyArtifactStatPreset(current, quickPreset, slots));
    const presetLabel = ARTIFACT_STAT_PRESETS.find((preset) => preset.id === quickPreset)?.label ?? "词条模板";
    setAnnouncement(`已为${quickPresetScope === "current" ? SLOT_LABELS[selectedSlot] : "已配置部位"}套用${presetLabel}，尚未保存。`);
  }

  function clearSlot(slot: ArtifactSlot) {
    setDraft((current) => {
      const next = { ...current };
      delete next[slot];
      return next;
    });
    setAnnouncement(`已卸下${SLOT_LABELS[slot]}，尚未保存。`);
  }

  function clearAll() {
    setDraft({});
    setAnnouncement("已清空五件配置，尚未保存。");
  }

  function saveDraft() {
    const normalized = normalizeArtifactLoadoutForSlots(slotSetIds, draft);
    const primary = dominantSet(normalized);
    if (!primary) {
      onSelect(null, DEFAULT_ARTIFACT_PIECES);
      return;
    }
    const artifact = allArtifacts.find((candidate) => candidate.id === primary.setId) ?? null;
    onSelect(artifact, primary.count as ArtifactPieceCount, normalized);
  }

  function requestClose() {
    if (!dirty) {
      onClose();
      return;
    }
    setDiscardPrompt(true);
  }

  function discardAndClose() {
    setDiscardPrompt(false);
    onClose();
  }

  function clearFilters() {
    setQuery("");
    setRarityFilter("all");
    searchRef.current?.focus();
  }

  return (
    <Dialog
      open={open}
      title={`为${SLOT_LABELS[selectedSlot]}选择套装 · ${characterName}`}
      onClose={requestClose}
      initialFocusRef={searchRef}
      size="browse"
    >
      <LiveRegion message={announcement} />
      <div className="space-y-4">
        <div className="rounded-md border border-amber-400/25 bg-amber-950/15 px-3 py-2.5 text-xs text-slate-300">
          先选择部位，再选择套装。更改仅在保存后生效。
        </div>

        <section aria-label="圣遗物搜索与筛选" className="space-y-3">
          <label htmlFor="artifact-search" className="sr-only">搜索圣遗物</label>
          <input
            id="artifact-search"
            ref={searchRef}
            name="artifact-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            placeholder="搜索圣遗物名称或效果…"
            className={cn(
              "w-full rounded-md border border-surface-border bg-surface-raised px-4 py-3 text-sm text-slate-100 placeholder-slate-500",
              FOCUS_RING,
            )}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">品质筛选</span>
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">圣遗物品质</legend>
              {RARITY_OPTIONS.map((option) => {
                const active = rarityFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setRarityFilter(option.id)}
                    className={cn(
                      `${TOUCH_TARGET} rounded-md border px-3 text-xs font-semibold`,
                      FOCUS_RING,
                      active
                        ? "border-amber-400/60 bg-amber-500/20 text-amber-300"
                        : "border-surface-border bg-surface text-slate-300 hover:border-amber-400/70 hover:text-amber-300",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </fieldset>
            {(query || rarityFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className={cn(`${TOUCH_TARGET} rounded-md px-3 text-xs text-amber-300 hover:bg-amber-500/10`, FOCUS_RING)}
              >
                清空筛选
              </button>
            )}
          </div>
        </section>

        <section aria-label="五件配置" className="space-y-3 rounded-md border border-surface-border bg-surface/60 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">五件配置</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">选择一个部位，再从下方套装卡中配置。</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-surface-border bg-surface px-2.5 py-1 text-xs text-slate-300">
                已配置 {assignedSlots.length}/5 件{combination ? ` · ${combination}` : ""}
              </span>
              {assignedSlots.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className={cn(`${TOUCH_TARGET} rounded-md px-2 text-xs text-slate-400 hover:text-amber-300`, FOCUS_RING)}
                >
                  清空五件
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-2 rounded-md border border-amber-400/20 bg-amber-950/10 p-2.5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-400">
                <span className="block font-semibold text-slate-300">快速套装</span>
                <select
                  aria-label="快速选择套装"
                  value={quickSetId}
                  onChange={(event) => setQuickSetId(event.target.value)}
                  className={cn("w-full rounded-md border border-surface-border bg-surface-raised px-2 py-2 text-xs text-slate-200", FOCUS_RING)}
                >
                  <option value="">选择套装后可一键五件同套</option>
                  {allArtifacts.map((artifact) => (
                    <option key={artifact.id} value={artifact.id}>{artifact.nameZh} · {artifact.rarity}星</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs text-slate-400">
                <span className="block font-semibold text-slate-300">快速词条模板</span>
                <div className="flex gap-2">
                  <select
                    aria-label="快速词条模板"
                    value={quickPreset}
                    onChange={(event) => setQuickPreset(event.target.value as ArtifactStatPresetId)}
                    className={cn("min-w-0 flex-1 rounded-md border border-surface-border bg-surface-raised px-2 py-2 text-xs text-slate-200", FOCUS_RING)}
                  >
                    {ARTIFACT_STAT_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>{preset.label}</option>
                    ))}
                  </select>
                  <select
                    aria-label="词条模板应用范围"
                    value={quickPresetScope}
                    onChange={(event) => setQuickPresetScope(event.target.value as "current" | "assigned")}
                    className={cn("rounded-md border border-surface-border bg-surface-raised px-2 py-2 text-xs text-slate-200", FOCUS_RING)}
                  >
                    <option value="current">当前部位</option>
                    <option value="assigned">已配置部位</option>
                  </select>
                </div>
              </label>
            </div>
            <div className="flex flex-wrap items-end gap-2 sm:justify-end">
              <button
                type="button"
                onClick={equipQuickSet}
                disabled={!quickSetId}
                className={cn(`${TOUCH_TARGET} rounded-md border border-amber-400/40 px-3 text-xs font-semibold text-amber-200 hover:bg-amber-500/15`, FOCUS_RING, DISABLED)}
              >
                五件同套
              </button>
              <button
                type="button"
                onClick={applyQuickPreset}
                disabled={assignedSlots.length === 0}
                className={cn(`${TOUCH_TARGET} rounded-md border border-cyan-400/40 px-3 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/15`, FOCUS_RING, DISABLED)}
              >
                套用模板
              </button>
            </div>
            <p className="text-micro leading-relaxed text-slate-500 sm:col-span-2">
              模板使用固定演示值，可继续逐项修改；百分比按百分数显示。
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {ARTIFACT_SLOTS.map((slot) => {
              const piece = draft[slot];
              const artifact = piece ? allArtifacts.find((candidate) => candidate.id === piece.setId) : undefined;
              const hasStats = piece
                ? [piece.mainStat, ...piece.substats].some((stat) => stat.value !== 0)
                : false;
              const selected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${SLOT_LABELS[slot]}，${artifact?.nameZh ?? "未装备"}，${hasStats ? "已录入属性" : "属性未录入"}${selected ? "，当前部位" : ""}`}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    `${TOUCH_TARGET} min-w-0 w-full rounded-md border px-3 py-2 text-left`,
                    FOCUS_RING,
                    selected
                      ? "border-amber-400 bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/60"
                      : "border-surface-border bg-surface-raised text-slate-300 hover:border-amber-400/70",
                  )}
                >
                  <span className="flex items-center justify-between gap-2 text-xs font-semibold">
                    <span>{SLOT_LABELS[slot]}</span>
                    {selected && <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-micro text-amber-300">当前部位</span>}
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-200">{artifact?.nameZh ?? "未装备"}</span>
                  <span className="mt-1 block text-micro text-slate-400">{hasStats ? "已录入属性" : "属性未录入"}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label={`${SLOT_LABELS[selectedSlot]}属性`} className="space-y-3 rounded-md border border-surface-border bg-surface/60 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{SLOT_LABELS[selectedSlot]}属性</h3>
              <p className="mt-1 text-xs text-slate-400">
                {selectedArtifact ? `套装：${selectedArtifact.nameZh}` : "请先从下方选择套装"}
              </p>
            </div>
            {selectedPiece && (
              <button
                type="button"
                onClick={() => clearSlot(selectedSlot)}
                className={cn(`${TOUCH_TARGET} rounded-md border border-surface-border px-3 text-xs text-slate-300 hover:border-amber-400 hover:text-amber-300`, FOCUS_RING)}
              >
                卸下此件
              </button>
            )}
          </div>
          {selectedPiece ? (
            <ArtifactStatsEditor
              slots={[selectedSlot]}
              slotSetIds={{ [selectedSlot]: selectedPiece.setId }}
              value={draft}
              onChange={(next) => setDraft((current) => ({ ...current, ...next }))}
            />
          ) : (
            <p className="rounded-md border border-dashed border-surface-border px-3 py-4 text-center text-xs text-slate-500">
              选择下方套装卡后，可在此录入主词条与副词条。
            </p>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-2">
          <p aria-live="polite" className="text-xs text-slate-400">
            当前显示 <span className="font-mono tabular-nums text-slate-200">{filtered.length}</span> / {allArtifacts.length} 套圣遗物 · 按上线顺序倒序
          </p>
          <span className="sr-only">匹配到 {filtered.length} / {allArtifacts.length} 套圣遗物</span>
          {filtered.length === 0 && <span className="text-xs text-slate-500">未找到符合条件的圣遗物。</span>}
        </div>

        {filtered.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((artifact) => {
              const selected = draft[selectedSlot]?.setId === artifact.id;
              const usageCount = assignedSlots.filter((slot) => draft[slot]?.setId === artifact.id).length;
              const accessibleName = `将${artifact.nameZh}（${artifact.rarity}星）配置到${SLOT_LABELS[selectedSlot]}${selected ? "，当前选择" : ""}`;
              const bonuses = artifactBonusSupport(artifact.id).filter((bonus) =>
                bonus.pieces === 1 || bonus.pieces === 2 || bonus.pieces === 4,
              );
              return (
                <li key={artifact.id} className="flex">
                  <article className="flex w-full">
                    <button
                      type="button"
                      aria-label={accessibleName}
                      aria-pressed={selected}
                      onClick={() => assignSetToSlot(artifact.id)}
                      className={cn(
                        "flex h-full w-full flex-col gap-3 rounded-md border p-4 text-left transition-colors",
                        FOCUS_RING,
                        DISABLED,
                        selected
                          ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/60"
                          : "border-surface-border bg-surface-raised hover:border-amber-400/80 hover:bg-surface-hover",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <ArtifactAvatar iconId={artifact.iconId} nameZh={artifact.nameZh} size="sm" />
                        <span
                          className={cn(
                            "rounded border px-2 py-0.5 text-xs font-bold",
                            artifact.rarity === 5
                              ? "border-amber-500/30 bg-amber-400/15 text-amber-300"
                              : "border-purple-500/30 bg-purple-400/15 text-purple-300",
                          )}
                        >
                          {artifact.rarity}★
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 title={artifact.nameZh} className="break-words text-base font-bold leading-snug text-slate-100">
                          {artifact.nameZh}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">圣遗物套装</p>
                      </div>
                      <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                        {bonuses.map((bonus) => (
                          <div key={bonus.pieces}>
                            <span className="font-semibold text-amber-300">{bonus.pieces}件套</span>
                            <p className="mt-0.5 break-words text-slate-400">{bonus.textZh}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-surface-border/60 pt-2 text-xs">
                        <span className={selected ? "font-semibold text-cyan-300" : "font-medium text-slate-300"}>
                          {selected ? "✓ 已配置到" : "配置到"}{SLOT_LABELS[selectedSlot]}
                        </span>
                        {usageCount > 0 && (
                          <span className="text-slate-400">已用于 {usageCount} 件</span>
                        )}
                      </div>
                    </button>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-md border border-surface-border bg-surface p-8 text-center text-sm text-slate-400">
            <button
              type="button"
              onClick={clearFilters}
              className={cn("mt-2 rounded-md px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10", FOCUS_RING)}
            >
              重置筛选条件
            </button>
          </div>
        )}

        {discardPrompt && (
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-amber-400/40 bg-surface-raised/95 px-4 py-3 shadow-lg backdrop-blur-sm" role="alertdialog" aria-label="舍弃未保存修改">
            <p className="text-sm font-semibold text-slate-100">有未保存的修改，确定要舍弃吗？</p>
            <div className="mt-2 flex flex-wrap justify-end gap-2">
              <button
                ref={continueRef}
                type="button"
                onClick={() => setDiscardPrompt(false)}
                className={cn(`${TOUCH_TARGET} rounded-md border border-surface-border px-3 text-xs text-slate-200 hover:border-amber-400`, FOCUS_RING)}
              >
                继续编辑
              </button>
              <button
                type="button"
                onClick={discardAndClose}
                className={cn(`${TOUCH_TARGET} rounded-md bg-amber-500 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-400`, FOCUS_RING)}
              >
                舍弃并关闭
              </button>
            </div>
          </div>
        )}

        {!discardPrompt && (
          <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-border bg-surface-raised/95 px-4 py-3 shadow-lg backdrop-blur-sm" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <span className={cn("text-xs", dirty ? "text-amber-300" : "text-slate-400")}>
              {dirty ? "有未保存修改" : "当前配置已保存"}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={requestClose}
                className={cn(`${TOUCH_TARGET} rounded-md border border-surface-border px-4 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-300`, FOCUS_RING)}
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className={cn(`${TOUCH_TARGET} rounded-md bg-amber-500 px-4 text-xs font-semibold text-slate-950 hover:bg-amber-400`, FOCUS_RING)}
              >
                保存配置
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
