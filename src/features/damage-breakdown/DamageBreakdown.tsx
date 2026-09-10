import type { SimulationResult } from "@/types";
import { fmtNum } from "@/lib/format";
import { charNameZh, elementZh } from "@/lib/i18n";
import {
  type BreakdownCharacter,
  buildBreakdownTables,
  composeRowText,
  type BreakdownTableModel,
} from "./breakdownModel";

interface Props {
  result: SimulationResult;
  /**
   * Party members, used ONLY to resolve an ability bucket's owning character
   * name for §10's duplicate-row qualifier. Without it every collision falls
   * back to the raw ability id, which §10.3 reserves as the missing-label
   * signal — so this is required, not optional.
   */
  team: readonly BreakdownCharacter[];
}

/** Decimal places on the share-of-total percentage. */
const PERCENT_DECIMALS = 1;

const TABLE_TITLE_ZH: Record<string, string> = {
  "By Ability": "按技能维度拆解",
  "By Character": "按出战角色拆解",
  "By Element": "按元素属性拆解",
};

function getRowDisplayLabel(tableTitle: string, label: string): string {
  if (tableTitle === "By Element") {
    return elementZh(label);
  }
  if (tableTitle === "By Character") {
    return charNameZh(label);
  }
  return label;
}

/**
 * Renders one pre-resolved table. Rows arrive already sorted and labelled.
 */
function BreakdownTable({ table }: { table: BreakdownTableModel }) {
  const { title, rows } = table;
  const displayTitle = TABLE_TITLE_ZH[title] ?? title;

  return (
    <div className="rounded-md border border-surface-border bg-surface-raised p-4 font-mono">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {displayTitle}
      </h4>
      <ul className="space-y-2">
        {rows.map((row) => {
          const displayLabel = getRowDisplayLabel(title, row.label);
          const fullLabel = composeRowText(displayLabel, row.qualifier);
          return (
            <li key={row.key}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="min-w-0 truncate" title={fullLabel}>
                  {displayLabel}
                  {row.qualifier !== undefined && (
                    // Visible text, not a tooltip: the qualifier is the only
                    // thing telling two identically-named rows apart, so it
                    // must be readable without hover (§10.4, §10.6).
                    <span className="text-slate-400"> · {row.qualifier}</span>
                  )}
                </span>
                <span className="ml-2 font-mono text-xs text-slate-300">
                  {fmtNum(row.value)} · {row.percent.toFixed(PERCENT_DECIMALS)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded bg-surface-border">
                <div
                  className="h-full rounded bg-amber-500/70"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="text-xs text-slate-400">暂无伤害数据记录。</li>
        )}
      </ul>
    </div>
  );
}

export function DamageBreakdown({ result, team }: Props) {
  const tables = buildBreakdownTables(result, team);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tables.map((table) => (
        <BreakdownTable key={table.title} table={table} />
      ))}
    </div>
  );
}
