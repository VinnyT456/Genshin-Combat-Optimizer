"use client";

import { useMemo } from "react";
import type {
  ArtifactLoadout,
  ArtifactPiece,
  ArtifactSlot,
  EquipmentStat,
  EquipmentStatKey,
} from "@/simulation/character/equipment";
import type { Element } from "@/types";
import { ARTIFACT_SLOTS } from "@/simulation/character/equipment";
import { cn } from "@/components/ui/cn";
import { FOCUS_RING } from "@/components/ui/tokens";

const STAT_OPTIONS: readonly { key: EquipmentStatKey; label: string; percent?: boolean }[] = [
  { key: "hpFlat", label: "生命值" },
  { key: "atkFlat", label: "攻击力" },
  { key: "defFlat", label: "防御力" },
  { key: "hpPercent", label: "生命值%", percent: true },
  { key: "atkPercent", label: "攻击力%", percent: true },
  { key: "defPercent", label: "防御力%", percent: true },
  { key: "critRate", label: "暴击率", percent: true },
  { key: "critDmg", label: "暴击伤害", percent: true },
  { key: "energyRecharge", label: "元素充能", percent: true },
  { key: "elementalMastery", label: "元素精通" },
  { key: "dmgBonus", label: "伤害加成", percent: true },
  // Elemental damage is rendered as seven specific options below. Keep this
  // entry for the shared percentage formatting lookup.
  { key: "elementalDmgBonus", label: "元素伤害", percent: true },
];

const ELEMENT_OPTIONS: readonly (readonly [Element, string])[] = [
  ["anemo", "风"],
  ["geo", "岩"],
  ["electro", "雷"],
  ["dendro", "草"],
  ["hydro", "水"],
  ["pyro", "火"],
  ["cryo", "冰"],
  ["physical", "物理"],
] as const;

type StatSelectorValue = EquipmentStatKey | `elementalDmgBonus:${Element}`;

function statSelectorValue(stat: EquipmentStat | undefined): StatSelectorValue {
  if (stat?.stat === "elementalDmgBonus") {
    return `elementalDmgBonus:${stat.element ?? "pyro"}`;
  }
  return stat?.stat ?? "atkFlat";
}

function statFromSelector(value: string): {
  key: EquipmentStatKey;
  element?: Element;
} {
  const prefix = "elementalDmgBonus:";
  if (value.startsWith(prefix)) {
    const element = value.slice(prefix.length);
    if (ELEMENT_OPTIONS.some(([key]) => key === element)) {
      return { key: "elementalDmgBonus", element: element as Element };
    }
  }
  return { key: value as EquipmentStatKey };
}

const SLOT_LABELS: Record<ArtifactSlot, string> = {
  flower: "生之花",
  plume: "死之羽",
  sands: "时之沙",
  goblet: "空之杯",
  circlet: "理之冠",
};

/** Fast, deterministic stat templates for users who do not want to enter
 * every artifact roll by hand. Values are editable after applying. */
export const ARTIFACT_STAT_PRESETS = [
  { id: "main", label: "只填主词条" },
  { id: "balanced", label: "通用输出" },
  { id: "crit", label: "暴击输出" },
  { id: "energy", label: "充能循环" },
] as const;

export type ArtifactStatPresetId = (typeof ARTIFACT_STAT_PRESETS)[number]["id"];

const PRESET_MAIN_STATS: Record<ArtifactSlot, EquipmentStat> = {
  flower: { stat: "hpFlat", value: 4780 },
  plume: { stat: "atkFlat", value: 311 },
  sands: { stat: "atkPercent", value: 0.466 },
  // Generic DMG% keeps this template usable before choosing an element.
  goblet: { stat: "dmgBonus", value: 0.466 },
  circlet: { stat: "critRate", value: 0.311 },
};

const PRESET_SUBSTATS: Record<ArtifactStatPresetId, readonly EquipmentStat[]> = {
  main: [],
  balanced: [
    { stat: "critRate", value: 0.066 },
    { stat: "critDmg", value: 0.132 },
    { stat: "atkPercent", value: 0.058 },
    { stat: "energyRecharge", value: 0.052 },
  ],
  crit: [
    { stat: "critRate", value: 0.066 },
    { stat: "critDmg", value: 0.264 },
    { stat: "atkPercent", value: 0.058 },
  ],
  energy: [
    { stat: "energyRecharge", value: 0.104 },
    { stat: "critRate", value: 0.031 },
    { stat: "atkPercent", value: 0.058 },
  ],
};

/** Apply one preset to existing pieces, preserving set ids and slot identity. */
export function applyArtifactStatPreset(
  loadout: ArtifactLoadout,
  preset: ArtifactStatPresetId,
  slots: readonly ArtifactSlot[] = ARTIFACT_SLOTS,
): ArtifactLoadout {
  const next: ArtifactLoadout = { ...loadout };
  for (const slot of slots) {
    const piece = loadout[slot];
    if (!piece) continue;
    next[slot] = {
      ...piece,
      mainStat: { ...PRESET_MAIN_STATS[slot] },
      substats: PRESET_SUBSTATS[preset].map((stat) => ({ ...stat })),
    };
  }
  return next;
}

function emptyStat(): EquipmentStat {
  return { stat: "atkFlat", value: 0 };
}

function optionFor(stat: EquipmentStatKey) {
  return STAT_OPTIONS.find((option) => option.key === stat) ?? STAT_OPTIONS[0]!;
}

function displayValue(stat: EquipmentStat | undefined): string {
  if (!stat) return "";
  const option = optionFor(stat.stat);
  return (option.percent ? stat.value * 100 : stat.value).toFixed(1);
}

function fromDisplayValue(stat: EquipmentStatKey, raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) return undefined;
  const rounded = Number(value.toFixed(1));
  return optionFor(stat).percent ? rounded / 100 : rounded;
}

/** Normalize a partial draft to the selected set and piece count. */
export function normalizeArtifactLoadout(
  setId: string,
  pieces: number,
  source?: ArtifactLoadout,
): ArtifactLoadout {
  const result: Partial<Record<ArtifactSlot, ArtifactPiece>> = {};
  for (const slot of ARTIFACT_SLOTS.slice(0, pieces)) {
    const existing = source?.[slot];
    result[slot] = {
      slot,
      setId,
      mainStat: existing?.mainStat ?? emptyStat(),
      substats: existing?.substats ?? [],
    };
  }
  return result;
}

/**
 * Counts artifact pieces with at least one non-zero authored stat.
 *
 * `normalizeArtifactLoadout` creates zero-valued placeholder pieces so set
 * counting still works before a user enters stats. Those placeholders are not
 * configured gear and must not be reported as entered stat rows in the team
 * card or character panel.
 */
export function countArtifactPiecesWithStats(
  loadout: ArtifactLoadout | undefined,
): number {
  if (!loadout) return 0;
  return Object.values(loadout).filter((piece) => {
    if (!piece) return false;
    return [piece.mainStat, ...piece.substats].some(
      (stat) => Number.isFinite(stat.value) && stat.value !== 0,
    );
  }).length;
}

interface Props {
  /** Legacy homogeneous-set mode. */
  setId?: string;
  pieces?: number;
  value?: ArtifactLoadout;
  onChange: (next: ArtifactLoadout) => void;
  /** Mixed-loadout mode: one set id per visible slot. */
  slots?: readonly ArtifactSlot[];
  slotSetIds?: Partial<Record<ArtifactSlot, string | null>>;
}

export function ArtifactStatsEditor({
  setId,
  pieces,
  value,
  onChange,
  slots,
  slotSetIds,
}: Props) {
  const editorSlots = slots ?? ARTIFACT_SLOTS.slice(0, pieces ?? 0);
  const loadout = useMemo(
    () =>
      slotSetIds
        ? normalizeArtifactLoadoutForSlots(slotSetIds, value, editorSlots)
        : normalizeArtifactLoadout(setId ?? "", pieces ?? 0, value),
    [editorSlots, pieces, setId, slotSetIds, value],
  );

  function updatePiece(slot: ArtifactSlot, update: (piece: ArtifactPiece) => ArtifactPiece) {
    const next: ArtifactLoadout = { ...loadout, [slot]: update(loadout[slot]!) };
    onChange(next);
  }

  function updateStat(
    slot: ArtifactSlot,
    area: "main" | "sub",
    index: number,
    stat: EquipmentStatKey,
    value: number | undefined,
    element?: string,
  ) {
    updatePiece(slot, (piece) => {
      const resolvedElement =
        stat === "elementalDmgBonus" ? element ?? "pyro" : undefined;
      const nextStat: EquipmentStat = {
        stat,
        value: value ?? 0,
        ...(resolvedElement
          ? { element: resolvedElement as EquipmentStat["element"] }
          : {}),
      };
      if (area === "main") return { ...piece, mainStat: nextStat };
      const substats = [...piece.substats];
      substats[index] = nextStat;
      return { ...piece, substats };
    });
  }

  return (
    <section
      aria-label="圣遗物词条"
      className="space-y-3 rounded-xl border border-surface-border bg-surface/60 p-3"
    >
      <div>
        <h4 className="text-xs font-semibold text-slate-200">圣遗物词条</h4>
        <p className="mt-1 text-micro leading-relaxed text-slate-400">
          默认推荐圣遗物按20级四词条生成（4条副词条+5次强化）；所有数值显示到小数点后1位，百分比按百分数填写，例如46.6。
        </p>
      </div>
      <div className="space-y-2">
        {editorSlots.map((slot) => {
          const piece = loadout[slot];
          if (!piece) return null;
          return (
            <fieldset key={slot} className="space-y-1.5 rounded-md border border-surface-border/70 p-2">
              <legend className="px-1 text-micro font-semibold text-amber-300">{SLOT_LABELS[slot]}</legend>
              <StatRow
                label="主词条"
                stat={piece.mainStat}
                onStatChange={(stat, amount, element) => updateStat(slot, "main", 0, stat, amount, element)}
              />
              <div className="space-y-1">
                {[0, 1, 2, 3].map((index) => (
                  <StatRow
                    key={index}
                    label={`副词条 ${index + 1}`}
                    stat={piece.substats[index]}
                    onStatChange={(stat, amount, element) => updateStat(slot, "sub", index, stat, amount, element)}
                  />
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
    </section>
  );
}

/** Build a mixed-set editor loadout while preserving already-entered stats. */
export function normalizeArtifactLoadoutForSlots(
  slotSetIds: Partial<Record<ArtifactSlot, string | null>>,
  source: ArtifactLoadout | undefined,
  slots: readonly ArtifactSlot[] = ARTIFACT_SLOTS,
): ArtifactLoadout {
  const result: ArtifactLoadout = {};
  for (const slot of slots) {
    const setId = slotSetIds[slot];
    if (!setId) continue;
    const existing = source?.[slot];
    result[slot] = {
      slot,
      setId,
      mainStat: existing?.mainStat ?? emptyStat(),
      substats: existing?.substats ?? [],
    };
  }
  return result;
}

function StatRow({
  label,
  stat,
  onStatChange,
}: {
  label: string;
  stat?: EquipmentStat;
  onStatChange: (stat: EquipmentStatKey, value: number | undefined, element?: string) => void;
}) {
  const selected = stat?.stat ?? "atkFlat";
  const selectedValue = statSelectorValue(stat);
  const option = optionFor(selected);
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[5.25rem_minmax(0,1fr)_5rem] items-center gap-1.5">
        <span className="text-micro text-slate-400">{label}</span>
        <select
          aria-label={`${label}类型`}
          value={selectedValue}
          onChange={(event) => {
            const next = statFromSelector(event.target.value);
            onStatChange(next.key, undefined, next.element);
          }}
          className={cn("min-w-0 rounded border border-surface-border bg-surface px-1.5 py-1 text-micro text-slate-200", FOCUS_RING)}
        >
          <option value="atkFlat">未设置</option>
          {STAT_OPTIONS.filter((entry) => entry.key !== "elementalDmgBonus").map((entry) => (
            <option key={entry.key} value={entry.key}>{entry.label}</option>
          ))}
          {ELEMENT_OPTIONS.map(([element, text]) => (
            <option
              key={`elementalDmgBonus:${element}`}
              value={`elementalDmgBonus:${element}`}
            >
              {text}元素伤害
            </option>
          ))}
        </select>
        <input
          aria-label={`${label}数值`}
          type="number"
          min={0}
          step={0.1}
          value={stat && stat.value !== 0 ? displayValue(stat) : ""}
          placeholder="0.0"
          onChange={(event) =>
            onStatChange(
              selected,
              fromDisplayValue(selected, event.target.value),
              stat?.element,
            )
          }
          className={cn("w-full rounded border border-surface-border bg-surface px-1.5 py-1 text-right text-micro font-mono text-slate-200", FOCUS_RING)}
        />
        <span className="sr-only">{option.percent ? "百分比" : "固定值"}</span>
      </div>
    </div>
  );
}
