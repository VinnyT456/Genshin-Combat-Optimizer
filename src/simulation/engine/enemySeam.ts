import type {
  BuffContext,
  EnemyModifierResolver,
  EnemyModifiers,
} from "@/types";
import { NO_ENEMY_MODIFIERS } from "@/types";

// ============================================================================
// Enemy-modifier seam.
//
// Counterpart to `buffSeam.ts`. The engine does not know what a DEF shred is;
// it only knows that, right before computing damage, it must ask the mechanics
// layer what enemy-side debuffs are active, then hand the totals to the damage
// pipeline which sequences them.
//
// mechanics-engineer owns `src/simulation/buffs` and already exports
// `sumEnemyModifiers(modifiers): EnemyModifierTotals`. That shape is
// structurally assignable to `EnemyModifiers`, so wiring their side is a
// pass-through — they build an `EnemyModifierResolver` and callers pass it via
// `SimulationConfig.enemyModifierResolver`.
//
// Until then the engine uses `noOpEnemyModifierResolver`, which reports no
// shred and therefore preserves existing behaviour exactly.
// ============================================================================

/** Reports no enemy debuffs. Damage is unchanged from the un-shredded case. */
export const noOpEnemyModifierResolver: EnemyModifierResolver = () =>
  NO_ENEMY_MODIFIERS;

export function resolveEnemyModifiers(
  context: BuffContext,
  resolver: EnemyModifierResolver | undefined,
): EnemyModifiers {
  return (resolver ?? noOpEnemyModifierResolver)(context);
}
