"use client";

import { useState, type KeyboardEvent } from "react";
import type { CharacterDefinition, Stats } from "@/types";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { ElementTag } from "@/components/ui/ElementTag";
import { StatusChip } from "@/components/ui/StatusChip";
import { elementSurfaceClass } from "@/lib/elementSurface";
import { DetailDisclosure } from "@/components/ui/DetailDisclosure";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar";
import {
  CARD,
  FOCUS_RING,
  STATE_TEXT,
  TRANSITION_COLORS,
} from "@/components/ui/tokens";
import { fmtNum, fmtPercent } from "@/lib/format";
import {
  formatSupportTier,
  getCharacterMetadata,
} from "@/features/team-builder/rosterModel";
import { charNameZh, tierReasonZh } from "@/lib/i18n";
import {
  talentDisplayLevel,
  talentBoostsForConstellation,
} from "@/features/team-builder/characterProgression";
import type { WeaponDefinition } from "@/game-data/weapons/types";
import type { Refinement } from "@/features/team-builder/weaponPresentation";
import type { ArtifactPieceCount } from "@/features/team-builder/equipmentSelection";

import type { ArtifactSetDefinition } from "@/game-data/artifacts/types";

import { WeaponAvatar } from "@/components/ui/WeaponAvatar";
import { ArtifactAvatar } from "@/components/ui/ArtifactAvatar";
import {
  ARTIFACT_TWO_PIECE,
  activeArtifactTiers,
} from "@/features/team-builder/artifactSupportPresentation";

/**
 * Empty and skeleton slots reserve the height of a filled slot so filling one
 * causes no layout shift.
 */
const SLOT_MIN_HEIGHT = "min-h-[22rem] sm:min-h-[24rem]";

interface FilledProps {
  slotIndex: number;
  character: CharacterDefinition;
  isActive: boolean;
  /** True once a result exists: "active" then follows the timeline, not the user. */
  activeFollowsTimeline: boolean;
  /** Share of total damage, as a fraction. Present only after a run. */
  damageShare?: number;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  onChange: (slotIndex: number) => void;
  onRemove: (slotIndex: number) => void;
  onSetActive: (characterId: string) => void;
  onMove: (from: number, to: number) => void;
  onEditStats?: (slotIndex: number) => void;
  equippedWeapon?: WeaponDefinition;
  onSelectWeapon?: (slotIndex: number) => void;
  equippedArtifact?: ArtifactSetDefinition | null;
  onSelectArtifact?: (slotIndex: number) => void;
  /**
   * The refinement the equipped weapon is OWNED at, and the piece count of the
   * equipped set.
   *
   * Rendered because both are simulation inputs the user chose and can no
   * longer see once the picker closes. A build whose refinement is invisible on
   * the slot is a number the result depends on but the screen does not state.
   */
  weaponRefinement?: Refinement;
  /** Exact sourced weapon level used for the displayed base ATK. */
  weaponLevel?: number;
  /** Exact sourced secondary stat at the displayed weapon level. */
  weaponSubStat?: WeaponDefinition["subStat"];
  weaponBaseAtk?: number;
  artifactPieces?: ArtifactPieceCount;
  /** Mixed-set summary, e.g. 2+2 or 4+1. */
  artifactCombination?: string;
  artifactStatCount?: number;
  /** Effective initial panel, including selected gear and permanent effects. */
  displayStats?: Stats;
  /**
   * True when the equipped weapon + set match this character's KQM base build,
   * so the slot can surface that the gear is the recommended base build rather
   * than a user choice.
   */
  isRecommendedBuild?: boolean;
  /**
   * Honesty marker for a recommended-build main stat the engine cannot model
   * (e.g. Bennett's Healing Bonus% circlet). Present only when the build
   * carries such a note; rendered inline beside the gear, never hidden.
   */
  circletNote?: string;
}

const ACTIVE_FOLLOWS_TIMELINE_HELP =
  "已加载模拟结果时，角色状态跟随循环时间轴变动。";

export function FilledTeamSlot({
  slotIndex,
  character,
  isActive,
  activeFollowsTimeline,
  damageShare,
  canMoveEarlier,
  canMoveLater,
  onChange,
  onRemove,
  onSetActive,
  onMove,
  onEditStats,
  equippedWeapon,
  onSelectWeapon,
  equippedArtifact,
  onSelectArtifact,
  weaponRefinement,
  weaponLevel,
  weaponSubStat,
  weaponBaseAtk,
  artifactPieces,
  artifactCombination,
  artifactStatCount,
  displayStats,
  isRecommendedBuild = false,
  circletNote,
}: FilledProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const slotNumber = slotIndex + 1;
  const stats = displayStats ?? character.baseStats;
  const meta = getCharacterMetadata(character.id);
  const supportState = formatSupportTier(meta.supportTier).state;
  const displayName = charNameZh(character.name) || character.name;
  const displayWeapon = meta.weaponLabelZh || meta.weaponLabel;
  const tierReasonDetail = tierReasonZh(meta.tierReason);
  const artifactSummary = artifactCombination ?? (artifactPieces !== undefined ? `${artifactPieces}件` : undefined);
  const weaponSubstatDisplay =
    weaponSubStat === undefined
      ? "暂无数据"
      : weaponSubStat.type === "none"
        ? "无"
        : `${weaponSubStat.labelZh} ${
            weaponSubStat.type === "elementalMastery"
              ? weaponSubStat.value
              : fmtPercent(weaponSubStat.value)
          }`;
  const talentLevels = character.talentLevels ?? {
    normal: 1,
    skill: 1,
    burst: 1,
  };
  const talentBoosts = talentBoostsForConstellation(
    character.id,
    character.constellation ?? 0,
  );
  const talentDisplay = {
    normal: talentDisplayLevel(talentLevels.normal, talentBoosts.normal),
    skill: talentDisplayLevel(talentLevels.skill, talentBoosts.skill),
    burst: talentDisplayLevel(talentLevels.burst, talentBoosts.burst),
  } as const;

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    // Only act when the slot itself is focused. Without this, Delete typed in
    // a nested control (or on a child button) would remove the character.
    if (e.target !== e.currentTarget) return;
    if (onEditStats && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onEditStats(slotIndex);
    } else if (e.altKey && e.key === "ArrowLeft" && canMoveEarlier) {
      e.preventDefault();
      onMove(slotIndex, slotIndex - 1);
    } else if (e.altKey && e.key === "ArrowRight" && canMoveLater) {
      e.preventDefault();
      onMove(slotIndex, slotIndex + 1);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onRemove(slotIndex);
    }
  }

  const elementTint = elementSurfaceClass(character.element);

  return (
    <li className="contents">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", String(slotIndex));
          e.dataTransfer.effectAllowed = "move";
          setIsDragging(true);
        }}
        onDragEnd={() => setIsDragging(false)}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const raw = e.dataTransfer.getData("text/plain");
          const fromIndex = Number(raw);
          if (!isNaN(fromIndex) && fromIndex !== slotIndex) {
            onMove(fromIndex, slotIndex);
          }
        }}
        // The group owns slot identity and drag/drop semantics. Configuration
        // uses a visible identity button; equipment and movement stay separate.
        role="group"
        aria-current={isActive ? "true" : undefined}
        aria-label={`${slotNumber} 号位：${displayName}。Alt+左右方向键调换席位，Delete 移除。`}
        className={cn(
          "relative border p-3 sm:p-3.5 flex h-full flex-col gap-2 cursor-grab active:cursor-grabbing select-none",
          SLOT_MIN_HEIGHT,
          TRANSITION_COLORS,
          FOCUS_RING,
          elementTint,
          isActive
            // `ring-1 ring-amber-400 border-amber-500` is the specified
            // selection treatment on its own; the glow was redundant.
            ? "ring-1 ring-cyan-300 border-cyan-300"
            : "hover:border-cyan-400/60",
          isDragging && "opacity-40 scale-[0.98]",
          isDragOver && "ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/40 scale-[1.02]",
        )}
      >
        <div className="relative z-10 flex h-full flex-col gap-2">
        {/* Header row: slotNumber · element · status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {slotNumber} 号位
            </span>
            <ElementTag element={character.element} />
          </div>
          <div className="flex items-center gap-1.5">
            {/*
              Renders ONLY a translated reason. The `?? meta.tierReason`
              fallback that used to sit here defeated the point: it put the
              generator's English engineering prose into a zh-CN product
              whenever the translation missed. No reason is better than a
              wrong-language one.
            */}
            {tierReasonDetail !== undefined && (
              <span className="pointer-events-auto">
                <DetailDisclosure
                  detail={tierReasonDetail}
                  triggerLabel={`${displayName}：查看支持度说明`}
                  state={supportState}
                />
              </span>
            )}
            {isActive && activeFollowsTimeline && (
              <StatusChip state="success" title={ACTIVE_FOLLOWS_TIMELINE_HELP}>
                跟随轴
              </StatusChip>
            )}
          </div>
        </div>

        {/* Identity and progression. One visible action opens the full editor. */}
        {onEditStats ? (
          <button
            type="button"
            aria-label={`编辑${displayName}角色配置。等级 ${character.level}，${character.constellation ?? 0}命；天赋普攻 ${talentDisplay.normal.effective}，战技 ${talentDisplay.skill.effective}，爆发 ${talentDisplay.burst.effective}`}
            aria-keyshortcuts="Enter Space Alt+ArrowLeft Alt+ArrowRight Delete"
            onClick={() => onEditStats(slotIndex)}
            onKeyDown={handleKeyDown}
            className={cn(
              "group flex w-full cursor-pointer items-center gap-2.5 rounded-sm border border-transparent bg-surface/35 p-1.5 text-left",
              TRANSITION_COLORS,
              FOCUS_RING,
              "hover:border-surface-border hover:bg-surface/70",
            )}
          >
          <CharacterAvatar
            characterId={character.id}
            characterName={character.name}
            element={character.element}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-base font-bold text-slate-100" title={displayName}>
                {displayName}
              </h3>
              <span className="shrink-0 border border-cyan-300/25 bg-cyan-300/5 px-1.5 py-0.5 text-micro font-semibold text-cyan-200 opacity-80 transition-opacity group-hover:opacity-100">
                配置
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span>等级 {character.level}</span>
              <span aria-hidden="true">·</span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-300">
                {character.constellation ?? 0}命
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{displayWeapon}</span>
            </div>
            <dl className="mt-1.5 grid grid-cols-3 divide-x divide-surface-border/60 overflow-hidden rounded-md border border-surface-border/60 bg-surface/55" aria-label="天赋等级">
              {(
                [
                  ["普攻", talentDisplay.normal, "普通攻击"],
                  ["战技", talentDisplay.skill, "元素战技"],
                  ["爆发", talentDisplay.burst, "元素爆发"],
                ] as const
              ).map(([label, shown, accessibleLabel]) => (
                <div
                  key={label}
                  role="group"
                  className="min-w-0 px-1.5 py-1 text-center"
                  aria-label={`${accessibleLabel}基础等级 ${shown.configured}，当前计算等级 ${shown.effective}`}
                >
                  <dt className="truncate text-micro font-medium text-slate-400">{label}</dt>
                  <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-100">
                    {shown.effective}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          </button>
        ) : (
          <div className="flex items-center gap-2.5 p-1.5">
            <CharacterAvatar
              characterId={character.id}
              characterName={character.name}
              element={character.element}
              size="lg"
            />
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-100" title={displayName}>{displayName}</h3>
              <span className="text-xs text-slate-400">等级 {character.level}</span>
            </div>
          </div>
        )}

        {/* Equipped Weapon Row */}
        {equippedWeapon ? (
          <button
            type="button"
            onClick={() => onSelectWeapon?.(slotIndex)}
            aria-label={`编辑${displayName}的武器配置：${equippedWeapon.nameZh}，等级 ${weaponLevel ?? "未知"}，${weaponSubstatDisplay}`}
            className={cn("relative z-20 flex min-h-10 cursor-pointer items-center gap-2 rounded-sm border border-surface-border/60 bg-surface/75 px-2.5 py-2 text-left", TRANSITION_COLORS, FOCUS_RING, "hover:border-cyan-400/70 hover:bg-surface-raised group")}
            title="点击查看武器配置"
          >
            <WeaponAvatar
              name={equippedWeapon.name}
              nameZh={equippedWeapon.nameZh}
              weaponType={equippedWeapon.weaponType}
              rarity={equippedWeapon.rarity}
              iconUrl={equippedWeapon.iconUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-bold text-slate-200 group-hover:text-cyan-200">
                  {equippedWeapon.nameZh}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-micro font-semibold">
                  <span className="rounded-sm border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-sky-300">
                    {weaponRefinement !== undefined ? `精${weaponRefinement}` : "精炼未设置"}
                  </span>
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-micro text-slate-400">
                <span>等级 {weaponLevel !== undefined ? weaponLevel : "—"}</span>
                <span aria-hidden="true">·</span>
                <span>基础攻击力 <strong className="font-mono font-semibold text-slate-200">{weaponBaseAtk ?? equippedWeapon.baseAtk}</strong></span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 border-t border-surface-border/60 pt-1">
                <span className="shrink-0 text-micro font-medium text-slate-500">武器副词条</span>
                <span className="truncate text-right font-mono text-xs font-bold tabular-nums text-cyan-200" title={weaponSubstatDisplay}>
                  {weaponSubstatDisplay}
                </span>
              </div>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectWeapon?.(slotIndex)}
            aria-label={`为${displayName}装备武器`}
            className={cn("relative z-20 flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-dashed border-surface-border px-2.5 py-1.5 text-xs text-slate-400", TRANSITION_COLORS, FOCUS_RING, "hover:border-cyan-400 hover:text-cyan-200")}
          >
            <span>+ 装备武器 (4★/5★)</span>
          </button>
        )}

        {/* Equipped Artifact Row */}
        {equippedArtifact ? (
          <button
            type="button"
            onClick={() => onSelectArtifact?.(slotIndex)}
            aria-label={`编辑${displayName}的圣遗物配置：${equippedArtifact.nameZh}，${artifactCombination ?? `${artifactPieces ?? 0}件`}，已录入 ${artifactStatCount ?? 0}/5 件属性`}
            className={cn("relative z-20 flex min-h-10 cursor-pointer items-center gap-2 rounded-sm border border-surface-border/60 bg-surface/75 px-2.5 py-2 text-left", TRANSITION_COLORS, FOCUS_RING, "hover:border-cyan-400/70 hover:bg-surface-raised group")}
            title="点击更换装配圣遗物"
          >
            <ArtifactAvatar iconId={equippedArtifact.iconId} nameZh={equippedArtifact.nameZh} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-bold text-slate-200 group-hover:text-cyan-200">
                  {equippedArtifact.nameZh}
                </span>
                {artifactSummary && (
                  <span className="shrink-0 border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 text-micro font-bold text-violet-300">
                    {artifactSummary}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-micro font-mono text-slate-400">
                <span className="truncate text-slate-400">
                  {equippedArtifact.bonuses.find(b => b.pieces === ARTIFACT_TWO_PIECE)?.descriptionZh || "无2件套效果"}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {activeArtifactTiers(artifactPieces).map((pieces) => (
                  <span
                    key={pieces}
                    className="rounded-sm border border-surface-border px-1 py-0.5 text-micro font-medium text-slate-400"
                  >
                    {pieces}件套
                  </span>
                ))}
              </div>
              {artifactStatCount !== undefined && (
                <span className="mt-1 inline-block rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-1.5 py-0.5 text-micro font-medium text-emerald-300">
                  已录入 {artifactStatCount}/5 件属性
                </span>
              )}
              {isRecommendedBuild && (
                <span className="mt-1 ml-1 inline-block rounded-sm border border-surface-border px-1.5 py-0.5 text-micro font-medium text-slate-400">
                  符合 KQM 基准
                </span>
              )}
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectArtifact?.(slotIndex)}
            aria-label={`为${displayName}装备圣遗物`}
            className={cn("relative z-20 flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-dashed border-surface-border px-2.5 py-1.5 text-xs text-slate-400", TRANSITION_COLORS, FOCUS_RING, "hover:border-cyan-400 hover:text-cyan-200")}
          >
            <span>+ 装备圣遗物</span>
          </button>
        )}

        {/* Honesty marker: a recommended-build main stat the engine cannot
            model (e.g. Bennett's Healing Bonus% circlet). The note is shown
            inline so the limitation is never hidden. */}
        {circletNote && (
          <p className={cn("flex items-start gap-1 text-micro", STATE_TEXT.info)}>
            <span>头冠：{circletNote}</span>
          </p>
        )}

        {/* Two-row scan keeps labels and values readable on narrow cards. */}
        <dl
          aria-label="角色面板属性"
          className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-sm border border-surface-border/50 bg-surface/55 p-2 font-mono"
        >
          <div className="flex min-w-0 items-center justify-between gap-2" title="攻击力">
            <dt className="shrink-0 text-micro text-slate-400">攻击</dt>
            <dd className="truncate text-right text-xs font-semibold text-slate-100">{fmtNum(stats.atk)}</dd>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2" title="元素充能效率">
            <dt className="shrink-0 text-micro text-slate-400">充能</dt>
            <dd className="truncate text-right text-xs font-semibold text-sky-400">{fmtPercent(stats.energyRecharge)}</dd>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2" title="暴击率 / 暴击伤害">
            <dt className="shrink-0 text-micro text-slate-400">双暴</dt>
            <dd className="truncate text-right text-xs font-semibold text-amber-300">{fmtPercent(stats.critRate)}/{fmtPercent(stats.critDmg)}</dd>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2" title="元素精通">
            <dt className="shrink-0 text-micro text-slate-400">精通</dt>
            <dd className="truncate text-right text-xs font-semibold text-emerald-400">{stats.elementalMastery}</dd>
          </div>
        </dl>

        {/* Character actions sit below the panel stats; slot movement/removal
            remains in the bottom row. */}
        <div className="flex min-h-8 items-center gap-1.5 px-1.5">
          <Button size="sm" className="cursor-pointer" onClick={() => onChange(slotIndex)}>
            更换角色
          </Button>
          {!activeFollowsTimeline && !isActive && (
            <Button
              size="sm"
              variant="quiet"
              className="cursor-pointer"
              onClick={() => onSetActive(character.id)}
            >
              设为首发
            </Button>
          )}
        </div>

        {damageShare !== undefined && (
          <div className="space-y-1 border-t border-surface-border/50 pt-1.5 text-slate-200">
            <div className="flex items-center justify-between text-micro font-mono">
              <span className="text-slate-400">总伤害占比:</span>
              <span className="font-bold text-amber-400">{fmtPercent(damageShare)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised ring-1 ring-surface-border/50">
              <div
                className="h-full bg-amber-400 transition-[width] duration-150"
                style={{ width: `${damageShare * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Slot actions stay at the bottom: movement and removal. */}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-surface-border/40 pt-1.5">
          <span className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1" aria-label="调整席位">
              <button
                type="button"
                aria-label={`将 ${displayName} 提前一位`}
                className={cn("min-h-8 min-w-8 border border-surface-border px-1.5 text-micro text-slate-400 hover:border-cyan-400 hover:text-cyan-200", FOCUS_RING, TRANSITION_COLORS)}
                disabled={!canMoveEarlier}
                onClick={() => onMove(slotIndex, slotIndex - 1)}
              >前移</button>
              <button
                type="button"
                aria-label={`将 ${displayName} 后移一位`}
                className={cn("min-h-8 min-w-8 border border-surface-border px-1.5 text-micro text-slate-400 hover:border-cyan-400 hover:text-cyan-200", FOCUS_RING, TRANSITION_COLORS)}
                disabled={!canMoveLater}
                onClick={() => onMove(slotIndex, slotIndex + 1)}
              >后移</button>
            </span>
            <span className="hidden select-none font-mono text-micro text-slate-400 sm:inline">
              可拖拽排序
            </span>
            <button
              type="button"
              aria-label={`将 ${displayName} 从队伍中移除`}
              className={cn("min-h-8 border border-surface-border px-2 text-micro text-slate-400 hover:border-red-400/70 hover:text-red-300", FOCUS_RING, TRANSITION_COLORS)}
              onClick={() => onRemove(slotIndex)}
            >移除</button>
          </span>
        </div>
        </div>
      </div>
    </li>
  );
}

interface EmptyProps {
  slotIndex: number;
  onAdd: (slotIndex: number) => void;
  onMove?: (from: number, to: number) => void;
}

export function EmptyTeamSlot({ slotIndex, onAdd, onMove }: EmptyProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const slotNumber = slotIndex + 1;

  return (
    <li className="contents">
      <button
        type="button"
        onClick={() => onAdd(slotIndex)}
        onDragOver={(e) => {
          if (onMove) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setIsDragOver(true);
          }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          if (onMove) {
            e.preventDefault();
            setIsDragOver(false);
            const raw = e.dataTransfer.getData("text/plain");
            const fromIndex = Number(raw);
            if (!isNaN(fromIndex) && fromIndex !== slotIndex) {
              onMove(fromIndex, slotIndex);
            }
          }
        }}
        aria-label={`添加角色至 ${slotNumber} 号位`}
        className={cn(
          "min-h-28 sm:min-h-48",
          "flex h-full w-full flex-col gap-3 rounded-sm border border-dashed border-surface-border/80 bg-surface/30 p-4 text-left transition-colors duration-150 group hover:border-cyan-400/60 hover:bg-surface-raised/40",
          isDragOver && "ring-2 ring-amber-400 border-amber-400 bg-amber-950/20 scale-[1.02]",
          FOCUS_RING,
        )}
      >
        <span className="text-xs font-semibold text-slate-400">{slotNumber} 号位 · 空缺</span>
        <span className="my-auto text-sm font-semibold text-slate-300 transition-colors group-hover:text-cyan-200 sm:mx-auto">
          配置出战角色
        </span>
        <span className="text-xs text-slate-400">
          点击或拖拽角色至此
        </span>
      </button>
    </li>
  );
}

export function SkeletonTeamSlot({ slotIndex }: { slotIndex: number }) {
  return (
    <li className="contents">
      <div
        className={cn(CARD, SLOT_MIN_HEIGHT, "h-full p-4")}
        aria-label={`正在加载 ${slotIndex + 1} 号位`}
      >
        <div className="h-3 w-10 rounded-sm bg-surface-border" />
        <div className="mt-3 h-4 w-2/3 rounded-sm bg-surface-border" />
        <div className="mt-3 h-3 w-1/2 rounded-sm bg-surface-border" />
        <div className="mt-2 h-3 w-3/4 rounded-sm bg-surface-border" />
      </div>
    </li>
  );
}
