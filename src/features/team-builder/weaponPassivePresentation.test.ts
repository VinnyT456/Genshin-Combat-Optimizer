import { describe, expect, it } from "vitest";
import { generatedWeapons, generatedWeaponsById } from "@/game-data/weapons/generated";
import {
  buildPassiveView,
  type Refinement,
} from "@/features/team-builder/weaponPresentation";
import {
  PASSIVE_SUPPORT_LABEL_ZH,
  UNSCOPED_SCOPE_ZH,
  formatModifierValue,
  passiveEffectRows,
  passiveSupport,
  scopeLabelZh,
} from "./weaponPassivePresentation";

function passiveView(id: string, refinement: Refinement) {
  const weapon = generatedWeaponsById.get(id);
  if (!weapon) throw new Error(`missing generated weapon: ${id}`);
  const view = buildPassiveView(weapon, refinement);
  if (!view) throw new Error(`missing passive view: ${id}`);
  return view;
}

describe("scopeLabelZh", () => {
  it("names each damage type the grant is confined to", () => {
    expect(scopeLabelZh(["normal"])).toBe("普通攻击");
    expect(scopeLabelZh(["normal", "charged"])).toBe("普通攻击、重击");
  });

  it("states an unscoped grant explicitly rather than leaving it blank", () => {
    // A blank scope reads as "unknown". The distinction between a confined and
    // a global grant is the whole reason `damageTypes` is carried.
    expect(scopeLabelZh(undefined)).toBe(UNSCOPED_SCOPE_ZH);
    expect(scopeLabelZh([])).toBe(UNSCOPED_SCOPE_ZH);
  });
});

describe("formatModifierValue", () => {
  it("prints fractional stats as percentages", () => {
    expect(formatModifierValue("dmgBonus", 0.4)).toBe("+40%");
    expect(formatModifierValue("critRate", 0.062)).toBe("+6.2%");
  });

  it("keeps a penalty negative rather than rendering it as a bonus", () => {
    // Rust's Charged Attack term is -10%. "+-10%" is broken and "+10%" is a lie.
    expect(formatModifierValue("dmgBonus", -0.1)).toBe("-10%");
  });

  it("prints flat stats without a percent sign", () => {
    expect(formatModifierValue("elementalMastery", 60)).toBe("+60");
    expect(formatModifierValue("atkFlat", 27)).toBe("+27");
  });
});

describe("Rust — the damageTypes scope case", () => {
  // Rust grants Normal Attack DMG only. Rendering it unscoped would state a
  // global bonus the weapon does not give.
  it("confines Rust's bonus to normal attacks, never globally", () => {
    const rows = passiveEffectRows(passiveView("rust", 1));
    expect(rows.length).toBeGreaterThan(0);
    const scopes = rows.map((r) => r.scope);
    expect(scopes).toContain("普通攻击");
    expect(scopes).not.toContain(UNSCOPED_SCOPE_ZH);
  });

  it("renders both the bonus and the penalty Rust actually carries", () => {
    const rows = passiveEffectRows(passiveView("rust", 1));
    const normal = rows.find((r) => r.scope === "普通攻击");
    const charged = rows.find((r) => r.scope === "重击");
    expect(normal?.value).toBe("+40%");
    expect(charged?.value).toBe("-10%");
  });

  it("indexes refinement rather than deriving it from R1", () => {
    const normalAt = (refinement: Refinement) =>
      passiveEffectRows(passiveView("rust", refinement)).find(
        (r) => r.scope === "普通攻击",
      );
    expect(normalAt(1)!.value).toBe("+40%");
    expect(normalAt(5)!.value).toBe("+80%");
    // The scope is a property of the effect, not of the refinement.
    expect(normalAt(5)!.scope).toBe(normalAt(1)!.scope);
  });

  it("reports Rust as simulated with no unimplemented reason", () => {
    const support = passiveSupport(passiveView("rust", 1));
    expect(support.kind).toBe("simulated");
    expect(support.label).toBe(PASSIVE_SUPPORT_LABEL_ZH.simulated);
    expect(support.reason).toBeUndefined();
  });
});

describe("honest support state across the live catalog", () => {
  it("gives every unimplemented row the generator's own reason", () => {
    // The blanket "display only" label discarded these. A user who cannot see
    // WHY an effect is absent cannot tell a missing channel from a bug.
    let checked = 0;
    for (const weapon of generatedWeapons) {
      const rows = weapon.passive?.refinements ?? [];
      for (const row of rows) {
        if (row.bucket !== "unimplemented") continue;
        const view = buildPassiveView(weapon, row.refinement);
        if (!view || view.kind !== "not-simulated") continue;
        const support = passiveSupport(view);
        expect(support.state).toBe("warning");
        if (row.reason !== undefined) {
          expect(support.reason).toBe(row.reason);
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("never claims an unimplemented passive is simulated", () => {
    for (const weapon of generatedWeapons) {
      for (const row of weapon.passive?.refinements ?? []) {
        if (row.bucket === "expressible") continue;
        const view = buildPassiveView(weapon, row.refinement);
        if (!view) continue;
        expect(passiveSupport(view).kind).not.toBe("simulated");
      }
    }
  });

  it("always renders prose, including where nothing is simulated", () => {
    // "Not simulated" must not mean "not shown": the source text is the only
    // thing the user has when the effect has no channel.
    for (const weapon of generatedWeapons) {
      for (const row of weapon.passive?.refinements ?? []) {
        const view = buildPassiveView(weapon, row.refinement);
        if (!view) continue;
        expect(view.text.length).toBeGreaterThan(0);
      }
    }
  });
});
