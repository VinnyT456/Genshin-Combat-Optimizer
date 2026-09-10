import { describe, expect, it } from "vitest";
import type { Buff } from "@/simulation/buffs/types";
import type { GenericCharacterDefinition } from "@/simulation/character/character";
import { generatedPerkEffects } from "@/game-data/characters/generated/perkEffects";
import {
  anemoGeneratedCharacters,
  cryoGeneratedCharacters,
  dendroGeneratedCharacters,
  electroGeneratedCharacters,
  geoGeneratedCharacters,
  hydroGeneratedCharacters,
  pyroGeneratedCharacters,
} from "@/game-data/characters/generated";

// ============================================================================
// PERK CHANNEL RECONCILIATION — one set of perks, two representations.
//
// The same 259 talent-boost perks are emitted TWICE, for two different
// consumers:
//
//   PRESENTATION  `generatedPerkEffects[].talentLevelBoost`
//                 read by the UI's `classifyPerk` to DESCRIBE a perk.
//   ENGINE        `ConstellationDefinition.buffs[].talentLevelModifiers`
//                 harvested by `perkBuffs.ts` and EXECUTED as damage.
//
// Two representations of one fact is a drift hazard: the UI can claim "+3
// Elemental Skill levels" while the engine applies +2, or applies nothing at
// all, and every other test in the repo still passes. Nothing currently
// forces them to agree — the emitter writes both, and an emitter change could
// silently move one.
//
// THIS FILE IS THAT FORCING FUNCTION. It asserts, in lockstep:
//
//   1. the ID SETS are equal — no perk boosts in one channel and not the other
//   2. the VALUES agree — same slot, same level count, per id
//   3. the presentation channel does not claim a boost the engine cannot run
//
// It is a DATA-CONSISTENCY test, not a claim that either number is correct
// against the game; provenance is the generator's job.
//
// WHAT THIS DOES NOT DO: it does not flip the UI's `PERK_EFFECTS_REACH_ENGINE`
// gate. That gate is frontend-owned and also needs the adapter's team-type
// widening. This test establishes the PRECONDITION the gate would rely on, so
// the flip can later be made on evidence rather than on assumption.
// ============================================================================

const ALL_CHARACTERS: readonly GenericCharacterDefinition[] = [
  ...anemoGeneratedCharacters,
  ...cryoGeneratedCharacters,
  ...dendroGeneratedCharacters,
  ...electroGeneratedCharacters,
  ...geoGeneratedCharacters,
  ...hydroGeneratedCharacters,
  ...pyroGeneratedCharacters,
];

/** One perk's talent-level boost, as either channel expresses it. */
interface Boost {
  slot: string;
  levels: number;
}

/** Every `talentLevelModifier` reachable through the ENGINE channel, by perk id. */
function engineBoosts(): ReadonlyMap<string, Boost> {
  const out = new Map<string, Boost>();
  const collect = (id: string, buffs: readonly Buff[] | undefined): void => {
    for (const buff of buffs ?? []) {
      for (const modifier of buff.talentLevelModifiers ?? []) {
        out.set(id, { slot: modifier.slot, levels: modifier.levels });
      }
    }
  };
  // Fixed walk: element groups in import order, then each character's
  // passives before its constellations. No `Object.keys` anywhere.
  for (const character of ALL_CHARACTERS) {
    for (const passive of character.passives) collect(passive.id, passive.buffs);
    for (const c of character.constellations) collect(c.id, c.buffs);
  }
  return out;
}

/** Every talent-level boost the PRESENTATION channel states, by perk id. */
function presentationBoosts(): ReadonlyMap<string, Boost> {
  const out = new Map<string, Boost>();
  for (const row of generatedPerkEffects) {
    if (!row.talentLevelBoost) continue;
    out.set(row.id, {
      slot: row.talentLevelBoost.slot,
      levels: row.talentLevelBoost.levels,
    });
  }
  return out;
}

describe("presentation and engine perk channels are in lockstep", () => {
  it("PRECONDITION: today every talent boost sits on a CONSTELLATION", () => {
    // Honest note on an EQUIVALENT MUTANT. Deleting the passive walk from
    // `engineBoosts()` changes nothing today, because zero passives carry a
    // talent boost — so the lockstep assertions below cannot detect that
    // deletion. Rather than claim coverage this file does not have, the
    // precondition that makes the mutant equivalent is pinned HERE.
    //
    // If an emitter ever puts a boost on an ascension passive, this test fails
    // FIRST and points at the passive walk that must then be exercised.
    const kinds = new Set(
      generatedPerkEffects.filter((r) => r.talentLevelBoost).map((r) => r.kind),
    );
    expect([...kinds].sort()).toEqual(["constellation"]);
  });

  it("both channels describe a non-trivial number of perks", () => {
    // Guards against the vacuous pass: if an emitter change empties one
    // channel, the set-difference assertions below would both trivially hold.
    expect(presentationBoosts().size).toBeGreaterThan(200);
    expect(engineBoosts().size).toBeGreaterThan(200);
  });

  it("the ID SETS are equal — set difference empty in BOTH directions", () => {
    const presentation = presentationBoosts();
    const engine = engineBoosts();

    const onlyPresentation = [...presentation.keys()]
      .filter((id) => !engine.has(id))
      .sort();
    const onlyEngine = [...engine.keys()]
      .filter((id) => !presentation.has(id))
      .sort();

    // A perk the UI describes as boosting a talent but the engine never runs
    // is exactly the overclaim this file exists to prevent.
    expect(onlyPresentation).toEqual([]);
    // The reverse is a silent UNDER-claim: real damage the UI cannot explain.
    expect(onlyEngine).toEqual([]);
    expect(engine.size).toBe(presentation.size);
  });

  it("the VALUES agree per perk — same slot, same level count", () => {
    const engine = engineBoosts();
    const disagreements: string[] = [];
    // Walk the presentation channel in its emitted order, so a failure message
    // is stable across runs rather than depending on Map iteration.
    for (const row of generatedPerkEffects) {
      const stated = row.talentLevelBoost;
      if (!stated) continue;
      const executed = engine.get(row.id);
      if (!executed) continue; // covered by the ID-set test above
      if (executed.slot !== stated.slot || executed.levels !== stated.levels) {
        disagreements.push(
          `${row.id}: presentation ${stated.slot}+${stated.levels}, engine ${executed.slot}+${executed.levels}`,
        );
      }
    }
    expect(disagreements).toEqual([]);
  });

  it("every boosting perk is reachable from its own character definition", () => {
    // Id equality alone would still pass if a boost were attached to the wrong
    // character. `GeneratedPerkEffect.characterId` is checked against the
    // definition that actually carries the buff.
    const ownerById = new Map<string, string>();
    for (const character of ALL_CHARACTERS) {
      for (const passive of character.passives) ownerById.set(passive.id, character.id);
      for (const c of character.constellations) ownerById.set(c.id, character.id);
    }
    const misattributed: string[] = [];
    for (const row of generatedPerkEffects) {
      if (!row.talentLevelBoost) continue;
      const owner = ownerById.get(row.id);
      if (owner !== row.characterId) {
        misattributed.push(`${row.id}: row says ${row.characterId}, definition says ${owner}`);
      }
    }
    expect(misattributed).toEqual([]);
  });

  it("a talent-boosting perk is always gated by a real unlock condition", () => {
    // A constellation boost must sit on a constellation with a level, and an
    // ascension passive must state its phase. An ungated boost would apply at
    // C0, which is the C6-at-C0 overclaim in its most damaging form.
    const ungated: string[] = [];
    for (const row of generatedPerkEffects) {
      if (!row.talentLevelBoost) continue;
      if (row.kind === "constellation") {
        if (row.constellationLevel === undefined) ungated.push(row.id);
      } else if (row.unlockAscension === undefined) {
        ungated.push(row.id);
      }
    }
    expect(ungated).toEqual([]);
  });
});
