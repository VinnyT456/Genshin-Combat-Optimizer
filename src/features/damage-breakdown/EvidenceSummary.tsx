import type { SimulationResult } from "@/types";

interface Props {
  result: Pick<SimulationResult, "timeline" | "damageByAbility" | "damageByCharacter" | "damageByElement">;
}

/** Reusable provenance surface; it describes emitted evidence only. */
export function EvidenceSummary({ result }: Props) {
  const damageEvents = result.timeline.filter((event) => event.type === "damage" && event.damage !== undefined).length;
  const reactionEvents = result.timeline.filter(
    (event) => event.type === "damage" && event.damage?.abilityId.includes(":")
  ).length;

  return (
    <aside className="rounded-md border border-surface-border bg-surface/40 p-4 text-xs text-slate-300" aria-label="证据说明">
      <h4 className="font-semibold text-slate-200">证据说明</h4>
      <ul className="mt-2 space-y-1.5 leading-relaxed">
        <li>伤害事件：{damageEvents} 条时间轴记录。</li>
        <li>
          汇总桶：{Object.keys(result.damageByAbility).length} 个技能、
          {Object.keys(result.damageByCharacter).length} 个角色、
          {Object.keys(result.damageByElement).length} 个元素。
        </li>
        <li>
          反应事件：{reactionEvents > 0 ? `已记录 ${reactionEvents} 条。` : "当前没有可识别记录，无法据此证明未发生反应。"}
        </li>
      </ul>
    </aside>
  );
}
