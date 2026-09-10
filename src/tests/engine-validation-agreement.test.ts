import { describe, expect, it } from "vitest";
import { simulateRotation, validateAction } from "@/simulation/engine";
import { createEnergyState } from "@/simulation/energy";
import type {
  ActionValidation,
  CharacterDefinition,
  CharacterState,
  Rotation,
  RotationAction,
  SimulationConfig,
  ValidationErrorCode,
} from "@/types";
import {
  makeTestCharacter,
  NEUTRAL_ENEMY,
  NO_CRIT_CONFIG,
} from "@/tests/helpers/fixtures";

// ============================================================================
// Engine <-> validateAction() agreement.
//
// `validateAction()` is documented as the SINGLE source of truth for action
// legality. The optimizer prunes with it; the engine executes with it. If the
// two ever drift, the optimizer emits rotations the engine silently refuses to
// run and every optimizer score becomes a lie.
//
// The proof strategy: for each action in a rotation, independently ask
// `validateAction()` for a verdict against the state the engine would be in,
// then check the engine's observable behaviour (did a damage/swap event appear
// at that step, and was a warning/error recorded) matches that verdict exactly.
// ============================================================================

/**
 * Rebuilds engine-equivalent state and replays a rotation, asking
 * `validateAction()` for the verdict at every step. Returns one verdict per
 * rotation index.
 *
 * This deliberately mirrors the engine's state-advance rules rather than
 * calling into it, so a divergence between the two shows up as a test failure
 * rather than being hidden by shared code.
 */
function replayVerdicts(
  team: CharacterDefinition[],
  rotation: Rotation,
  config: SimulationConfig,
): ActionValidation[] {
  const states = new Map<string, CharacterState>();
  for (const def of team) {
    const energy = createEnergyState(def);
    states.set(def.id, {
      definition: def,
      currentEnergy: energy.current,
      energy,
      cooldowns: {},
    });
  }

  const swapCost = config.swapCost ?? 0.6;
  let clock = 0;
  let activeCharacterId: string | undefined;
  const verdicts: ActionValidation[] = [];

  for (const action of rotation) {
    const verdict = validateAction({
      action,
      states,
      time: clock,
      activeCharacterId,
      config,
    });
    verdicts.push(verdict);
    if (!verdict.valid) continue;

    const state = states.get(action.characterId)!;
    const def = state.definition;

    if (action.actionType === "swap") {
      activeCharacterId = def.id;
      clock += swapCost;
      continue;
    }

    const ability =
      action.actionType === "normal"
        ? def.normalAttack
        : action.actionType === "charged"
          ? def.chargedAttack
          : action.actionType === "skill"
            ? def.elementalSkill
            : def.elementalBurst;

    activeCharacterId = def.id;
    if (ability.energyCost > 0) {
      state.energy.current -= Math.min(state.energy.current, ability.energyCost);
    }
    if (ability.energyGenerated > 0) {
      state.energy.current = Math.min(
        state.energy.max,
        state.energy.current + ability.energyGenerated,
      );
    }
    if (ability.cooldown > 0) state.cooldowns[ability.id] = clock + ability.cooldown;
    clock += ability.castTime;
  }

  return verdicts;
}

/** Counts the engine's executed (non-skipped) actions from its timeline. */
function executedActionCount(
  timeline: readonly { type: string }[],
): number {
  return timeline.filter((e) => e.type === "damage" || e.type === "swap").length;
}

interface AgreementCase {
  name: string;
  team: CharacterDefinition[];
  rotation: Rotation;
  config: SimulationConfig;
}

function agreementCases(): AgreementCase[] {
  const cases: AgreementCase[] = [];

  cases.push({
    name: "all-legal rotation",
    team: [makeTestCharacter("a"), makeTestCharacter("b")],
    rotation: [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "b", actionType: "swap" },
      { characterId: "b", actionType: "charged", abilityId: "b-ca" },
    ],
    config: { ...NO_CRIT_CONFIG },
  });

  cases.push({
    name: "cooldown violation mid-rotation",
    team: [makeTestCharacter("a")],
    rotation: [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // on cooldown
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ],
    config: { ...NO_CRIT_CONFIG },
  });

  cases.push({
    name: "burst without energy then with energy",
    team: [makeTestCharacter("a", { elementalSkill: { cooldown: 0, energyGenerated: 20 } })],
    rotation: [
      { characterId: "a", actionType: "burst", abilityId: "a-q" }, // no energy
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // +20
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // +20 == 40
      { characterId: "a", actionType: "burst", abilityId: "a-q" }, // legal now
    ],
    config: { ...NO_CRIT_CONFIG },
  });

  cases.push({
    name: "redundant swap",
    team: [makeTestCharacter("a"), makeTestCharacter("b")],
    rotation: [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "a", actionType: "swap" }, // redundant
      { characterId: "b", actionType: "swap" }, // legal
      { characterId: "b", actionType: "swap" }, // redundant
    ],
    config: { ...NO_CRIT_CONFIG },
  });

  cases.push({
    name: "time limit cutting a rotation short",
    team: [makeTestCharacter("a")],
    rotation: [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ],
    config: { ...NO_CRIT_CONFIG, timeLimit: 1 },
  });

  cases.push({
    name: "unknown character in the middle",
    team: [makeTestCharacter("a")],
    rotation: [
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
      { characterId: "ghost", actionType: "skill", abilityId: "ghost-e" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ],
    config: { ...NO_CRIT_CONFIG },
  });

  cases.push({
    name: "everything at once",
    team: [makeTestCharacter("a"), makeTestCharacter("b"), makeTestCharacter("c")],
    rotation: [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "burst", abilityId: "a-q" },
      { characterId: "a", actionType: "swap" },
      { characterId: "b", actionType: "swap" },
      { characterId: "ghost", actionType: "normal" },
      { characterId: "b", actionType: "skill", abilityId: "b-e" },
      { characterId: "c", actionType: "swap" },
      { characterId: "c", actionType: "charged", abilityId: "c-ca" },
    ],
    config: { ...NO_CRIT_CONFIG, timeLimit: 8 },
  });

  return cases;
}

describe("engine and validateAction() agree on legality", () => {
  for (const c of agreementCases()) {
    it(`${c.name}: engine executes exactly the actions validateAction accepts`, () => {
      const verdicts = replayVerdicts(c.team, c.rotation, c.config);
      const result = simulateRotation(
        c.team,
        c.rotation,
        NEUTRAL_ENEMY,
        c.config,
      );

      const acceptedCount = verdicts.filter((v) => v.valid).length;
      const rejectedCount = verdicts.length - acceptedCount;

      // Every accepted action produced a timeline entry, and no rejected one did.
      expect(executedActionCount(result.timeline)).toBe(acceptedCount);
      // Every rejection is surfaced to the caller exactly once.
      expect(result.warnings.length + result.errors.length).toBe(rejectedCount);
    });

    it(`${c.name}: every engine rejection message matches a validateAction code`, () => {
      const verdicts = replayVerdicts(c.team, c.rotation, c.config);
      const result = simulateRotation(
        c.team,
        c.rotation,
        NEUTRAL_ENEMY,
        c.config,
      );

      // The engine prefixes with "Action <index>: " then the verdict reason.
      const reported = [...result.errors, ...result.warnings];
      verdicts.forEach((verdict, index) => {
        if (verdict.valid) {
          expect(reported.some((m) => m.startsWith(`Action ${index}:`))).toBe(false);
          return;
        }
        const message = reported.find((m) => m.startsWith(`Action ${index}:`));
        expect(message, `no message for rejected action ${index}`).toBeDefined();
        expect(message).toContain(verdict.reason);
      });
    });

    it(`${c.name}: structuredWarnings carry the exact codes validateAction returned`, () => {
      const verdicts = replayVerdicts(c.team, c.rotation, c.config);
      const result = simulateRotation(
        c.team,
        c.rotation,
        NEUTRAL_ENEMY,
        c.config,
      );

      // The engine's machine-readable rejection stream must equal, code for
      // code and index for index, what validateAction independently decided.
      // This is the strongest form of the agreement guarantee: the optimizer
      // prunes on these codes, so a mismatch here is a correctness bug.
      const expectedRejections = verdicts.flatMap((v, index) =>
        v.valid || v.code === "unknown-character"
          ? []
          : [{ actionIndex: index, code: v.code }],
      );
      expect(
        result.structuredWarnings.map((w) => ({
          actionIndex: w.actionIndex,
          code: w.code,
        })),
      ).toEqual(expectedRejections);
    });

    it(`${c.name}: on-cooldown warnings expose the same availableAt`, () => {
      const verdicts = replayVerdicts(c.team, c.rotation, c.config);
      const result = simulateRotation(
        c.team,
        c.rotation,
        NEUTRAL_ENEMY,
        c.config,
      );
      for (const warning of result.structuredWarnings) {
        if (warning.code !== "on-cooldown") continue;
        const verdict = verdicts[warning.actionIndex]!;
        expect(verdict.valid).toBe(false);
        if (verdict.valid) throw new Error("unreachable");
        expect(warning.availableAt).toBe(verdict.availableAt);
        // An availableAt in the past would mean the action was legal after all.
        expect(warning.availableAt!).toBeGreaterThan(warning.timestamp);
      }
    });

    it(`${c.name}: unknown-character goes to errors, everything else to warnings`, () => {
      const verdicts = replayVerdicts(c.team, c.rotation, c.config);
      const result = simulateRotation(
        c.team,
        c.rotation,
        NEUTRAL_ENEMY,
        c.config,
      );
      const unknownCharacterCount = verdicts.filter(
        (v) => !v.valid && v.code === "unknown-character",
      ).length;
      expect(result.errors.length).toBe(unknownCharacterCount);
    });
  }

  it("never executes an action validateAction rejects, across a config sweep", () => {
    const configs: SimulationConfig[] = [
      {},
      { critMode: "always" },
      { swapCost: 0 },
      { swapCost: 2 },
      { timeLimit: 0.5 },
      { timeLimit: 3 },
      { partySize: 4 },
    ];
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "b", actionType: "swap" },
      { characterId: "b", actionType: "swap" },
      { characterId: "b", actionType: "burst", abilityId: "b-q" },
      { characterId: "a", actionType: "swap" },
      { characterId: "a", actionType: "normal", abilityId: "a-na" },
    ];
    for (const config of configs) {
      const team = [makeTestCharacter("a"), makeTestCharacter("b")];
      const verdicts = replayVerdicts(team, rotation, config);
      const result = simulateRotation(team, rotation, NEUTRAL_ENEMY, config);
      expect(
        executedActionCount(result.timeline),
        `config ${JSON.stringify(config)}`,
      ).toBe(verdicts.filter((v) => v.valid).length);
    }
  });

  it("respects availableAt: an action rejected at t is accepted at availableAt", () => {
    const team = [makeTestCharacter("a", { elementalSkill: { cooldown: 6, castTime: 1 } })];
    const rotation: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const verdicts = replayVerdicts(team, rotation, NO_CRIT_CONFIG);
    const second = verdicts[1]!;
    expect(second.valid).toBe(false);
    if (second.valid) throw new Error("unreachable");
    expect(second.code).toBe("on-cooldown");
    expect(second.availableAt).toBe(6);

    // Pad the rotation with normals so the second skill lands exactly at
    // availableAt (t=6): 1s skill + 10 * 0.5s normals = 6.0s.
    const padded: Rotation = [
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
      ...Array.from({ length: 10 }, (): RotationAction => ({
        characterId: "a",
        actionType: "normal",
        abilityId: "a-na",
      })),
      { characterId: "a", actionType: "skill", abilityId: "a-e" },
    ];
    const result = simulateRotation(
      [makeTestCharacter("a", { elementalSkill: { cooldown: 6, castTime: 1 } })],
      padded,
      NEUTRAL_ENEMY,
      NO_CRIT_CONFIG,
    );
    expect(result.warnings).toEqual([]);
    // Both skills fired.
    expect(
      result.timeline.filter((e) => e.damage?.abilityId === "a-e").length,
    ).toBe(2);
  });

  it("covers every ValidationErrorCode in a single engine run", () => {
    const team = [
      makeTestCharacter("a", { elementalSkill: { cooldown: 6 } }),
      makeTestCharacter("b"),
    ];
    const rotation = [
      { characterId: "ghost", actionType: "normal" }, // unknown-character
      { characterId: "a", actionType: "ultimate" }, // unknown-ability
      { characterId: "a", actionType: "burst", abilityId: "a-q" }, // insufficient-energy
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // legal
      { characterId: "a", actionType: "skill", abilityId: "a-e" }, // on-cooldown
      { characterId: "a", actionType: "swap" }, // redundant-swap
      { characterId: "b", actionType: "swap" }, // legal
      { characterId: "b", actionType: "normal", abilityId: "b-na" }, // past-time-limit
    ] as unknown as Rotation;

    const config: SimulationConfig = { ...NO_CRIT_CONFIG, timeLimit: 1.5 };
    const verdicts = replayVerdicts(team, rotation, config);
    const codes = new Set<ValidationErrorCode>(
      verdicts.flatMap((v) => (v.valid ? [] : [v.code])),
    );

    const allCodes: ValidationErrorCode[] = [
      "unknown-character",
      "unknown-ability",
      "on-cooldown",
      "insufficient-energy",
      "redundant-swap",
      "past-time-limit",
    ];
    for (const code of allCodes) {
      expect(codes.has(code), `missing code ${code}`).toBe(true);
    }

    // And the engine agrees: it executed only the accepted ones.
    const result = simulateRotation(team, rotation, NEUTRAL_ENEMY, config);
    expect(executedActionCount(result.timeline)).toBe(
      verdicts.filter((v) => v.valid).length,
    );
  });
});
