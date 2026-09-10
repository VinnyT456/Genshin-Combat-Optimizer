"use client";

import { useMemo } from "react";
import type { CharacterDefinition, CombatEvent, SimulationSnapshot } from "@/types";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { CARD } from "@/components/ui/tokens";
import { elementBgClass } from "@/lib/format";
import { EnergyMeter } from "@/features/energy/EnergyMeter";
import { BurstAvailabilityChip } from "@/features/energy/BurstAvailability";
import { buildEnergyView, scrubTimeOf } from "@/features/energy/energyModel";
import { charNameZh } from "@/lib/i18n";

const EMPTY_SLOT_LABEL = "[未配置角色]";

interface Props {
  /** Party order, holes allowed — row order mirrors slot order. */
  team: readonly (CharacterDefinition | null)[];
  timeline: readonly CombatEvent[];
  finalState: SimulationSnapshot;
  /**
   * The ONE selection model, shared with the timeline and the detail panel.
   * Scrub time is derived from it (§2.5) rather than held separately, so the
   * three consumers cannot report different instants.
   */
  selectedEventIndex: number | null;
  onSelectEvent: (eventIndex: number | null) => void;
}

function formatScrubTime(seconds: number): string {
  return `${seconds.toFixed(2)} 秒`;
}

export function EnergyPanel({
  team,
  timeline,
  finalState,
  selectedEventIndex,
  onSelectEvent,
}: Props) {
  const scrubTime = scrubTimeOf(timeline, selectedEventIndex);

  const view = useMemo(
    () => buildEnergyView({ team, timeline, finalState, scrubTime }),
    [team, timeline, finalState, scrubTime],
  );

  // An energy number with no time attached is meaningless in a dynamic model,
  // so the instant is stated in the header AND in the table caption.
  const whenLabel = view.atEndOfRotation
    ? "循环轴结束时态"
    : `时态 ${formatScrubTime(scrubTime ?? 0)}`;

  const caption = `角色能量状态 (${whenLabel})`;

  return (
    <div className={cn(CARD, "p-4 font-mono")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          能量微粒流转
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-300">{whenLabel}</span>
          <Button
            size="sm"
            onClick={() => onSelectEvent(null)}
            disabled={view.atEndOfRotation}
          >
            循环轴末尾
          </Button>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">角色</th>
            <th scope="col">元素能量</th>
            <th scope="col">爆发就绪状态</th>
          </tr>
        </thead>
        <tbody>
          {view.rows.map((row) => (
            <tr key={row.slotIndex} className="align-middle">
              <th
                scope="row"
                className="w-28 py-1 pr-3 text-left text-xs font-medium"
              >
                {row.character === null ? (
                  <span className="text-slate-400">{EMPTY_SLOT_LABEL}</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        elementBgClass(row.character.element),
                      )}
                    />
                    <span className="truncate">{charNameZh(row.character.name)}</span>
                  </span>
                )}
              </th>
              <td className="py-1 pr-3">
                {row.character !== null && <EnergyMeter row={row} />}
              </td>
              <td className="py-1">
                {row.character !== null && (
                  <BurstAvailabilityChip availability={row.availability} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Names the model that actually ran, so off-field gain does not read as
          a bug. Party size comes from the team the run was given. */}
      <p className="mt-3 text-micro text-slate-400">
        元素微粒动力学 · 出战队伍共 {view.partySize} 人 · 已应用元素充能效率。后台角色遵循规则吸收微粒。
      </p>
    </div>
  );
}
