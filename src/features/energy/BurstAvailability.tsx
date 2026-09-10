import { cn } from "@/components/ui/cn";
import { STATE_CHIP, STATE_GLYPH, type SemanticState } from "@/components/ui/tokens";
import { formatEnergy } from "@/lib/energyFormat";
import type { BurstAvailability as Availability } from "@/features/energy/energyModel";

function availabilityChipZh(availability: Availability): { text: string; state: SemanticState } {
  switch (availability.kind) {
    case "ready":
      return { text: "爆发已就绪", state: "success" };
    case "needs-energy":
      return {
        text: `爆发未就绪 · 尚缺 ${formatEnergy(availability.deficit)} 能量`,
        state: "warning",
      };
    case "cooling-down":
      return {
        text: `爆发未就绪 · 冷却中剩余 ${availability.remaining.toFixed(1)} 秒`,
        state: "warning",
      };
    case "cooling-down-and-needs-energy":
      return {
        text: `爆发未就绪 · 冷却 ${availability.remaining.toFixed(1)} 秒 · 尚缺 ${formatEnergy(availability.deficit)} 能`,
        state: "warning",
      };
    case "unknown":
      return {
        text: "暂无此角色能量读数",
        state: "error",
      };
  }
}

export function BurstAvailabilityChip({
  availability,
}: {
  availability: Availability;
}) {
  const chip = availabilityChipZh(availability);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-micro font-mono",
        STATE_CHIP[chip.state],
      )}
    >
      <span aria-hidden="true">{STATE_GLYPH[chip.state]}</span>
      {chip.text}
    </span>
  );
}
