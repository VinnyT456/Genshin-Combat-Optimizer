import type {
  AuraSnapshot,
  CharacterSnapshot,
  SimulationSnapshot,
} from "@/types";
import { quantizeGauge } from "@/simulation/reactions/auraTolerance";
import { MEMO_KEY_DECIMAL_PLACES } from "./CONTRACT";

// ============================================================================
// Transposition (memo) key derivation.
//
// Two search nodes are interchangeable when they leave the simulation in the
// same state, regardless of which action order produced it. Beam search dedupes
// on this key, so the key must be COMPLETE: any carried field it omits makes
// two genuinely-different nodes collide, and the second is silently discarded
// from the beam. That is a loss of search space that no test on the surviving
// node can detect.
//
// The key therefore covers EVERY field `CharacterSnapshot` /
// `SimulationSnapshot` carry across actions:
//   energy, cooldowns, ability charges, normalStringIndex, icd, resources,
//   activeStance, and the per-enemy aura.
//
// Floats are quantized before hashing (CONTRACT REQUIREMENT 3). Continuous
// quantities are the result of accumulated arithmetic, so two states equal in
// game terms can differ in the last ULP and hash apart, silently disabling the
// memo. Rounding is a property of the KEY ONLY — scoring always uses
// full-precision values.
//
// Aura gauge uses mechanics' `quantizeGauge()` rather than this module's
// rounding, because mechanics owns the aura tolerance grid
// (`AURA_GAUGE_RELATIVE_TOLERANCE`). `since` / `decayRate` / `element` are
// documented EXACT and are keyed exactly.
// ============================================================================

/** Sentinel for an absent optional field, distinct from any real value. */
const ABSENT = "-";

/** Rounds a continuous quantity onto the memo grid. `+ 0` normalizes -0. */
function q(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const grid = 10 ** MEMO_KEY_DECIMAL_PLACES;
  return String(Math.round(value * grid) / grid + 0);
}

/**
 * Sorted key iteration. `Object.keys` order depends on insertion order, which
 * depends on the action order that built the state — exactly the difference a
 * transposition key must ignore.
 */
function sortedKeys(record: Readonly<Record<string, unknown>>): string[] {
  return Object.keys(record).sort();
}

function characterKey(snapshot: CharacterSnapshot): string {
  const parts: string[] = [q(snapshot.energy.current)];

  parts.push(String(snapshot.normalStringIndex ?? ABSENT));

  let cooldowns = "";
  for (const id of sortedKeys(snapshot.cooldowns)) {
    cooldowns += `${id}=${q(snapshot.cooldowns[id]!)},`;
  }
  parts.push(cooldowns);

  if (snapshot.abilityCharges === undefined) {
    parts.push(ABSENT);
  } else {
    let charges = "";
    for (const id of sortedKeys(snapshot.abilityCharges)) {
      const state = snapshot.abilityCharges[id]!;
      charges += `${id}=${state.current}/${state.max}/${state.rechargeAt
        .map(q)
        .join(",")},`;
    }
    parts.push(charges);
  }

  // ICD: absence is NOT neutral (an absent counter means "first hit ever",
  // which always applies its element), so absent and empty must hash apart.
  if (snapshot.icd === undefined) {
    parts.push(ABSENT);
  } else {
    let icd = "";
    for (const group of sortedKeys(snapshot.icd)) {
      const counter = snapshot.icd[group]!;
      icd += `${group}=${q(counter.windowStart)}/${counter.hitsInWindow},`;
    }
    parts.push(icd);
  }

  if (snapshot.resources === undefined) {
    parts.push(ABSENT);
  } else {
    let resources = "";
    for (const id of sortedKeys(snapshot.resources)) {
      const r = snapshot.resources[id]!;
      resources +=
        `${id}=${q(r.value)}/${q(r.max)}/${q(r.lastChanged)}/` +
        `${r.durationSeconds === undefined ? ABSENT : q(r.durationSeconds)},`;
    }
    parts.push(resources);
  }

  // `stance` is an opaque generic (`unknown`) in the contract. Only its
  // identity matters for equivalence, and a stance is authored as plain data,
  // so a stable JSON form is the only available discriminator.
  if (snapshot.activeStance === undefined) {
    parts.push(ABSENT);
  } else {
    parts.push(
      `${stableStringify(snapshot.activeStance.stance)}@${q(
        snapshot.activeStance.startTime,
      )}@${stableStringify(snapshot.activeStance.resourceSnapshots ?? null)}`,
    );
  }

  return parts.join("|");
}

/**
 * JSON with object keys emitted in sorted order, so two structurally equal
 * values produced by different insertion orders serialize identically.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return typeof value === "number" ? q(value) : JSON.stringify(value) ?? "";
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  const inner = sortedKeys(record)
    .map((k) => `${JSON.stringify(k)}:${stableStringify(record[k])}`)
    .join(",");
  return `{${inner}}`;
}

function auraKey(aura: AuraSnapshot): string {
  // Aura ORDER is meaningful to the mechanics layer (reaction priority), so it
  // is preserved rather than sorted.
  const auras = aura.auras
    .map(
      (a) =>
        `${a.element}:${quantizeGauge(a.gauge)}:${q(a.since)}:${q(a.decayRate)}`,
    )
    .join(",");
  const compound = aura.compound
    .map(
      (c) =>
        `${c.kind}:${quantizeGauge(c.gauge)}:${q(c.since)}:${q(c.decayRate)}`,
    )
    .join(",");
  return `${auras};${compound}`;
}

/**
 * Derives a complete, quantized transposition key from a simulation snapshot.
 *
 * Equal keys mean the two nodes are interchangeable for all future scoring.
 */
export function stateKey(snapshot: SimulationSnapshot): string {
  let characters = "";
  for (const id of sortedKeys(snapshot.characters)) {
    characters += `[${id}:${characterKey(snapshot.characters[id]!)}]`;
  }

  let auras = "";
  if (snapshot.enemyAuras !== undefined) {
    for (const id of sortedKeys(snapshot.enemyAuras)) {
      auras += `[${id}:${auraKey(snapshot.enemyAuras[id]!)}]`;
    }
  }

  return (
    `t=${q(snapshot.time)}` +
    `|a=${snapshot.activeCharacterId ?? ABSENT}` +
    `|c=${characters}` +
    `|e=${snapshot.enemyAuras === undefined ? ABSENT : auras}`
  );
}
