import { describe, expect, it } from "vitest";
import type { Rotation, SimulationConfig } from "@/types";
import type { Buff } from "@/simulation/buffs/types";
import { simulateRotation } from "@/simulation/engine/simulateRotation";
import type {
  ArtifactLoadout,
  ArtifactSlot,
} from "@/simulation/character/equipment";
import { ARTIFACT_SLOTS } from "@/simulation/character/equipment";
import type {
  ArtifactSetBonusBuffs,
  WeaponPassiveBuffs,
} from "@/simulation/engine/equipmentBuffs";
import { harvestArtifactSetBuffs } from "@/simulation/engine/equipmentBuffs";
import {
  buildCharacterEquipmentBuffs,
  buildTeamEquipmentBuffs,
  equippedSetIds,
  setBonusesForLoadout,
} from "@/simulation/engine/buildEquipmentBuffs";
import { setBonusBuffsById } from "@/game-data/artifacts/setBonusBuffs";
import {
  NEUTRAL_ENEMY,
  NO_CRIT_CONFIG,
  expectedNeutralDamage,
  makeTestCharacter,
} from "@/tests/helpers/fixtures";

// ============================================================================
// TASK #070 — the artifact set-bonus chain, END TO END, at the damage number.
//
// WHAT WAS BROKEN. `setBonusBuffs()` produced `ArtifactSetBonusBuffs` and
// `harvestArtifactSetBuffs()` consumed `CharacterEquipmentBuffs.setBonuses`,
// and nothing assembled one into the other, so the harvest returned `[]` on
// every run. Both ends were fully unit-tested. That is precisely why the
// assertions below are DAMAGE NUMBERS out of `simulateRotation` and not buff
// lists: a data-shape assertion passes with the wire cut.
//
// THE MUTATION THIS FILE MUST KILL. Delete the `entry.setBonuses = setBonuses`
// binding in `buildEquipmentBuffs.ts` (or the `entry.artifacts` beside it) and
// every damage assertion here must fail. A test that survives that is not
// testing the wire.
//
// REAL DATA WHERE IT REACHES, SYNTHETIC WHERE IT CANNOT. Two facts about the
// generated roster today, verified rather than assumed, decide the split:
//
//   * All 46 `modelled` rows are 2-PIECE. No 4pc bonus is modelled — Noblesse
//     Oblige's 4pc is `unimplemented` because "after using an Elemental Burst"
//     is not statable. So on real data a 4pc build grants EXACTLY the 2pc
//     bonus, and "3pc < 4pc" is FALSE for every real set. Asserting it on real
//     data would be asserting a bug.
//   * No `modelled` row is party-scoped, for the same reason: the game's
//     team-wide set bonuses are all 4pc.
//
// The 4pc-tier and party-scope claims are therefore driven with a SYNTHETIC
// set, LABELLED as synthetic, which is a claim about the WIRE, never about any
// real artifact set. The real-data cases below carry the scope claim that
// production data can actually make.
// ============================================================================

const WEARER = "wearer";
const TEAMMATE = "teammate";

/**
 * The burst costs ZERO energy so a Burst rotation is always a VALID action.
 * The default 40-cost burst silently produces 0 damage — an invalid action —
 * which would make every "the Burst rotation is unchanged" assertion vacuously
 * 0 === 0. Same trap `weaponScopeAdversarial.test.ts` documents.
 */
const wearer = makeTestCharacter(WEARER, { elementalBurst: { energyCost: 0 } });
const teammate = makeTestCharacter(TEAMMATE, {
  elementalBurst: { energyCost: 0 },
});

/** ATK 1000, NA multiplier 1.0, DEF x0.5 -> 500. Burst multiplier 4.0 -> 2000. */
const NORMAL_BASE = expectedNeutralDamage(1000, 1);
const BURST_BASE = expectedNeutralDamage(1000, 4);

const NORMAL_ROTATION: Rotation = [
  { characterId: WEARER, actionType: "normal" },
];
const BURST_ROTATION: Rotation = [{ characterId: WEARER, actionType: "burst" }];

/** `count` pieces of `setId`, contributing ZERO stats of their own. */
function loadoutOf(count: number, setId: string): ArtifactLoadout {
  const loadout: Partial<Record<ArtifactSlot, ArtifactLoadout[ArtifactSlot]>> =
    {};
  for (const slot of ARTIFACT_SLOTS.slice(0, count)) {
    loadout[slot] = {
      slot,
      setId,
      // Zero main stat and no substats: the ONLY thing varying across the
      // piece-count cases is the set BONUS. A piece that carried stats would
      // make "4pc > 3pc" pass on the extra piece's main stat alone, with the
      // bonus wire still cut.
      mainStat: { stat: "atkFlat", value: 0 },
      substats: [],
    };
  }
  return loadout;
}

/** Full run through the real assembly + harvest + damage pipeline. */
function damageOf(
  rotation: Rotation,
  builds: readonly (Parameters<typeof buildTeamEquipmentBuffs>[0][number])[],
  sources: Parameters<typeof buildTeamEquipmentBuffs>[1],
  team = [wearer],
): number {
  const equipmentBuffs = buildTeamEquipmentBuffs(builds, sources);
  const config: SimulationConfig = equipmentBuffs
    ? { ...NO_CRIT_CONFIG, equipmentBuffs }
    : { ...NO_CRIT_CONFIG };
  return simulateRotation(team, rotation, NEUTRAL_ENEMY, config).totalDamage;
}

// ---------------------------------------------------------------------------
// DELIVERABLE 1 — REAL generated set data reaches the damage number.
//
// Noblesse Oblige 2pc is `modelled`, real, and scoped: "+20% Elemental Burst
// DMG". The expected numbers below are written from that PUBLISHED TEXT, not
// read back out of the adapter, so an adapter that emitted the wrong magnitude
// or the wrong scope fails here.
//
// This is the Rust/Catch mirror the task asks for: the set raises a Burst
// rotation x1.20 and leaves a Normal rotation BIT-IDENTICAL.
// ---------------------------------------------------------------------------

const NOBLESSE = "noblesse-oblige";
const NOBLESSE_BURST_BONUS = 0.2;

const realSources = { setBonus: setBonusBuffsById };

function noblesseBuild(pieces: number) {
  return [{ characterId: WEARER, artifacts: loadoutOf(pieces, NOBLESSE) }];
}

describe("real generated set-bonus data reaches damage", () => {
  it("Noblesse Oblige 2pc raises BURST damage by exactly its stated +20%", () => {
    const bare = damageOf(BURST_ROTATION, [], realSources);
    const equipped = damageOf(BURST_ROTATION, noblesseBuild(2), realSources);

    // Unwired, `equipped` would equal `bare`. Both are pinned absolutely so a
    // change in either direction is caught, not just their ratio.
    expect(bare).toBe(BURST_BASE);
    expect(equipped).toBe(BURST_BASE * (1 + NOBLESSE_BURST_BONUS));
  });

  it("...and leaves a NORMAL rotation BIT-IDENTICAL — the scope survives", () => {
    const bare = damageOf(NORMAL_ROTATION, [], realSources);
    const equipped = damageOf(NORMAL_ROTATION, noblesseBuild(2), realSources);

    // The out-of-scope claim. A wire that dropped `conditions` would apply
    // +20% here too; `toBe` is the right assertion because the claim is
    // literal identity, not approximate equality.
    expect(equipped).toBe(bare);
    expect(equipped).toBe(NORMAL_BASE);
  });

  it("one piece of a real set grants nothing — the 2pc gate is real", () => {
    expect(damageOf(BURST_ROTATION, noblesseBuild(1), realSources)).toBe(
      BURST_BASE,
    );
  });

  it("a real set the character is NOT wearing contributes nothing", () => {
    // Gladiator's is looked up only if a Gladiator's piece is equipped.
    const build = [
      { characterId: WEARER, artifacts: loadoutOf(4, "gladiators-finale") },
    ];
    const burst = damageOf(BURST_ROTATION, build, realSources);
    // Gladiator's 2pc is +18% ATK, which DOES apply — proving the lookup is
    // live — while Noblesse's burst bonus does not leak in.
    expect(burst).toBe(BURST_BASE * (1 + 0.18));
  });
});

// ---------------------------------------------------------------------------
// DELIVERABLE 2 — tier gating: 3pc === 2pc exactly, and 3pc < 4pc.
//
// SYNTHETIC SET. No real modelled set has a 4pc tier (see the header), so this
// claim cannot be made on production data. `SYNTH_SET` is INVENTED and is not
// a statement about any real artifact set; it exists to prove the WIRE carries
// a 4pc tier and that the piece-count gate is enforced rather than decorative.
// ---------------------------------------------------------------------------

const SYNTH_SET_ID = "invented-test-set";
const SYNTH_TWO_PIECE_ATK = 0.1;
const SYNTH_FOUR_PIECE_ATK = 0.5;

function atkBuff(id: string, value: number): Buff {
  return {
    id,
    source: id,
    startTime: 0,
    duration: Number.POSITIVE_INFINITY,
    stacking: { mode: "refresh" },
    targets: { scope: "active" },
    modifiers: [{ stat: "atkPercent", value }],
  };
}

const SYNTH_SET: ArtifactSetBonusBuffs = {
  setId: SYNTH_SET_ID,
  twoPiece: [atkBuff(`${SYNTH_SET_ID}-2pc`, SYNTH_TWO_PIECE_ATK)],
  fourPiece: [atkBuff(`${SYNTH_SET_ID}-4pc`, SYNTH_FOUR_PIECE_ATK)],
};

const synthSources = {
  setBonus: (id: string): ArtifactSetBonusBuffs | undefined =>
    id === SYNTH_SET_ID ? SYNTH_SET : undefined,
};

function synthDamage(pieces: number): number {
  return damageOf(
    NORMAL_ROTATION,
    [{ characterId: WEARER, artifacts: loadoutOf(pieces, SYNTH_SET_ID) }],
    synthSources,
  );
}

describe("piece-count gating survives the wire", () => {
  it("4pc changes the damage number", () => {
    expect(synthDamage(4)).toBeGreaterThan(synthDamage(0));
    // The normal attack is pure ATK on an ungeared unit, so the ratio is
    // exactly (1 + 2pc + 4pc) — both tiers, as in game.
    expect(synthDamage(4)).toBe(
      NORMAL_BASE * (1 + SYNTH_TWO_PIECE_ATK + SYNTH_FOUR_PIECE_ATK),
    );
  });

  it("3pc is BIT-IDENTICAL to 2pc, and strictly below 4pc", () => {
    // The load-bearing gate: at 3 pieces the 4pc tier must be ABSENT, not
    // partially applied. `toBe`, because the claim is exact identity.
    expect(synthDamage(3)).toBe(synthDamage(2));
    expect(synthDamage(3)).toBeLessThan(synthDamage(4));
    expect(synthDamage(2)).toBe(NORMAL_BASE * (1 + SYNTH_TWO_PIECE_ATK));
  });

  it("1pc is BIT-IDENTICAL to no artifacts at all", () => {
    expect(synthDamage(1)).toBe(synthDamage(0));
    expect(synthDamage(1)).toBe(NORMAL_BASE);
  });
});

// ---------------------------------------------------------------------------
// DELIVERABLE 3 — target scope survives the wire.
//
// SYNTHETIC SETS, and for a sourced reason: no `modelled` row is party-scoped
// today, because every team-wide set bonus in the game is a 4pc and all of
// those are `unimplemented`. The sets below are INVENTED. The claim under test
// is that `targets.scope` survives assembly, not anything about a real set.
//
// WHAT `active` ACTUALLY MEANS — the trap this block exists to document.
// `BuffTargetScope` defines `active` as "only the character currently
// ON-FIELD", NOT "only the wearer". `setBonusBuffs.ts` emits `active` for a
// wearer-only bonus deliberately, because the harvest is already per-character.
// So an `active` set on the wearer DOES reach a teammate who is swapped in and
// swinging — that is correct by the mechanics contract, and a test asserting
// otherwise would be asserting a bug into place.
//
// The two scopes are therefore distinguished on the axis that actually
// separates them: a party buff reaches an OFF-FIELD teammate's damage, an
// active buff does not. To make the off-field case observable, the teammate's
// hit is compared while the WEARER is the one on-field.
// ---------------------------------------------------------------------------

const PARTY_SET_ID = "invented-party-set";
const ACTIVE_SET_ID = "invented-active-set";
const SCOPED_ATK = 0.2;

function scopedSet(setId: string, scope: "party" | "active"): ArtifactSetBonusBuffs {
  const buff = atkBuff(`${setId}-2pc`, SCOPED_ATK);
  return { setId, twoPiece: [{ ...buff, targets: { scope } }] };
}

const scopedSources = {
  setBonus: (id: string): ArtifactSetBonusBuffs | undefined => {
    if (id === PARTY_SET_ID) return scopedSet(PARTY_SET_ID, "party");
    if (id === ACTIVE_SET_ID) return scopedSet(ACTIVE_SET_ID, "active");
    return undefined;
  },
};

/** The teammate acts, so the TEAMMATE is the on-field character. */
const TEAMMATE_ROTATION: Rotation = [
  { characterId: TEAMMATE, actionType: "normal" },
];

const TEAM = [wearer, teammate];

function damageWithWearerSet(
  rotation: Rotation,
  setId: string | undefined,
): number {
  const builds =
    setId === undefined
      ? []
      : [{ characterId: WEARER, artifacts: loadoutOf(2, setId) }];
  return damageOf(rotation, builds, scopedSources, TEAM);
}

describe("target scope survives the wire", () => {
  it("a party-scoped set on the WEARER buffs the TEAMMATE's hit", () => {
    // The cross-character claim: the set is on the wearer, the damage is the
    // teammate's. Unwired, this equals the bare number.
    expect(damageWithWearerSet(TEAMMATE_ROTATION, undefined)).toBe(NORMAL_BASE);
    expect(damageWithWearerSet(TEAMMATE_ROTATION, PARTY_SET_ID)).toBe(
      NORMAL_BASE * (1 + SCOPED_ATK),
    );
  });

  it("an active-scoped set reaches whoever is ON-FIELD, per the contract", () => {
    // Documented, not assumed: with the teammate swapped in and swinging, the
    // teammate IS the active character, so the buff applies. This pins the
    // contract so a later change to `active` semantics fails loudly here.
    expect(damageWithWearerSet(TEAMMATE_ROTATION, ACTIVE_SET_ID)).toBe(
      NORMAL_BASE * (1 + SCOPED_ATK),
    );
  });

  it("party and active are INDISTINGUISHABLE on direct damage — documented", () => {
    // A deliberately negative pin, recording a real limit rather than hiding
    // it. Damage is only ever evaluated for the character performing the hit,
    // and that character is by definition the on-field one, so `active` matches
    // every hit `party` matches. The two scopes can only diverge on damage
    // credited to an OFF-FIELD character, which no fixture here produces.
    //
    // Consequence, reported to the Manager: a wire that hardcoded `party` in
    // place of `active` would NOT be caught by any direct-damage test. The
    // scope is asserted structurally below instead, where it is observable.
    const rotation: Rotation = [
      { characterId: TEAMMATE, actionType: "normal" },
      { characterId: WEARER, actionType: "normal" },
    ];
    const bare = damageWithWearerSet(rotation, undefined);
    const party = damageWithWearerSet(rotation, PARTY_SET_ID);
    const active = damageWithWearerSet(rotation, ACTIVE_SET_ID);

    expect(bare).toBe(NORMAL_BASE * 2);
    expect(party).toBe(NORMAL_BASE * 2 * (1 + SCOPED_ATK));
    expect(active).toBe(party);
  });

  it("carries the authored scope through assembly, unchanged", () => {
    // The structural half of the scope claim, since damage cannot separate the
    // two. The assembled entry must hand the harvest the scope the DATA
    // authored — not one this module chose.
    for (const [setId, scope] of [
      [PARTY_SET_ID, "party"],
      [ACTIVE_SET_ID, "active"],
    ] as const) {
      const entry = buildCharacterEquipmentBuffs(
        { artifacts: loadoutOf(2, setId) },
        scopedSources,
      );
      const harvested = harvestArtifactSetBuffs(entry!);
      expect(harvested).toHaveLength(1);
      expect(harvested[0]!.targets.scope).toBe(scope);
    }
  });

  it("a set on the wearer does not leak when NO ONE wears it", () => {
    // Out-of-scope hit: an unknown set id must contribute nothing at all.
    expect(damageWithWearerSet(TEAMMATE_ROTATION, "no-such-set")).toBe(
      damageWithWearerSet(TEAMMATE_ROTATION, undefined),
    );
  });
});

// ---------------------------------------------------------------------------
// Assembly properties — the parts of the wire a damage number cannot isolate.
// ---------------------------------------------------------------------------

describe("assembly is fail-closed and deterministic", () => {
  it("carries only the EQUIPPED sets, in fixed slot order", () => {
    const mixed: ArtifactLoadout = {
      ...loadoutOf(2, "b-set"),
      sands: { slot: "sands", setId: "a-set", mainStat: { stat: "atkFlat", value: 0 }, substats: [] },
    };
    // ARTIFACT_SLOTS order is flower, plume, sands, ... so "b-set" first.
    expect(equippedSetIds(mixed)).toEqual(["b-set", "a-set"]);
  });

  it("de-duplicates a set so its bonus cannot be applied twice", () => {
    // Four pieces of one set must yield ONE entry. Four entries would make the
    // harvest push the same buff four times.
    expect(equippedSetIds(loadoutOf(4, SYNTH_SET_ID))).toEqual([SYNTH_SET_ID]);
    expect(setBonusesForLoadout(loadoutOf(4, SYNTH_SET_ID), synthSources.setBonus))
      .toHaveLength(1);
  });

  it("an unknown set id yields no entry rather than a neighbouring set's", () => {
    expect(
      setBonusesForLoadout(loadoutOf(4, "no-such-set"), synthSources.setBonus),
    ).toEqual([]);
  });

  it("a build with nothing to harvest yields undefined, keeping runs identical", () => {
    expect(
      buildCharacterEquipmentBuffs({ artifacts: loadoutOf(4, "no-such-set") }, synthSources),
    ).toBeUndefined();
    expect(buildTeamEquipmentBuffs([{ characterId: WEARER }], synthSources)).toBeUndefined();
  });

  it("carries `artifacts` alongside `setBonuses` so the gate can count", () => {
    // Dropping `artifacts` would leave the harvest counting an empty loadout
    // and returning [] — the exact silent-inert failure this task fixed.
    const entry = buildCharacterEquipmentBuffs(
      { artifacts: loadoutOf(4, SYNTH_SET_ID) },
      synthSources,
    );
    expect(entry?.artifacts).toBeDefined();
    expect(harvestArtifactSetBuffs(entry!)).toHaveLength(2);
  });

  it("an out-of-range refinement leaves the passive inert, never R1", () => {
    const passive: WeaponPassiveBuffs = {
      name: "Invented Passive",
      buffsByRefinement: { 1: [atkBuff("invented-r1", 0.9)] },
    };
    const sources = { weaponPassive: () => passive };
    const entry = buildCharacterEquipmentBuffs(
      { weaponId: "invented", refinement: 7 },
      sources,
    );
    // The passive is carried, the bogus refinement is NOT — so the harvest
    // selects nothing rather than silently reading R1's magnitude.
    expect(entry?.weaponPassive).toBe(passive);
    expect(entry?.refinement).toBeUndefined();
  });

  it("repeated assembly is byte-identical", () => {
    const build = [{ characterId: WEARER, artifacts: loadoutOf(4, NOBLESSE) }];
    expect(JSON.stringify(buildTeamEquipmentBuffs(build, realSources))).toBe(
      JSON.stringify(buildTeamEquipmentBuffs(build, realSources)),
    );
  });
});
