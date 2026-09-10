import type {
  ArtifactEffectSupport,
  GeneratedArtifactEffect,
} from "@/game-data/artifacts/generated";
import { generatedArtifactEffects } from "@/game-data/artifacts/generated";
import { completeSetBonusBuffsById } from "@/game-data/artifacts/completeSetBonusBuffs";

// ---------------------------------------------------------------------------
// Artifact set-bonus support presentation.
//
// WHAT THIS FIXES: the picker rendered each set bonus's prose under a blanket
// `仅展示，未接入模拟` label. Of the 122 generated bonus rows, 46 are source
// modelled and reach the engine through `setBonusBuffs()`; the complete runtime
// compiler also connects deterministic damage rows from the other bucket.
// Calling every row "not simulated" understates the tool. Each remaining row
// keeps its generator reason, so a user can distinguish a missing channel from
// a runtime approximation.
//
// This module answers one question per (set, piece-count): what is the support
// state, and why. It reads the generated rows, which are the same rows
// `setBonusBuffs()` gates on, so the label and the simulation cannot disagree
// by construction. It does NOT decide support — it reports the field.
//
// Pure: no React, no DOM, no engine calls.
// ---------------------------------------------------------------------------

/** Display state for a set bonus, parallel to the weapon-passive kinds. */
export type ArtifactSupportKind = ArtifactEffectSupport;

export const ARTIFACT_SUPPORT_LABEL_ZH: Record<ArtifactSupportKind, string> = {
  modelled: "已接入模拟",
  unimplemented: "尚未接入模拟",
  unverified: "数值待核实",
};

const REASON_ZH: Record<string, string> = {
  "numbers are unambiguous but the Buff vocabulary has no channel for this effect":
    "数值明确，但当前 Buff 系统暂无对应效果通道。",
  "self RES is a defensive channel; only enemy-side resReduction exists":
    "该效果属于角色抗性防御；当前仅支持敌方抗性削减。",
  "cooldown manipulation is engine state, not a Buff modifier":
    "冷却变化属于引擎状态，不能作为普通 Buff 数值。",
  "energy regeneration is engine state, not a Buff modifier":
    "能量回复属于引擎状态，不能作为普通 Buff 数值。",
  "healing/HP restoration has no StatKey":
    "治疗或生命恢复尚无对应 StatKey。",
  "no healing/incoming-healing StatKey":
    "当前没有治疗量或受治疗量 StatKey。",
  "no stamina model": "当前尚未模拟体力消耗。",
  "aura-duration reduction is a defensive channel with no representation":
    "元素附着持续时间缩短尚无对应状态通道。",
  "depends on a game system the simulation does not model":
    "该效果依赖当前模拟器尚未覆盖的游戏系统。",
  "no `shieldStrength` StatKey; shields are not modelled":
    "当前没有护盾强效 StatKey，护盾状态尚未完整模拟。",
  "probabilistic trigger; the simulation path is deterministic by rule":
    "该效果含概率触发；模拟器按规则保持确定性。",
  "no attack-speed channel; animation timing is not modelled":
    "当前没有攻击速度通道，动作帧时间尚未模拟。",
};

const ARTIFACT_SUPPORT_STATE: Record<
  ArtifactSupportKind,
  "success" | "warning" | "info"
> = {
  modelled: "success",
  unimplemented: "warning",
  unverified: "info",
};

/** One set bonus, resolved for display. */
export interface ArtifactBonusSupport {
  readonly pieces: number;
  readonly kind: ArtifactSupportKind;
  readonly label: string;
  readonly state: "success" | "warning" | "info";
  /** The official Chinese wording. Always present. */
  readonly textZh: string;
  /** The generator's explanation. Present only when not modelled. */
  readonly reason?: string;
  /** Chinese rendering of the generator's explanation. */
  readonly reasonZh?: string;
  /** True when this tier has a runtime effect consumed by the simulator. */
  readonly runtimeSupported: boolean;
  /** Label for the runtime path, separate from sourced support classification. */
  readonly runtimeLabel: string;
}

function runtimeSupportedAt(effect: GeneratedArtifactEffect): boolean {
  const runtime = completeSetBonusBuffsById(effect.setSlug);
  if (!runtime) return false;
  if (effect.pieces === 1) return (runtime.onePiece?.length ?? 0) > 0;
  if (effect.pieces === 2) {
    return (
      (runtime.twoPiece?.length ?? 0) > 0 ||
      (runtime.twoPieceHealingEffects?.length ?? 0) > 0 ||
      (runtime.stateEffects?.length ?? 0) > 0 ||
      (runtime.twoPieceStateEffects?.length ?? 0) > 0
    );
  }
  if (effect.pieces === 4) {
    return (
      (runtime.fourPiece?.length ?? 0) > 0 ||
      (runtime.fourPieceHealingEffects?.length ?? 0) > 0 ||
      (runtime.healingEffects?.length ?? 0) > 0 ||
      (runtime.stateEffects?.length ?? 0) > 0 ||
      (runtime.fourPieceStateEffects?.length ?? 0) > 0
    );
  }
  return false;
}

function toSupport(effect: GeneratedArtifactEffect): ArtifactBonusSupport {
  const runtimeSupported = runtimeSupportedAt(effect);
  const reasonZh = runtimeSupported
    ? "已接入模拟；触发时序或状态按当前引擎可用数据进行确定性处理。"
    : effect.reason === undefined
      ? undefined
      : REASON_ZH[effect.reason] ?? "该效果暂未接入当前模拟器。";
  return {
    pieces: effect.pieces,
    kind: effect.support,
    label: ARTIFACT_SUPPORT_LABEL_ZH[effect.support],
    state: ARTIFACT_SUPPORT_STATE[effect.support],
    textZh: effect.textZh,
    runtimeSupported,
    runtimeLabel: runtimeSupported
      ? effect.support === "modelled"
        ? ARTIFACT_SUPPORT_LABEL_ZH.modelled
        : "已接入模拟（条件效果）"
      : ARTIFACT_SUPPORT_LABEL_ZH[effect.support],
    ...(effect.support === "modelled" || effect.reason === undefined
      ? {}
      : { reason: effect.reason, ...(reasonZh ? { reasonZh } : {}) }),
  };
}

/**
 * Every published bonus for a set, ascending by piece count.
 *
 * Ascending so 1pc/2pc/4pc read in the order the game presents them, and so the
 * order never depends on the generated array's incoming order.
 */
export function artifactBonusSupport(
  setId: string,
): readonly ArtifactBonusSupport[] {
  return generatedArtifactEffects
    .filter((effect) => effect.setSlug === setId)
    .slice()
    .sort((a, b) => a.pieces - b.pieces)
    .map(toSupport);
}

/** Lookup for one tier. `undefined` when the set publishes no such bonus. */
export function artifactBonusSupportAt(
  setId: string,
  pieces: number,
): ArtifactBonusSupport | undefined {
  return artifactBonusSupport(setId).find((bonus) => bonus.pieces === pieces);
}

/** The two tiers the modern game and `activeSetBonusKeys()` both model. */
export const ARTIFACT_TWO_PIECE = 2;
export const ARTIFACT_FOUR_PIECE = 4;

/**
 * The tiers a given worn piece count unlocks, ascending.
 *
 * MIRRORS `activeSetBonusKeys()`: four pieces unlock BOTH tiers, two unlock
 * only the 2pc, and fewer unlock none. It is stated here rather than imported
 * because this module is presentation and must not reach into the engine, and
 * it is a deliberate duplication of a two-line rule ONLY so the label can never
 * claim a tier the gate would withhold.
 *
 * This is the honesty seam: the slot labels every tier its count unlocks, so a
 * 4pc set whose 4pc bonus is unmodelled shows that fact instead of hiding
 * behind its modelled 2pc.
 */
export function activeArtifactTiers(
  pieces: number | undefined,
): readonly number[] {
  if (pieces === undefined) return [];
  const tiers: number[] = [];
  if (pieces >= ARTIFACT_TWO_PIECE) tiers.push(ARTIFACT_TWO_PIECE);
  if (pieces >= ARTIFACT_FOUR_PIECE) tiers.push(ARTIFACT_FOUR_PIECE);
  return tiers;
}

/**
 * Whether ANY bonus of this set reaches the engine.
 *
 * Used for the set-level chip. A set with a modelled 2pc and an unimplemented
 * 4pc is partially supported, and saying so is the honest summary — which is
 * why the per-tier rows remain the authority and this is only a headline.
 */
export function setHasModelledBonus(setId: string): boolean {
  return artifactBonusSupport(setId).some((bonus) => bonus.kind === "modelled");
}
