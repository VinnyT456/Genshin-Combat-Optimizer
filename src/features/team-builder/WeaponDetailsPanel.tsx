"use client";

import { useMemo, useState, type RefObject } from "react";
import type { WeaponDefinition } from "@/game-data/weapons/types";
import {
  findWeaponBaseAtkAtLevel,
  findWeaponStatsAtLevel,
} from "@/game-data/weapons/registry";
import { generatedWeaponsById } from "@/game-data/weapons/generated";
import {
  REFINEMENTS,
  type Refinement,
  buildPassiveView,
} from "@/features/team-builder/weaponPresentation";
import { passiveEffectRows } from "@/features/team-builder/weaponPassivePresentation";
import { WeaponAvatar } from "@/components/ui/WeaponAvatar";
import { cn } from "@/components/ui/cn";
import { FOCUS_RING } from "@/components/ui/tokens";
import { fmtPercent } from "@/lib/format";
import { weaponZh } from "@/lib/i18n";
import { getWeaponPassiveZh } from "@/lib/weaponPassiveZh";
import {
  DEFAULT_WEAPON_LEVEL,
  isWeaponLevel,
} from "@/features/team-builder/equipmentSelection";

interface Props {
  weapon: WeaponDefinition;
  /** Refinement to use when this is the currently equipped weapon. */
  currentRefinement: Refinement;
  /** Level to use when this is the currently equipped weapon. */
  currentWeaponLevel: number;
  onBack: () => void;
  onConfirm: (refinement: Refinement, weaponLevel: number) => void;
  /** Focus target used when a card opens this detail surface. */
  headingRef?: RefObject<HTMLHeadingElement | null>;
}

/**
 * Detail and build editor for one weapon.
 *
 * The picker is deliberately browse-only. This panel owns the editable
 * weapon-specific state so selecting a card never silently equips a weapon
 * before the user has reviewed its level, refinement and sourced stats.
 */
export function WeaponDetailsPanel({
  weapon,
  currentRefinement,
  currentWeaponLevel,
  onBack,
  onConfirm,
  headingRef,
}: Props) {
  const initialLevel = isWeaponLevel(currentWeaponLevel)
    ? currentWeaponLevel
    : DEFAULT_WEAPON_LEVEL;
  const [refinement, setRefinement] = useState<Refinement>(
    currentRefinement,
  );
  const [weaponLevelDraft, setWeaponLevelDraft] = useState(String(initialLevel));
  const parsedWeaponLevel = Number(weaponLevelDraft);
  const hasValidWeaponLevel = isWeaponLevel(parsedWeaponLevel);
  const weaponLevel = hasValidWeaponLevel ? parsedWeaponLevel : initialLevel;

  const generated = weapon.generatedId
    ? generatedWeaponsById.get(weapon.generatedId)
    : undefined;
  const passiveView = useMemo(
    () => (generated ? buildPassiveView(generated, refinement) : null),
    [generated, refinement],
  );
  const effectRows = passiveView ? passiveEffectRows(passiveView) : [];
  const passiveZh = getWeaponPassiveZh(
    weapon.id,
    weapon.passive?.name ?? "",
    weapon.passive?.desc ?? "",
    refinement,
  );

  const weaponStats = findWeaponStatsAtLevel(weapon.id, weaponLevel);
  // Resolve base ATK independently. A missing substat row must not make a
  // valid base-ATK value disappear, and a missing base-ATK row must never
  // masquerade as the catalog's level-90 projection.
  const baseAtk =
    weaponStats?.baseAtk ??
    findWeaponBaseAtkAtLevel(weapon.id, weaponLevel);
  const substat = weaponStats?.subStat;
  const substatDisplay =
    substat === undefined
      ? "暂无数据"
      : substat.type === "none"
        ? "无"
        : `${substat.labelZh} ${
            substat.type === "elementalMastery"
              ? substat.value
              : fmtPercent(substat.value)
          }`;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-amber-500/35 bg-gradient-to-br from-amber-950/45 via-surface-raised to-surface-raised p-5 shadow-lg shadow-black/20 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="rounded-xl border border-amber-400/35 bg-surface/70 p-1.5 shadow-inner shadow-amber-950/50">
            <WeaponAvatar
              name={weapon.name}
              nameZh={weapon.nameZh}
              weaponType={weapon.weaponType}
              rarity={weapon.rarity}
              iconUrl={weapon.iconUrl}
              size="xl"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-bold tracking-tight text-slate-100 outline-none"
              >
                {weapon.nameZh}
              </h3>
              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">
                {weapon.rarity}★
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="rounded-md border border-surface-border bg-surface/70 px-2 py-1">
                {weaponZh(weapon.weaponType)}
              </span>
              {weapon.version && (
                <span className="rounded-md border border-surface-border bg-surface/70 px-2 py-1">
                  版本 {weapon.version}
                </span>
              )}
              <span className="rounded-md border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 font-mono tabular-nums text-cyan-200">
                {weaponLevel}级 · R{refinement}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-400">
              调整等级与精炼后，确认配置即可写入伤害模拟。
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6">
        <div className="space-y-4">
          <section
            aria-label="武器配置"
            className="space-y-4 rounded-md border border-surface-border bg-surface-raised/70 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-100">等级与精炼</h4>
              <span className="font-mono text-xs tabular-nums text-amber-300">
                {weaponLevel} / 90
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="weapon-detail-level" className="text-xs font-medium text-slate-300">
                  武器等级
                </label>
                <span className="text-micro text-slate-400">1–90级</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="weapon-detail-level"
                  name="weapon-level"
                  aria-label="武器等级"
                  aria-describedby="weapon-detail-level-help"
                  aria-invalid={!hasValidWeaponLevel}
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  min={1}
                  max={90}
                  step={1}
                  value={weaponLevelDraft}
                  onChange={(event) => setWeaponLevelDraft(event.target.value)}
                  onBlur={() => {
                    if (!hasValidWeaponLevel) setWeaponLevelDraft(String(initialLevel));
                  }}
                  className={cn(
                    "w-24 shrink-0 rounded-md border bg-surface px-3 py-2 font-mono text-sm font-semibold tabular-nums text-slate-100",
                    hasValidWeaponLevel
                      ? "border-surface-border"
                      : "border-amber-400/70",
                    FOCUS_RING,
                  )}
                />
                <input
                  aria-label="武器等级滑块"
                  type="range"
                  min={1}
                  max={90}
                  step={1}
                  value={weaponLevel}
                  onChange={(event) => setWeaponLevelDraft(event.target.value)}
                  className="h-2 min-w-0 flex-1 accent-amber-400"
                />
              </div>
              <p id="weapon-detail-level-help" className="text-micro leading-relaxed text-slate-400">
                数值来自已校验的武器成长曲线。请输入 1–90 之间的整数。
              </p>
            </div>

            <div className="space-y-2 border-t border-surface-border/70 pt-4">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="weapon-detail-refinement" className="text-xs font-medium text-slate-300">
                  精炼等级
                </label>
                <span className="text-micro text-slate-400">被动效果同步更新</span>
              </div>
              <select
                id="weapon-detail-refinement"
                name="weapon-refinement"
                aria-label="精炼等级"
                value={refinement}
                onChange={(event) => setRefinement(Number(event.target.value) as Refinement)}
                className={cn(
                  "w-full rounded-md border border-surface-border bg-surface px-3 py-2.5 font-mono text-sm font-semibold tabular-nums text-slate-100",
                  FOCUS_RING,
                )}
              >
                {REFINEMENTS.map((value) => (
                  <option key={value} value={value}>
                    R{value} · 精炼 {value}阶
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section aria-label="武器属性" className="space-y-3 rounded-md border border-surface-border bg-surface-raised/40 p-4">
            <div className="flex items-end justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-100">当前等级属性 · {weaponLevel}级</h4>
            </div>
            <dl className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-surface-border bg-surface/80 p-3">
                <dt className="text-micro text-slate-400">基础攻击力</dt>
                <dd className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-100">
                  {baseAtk ?? "—"}
                </dd>
                {baseAtk === undefined && (
                  <p className="mt-1 text-micro leading-relaxed text-slate-400">
                    当前等级暂无已校验数据。
                  </p>
                )}
              </div>
              <div className="rounded-md border border-amber-400/25 bg-amber-500/10 p-3">
                <dt className="text-micro font-medium text-amber-200/80">武器副词条</dt>
                <dd className="mt-1 break-words font-mono text-xl font-bold leading-tight tabular-nums text-amber-200">
                  {substatDisplay}
                </dd>
                {substat === undefined && (
                  <p className="mt-1 text-micro leading-relaxed text-slate-400">
                    当前等级暂无已校验数据，模拟不会使用其他等级数值。
                  </p>
                )}
              </div>
            </dl>
          </section>
        </div>

        <section aria-label="武器被动" className="flex flex-col rounded-md border border-cyan-500/25 bg-gradient-to-b from-cyan-950/25 to-surface-raised/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-micro font-semibold uppercase tracking-[0.18em] text-cyan-300/80">武器特效</p>
              <h4 className="mt-1 text-lg font-semibold text-cyan-100">
                {weapon.passive ? passiveZh.nameZh : "暂无可展示的武器特效"}
              </h4>
            </div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs tabular-nums text-cyan-200">
              R{refinement}
            </span>
          </div>
          {weapon.passive ? (
            <>
              <p className="mt-4 max-w-[42em] text-sm leading-[22px] text-pretty text-slate-300">
                {passiveZh.descZh}
              </p>
              {effectRows.length > 0 && (
                <div className="mt-5 border-t border-cyan-500/20 pt-4">
                  <h5 className="text-xs font-semibold text-cyan-100">当前精炼数值</h5>
                  <ul className="mt-3 space-y-2">
                    {effectRows.map((row) => (
                      <li key={row.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-md border border-cyan-500/10 bg-surface/35 px-3 py-2 text-xs">
                        <span className="text-slate-300">{row.label}</span>
                        <span className="font-mono font-semibold tabular-nums text-slate-100">{row.value}</span>
                        <span className="text-slate-400">· {row.scope}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-slate-400">暂无可展示的武器特效。</p>
          )}
        </section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-2 border-t border-surface-border bg-surface-raised/95 px-1 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:flex-row sm:items-center sm:justify-end">
        {baseAtk === undefined && (
          <p className="mr-auto text-xs leading-relaxed text-amber-300">
            当前等级缺少基础攻击力数据，暂无法装备。
          </p>
        )}
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "min-h-11 rounded-md border border-surface-border bg-surface px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-400 hover:text-slate-100",
            FOCUS_RING,
          )}
        >
          返回武器列表
        </button>
        <button
          type="button"
          disabled={baseAtk === undefined || !hasValidWeaponLevel}
          onClick={() => {
            if (baseAtk !== undefined && hasValidWeaponLevel) {
              onConfirm(refinement, weaponLevel);
            }
          }}
          className={cn(
            "min-h-11 rounded-md border border-amber-400/60 bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50",
            FOCUS_RING,
          )}
        >
          装备此武器
        </button>
      </div>
    </div>
  );
}
