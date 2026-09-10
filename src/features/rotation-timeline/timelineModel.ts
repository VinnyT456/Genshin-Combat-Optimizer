import type {
  CharacterDefinition,
  CombatEvent,
  Element,
  SimulationWarning,
} from "@/types";
import { actionTypeZh, charNameZh, elementZh, reactionZh } from "@/lib/i18n";
import { parseReactionKey } from "@/lib/reactionLabel";

// ---------------------------------------------------------------------------
// Pure presentation model for the multi-lane rotation timeline.
//
// This module turns the engine's flat CombatEvent[] into lane-assigned, laid-out
// spans. Everything here is geometry, grouping and labelling — it computes no
// damage, energy or reaction values, and reads only fields the engine already
// published. Kept free of React so it is directly unit-testable.
// ---------------------------------------------------------------------------

/** Minimum rendered span width, as a percentage of the track. */
export const MIN_SPAN_PERCENT = 1.5;

/** A span narrower than this (in percent) gets no inline label. */
export const INLINE_LABEL_MIN_PERCENT = 6;

/** Axis tick spacing is chosen from these, in seconds, shortest that fits. */
export const TICK_STEPS_SECONDS = [1, 2, 5, 10] as const;

/** Target number of axis ticks; the step closest to this count wins. */
export const TARGET_TICK_COUNT = 8;

/** Ability class marker. Element colour alone must not distinguish these. */
export type AbilityClass = "N" | "C" | "E" | "Q";

const ABILITY_CLASS_BY_DAMAGE_TYPE: Record<string, AbilityClass> = {
  normal: "N",
  charged: "C",
  plunge: "N",
  skill: "E",
  burst: "Q",
};

const ABILITY_CLASS_LABEL: Record<AbilityClass, string> = {
  N: "普通攻击",
  C: "重击",
  E: "元素战技",
  Q: "元素爆发",
};

export function abilityClassLabel(cls: AbilityClass): string {
  return ABILITY_CLASS_LABEL[cls];
}

/** Chinese presentation label for an engine ability or reaction bucket. */
export function abilityLabelZh(abilityId: string, damageType?: string): string {
  const reaction = parseReactionKey(abilityId);
  if (reaction !== null) return `反应：${reactionZh(reaction.reactionKind)}`;
  if (damageType !== undefined) {
    const label = actionTypeZh(damageType);
    if (label !== damageType) return label;
  }
  const suffix = abilityId.slice(abilityId.lastIndexOf("-") + 1).toLowerCase();
  if (suffix === "na" || suffix === "normal") return "普通攻击";
  if (suffix === "ca" || suffix === "charged") return "重击";
  if (suffix === "e" || suffix === "skill") return "元素战技";
  if (suffix === "q" || suffix === "burst") return "元素爆发";
  return "未知动作";
}

export function eventTypeZh(type: string): string {
  return EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS] ?? "未知事件";
}

const EVENT_TYPE_LABELS = {
  damage: "伤害事件",
  swap: "切换角色",
  energy: "能量事件",
  healing: "治疗事件",
  pickup: "拾取事件",
  resource: "资源事件",
  info: "信息事件",
} as const;

function characterLabelZh(character: CharacterDefinition | undefined, fallback = "未知角色"): string {
  return character === undefined ? fallback : charNameZh(character.name);
}

function warningDescriptionZh(warning: SimulationWarning): string {
  const descriptions: Record<string, string> = {
    "on-cooldown": "技能处于冷却中",
    "insufficient-energy": "能量不足",
    "unknown-character": "角色不存在",
    "unknown-ability": "技能不存在",
    "mismatched-ability": "技能不属于该角色",
    "redundant-swap": "无需重复切换角色",
    "past-time-limit": "超过时间上限",
    "invalid-config": "模拟配置无效",
  };
  const base = descriptions[warning.code] ?? "动作未执行";
  return warning.availableAt === undefined
    ? base
    : `${base}，可用时间 ${formatSeconds(warning.availableAt)}`;
}

/** Builds a safe Chinese description without reading engine prose. */
export function eventDescriptionZh(
  event: CombatEvent,
  charactersById?: ReadonlyMap<string, CharacterDefinition>,
): string {
  const actor = characterLabelZh(charactersById?.get(event.characterId));
  if (event.type === "damage" && event.damage !== undefined) {
    const label = abilityLabelZh(event.damage.abilityId, event.damage.damageType);
    return `${actor} 使用${label}，造成 ${Math.round(event.damage.finalDamage).toLocaleString("zh-CN")} 点伤害`;
  }
  if (event.type === "swap") {
    const from = event.fromCharacterId === undefined
      ? "初始角色"
      : characterLabelZh(charactersById?.get(event.fromCharacterId), "未知角色（无法匹配）");
    return `${from} 切换至 ${actor}`;
  }
  if (event.type === "energy") return `${actor} 获得能量`;
  if (event.type === "healing") {
    const amount = event.healing?.amount;
    return `${actor} 恢复 ${amount === undefined ? "" : `${Math.round(amount).toLocaleString("zh-CN")} 点`}生命值`;
  }
  if (event.type === "pickup") {
    const kind = event.pickup?.kind === "mora" ? "摩拉" : event.pickup?.kind === "chest" ? "宝箱" : event.pickup?.kind === "item" ? "物品" : "元素微粒";
    return `${actor} 拾取${kind}`;
  }
  if (event.type === "resource") {
    return `${actor} 触发资源效果`;
  }
  if (event.type === "info") return "暂无中文事件说明";
  return "暂无中文事件说明";
}

/** A rendered action span in one character's lane. */
export interface ActionSpan {
  kind: "action";
  /** Index into the original `timeline` array — the shared selection key. */
  eventIndex: number;
  characterId: string;
  start: number;
  duration: number;
  /** Left offset as a percentage of the track. */
  leftPercent: number;
  /** Width as a percentage of the track, clamped to MIN_SPAN_PERCENT. */
  widthPercent: number;
  /** True when the width was clamped, so the real duration needs a tooltip. */
  clamped: boolean;
  element: Element;
  abilityClass: AbilityClass;
  /** Chinese presentation label; never the engine's raw ability name. */
  abilityName: string;
  damage: number;
  label: string;
}

/** A swap, rendered as a span of real width bridging two lanes. */
export interface SwapSpan {
  kind: "swap";
  eventIndex: number;
  /** Lane the swap leaves; null for the opening swap of a run. */
  fromCharacterId: string | null;
  /** Lane the swap enters. */
  toCharacterId: string;
  start: number;
  duration: number;
  leftPercent: number;
  widthPercent: number;
  clamped: boolean;
  label: string;
}

/** A skipped action, placed in the owning lane at the attempted timestamp. */
export interface SkipMarker {
  kind: "skip";
  warningIndex: number;
  characterId: string;
  start: number;
  leftPercent: number;
  label: string;
}

export interface Lane {
  /** Party position, 0-based. Stable across edits. */
  slotIndex: number;
  /** Null for an empty slot: the lane still renders, dimmed. */
  character: CharacterDefinition | null;
  actions: ActionSpan[];
  skips: SkipMarker[];
}

export interface AxisTick {
  time: number;
  leftPercent: number;
  /** The unit is shown on the first and last tick only. */
  showUnit: boolean;
}

export interface TimelineModel {
  lanes: Lane[];
  swaps: SwapSpan[];
  ticks: AxisTick[];
  duration: number;
  /** Total seconds spent swapping, and the swap count. */
  swapCount: number;
  totalSwapTime: number;
}

/** Guards against a zero/negative span producing Infinity or NaN offsets. */
function safeSpan(duration: number): number {
  return duration > 0 ? duration : 1;
}

function percent(value: number, span: number): number {
  return (value / span) * 100;
}

/** Formats seconds with two decimals and a non-breaking space before the unit. */
export function formatSeconds(seconds: number): string {
  return `${seconds.toFixed(2)} s`;
}

export function formatSecondsShort(seconds: number): string {
  return `${seconds.toFixed(1)} s`;
}

/**
 * Chooses an axis step that yields close to TARGET_TICK_COUNT ticks, so a 5 s
 * and a 90 s rotation both get a readable axis.
 */
export function chooseTickStep(duration: number): number {
  const span = safeSpan(duration);
  let best: number = TICK_STEPS_SECONDS[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const step of TICK_STEPS_SECONDS) {
    const distance = Math.abs(span / step - TARGET_TICK_COUNT);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = step;
    }
  }
  return best;
}

export function buildTicks(duration: number): AxisTick[] {
  const span = safeSpan(duration);
  const step = chooseTickStep(duration);
  const ticks: AxisTick[] = [];
  for (let t = 0; t <= span + Number.EPSILON; t += step) {
    const time = Math.round(t * 100) / 100;
    ticks.push({ time, leftPercent: percent(time, span), showUnit: false });
  }
  const first = ticks[0];
  const last = ticks[ticks.length - 1];
  if (first) first.showUnit = true;
  if (last) last.showUnit = true;
  return ticks;
}

function abilityClassFor(
  character: CharacterDefinition | undefined,
  abilityId: string,
  damageType: string,
): AbilityClass {
  if (character !== undefined) {
    if (abilityId === character.elementalBurst.id) return "Q";
    if (abilityId === character.elementalSkill.id) return "E";
    if (abilityId === character.chargedAttack.id) return "C";
    if (abilityId === character.normalAttack.id) return "N";
  }
  return ABILITY_CLASS_BY_DAMAGE_TYPE[damageType] ?? "N";
}

export interface BuildTimelineInput {
  timeline: readonly CombatEvent[];
  duration: number;
  /** Party order, holes allowed. Lane order mirrors slot order exactly. */
  team: readonly (CharacterDefinition | null)[];
  warnings: readonly SimulationWarning[];
}

export function buildTimelineModel({
  timeline,
  duration,
  team,
  warnings,
}: BuildTimelineInput): TimelineModel {
  const span = safeSpan(duration);
  const byId = new Map<string, CharacterDefinition>();
  team.forEach((c) => {
    if (c !== null) byId.set(c.id, c);
  });

  const lanes: Lane[] = team.map((character, slotIndex) => ({
    slotIndex,
    character,
    actions: [],
    skips: [],
  }));
  const laneByCharacterId = new Map<string, Lane>();
  lanes.forEach((lane) => {
    if (lane.character !== null) laneByCharacterId.set(lane.character.id, lane);
  });

  const swaps: SwapSpan[] = [];
  let totalSwapTime = 0;

  timeline.forEach((event, eventIndex) => {
    if (event.type === "swap") {
      const to = byId.get(event.characterId);
      const from =
        event.fromCharacterId !== undefined
          ? byId.get(event.fromCharacterId)
          : undefined;
      const swapDuration = event.duration ?? 0;
      totalSwapTime += swapDuration;
      const rawWidth = percent(swapDuration, span);
      swaps.push({
        kind: "swap",
        eventIndex,
        fromCharacterId: event.fromCharacterId ?? null,
        toCharacterId: event.characterId,
        start: event.timestamp,
        duration: swapDuration,
        leftPercent: percent(event.timestamp, span),
        widthPercent: Math.max(rawWidth, MIN_SPAN_PERCENT),
        clamped: rawWidth < MIN_SPAN_PERCENT,
        label:
          from !== undefined
            ? `${characterLabelZh(from)} 切换至 ${characterLabelZh(to)}，` +
              `时间 ${formatSeconds(event.timestamp)}，耗时 ${formatSeconds(swapDuration)}`
            : `切换至 ${characterLabelZh(to)}，` +
              `时间 ${formatSeconds(event.timestamp)}，耗时 ${formatSeconds(swapDuration)}`,
      });
      return;
    }

    if (event.type !== "damage" || event.damage === undefined) return;

    const lane = laneByCharacterId.get(event.characterId);
    if (lane === undefined) return;

    const character = byId.get(event.characterId);
    const d = event.damage;
    // The engine publishes the on-field time it ACTUALLY advanced the clock by.
    // Read it; never re-derive it from a CharacterDefinition, or an effective
    // cast time that differs from the static definition would be misreported.
    const actionDuration = event.duration ?? 0;
    const rawWidth = percent(actionDuration, span);
    const abilityClass = abilityClassFor(character, d.abilityId, d.damageType);

    lane.actions.push({
      kind: "action",
      eventIndex,
      characterId: event.characterId,
      start: event.timestamp,
      duration: actionDuration,
      leftPercent: percent(event.timestamp, span),
      widthPercent: Math.max(rawWidth, MIN_SPAN_PERCENT),
      clamped: rawWidth < MIN_SPAN_PERCENT,
      element: d.element,
      abilityClass,
      abilityName: abilityLabelZh(d.abilityId, d.damageType),
      damage: d.finalDamage,
      label:
        `${characterLabelZh(character)} 使用${abilityLabelZh(d.abilityId, d.damageType)} ` +
        `（${abilityClassLabel(abilityClass)}，${elementZh(d.element)}）` +
        `，时间 ${formatSeconds(event.timestamp)}，造成 ${Math.round(d.finalDamage).toLocaleString("zh-CN")} 点伤害`,
    });
  });

  warnings.forEach((warning, warningIndex) => {
    const lane = laneByCharacterId.get(warning.characterId);
    if (lane === undefined) return;
    lane.skips.push({
      kind: "skip",
      warningIndex,
      characterId: warning.characterId,
      start: warning.timestamp,
      leftPercent: percent(warning.timestamp, span),
      label: `已跳过：${warningDescriptionZh(warning)}`,
    });
  });

  return {
    lanes,
    swaps,
    ticks: buildTicks(duration),
    duration,
    swapCount: swaps.length,
    totalSwapTime,
  };
}

/** Every selectable span, in chronological order. Drives Home/End and the list. */
export function selectableEventIndices(model: TimelineModel): number[] {
  const entries: { index: number; start: number }[] = [];
  model.lanes.forEach((lane) =>
    lane.actions.forEach((a) => entries.push({ index: a.eventIndex, start: a.start })),
  );
  model.swaps.forEach((s) => entries.push({ index: s.eventIndex, start: s.start }));
  entries.sort((a, b) => a.start - b.start || a.index - b.index);
  return entries.map((e) => e.index);
}

/**
 * Neighbour of `eventIndex` in the same lane, `step` positions away.
 * Returns null at the ends rather than wrapping — wrapping in a time series
 * would jump the user across the whole rotation.
 */
export function neighbourInLane(
  lane: Lane,
  eventIndex: number,
  step: number,
): number | null {
  const position = lane.actions.findIndex((a) => a.eventIndex === eventIndex);
  if (position === -1) return null;
  const target = lane.actions[position + step];
  return target?.eventIndex ?? null;
}

/** The action nearest in time within `lane`, used for vertical lane changes. */
export function nearestInLane(lane: Lane, time: number): number | null {
  let best: ActionSpan | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const action of lane.actions) {
    const distance = Math.abs(action.start - time);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = action;
    }
  }
  return best?.eventIndex ?? null;
}

/** Lane index holding `eventIndex`, or -1. */
export function laneIndexOfEvent(model: TimelineModel, eventIndex: number): number {
  return model.lanes.findIndex((lane) =>
    lane.actions.some((a) => a.eventIndex === eventIndex),
  );
}

/** Fraction of total duration spent swapping, for the Tier-2 stat. */
export function swapTimeFraction(model: TimelineModel): number {
  return model.duration > 0 ? model.totalSwapTime / model.duration : 0;
}
