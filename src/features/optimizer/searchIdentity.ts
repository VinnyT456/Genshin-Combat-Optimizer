interface CanonicalizeOptions {
  /** Game data legitimately uses ±Infinity for permanent effects. */
  readonly allowNonFinite?: boolean;
}

export const NON_FINITE_NUMBER_TAG = "$gco.nonFiniteNumber";

/**
 * Stable JSON for request identity and transport validation.
 *
 * Search payloads are assembled from domain objects with optional fields. An
 * omitted field and an own object property whose value is `undefined` have the
 * same JSON/structured-clone meaning, so object properties with `undefined`
 * values are intentionally omitted here. This keeps the transport boundary
 * strict for unsupported values without rejecting ordinary optional game data.
 */
export function canonicalizeSerializable(
  value: unknown,
  options: CanonicalizeOptions = {},
): string {
  const active = new Set<object>();

  function visit(input: unknown): string {
    if (input === null) return "null";
    switch (typeof input) {
      case "string": return JSON.stringify(input);
      case "boolean": return input ? "true" : "false";
      case "number":
        if (!Number.isFinite(input)) {
          if (!options.allowNonFinite) {
            throw new TypeError("non-finite number is not transportable");
          }
          const value = Number.isNaN(input)
            ? "NaN"
            : input === Number.POSITIVE_INFINITY
              ? "Infinity"
              : "-Infinity";
          return `{${JSON.stringify(NON_FINITE_NUMBER_TAG)}:${JSON.stringify(value)}}`;
        }
        return Object.is(input, -0) ? "0" : String(input);
      // `undefined` is handled by the containing object. A top-level value or
      // an array element still has no stable object-field representation.
      case "undefined": throw new TypeError("undefined is not transportable");
      case "function": throw new TypeError("functions are not transportable");
      case "symbol": throw new TypeError("symbols are not transportable");
      case "bigint": throw new TypeError("bigints are not transportable");
    }

    if (typeof input !== "object") throw new TypeError("unsupported transport value");
    if (active.has(input)) throw new TypeError("cyclic request is not transportable");
    active.add(input);
    try {
      if (Array.isArray(input)) return `[${input.map(visit).join(",")}]`;
      const prototype = Object.getPrototypeOf(input);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new TypeError("class instances are not transportable");
      }
      const record = input as Record<string, unknown>;
      const keys = Object.keys(record)
        .filter((key) => record[key] !== undefined)
        .sort();
      return `{${keys.map((key) => `${JSON.stringify(key)}:${visit(record[key])}`).join(",")}}`;
    } finally {
      active.delete(input);
    }
  }

  return visit(value);
}

/** Small deterministic digest; cryptographic integrity belongs to ReplayPack. */
export function fingerprintSerializable(value: unknown): string {
  const text = canonicalizeSerializable(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
