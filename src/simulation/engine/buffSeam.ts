import type { BuffContext, BuffResolver, Stats } from "@/types";

// ============================================================================
// Buff seam.
//
// The combat engine does not know what a buff is. It only knows that, right
// before computing damage, it must ask the mechanics layer to fold whatever is
// active at time T into the character's stats.
//
// mechanics-engineer owns `src/simulation/buffs` and will export something like
//
//   getActiveBuffs(time, state): Buff[]
//   makeBuffResolver(...): BuffResolver
//
// and callers wire it in via `SimulationConfig.buffResolver`. Until then the
// engine uses `noOpBuffResolver`, which preserves Phase 1 behaviour exactly.
// ============================================================================

/** Identity resolver: no buffs, stats pass through unchanged. */
export const noOpBuffResolver: BuffResolver = (base: Stats): Stats => base;

export function resolveStats(
  base: Stats,
  context: BuffContext,
  resolver: BuffResolver | undefined,
): Stats {
  return (resolver ?? noOpBuffResolver)(base, context);
}
