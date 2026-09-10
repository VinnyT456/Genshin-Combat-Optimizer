import type {
  CharacterDefinition,
  CombatEvent,
  SimulationSnapshot,
} from "@/types";
import type { SemanticState } from "@/components/ui/tokens";
import { ENERGY_PLACEHOLDER, formatEnergy } from "@/lib/energyFormat";

// ---------------------------------------------------------------------------
// Pure presentation model for the per-character energy display (COMPONENTS §2).
//
// This module computes NO energy. Every number it returns was published by the
// engine — either on a `CombatEvent.energyByCharacter` snapshot or on
// `SimulationResult.finalState`. Its only jobs are:
//   1. picking WHICH published snapshot applies at the scrubbed time, and
//   2. comparing published energy/cooldown values against published ability
//      costs to phrase an availability sentence.
// Both are display derivations over engine output, never game math. Kept free
// of React so it is unit-testable without a DOM.
// ---------------------------------------------------------------------------

/** Availability of a character's burst at the scrubbed instant. */
export type BurstAvailability =
  | { kind: "ready" }
  /** Energy is short by `deficit`, and the burst may also be cooling down. */
  | { kind: "needs-energy"; deficit: number }
  | { kind: "cooling-down"; remaining: number }
  /** Both gate it; `remaining` resolves later than the energy gain would. */
  | { kind: "cooling-down-and-needs-energy"; remaining: number; deficit: number }
  /** No energy reading for this character in this run. */
  | { kind: "unknown" };

export interface EnergyRow {
  /** Party position, 0-based; empty slots are still rendered as rows. */
  slotIndex: number;
  character: CharacterDefinition | null;
  /** Published energy at the scrubbed time; null when nothing was published. */
  current: number | null;
  maxEnergy: number;
  /** Energy the character's burst costs, from its definition. */
  burstCost: number;
  /** `current / burstCost`, clamped to [0, 1]. Drives the bar fill only. */
  fillFraction: number;
  /** Burst-cost position on the bar as a fraction of `maxEnergy`. */
  costFraction: number;
  availability: BurstAvailability;
}

export interface EnergyView {
  rows: EnergyRow[];
  /** Time the readout reflects; null means "end of rotation". */
  scrubTime: number | null;
  /** True when the readout came from `finalState` rather than a scrubbed event. */
  atEndOfRotation: boolean;
  /** Characters in the party, for the model footnote. */
  partySize: number;
  /** Rows whose burst cannot be cast right now. Drives the mobile summary. */
  unavailableBurstCount: number;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * The energy snapshot in force at `time`.
 *
 * The engine attaches `energyByCharacter` to `energy` events only, so a damage
 * or swap event carries no snapshot of its own. The value in force at that
 * instant is therefore the most recent snapshot at or before it — a lookup over
 * absolute values the engine already published, with no accumulation of deltas
 * (a dropped event can shift which snapshot wins, but can never desync a total).
 *
 * Ties at the same timestamp resolve to the LAST event, which is the state after
 * everything at that instant has been applied.
 */
export function energySnapshotAt(
  timeline: readonly CombatEvent[],
  time: number,
): Record<string, number> | null {
  let found: Record<string, number> | null = null;
  for (const event of timeline) {
    if (event.timestamp > time) break;
    if (event.energyByCharacter !== undefined) found = event.energyByCharacter;
  }
  return found;
}

/**
 * Timestamp the readout should reflect.
 *
 * CONTRACT (COMPONENTS §2.5): scrub time is DERIVED from the existing
 * `selectedEventIndex` and is never stored as a second piece of state. Two
 * independent states would let this panel report one time while the detail panel
 * beside it reports another. `null` means "end of rotation" → `finalState`.
 */
export function scrubTimeOf(
  timeline: readonly CombatEvent[],
  selectedEventIndex: number | null,
): number | null {
  if (selectedEventIndex === null) return null;
  return timeline[selectedEventIndex]?.timestamp ?? null;
}

function availabilityOf(
  current: number | null,
  burstCost: number,
  cooldownRemaining: number,
): BurstAvailability {
  if (current === null) return { kind: "unknown" };
  const deficit = burstCost - current;
  const short = deficit > 0;
  const cooling = cooldownRemaining > 0;
  if (short && cooling)
    return { kind: "cooling-down-and-needs-energy", remaining: cooldownRemaining, deficit };
  if (cooling) return { kind: "cooling-down", remaining: cooldownRemaining };
  if (short) return { kind: "needs-energy", deficit };
  return { kind: "ready" };
}

export interface BuildEnergyViewInput {
  /** Party order, holes allowed — row order mirrors slot order. */
  team: readonly (CharacterDefinition | null)[];
  timeline: readonly CombatEvent[];
  /** Post-run per-character energy + cooldowns, from `result.finalState`. */
  finalState: SimulationSnapshot;
  /** Derived, never stored. See {@link scrubTimeOf}. */
  scrubTime: number | null;
}

export function buildEnergyView({
  team,
  timeline,
  finalState,
  scrubTime,
}: BuildEnergyViewInput): EnergyView {
  const atEndOfRotation = scrubTime === null;
  const scrubbed = atEndOfRotation ? null : energySnapshotAt(timeline, scrubTime);
  // Cooldowns are published as absolute ready-times, so the clock they are
  // compared against must be the same clock the energy reading came from.
  const clock = scrubTime ?? finalState.time;

  const rows: EnergyRow[] = team.map((character, slotIndex) => {
    if (character === null) {
      return {
        slotIndex,
        character: null,
        current: null,
        maxEnergy: 0,
        burstCost: 0,
        fillFraction: 0,
        costFraction: 0,
        availability: { kind: "unknown" },
      };
    }

    const snapshot = finalState.characters[character.id];
    const current = atEndOfRotation
      ? (snapshot?.energy.current ?? null)
      : (scrubbed?.[character.id] ?? null);

    const maxEnergy = snapshot?.energy.max ?? character.maxEnergy;
    const burstCost = character.elementalBurst.energyCost;
    const readyAt = snapshot?.cooldowns[character.elementalBurst.id];
    const cooldownRemaining =
      readyAt === undefined ? 0 : Math.max(0, readyAt - clock);

    return {
      slotIndex,
      character,
      current,
      maxEnergy,
      burstCost,
      fillFraction: current === null ? 0 : clamp01(current / maxEnergy),
      costFraction: maxEnergy > 0 ? clamp01(burstCost / maxEnergy) : 0,
      availability: availabilityOf(current, burstCost, cooldownRemaining),
    };
  });

  return {
    rows,
    scrubTime,
    atEndOfRotation,
    partySize: team.filter((c) => c !== null).length,
    unavailableBurstCount: rows.filter(
      (r) => r.character !== null && r.availability.kind !== "ready",
    ).length,
  };
}

/** Seconds formatter for a cooldown remainder. One decimal is enough to act on. */
function formatCooldown(seconds: number): string {
  return `${seconds.toFixed(1)} s`;
}

export interface AvailabilityChip {
  /** Full sentence. Text always carries the state — colour never does alone. */
  text: string;
  state: SemanticState;
}

/**
 * The burst-availability chip (COMPONENTS §2.4). When both energy and cooldown
 * gate the burst, the later-resolving reason leads and the energy shortfall is
 * appended, so the user reads the binding constraint first.
 */
export function availabilityChip(availability: BurstAvailability): AvailabilityChip {
  switch (availability.kind) {
    case "ready":
      return { text: "Burst ready", state: "success" };
    case "needs-energy":
      return {
        text: `Burst unavailable · needs ${formatEnergy(availability.deficit)} more energy`,
        state: "warning",
      };
    case "cooling-down":
      return {
        text: `Burst unavailable · cooldown ${formatCooldown(availability.remaining)}`,
        state: "warning",
      };
    case "cooling-down-and-needs-energy":
      return {
        text:
          `Burst unavailable · cooldown ${formatCooldown(availability.remaining)} · ` +
          `+${formatEnergy(availability.deficit)} energy`,
        state: "warning",
      };
    case "unknown":
      return {
        text: `Energy unavailable for this character`,
        state: "error",
      };
  }
}

/** Accessible name for one meter, per §2.3. */
export function meterLabel(row: EnergyRow): string {
  const name = row.character?.name ?? `Slot ${row.slotIndex + 1}`;
  const current =
    row.current === null ? ENERGY_PLACEHOLDER : formatEnergy(row.current, row.burstCost);
  return `${name} energy, ${current} of ${row.maxEnergy}, burst requires ${row.burstCost}`;
}
