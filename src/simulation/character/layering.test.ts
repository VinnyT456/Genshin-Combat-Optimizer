import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// ============================================================================
// Architectural acceptance: the engine must not know any character.
//
// This is the user's explicit constraint expressed as an executable check, not
// a convention anyone has to remember. If someone hard-codes a kit rule into
// the engine, this fails.
// ============================================================================

const ENGINE_DIR = join(process.cwd(), "src/simulation/engine");
const CHARACTER_DIR = join(process.cwd(), "src/simulation/character");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .sort()
    .map((f) => join(dir, f));
}

function read(file: string): string {
  return readFileSync(file, "utf8");
}

/**
 * Source with comments stripped.
 *
 * Needed because these checks look for CODE, and prose legitimately contains
 * the same substrings — "the time window." in an ICD comment is not a DOM
 * access. Matching raw text produced exactly that false positive.
 */
function code(file: string): string {
  return read(file)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

/**
 * Identifiers that would indicate character-specific logic. Includes the
 * project's own test-character ids, so the check has real subjects to catch.
 */
const CHARACTER_IDENTIFIERS = [
  "test-pyro",
  "test-hydro",
  "test-electro",
  "test-anemo",
  "testPyro",
  "testHydro",
  "testElectro",
  "testAnemo",
  "synthetic-unit",
  "syntheticUnit",
];

describe("layering: engine knows no character", () => {
  it("has engine sources to check (guards against a vacuous pass)", () => {
    expect(sourceFiles(ENGINE_DIR).length).toBeGreaterThan(0);
  });

  it("contains no character identifier anywhere in src/simulation/engine", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(ENGINE_DIR)) {
      const text = read(file);
      for (const id of CHARACTER_IDENTIFIERS) {
        if (text.includes(id)) offenders.push(`${file} contains "${id}"`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("engine does not import game data", () => {
    for (const file of sourceFiles(ENGINE_DIR)) {
      expect(read(file)).not.toContain("@/game-data");
    }
  });

  it("the character framework does not import game data either", () => {
    // The framework is a MODEL. Real kits are data that conform to it; the
    // model must never depend on any particular roster.
    for (const file of sourceFiles(CHARACTER_DIR)) {
      // The adapter's type-only reference is to @/types, not to a roster.
      expect(read(file)).not.toContain("@/game-data");
    }
  });

  it("the character framework imports no React / DOM / Next", () => {
    for (const file of sourceFiles(CHARACTER_DIR)) {
      const text = code(file);
      for (const forbidden of ['from "react"', 'from "next', "document.", "window."]) {
        expect(text).not.toContain(forbidden);
      }
    }
  });

  it("the character framework contains no RNG or wall-clock (determinism)", () => {
    for (const file of sourceFiles(CHARACTER_DIR)) {
      const text = code(file);
      expect(text).not.toContain("Math.random");
      expect(text).not.toContain("Date.now");
      expect(text).not.toContain("new Date");
      expect(text).not.toContain("performance.now");
    }
  });
});
