import { cn } from "@/components/ui/cn";
import { formatEnergyOfMax } from "@/lib/energyFormat";
import { type EnergyRow, meterLabel } from "@/features/energy/energyModel";

/**
 * One character's energy bar plus its numeric readout.
 *
 * The NUMBER is the primary signal and the bar is secondary (§2.3): the bar's
 * fill colour changing at the burst threshold is deliberately redundant with the
 * availability chip beside it, never the only indication.
 */
export function EnergyMeter({ row }: { row: EnergyRow }) {
  const ready = row.current !== null && row.current >= row.burstCost;
  const empty = row.current === null;

  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-right font-mono text-xs tabular-nums">
        {formatEnergyOfMax(row.current, row.maxEnergy, row.burstCost)}
      </span>
      <div
        role="meter"
        aria-valuenow={row.current ?? undefined}
        aria-valuemin={0}
        aria-valuemax={row.maxEnergy}
        aria-label={meterLabel(row)}
        className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-surface-border"
      >
        {/* An empty track, not a zero-width fill: rendering 0% would assert
            "this character has 0 energy", which is a claim we cannot make. */}
        {!empty && (
          <div
            style={{ width: `${row.fillFraction * 100}%` }}
            className={cn(
              "h-full rounded-sm",
              ready ? "bg-state-success-fg" : "bg-state-info-fg",
            )}
          />
        )}
        {/* The "you need this much" line. */}
        {row.burstCost > 0 && (
          <span
            aria-hidden="true"
            style={{ left: `${row.costFraction * 100}%` }}
            className="absolute inset-y-0 w-px bg-slate-400"
          />
        )}
      </div>
    </div>
  );
}
