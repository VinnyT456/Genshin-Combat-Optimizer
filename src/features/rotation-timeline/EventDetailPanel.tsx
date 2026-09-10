import type { CharacterDefinition, CombatEvent } from "@/types";
import { cn } from "@/components/ui/cn";
import { CARD } from "@/components/ui/tokens";
import { elementTextClass, fmtNum } from "@/lib/format";
import { formatEnergy } from "@/lib/energyFormat";
import {
  abilityLabelZh,
  eventDescriptionZh,
  eventTypeZh,
  formatSeconds,
} from "@/features/rotation-timeline/timelineModel";
import { actionTypeZh, charNameZh, elementZh } from "@/lib/i18n";

interface Props {
  event: CombatEvent | null;
  /** Party members by id, for naming both ends of a swap. */
  charactersById: ReadonlyMap<string, CharacterDefinition>;
  /** Party energy snapshot at this event, when the engine published one. */
  totalDamage: number;
}

/**
 * Detail for the selected event.
 */
export function EventDetailPanel({ event, charactersById, totalDamage }: Props) {
  if (event === null) {
    return (
      <div className={cn(CARD, "p-4 text-sm text-slate-400 font-mono")}>
        点击上方时间轴事件以查看详细参数。
      </div>
    );
  }

  const actor = charactersById.get(event.characterId);
  const actorName = actor ? charNameZh(actor.name) : "未知角色";
  const d = event.damage;
  const share = d && totalDamage > 0 ? d.finalDamage / totalDamage : null;
  const eventTypeName = eventTypeZh(event.type);

  return (
    <div className={cn(CARD, "p-4 text-sm font-mono")}>
      <div className="mb-2 font-mono text-xs text-slate-400">
        {formatSeconds(event.timestamp)} · {eventTypeName}
      </div>
      <h3 className="font-semibold text-slate-100">
        {eventDescriptionZh(event, charactersById)}
      </h3>

      {event.type === "swap" && (
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <dt className="text-slate-400">切出角色</dt>
          <dd>
            {event.fromCharacterId === undefined
              ? "— (循环初始首发)"
              : (charactersById.has(event.fromCharacterId)
                  ? charNameZh(charactersById.get(event.fromCharacterId)?.name ?? "")
                  : "未知角色（无法匹配）")}
          </dd>
          <dt className="text-slate-400">切入角色</dt>
          <dd className="font-semibold text-amber-300">{actorName}</dd>
          <dt className="text-slate-400">切人耗时</dt>
          <dd className="font-mono">
            {event.duration === undefined ? "—" : formatSeconds(event.duration)}
          </dd>
        </dl>
      )}

      {d && (
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <dt className="text-slate-400">技能名称</dt>
          <dd className={elementTextClass(d.element)}>
            {abilityLabelZh(d.abilityId, d.damageType)}
          </dd>
          <dt className="text-slate-400">元素属性</dt>
          <dd className={elementTextClass(d.element)}>{elementZh(d.element)}</dd>
          <dt className="text-slate-400">伤害类型</dt>
          <dd>
            {actionTypeZh(d.damageType) === d.damageType
              ? "未知动作"
              : actionTypeZh(d.damageType)}
          </dd>
          <dt className="text-slate-400">期望伤害</dt>
          <dd className="font-mono">{fmtNum(d.finalDamage)}</dd>
          <dt className="text-slate-400">暴击伤害</dt>
          <dd className="font-mono text-amber-400">{fmtNum(d.critDamage)}</dd>
          <dt className="text-slate-400">未暴击伤害</dt>
          <dd className="font-mono">{fmtNum(d.nonCritDamage)}</dd>
          {share !== null && (
            <>
              <dt className="text-slate-400">总伤害占比</dt>
              <dd className="font-mono">{(share * 100).toFixed(1)}%</dd>
            </>
          )}
        </dl>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-200">
          底层详细数值
        </summary>
        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          {d && (
            <>
              <dt className="text-slate-400">基底伤害</dt>
              <dd className="font-mono">{fmtNum(d.rawDamage)}</dd>
            </>
          )}
          {event.energy !== undefined && (
            <>
              <dt className="text-slate-400">行动者当前能量</dt>
              <dd className="font-mono">{formatEnergy(event.energy)}</dd>
            </>
          )}
          {event.energyByCharacter !== undefined &&
            Object.entries(event.energyByCharacter).map(([id, value]) => (
              <div key={id} className="contents">
                <dt className="text-slate-400">
                  {charNameZh(charactersById.get(id)?.name ?? id)} 能量
                </dt>
                <dd className="font-mono">{formatEnergy(value)}</dd>
              </div>
            ))}
        </dl>
      </details>
    </div>
  );
}
