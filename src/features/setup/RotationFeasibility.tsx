"use client";

import { useId, useMemo } from "react";
import type {
  CharacterDefinition,
  Rotation,
  SimulationWarning,
} from "@/types";
import { cn } from "@/components/ui/cn";
import { ElementTag } from "@/components/ui/ElementTag";
import { StatusChip } from "@/components/ui/StatusChip";
import { CARD } from "@/components/ui/tokens";
import { charNameZh } from "@/lib/i18n";
import { missingSwapIndexes } from "./rotationEditing";
import {
  buildFeasibilityReport,
  type FeasibilityRow,
} from "./feasibilityModel";

interface Props {
  rotation: Rotation;
  team: readonly (CharacterDefinition | null)[];
  /**
   * Structured warnings from a FRESH run, or `null` when there is no run or
   * the result is stale. `null` is what drops the panel to demand-only — the
   * caller owns the freshness decision (`resultStale` is already computed in
   * `WorkspacePage` and must be reused, not re-derived).
   */
  runWarnings: readonly SimulationWarning[] | null;
}

const CAPTION = "能量与可行性";

/**
 * Burst energy DEMAND per character (COMPONENTS §15.5).
 *
 * This panel does not compute energy (§15.5/F1). It states what the sequence
 * requires — `maxEnergy` × burst count, a fact about the array — and defers
 * every verdict to the engine.
 *
 * KNOWN SEAM GAP: §15.5's insufficient-state copy asks for
 * `第 <k> 次元素爆发时能量为 <e>/<max>`. The `<e>` is NOT structurally
 * reachable: `SimulationResult.finalState` is post-run only (not per-burst),
 * and `SimulationWarning` carries `code`/`actionIndex`/`characterId` but keeps
 * the energy figure only inside an English prose `message`. Parsing that
 * string to print a Chinese number would be fabrication of exactly the kind F1
 * forbids, so the verdict is rendered WITHOUT the figure and the panel names
 * which burst failed instead. Restore the full copy if the engine adds a
 * structured per-burst energy field.
 */
export function RotationFeasibility({ rotation, team, runWarnings }: Props) {
  const headingId = useId();
  const activeMembers = useMemo(
    () => team.filter((c): c is CharacterDefinition => c !== null),
    [team],
  );
  const characterById = useMemo(
    () => new Map(activeMembers.map((c) => [c.id, c] as const)),
    [activeMembers],
  );
  const unreachableCount = useMemo(
    () => missingSwapIndexes(rotation).length,
    [rotation],
  );

  const report = useMemo(
    () =>
      buildFeasibilityReport(
        rotation,
        characterById,
        unreachableCount,
        runWarnings,
      ),
    [rotation, characterById, unreachableCount, runWarnings],
  );

  // §15.5 — nothing renders for no team or an empty sequence. The gap under the
  // editor is NOT filled with a box that is also empty; `lg:items-start`
  // absorbs the space instead (§15.7/H1).
  if (activeMembers.length === 0) return null;
  if (rotation.length === 0) return null;

  const unreachableLine =
    report.unreachableCount > 0 ? (
      <p className="text-micro text-slate-400">
        序列中有{" "}
        <span className="font-mono tabular-nums">{report.unreachableCount}</span>{" "}
        个动作无法执行，详见上方序列。
      </p>
    ) : null;

  // "Nothing to check" is a real answer, not a blank.
  if (report.rows.length === 0) {
    return (
      <section className={cn(CARD, "flex flex-col gap-2 p-4 text-sm")}>
        <Header headingId={headingId} />
        <p className="text-micro text-slate-400">
          当前序列没有元素爆发，无需充能校验。
        </p>
        {unreachableLine}
      </section>
    );
  }

  return (
    <section className={cn(CARD, "flex flex-col gap-3 p-4 text-sm")}>
      <Header headingId={headingId} />

      {/* Labelled by the card's VISIBLE heading rather than an `sr-only`
          `<caption>` carrying the same string — that duplicate made a screen
          reader announce 能量与可行性 twice. */}
      <table
        aria-labelledby={headingId}
        className="w-full border-collapse text-left"
      >
        <thead>
          <tr className="text-micro text-slate-400">
            <th scope="col" className="pb-1.5 font-medium">
              角色
            </th>
            <th scope="col" className="hidden pb-1.5 font-medium sm:table-cell">
              元素爆发
            </th>
            <th scope="col" className="hidden pb-1.5 font-medium sm:table-cell">
              单次消耗
            </th>
            <th scope="col" className="hidden pb-1.5 font-medium sm:table-cell">
              合计需求
            </th>
            <th scope="col" className="pb-1.5 font-medium">
              判定
            </th>
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row) => (
            <Row key={row.characterId} row={row} />
          ))}
        </tbody>
      </table>

      {!report.hasEngineVerdict && (
        <p className="text-micro text-slate-400">
          能量是否足够需由模拟结果判定。
        </p>
      )}
      {unreachableLine}
    </section>
  );
}

function Header({ headingId }: { headingId: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-surface-border/60 pb-2">
      <h3 id={headingId} className="text-sm font-semibold text-slate-200">
        {CAPTION}
      </h3>
      <span className="text-micro text-slate-400">仅统计元素爆发充能需求</span>
    </div>
  );
}

function Row({ row }: { row: FeasibilityRow }) {
  const { character, burstCount, energyPerBurst, totalDemand } = row;

  return (
    <tr className="border-t border-surface-border/40 align-top">
      <th scope="row" className="py-2 pr-3 font-normal">
        <span className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <ElementTag element={character.element} />
            <span className="font-semibold text-slate-200">
              {charNameZh(character.name)}
            </span>
          </span>
          {/* Below 640px the table collapses to stacked labelled lines rather
              than four numeric columns at 360px (§15.9). */}
          <span className="font-mono tabular-nums text-micro text-slate-400 sm:hidden">
            Q ×{burstCount} · {energyPerBurst} 能/次 · 共需 {totalDemand} 能
          </span>
        </span>
      </th>
      <td className="hidden py-2 pr-3 font-mono tabular-nums text-micro text-slate-300 sm:table-cell">
        Q ×{burstCount}
      </td>
      <td className="hidden py-2 pr-3 font-mono tabular-nums text-micro text-slate-300 sm:table-cell">
        {energyPerBurst} 能/次
      </td>
      <td className="hidden py-2 pr-3 font-mono tabular-nums text-micro text-slate-200 sm:table-cell">
        共需 {totalDemand} 能
      </td>
      <td className="py-2">
        <Verdict row={row} />
      </td>
    </tr>
  );
}

/**
 * Every chip carries its reason as VISIBLE text in the row, never as `title`,
 * and status is never colour-only — glyph-free Chinese word plus a sentence.
 */
function Verdict({ row }: { row: FeasibilityRow }) {
  const structural = row.burstBeforeAnyAction ? (
    <span className="flex flex-col gap-1">
      <StatusChip state="warning">无前置动作</StatusChip>
      <span className="text-micro text-slate-400">
        序列中该角色在元素爆发前没有任何动作。
      </span>
    </span>
  ) : null;

  if (row.verdict === "unknown") {
    // A blank cell under a column headed 判定 reads as "no verdict was
    // reached", which is a different claim from "no run yet". The demand
    // figure is NOT repeated here — the `<th>`'s stacked line is the specced
    // mobile rendering of 共需 <n> 能 and printing it twice, three lines
    // apart, is one number rendered two ways.
    return (
      <span className="flex flex-col gap-1">
        {structural}
        <StatusChip state="info">待模拟</StatusChip>
      </span>
    );
  }

  if (row.verdict === "sufficient") {
    // F2 is SUPPRESSED here, never stacked with a sufficient verdict. F2 is a
    // structural observation about the array; the engine's verdict is the
    // truth, and it says the character did charge (off-field). Rendering
    // 无前置动作 above 充能可达 would be two contradictory claims about one
    // fact in one cell, with the false one on top.
    return (
      <span className="flex flex-col gap-1">
        <StatusChip state="success">充能可达</StatusChip>
      </span>
    );
  }

  // With `insufficient`, F2 corroborates rather than contradicts — it tells
  // them WHY — so it stays stacked above the verdict.

  return (
    <span className="flex flex-col gap-1">
      {structural}
      <StatusChip state="warning">充能不足</StatusChip>
      <span className="text-micro text-slate-400">
        本次模拟中第 {row.failedBurstOrdinals.join("、")} 次元素爆发因能量不足未能执行。
      </span>
    </span>
  );
}
