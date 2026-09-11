"use client";

import { useCallback, useMemo, useState } from "react";
import type { CharacterDefinition, SimulationResult, Stats } from "@/types";
import { cn } from "@/components/ui/cn";
import { LiveRegion } from "@/components/ui/LiveRegion";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { STATE_CHIP } from "@/components/ui/tokens";
import { CharacterPicker } from "@/features/team-builder/CharacterPicker";
import { CharacterStatsModal } from "@/features/team-builder/CharacterStatsModal";
import {
  EmptyTeamSlot,
  FilledTeamSlot,
  SkeletonTeamSlot,
} from "@/features/team-builder/TeamSlot";
import {
  TEAM_SIZE,
  type Team,
  applyBuildEdit,
  describeSelection,
  memberCount,
  moveSlot,
  resolveActiveId,
  setSlot,
  teamFrom,
} from "@/features/team-builder/teamModel";
import { detectResonances } from "@/features/team-builder/resonance";
import {
  charNameZh,
  resonanceFullDescZh,
  resonanceNameZh,
  resonanceShortDescZh,
} from "@/lib/i18n";
import type { WeaponDefinition } from "@/game-data/weapons/types";
import {
  findWeaponBaseAtkAtLevel,
  findWeapon,
  findWeaponStatsAtLevel,
  getDefaultWeapon,
} from "@/game-data/weapons/registry";
import { findCharacter } from "@/game-data/characters/registry";
import { WeaponPicker } from "@/features/team-builder/WeaponPicker";

import type { ArtifactSetDefinition } from "@/game-data/artifacts/types";
import { findArtifact } from "@/game-data/artifacts/registry";
import { ArtifactPicker } from "@/features/team-builder/ArtifactPicker";

import { applyWeaponStats } from "@/features/team-builder/weaponModel";
import {
  type ArtifactPieceCount,
  DEFAULT_REFINEMENT,
  DEFAULT_WEAPON_LEVEL,
  type EquipmentSelections,
  artifactCombinationLabel,
  equipArtifactLoadout,
  equipArtifactSet,
  equipWeapon,
  selectionFor,
} from "@/features/team-builder/equipmentSelection";
import type { Refinement } from "@/features/team-builder/weaponPresentation";
import { getCharacterMetadata } from "@/features/team-builder/rosterModel";
import { resolveInitialStatsPreview } from "@/features/team-builder/initialStatsPreview";
import { countArtifactPiecesWithStats } from "@/features/team-builder/ArtifactStatsEditor";
import { baseStatsAtLevel } from "@/features/team-builder/characterProgression";

interface Props {
  /** Full roster from game-data. Any length is handled; count is never assumed. */
  roster: readonly CharacterDefinition[];
  team: Team;
  onTeamChange: (team: Team) => void;
  /** User's manual on-field choice; ignored once a result exists. */
  activeCharacterId: string | null;
  onSetActive: (characterId: string) => void;
  /** Present after a run: enriches slots and hands "active" to the timeline. */
  result?: SimulationResult | null;
  /** Rotation actions referencing characters not on the team. */
  orphanedActionCount?: number;
  rosterLoading?: boolean;
  rosterError?: string | null;
  /**
   * The user's equipment choices, OWNED BY THE PAGE.
   *
   * Lifted out of this component because the page is what calls the simulation
   * adapter: while the selections were local `useState` here, nothing could
   * hand them to `runSimulation`, so weapon passives and artifact set bonuses
   * never reached the engine at all. Controlled rather than reported upward
   * after the fact, so the selections the engine reads and the ones the slots
   * render are the same value.
   */
  equipment: EquipmentSelections;
  onEquipmentChange: (equipment: EquipmentSelections) => void;
}

const SLOT_GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";

export function TeamBuilder({
  roster,
  team,
  onTeamChange,
  activeCharacterId,
  onSetActive,
  result = null,
  orphanedActionCount = 0,
  rosterLoading = false,
  rosterError = null,
  equipment,
  onEquipmentChange,
}: Props) {
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [weaponPickerSlot, setWeaponPickerSlot] = useState<number | null>(null);
  const [artifactPickerSlot, setArtifactPickerSlot] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const count = memberCount(team);
  const activeFollowsTimeline = result !== null;

  const resolvedActiveId = useMemo(
    () => resolveActiveId(team, activeCharacterId),
    [team, activeCharacterId],
  );

  const resonances = useMemo(() => detectResonances(team), [team]);

  const damageShares = useMemo(() => {
    if (result === null || result.totalDamage <= 0) return null;
    const total = result.totalDamage;
    const byId = new Map<string, number>();
    for (const [characterId, damage] of Object.entries(result.damageByCharacter)) {
      byId.set(characterId, damage / total);
    }
    return byId;
  }, [result]);

  const handleSelect = useCallback(
    (slotIndex: number, character: CharacterDefinition) => {
      setAnnouncement(describeSelection(team, slotIndex, character));
      const meta = getCharacterMetadata(character.id);
      const defWeapon = getDefaultWeapon(meta.weaponType);
      // Keyed by CHARACTER ID, so moving the slot later cannot detach the
      // weapon from its owner. The refinement travels with the id.
      onEquipmentChange(
        equipWeapon(
          equipment,
          character.id,
          defWeapon.id,
          DEFAULT_REFINEMENT,
          DEFAULT_WEAPON_LEVEL,
        ),
      );
      const characterWithWeapon: CharacterDefinition = {
        ...character,
        baseStats: applyWeaponStats(character.baseStats, defWeapon),
      };
      onTeamChange(setSlot(team, slotIndex, characterWithWeapon));
      setPickerSlot(null);
    },
    [team, onTeamChange, equipment, onEquipmentChange],
  );

  const handleSelectWeapon = useCallback(
    (weapon: WeaponDefinition, refinement: Refinement, weaponLevel = DEFAULT_WEAPON_LEVEL) => {
      if (weaponPickerSlot === null) return;
      const slotIndex = weaponPickerSlot;
      const character = team[slotIndex];
      if (!character) return;

      const baseCharacter = roster.find((c) => c.id === character.id) ?? character;
      const genericCharacter = findCharacter(character.id);
      const curve = genericCharacter
        ? baseStatsAtLevel(genericCharacter, character.level)
        : null;
      const intrinsicStats = curve
        ? {
            ...baseCharacter.baseStats,
            atk: curve.atk,
            hp: curve.hp,
            def: curve.def,
            base: undefined,
          }
        : baseCharacter.baseStats;
      const nextStats = applyWeaponStats(intrinsicStats, weapon, weaponLevel);

      // The refinement the user was BROWSING at is the refinement they own.
      // It was previously discarded on select, so every equipped weapon
      // simulated at R1 — `harvestWeaponPassiveBuffs` indexes per-refinement
      // data, so that was a wrong damage number, not a cosmetic gap.
      onEquipmentChange(
        equipWeapon(equipment, character.id, weapon.id, refinement, weaponLevel),
      );
      const updatedChar: CharacterDefinition = {
        ...character,
        baseStats: nextStats,
      };
      onTeamChange(setSlot(team, slotIndex, updatedChar));
      const charZh = charNameZh(character.name) || character.name;
      setAnnouncement(
        `已为 ${charZh} 装备武器: ${weapon.nameZh}（精炼 ${refinement} 阶）。`,
      );
      setWeaponPickerSlot(null);
    },
    [weaponPickerSlot, team, roster, onTeamChange, equipment, onEquipmentChange],
  );


  const handleSelectArtifact = useCallback(
    (
      artifact: ArtifactSetDefinition | null,
      pieces: ArtifactPieceCount,
      artifactLoadout?: import("@/simulation/character/equipment").ArtifactLoadout,
    ) => {
      if (artifactPickerSlot === null) return;
      const slotIndex = artifactPickerSlot;
      const character = team[slotIndex];
      if (!character) return;

      onEquipmentChange(
        artifactLoadout && Object.keys(artifactLoadout).length > 0
          ? equipArtifactLoadout(equipment, character.id, artifactLoadout)
          : equipArtifactSet(
              equipment,
              character.id,
              artifact ? artifact.id : null,
              pieces,
            ),
      );
      const charZh = charNameZh(character.name) || character.name;
      if (artifact) {
        const combination = artifactCombinationLabel(artifactLoadout);
        setAnnouncement(
          combination
            ? `已为 ${charZh} 保存圣遗物组合：${combination}。`
            : `已为 ${charZh} 装备圣遗物套装: ${artifact.nameZh}（${pieces} 件套）。`,
        );
      } else {
        setAnnouncement(`已卸下 ${charZh} 的圣遗物套装。`);
      }
      setArtifactPickerSlot(null);
    },
    [artifactPickerSlot, team, equipment, onEquipmentChange],
  );

  const handleRemove = useCallback(
    (slotIndex: number) => {
      const removed = team[slotIndex];
      onTeamChange(setSlot(team, slotIndex, null));
      setAnnouncement(removed ? `已将 ${charNameZh(removed.name) || removed.name} 从 ${slotIndex + 1} 号位移除。` : "已清空席位。");
    },
    [team, onTeamChange],
  );

  const handleMove = useCallback(
    (from: number, to: number) => {
      const moved = team[from];
      onTeamChange(moveSlot(team, from, to));
      if (moved) setAnnouncement(`已将 ${charNameZh(moved.name) || moved.name} 移动至 ${to + 1} 号位。`);
    },
    [team, onTeamChange],
  );

  const handleSetActive = useCallback(
    (characterId: string) => {
      onSetActive(characterId);
      const character = team.find((c) => c?.id === characterId);
      if (character) setAnnouncement(`已将 ${charNameZh(character.name) || character.name} 设为首发角色。`);
    },
    [team, onSetActive],
  );

  const handleSaveStats = useCallback(
    (
      updatedStats: Stats,
      updatedConstellation?: number,
      updatedTalentLevels?: { normal: number; skill: number; burst: number },
      updatedLevel?: number,
    ) => {
      if (editingSlot === null) return;
      const target = team[editingSlot];
      if (!target) return;
      // The merge is pure and lives in `teamModel` so it is testable: a
      // handler that silently dropped `level` would otherwise be invisible to
      // every test in this project, which has no DOM harness.
      const updatedChar: CharacterDefinition = applyBuildEdit(target, {
        baseStats: updatedStats,
        ...(updatedConstellation === undefined
          ? {}
          : { constellation: updatedConstellation }),
        ...(updatedTalentLevels === undefined
          ? {}
          : { talentLevels: updatedTalentLevels }),
        ...(updatedLevel === undefined ? {} : { level: updatedLevel }),
      });
      onTeamChange(setSlot(team, editingSlot, updatedChar));
      setAnnouncement(`已更新 ${charNameZh(target.name) || target.name} 的配置。`);
    },
    [editingSlot, team, onTeamChange],
  );

  const editingCharacter = (editingSlot !== null ? team[editingSlot] : null) ?? null;
  const editingDefaultCharacter = editingCharacter
    ? roster.find((c) => c.id === editingCharacter.id) ?? null
    : null;

  if (rosterError !== null) {
    return (
      <div
        role="alert"
        className={cn("rounded-md border p-4 text-sm", STATE_CHIP.error)}
      >
        <span aria-hidden="true">✕ </span>
        {rosterError} 请刷新页面重试。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Active Elemental Resonances */}
      {resonances.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-surface-border bg-surface px-3 py-2 text-xs font-mono">
          <span className="font-semibold text-slate-300">队伍元素共鸣:</span>
          {resonances.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-1.5 rounded-sm border border-amber-500/30 bg-amber-500/10 px-2.5 py-1"
              title={resonanceFullDescZh(r.name) || r.fullDesc}
            >
              <span className="font-medium text-amber-400">✦ {resonanceNameZh(r.name)}</span>
              <span className="text-slate-300">({resonanceShortDescZh(r.name) || r.shortDesc})</span>
            </div>
          ))}
        </div>
      )}

      <ul
        aria-label={`出战队伍，共 ${TEAM_SIZE} 个席位`}
        aria-busy={rosterLoading || undefined}
        className={SLOT_GRID}
      >
        {team.map((character, slotIndex) => {
          if (rosterLoading) {
            return <SkeletonTeamSlot key={slotIndex} slotIndex={slotIndex} />;
          }
          if (character === null) {
            return (
              <EmptyTeamSlot
                key={slotIndex}
                slotIndex={slotIndex}
                onAdd={setPickerSlot}
                onMove={handleMove}
              />
            );
          }
          const meta = getCharacterMetadata(character.id);
          const selection = selectionFor(equipment, character.id);
          const currentWeaponId = selection.weaponId;
          const equippedWeapon = currentWeaponId
            ? findWeapon(currentWeaponId) ?? getDefaultWeapon(meta.weaponType)
            : getDefaultWeapon(meta.weaponType);
          const currentWeaponLevel = selection.weaponLevel ?? DEFAULT_WEAPON_LEVEL;
          const equippedWeaponStats = findWeaponStatsAtLevel(
            equippedWeapon.id,
            currentWeaponLevel,
          );
          // The card has always shown a default weapon for an empty selection.
          // Use that same weapon for the visible starting panel, otherwise the
          // card says Homa while the numbers still describe a bare character.
          const displaySelection = currentWeaponId
            ? selection
            : {
                weaponId: equippedWeapon.id,
                refinement: DEFAULT_REFINEMENT,
                weaponLevel: DEFAULT_WEAPON_LEVEL,
              };
          const currentArtifactId = selection.artifactSetId ?? null;
          const equippedArtifact = currentArtifactId ? findArtifact(currentArtifactId) ?? null : null;
          const displayStats = resolveInitialStatsPreview({
            character,
            intrinsicCharacter: roster.find((candidate) => candidate.id === character.id),
            selection: displaySelection,
          }).stats;


          return (
            <FilledTeamSlot
              key={character.id}
              slotIndex={slotIndex}
              character={character}
              isActive={character.id === resolvedActiveId}
              activeFollowsTimeline={activeFollowsTimeline}
              damageShare={damageShares?.get(character.id)}
              canMoveEarlier={slotIndex > 0}
              canMoveLater={slotIndex < TEAM_SIZE - 1}
              onChange={setPickerSlot}
              onRemove={handleRemove}
              onSetActive={handleSetActive}
              onMove={handleMove}
              onEditStats={setEditingSlot}
              equippedWeapon={equippedWeapon}
              onSelectWeapon={setWeaponPickerSlot}
              equippedArtifact={equippedArtifact}
              onSelectArtifact={setArtifactPickerSlot}
              // Only stated when the user actually chose one: rendering a
              // default refinement the selection does not carry would show a
              // number the simulation does not use (the harvest fails closed).
              weaponRefinement={displaySelection.refinement}
              weaponLevel={displaySelection.weaponLevel}
              weaponBaseAtk={
                equippedWeaponStats?.baseAtk ??
                findWeaponBaseAtkAtLevel(equippedWeapon.id, currentWeaponLevel) ??
                equippedWeapon.baseAtk
              }
              weaponSubStat={
                equippedWeaponStats?.subStat
              }
              artifactPieces={equippedArtifact ? selection.artifactPieces : undefined}
              artifactCombination={
                equippedArtifact
                  ? artifactCombinationLabel(selection.artifactLoadout)
                  : undefined
              }
              artifactStatCount={
                equippedArtifact
                  ? countArtifactPiecesWithStats(selection.artifactLoadout)
                  : undefined
              }
              displayStats={displayStats}
            />
          );
        })}
      </ul>

      {orphanedActionCount > 0 && (
        <p className={cn("rounded-md border px-3 py-2 text-xs", STATE_CHIP.warning)}>
          <span aria-hidden="true">⚠ </span>
          {orphanedActionCount} 个循环动作引用了已被移除的角色。
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-mono">
          <span className="text-slate-400">快速阵容预设:</span>
          <Button
            size="sm"
            variant="quiet"
            onClick={() => {
              const r = roster.find((c) => c.id === "raiden");
              const b = roster.find((c) => c.id === "bennett");
              const xl = roster.find((c) => c.id === "xiangling");
              const xq = roster.find((c) => c.id === "xingqiu");
              if (r && b && xl && xq) {
                onTeamChange(teamFrom([r, b, xl, xq]));
              } else {
                onTeamChange(teamFrom(roster.slice(0, 4)));
              }
            }}
          >
            雷神国家队
          </Button>
          <Button
            size="sm"
            variant="quiet"
            onClick={() => onTeamChange(teamFrom(roster.slice(0, 4)))}
          >
            加载前4位角色
          </Button>
          <Button
            size="sm"
            variant="quiet"
            onClick={() => {
              const b = roster.find((c) => c.id === "bennett");
              onTeamChange(teamFrom([b ?? roster[0]!]));
            }}
          >
            单人火系 (班尼特)
          </Button>
          {count > 0 && (
            <Button
              size="sm"
              variant="quiet"
              onClick={() => onTeamChange([null, null, null, null])}
            >
              清空队伍
            </Button>
          )}
        </div>

        {count > 0 && (
          <p className="text-xs text-slate-400 font-mono">
            队伍能量微粒分配基于当前 {count} 位出战角色。
          </p>
        )}
      </div>

      {count === 0 && !rosterLoading && (
        <p className="flex items-center gap-2 text-xs text-slate-400">
          <StatusChip state="info">队伍为空</StatusChip>
          请至少配置 1 位出战角色以进行战斗模拟。
        </p>
      )}

      <LiveRegion message={announcement} />

      <CharacterPicker
        open={pickerSlot !== null}
        slotIndex={pickerSlot ?? 0}
        roster={roster}
        team={team}
        onSelect={handleSelect}
        onClose={() => setPickerSlot(null)}
      />

      <CharacterStatsModal
        open={editingSlot !== null}
        character={editingCharacter}
        defaultCharacter={editingDefaultCharacter}
        equipment={
            editingCharacter
            ? (() => {
                const selection = selectionFor(equipment, editingCharacter.id);
                if (selection.weaponId !== undefined) return selection;
                const defaultWeapon = getDefaultWeapon(
                  getCharacterMetadata(editingCharacter.id).weaponType,
                );
                return {
                  ...selection,
                  weaponId: defaultWeapon.id,
                  refinement: DEFAULT_REFINEMENT,
                  weaponLevel: DEFAULT_WEAPON_LEVEL,
                };
              })()
            : undefined
        }
        onClose={() => setEditingSlot(null)}
        onSave={handleSaveStats}
      />

      {weaponPickerSlot !== null && team[weaponPickerSlot] && (
        <WeaponPicker
          open={weaponPickerSlot !== null}
          characterName={
            charNameZh(team[weaponPickerSlot]!.name) ||
            team[weaponPickerSlot]!.name
          }
          weaponType={
            getCharacterMetadata(team[weaponPickerSlot]!.id).weaponType
          }
          currentWeaponId={
            selectionFor(equipment, team[weaponPickerSlot]!.id).weaponId ??
            getDefaultWeapon(
              getCharacterMetadata(team[weaponPickerSlot]!.id).weaponType,
            ).id
          }
          currentRefinement={
            selectionFor(equipment, team[weaponPickerSlot]!.id).refinement
          }
          currentWeaponLevel={
            selectionFor(equipment, team[weaponPickerSlot]!.id).weaponLevel ??
            DEFAULT_WEAPON_LEVEL
          }
          onClose={() => setWeaponPickerSlot(null)}
          onSelect={handleSelectWeapon}
        />
      )}

      {artifactPickerSlot !== null && team[artifactPickerSlot] && (
        <ArtifactPicker
          open={artifactPickerSlot !== null}
          characterName={
            charNameZh(team[artifactPickerSlot]!.name) ||
            team[artifactPickerSlot]!.name
          }
          currentArtifactId={
            selectionFor(equipment, team[artifactPickerSlot]!.id).artifactSetId
          }
          currentPieces={
            selectionFor(equipment, team[artifactPickerSlot]!.id).artifactPieces
          }
          currentArtifactLoadout={
            selectionFor(equipment, team[artifactPickerSlot]!.id).artifactLoadout
          }
          onClose={() => setArtifactPickerSlot(null)}
          onSelect={handleSelectArtifact}
        />
      )}
    </div>
  );
}
