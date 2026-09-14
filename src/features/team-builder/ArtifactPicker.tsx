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

const STAT_LABELS: Record<string, string> = {
  hpFlat: "生命值",
  atkFlat: "攻击力",
  defFlat: "防御力",
  hpPercent: "生命值%",
  atkPercent: "攻击力%",
  defPercent: "防御力%",
  critRate: "暴击率",
  critDmg: "暴击伤害",
  energyRecharge: "元素充能效率",
  elementalMastery: "元素精通",
  dmgBonus: "伤害加成",
  elementalDmgBonus: "元素伤害",
};

const ELEMENT_LABELS: Record<string, string> = {
  anemo: "风",
  geo: "岩",
  electro: "雷",
  dendro: "草",
  hydro: "水",
  pyro: "火",
  cryo: "冰",
  physical: "物理",
};

const PERCENT_STATS = new Set([
  "hpPercent",
  "atkPercent",
  "defPercent",
  "critRate",
  "critDmg",
  "energyRecharge",
  "dmgBonus",
  "elementalDmgBonus",
]);

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

function formatSelectedStat(stat: { stat: string; value: number; element?: string }): string {
  if (stat.value === 0) return "待设置";
  const amount = PERCENT_STATS.has(stat.stat) ? stat.value * 100 : stat.value;
  const suffix = PERCENT_STATS.has(stat.stat) ? "%" : "";
  const element = stat.stat === "elementalDmgBonus" && stat.element
    ? ` · ${ELEMENT_LABELS[stat.element] ?? stat.element}`
    : "";
  return `${amount.toFixed(1)}${suffix}${element}`;
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
  const selectedBonuses = selectedArtifact
    ? artifactBonusSupport(selectedArtifact.id).filter((bonus) =>
        bonus.pieces === 1 || bonus.pieces === 2 || bonus.pieces === 4,
      )
    : [];

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
      className="border-cyan-300/20 bg-[#0a0d14]"
    >
      <LiveRegion message={announcement} />
      <div className="relative -m-4 min-h-full bg-[#0b0f16] p-3 sm:p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 border-b border-fuchsia-300/10 bg-fuchsia-300/[0.02]" aria-hidden="true" />
        <div className="relative space-y-3">
          <header className="flex flex-wrap items-end justify-between gap-3 border border-fuchsia-300/20 border-l-2 border-l-fuchsia-300/70 bg-surface-raised px-4 py-3">
            <div>
              <div className="text-micro font-semibold uppercase tracking-[0.18em] text-purple-200/70">
                圣遗物配置工作台
              </div>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-50">为 {characterName} 配置圣遗物</h3>
              <p className="mt-1 text-xs text-slate-400">先选部位，再从套装库配置；所有修改在保存前都可以撤销。</p>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-cyan-300/25 bg-cyan-300/5 px-3 py-2">
              <span className="font-mono text-micro uppercase tracking-wide text-cyan-200/70">LOADOUT</span>
              <span className="font-mono text-lg font-bold tabular-nums text-cyan-200">{assignedSlots.length}/5</span>
              <span className="hidden max-w-40 truncate text-xs text-slate-300 sm:inline">{combination || "尚未选择套装"}</span>
            </div>
          </header>

          <div className="grid gap-3 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(17rem,0.85fr)_minmax(22rem,1.2fr)]">
            <section aria-label="圣遗物套装库" className="flex min-h-0 flex-col border border-surface-border bg-surface-raised p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-micro font-semibold uppercase tracking-[0.16em] text-slate-500">01 / 套装库</p>
                  <h3 className="mt-1 text-base font-bold text-slate-100">套装库</h3>
                </div>
                <span className="rounded-sm border border-surface-border bg-surface px-2 py-1 font-mono text-micro text-slate-400">{filtered.length} 套</span>
              </div>

              <div className="mt-3 space-y-2">
                <label htmlFor="artifact-search" className="sr-only">搜索圣遗物</label>
                <div className="relative">
                  <input
                    id="artifact-search"
                    ref={searchRef}
                    name="artifact-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="搜索套装名称或效果…"
                    className={cn(
                      "w-full rounded-sm border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500",
                      FOCUS_RING,
                    )}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-micro text-slate-500">品质</span>
                  <fieldset className="flex flex-wrap gap-1.5">
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
                            `${TOUCH_TARGET} rounded-sm border px-2.5 text-micro font-semibold`,
                            FOCUS_RING,
                            active
                              ? "border-amber-400/60 bg-amber-500/20 text-amber-300"
                              : "border-surface-border bg-surface-raised text-slate-400 hover:border-amber-400/70 hover:text-amber-300",
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
                      className={cn(`${TOUCH_TARGET} rounded-sm px-2 text-micro text-amber-300 hover:bg-amber-500/10`, FOCUS_RING)}
                    >
                      清空
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-y border-surface-border/70 py-2">
                <p aria-live="polite" className="text-micro text-slate-400">
                  当前显示 <span className="font-mono tabular-nums text-slate-200">{filtered.length}</span> / {allArtifacts.length} 套 · 按上线顺序倒序
                </p>
                <span className="sr-only">匹配到 {filtered.length} / {allArtifacts.length} 套圣遗物</span>
              </div>

              <div className="mt-2 max-h-[42rem] overflow-y-auto pr-1" style={{ overscrollBehavior: "contain" }}>
                {filtered.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((artifact) => {
                      const selected = draft[selectedSlot]?.setId === artifact.id;
                      const usageCount = assignedSlots.filter((slot) => draft[slot]?.setId === artifact.id).length;
                      const accessibleName = `将${artifact.nameZh}（${artifact.rarity}星）配置到${SLOT_LABELS[selectedSlot]}${selected ? "，当前选择" : ""}`;
                      return (
                        <li
                          key={artifact.id}
                          className="flex"
                          style={{ contentVisibility: "auto", containIntrinsicSize: "0 128px" }}
                        >
                          <article className="flex w-full">
                            <button
                              type="button"
                              aria-label={accessibleName}
                              aria-pressed={selected}
                              onClick={() => assignSetToSlot(artifact.id)}
                              className={cn(
                                "group relative flex h-full min-h-32 w-full flex-col items-center gap-1.5 rounded-sm border px-2 py-2.5 text-center transition-colors",
                                FOCUS_RING,
                                DISABLED,
                                selected
                                  ? "border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400/60"
                                  : "border-surface-border bg-surface-raised/90 hover:border-amber-400/80 hover:bg-surface-hover",
                              )}
                            >
                              <span className="relative">
                                <ArtifactAvatar iconId={artifact.iconId} nameZh={artifact.nameZh} size="md" className="h-12 w-12 rounded-sm" />
                                {selected && (
                                  <span className="absolute -right-1 -top-1 border border-cyan-200/70 bg-cyan-400 px-1 text-micro font-bold text-slate-950">已选</span>
                                )}
                              </span>
                              <h4 title={artifact.nameZh} className="w-full truncate text-xs font-semibold leading-snug text-slate-100">{artifact.nameZh}</h4>
                              <div className="mt-auto flex w-full items-center justify-between gap-1 border-t border-surface-border/60 pt-1.5 text-micro">
                                <span className={artifact.rarity === 5 ? "text-amber-300" : "text-purple-300"}>{artifact.rarity}★</span>
                                <span className="text-slate-500">{usageCount > 0 ? `${usageCount}/5` : "未用"}</span>
                              </div>
                            </button>
                          </article>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-sm border border-dashed border-surface-border bg-surface-raised/50 p-8 text-center text-sm text-slate-400">
                    <p>未找到符合条件的圣遗物。</p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={cn("mt-2 rounded-sm px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10", FOCUS_RING)}
                    >
                      重置筛选条件
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section aria-label="圣遗物装备预览" className="rounded-sm border border-cyan-300/20 bg-surface-raised p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-micro font-semibold uppercase tracking-[0.16em] text-slate-500">02 / 装备预览</p>
                  <h3 className="mt-1 text-base font-bold text-slate-100">装备预览</h3>
                </div>
                <span className="rounded-sm border border-cyan-300/25 bg-cyan-300/5 px-2 py-1 font-mono text-micro text-cyan-200">{combination || "未成套"}</span>
              </div>

              <div className="relative mt-3 px-3 py-5 text-center">
                <div className="relative mx-auto flex min-h-24 max-w-xs items-center justify-center px-4">
                  {selectedArtifact ? (
                    <ArtifactAvatar
                      iconId={selectedArtifact.iconId}
                      nameZh={`${selectedArtifact.nameZh} · ${SLOT_LABELS[selectedSlot]}`}
                      size="lg"
                      slot={selectedSlot}
                      className="!border-0 !bg-transparent"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="font-mono text-micro uppercase tracking-[0.18em] text-cyan-200/70">当前部位</p>
                      <p className="mt-1 text-lg font-bold text-cyan-100">{SLOT_LABELS[selectedSlot]}</p>
                    </div>
                  )}
                </div>
                <p className="relative mt-3 text-sm font-bold text-slate-100">{selectedArtifact?.nameZh ?? "选择一个套装"}</p>
                <p className="relative mt-1 text-micro text-slate-400">{selectedPiece ? `${SLOT_LABELS[selectedSlot]} · 20级词条配置` : "从左侧套装库选择当前部位"}</p>
                {selectedPiece && (
                  <div className="relative mt-3 grid grid-cols-2 gap-2 text-left">
                    <div className="rounded-sm border border-surface-border bg-surface px-2.5 py-2">
                      <p className="text-micro text-slate-500">主词条</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-200">{STAT_LABELS[selectedPiece.mainStat.stat] ?? selectedPiece.mainStat.stat}</p>
                      <p className="font-mono text-xs text-amber-200">{formatSelectedStat(selectedPiece.mainStat)}</p>
                    </div>
                    <div className="rounded-sm border border-surface-border bg-surface px-2.5 py-2">
                      <p className="text-micro text-slate-500">副词条</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-200">{selectedPiece.substats.filter((stat) => stat.value !== 0).length}/4 已填写</p>
                      <p className="font-mono text-xs text-cyan-200">+5 次强化</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-micro font-semibold uppercase tracking-[0.14em] text-slate-500">五件部位</p>
                  {assignedSlots.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className={cn(`${TOUCH_TARGET} rounded-sm px-2 text-micro text-slate-400 hover:text-cyan-200`, FOCUS_RING)}
                    >
                      清空
                    </button>
                  )}
                </div>
                {ARTIFACT_SLOTS.map((slot) => {
                  const piece = draft[slot];
                  const artifact = piece ? allArtifacts.find((candidate) => candidate.id === piece.setId) : undefined;
                  const selected = selectedSlot === slot;
                  const hasStats = piece
                    ? [piece.mainStat, ...piece.substats].some((stat) => stat.value !== 0)
                    : false;
                  return (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${SLOT_LABELS[slot]}，${artifact?.nameZh ?? "未装备"}，${hasStats ? "已录入属性" : "属性未录入"}${selected ? "，当前部位" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        `${TOUCH_TARGET} flex w-full items-center gap-2 rounded-sm border px-2.5 py-2 text-left`,
                        FOCUS_RING,
                        selected
                          ? "border-amber-300/70 bg-amber-400/10 text-amber-100"
                          : "border-surface-border bg-surface-raised/70 text-slate-300 hover:border-amber-300/50",
                      )}
                    >
                      <ArtifactAvatar
                        iconId={artifact?.iconId}
                        nameZh={`${artifact?.nameZh ?? ""} · ${SLOT_LABELS[slot]}`}
                        size="xs"
                        slot={slot}
                        className="!border-transparent !bg-transparent"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold">{SLOT_LABELS[slot]}</span>
                        <span className="block truncate text-micro text-slate-400">{artifact?.nameZh ?? "未装备"}</span>
                      </span>
                      <span className={cn("text-micro", hasStats ? "text-cyan-300" : "text-slate-600")}>{hasStats ? "已录入" : "未录入"}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-sm border border-cyan-400/20 bg-[#0f1723] p-2.5">
                <p className="text-micro font-semibold text-cyan-200">快速配置</p>
                <div className="mt-2 space-y-2">
                  <label className="block space-y-1 text-micro text-slate-400">
                    <span className="font-semibold text-slate-300">快速选择套装</span>
                    <select
                      aria-label="快速选择套装"
                      value={quickSetId}
                      onChange={(event) => setQuickSetId(event.target.value)}
                      className={cn("w-full rounded-sm border border-surface-border bg-surface-raised px-2 py-2 text-xs text-slate-200", FOCUS_RING)}
                    >
                      <option value="">选择套装后可一键五件同套</option>
                      {allArtifacts.map((artifact) => (
                        <option key={artifact.id} value={artifact.id}>{artifact.nameZh} · {artifact.rarity}星</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={equipQuickSet}
                      disabled={!quickSetId}
                      className={cn(`${TOUCH_TARGET} flex-1 rounded-sm border border-cyan-300/40 px-2 text-micro font-semibold text-cyan-200 hover:bg-cyan-300/10`, FOCUS_RING, DISABLED)}
                    >
                      五件同套
                    </button>
                    <button
                      type="button"
                      onClick={applyQuickPreset}
                      disabled={assignedSlots.length === 0}
                      className={cn(`${TOUCH_TARGET} flex-1 rounded-sm border border-fuchsia-300/40 px-2 text-micro font-semibold text-fuchsia-200 hover:bg-fuchsia-300/10`, FOCUS_RING, DISABLED)}
                    >
                      套用模板
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      aria-label="快速词条模板"
                      value={quickPreset}
                      onChange={(event) => setQuickPreset(event.target.value as ArtifactStatPresetId)}
                      className={cn("min-w-0 rounded-sm border border-surface-border bg-surface-raised px-2 py-2 text-micro text-slate-200", FOCUS_RING)}
                    >
                      {ARTIFACT_STAT_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>{preset.label}</option>
                      ))}
                    </select>
                    <select
                      aria-label="词条模板应用范围"
                      value={quickPresetScope}
                      onChange={(event) => setQuickPresetScope(event.target.value as "current" | "assigned")}
                      className={cn("min-w-0 rounded-sm border border-surface-border bg-surface-raised px-2 py-2 text-micro text-slate-200", FOCUS_RING)}
                    >
                      <option value="current">当前部位</option>
                      <option value="assigned">已配置部位</option>
                    </select>
                  </div>
                </div>
                <p className="mt-2 text-micro leading-relaxed text-slate-500">模板使用固定演示值，可在右侧继续逐项修改。</p>
              </div>
            </section>

            <section aria-label={`${SLOT_LABELS[selectedSlot]}属性`} className="border-l border-surface-border/70 bg-surface-raised/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border/70 pb-4">
                <div className="flex min-w-0 items-start gap-3">
                  {selectedArtifact && (
                    <ArtifactAvatar
                      iconId={selectedArtifact.iconId}
                      nameZh={`${selectedArtifact.nameZh} · ${SLOT_LABELS[selectedSlot]}`}
                      size="sm"
                      slot={selectedSlot}
                      className="!border-0 !bg-transparent"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-mono text-micro font-semibold uppercase tracking-[0.16em] text-slate-500">03 / 词条详情</p>
                    <h3 className="mt-1 text-balance text-lg font-bold text-slate-50">{selectedArtifact?.nameZh ?? SLOT_LABELS[selectedSlot]}</h3>
                    <p className="mt-1 text-xs text-slate-400">{selectedPiece ? `${SLOT_LABELS[selectedSlot]} · 五星 · +20` : "请选择左侧套装卡"}</p>
                  </div>
                </div>
                {selectedPiece && (
                  <button
                    type="button"
                    onClick={() => clearSlot(selectedSlot)}
                    className={cn(`${TOUCH_TARGET} rounded-sm px-3 text-xs text-slate-400 underline decoration-slate-600 underline-offset-4 hover:bg-cyan-300/5 hover:text-cyan-200`, FOCUS_RING)}
                  >
                    卸下此件
                  </button>
                )}
              </div>

              {selectedArtifact && (
                <div className="mt-4 border-y border-amber-400/20 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <div className="min-w-0">
                      <p className="font-mono text-micro font-semibold uppercase tracking-[0.16em] text-amber-200/80">SET EFFECT</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">套装效果</p>
                    </div>
                    <p className="truncate text-micro text-slate-400">{selectedArtifact.nameZh} · {selectedArtifact.rarity}星</p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {selectedBonuses.map((bonus) => (
                      <div key={bonus.pieces} className="border-l-2 border-emerald-400/60 pl-3">
                        <p className="text-xs font-semibold text-emerald-300">{bonus.pieces}件套</p>
                        <p className="mt-1 text-xs leading-relaxed text-pretty text-slate-300">{bonus.textZh}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPiece ? (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 divide-x divide-surface-border/70 border-y border-surface-border/70">
                    <div className="py-3 pr-3">
                      <p className="font-mono text-micro uppercase tracking-[0.12em] text-slate-500">主词条</p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">{STAT_LABELS[selectedPiece.mainStat.stat] ?? selectedPiece.mainStat.stat}</p>
                      <p className="mt-0.5 font-mono text-base tabular-nums text-amber-200">{formatSelectedStat(selectedPiece.mainStat)}</p>
                    </div>
                    <div className="py-3 pl-3">
                      <p className="font-mono text-micro uppercase tracking-[0.12em] text-slate-500">副词条强化</p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">20级 · 四词条</p>
                      <p className="mt-0.5 font-mono text-base tabular-nums text-cyan-200">+5 次强化</p>
                    </div>
                  </div>
                  <ArtifactStatsEditor
                    slots={[selectedSlot]}
                    slotSetIds={{ [selectedSlot]: selectedPiece.setId }}
                    value={draft}
                    onChange={(next) => setDraft((current) => ({ ...current, ...next }))}
                  />
                </div>
              ) : (
                <p className="mt-4 border-y border-dashed border-surface-border px-3 py-10 text-center text-xs leading-relaxed text-slate-500">
                  选择左侧套装卡后，可在此录入主词条与副词条。
                </p>
              )}
            </section>
          </div>

          {discardPrompt && (
            <div className="sticky bottom-0 z-10 rounded-sm border border-amber-400/40 bg-surface-raised px-4 py-3" role="alertdialog" aria-label="舍弃未保存修改">
              <p className="text-sm font-semibold text-slate-100">有未保存的修改，确定要舍弃吗？</p>
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <button
                  ref={continueRef}
                  type="button"
                  onClick={() => setDiscardPrompt(false)}
                    className={cn(`${TOUCH_TARGET} rounded-sm border border-surface-border px-3 text-xs text-slate-200 hover:border-cyan-400`, FOCUS_RING)}
                >
                  继续编辑
                </button>
                <button
                  type="button"
                  onClick={discardAndClose}
                  className={cn(`${TOUCH_TARGET} rounded-sm border border-cyan-300/70 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/20`, FOCUS_RING)}
                >
                  舍弃并关闭
                </button>
              </div>
            </div>
          )}

          {!discardPrompt && (
            <footer className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-surface-border bg-surface-raised px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
              <div>
                <p className={cn("text-xs", dirty ? "text-amber-300" : "text-slate-400")}>{dirty ? "有未保存修改" : "当前配置已保存"}</p>
                <p className="mt-0.5 text-micro text-slate-500">保存后返回角色装备页</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={requestClose}
                  className={cn(`${TOUCH_TARGET} rounded-sm border border-surface-border px-4 text-xs text-slate-200 hover:border-cyan-400 hover:text-cyan-200`, FOCUS_RING)}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  className={cn(`${TOUCH_TARGET} rounded-sm border border-cyan-300/70 bg-cyan-300/10 px-4 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/20`, FOCUS_RING)}
                >
                  保存配置
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>
    </Dialog>
  );
}
