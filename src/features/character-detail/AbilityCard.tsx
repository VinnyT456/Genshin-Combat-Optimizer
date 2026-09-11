"use client";

import type { KitAbility } from "@/simulation/character/kit";
import { cn } from "@/components/ui/cn";
import { FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";
import { elementTextClass } from "@/lib/format";
import { elementZh } from "@/lib/i18n";
import {
  TALENT_LEVELS,
  buildAbilityDetail,
  hasLevelVariation,
} from "./abilityDetailModel";
import { clampTalentLevel } from "@/features/team-builder/characterProgression";

/** Fraction -> percentage string. 1.944 -> "194.4%". */
const PERCENT_DECIMALS = 1;

function fmtMultiplier(fraction: number): string {
  return `${(fraction * 100).toFixed(PERCENT_DECIMALS)}%`;
}

/** Product-facing label for a generated damage instance. */
export function hitLabel(index: number): string {
  return `第${index + 1}段`;
}

interface Props {
  ability: KitAbility;
  /** Source-backed Chinese talent copy; absent only for non-roster fixtures. */
  nameZh?: string;
  descriptionZh?: string;
  /** Chinese slot label, e.g. "元素战技". */
  slotLabel: string;
  /** The level the user chose. This is what gets saved to the build. */
  level: number;
  /**
   * Extra levels an unlocked constellation grants this slot.
   *
   * The ENGINE applies this (via `talentLevelResolver`), so it must never be
   * folded into `level` or written back through `onLevelChange` — that would
   * apply it twice. It is passed separately so the multiplier table can be
   * rendered at the level the simulation actually uses. Default 0.
   */
  talentBoost?: number;
  onLevelChange: (level: number) => void;
  className?: string;
}

/**
 * One ability: its per-level talent multipliers, scaling stat, cast/cooldown
 * cost, and elemental application.
 *
 * All figures come from `abilityDetailModel`, which reads the kit's per-level
 * tables through the engine's own `talentValueAt`. No damage is computed here —
 * a multiplier is not damage, and the labels say so.
 */
export function AbilityCard({
  ability,
  nameZh,
  descriptionZh,
  slotLabel,
  level,
  talentBoost = 0,
  onLevelChange,
  className,
}: Props) {
  // Multipliers are rendered at the EFFECTIVE level, because that is the level
  // the engine runs. Showing the configured level's table under an active
  // constellation would print multipliers for a level the damage never used.
  // `buildAbilityDetail` clamps, so an over-max effective level is safe.
  const detail = buildAbilityDetail(ability, level + talentBoost);
  const levelVaries = hasLevelVariation(ability);
  const boosted = talentBoost > 0 && levelVaries;
  const selectId = `talent-level-${ability.id}`;

  return (
    <section
      className={cn(
        "rounded-md border border-surface-border bg-surface-raised/60 p-4",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-micro font-semibold uppercase tracking-wide text-amber-400">
            {slotLabel}
          </span>
          <h4 className="text-sm font-semibold text-slate-100">{nameZh ?? slotLabel}</h4>
          {descriptionZh && (
            <p className="mt-1 max-w-3xl whitespace-pre-line text-xs leading-5 text-slate-400">
              {descriptionZh}
            </p>
          )}
        </div>

        {/*
          The level selector is suppressed for flat-multiplier abilities: a
          selector implies a growth curve, and offering one where every level
          resolves to the same number would be a false affordance.
        */}
        {levelVaries ? (
          <div className="flex items-center gap-2">
            <label htmlFor={selectId} className="text-xs text-slate-400">
              天赋等级
            </label>
            <select
              id={selectId}
              value={clampTalentLevel(level)}
              onChange={(event) => onLevelChange(Number(event.target.value))}
              className={cn(
                "rounded-md border border-surface-border bg-surface px-2 py-1",
                "font-mono text-xs font-semibold text-amber-300",
                TRANSITION_COLORS,
                FOCUS_RING,
              )}
            >
              {TALENT_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  等级 {lvl}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-micro text-slate-400">倍率不随等级变化</span>
        )}
      </header>

      {/*
        The constellation boost is stated, never silently folded in. Without
        this the selector reads "等级 7" while the table below and the simulated
        damage are both level 10, and nothing on screen explains the gap.
        `state.info` is the "neutral notice" role in DESIGN-SYSTEM; the glyph is
        decorative and the text carries the meaning.
      */}
      {boosted && (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 rounded border border-state-info-border bg-state-info-bg px-2 py-1 text-micro text-state-info-fg">
          <span aria-hidden="true">◇</span>
          <span>
            命之座使该天赋等级 +{talentBoost}，实际按等级{" "}
            <span className="font-mono tabular-nums font-semibold">
              {detail.level}
            </span>{" "}
            参与计算；下方倍率即为该等级的数值。
          </span>
        </p>
      )}

      {/* Cost / timing row. Absent values are omitted, never shown as 0. */}
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <dt className="text-slate-400">施法时间</dt>
          <dd className="font-mono tabular-nums text-slate-200">
            {detail.castTime.toFixed(2)}&nbsp;秒
          </dd>
        </div>
        {detail.cooldown !== undefined && (
          <div className="flex items-center gap-1.5">
            <dt className="text-slate-400">冷却时间</dt>
            <dd className="font-mono tabular-nums text-slate-200">
              {detail.cooldown.toFixed(1)}&nbsp;秒
            </dd>
          </div>
        )}
        {detail.energyCost !== undefined && (
          <div className="flex items-center gap-1.5">
            <dt className="text-slate-400">能量消耗</dt>
            <dd className="font-mono tabular-nums text-state-info-fg">
              {detail.energyCost}
            </dd>
          </div>
        )}
        {detail.particles !== undefined && (
          <div className="flex items-center gap-1.5">
            <dt className="text-slate-400">元素微粒</dt>
            <dd className="font-mono tabular-nums text-slate-200">
              {detail.particles}
            </dd>
          </div>
        )}
      </dl>

      {/* Per-hit multipliers. */}
      {detail.instances.length > 0 && (
        <table className="mt-3 w-full border-collapse text-xs">
          <caption className="sr-only">
            {slotLabel} 在天赋等级 {detail.level} 下的各段倍率
          </caption>
          <thead>
            <tr className="border-b border-surface-border text-left text-slate-400">
              <th scope="col" className="py-1.5 pr-3 font-medium">
                伤害段
              </th>
              <th scope="col" className="py-1.5 pr-3 font-medium">
                倍率
              </th>
              <th scope="col" className="py-1.5 font-medium">
                元素
              </th>
            </tr>
          </thead>
          <tbody>
            {detail.instances.map((row, index) => (
              <tr key={row.id} className="border-b border-surface-border/50 last:border-0">
                <td className="py-1.5 pr-3 text-slate-200">{hitLabel(index)}</td>
                <td className="py-1.5 pr-3">
                  {/*
                    Hybrid hits sum fractions of DIFFERENT stats, so each term
                    is listed with the stat it scales from rather than collapsed
                    into one number that would be meaningless.
                  */}
                  <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    {row.terms.map((term, index) => (
                      <span key={term.stat} className="flex items-center gap-1">
                        {index > 0 && (
                          <span aria-hidden="true" className="text-slate-400">
                            +
                          </span>
                        )}
                        <span className="font-mono tabular-nums font-semibold text-slate-100">
                          {fmtMultiplier(term.multiplier)}
                        </span>
                        <span className="text-slate-400">{term.statLabel}</span>
                      </span>
                    ))}
                  </span>
                </td>
                <td className="py-1.5">
                  <span className={cn("font-medium", elementTextClass(row.element))}>
                    {elementZh(row.element)}
                  </span>
                  {row.gauge !== undefined && (
                    <span className="ml-1.5 font-mono text-slate-400">
                      {row.gauge}U
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
