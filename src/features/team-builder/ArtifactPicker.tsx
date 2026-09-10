"use client";

import { useMemo, useRef, useState } from "react";
import type { ArtifactSetDefinition } from "@/game-data/artifacts/types";
import { allArtifacts } from "@/game-data/artifacts/registry";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { DISABLED, FOCUS_RING } from "@/components/ui/tokens";
import { ArtifactAvatar } from "@/components/ui/ArtifactAvatar";
import { filterArtifacts } from "@/features/team-builder/artifactModel";
import {
  ARTIFACT_FOUR_PIECE,
  ARTIFACT_TWO_PIECE,
} from "@/features/team-builder/artifactSupportPresentation";
import {
  ARTIFACT_PIECE_COUNTS,
  type ArtifactPieceCount,
  DEFAULT_ARTIFACT_PIECES,
} from "@/features/team-builder/equipmentSelection";

/** Piece counts the picker renders, in the order the game presents them. */
const TWO_PIECE = ARTIFACT_TWO_PIECE;
const FOUR_PIECE = ARTIFACT_FOUR_PIECE;
const ONE_PIECE = 1;

interface Props {
  open: boolean;
  characterName: string;
  currentArtifactId?: string | null;
  /**
   * How many pieces of the current set the character wears.
   *
   * The picker OPENS at this count and hands it back on select. It is a real
   * simulation input: `activeSetBonusKeys()` gates the 4pc tier on the count,
   * so a set chosen without one has no tier active and grants nothing.
   */
  currentPieces?: ArtifactPieceCount;
  onClose: () => void;
  onSelect: (
    artifact: ArtifactSetDefinition | null,
    pieces: ArtifactPieceCount,
  ) => void;
}

export type ArtifactRarityFilter = "all" | 4 | 5;

const RARITY_OPTIONS: readonly { id: ArtifactRarityFilter; label: string }[] = [
  { id: "all", label: "全部品质" },
  { id: 5, label: "5★ 圣遗物" },
  { id: 4, label: "4★ 圣遗物" },
];

export function ArtifactPicker({
  open,
  characterName,
  currentArtifactId,
  currentPieces = DEFAULT_ARTIFACT_PIECES,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  // One piece count applies to the whole browse list, for the same reason the
  // weapon picker keeps one refinement: the user is comparing sets at an
  // ownership they have, and per-card state would let two cards silently
  // describe different builds.
  const [pieces, setPieces] = useState<ArtifactPieceCount>(currentPieces);
  const [rarityFilter, setRarityFilter] = useState<ArtifactRarityFilter>("all");
  const [expandedPassives, setExpandedPassives] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    // `filterArtifacts` already returns the rarity-then-name order the header
    // states; wrapping it in `sortArtifacts` again was a redundant second pass.
    return filterArtifacts(allArtifacts, { rarity: rarityFilter, query });
  }, [rarityFilter, query]);

  function clearFilters() {
    setQuery("");
    setRarityFilter("all");
    searchRef.current?.focus();
  }

  function togglePassive(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedPassives((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function toggleAllPassives() {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const nextMap: Record<string, boolean> = {};
    for (const w of filtered) {
      nextMap[w.id] = nextState;
    }
    setExpandedPassives(nextMap);
  }

  return (
    <Dialog
      open={open}
      title={`选择圣遗物 — ${characterName}`}
      onClose={onClose}
      initialFocusRef={searchRef}
      size="browse"
    >
      <div className="space-y-4">
        {/* Search and Filters Header */}
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="搜索圣遗物"
              placeholder="搜索圣遗物名称（中文/英文）…"
              className={cn(
                "w-full rounded-xl border border-surface-border bg-surface-raised px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500",
                FOCUS_RING,
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="清空搜索"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                清除
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">品质筛选:</span>
              {RARITY_OPTIONS.map((opt) => {
                const active = rarityFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRarityFilter(opt.id)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : "bg-surface border border-surface-border text-slate-300 hover:bg-surface-raised",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/*
                The piece count GATES which tier is live: `activeSetBonusKeys()`
                grants the 4pc bonus at four pieces and not at three, so this
                control changes the simulation and not just the reading order.
              */}
              <label
                htmlFor="artifact-pieces"
                className="text-xs font-medium text-slate-400"
              >
                装备件数:
              </label>
              <select
                id="artifact-pieces"
                value={pieces}
                onChange={(e) =>
                  setPieces(Number(e.target.value) as ArtifactPieceCount)
                }
                className={cn(
                  "rounded-md border border-surface-border bg-surface px-2 py-1.5 text-xs font-mono tabular-nums text-slate-200",
                  FOCUS_RING,
                )}
              >
                {ARTIFACT_PIECE_COUNTS.map((count) => (
                  <option key={count} value={count}>
                    {count} 件套
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={toggleAllPassives}
                className="rounded-md border border-surface-border bg-surface px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-amber-400 hover:text-amber-300"
              >
                {allExpanded ? "收起全部" : "展开全部"}
              </button>
            </div>
          </div>
        </div>

        {/* Counter header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-2 text-xs text-slate-400 font-mono">
          <span>
            按品质及中文名称排列 · 匹配到 {filtered.length} / {allArtifacts.length} 套圣遗物
          </span>
          {query || rarityFilter !== "all" ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-amber-400 hover:underline"
            >
              清空筛选
            </button>
          ) : null}
        </div>

        {/* Artifact Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-surface-border bg-surface p-8 text-center text-sm text-slate-400">
            <p>未找到符合条件的圣遗物。</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 text-xs text-amber-400 hover:underline"
            >
              重置筛选条件
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((a) => {
              const isEquipped = currentArtifactId === a.id;
              const isExpanded = allExpanded || Boolean(expandedPassives[a.id]);
              const bonus1pc = a.bonuses.find((b) => b.pieces === ONE_PIECE)?.descriptionZh;
              const bonus2pc = a.bonuses.find((b) => b.pieces === TWO_PIECE)?.descriptionZh;
              const bonus4pc = a.bonuses.find((b) => b.pieces === FOUR_PIECE)?.descriptionZh;
              return (
                <li key={a.id} className="flex">
                  <article
                    className={cn(
                      "flex h-full w-full flex-col gap-3 rounded-md border p-4 text-left transition-colors cursor-pointer",
                      isEquipped
                        ? "border-amber-400 bg-amber-950/20 ring-1 ring-amber-400 shadow-md"
                        : "border-surface-border bg-surface-raised hover:border-amber-400/80 hover:-translate-y-0.5 hover:shadow-lg",
                      FOCUS_RING,
                      DISABLED,
                    )}
                  >
                    {/* Header: rarity. No version badge — no artifact source
                        publishes a release version, so `a.version` is always
                        undefined and the badge could never render.
                        `artifactModel.test.ts` pins that fact. */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-bold border",
                            a.rarity === 5
                              ? "bg-amber-400/15 text-amber-300 border-amber-500/30"
                              : "bg-purple-400/15 text-purple-300 border-purple-500/30",
                          )}
                        >
                          {a.rarity}★
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        圣遗物
                      </span>
                    </div>

                    <ArtifactAvatar iconId={a.iconId} nameZh={a.nameZh} size="sm" />

                    {/* Title */}
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-base font-bold text-slate-100"
                        title={a.nameZh}
                      >
                        {a.nameZh}
                      </div>
                      <div
                        className="truncate text-xs text-slate-400 mt-0.5"
                      >
                        {a.rarity}星 · 圣遗物套装
                      </div>
                    </div>

                    {/* 1pc */}
                    {bonus1pc && (
                      <div className="rounded-xl bg-surface/90 px-3.5 py-2.5 border border-surface-border/60">
                        <div className="flex items-center justify-between gap-2 text-micro font-medium text-slate-400">
                          <span>1件套</span>
                        </div>
                        <div className="text-xs font-medium text-amber-300 mt-0.5 truncate" title={bonus1pc}>
                          {bonus1pc}
                        </div>
                      </div>
                    )}

                    {/* 2pc */}
                    {bonus2pc && (
                      <div className="rounded-xl bg-surface/90 px-3.5 py-2.5 border border-surface-border/60">
                        <div className="flex items-center justify-between gap-2 text-micro font-medium text-slate-400">
                          <span>2件套</span>
                        </div>
                        <div className="text-xs font-medium text-amber-300 mt-0.5 truncate" title={bonus2pc}>
                          {bonus2pc}
                        </div>
                      </div>
                    )}

                    {/* 4pc */}
                    {bonus4pc && (
                      <div className="rounded-xl border border-surface-border/40 bg-surface/50 p-2.5 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-amber-300">
                            4件套
                          </span>
                          <button
                            type="button"
                            onClick={(e) => togglePassive(a.id, e)}
                            className="text-micro text-sky-400 hover:underline shrink-0"
                          >
                            {isExpanded ? "收起 ▲" : "展开4件套效果 ▼"}
                          </button>
                        </div>
                        <p
                          className={cn(
                            "text-slate-300 leading-relaxed",
                            !isExpanded && "line-clamp-2",
                          )}
                        >
                          {bonus4pc}
                        </p>
                      </div>
                    )}

                    {/* Bottom Equip Action: standalone control keeps the card semantic. */}
                    <div className="mt-auto flex items-center justify-between border-t border-surface-border/50 pt-2 text-xs">
                      {isEquipped ? (
                        <button type="button" onClick={() => onSelect(null, pieces)} className="font-semibold text-amber-400 flex items-center gap-1 hover:underline">
                          <span>✓ 当前装备中 (点击卸下)</span>
                        </button>
                      ) : (
                        <button type="button" onClick={() => onSelect(a, pieces)} className="text-slate-300 font-medium hover:text-amber-300 hover:underline">
                          点击装配此套装
                        </button>
                      )}
                      <span className="text-micro text-slate-400 font-mono">
                        {a.rarity}星套装
                      </span>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
