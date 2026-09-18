import type { CharacterDefinition, CombatEvent } from "@/types";
import { cn } from "@/components/ui/cn";
import { CARD, FOCUS_RING } from "@/components/ui/tokens";
import { elementTextClass, fmtNum } from "@/lib/format";
import { formatEnergy } from "@/lib/energyFormat";
import {
  abilityLabelZh,
  buildRuntimeBuffWindows,
  eventDescriptionZh,
  eventTypeZh,
  formatSeconds,
  type TimelineBuffWindow,
} from "@/features/rotation-timeline/timelineModel";
import { actionTypeZh, charNameZh, elementZh } from "@/lib/i18n";

interface Props {
  event: CombatEvent | null;
  /** Party members by id, for naming both ends of a swap. */
  charactersById: ReadonlyMap<string, CharacterDefinition>;
  /** Party energy snapshot at this event, when the engine published one. */
  totalDamage: number;
  /** Runtime buff evidence carried by the completed simulation snapshot. */
  runtimeBuffs?: readonly unknown[];
  /** Duration used to clip the published buff windows to this run. */
  duration: number;
}

/**
 * Detail for the selected event.
 */
export function EventDetailPanel({
  event,
  charactersById,
  totalDamage,
  runtimeBuffs,
  duration,
}: Props) {
  const buffWindows = buildRuntimeBuffWindows(runtimeBuffs, duration);
  if (event === null) {
    return (
      <aside className={cn(CARD, "h-full min-h-56 p-4 font-mono")} aria-label="事件检查器">
        <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">事件检查器</p>
        <h3 className="mt-2 text-base font-semibold text-slate-100">等待选择事件</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          选择时间轴或事件列表中的记录，查看伤害、动作占时、增益窗口与能量状态。
        </p>
        {buffWindows.length > 0 && (
          <BuffEvidenceList windows={buffWindows} timestamp={null} />
        )}
        <p className="sr-only" aria-live="polite">尚未选择时间轴事件。</p>
      </aside>
    );
  }

  const actor = charactersById.get(event.characterId);
  const actorName = actor ? charNameZh(actor.name) : "未知角色";
  const d = event.damage;
  const share = d && totalDamage > 0 ? d.finalDamage / totalDamage : null;
  const eventTypeName = eventTypeZh(event.type);
  const activeBuffs = buffWindows.filter(
    (window) => event.timestamp >= window.start && event.timestamp <= window.end,
  );

  return (
    <aside className={cn(CARD, "h-full p-4 font-mono")} aria-label="事件检查器">
      <header className="flex items-start justify-between gap-3 border-b border-surface-border pb-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-cyan-200/80">事件检查器</p>
          <h3 className="mt-1 truncate text-base font-semibold text-slate-100">
            {d ? `${actorName} · ${abilityLabelZh(d.abilityId, d.damageType)}` : eventDescriptionZh(event, charactersById)}
          </h3>
        </div>
        <span className="shrink-0 text-right text-xs text-slate-400">
          <span className="block text-slate-200">{formatSeconds(event.timestamp)}</span>
          <span className="block">{eventTypeName}</span>
        </span>
      </header>

      <p className="sr-only" aria-live="polite">
        已选择 {actorName} 的 {eventTypeName}，时间 {formatSeconds(event.timestamp)}。
      </p>

      {d ? (
        <>
          <section className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]" aria-label="伤害结果">
            <div className="rounded-sm border border-cyan-400/40 bg-cyan-400/5 p-3">
              <p className="text-xs text-slate-400">本次模拟伤害</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-100">{fmtNum(d.finalDamage)}</p>
              <p className="mt-1 text-xs text-slate-500">沿用本次运行的暴击模式</p>
            </div>
            <div className="rounded-sm border border-surface-border bg-surface-raised/50 p-3">
              <p className="text-xs text-slate-400">本轮伤害占比</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-amber-300">
                {share === null ? "—" : `${(share * 100).toFixed(1)}%`}
              </p>
              {share !== null && (
                <div className="mt-3 h-1.5 overflow-hidden bg-surface-border" aria-hidden="true">
                  <div className="h-full bg-amber-300" style={{ width: `${Math.min(100, share * 100)}%` }} />
                </div>
              )}
            </div>
          </section>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <DetailField label="技能名称" value={abilityLabelZh(d.abilityId, d.damageType)} valueClassName={elementTextClass(d.element)} />
            <DetailField label="元素属性" value={elementZh(d.element)} valueClassName={elementTextClass(d.element)} />
            <DetailField
              label="伤害类型"
              value={actionTypeZh(d.damageType) === d.damageType ? "未知动作" : actionTypeZh(d.damageType)}
            />
            <DetailField
              label="动作占时"
              value={event.duration === undefined ? "未单独记录" : formatSeconds(event.duration)}
            />
          </dl>

          <BuffEvidenceList windows={buffWindows} timestamp={event.timestamp} activeWindows={activeBuffs} />

          <details className="mt-4 border-t border-surface-border pt-3">
            <summary className={cn("flex min-h-11 cursor-pointer items-center text-xs text-slate-400 hover:text-slate-200", FOCUS_RING)}>
              查看暴击参考与底层数值
            </summary>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 text-xs">
              <DetailField label="暴击伤害" value={fmtNum(d.critDamage)} valueClassName="text-amber-300" mono />
              <DetailField label="未暴击伤害" value={fmtNum(d.nonCritDamage)} mono />
              <DetailField label="基底伤害" value={fmtNum(d.rawDamage)} mono />
            </dl>
          </details>
        </>
      ) : (
        <EventContext event={event} actorName={actorName} charactersById={charactersById} />
      )}

      <details className="mt-4 border-t border-surface-border pt-3">
        <summary className={cn("flex min-h-11 cursor-pointer items-center text-xs text-slate-400 hover:text-slate-200", FOCUS_RING)}>
          查看该时间点处理后能量
        </summary>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 text-xs">
          {event.energy !== undefined && (
            <DetailField label="行动者能量" value={formatEnergy(event.energy)} mono />
          )}
          {event.energyByCharacter !== undefined &&
            Object.entries(event.energyByCharacter).map(([id, value]) => (
              <DetailField
                key={id}
                label={`${charNameZh(charactersById.get(id)?.name ?? id)} 能量`}
                value={formatEnergy(value)}
                mono
              />
            ))}
          {event.energy === undefined && event.energyByCharacter === undefined && (
            <p className="col-span-2 text-xs leading-5 text-slate-500">该事件没有发布能量快照。</p>
          )}
        </dl>
      </details>
    </aside>
  );
}

function DetailField({
  label,
  value,
  valueClassName,
  mono = false,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn("mt-1 truncate text-slate-200", valueClassName, mono && "tabular-nums")} title={value}>
        {value}
      </dd>
    </div>
  );
}

function BuffEvidenceList({
  windows,
  timestamp,
  activeWindows,
}: {
  windows: readonly TimelineBuffWindow[];
  timestamp: number | null;
  activeWindows?: readonly TimelineBuffWindow[];
}) {
  if (windows.length === 0) return null;
  const visible = activeWindows ?? windows;
  return (
    <section className="mt-4 border-t border-surface-border pt-3" aria-label="增益窗口">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-xs font-semibold text-slate-200">该时间点的增益窗口</h4>
        {timestamp === null && <span className="text-micro text-slate-500">本次运行</span>}
      </div>
      {timestamp !== null && visible.length === 0 ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">此时间点没有已记录的相关增益窗口。</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {visible.map((window) => (
            <li key={`${window.id}:${window.start}:${window.end}`} className="flex items-start justify-between gap-3 text-xs">
              <span className="min-w-0">
                <span className="block truncate text-slate-200">{window.label}</span>
                <span className="block text-micro text-slate-500">{window.scopeLabel}</span>
              </span>
              <span className="shrink-0 text-right tabular-nums text-slate-400">
                {formatSeconds(window.start)} – {formatSeconds(window.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {timestamp !== null && (
        <p className="mt-2 text-micro leading-4 text-slate-500">
          时间重叠仅表示窗口存在；是否作用于单次命中仍由引擎的范围与快照规则判定。
        </p>
      )}
    </section>
  );
}

function EventContext({
  event,
  actorName,
  charactersById,
}: {
  event: CombatEvent;
  actorName: string;
  charactersById: ReadonlyMap<string, CharacterDefinition>;
}) {
  if (event.type !== "swap") {
    return (
      <p className="mt-4 rounded-sm bg-surface-raised/50 p-3 text-sm leading-6 text-slate-300">
        {eventDescriptionZh(event, charactersById)}
      </p>
    );
  }

  const from = event.fromCharacterId === undefined
    ? "初始角色"
    : charNameZh(charactersById.get(event.fromCharacterId)?.name ?? "未知角色");
  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
      <DetailField label="切出角色" value={from} />
      <DetailField label="切入角色" value={actorName} valueClassName="text-amber-300" />
      <DetailField label="切人耗时" value={event.duration === undefined ? "未单独记录" : formatSeconds(event.duration)} mono />
    </dl>
  );
}
