import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import type {
  ArtifactSetBonusBuffs,
  EquipmentBuffsByCharacter,
} from "@/simulation/engine/equipmentBuffs";
import { harvestArtifactSetBuffs } from "@/simulation/engine/equipmentBuffs";
import type {
  ArtifactLoadout,
  ArtifactPiece,
  ArtifactSlot,
} from "@/simulation/character/equipment";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import { allArtifacts } from "./registry";
import { testPyro } from "@/game-data/characters/testPyro";
import { testElectro } from "@/game-data/characters/testElectro";
import { testEnemy } from "@/game-data/enemies/testEnemy";
import type { GeneratedArtifactEffect } from "./generated/setEffects";
import { generatedArtifactEffects } from "./generated/setEffects";
import {
  allArtifactSetBonusBuffs,
  artifactSetBonusBuffsBySetId,
  buffsForSetBonus,
  setBonusBuffs,
  setBonusBuffsById,
  setBonusBuffsFromRows,
} from "./setBonusBuffs";

// ============================================================================
// The generated-set-bonus -> `Buff` adapter, proven END TO END.
//
// The engine's artifact channel was live but UNFED: `harvestArtifactSetBuffs()`
// consumes authored `Buff` objects and gates them correctly on
// `activeSetBonusKeys()`, while the generator emits its own sourced shape. No
// module joined the two, so all 46 modelled set bonuses moved zero damage.
//
// These tests pin the translation at the only place it can be proven -- a
// damage number out of `simulateRotation` -- and pin the ways it can be
// silently wrong while every structural check still passes:
//
//   SCOPE DROPPED    a Normal-only +15% applied to a Burst. The buff exists,
//                    the damage moves, and the number is too big.
//   SCOPE WIDENED    an unrecognised scope word (`"plunging"` for the engine's
//                    `"plunge"`) treated as "no scope". Same failure, worse:
//                    it is a typo, not a design choice.
//   TIER LEAKED      a 4pc bonus applying at 2 pieces.
//   TARGETING WRONG  a wearer-only bonus reaching a teammate, or a party-wide
//                    one failing to. Both are plausible wrong numbers.
//   BUCKET IGNORED   an `unimplemented` row applied at 100% uptime. Its
//                    numbers are real; its GATING is not statable. Applying it
//                    is the `docs/ROADMAP.md` 0 failure mode.
//
// SYNTHETIC FIXTURES ARE USED DELIBERATELY where the real data is uniformly
// one way. Every one of the 46 modelled rows today is a 2-piece, wearer-scoped
// bonus stating at most ONE condition. A sweep over real data would therefore
// confirm the multi-scope split, the `party` classifier and the 4pc tier
// vacuously -- it would pass just as happily against an implementation that
// hardcoded `active`, folded scopes, and ignored the 4pc key. The synthetic
// rows below are labelled INVENTED and exist to make those three mutants die.
// ============================================================================

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Real generated sets, chosen for what they discriminate. */
const GLADIATOR = "gladiators-finale"; // 2pc unscoped ATK +18%
const NOBLESSE = "noblesse-oblige"; // 2pc Burst-scoped DMG +20%
const MARTIAL_ARTIST = "martial-artist"; // 2pc Normal/Charged-scoped DMG +15%
const LONG_NIGHTS_OATH = "long-nights-oath"; // 2pc plunge-scoped DMG +25%

const NORMAL_ROTATION: Rotation = [
  { characterId: testPyro.id, actionType: "normal" },
];
const BURST_ROTATION: Rotation = [
  { characterId: testPyro.id, actionType: "skill" },
  { characterId: testPyro.id, actionType: "burst" },
];

function piece(slot: ArtifactSlot, setId: string): ArtifactPiece {
  return { slot, setId, mainStat: { stat: "atkFlat", value: 0 }, substats: [] };
}

/** A loadout of `count` pieces of one set. Missing slots stay absent. */
function loadout(setId: string, count: number): ArtifactLoadout {
  const slots: readonly ArtifactSlot[] = [
    "flower",
    "plume",
    "sands",
    "goblet",
    "circlet",
  ];
  const worn: ArtifactLoadout = {};
  for (const slot of slots.slice(0, count)) worn[slot] = piece(slot, setId);
  return worn;
}

/**
 * Damage for a rotation with one set equipped at `pieceCount`.
 *
 * `setBonuses` is passed as the WHOLE generated list, which is the intended
 * production use: `harvestArtifactSetBuffs()` gates every entry on the equipped
 * piece count, so sets the character is not wearing must contribute nothing.
 * Passing the full list is therefore also a test that the gate works.
 */
function damageWith(
  setId: string | undefined,
  pieceCount: number,
  rotation: Rotation,
): number {
  let config: SimulationConfig = {};
  if (setId !== undefined) {
    const equipmentBuffs: EquipmentBuffsByCharacter = {
      [testPyro.id]: {
        artifacts: loadout(setId, pieceCount),
        setBonuses: allArtifactSetBonusBuffs,
      },
    };
    config = { equipmentBuffs };
  }
  return simulateRotation([testPyro], rotation, testEnemy, config).totalDamage;
}

function effectById(id: string): GeneratedArtifactEffect {
  const effect = generatedArtifactEffects.find((row) => row.id === id);
  expect(effect, `generated data must still contain ${id}`).toBeDefined();
  return effect!;
}

// ---------------------------------------------------------------------------
// 1. The bonus reaches the damage number at all
// ---------------------------------------------------------------------------

describe("a set bonus changes damage through simulateRotation", () => {
  it("Gladiator's 2pc ATK +18% raises Normal Attack damage", () => {
    const without = damageWith(undefined, 0, NORMAL_ROTATION);
    const with2pc = damageWith(GLADIATOR, 2, NORMAL_ROTATION);
    expect(with2pc).toBeGreaterThan(without);
  });

  it("one piece grants nothing -- the 2pc gate is real", () => {
    // Bit-identical, not merely close: at 1 piece NO buff exists, so this is
    // the same computation, not a smaller one.
    expect(damageWith(GLADIATOR, 1, NORMAL_ROTATION)).toBe(
      damageWith(undefined, 0, NORMAL_ROTATION),
    );
  });

  it("wearing 4 pieces is not more than 2 when only the 2pc is modelled", () => {
    // Gladiator's 4pc is `unimplemented` (Normal Attack DMG, gated on weapon
    // type). It must contribute NOTHING even at 4 pieces. A naive adapter that
    // emitted every row of the set would make this strictly greater.
    expect(damageWith(GLADIATOR, 4, NORMAL_ROTATION)).toBe(
      damageWith(GLADIATOR, 2, NORMAL_ROTATION),
    );
  });

  it("a set the character is not wearing contributes nothing", () => {
    // The full generated list is passed in every case above; only the equipped
    // set may apply. Bit-identical to the ungeared run.
    const noPieces = simulateRotation([testPyro], NORMAL_ROTATION, testEnemy, {
      equipmentBuffs: {
        [testPyro.id]: { artifacts: {}, setBonuses: allArtifactSetBonusBuffs },
      },
    }).totalDamage;
    expect(noPieces).toBe(damageWith(undefined, 0, NORMAL_ROTATION));
  });
});

// ---------------------------------------------------------------------------
// 2. `damageTypes` scope survives the round trip
// ---------------------------------------------------------------------------

describe("damage-type scope survives the round trip", () => {
  it("Noblesse 2pc (Burst-scoped) does NOT touch a Normal Attack", () => {
    // The load-bearing assertion. `toBe`, not `toBeCloseTo`: an out-of-scope
    // hit must be the SAME computation, not a nearly-equal one. An adapter
    // that dropped `conditions` would hand +20% to this Normal Attack.
    expect(damageWith(NOBLESSE, 2, NORMAL_ROTATION)).toBe(
      damageWith(undefined, 0, NORMAL_ROTATION),
    );
  });

  it("Noblesse 2pc DOES raise a Burst", () => {
    expect(damageWith(NOBLESSE, 2, BURST_ROTATION)).toBeGreaterThan(
      damageWith(undefined, 0, BURST_ROTATION),
    );
  });

  it("Martial Artist 2pc (Normal/Charged) raises Normal, not Burst", () => {
    expect(damageWith(MARTIAL_ARTIST, 2, NORMAL_ROTATION)).toBeGreaterThan(
      damageWith(undefined, 0, NORMAL_ROTATION),
    );
    expect(damageWith(MARTIAL_ARTIST, 2, BURST_ROTATION)).toBe(
      damageWith(undefined, 0, BURST_ROTATION),
    );
  });

  it("the scoped buff carries exactly the generated scope", () => {
    const buffs = buffsForSetBonus(effectById("martial-artist-2pc"));
    expect(buffs).toHaveLength(1);
    expect(buffs[0]!.conditions?.damageTypes).toEqual(["normal", "charged"]);
  });

  it("Long Night's Oath 2pc uses the engine's `plunge`, not `plunging`", () => {
    // REGRESSION. The generator emitted `"plunging"`, which the generated
    // shape types as `string` and so type-checked, and which matches no
    // `DamageType` -- silently voiding this bonus. Asserting the STRING is the
    // point: a test that only checked "some scope is present" passed while the
    // set granted nothing.
    const buffs = buffsForSetBonus(effectById("long-nights-oath-2pc"));
    expect(buffs).toHaveLength(1);
    expect(buffs[0]!.conditions?.damageTypes).toEqual(["plunge"]);
  });

  it("Long Night's Oath 2pc moves no damage on a NON-plunge rotation", () => {
    // The regression above, proven at the damage number rather than the data
    // shape. Under the original `"plunging"` typo the scope matched no hit and
    // this passed for the WRONG reason; with the scope widened to "no gate"
    // instead of rejected, a plunge-only +25% would land on this Normal
    // Attack. `toBe`, not `toBeCloseTo`: an out-of-scope hit is the same
    // computation. `testPyro` has no plunge ability, so the positive case
    // cannot be stated with the shared fixtures -- the DATA-layer assertion
    // above carries it, and this pins the half that damage can see.
    expect(damageWith(LONG_NIGHTS_OATH, 2, NORMAL_ROTATION)).toBe(
      damageWith(undefined, 0, NORMAL_ROTATION),
    );
    expect(damageWith(LONG_NIGHTS_OATH, 2, BURST_ROTATION)).toBe(
      damageWith(undefined, 0, BURST_ROTATION),
    );
  });

  it("no generated scope word is silently dropped", () => {
    // Sweeps every modelled row and asserts the converted buff states EXACTLY
    // as many scope members as the row did. This catches a validator that
    // filtered an unknown word away instead of rejecting the row -- the
    // widening bug -- across all 46 rows, not just the ones named above.
    for (const effect of generatedArtifactEffects) {
      if (effect.support !== "modelled") continue;
      const buffs = buffsForSetBonus(effect);
      const stated = effect.conditions?.damageTypes;
      if (!stated) continue;
      expect(buffs.length, `${effect.id} must yield a buff`).toBeGreaterThan(0);
      for (const buff of buffs) {
        expect(buff.conditions?.damageTypes, effect.id).toEqual(stated);
      }
    }
  });

  it("element scope survives too (Bloodstained 2pc is Physical-only)", () => {
    const buffs = buffsForSetBonus(effectById("bloodstained-chivalry-2pc"));
    expect(buffs).toHaveLength(1);
    expect(buffs[0]!.conditions?.elements).toEqual(["physical"]);
  });
});

// ---------------------------------------------------------------------------
// 3. `party` vs `active` targeting -- SYNTHETIC, because real data has no
//    modelled party-wide row (see the header).
// ---------------------------------------------------------------------------

describe("party vs active targeting", () => {
  /**
   * INVENTED ROW. Not a real set bonus. Its wording is the game's fixed
   * team-wide phrasing ("all party members") and its number (+50% ATK) is
   * chosen large and round so the assertion is unmistakable. It exists because
   * every genuinely party-wide bonus in the game -- Noblesse Oblige 4pc above
   * all -- is currently `unimplemented`, so real data proves nothing here.
   */
  const SYNTHETIC_PARTY: GeneratedArtifactEffect = {
    id: "synthetic-party-2pc",
    setSlug: "synthetic-party",
    setId: 99001,
    pieces: 2,
    text: "Increases ATK of all party members by 50%.",
    textZh: "队伍中所有角色攻击力提升50%。",
    support: "modelled",
    modifiers: [{ stat: "atkPercent", value: 0.5 }],
  };

  /** INVENTED ROW. Identical but for wording -- wearer-only. Same +50%. */
  const SYNTHETIC_ACTIVE: GeneratedArtifactEffect = {
    ...SYNTHETIC_PARTY,
    id: "synthetic-active-2pc",
    setSlug: "synthetic-active",
    text: "ATK +50%.",
    textZh: "攻击力提高50%。",
  };

  it("classifies team-wide prose as `party` and the rest as `active`", () => {
    expect(buffsForSetBonus(SYNTHETIC_PARTY)[0]!.targets).toEqual({
      scope: "party",
    });
    expect(buffsForSetBonus(SYNTHETIC_ACTIVE)[0]!.targets).toEqual({
      scope: "active",
    });
  });

  /**
   * Damage of a two-character rotation where only PYRO wears the set, split
   * per character. The teammate wears nothing, so anything reaching them
   * arrived through targeting.
   */
  function teamDamageByCharacter(
    effect: GeneratedArtifactEffect | undefined,
  ): Readonly<Record<string, number>> {
    const rotation: Rotation = [
      { characterId: testPyro.id, actionType: "normal" },
      { characterId: testElectro.id, actionType: "normal" },
    ];
    let config: SimulationConfig = {};
    if (effect) {
      const bonus: ArtifactSetBonusBuffs = {
        setId: effect.setSlug,
        twoPiece: buffsForSetBonus(effect),
      };
      config = {
        equipmentBuffs: {
          [testPyro.id]: {
            artifacts: loadout(effect.setSlug, 2),
            setBonuses: [bonus],
          },
        },
      };
    }
    return simulateRotation([testPyro, testElectro], rotation, testEnemy, config)
      .damageByCharacter;
  }

  it("a `party` set reaches the teammate who wears nothing", () => {
    const bare = teamDamageByCharacter(undefined);
    const party = teamDamageByCharacter(SYNTHETIC_PARTY);
    // The wearer is buffed...
    expect(party[testPyro.id]!).toBeGreaterThan(bare[testPyro.id]!);
    // ...and so is the teammate, which is what `party` MEANS.
    expect(party[testElectro.id]!).toBeGreaterThan(bare[testElectro.id]!);
  });

  it("KNOWN ENGINE GAP: `active` currently reaches the teammate too", () => {
    // THIS TEST PINS A BUG, NOT A DESIRED BEHAVIOUR. It is written as an
    // equality so that FIXING the engine fails it loudly and brings someone
    // back to this comment, rather than leaving a silently-wrong number.
    //
    // WHAT IS WRONG. `harvestTeamEquipmentBuffs()` pools every character's
    // equipment buffs into ONE team-wide list, and `matchesTargets()` then
    // resolves `scope: "active"` as "the character who is on-field for the hit
    // being evaluated". For an always-on equipment buff those two steps
    // compose badly: whoever is acting IS the on-field character, so an
    // `active`-scoped buff matches every attacker and behaves exactly like
    // `party`. The buff's provenance -- WHOSE equipment produced it -- is lost
    // at the pooling step, so the wearer can no longer be identified.
    //
    // SCOPE OF THE BUG. It is not this adapter's: it reproduces with a
    // hand-built `Buff` and no artifact data involved, and it applies equally
    // to `weaponBuffs.ts`, which uses `scope: "active"` for the same reason.
    // The weapon adapter's own targeting claim is currently unproven for the
    // same reason. Fixing it means either carrying the owning character on the
    // buff (`scope: "self"` plus `sourceCharacterId`, set at harvest time) or
    // resolving equipment buffs per-character rather than pooling them --
    // both changes to `src/simulation/engine/equipmentBuffs.ts`, which this
    // module does not own. REPORTED to the Manager.
    //
    // WHY THE ADAPTER STILL CLASSIFIES. `targets.scope` is emitted correctly
    // (asserted above, at the data layer, where it is genuinely observable).
    // Hardcoding `active` because the engine cannot yet tell the two apart
    // would bake the bug into the DATA, so that fixing the engine silently
    // turned every party-wide set into a single-target one.
    const bare = teamDamageByCharacter(undefined);
    const active = teamDamageByCharacter(SYNTHETIC_ACTIVE);
    expect(active[testPyro.id]!).toBeGreaterThan(bare[testPyro.id]!);
    expect(active[testElectro.id]!).toBeGreaterThan(bare[testElectro.id]!);
  });

  it("the two scopes are DATA-distinct even though damage cannot see it", () => {
    // The claim that survives the engine gap: the round trip preserves the
    // per-set decision. When the engine gap closes, the damage numbers above
    // diverge with no change to this module.
    const party = buffsForSetBonus(SYNTHETIC_PARTY);
    const active = buffsForSetBonus(SYNTHETIC_ACTIVE);
    expect(party.map((b) => b.targets.scope)).toEqual(["party"]);
    expect(active.map((b) => b.targets.scope)).toEqual(["active"]);
    // Same modifiers -- targeting is the ONLY difference, so nothing else can
    // be masking the classification.
    expect(party[0]!.modifiers).toEqual(active[0]!.modifiers);
  });

  it("every real modelled row today is `active`", () => {
    // Documents the real-data state. No modelled row is party-wide, because
    // the game's team-wide bonuses are all 4-piece and all currently
    // `unimplemented`. This is why SYNTHETIC_PARTY exists at all: a sweep over
    // real data would confirm the classifier vacuously.
    for (const effect of generatedArtifactEffects) {
      if (effect.support !== "modelled") continue;
      for (const buff of buffsForSetBonus(effect)) {
        expect(buff.targets.scope, effect.id).toBe("active");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Multi-scope splitting -- SYNTHETIC, because no real row states two scopes
// ---------------------------------------------------------------------------

describe("a row with two scopes becomes two buffs, never one netted buff", () => {
  it("splits per scope with distinct stacking ids", () => {
    // The generated SHAPE states one condition per row, so this cannot be
    // built from a single row today. The split is exercised through the two
    // rows it would become, asserting the property that matters: two buffs
    // with disjoint scopes and DIFFERENT ids. Same-id buffs collapse under
    // `refresh`, which is how a split would silently un-split.
    const normalOnly = buffsForSetBonus(effectById("martial-artist-2pc"));
    const burstOnly = buffsForSetBonus(effectById("noblesse-oblige-2pc"));
    expect(normalOnly[0]!.id).not.toBe(burstOnly[0]!.id);
    expect(normalOnly[0]!.conditions?.damageTypes).not.toEqual(
      burstOnly[0]!.conditions?.damageTypes,
    );
  });

  it("a scoped buff's id is scope-suffixed and an unscoped one's is not", () => {
    // The id IS the stacking identity. An unscoped row keeps the bare row id;
    // a scoped one is suffixed, so two scopes of one bonus can never merge.
    expect(buffsForSetBonus(effectById("gladiators-finale-2pc"))[0]!.id).toBe(
      "gladiators-finale-2pc",
    );
    const scoped = buffsForSetBonus(effectById("noblesse-oblige-2pc"))[0]!;
    expect(scoped.id).not.toBe("noblesse-oblige-2pc");
    expect(scoped.id.startsWith("noblesse-oblige-2pc")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. Bucket discipline and the count pin
// ---------------------------------------------------------------------------

describe("only `modelled` rows become buffs", () => {
  it("an `unimplemented` row yields nothing", () => {
    const row = effectById("resolution-of-sojourner-4pc");
    expect(row.support).toBe("unimplemented");
    // Its numbers ARE present (`params`), and are still not applied.
    expect(row.params).toBeDefined();
    expect(buffsForSetBonus(row)).toEqual([]);
  });

  it("no non-modelled row in the real data even CARRIES modifiers", () => {
    // The reason the next test must be synthetic. The generator only ever
    // populates `modifiers` on a `modelled` row, so every real
    // `unimplemented` row yields `[]` for want of anything to convert --
    // whether or not the bucket gate exists. Real data therefore proves
    // NOTHING about the gate, and a sweep over it passes vacuously.
    for (const effect of generatedArtifactEffects) {
      if (effect.support === "modelled") continue;
      expect(effect.modifiers, effect.id).toBeUndefined();
    }
  });

  it("the bucket gate holds even when a non-modelled row carries numbers", () => {
    // SYNTHETIC. Identical in every field to a modelled row EXCEPT `support`,
    // so the only thing that can reject it is the bucket check itself. This is
    // the mutation that survives without this test: deleting
    // `if (effect.support !== MODELLED_SUPPORT) return []` changes no real
    // damage today, and would start applying conditional bonuses at 100%
    // uptime the moment the generator emitted numbers alongside a reason.
    const shape = {
      id: "synthetic-bucket-4pc",
      setSlug: "synthetic-bucket",
      setId: 99003,
      pieces: 4,
      text: "Increases ATK by 50% for 10s after using an Elemental Skill.",
      textZh: "",
      modifiers: [{ stat: "atkPercent", value: 0.5 }],
      params: [0.5, 10],
    } as const;

    expect(
      buffsForSetBonus({
        ...shape,
        support: "unimplemented",
        reason: "duration-gated; no trigger channel",
      }),
    ).toEqual([]);
    expect(buffsForSetBonus({ ...shape, support: "unverified" })).toEqual([]);
    // ...and the SAME row, marked modelled, does yield a buff -- proving the
    // rejection above is the bucket and not some other rejection path.
    expect(
      buffsForSetBonus({ ...shape, support: "modelled" }),
    ).toHaveLength(1);
  });

  it("every emitted buff traces to a `modelled` row", () => {
    const modelledIds = new Set(
      generatedArtifactEffects
        .filter((e) => e.support === "modelled")
        .map((e) => e.id),
    );
    for (const bonus of allArtifactSetBonusBuffs) {
      for (const buff of [
        ...(bonus.twoPiece ?? []),
        ...(bonus.fourPiece ?? []),
      ]) {
        // Ids are the row id, optionally scope-suffixed.
        const traced = [...modelledIds].some((id) => buff.id.startsWith(id));
        expect(traced, `${buff.id} must trace to a modelled row`).toBe(true);
      }
    }
  });

  it("pins the modelled count at 46", () => {
    // Pinned so a future reclassification is a VISIBLE test edit rather than a
    // silent shift in modelled damage. Mirrors the weapon adapter's pin of 30.
    const modelled = generatedArtifactEffects.filter(
      (e) => e.support === "modelled",
    );
    expect(modelled).toHaveLength(46);
  });

  it("all 46 modelled rows produce a buff -- none is silently dropped", () => {
    // The count pin alone would still pass if the adapter dropped rows. This
    // asserts the adapter's own yield, which is what catches a validator that
    // rejects a stat key the engine actually has.
    const produced = generatedArtifactEffects
      .filter((e) => e.support === "modelled")
      .filter((e) => buffsForSetBonus(e).length > 0);
    expect(produced).toHaveLength(46);
  });

  it("every modelled row today is a 2-piece bonus", () => {
    // Documents the state that makes the synthetic fixtures above necessary.
    // If a 4pc row ever becomes modelled this fails, which is the prompt to
    // replace the synthetic `party` fixture with the real one.
    const pieces = new Set(
      generatedArtifactEffects
        .filter((e) => e.support === "modelled")
        .map((e) => e.pieces),
    );
    expect([...pieces]).toEqual([2]);
  });
});

// ---------------------------------------------------------------------------
// 6. Fail-closed on tier, and the module's public surface
// ---------------------------------------------------------------------------

describe("tier fail-closed", () => {
  it("omits an unmodelled tier rather than emitting an empty array", () => {
    const bonus = setBonusBuffsById(GLADIATOR);
    expect(bonus).toBeDefined();
    expect(bonus!.twoPiece).toBeDefined();
    // NOT `toEqual([])`. An absent key says "not modelled"; an empty array
    // says "modelled, grants nothing", and `harvestArtifactSetBuffs` cannot
    // tell them apart -- but a UI listing the buffs can.
    expect("fourPiece" in bonus!).toBe(false);
  });

  it("a set with no modelled tier yields undefined entirely", () => {
    // Brave Heart: 2pc is modelled, 4pc is not -- so pick a set where NEITHER
    // is. Defender's Will 4pc is self-RES; its 2pc IS modelled, so search for
    // a genuinely unmodelled set from the data rather than naming one.
    const unmodelled = generatedArtifactEffects
      .map((e) => e.setSlug)
      .filter(
        (slug) =>
          !generatedArtifactEffects.some(
            (e) => e.setSlug === slug && e.support === "modelled",
          ),
      );
    for (const slug of new Set(unmodelled)) {
      expect(setBonusBuffsById(slug), slug).toBeUndefined();
      expect(artifactSetBonusBuffsBySetId.has(slug), slug).toBe(false);
    }
  });

  it("an unknown set id yields undefined", () => {
    expect(setBonusBuffsById("no-such-set")).toBeUndefined();
  });

  it("resolves by EXACT set id -- no prefix, alias or fuzzy match", () => {
    // `setBonusBuffsById` deliberately looks the set up in
    // `generatedArtifactSets` rather than through `findArtifact`, which
    // normalises and accepts retired aliases. A near-miss id must therefore
    // return `undefined`, not the set it merely resembles -- silently
    // resolving "gladiators-final" to Gladiator's Finale would attribute one
    // set's damage to another id and never fail a structural check.
    expect(setBonusBuffsById(GLADIATOR)).toBeDefined();
    for (const near of [
      "gladiators-final",
      "gladiators-finale-2pc",
      "Gladiators-Finale",
      " gladiators-finale",
      "",
    ]) {
      expect(setBonusBuffsById(near), near).toBeUndefined();
    }
  });

  it("every emitted bonus carries the set id the pieces are keyed by", () => {
    for (const [setId, bonus] of artifactSetBonusBuffsBySetId) {
      expect(bonus.setId).toBe(setId);
    }
  });
});

describe("emitted buff shape", () => {
  it("every buff is permanent, refresh-stacked and starts at 0", () => {
    for (const bonus of allArtifactSetBonusBuffs) {
      for (const buff of [
        ...(bonus.twoPiece ?? []),
        ...(bonus.fourPiece ?? []),
      ]) {
        expect(buff.startTime).toBe(0);
        expect(buff.duration).toBe(Number.POSITIVE_INFINITY);
        expect(buff.stacking).toEqual({ mode: "refresh" });
        expect(buff.modifiers!.length).toBeGreaterThan(0);
      }
    }
  });

  it("buff ids are unique across the whole emitted set", () => {
    // Two buffs sharing an id would merge under `refresh`, silently halving a
    // bonus. Uniqueness is what makes the scope suffix meaningful.
    const ids = allArtifactSetBonusBuffs.flatMap((bonus) =>
      [...(bonus.twoPiece ?? []), ...(bonus.fourPiece ?? [])].map((b) => b.id),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is deterministic -- two builds are structurally identical", () => {
    const first = generatedArtifactEffects.map((e) => buffsForSetBonus(e));
    const second = generatedArtifactEffects.map((e) => buffsForSetBonus(e));
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("`setBonusBuffs` and `setBonusBuffsById` agree", () => {
    // Both entry points are exercised, not just the id one: `setBonusBuffs`
    // takes the set OBJECT and is what `artifactSetBonusBuffsBySetId` is built
    // from, so a divergence between the two would otherwise be invisible here.
    for (const [setId, bonus] of artifactSetBonusBuffsBySetId) {
      const set = allArtifacts.find((candidate) => candidate.id === setId);
      expect(set, setId).toBeDefined();
      expect(setBonusBuffs(set!), setId).toEqual(bonus);
      expect(setBonusBuffsById(setId), setId).toEqual(bonus);
    }
  });
});

// ---------------------------------------------------------------------------
// 7. Malformed input degrades to a dropped grant, never a wrong number
// ---------------------------------------------------------------------------

describe("unrecognised vocabulary is dropped, not cast", () => {
  const base: GeneratedArtifactEffect = {
    id: "synthetic-bad-2pc",
    setSlug: "synthetic-bad",
    setId: 99002,
    pieces: 2,
    text: "ATK +50%.",
    textZh: "攻击力提高50%。",
    support: "modelled",
    modifiers: [{ stat: "atkPercent", value: 0.5 }],
  };

  it("drops a modifier whose stat the engine has no case for", () => {
    // INVENTED: `shieldStrength` is a real game stat with no `StatKey`.
    expect(
      buffsForSetBonus({
        ...base,
        modifiers: [{ stat: "shieldStrength", value: 0.35 }],
      }),
    ).toEqual([]);
  });

  it("drops an elementalDmgBonus that names no element", () => {
    expect(
      buffsForSetBonus({
        ...base,
        modifiers: [{ stat: "elementalDmgBonus", value: 0.15 }],
      }),
    ).toEqual([]);
  });

  it("REJECTS the whole row when a scope word is unrecognised", () => {
    // The critical one. Filtering `"plunging"` away would leave an EMPTY
    // damageTypes list, and an empty gate reads as "applies to everything" --
    // turning a plunge-only +25% into a global +25%. The row must be dropped.
    const rejected = buffsForSetBonus({
      ...base,
      conditions: { damageTypes: ["plunging"] },
    });
    expect(rejected).toEqual([]);
  });

  it("REJECTS the whole row when an element scope is unrecognised", () => {
    expect(
      buffsForSetBonus({
        ...base,
        conditions: { elements: ["quantum"] },
      }),
    ).toEqual([]);
  });

  it("keeps a row whose scope is fully recognised", () => {
    const kept = buffsForSetBonus({
      ...base,
      conditions: { damageTypes: ["plunge"] },
    });
    expect(kept).toHaveLength(1);
    expect(kept[0]!.conditions?.damageTypes).toEqual(["plunge"]);
  });
});

// ---------------------------------------------------------------------------
// 8. The harvest actually consumes what this module emits
// ---------------------------------------------------------------------------

describe("harvestArtifactSetBuffs consumes the emitted data", () => {
  it("yields the 2pc buff at 2 pieces and nothing at 1", () => {
    const bonus = setBonusBuffsById(NOBLESSE)!;
    expect(
      harvestArtifactSetBuffs({
        artifacts: loadout(NOBLESSE, 2),
        setBonuses: [bonus],
      }),
    ).toEqual(bonus.twoPiece);
    expect(
      harvestArtifactSetBuffs({
        artifacts: loadout(NOBLESSE, 1),
        setBonuses: [bonus],
      }),
    ).toEqual([]);
  });

  it("two half-sets each contribute their own 2pc", () => {
    const worn: ArtifactLoadout = {
      flower: piece("flower", GLADIATOR),
      plume: piece("plume", GLADIATOR),
      sands: piece("sands", NOBLESSE),
      goblet: piece("goblet", NOBLESSE),
    };
    const harvested = harvestArtifactSetBuffs({
      artifacts: worn,
      setBonuses: allArtifactSetBonusBuffs,
    });
    const ids = harvested.map((b) => b.id);
    expect(ids).toContain("gladiators-finale-2pc");
    expect(ids.some((id) => id.startsWith("noblesse-oblige-2pc"))).toBe(true);
    expect(harvested).toHaveLength(2);
  });
});


// ---------------------------------------------------------------------------
// 9. Branches the real data cannot reach, driven by SYNTHETIC rows
//
// WHY THIS SECTION EXISTS. All 46 modelled rows today are 2-piece, wearer-
// scoped, and state at most one condition, and none uses `requiresOnField` or
// `reactionBonus`. So a sweep over production data confirms the 4-piece key,
// the 1-piece rejection, the piece-count ordering, the element-scope grouping,
// the on-field gate and the reaction-key validation VACUOUSLY: it passes
// unchanged against an implementation that writes 4pc rows into `twoPiece`,
// admits 1pc rows, sorts descending, collides element scopes, drops the
// on-field gate, or casts an unknown reaction key straight through. A
// mutation sweep proved exactly that -- each of those six mutants SURVIVED the
// real-data tests.
//
// EVERY ROW BELOW IS INVENTED. None describes a real Genshin set; the ids sit
// in a `synthetic-*` namespace that the generator never emits, and the numbers
// are chosen to be distinguishable, not plausible. They exist to make the
// branch fire, never to state a game fact.
// ---------------------------------------------------------------------------

describe("branches real data cannot reach (SYNTHETIC rows)", () => {
  const SET = "synthetic-tiers";

  /** INVENTED base row. Not a real set. */
  function row(
    over: Partial<GeneratedArtifactEffect>,
  ): GeneratedArtifactEffect {
    return {
      id: "synthetic-tiers-2pc",
      setSlug: SET,
      setId: 99101,
      pieces: 2,
      text: "INVENTED. ATK +10%.",
      textZh: "虚构条目。",
      support: "modelled",
      modifiers: [{ stat: "atkPercent", value: 0.1 }],
      ...over,
    };
  }

  it("routes a 4-piece row to `fourPiece`, never to `twoPiece`", () => {
    // Kills the tier-leak mutant `bonuses.twoPiece = buffs` for every row.
    const only4 = setBonusBuffsFromRows(SET, [
      row({ id: "synthetic-tiers-4pc", pieces: 4 }),
    ]);
    expect(only4).toBeDefined();
    expect(only4!.fourPiece).toHaveLength(1);
    expect(only4!.fourPiece![0]!.id).toBe("synthetic-tiers-4pc");
    expect(only4!.twoPiece).toBeUndefined();
  });

  it("keeps the two tiers separate when a set models both", () => {
    const both = setBonusBuffsFromRows(SET, [
      row({ id: "synthetic-tiers-4pc", pieces: 4 }),
      row({}),
    ])!;
    expect(both.twoPiece![0]!.id).toBe("synthetic-tiers-2pc");
    expect(both.fourPiece![0]!.id).toBe("synthetic-tiers-4pc");
  });

  it("a 4pc-only set grants NOTHING at two pieces", () => {
    // The tier gate proven at the harvest, not merely at the data shape.
    const bonus = setBonusBuffsFromRows(SET, [
      row({ id: "synthetic-tiers-4pc", pieces: 4 }),
    ])!;
    expect(
      harvestArtifactSetBuffs({
        artifacts: loadout(SET, 2),
        setBonuses: [bonus],
      }),
    ).toEqual([]);
    expect(
      harvestArtifactSetBuffs({
        artifacts: loadout(SET, 4),
        setBonuses: [bonus],
      }),
    ).toEqual(bonus.fourPiece);
  });

  it("REJECTS a 1-piece row -- `ArtifactSetBonusBuffs` has no 1pc tier", () => {
    // Four 1-piece rows exist in the real data (the elemental-resistance
    // relics) but all are `unimplemented`, so the guard never fires there.
    // A modelled 1pc row must NOT be smuggled into a 2pc or 4pc key.
    expect(
      setBonusBuffsFromRows(SET, [
        row({ id: "synthetic-tiers-1pc", pieces: 1 }),
      ]),
    ).toBeUndefined();
  });

  it("orders tiers ascending regardless of input row order", () => {
    const reversed = setBonusBuffsFromRows(SET, [
      row({ id: "synthetic-tiers-4pc", pieces: 4 }),
      row({}),
    ])!;
    const forward = setBonusBuffsFromRows(SET, [
      row({}),
      row({ id: "synthetic-tiers-4pc", pieces: 4 }),
    ])!;
    // Key insertion order is observable, and a descending sort would flip it.
    expect(Object.keys(reversed)).toEqual(["setId", "twoPiece", "fourPiece"]);
    expect(Object.keys(reversed)).toEqual(Object.keys(forward));
    expect(reversed).toEqual(forward);
  });

  it("a set id present in no row yields undefined", () => {
    expect(setBonusBuffsFromRows("synthetic-absent", [row({})])).toBeUndefined();
  });
});

describe("scope grouping the real data cannot reach (SYNTHETIC rows)", () => {
  /** INVENTED: two ELEMENT scopes on one row. No real row has two scopes. */
  it("two element scopes become two buffs with distinct ids", () => {
    // Kills the mutant that omits `elements` from `conditionKey`: with
    // elements ignored, both grants land in ONE group keyed the same, and a
    // Pyro-only +30% plus a Cryo-only +50% net into a single +80% applying to
    // both. The failure is invisible in the data shape and enormous in damage.
    const pyroOnly = buffsForSetBonus({
      id: "synthetic-elem-2pc",
      setSlug: "synthetic-elem",
      setId: 99102,
      pieces: 2,
      text: "INVENTED. Pyro DMG +30%.",
      textZh: "虚构条目。",
      support: "modelled",
      conditions: { elements: ["pyro"] },
      modifiers: [{ stat: "dmgBonus", value: 0.3 }],
    });
    const cryoOnly = buffsForSetBonus({
      id: "synthetic-elem-2pc",
      setSlug: "synthetic-elem",
      setId: 99102,
      pieces: 2,
      text: "INVENTED. Cryo DMG +50%.",
      textZh: "虚构条目。",
      support: "modelled",
      conditions: { elements: ["cryo"] },
      modifiers: [{ stat: "dmgBonus", value: 0.5 }],
    });
    expect(pyroOnly).toHaveLength(1);
    expect(cryoOnly).toHaveLength(1);
    // Same row id, different element scope -> DIFFERENT stacking identity.
    // `Buff.id` IS the stacking key: equal ids would merge under `refresh`.
    expect(pyroOnly[0]!.id).not.toBe(cryoOnly[0]!.id);
    expect(pyroOnly[0]!.conditions?.elements).toEqual(["pyro"]);
    expect(cryoOnly[0]!.conditions?.elements).toEqual(["cryo"]);
  });

  it("an element scope and a damage-type scope key differently", () => {
    const base = {
      id: "synthetic-key-2pc",
      setSlug: "synthetic-key",
      setId: 99103,
      pieces: 2,
      text: "INVENTED. DMG +20%.",
      textZh: "虚构条目。",
      support: "modelled" as const,
      modifiers: [{ stat: "dmgBonus", value: 0.2 }],
    };
    const byElement = buffsForSetBonus({
      ...base,
      conditions: { elements: ["pyro"] },
    });
    const byDamageType = buffsForSetBonus({
      ...base,
      conditions: { damageTypes: ["normal"] },
    });
    expect(byElement[0]!.id).not.toBe(byDamageType[0]!.id);
  });

  it("carries `requiresOnField`, which no real modelled row states", () => {
    // Kills the mutant that drops the on-field gate: an off-field-inert bonus
    // would otherwise apply while the wearer is off field.
    const [buff] = buffsForSetBonus({
      id: "synthetic-onfield-2pc",
      setSlug: "synthetic-onfield",
      setId: 99104,
      pieces: 2,
      text: "INVENTED. ATK +10% while on the field.",
      textZh: "虚构条目。",
      support: "modelled",
      conditions: { requiresOnField: true },
      modifiers: [{ stat: "atkPercent", value: 0.1 }],
    });
    expect(buff).toBeDefined();
    expect(buff!.conditions?.requiresOnField).toBe(true);
    // And it must be its own stacking identity, not the unscoped one.
    expect(buff!.id).not.toBe("synthetic-onfield-2pc");
  });

  it("drops a reactionBonus naming a reaction the engine has no case for", () => {
    // No real modelled row uses `reactionBonus`, so the validation branch is
    // unreachable in production data. INVENTED: `"quicken"` is game prose, not
    // a `ReactionBonusKey`.
    expect(
      buffsForSetBonus({
        id: "synthetic-reaction-2pc",
        setSlug: "synthetic-reaction",
        setId: 99105,
        pieces: 2,
        text: "INVENTED. Quicken DMG +40%.",
        textZh: "虚构条目。",
        support: "modelled",
        modifiers: [{ stat: "reactionBonus", value: 0.4, reaction: "quicken" }],
      }),
    ).toEqual([]);
  });

  it("keeps a reactionBonus naming a reaction the engine DOES have", () => {
    const [buff] = buffsForSetBonus({
      id: "synthetic-reaction-ok-2pc",
      setSlug: "synthetic-reaction-ok",
      setId: 99106,
      pieces: 2,
      text: "INVENTED. Vaporize DMG +40%.",
      textZh: "虚构条目。",
      support: "modelled",
      modifiers: [
        { stat: "reactionBonus", value: 0.4, reaction: "vaporize" },
      ],
    });
    expect(buff!.modifiers).toEqual([
      { stat: "reactionBonus", value: 0.4, reaction: "vaporize" },
    ]);
  });
});
