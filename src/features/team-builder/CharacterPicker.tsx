"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CharacterDefinition, Element } from "@/types";
import { cn } from "@/components/ui/cn";
import { Dialog } from "@/components/ui/Dialog";
import { ElementTag } from "@/components/ui/ElementTag";
import { StatusChip } from "@/components/ui/StatusChip";
import { elementSurfaceClass } from "@/lib/elementSurface";
import {
  computeTierPresentation,
  formatBaseline,
  shouldShowCardReason,
  shouldShowCardTier,
} from "@/features/team-builder/tierPresentation";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar";
import {
  DISABLED,
  FOCUS_RING,
  STATE_CHIP,
  STATE_GLYPH,
  TRANSITION_COLORS,
} from "@/components/ui/tokens";
import { type Team, slotOf } from "@/features/team-builder/teamModel";
import {
  ELEMENT_OPTIONS,
  type ElementFilter,
  RARITY_OPTIONS,
  type RarityFilter,
  WEAPON_OPTIONS,
  type WeaponFilter,
  filterRoster,
  formatSupportTier,
  getCharacterMetadata,
} from "@/features/team-builder/rosterModel";
import { resolvePickerEmptyState } from "@/features/team-builder/pickerEmptyState";
import { charNameZh, elementZh, tierReasonZh, tierZh, weaponZh } from "@/lib/i18n";
import { getCharacterVersion } from "@/game-data/characters/releaseOrder";

interface Props {
  open: boolean;
  /** Slot being filled; drives the dialog title and the "already in slot" copy. */
  slotIndex: number;
  roster: readonly CharacterDefinition[];
  team: Team;
  onSelect: (slotIndex: number, character: CharacterDefinition) => void;
  onClose: () => void;
}

const ELEMENT_PILL_STYLES: Record<Element | "all", { active: string; default: string }> = {
  all: {
    active: "border-amber-500 bg-amber-500/20 text-amber-300 font-semibold",
    default: "border-surface-border text-slate-400 hover:text-slate-200",
  },
  pyro: {
    active: "border-red-500 bg-red-500/20 text-red-300 font-semibold",
    default: "border-red-500/30 text-red-400/80 hover:text-red-300",
  },
  hydro: {
    active: "border-sky-500 bg-sky-500/20 text-sky-300 font-semibold",
    default: "border-sky-500/30 text-sky-400/80 hover:text-sky-300",
  },
  electro: {
    active: "border-purple-500 bg-purple-500/20 text-purple-300 font-semibold",
    default: "border-purple-500/30 text-purple-400/80 hover:text-purple-300",
  },
  anemo: {
    active: "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold",
    default: "border-emerald-500/30 text-emerald-400/80 hover:text-emerald-300",
  },
  cryo: {
    active: "border-cyan-500 bg-cyan-500/20 text-cyan-300 font-semibold",
    default: "border-cyan-500/30 text-cyan-400/80 hover:text-cyan-300",
  },
  geo: {
    active: "border-amber-500 bg-amber-500/20 text-amber-300 font-semibold",
    default: "border-amber-500/30 text-amber-400/80 hover:text-amber-300",
  },
  dendro: {
    active: "border-lime-500 bg-lime-500/20 text-lime-300 font-semibold",
    default: "border-lime-500/30 text-lime-400/80 hover:text-lime-300",
  },
  physical: {
    active: "border-slate-400 bg-slate-400/20 text-slate-200 font-semibold",
    default: "border-slate-600/30 text-slate-400 hover:text-slate-200",
  },
};

/**
 * Character Browser dialog specced in COMPONENTS.md §4 (TASK #029).
 *
 * Supports live search, multi-facet filtering (Element, Weapon, Rarity),
 * Support Tier badges (Full / Partial / Data / Basic), and responsive grid card
 * rendering across all 80+ playable characters in the registry.
 */
const ELEMENT_ORDER: readonly Element[] = [
  "pyro",
  "hydro",
  "anemo",
  "electro",
  "dendro",
  "cryo",
  "geo",
];

const ELEMENT_SECTION_LABELS: Record<Element, string> = {
  pyro: "火元素角色",
  hydro: "水元素角色",
  anemo: "风元素角色",
  electro: "雷元素角色",
  dendro: "草元素角色",
  cryo: "冰元素角色",
  geo: "岩元素角色",
  physical: "物理属性",
};

export function CharacterPicker({
  open,
  slotIndex,
  roster,
  team,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [elementFilter, setElementFilter] = useState<ElementFilter>("all");
  const [weaponFilter, setWeaponFilter] = useState<WeaponFilter>("all");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");

  const searchRef = useRef<HTMLInputElement>(null);
  const slotNumber = slotIndex + 1;

  // Reset filter state when the picker opens for a different slot
  useEffect(() => {
    if (open) {
      setQuery("");
      setElementFilter("all");
      setWeaponFilter("all");
      setRarityFilter("all");
    }
  }, [open, slotIndex]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && open && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const filtered = useMemo(() => {
    return filterRoster(roster, {
      element: elementFilter,
      weapon: weaponFilter,
      rarity: rarityFilter,
      query,
    });
  }, [roster, elementFilter, weaponFilter, rarityFilter, query]);

  const groupedByElement = useMemo(() => {
    const groups: { element: Element; characters: CharacterDefinition[] }[] = [];
    for (const el of ELEMENT_ORDER) {
      const chars = filtered.filter((c) => c.element === el);
      if (chars.length > 0) {
        groups.push({ element: el, characters: chars });
      }
    }
    const remaining = filtered.filter((c) => !ELEMENT_ORDER.includes(c.element));
    if (remaining.length > 0) {
      groups.push({ element: "physical", characters: remaining });
    }
    return groups;
  }, [filtered]);

  // Tier is computed over the WHOLE roster, not the filtered view: the claim
  // "every character in this roster is X" must not change as the user filters.
  const tierPresentation = useMemo(
    () =>
      computeTierPresentation(
        roster.map((c) => {
          const m = getCharacterMetadata(c.id);
          return { supportTier: m.supportTier, tierReason: m.tierReason };
        }),
      ),
    [roster],
  );

  const rosterBaseline = tierPresentation.baseline;

  const hasFacetFilters =
    elementFilter !== "all" || weaponFilter !== "all" || rarityFilter !== "all";

  const hasActiveFilters = hasFacetFilters || query.trim().length > 0;

  // Characters that match but already occupy another slot. Drives the
  // "all taken" empty state, which needs a different remedy from a filter miss.
  const takenCount = useMemo(() => {
    let taken = 0;
    for (const character of filtered) {
      const occupied = slotOf(team, character.id);
      if (occupied !== -1 && occupied !== slotIndex) taken += 1;
    }
    return taken;
  }, [filtered, team, slotIndex]);

  const emptyState = resolvePickerEmptyState({
    rosterSize: roster.length,
    filteredSize: filtered.length,
    query,
    hasFacetFilters,
    takenCount,
  });

  function clearSearchOnly() {
    setQuery("");
    searchRef.current?.focus();
  }

  function clearAllFilters() {
    setQuery("");
    setElementFilter("all");
    setWeaponFilter("all");
    setRarityFilter("all");
    searchRef.current?.focus();
  }

  function renderCharacterCard(character: CharacterDefinition) {
    const occupied = slotOf(team, character.id);
    const takenElsewhere = occupied !== -1 && occupied !== slotIndex;
    const reason = takenElsewhere ? `已在 ${occupied + 1} 号位出战` : null;
    const meta = getCharacterMetadata(character.id);
    const tierBadge = formatSupportTier(meta.supportTier);
    const displayName = charNameZh(character.name) || character.name;
    const displayWeapon = meta.weaponLabelZh || meta.weaponLabel;
    const displayTier = tierZh(meta.supportTier);
    const version = getCharacterVersion(character.id);
    const claim = { supportTier: meta.supportTier, tierReason: meta.tierReason };
    const showCardTier = shouldShowCardTier(claim, tierPresentation);
    const showCardReason = shouldShowCardReason(claim, tierPresentation);

    const elementCardTint = elementSurfaceClass(character.element);

    const accessibleName = `${displayName}, ${elementZh(character.element)}, ${meta.rarity}星, ${displayWeapon}, ${displayTier}${takenElsewhere ? `, 已在 ${occupied + 1} 号位` : ""}`;

    return (
      <li key={character.id}>
        <button
          type="button"
          disabled={takenElsewhere}
          aria-label={accessibleName}
          onClick={() => onSelect(slotIndex, character)}
          className={cn(
            "flex h-full w-full flex-col gap-2 rounded-xl border p-3 text-left",
            elementCardTint,
            TRANSITION_COLORS,
            FOCUS_RING,
            DISABLED,
            !takenElsewhere && "hover:border-amber-400",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <ElementTag element={character.element} />
            {showCardTier && (
              <StatusChip state={tierBadge.state}>{displayTier}</StatusChip>
            )}
          </div>

          <div className="flex items-center gap-3">
            <CharacterAvatar
              characterId={character.id}
              characterName={character.name}
              element={character.element}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              {/* §4.3: prefer wrapping to two lines over truncating. */}
              <div className="line-clamp-2 text-sm font-semibold text-slate-100">
                {displayName}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-micro text-slate-400">
                <span>
                  <span aria-hidden="true">★</span>
                  {meta.rarity}
                </span>
                <span aria-hidden="true">·</span>
                <span>{displayWeapon}</span>
                {version !== undefined && version !== null ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">v{version}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/*
            The caveat is VISIBLE text, never a `title` alone. It renders only
            where this character DEVIATES from the roster-wide claim stated in
            the header — repeating one identical sentence on all 132 cards
            trains the user to ignore the very signal it exists to send.
          */}
          {showCardReason && meta.tierReason !== undefined && (
            <p className="text-micro leading-snug text-slate-300">{tierReasonZh(meta.tierReason)}</p>
          )}

          {reason !== null ? (
            <p className="mt-auto text-micro font-medium text-amber-300">{reason}</p>
          ) : occupied === slotIndex ? (
            <p className="mt-auto text-micro font-medium text-emerald-300">当前已选</p>
          ) : null}
        </button>
      </li>
    );
  }

  return (
    <Dialog
      open={open}
      title={`选择出战角色 — 席位 ${slotNumber}`}
      onClose={onClose}
      initialFocusRef={searchRef}
      size="browse"
    >
      <div className="space-y-4">
        {/*
          The roster-wide support claim, stated ONCE. Verified against the live
          data: all 132 characters currently share one tier and one reason, so
          a per-card chip would repeat this sentence 132 times and carry no
          discriminating information. Cards regain their own chip the moment a
          character deviates (see `tierPresentation`).
        */}
        {rosterBaseline !== null && (
          <div
            className={cn(
              "flex flex-wrap items-start gap-x-2 gap-y-1 rounded-md border px-3 py-2 text-xs",
              STATE_CHIP[formatBaseline(rosterBaseline).state],
            )}
          >
            <span className="font-semibold">
              <span aria-hidden="true">
                {STATE_GLYPH[formatBaseline(rosterBaseline).state]}{" "}
              </span>
              全部角色 · {tierZh(rosterBaseline.supportTier)}
            </span>
            {/*
              A fixed sentence, NOT a per-character `tierReason`. Reasons differ
              per character (each quotes its own constellation counts), so
              presenting any one of them here would state one character's fact
              as the whole roster's. The per-character reason is rendered
              unconditionally on the character detail surface instead.
            */}
            <span className="leading-relaxed">
              命之座与固有天赋尚未纳入伤害计算，各角色的具体缺口见角色详情。
            </span>
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              // A placeholder is not an accessible name: it is dropped by some
              // screen readers and disappears as soon as the user types.
              aria-label="搜索角色"
              placeholder="搜索角色名称、武器类型、或元素（支持中英文，快捷键 /）…"
              className={cn(
                "w-full rounded-xl border border-surface-border bg-surface-raised px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500",
                FOCUS_RING,
              )}
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="清空搜索"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-12 shrink-0 text-slate-400 font-medium">元素:</span>
              <div className="flex flex-wrap gap-1">
                {ELEMENT_OPTIONS.map((opt) => {
                  const active = elementFilter === opt.id;
                  const pillStyles = ELEMENT_PILL_STYLES[opt.id];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setElementFilter(opt.id)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 transition-colors",
                        active ? pillStyles.active : pillStyles.default,
                        FOCUS_RING,
                      )}
                    >
                      {opt.labelZh}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-12 shrink-0 text-slate-400 font-medium">武器:</span>
              <div className="flex flex-wrap gap-1">
                {WEAPON_OPTIONS.map((opt) => {
                  const active = weaponFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setWeaponFilter(opt.id)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 transition-colors",
                        active
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 font-semibold"
                          : "border-surface-border text-slate-400 hover:text-slate-200",
                        FOCUS_RING,
                      )}
                    >
                      {opt.labelZh}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-12 shrink-0 text-slate-400 font-medium">星级:</span>
              <div className="flex flex-wrap gap-1">
                {RARITY_OPTIONS.map((opt) => {
                  const active = rarityFilter === opt.id;
                  return (
                    <button
                      key={String(opt.id)}
                      type="button"
                      onClick={() => setRarityFilter(opt.id)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 transition-colors",
                        active
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 font-semibold"
                          : "border-surface-border text-slate-400 hover:text-slate-200",
                        FOCUS_RING,
                      )}
                    >
                      {opt.labelZh}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between rounded-md border border-surface-border bg-surface-raised/50 px-3 py-1.5 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-1.5">
              <span>已生效筛选:</span>
              {elementFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setElementFilter("all")}
                  className="flex items-center gap-1 rounded-md border border-surface-border bg-surface px-2 py-0.5 text-slate-200 hover:border-slate-400"
                >
                  <span>元素: {elementZh(elementFilter)}</span>
                  <span aria-hidden="true">✕</span>
                </button>
              )}
              {weaponFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setWeaponFilter("all")}
                  className="flex items-center gap-1 rounded-md border border-surface-border bg-surface px-2 py-0.5 text-slate-200 hover:border-slate-400"
                >
                  <span>武器: {weaponZh(weaponFilter)}</span>
                  <span aria-hidden="true">✕</span>
                </button>
              )}
              {rarityFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setRarityFilter("all")}
                  className="flex items-center gap-1 rounded-md border border-surface-border bg-surface px-2 py-0.5 text-slate-200 hover:border-slate-400"
                >
                  <span>星级: {rarityFilter}★</span>
                  <span aria-hidden="true">✕</span>
                </button>
              )}
              {query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex items-center gap-1 rounded-md border border-surface-border bg-surface px-2 py-0.5 text-slate-200 hover:border-slate-400"
                >
                  <span>搜索: “{query.trim()}”</span>
                  <span aria-hidden="true">✕</span>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-amber-400 hover:underline"
            >
              清空筛选
            </button>
          </div>
        )}

        {/* Results exist but every one is already on the team. Shown as a
            banner, not an empty state, because the grid still has content. */}
        {emptyState.kind === "all-taken" && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs",
              STATE_CHIP.info,
            )}
          >
            <span aria-hidden="true">◇</span>
            <span>{emptyState.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-surface-border pb-2 text-xs text-slate-400 font-mono">
          <span aria-live="polite" aria-atomic="true">
            已匹配 {filtered.length} / {roster.length} 位角色
          </span>
          <span>出战席位 {slotNumber} / 4</span>
        </div>

        {emptyState.kind !== "none" && emptyState.kind !== "all-taken" ? (
          <div
            className={cn(
              "rounded-xl border p-6 text-center text-sm",
              emptyState.kind === "roster-error"
                ? STATE_CHIP.error
                : "border-surface-border bg-surface text-slate-400",
            )}
            role={emptyState.kind === "roster-error" ? "alert" : undefined}
          >
            <p>{emptyState.message}</p>
            {emptyState.action === "clear-search" && (
              <button
                type="button"
                onClick={clearSearchOnly}
                className={cn(
                  "mt-3 rounded-md border border-surface-border px-3 py-1.5 text-xs text-amber-400",
                  TRANSITION_COLORS,
                  "hover:border-amber-400/60 hover:text-amber-300",
                  FOCUS_RING,
                )}
              >
                清除搜索词
              </button>
            )}
            {emptyState.action === "clear-filters" && (
              <button
                type="button"
                onClick={clearAllFilters}
                className={cn(
                  "mt-3 rounded-md border border-surface-border px-3 py-1.5 text-xs text-amber-400",
                  TRANSITION_COLORS,
                  "hover:border-amber-400/60 hover:text-amber-300",
                  FOCUS_RING,
                )}
              >
                重置全部筛选条件
              </button>
            )}
          </div>
        ) : elementFilter === "all" ? (
          <div className="space-y-8">
            {groupedByElement.map((group) => {
              const label =
                ELEMENT_SECTION_LABELS[group.element] ?? elementZh(group.element);
              return (
                <section key={group.element} className="space-y-3">
                  <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-surface-border bg-surface/95 px-4 py-2.5 backdrop-blur-md shadow-md">
                    <div className="flex items-center gap-2.5">
                      <ElementTag element={group.element} />
                      <span className="text-sm font-bold text-slate-100">
                        {label}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {group.characters.length} 位角色
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {group.characters.map((character) => renderCharacterCard(character))}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : (
          <ul
            aria-label="出战角色列表"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {filtered.map((character) => renderCharacterCard(character))}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
