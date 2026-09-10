"use client";

import { useMemo, useRef, useState } from "react";
import type { WeaponDefinition, WeaponType } from "@/game-data/weapons/types";
import { allWeapons } from "@/game-data/weapons/registry";
import {
  type WeaponRarityFilter,
  filterWeapons,
} from "@/features/team-builder/weaponModel";
import { generatedWeaponsById } from "@/game-data/weapons/generated";
import {
  REFINEMENTS,
  type Refinement,
  buildPassiveView,
} from "@/features/team-builder/weaponPresentation";
import {
  passiveEffectRows,
} from "@/features/team-builder/weaponPassivePresentation";
import { Dialog } from "@/components/ui/Dialog";
import { WeaponAvatar } from "@/components/ui/WeaponAvatar";
import { cn } from "@/components/ui/cn";
import { DISABLED, FOCUS_RING } from "@/components/ui/tokens";
import { fmtPercent } from "@/lib/format";
import { weaponZh } from "@/lib/i18n";
import { getWeaponPassiveZh } from "@/lib/weaponPassiveZh";
import { DEFAULT_REFINEMENT } from "@/features/team-builder/equipmentSelection";

interface Props {
  open: boolean;
  characterName: string;
  weaponType: WeaponType;
  currentWeaponId?: string;
  /**
   * Refinement the character already owns the current weapon at.
   *
   * The picker OPENS here rather than at R1, and the value is handed back on
   * select. Previously the refinement was browse-only state that was discarded
   * when a weapon was chosen, so every equipped weapon simulated at R1 no
   * matter which refinement the user had been reading — and reopening the
   * picker showed R1 for a weapon the slot labelled R5.
   */
  currentRefinement?: Refinement;
  onClose: () => void;
  onSelect: (weapon: WeaponDefinition, refinement: Refinement) => void;
}

const RARITY_OPTIONS: readonly { id: WeaponRarityFilter; label: string }[] = [
  { id: "all", label: "全部品质" },
  { id: 5, label: "5★ 武器" },
  { id: 4, label: "4★ 武器" },
];

export function WeaponPicker({
  open,
  characterName,
  weaponType,
  currentWeaponId,
  currentRefinement = DEFAULT_REFINEMENT,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<WeaponRarityFilter>("all");
  const [expandedPassives, setExpandedPassives] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(false);
  // One refinement applies to the whole browse list: the user is comparing
  // weapons at a refinement they own, and per-card state would make two cards
  // silently describe different ownership.
  const [refinement, setRefinement] = useState<Refinement>(currentRefinement);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const availableWeapons = useMemo(() => {
    return allWeapons.filter((w) => w.weaponType === weaponType);
  }, [weaponType]);

  const filtered = useMemo(() => {
    return filterWeapons(availableWeapons, {
      weaponType,
      rarity: rarityFilter,
      query,
    });
  }, [availableWeapons, weaponType, rarityFilter, query]);

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

  const weaponTypeLabel = weaponZh(weaponType);

  return (
    <Dialog
      open={open}
      title={`选择武器 — ${characterName} (${weaponTypeLabel})`}
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
              aria-label="搜索武器"
              placeholder="搜索武器名称（中文/英文）、副属性（如：暴击率、充能）、特效说明…"
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
                Refinement is an INDEX into per-refinement data, never
                arithmetic on R1, so the control changes which row is read.
              */}
              <label
                htmlFor="weapon-refinement"
                className="text-xs font-medium text-slate-400"
              >
                精炼等级:
              </label>
              <select
                id="weapon-refinement"
                value={refinement}
                onChange={(e) => setRefinement(Number(e.target.value) as Refinement)}
                className={cn(
                  "rounded-md border border-surface-border bg-surface px-2 py-1.5 text-xs font-mono tabular-nums text-slate-200",
                  FOCUS_RING,
                )}
              >
                {REFINEMENTS.map((r) => (
                  <option key={r} value={r}>
                    R{r}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={toggleAllPassives}
                className="rounded-md border border-surface-border bg-surface px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-amber-400 hover:text-amber-300"
              >
                {allExpanded ? "收起全部特效" : "展开全部特效"}
              </button>
            </div>
          </div>
        </div>

        {/* Counter header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-2 text-xs text-slate-400 font-mono">
          <span>
            按游戏上线版本顺序排列 · 匹配到 {filtered.length} / {availableWeapons.length} 把{weaponTypeLabel} (仅限 4★ 及以上)
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

        {/* Weapons Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-surface-border bg-surface p-8 text-center text-sm text-slate-400">
            <p>未找到符合条件的武器。</p>
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
            {filtered.map((w) => {
              const isEquipped = currentWeaponId === w.id;
              const isExpanded = allExpanded || Boolean(expandedPassives[w.id]);
              const passiveZh = getWeaponPassiveZh(
                w.id,
                w.passive?.name ?? "",
                w.passive?.desc ?? "",
              );
              // The verified per-refinement view. Absent only when the weapon
              // publishes no passive at all; a missing row is never filled in
              // from R1.
              const generated = w.generatedId
                ? generatedWeaponsById.get(w.generatedId)
                : undefined;
              const passiveView = generated
                ? buildPassiveView(generated, refinement)
                : null;
              const effectRows = passiveView
                ? passiveEffectRows(passiveView)
                : [];

              const subStatDisplay =
                w.subStat.type === "none"
                  ? "无"
                  : `${w.subStat.labelZh} ${
                      w.subStat.type === "elementalMastery"
                        ? w.subStat.value
                        : fmtPercent(w.subStat.value)
                    }`;

              return (
                <li key={w.id} className="flex">
                  <div
                    onClick={() => onSelect(w, refinement)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(w, refinement);
                      }
                    }}
                    className={cn(
                      "flex h-full w-full flex-col gap-3 rounded-md border p-4 text-left transition-colors cursor-pointer",
                      isEquipped
                        ? "border-amber-400 bg-amber-950/20 ring-1 ring-amber-400 shadow-md"
                        : "border-surface-border bg-surface-raised hover:border-amber-400/80 hover:-translate-y-0.5 hover:shadow-lg",
                      FOCUS_RING,
                      DISABLED,
                    )}
                  >
                    {/* Header: Rarity, Version, Type */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-bold border",
                            w.rarity === 5
                              ? "bg-amber-400/15 text-amber-300 border-amber-500/30"
                              : "bg-purple-400/15 text-purple-300 border-purple-500/30",
                          )}
                        >
                          {w.rarity}★
                        </span>
                        {w.version && (
                          <span className="rounded bg-surface px-1.5 py-0.5 border border-surface-border text-micro font-mono text-slate-400">
                            v{w.version}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {weaponTypeLabel}
                      </span>
                    </div>

                    {/* Avatar & Title */}
                    <div className="flex items-center gap-3">
                      <WeaponAvatar
                        name={w.name}
                        nameZh={w.nameZh}
                        rarity={w.rarity}
                        iconUrl={w.iconUrl}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate text-base font-bold text-slate-100"
                          title={w.nameZh}
                        >
                          {w.nameZh}
                        </div>
                        <div
                          className="truncate text-xs text-slate-400 mt-0.5"
                        >
                          {w.rarity}星 · {weaponTypeLabel} (90级)
                        </div>
                      </div>
                    </div>

                    {/* High-visibility Stats Display */}
                    <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-surface/90 px-3.5 py-2.5 border border-surface-border/60">
                      <div className="flex flex-col justify-center">
                        <span className="text-micro font-medium text-slate-400">
                          基础攻击力 (90级)
                        </span>
                        <span className="text-base font-bold font-mono text-slate-100 mt-0.5">
                          {w.baseAtk}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center border-l border-surface-border/60 pl-2.5">
                        <span className="text-micro font-medium text-slate-400">
                          副属性 (90级)
                        </span>
                        <span
                          className={cn(
                            "text-base font-bold font-mono truncate mt-0.5",
                            w.subStat.type.includes("crit")
                              ? "text-amber-300"
                              : w.subStat.type.includes("Recharge")
                                ? "text-sky-300"
                                : "text-emerald-300",
                          )}
                          title={subStatDisplay}
                        >
                          {subStatDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Weapon Passive Section with Expand/Collapse */}
                    {passiveZh.descZh ? (
                      <div className="rounded-xl border border-surface-border/40 bg-surface/50 p-2.5 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-amber-300">
                            特效: {passiveZh.nameZh}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => togglePassive(w.id, e)}
                            className="text-micro text-sky-400 hover:underline shrink-0"
                          >
                            {isExpanded ? "收起 ▲" : "展开特效 ▼"}
                          </button>
                        </div>
                        {/*
                          Source prose is ALWAYS rendered, for every weapon.
                          "Not simulated" must never mean "not shown" — the
                          text is the only thing a user has when the effect has
                          no channel.
                        */}
                        <p
                          className={cn(
                            "text-slate-300 leading-relaxed",
                            !isExpanded && "line-clamp-2",
                          )}
                        >
                          {passiveView ? passiveView.text : passiveZh.descZh}
                        </p>

                        <div className="mt-1.5 space-y-1.5">
                          <div className="text-micro text-slate-400">
                            精炼{" "}
                            <span className="font-mono tabular-nums">
                              {passiveView?.refinement}
                            </span>
                            {passiveView?.singleRow ? "（各精炼相同）" : null}
                          </div>

                          {/*
                            Structured grants, each with the SCOPE it is
                            confined to. Dropping the scope would turn a
                            Normal-Attack-only bonus into a global one.
                          */}
                          {effectRows.length > 0 ? (
                            <ul className="space-y-0.5">
                              {effectRows.map((row) => (
                                <li
                                  key={row.id}
                                  className="flex flex-wrap items-baseline gap-x-1.5 text-micro"
                                >
                                  <span className="text-slate-300">
                                    {row.label}
                                  </span>
                                  <span className="font-mono tabular-nums font-semibold text-slate-100">
                                    {row.value}
                                  </span>
                                  <span className="text-slate-400">
                                    · {row.scope}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {/* Bottom Equip Action */}
                    <div className="mt-auto flex items-center justify-between border-t border-surface-border/50 pt-2 text-xs">
                      {isEquipped ? (
                        <span className="font-semibold text-amber-400 flex items-center gap-1">
                          <span>✓</span>
                          <span>当前装备中</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium group-hover:text-amber-300">
                          点击装配此武器
                        </span>
                      )}
                      <span className="text-micro text-slate-400 font-mono">
                        {w.rarity}星{weaponTypeLabel}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
