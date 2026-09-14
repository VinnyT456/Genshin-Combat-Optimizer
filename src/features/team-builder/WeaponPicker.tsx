"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WeaponDefinition, WeaponType } from "@/game-data/weapons/types";
import {
  allWeapons,
  findWeaponBaseAtkAtLevel,
  findWeaponStatsAtLevel,
} from "@/game-data/weapons/registry";
import {
  type WeaponRarityFilter,
  filterWeapons,
} from "@/features/team-builder/weaponModel";
import type { Refinement } from "@/features/team-builder/weaponPresentation";
import { Dialog } from "@/components/ui/Dialog";
import { WeaponAvatar } from "@/components/ui/WeaponAvatar";
import { cn } from "@/components/ui/cn";
import { FOCUS_RING } from "@/components/ui/tokens";
import { fmtPercent } from "@/lib/format";
import { weaponZh } from "@/lib/i18n";
import { getWeaponPassiveZh } from "@/lib/weaponPassiveZh";
import {
  DEFAULT_REFINEMENT,
  DEFAULT_WEAPON_LEVEL,
} from "@/features/team-builder/equipmentSelection";
import { WeaponDetailsPanel } from "@/features/team-builder/WeaponDetailsPanel";
import { LiveRegion } from "@/components/ui/LiveRegion";

interface Props {
  open: boolean;
  characterName: string;
  weaponType: WeaponType;
  currentWeaponId?: string;
  /**
   * Refinement the character already owns the current weapon at.
   *
   * The selected weapon's detail page OPENS here rather than at R1, and the
   * value is handed back only after the user confirms the build.
   */
  currentRefinement?: Refinement;
  /** Current weapon level. Older selections default to level 90. */
  currentWeaponLevel?: number;
  onClose: () => void;
  onSelect: (
    weapon: WeaponDefinition,
    refinement: Refinement,
    weaponLevel: number,
  ) => void;
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
  currentWeaponLevel = DEFAULT_WEAPON_LEVEL,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<WeaponRarityFilter>("all");
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const previousSelectedWeaponId = useRef<string | null>(null);

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

  const weaponTypeLabel = weaponZh(weaponType);
  const selectedWeapon = selectedWeaponId
    ? allWeapons.find((weapon) => weapon.id === selectedWeaponId)
    : undefined;
  const detailsRefinement =
    selectedWeapon?.id === currentWeaponId
      ? currentRefinement
      : DEFAULT_REFINEMENT;
  const detailsWeaponLevel =
    selectedWeapon?.id === currentWeaponId
      ? currentWeaponLevel
      : DEFAULT_WEAPON_LEVEL;

  useEffect(() => {
    if (selectedWeapon) {
      detailHeadingRef.current?.focus();
      setAnnouncement(`已打开${selectedWeapon.nameZh}详情。`);
      previousSelectedWeaponId.current = selectedWeapon.id;
      return;
    }

    const previousId = previousSelectedWeaponId.current;
    if (previousId !== null) {
      cardRefs.current[previousId]?.focus();
      setAnnouncement("已返回武器列表。");
      previousSelectedWeaponId.current = null;
    }
  }, [selectedWeapon]);

  return (
    <Dialog
      open={open}
      title={
        selectedWeapon
          ? `武器详情 · ${selectedWeapon.nameZh}`
          : `选择武器 — ${characterName}（${weaponTypeLabel}）`
      }
      onClose={onClose}
      initialFocusRef={selectedWeapon ? undefined : searchRef}
      size="browse"
      className={selectedWeapon ? "sm:!max-w-6xl sm:!h-[88vh]" : undefined}
    >
      {selectedWeapon ? (
        <WeaponDetailsPanel
          key={selectedWeapon.id}
          weapon={selectedWeapon}
          currentRefinement={detailsRefinement}
          currentWeaponLevel={detailsWeaponLevel}
          onBack={() => setSelectedWeaponId(null)}
          headingRef={detailHeadingRef}
          onConfirm={(refinement, weaponLevel) =>
            onSelect(selectedWeapon, refinement, weaponLevel)
          }
        />
      ) : (
        <div className="space-y-4">
        {/* Search and Filters Header */}
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={searchRef}
              type="search"
              name="weapon-search"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="搜索武器"
              placeholder="搜索武器名称、副属性或特效…"
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
              <fieldset className="flex flex-wrap items-center gap-2">
                <legend className="text-xs font-medium text-slate-400">品质筛选</legend>
              {RARITY_OPTIONS.map((opt) => {
                const active = rarityFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setRarityFilter(opt.id)}
                    className={cn(
                      "min-h-11 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:min-h-0",
                      FOCUS_RING,
                      active
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : "bg-surface border border-surface-border text-slate-300 hover:bg-surface-raised",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
              </fieldset>
            </div>

            <span className="text-xs text-slate-400">选择武器后可调整等级与精炼。</span>
          </div>
        </div>

        {/* Counter header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-2 text-xs text-slate-400">
          <span aria-live="polite">
            共 <span className="font-mono tabular-nums">{availableWeapons.length}</span> 把{weaponTypeLabel}，当前显示 <span className="font-mono tabular-nums">{filtered.length}</span> 把 · 仅含 4★、5★
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
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((w) => {
              const isEquipped = currentWeaponId === w.id;
              const passiveZh = getWeaponPassiveZh(
                w.id,
                w.passive?.name ?? "",
                w.passive?.desc ?? "",
                DEFAULT_REFINEMENT,
              );
              // List cards are browse-only. Details are resolved after a
              // weapon is selected, so every number here is a neutral level-90
              // preview and never an implicit equipment choice.
              const weaponStats = findWeaponStatsAtLevel(w.id, DEFAULT_WEAPON_LEVEL);
              const displayBaseAtk =
                weaponStats?.baseAtk ??
                findWeaponBaseAtkAtLevel(w.id, DEFAULT_WEAPON_LEVEL) ??
                w.baseAtk;
              const displaySubStat = weaponStats?.subStat;

              const subStatDisplay =
                displaySubStat === undefined
                  ? "暂无数据"
                  : displaySubStat.type === "none"
                    ? "无"
                    : `${displaySubStat.labelZh} ${
                        displaySubStat.type === "elementalMastery"
                          ? displaySubStat.value
                          : fmtPercent(displaySubStat.value)
                      }`;

              return (
                <li key={w.id} className="flex">
                  <button
                    ref={(element) => {
                      cardRefs.current[w.id] = element;
                    }}
                    type="button"
                    onClick={() => setSelectedWeaponId(w.id)}
                    role="button"
                    aria-label={`${w.nameZh}，${w.rarity}星，${weaponTypeLabel}${isEquipped ? "，当前装备" : ""}，查看详情`}
                    className={cn(
                      "flex h-full w-full flex-col gap-3 rounded-md border p-4 text-left transition-colors",
                      isEquipped
                        ? "border-amber-400 bg-amber-950/20 ring-1 ring-amber-400 shadow-md"
                        : "border-surface-border bg-surface-raised hover:border-amber-400/80 hover:bg-surface-hover",
                      FOCUS_RING,
                      "active:translate-y-px",
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
                          {w.rarity}星 · {weaponTypeLabel}
                        </div>
                      </div>
                    </div>

                    {/* Weapon stats preview. Each stat gets its own compact
                        cell so its label, value, and level stay readable. */}
                    <div
                      aria-label={`武器属性预览，${DEFAULT_WEAPON_LEVEL}级`}
                      className="rounded-md border border-surface-border/60 bg-surface/90 p-2.5"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <div className="text-micro font-semibold text-slate-300">属性预览</div>
                        <span className="font-mono text-micro tabular-nums text-slate-400">
                          {DEFAULT_WEAPON_LEVEL}级
                        </span>
                      </div>
                      <dl className="grid grid-cols-2 gap-1.5">
                        <div className="min-w-0 rounded-md border border-surface-border/50 bg-surface/50 px-2 py-1.5">
                          <dt className="text-micro text-slate-400">基础攻击力</dt>
                          <dd className="mt-0.5 truncate font-mono text-base font-bold tabular-nums text-slate-100">
                            {displayBaseAtk}
                          </dd>
                        </div>
                        <div className="min-w-0 rounded-md border border-amber-400/25 bg-amber-500/10 px-2 py-1.5">
                          <dt className="text-micro font-medium text-amber-200/80">武器副词条</dt>
                          <dd
                            className={cn(
                              "mt-0.5 break-words font-mono text-sm font-bold leading-tight tabular-nums",
                              displaySubStat?.type.includes("crit")
                                ? "text-amber-200"
                                : displaySubStat?.type.includes("energyRecharge")
                                  ? "text-sky-200"
                                  : "text-emerald-200",
                            )}
                            title={subStatDisplay}
                          >
                            {subStatDisplay}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Passive preview; full refinement details live on the
                        selected weapon's detail page. */}
                    {passiveZh.descZh ? (
                      <div className="rounded-xl border border-surface-border/40 bg-surface/50 p-2.5 text-xs">
                        <div className="mb-1 font-bold text-amber-300">
                          特效：{passiveZh.nameZh}
                        </div>
                        <p className="line-clamp-2 text-slate-300 leading-relaxed">
                          {passiveZh.descZh}
                        </p>
                      </div>
                    ) : null}

                    {/* Bottom Equip Action */}
                    <div className="mt-auto flex items-center justify-between border-t border-surface-border/50 pt-2 text-xs">
                      {isEquipped ? (
                        <span className="font-semibold text-amber-400 flex items-center gap-1">
                          <span>当前装备</span>
                      </span>
                    ) : (
                        <span className="text-slate-400 font-medium">
                          查看详情
                        </span>
                      )}
                      <span className="text-micro text-slate-400 font-mono">
                        {w.rarity}星{weaponTypeLabel}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      )}
      <LiveRegion message={announcement} />
    </Dialog>
  );
}
