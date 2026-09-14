"use client";

import type { CharacterDefinition, CombatEvent } from "@/types";
import { cn } from "@/components/ui/cn";
import { FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";
import { elementBgClass, fmtNum } from "@/lib/format";
import { eventDescriptionZh, formatSeconds } from "@/features/rotation-timeline/timelineModel";
import { charNameZh } from "@/lib/i18n";

interface Props {
  timeline: readonly CombatEvent[];
  charactersById: ReadonlyMap<string, CharacterDefinition>;
  selectedEventIndex: number | null;
  onSelect: (eventIndex: number) => void;
}

/**
 * Mobile default: a chronological event list. Swaps appear as full-width rows
 * so their time cost stays visible as a line item in the reading flow rather
 * than disappearing with the chart.
 */
export function TimelineList({
  timeline,
  charactersById,
  selectedEventIndex,
  onSelect,
}: Props) {
  const rows = timeline
    .map((event, eventIndex) => ({ event, eventIndex }))
    .filter(({ event }) => event.type !== "info");

  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">暂无执行动作记录。</p>;
  }

  return (
    <ul className="divide-y divide-surface-border rounded-md border border-surface-border font-mono">
      {rows.map(({ event, eventIndex }) => {
        const actor = charactersById.get(event.characterId);
        const actorName = actor ? charNameZh(actor.name) : "未知角色";
        const selected = eventIndex === selectedEventIndex;
        const isSwap = event.type === "swap";
        const fromRaw =
          event.fromCharacterId !== undefined
            ? (charactersById.get(event.fromCharacterId)?.name ??
              event.fromCharacterId)
            : null;
        const from = fromRaw
          ? charactersById.has(event.fromCharacterId ?? "")
            ? charNameZh(fromRaw)
            : "未知角色（无法匹配）"
          : null;

        return (
          <li key={eventIndex}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(eventIndex)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-hover",
                TRANSITION_COLORS,
                FOCUS_RING,
                selected && "bg-amber-500/10",
              )}
            >
              <span className="w-16 shrink-0 font-mono text-micro text-slate-400">
                {formatSeconds(event.timestamp)}
              </span>
              {isSwap ? (
                <span className="min-w-0 flex-1 text-sm text-slate-300">
                  <span aria-hidden="true">⇄ </span>
                  切人 {from === null ? "" : `至 ${from} `}
                  {actorName}
                  {event.duration !== undefined && (
                    <span className="ml-2 font-mono text-micro text-slate-400">
                      {formatSeconds(event.duration)}
                    </span>
                  )}
                </span>
              ) : (
                <>
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    {actor && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          elementBgClass(actor.element),
                        )}
                      />
                    )}
                    <span className="truncate text-sm">
                      {actorName}
                      <span className="text-slate-400"> · </span>
                      {eventDescriptionZh(event, charactersById)}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-micro">
                    {event.damage ? fmtNum(event.damage.finalDamage) : "—"}
                  </span>
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
