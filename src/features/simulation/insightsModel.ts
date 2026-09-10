import type {
  CharacterDefinition,
  SimulationResult,
} from "@/types";
import { fmtNum, fmtPercent } from "@/lib/format";
import { charNameZh } from "@/lib/i18n";
import { parseReactionKey } from "@/lib/reactionLabel";
import { abilityLabelZh } from "@/features/rotation-timeline/timelineModel";

export interface RotationInsight {
  id: string;
  category: "energy" | "damage" | "reaction" | "timing";
  status: "success" | "warning" | "info";
  badge: string;
  title: string;
  summary: string;
  detail: string;
}

/**
 * Derives 100% mathematically real tactical insights from simulation results and team.
 * Never invents or hardcodes synthetic metrics — every number is derived from
 * the concrete timeline, damage maps, and energy states.
 */
export function generateRotationInsights(
  result: SimulationResult,
  team: readonly (CharacterDefinition | null)[],
): readonly RotationInsight[] {
  const insights: RotationInsight[] = [];
  const activeMembers = team.filter((c): c is CharacterDefinition => c !== null);

  if (activeMembers.length === 0 || result.duration <= 0) {
    return insights;
  }

  // -------------------------------------------------------------------------
  // 1. Energy Loop & Burst Self-Sufficiency Insight
  // -------------------------------------------------------------------------
  const energyStatus = activeMembers.map((char) => {
    const charSnapshot = result.finalState.characters[char.id];
    const endEnergy = charSnapshot ? charSnapshot.energy.current : 0;
    const maxEnergy = char.maxEnergy;
    const isReady = endEnergy >= maxEnergy - 1e-3;
    const deficit = Math.max(0, maxEnergy - endEnergy);
    const pct = Math.min(1, endEnergy / (maxEnergy || 1));
    return { char, endEnergy, maxEnergy, isReady, deficit, pct };
  });

  const readyCount = energyStatus.filter((s) => s.isReady).length;
  const unready = energyStatus.filter((s) => !s.isReady);

  if (unready.length === 0) {
    insights.push({
      id: "energy-loop-success",
      category: "energy",
      status: "success",
      badge: "末尾能量",
      title: `全队循环末尾能量已满 (${readyCount}/${activeMembers.length})`,
      summary: "所有出战角色在观测结束时均已积攒满元素能量。",
      detail: `全部 ${activeMembers.length} 位角色的大招能量均已达到 100%；循环可重复性尚未验证。`,
    });
  } else {
    const names = unready
      .map((u) => `${charNameZh(u.char.name)} (尚缺 ${fmtNum(u.deficit)} 能量)`)
      .join("、");
    insights.push({
      id: "energy-loop-warning",
      category: "energy",
      status: "warning",
      badge: "末尾能量",
      title: `${readyCount}/${activeMembers.length} 角色末尾能量就绪 · 存在充能缺口`,
      summary: `未就绪角色：${names}。`,
      detail: "当前结果仅显示观测结束时的能量缺口；循环可重复性需要下一轮模拟或更完整的能量轨迹验证。",
    });
  }

  // -------------------------------------------------------------------------
  // 2. Primary DPS & MVP Skill Contribution Insight
  // -------------------------------------------------------------------------
  let maxCharId = "";
  let maxCharDmg = -1;

  for (const [charId, dmg] of Object.entries(result.damageByCharacter)) {
    if (dmg > maxCharDmg) {
      maxCharDmg = dmg;
      maxCharId = charId;
    }
  }

  const topChar = activeMembers.find((c) => c.id === maxCharId);
  const topDmgPct = result.totalDamage > 0 ? maxCharDmg / result.totalDamage : 0;

  // Find the single highest damaging hit in the entire timeline
  let highestHitDmg = 0;
  let highestHitAbilityId = "";
  let highestHitDamageType: string | undefined;
  let highestHitCharId = "";

  for (const event of result.timeline) {
    if (event.type === "damage" && event.damage) {
      if (event.damage.finalDamage > highestHitDmg) {
        highestHitDmg = event.damage.finalDamage;
        highestHitAbilityId = event.damage.abilityId;
        highestHitDamageType = event.damage.damageType;
        highestHitCharId = event.damage.sourceCharacterId;
      }
    }
  }

  const highestHitChar = activeMembers.find((c) => c.id === highestHitCharId);

  if (topChar && maxCharDmg > 0) {
    const mvpName = charNameZh(topChar.name);
    const hitCharName = highestHitChar ? charNameZh(highestHitChar.name) : mvpName;
    insights.push({
      id: "damage-mvp",
      category: "damage",
      status: "info",
      badge: "输出核心",
      title: `${mvpName} 贡献全队 ${fmtPercent(topDmgPct)} 输出`,
      summary: `${mvpName} 累计造成 ${fmtNum(maxCharDmg)} 伤害，为本循环绝对主力输出手。`,
      detail: highestHitDmg > 0
        ? `全轴最高单发伤害由 ${hitCharName} 的「${abilityLabelZh(highestHitAbilityId, highestHitDamageType)}」打出 (${fmtNum(highestHitDmg)} 伤害)。`
        : `全队总秒伤达 ${fmtNum(result.dps)} DPS。`,
    });
  }

  // -------------------------------------------------------------------------
  // 3. Elemental Reaction Synergy Insight
  // -------------------------------------------------------------------------
  const damageEvents = result.timeline.filter(
    (e) => e.type === "damage" && Boolean(e.damage),
  );
  const reactionEvents = damageEvents.filter(
    (e) => e.damage && parseReactionKey(e.damage.abilityId) !== null,
  );

  const reactionCount = reactionEvents.length;
  const totalHits = damageEvents.length;
  const reactionRate = totalHits > 0 ? reactionCount / totalHits : 0;

  if (reactionCount > 0) {
    insights.push({
      id: "reaction-synergy",
      category: "reaction",
      status: "success",
      badge: "反应记录",
      title: `已记录反应事件占伤害判定 ${fmtPercent(reactionRate)}`,
      summary: `全轴 ${totalHits} 次伤害判定中，记录 ${reactionCount} 次可识别的反应伤害事件。`,
      detail: "该统计只覆盖引擎已发出的反应伤害事件，不代表完整的元素附着或反应覆盖情况。",
    });
  }

  // -------------------------------------------------------------------------
  // 4. Rotation Tempo & Animation Overhead Insight
  // -------------------------------------------------------------------------
  const swapEvents = result.timeline.filter((e) => e.type === "swap");
  const totalSwapTime = swapEvents.reduce((acc, s) => acc + (s.duration ?? 0), 0);
  const swapTimeRatio = result.duration > 0 ? totalSwapTime / result.duration : 0;
  const swapCount = swapEvents.length;

  if (result.duration > 0) {
    const isTempoTight = swapTimeRatio <= 0.20;
    insights.push({
      id: "rotation-tempo",
      category: "timing",
      status: "info",
      badge: "时序节奏",
      title: `循环轴长 ${result.duration.toFixed(2)} 秒 · ${swapCount} 次切人`,
      summary: `切人衔接总耗时 ${totalSwapTime.toFixed(2)} 秒 (占比 ${fmtPercent(swapTimeRatio)})。`,
      detail: isTempoTight
        ? "观测到的切人耗时占比较低；这项指标不代表循环没有时间闲置或技能覆盖充分。"
        : "观测到的切人耗时占比较高；这项指标未评估技能覆盖或时间闲置。",
    });
  }

  return insights;
}
