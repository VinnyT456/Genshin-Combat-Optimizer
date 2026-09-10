import { describe, expect, it } from "vitest";
import type { GeneratedWeapon } from "@/game-data/weapons/generated";
import { generatedWeapons, generatedWeaponsById } from "@/game-data/weapons/generated";
import { allWeapons } from "@/game-data/weapons/registry";
import {
  availableRefinements,
  baseAtkAtLevel,
  buildPassiveView,
  clampWeaponLevel,
  displayKindOf,
  isRefinement,
  maxWeaponLevel,
  refinementRow,
  resolveWeaponView,
  substatAtLevel,
  weaponLevels,
} from "./weaponPresentation";

/** Rust's passive is the canonical `damageTypes` scope case. */
const RUST = "rust";

function weapon(id: string) {
  const found = generatedWeaponsById.get(id);
  if (!found) throw new Error(`missing generated weapon: ${id}`);
  return found;
}

describe("weaponPresentation — level tables", () => {
  it("derives levels from the data rather than an assumed 1..90", () => {
    // Low-rarity weapons cap at 70. A hardcoded range would offer 20 levels
    // this weapon publishes no verified base ATK for.
    const capped = generatedWeapons.filter((w) => maxWeaponLevel(w) === 70);
    expect(capped.length).toBeGreaterThan(0);
    for (const w of capped) {
      expect(baseAtkAtLevel(w, 90)).toBeNull();
      expect(baseAtkAtLevel(w, 70)).not.toBeNull();
    }
  });

  it("every weapon's level table is contiguous from 1", () => {
    for (const w of generatedWeapons) {
      const levels = weaponLevels(w);
      expect(levels[0]).toBe(1);
      expect(levels[levels.length - 1]).toBe(levels.length);
    }
  });

  it("base ATK is strictly a lookup, and it grows with level", () => {
    const w = weapon(RUST);
    const low = baseAtkAtLevel(w, 1);
    const mid = baseAtkAtLevel(w, 50);
    const high = baseAtkAtLevel(w, 90);
    expect(low).not.toBeNull();
    expect(mid).not.toBeNull();
    expect(high).not.toBeNull();
    expect(low!).toBeLessThan(mid!);
    expect(mid!).toBeLessThan(high!);
  });

  it("clamps a too-high request down to a level the weapon publishes", () => {
    const capped = generatedWeapons.find((w) => maxWeaponLevel(w) === 70);
    expect(capped).toBeDefined();
    expect(clampWeaponLevel(capped!, 90)).toBe(70);
    expect(clampWeaponLevel(capped!, 55)).toBe(55);
    expect(clampWeaponLevel(capped!, 0)).toBe(1);
  });
});

describe("weaponPresentation — substat honesty", () => {
  it("reports a missing substat level as missing, never as zero", () => {
    // 138 weapons have no solvable substat at levels 40-44. The generator
    // omitted them rather than interpolating; the model must not paper over it.
    const gapped = generatedWeapons.filter(
      (w) => w.substat && w.substat.valueByLevel[42] === undefined,
    );
    expect(gapped.length).toBeGreaterThan(0);
    for (const w of gapped.slice(0, 20)) {
      const lookup = substatAtLevel(w, 42);
      expect(lookup.kind).toBe("unavailable-at-level");
      // The same weapon still has a real value at level 90.
      expect(substatAtLevel(w, 90).kind).toBe("value");
    }
  });

  it("distinguishes 'no substat at all' from 'no value at this level'", () => {
    const none = generatedWeapons.filter((w) => !w.substat);
    expect(none.length).toBeGreaterThan(0);
    for (const w of none) {
      expect(substatAtLevel(w, 90).kind).toBe("none");
      expect(substatAtLevel(w, 1).kind).toBe("none");
    }
  });

  it("returns the level's own substat value, not the level-90 value", () => {
    const w = weapon(RUST);
    const atOne = substatAtLevel(w, 1);
    const atNinety = substatAtLevel(w, 90);
    expect(atOne.kind).toBe("value");
    expect(atNinety.kind).toBe("value");
    if (atOne.kind !== "value" || atNinety.kind !== "value") throw new Error("unreachable");
    expect(atOne.substat.value).toBeLessThan(atNinety.substat.value);
  });
});

describe("weaponPresentation — refinement is indexing, not arithmetic", () => {
  it("rejects non-refinement numbers", () => {
    expect(isRefinement(0)).toBe(false);
    expect(isRefinement(6)).toBe(false);
    expect(isRefinement(2.5)).toBe(false);
    expect(isRefinement(3)).toBe(true);
  });

  it("returns the emitted R3 row rather than scaling R1", () => {
    const w = weapon(RUST);
    const r1 = refinementRow(w, 1);
    const r3 = refinementRow(w, 3);
    expect(r1).not.toBeNull();
    expect(r3).not.toBeNull();
    // Different refinements carry their OWN prose and their OWN numbers.
    expect(r3!.text).not.toBe(r1!.text);
    const r1Normal = r1!.modifiers.find((m) => m.damageTypes?.includes("normal"));
    const r3Normal = r3!.modifiers.find((m) => m.damageTypes?.includes("normal"));
    expect(r1Normal).toBeDefined();
    expect(r3Normal).toBeDefined();
    expect(r3Normal!.value).toBeGreaterThan(r1Normal!.value);
  });

  it("carries damageTypes scope through the view unchanged", () => {
    // Dropping `damageTypes` turns Rust's Normal-only bonus into a global one.
    const view = buildPassiveView(weapon(RUST), 3);
    expect(view).not.toBeNull();
    expect(view!.kind).toBe("simulated");
    const normal = view!.modifiers.find((m) => m.damageTypes?.includes("normal"));
    const charged = view!.modifiers.find((m) => m.damageTypes?.includes("charged"));
    expect(normal).toBeDefined();
    expect(charged).toBeDefined();
    // Neither grant is unscoped — every Rust modifier states its scope.
    for (const m of view!.modifiers) {
      expect(m.damageTypes).toBeDefined();
      expect(m.damageTypes!.length).toBeGreaterThan(0);
    }
    // The charged-attack clause is a PENALTY and keeps its sign.
    expect(charged!.value).toBeLessThan(0);
  });

  it("returns null for an absent refinement instead of substituting R1", () => {
    // Structural, not data-dependent: today every multi-row passive publishes
    // all five refinements, so a data-driven assertion could not reach this
    // branch and an R1 fallback would slip in unnoticed. A weapon that
    // publishes R1 and R2 only must answer "R5" with nothing, because
    // answering with R1 would understate a weapon the user owns at R5 — and
    // silently substituting a different refinement is the exact arithmetic-on-R1
    // shortcut the generator emits per-refinement rows to make unnecessary.
    const base = weapon(RUST);
    const rows = base.passive!.refinements;
    const twoRowWeapon: GeneratedWeapon = {
      ...base,
      passive: {
        name: base.passive!.name,
        refinements: [rows[0]!, rows[1]!],
      },
    };
    expect(refinementRow(twoRowWeapon, 2)).not.toBeNull();
    expect(refinementRow(twoRowWeapon, 5)).toBeNull();
    expect(buildPassiveView(twoRowWeapon, 5)).toBeNull();
    // And the rows it DOES publish still resolve to their own text.
    expect(buildPassiveView(twoRowWeapon, 2)!.text).toBe(rows[1]!.text);
  });

  it("a single-row passive applies at every refinement", () => {
    // Some passives publish one row that is the same statement at every
    // refinement. That row is shown for the selected refinement — which is a
    // different fact from substituting R1 for a missing R5.
    const singleRow = generatedWeapons.find(
      (w) => (w.passive?.refinements.length ?? 0) === 1,
    );
    expect(singleRow).toBeDefined();
    const view = buildPassiveView(singleRow!, 5);
    expect(view).not.toBeNull();
    expect(view!.singleRow).toBe(true);
    expect(view!.refinement).toBe(5);
  });

  it("never invents a refinement row the source does not publish", () => {
    for (const w of generatedWeapons) {
      const available = availableRefinements(w);
      if (!w.passive) {
        expect(available).toHaveLength(0);
        continue;
      }
      for (const r of available) {
        expect(refinementRow(w, r)).not.toBeNull();
      }
    }
  });
});

describe("weaponPresentation — bucket vocabulary is preserved, never promoted", () => {
  it("maps each generator bucket onto exactly one display kind", () => {
    expect(displayKindOf("expressible")).toBe("simulated");
    expect(displayKindOf("unimplemented")).toBe("not-simulated");
    expect(displayKindOf("unverified")).toBe("unverified");
  });

  it("claims 'simulated' only for the 30 expressible rows", () => {
    let simulated = 0;
    let total = 0;
    for (const w of generatedWeapons) {
      for (const r of w.passive?.refinements ?? []) {
        total += 1;
        if (displayKindOf(r.bucket) === "simulated") simulated += 1;
      }
    }
    // Ground truth measured from the generated data. If the generator starts
    // expressing more rows this must be updated DELIBERATELY, not silently.
    expect(total).toBe(1168);
    expect(simulated).toBe(30);
  });

  it("every non-simulated row carries a reason string to show the user", () => {
    for (const w of generatedWeapons) {
      for (const r of w.passive?.refinements ?? []) {
        if (displayKindOf(r.bucket) === "simulated") continue;
        expect(r.reason, `${w.id} r${r.refinement}`).toBeTruthy();
      }
    }
  });

  it("every passive row has renderable prose at every refinement", () => {
    for (const w of generatedWeapons) {
      for (const r of availableRefinements(w)) {
        const view = buildPassiveView(w, r);
        expect(view, `${w.id} r${r}`).not.toBeNull();
        expect(view!.text.length, `${w.id} r${r}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("weaponPresentation — migration from the legacy registry", () => {
  it("every legacy weapon id resolves in the generated data", () => {
    // The cutover cannot orphan a saved build or a shared link.
    const missing = allWeapons.filter((w) => !generatedWeaponsById.has(w.id));
    expect(missing.map((w) => w.id)).toEqual([]);
  });

  it("legacy level-90 base ATK matches the generated level-90 lookup", () => {
    const mismatches: string[] = [];
    for (const legacy of allWeapons) {
      const gen = generatedWeaponsById.get(legacy.id);
      if (!gen) continue;
      const atNinety = baseAtkAtLevel(gen, 90);
      if (atNinety === null) continue;
      if (Math.abs(atNinety - legacy.baseAtk) > 0.5) {
        mismatches.push(`${legacy.id}: legacy ${legacy.baseAtk} vs generated ${atNinety}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("legacy weapon types agree with the generated data", () => {
    for (const legacy of allWeapons) {
      const gen = generatedWeaponsById.get(legacy.id);
      if (!gen) continue;
      expect(gen.weaponType, legacy.id).toBe(legacy.weaponType);
    }
  });
});

describe("weaponPresentation — resolveWeaponView", () => {
  it("resolves every weapon at every published refinement without throwing", () => {
    for (const w of generatedWeapons) {
      const view = resolveWeaponView(w, 90, 1);
      expect(view.level).toBe(maxWeaponLevel(w));
      expect(view.baseAtk).not.toBeNull();
    }
  });

  it("reports the clamped level it actually used, not the requested one", () => {
    const capped = generatedWeapons.find((w) => maxWeaponLevel(w) === 70)!;
    const view = resolveWeaponView(capped, 90, 1);
    expect(view.level).toBe(70);
    expect(view.maxLevel).toBe(70);
    expect(view.baseAtk).toBe(baseAtkAtLevel(capped, 70));
  });

  it("a weapon with no passive resolves to a null passive view, not an empty one", () => {
    const none = generatedWeapons.find((w) => !w.passive);
    expect(none).toBeDefined();
    expect(resolveWeaponView(none!, 70, 1).passive).toBeNull();
  });
});
