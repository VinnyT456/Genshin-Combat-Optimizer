"use client";

import { useState, type KeyboardEvent } from "react";
import type { CharacterDefinition } from "@/types";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ElementTag } from "@/components/ui/ElementTag";
import { StatusChip } from "@/components/ui/StatusChip";
import { elementSurfaceClass } from "@/lib/elementSurface";
import { DetailDisclosure } from "@/components/ui/DetailDisclosure";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar";
import { CARD, FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";
import { fmtNum, fmtPercent } from "@/lib/format";
import {
  formatSupportTier,
  getCharacterMetadata,
} from "@/features/team-builder/rosterModel";
import { charNameZh, tierReasonZh, tierZh } from "@/lib/i18n";
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
const SLOT_MIN_HEIGHT = "min-h-[9.5rem]";

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
  artifactPieces?: ArtifactPieceCount;
}

const ACTIVE_FOLLOWS_TIMELINE_HELP =
  "已加载模拟结果时，当前登场角色跟随循环时间轴变动。";

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
  artifactPieces,
}: FilledProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const slotNumber = slotIndex + 1;
  const stats = character.baseStats;
  const meta = getCharacterMetadata(character.id);
  const tierBadge = formatSupportTier(meta.supportTier);
  const displayName = charNameZh(character.name) || character.name;
  const displayWeapon = meta.weaponLabelZh || meta.weaponLabel;
  const displayTier = tierZh(meta.supportTier);
  const tierReasonDetail = tierReasonZh(meta.tierReason);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // Only act when the slot itself is focused. Without this, Delete typed in
    // a nested control (or on a child button) would remove the character.
    if (e.target !== e.currentTarget) return;
    if (e.altKey && e.key === "ArrowLeft" && canMoveEarlier) {
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
        onKeyDown={handleKeyDown}
        // H1: the reorder/remove shortcuts below were bound to an element with
        // no tabIndex and no role, so they could never receive focus and every
        // shortcut was dead code while the title advertised them. A real tab
        // stop with a group role makes the advertised keys actually work, and
        // gives reordering a keyboard path (it was drag-only).
        tabIndex={0}
        role="group"
        aria-current={isActive ? "true" : undefined}
        aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Delete"
        aria-label={`${slotNumber} 号位：${displayName}。Alt+左右方向键调换席位，Delete 移除。`}
        className={cn(
          "rounded-xl border p-4 sm:p-5 flex h-full flex-col gap-3 shadow-sm cursor-grab active:cursor-grabbing select-none",
          TRANSITION_COLORS,
          FOCUS_RING,
          elementTint,
          isActive
            // `ring-1 ring-amber-400 border-amber-500` is the specified
            // selection treatment on its own; the glow was redundant.
            ? "ring-1 ring-amber-400 border-amber-500"
            : "hover:border-slate-500",
          isDragging && "opacity-40 scale-[0.98]",
          isDragOver && "ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/40 scale-[1.02]",
        )}
      >
        {/* Header row: slotNumber · element · status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {slotNumber} 号位
            </span>
            <ElementTag element={character.element} />
          </div>
          <div className="flex items-center gap-1.5">
            {character.constellation !== undefined && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                {character.constellation}命
              </span>
            )}
            <StatusChip state={tierBadge.state}>{displayTier}</StatusChip>
            {/*
              Renders ONLY a translated reason. The `?? meta.tierReason`
              fallback that used to sit here defeated the point: it put the
              generator's English engineering prose into a zh-CN product
              whenever the translation missed. No reason is better than a
              wrong-language one.
            */}
            {tierReasonDetail !== undefined && (
              <DetailDisclosure
                detail={tierReasonDetail}
                triggerLabel={`${displayName}：查看支持度说明`}
                state={tierBadge.state}
              />
            )}
            {isActive && (
              <StatusChip state="success">
                {activeFollowsTimeline ? "跟随轴" : "当前登场"}
              </StatusChip>
            )}
          </div>
        </div>

        {/* Hero Row: Avatar + Name + Specs */}
        <div className="flex items-center gap-3.5 py-0.5">
          <CharacterAvatar
            characterId={character.id}
            characterName={character.name}
            element={character.element}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-1">
              <h3 className="truncate text-base font-bold text-slate-100" title={displayName}>
                {displayName}
              </h3>
              <span className={meta.rarity === 5 ? "text-xs font-bold text-amber-400 shrink-0" : "text-xs font-bold text-purple-300 shrink-0"}>
                {meta.rarity}★
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="truncate">{displayWeapon}</span>
              <span>·</span>
              <span>等级 {character.level}</span>
              {character.constellation !== undefined && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-amber-400">
                    {character.constellation}命
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Equipped Weapon Row */}
        {equippedWeapon ? (
          <button
            type="button"
            onClick={() => onSelectWeapon?.(slotIndex)}
            className="flex items-center gap-2.5 rounded-xl border border-surface-border/60 bg-surface/75 px-3 py-2 text-left transition-colors hover:border-amber-400/80 hover:bg-surface-raised group shadow-sm"
            title="点击更换装配武器"
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
                <span className="truncate text-xs font-bold text-slate-200 group-hover:text-amber-300">
                  {equippedWeapon.nameZh}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  {/*
                    The owned refinement, stated on the slot. It selects which
                    per-refinement passive numbers the simulation uses, so a
                    build that hides it hides an input of its own result.
                  */}
                  {weaponRefinement !== undefined && (
                    <span className="rounded border border-sky-500/30 bg-sky-500/10 px-1 text-micro font-bold text-sky-300">
                      精{weaponRefinement}
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-micro font-bold px-1 rounded border",
                      equippedWeapon.rarity === 5
                        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                        : "text-purple-300 border-purple-500/30 bg-purple-500/10",
                    )}
                  >
                    {equippedWeapon.rarity}★
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-micro text-slate-400 font-mono">
                <span>基础攻 {equippedWeapon.baseAtk}</span>
                {equippedWeapon.subStat.type !== "none" && (
                  <>
                    <span>·</span>
                    <span className="text-amber-300 truncate">
                      {equippedWeapon.subStat.labelZh}{" "}
                      {equippedWeapon.subStat.type === "elementalMastery"
                        ? equippedWeapon.subStat.value
                        : fmtPercent(equippedWeapon.subStat.value)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className="text-micro text-slate-400 group-hover:text-slate-300 shrink-0">
              更换
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectWeapon?.(slotIndex)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-border px-3 py-2 text-xs text-slate-400 transition-colors hover:border-amber-400 hover:text-amber-300"
          >
            <span>+ 装备武器 (4★/5★)</span>
          </button>
        )}

        {/* Equipped Artifact Row */}
        {equippedArtifact ? (
          <button
            type="button"
            onClick={() => onSelectArtifact?.(slotIndex)}
            className="flex items-center gap-2.5 rounded-xl border border-surface-border/60 bg-surface/75 px-3 py-2 text-left transition-colors hover:border-amber-400/80 hover:bg-surface-raised group shadow-sm"
            title="点击更换装配圣遗物"
          >
            <ArtifactAvatar iconId={equippedArtifact.iconId} nameZh={equippedArtifact.nameZh} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-bold text-slate-200 group-hover:text-amber-300">
                  {equippedArtifact.nameZh}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  {artifactPieces !== undefined && (
                    <span className="rounded border border-sky-500/30 bg-sky-500/10 px-1 text-micro font-bold text-sky-300">
                      {artifactPieces}件
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-micro font-bold px-1 rounded border",
                      equippedArtifact.rarity === 5
                        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                        : "text-purple-300 border-purple-500/30 bg-purple-500/10",
                    )}
                  >
                    {equippedArtifact.rarity}★
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-micro text-slate-400 font-mono truncate">
                <span className="truncate text-slate-400">
                  {equippedArtifact.bonuses.find(b => b.pieces === ARTIFACT_TWO_PIECE)?.descriptionZh || "无2件套效果"}
                </span>
              </div>
              {/* Show every set tier unlocked by the equipped piece count. */}
              {activeArtifactTiers(artifactPieces).map((pieces) => (
                <span
                  key={pieces}
                  className="mr-1 inline-block rounded-sm border border-surface-border px-1 text-micro font-medium text-slate-400"
                >
                  {pieces}件套
                </span>
              ))}
            </div>
            <span className="text-micro text-slate-400 group-hover:text-slate-300 shrink-0">
              更换
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectArtifact?.(slotIndex)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-border px-3 py-2 text-xs text-slate-400 transition-colors hover:border-amber-400 hover:text-amber-300"
          >
            <span>+ 装备圣遗物</span>
          </button>
        )}

        {/* Stats Grid: uncluttered 2x2 with clear separation */}
        <div
          role={onEditStats ? "button" : undefined}
          tabIndex={onEditStats ? 0 : undefined}
          onClick={() => onEditStats?.(slotIndex)}
          onKeyDown={(e) => {
            if (onEditStats && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onEditStats(slotIndex);
            }
          }}
          title={onEditStats ? "点击直接调整面板属性 (攻/充能/双暴/精通)" : undefined}
          className={cn(
            "grid grid-cols-2 gap-2 rounded-md bg-surface/60 p-2.5 font-mono text-xs text-slate-200 border border-surface-border/40 transition-colors",
            onEditStats && "hover:border-amber-400/60 hover:bg-surface-raised cursor-pointer",
          )}
        >
          <div className="flex items-center justify-between gap-1" title="攻击力">
            <span className="text-slate-400 text-micro">攻击</span>
            <span className="font-semibold">{fmtNum(stats.atk)}</span>
          </div>
          <div className="flex items-center justify-between gap-1" title="元素充能效率">
            <span className="text-slate-400 text-micro">充能</span>
            <span className="font-semibold text-sky-400">{fmtPercent(stats.energyRecharge)}</span>
          </div>
          <div className="flex items-center justify-between gap-1" title="暴击率 / 暴击伤害">
            <span className="text-slate-400 text-micro">双暴</span>
            <span className="font-semibold text-amber-300">{fmtPercent(stats.critRate)}/{fmtPercent(stats.critDmg)}</span>
          </div>
          <div className="flex items-center justify-between gap-1" title="元素精通">
            <span className="text-slate-400 text-micro">精通</span>
            <span className="font-semibold text-emerald-400">{stats.elementalMastery}</span>
          </div>
        </div>

        {damageShare !== undefined && (
          <div className="space-y-1.5 border-t border-surface-border/50 pt-2 text-slate-200">
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

        {/* Row F — actions */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 border-t border-surface-border/40">
          <Button size="sm" onClick={() => onChange(slotIndex)}>
            更换
          </Button>
          {onEditStats && (
            <Button
              size="sm"
              variant="quiet"
              onClick={() => onEditStats(slotIndex)}
              className="text-micro font-mono"
            >
              调整面板
            </Button>
          )}
          {!activeFollowsTimeline && !isActive && (
            <Button
              size="sm"
              variant="quiet"
              onClick={() => onSetActive(character.id)}
            >
              设为首发
            </Button>
          )}
          {activeFollowsTimeline && isActive && (
            <span
              className="text-micro text-slate-400 font-mono"
              title={ACTIVE_FOLLOWS_TIMELINE_HELP}
            >
              跟随循环轴
            </span>
          )}
          <span className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline font-mono text-micro text-slate-400 select-none">
              ⋮⋮ 拖拽
            </span>
            <IconButton
              label={`将 ${displayName} 从队伍中移除`}
              glyph="✕"
              onClick={() => onRemove(slotIndex)}
            />
          </span>
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
          SLOT_MIN_HEIGHT,
          "flex h-full w-full flex-col rounded-xl border border-dashed border-surface-border/80 bg-surface/30 p-5 text-left hover:border-amber-400/60 hover:bg-surface-raised/40 transition-colors duration-150 group",
          isDragOver && "ring-2 ring-amber-400 border-amber-400 bg-amber-950/20 scale-[1.02]",
          FOCUS_RING,
        )}
      >
        <span className="text-xs font-semibold text-slate-400">{slotNumber} 号位 · 空缺</span>
        <span className="m-auto text-sm font-semibold text-slate-300 group-hover:text-amber-400 transition-colors">
          + 配置出战角色
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
