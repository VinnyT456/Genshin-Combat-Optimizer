// ---------------------------------------------------------------------------
// The single formatter for every energy value in the product.
//
// EventDetailPanel and EnergyPanel both render energy; formatting it in each
// place would let the two drift into showing the same number differently in two
// adjacent panels. Pure string formatting — no game math.
//
// Precision rule (COMPONENTS §2.3): a decimal is shown only when it changes the
// answer to "can this character burst yet". Below the burst cost, 29.4 vs 29 is
// the difference between ready and not, so the decimal is kept; at or above it,
// the extra digit is noise.
// ---------------------------------------------------------------------------

const WHOLE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const ONE_DECIMAL = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Rendered when a value is genuinely unknown. Never a zero — zero is a claim. */
export const ENERGY_PLACEHOLDER = "—";

/**
 * A single energy quantity.
 *
 * @param burstCost Cost of the character's burst. Below it, precision matters;
 *   omit when there is no threshold to compare against (then always rounded).
 */
export function formatEnergy(value: number, burstCost?: number): string {
  if (!Number.isFinite(value)) return ENERGY_PLACEHOLDER;
  const hasFraction = !Number.isInteger(value);
  const belowCost = burstCost !== undefined && value < burstCost;
  return hasFraction && belowCost ? ONE_DECIMAL.format(value) : WHOLE.format(value);
}

/** The `48 / 60` pair people actually read. */
export function formatEnergyOfMax(
  value: number | null,
  maxEnergy: number,
  burstCost?: number,
): string {
  const current = value === null ? ENERGY_PLACEHOLDER : formatEnergy(value, burstCost);
  return `${current} / ${WHOLE.format(maxEnergy)}`;
}
