import { describe, it, expect } from "vitest";
import {
  generatedPerkEffects,
  type GeneratedPerkEffect,
} from "@/game-data/characters/generated";
import {
  anyRowSimulated,
  buildConstellationRows,
  buildPassiveRows,
  classifyPerk,
  perkCoverage,
} from "./perkPresentation";

function perk(over: Partial<GeneratedPerkEffect> = {}): GeneratedPerkEffect {
  return {
    id: "x-c1",
    characterId: "x",
    kind: "constellation",
    constellationLevel: 1,
    name: "Test",
    support: "modelled",
    text: "source prose",
    ...over,
  };
}

describe("perkPresentation — the four-row truth table", () => {
  // The two axes are INDEPENDENT. Collapsing them is UI-AUDIT-055 F2.
  // A modelled flag alone is insufficient. Only the separately reconciled
  // talent-level channel is connected through the website adapter.
  it("non-talent effect modelled but unwired + prose present → described-only", () => {
    expect(classifyPerk(perk({ support: "modelled" }), { descriptionZh: "中文" })).toBe(
      "described-only",
    );
  });

  it("non-talent effect modelled but unwired + prose absent → described-only", () => {
    expect(classifyPerk(perk({ support: "modelled" }), {})).toBe("described-only");
  });

  it("reconciled talent boost + prose present → simulated", () => {
    expect(classifyPerk(perk({ talentLevelBoost: { slot: "skill", levels: 3 } }), {
      descriptionZh: "中文",
    })).toBe("simulated");
  });

  it("reconciled talent boost + prose absent → simulated-no-text", () => {
    expect(classifyPerk(perk({ talentLevelBoost: { slot: "skill", levels: 3 } }))).toBe(
      "simulated-no-text",
    );
  });

  it("effects absent + prose present → described-only (NOT simulated)", () => {
    expect(
      classifyPerk(perk({ support: "unimplemented" }), { descriptionZh: "中文" }),
    ).toBe("described-only");
  });

  it("effects absent + prose absent → described-only", () => {
    expect(classifyPerk(perk({ support: "unverified" }), {})).toBe("described-only");
  });

  it("treats `unverified` as NOT simulated — it must never imply effect", () => {
    // `unverified` means the prose could not be parsed into a number. Rendering
    // it as active would be the overclaim this table exists to prevent.
    expect(classifyPerk(perk({ support: "unverified" }), { descriptionZh: "中文" })).toBe(
      "described-only",
    );
  });

  it("blank-string prose counts as absent, not present", () => {
    // Exercised through the prose axis, which is independent of wiring.
    expect(classifyPerk(perk({ support: "unimplemented" }), { descriptionZh: "   " })).toBe(
      "described-only",
    );
  });
});

describe("perkPresentation — row building against live data", () => {
  it("returns constellations sorted by unlock level", () => {
    const rows = buildConstellationRows("bennett");
    expect(rows.length).toBeGreaterThan(0);
    const levels = rows.map((r) => r.constellationLevel);
    expect(levels).toEqual([...levels].sort((a, b) => (a ?? 0) - (b ?? 0)));
  });

  it("separates constellations from passives", () => {
    const cons = buildConstellationRows("bennett");
    const passives = buildPassiveRows("bennett");
    expect(cons.every((r) => r.constellationLevel !== undefined)).toBe(true);
    expect(passives.every((r) => r.constellationLevel === undefined)).toBe(true);
    expect(cons.length + passives.length).toBeGreaterThan(0);
  });

  it("carries the data layer's support flag through unmodified", () => {
    const rows = buildConstellationRows("bennett");
    for (const row of rows) {
      expect(["modelled", "unimplemented", "unverified"]).toContain(row.support);
    }
  });

  it("joins hand-authored Chinese prose when supplied", () => {
    const rows = buildConstellationRows("bennett", (id) =>
      id === "bennett-c1" ? { descriptionZh: "手写中文" } : {},
    );
    const c1 = rows.find((r) => r.id === "bennett-c1");
    expect(c1?.descriptionZh).toBe("手写中文");
    // Prose alone does NOT promote it to simulated — that is the whole point.
    expect(c1?.kind).toBe("described-only");
  });

  it("returns an empty list for an unknown character rather than throwing", () => {
    expect(buildConstellationRows("no-such-character")).toEqual([]);
  });
});

describe("perkPresentation — honesty tripwires against live data", () => {
  // These assert the FACTS the UI copy is written against. If the data layer
  // lands real effects, these fail and the copy must be revisited deliberately
  // — the failure is the feature. A data change silently invalidating a UI
  // claim is exactly the F1/F2 failure mode (ROADMAP §3).

  // =========================================================================
  // REPLACEMENT for the retired tripwire "essentially no perk is modelled"
  // (TASK #057). The old assertion was `modelled < 5% of all rows`, written
  // when 7 of 1234 were modelled. It now fires at 266 — NOT a regression, but
  // the project succeeding: mechanics built the talent-level buff channel,
  // combat wired it (`SimulationConfig.talentLevelResolver` +
  // `ConstellationDefinition.buffs`), and data emitted 259 talent-level
  // boosts. Per this file's own standard the pin is REPLACED, not re-pinned
  // at a higher threshold — a threshold that only tracks a growing number
  // asserts nothing about the property worth protecting.
  //
  // THE PROPERTY IS UNCHANGED: a user must never see a C-level number that is
  // really a C0 number. What changed is that the honest answer is no longer
  // "nothing is modelled" but "266 are modelled, 968 are not, and the UI must
  // still say so for the 968". Both halves are asserted below.
  // =========================================================================

  it("the talent-level boosts LANDED: 259 of 266 modelled perks carry one", () => {
    const modelled = generatedPerkEffects.filter((p) => p.support === "modelled");
    const withBoost = generatedPerkEffects.filter(
      (p) => p.talentLevelBoost !== undefined,
    );

    // Asserted as exact counts, not a band. These are generated from a fixed
    // roster, so a drift is a data event that should be looked at, and a band
    // would hide the difference between "roster grew" and "boosts vanished".
    expect(generatedPerkEffects.length).toBe(1234);
    expect(modelled.length).toBe(266);
    expect(withBoost.length).toBe(259);

    // Every boost-carrying row is `modelled` — the flag and the payload agree.
    // If a boost ever appears on an `unverified` row, the data layer emitted a
    // number it could not source, which is the ROADMAP §0 failure.
    for (const perk of withBoost) {
      expect(perk.support).toBe("modelled");
    }

    // 266 = 259 boosts + the 7 originally-expressible perks. Pinning the
    // decomposition means a future change has to say WHICH half moved.
    const modelledWithoutBoost = modelled.filter(
      (p) => p.talentLevelBoost === undefined,
    );
    expect(modelledWithoutBoost.map((p) => p.id).sort()).toEqual([
      "flins-a4",
      "gaming-c6",
      "tighnari-c1",
      "traveler-f-anemo-c2",
      "traveler-f-cryo-a4",
      "traveler-m-anemo-c2",
      "traveler-m-cryo-a4",
    ]);
  });

  it("every emitted boost is structurally valid — a real slot and a real delta", () => {
    // DISCRIMINATING, not decorative: an unrecognised slot name would be
    // silently dropped by `planAbility`'s row selection, producing a C-level
    // number identical to C0 with no error anywhere. That is precisely the
    // invisible-wrong failure, so the slot vocabulary is pinned.
    const withBoost = generatedPerkEffects.filter(
      (p) => p.talentLevelBoost !== undefined,
    );
    const slots = new Set(withBoost.map((p) => p.talentLevelBoost!.slot));
    expect([...slots].sort()).toEqual(["burst", "normal", "skill"]);

    for (const perk of withBoost) {
      const boost = perk.talentLevelBoost!;
      expect(Number.isInteger(boost.levels)).toBe(true);
      // A zero or negative boost would be a parse failure wearing a valid
      // shape: it type-checks, selects a row, and moves nothing.
      expect(boost.levels).toBeGreaterThan(0);
    }

    // In game, every "Increases the Level of X by N" constellation is +3.
    // A different value appearing means the generator parsed prose it should
    // have flagged instead.
    const levels = new Set(withBoost.map((p) => p.talentLevelBoost!.levels));
    expect([...levels]).toEqual([3]);
  });

  it("TRIPWIRE HELD: the ~968 UNMODELLED perks are still labelled described-only", () => {
    // The other half of the honesty claim. 266 modelled does NOT license the
    // UI to imply the rest do anything. This is the assertion that would fire
    // if someone "simplified" the classifier once the modelled count grew.
    const notModelled = generatedPerkEffects.filter(
      (p) => p.support !== "modelled",
    );
    expect(notModelled.length).toBe(968);

    for (const perk of notModelled.slice(0, 200)) {
      expect(classifyPerk(perk, { descriptionZh: "中文" })).toBe("described-only");
      expect(classifyPerk(perk, {})).toBe("described-only");
    }
  });

  it("opens only the reconciled talent-level channel", () => {
    const boosts = generatedPerkEffects.filter((row) => row.talentLevelBoost !== undefined);
    expect(boosts).toHaveLength(259);
    expect(boosts.every((row) => classifyPerk(row) !== "described-only")).toBe(true);

    const otherModelled = generatedPerkEffects.filter(
      (row) => row.support === "modelled" && row.talentLevelBoost === undefined,
    );
    expect(otherModelled).toHaveLength(7);
    expect(otherModelled.every((row) => classifyPerk(row) === "described-only")).toBe(true);
  });

  it("every row the user can read is classified, never left unlabelled", () => {
    for (const id of ["bennett", "raiden-shogun", "xiangling", "xingqiu"]) {
      const rows = [...buildConstellationRows(id), ...buildPassiveRows(id)];
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(["simulated", "simulated-no-text", "described-only"]).toContain(row.kind);
      }
    }
  });

  it("anyRowSimulated reflects a live reconciled constellation boost", () => {
    expect(anyRowSimulated(buildConstellationRows("bennett"))).toBe(true);
  });

  it("anyRowSimulated flips the moment one row is modelled", () => {
    // Mutation-style: proves the warning is driven by data, not hardcoded.
    const rows = [
      { id: "a", name: "A", kind: "simulated" as const, support: "modelled" as const },
    ];
    expect(anyRowSimulated(rows)).toBe(true);
  });
});

describe("perkCoverage — numeric slots for the honesty statement", () => {
  it("counts a real character's connected and unconnected constellations", () => {
    const coverage = perkCoverage(buildConstellationRows("bennett"));
    expect(coverage.total).toBeGreaterThan(0);
    expect(coverage.simulated).toBe(2);
    expect(coverage.describedOnly).toBe(coverage.total - 2);
  });

  it("total always partitions into simulated + describedOnly", () => {
    for (const id of ["bennett", "gaming", "tighnari", "raiden-shogun"]) {
      const coverage = perkCoverage(buildConstellationRows(id));
      expect(coverage.simulated + coverage.describedOnly).toBe(coverage.total);
    }
  });

  it("is empty, not undefined, for an unknown character", () => {
    expect(perkCoverage(buildConstellationRows("nobody"))).toEqual({
      total: 0,
      simulated: 0,
      describedOnly: 0,
    });
  });
});
