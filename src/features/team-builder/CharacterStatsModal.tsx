"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { CharacterDefinition, Stats } from "@/types";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ElementTag } from "@/components/ui/ElementTag";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar";
import { charNameZh, elementZh, tierReasonZh } from "@/lib/i18n";
import { cn } from "@/components/ui/cn";
import {
  FOCUS_RING,
  STATE_CHIP,
  STATE_GLYPH,
  TRANSITION_COLORS,
} from "@/components/ui/tokens";
import { getCharacterKitDetails } from "@/game-data/characters/kits/raidenNationalKit";
import { findCharacter } from "@/game-data/characters/registry";
import { AbilityCard } from "@/features/character-detail/AbilityCard";
import { PendingDataNotice } from "@/features/character-detail/PendingDataNotice";
import {
  anyRowSimulated,
  buildConstellationRows,
  buildPassiveRows,
  perkCoverage,
  type PerkRow,
} from "@/features/character-detail/perkPresentation";
import { getCharacterMetadata } from "@/features/team-builder/rosterModel";
import {
  resolveInitialStatsPreview,
  type InitialStatsPreview,
} from "@/features/team-builder/initialStatsPreview";
import type { CharacterEquipmentSelection } from "@/features/team-builder/equipmentSelection";
import {
  findWeapon,
  findWeaponBaseAtkAtLevel,
  findWeaponStatsAtLevel,
} from "@/game-data/weapons/registry";
import { DEFAULT_WEAPON_LEVEL } from "@/features/team-builder/equipmentSelection";
import { findArtifact } from "@/game-data/artifacts/registry";
import { getWeaponPassiveZh } from "@/lib/weaponPassiveZh";
import { toEngineCharacter } from "@/features/simulation/simulationAdapter";
import { talentZhForSlot } from "@/lib/characterTalentZh";
import { applyWeaponStats } from "@/features/team-builder/weaponModel";
import { countArtifactPiecesWithStats } from "@/features/team-builder/ArtifactStatsEditor";
import {
  baseStatsAtLevel,
  characterLevels,
  clampCharacterLevel,
  formatTalentLevelSummary,
  talentBoostsForConstellation,
} from "@/features/team-builder/characterProgression";

/** Constellation levels a character can be set to. C0 is "no constellation". */
const CONSTELLATION_LEVELS: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

/**
 * Copy for a perk row in the Chinese-only progression view.
 *
 * Generated perk names and source prose are English presentation metadata;
 * they must never leak into this surface when Chinese authoring is absent.
 */
export function chinesePerkDisplayCopy(
  row: Pick<PerkRow, "descriptionZh" | "name" | "text">,
): {
  readonly label: "命之座效果";
  readonly description: string;
} {
  return {
    label: "命之座效果",
    description: row.descriptionZh ?? "暂无中文描述文本。",
  };
}

function InitialStatsSummary({
  preview,
  element,
  weaponName,
  weaponStatSummary,
  weaponPassiveName,
  weaponPassiveDescription,
  artifactName,
  artifactPieces,
  artifactBonuses,
  artifactStatCount,
}: {
  preview: InitialStatsPreview;
  element: CharacterDefinition["element"];
  weaponName?: string;
  weaponStatSummary?: string;
  weaponPassiveName?: string;
  weaponPassiveDescription?: string;
  artifactName?: string;
  artifactPieces?: number;
  artifactBonuses?: readonly string[];
  artifactStatCount?: number;
}) {
  const rows = [
    ["攻击力", preview.stats.atk.toLocaleString("zh-CN")],
    ["生命值", preview.stats.hp.toLocaleString("zh-CN")],
    ["防御力", preview.stats.def.toLocaleString("zh-CN")],
    ["暴击率", `${(preview.stats.critRate * 100).toFixed(1)}%`],
    ["暴击伤害", `${(preview.stats.critDmg * 100).toFixed(1)}%`],
    ["元素充能", `${(preview.stats.energyRecharge * 100).toFixed(1)}%`],
    ["元素精通", preview.stats.elementalMastery.toLocaleString("zh-CN")],
    [
      `${elementZh(element)}伤害加成`,
      `${((preview.stats.elementalDmgBonus?.[element] ?? 0) * 100).toFixed(1)}%`,
    ],
  ] as const;

  return (
    <section
      aria-label="计算起始面板"
      className="space-y-2 rounded-xl border border-cyan-500/30 bg-cyan-950/15 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
          计算起始面板
        </h4>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-micro text-cyan-200">
          装备与常驻效果已合并
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="rounded-md border border-surface-border/60 bg-surface/60 px-2.5 py-2"
          >
            <div className="text-micro text-slate-400">{label}</div>
            <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-100">
              {value}
            </div>
          </div>
        ))}
      </div>
      {(weaponName || artifactName || preview.permanentBuffs > 0) && (
        <div className="space-y-1 text-micro text-slate-300">
          {weaponName && (
            <p>
              武器：{weaponName}
              {weaponStatSummary ? " · " + weaponStatSummary : ""}
              {weaponPassiveName ? ` · ${weaponPassiveName}常驻效果` : ""}
            </p>
          )}
          {weaponPassiveDescription && (
            <p className="leading-relaxed text-slate-400">
              武器被动：{weaponPassiveDescription}
            </p>
          )}
          {artifactName && (
            <p>
              圣遗物：{artifactName}
              {artifactPieces ? ` · ${artifactPieces}件套效果` : ""}
            </p>
          )}
          {artifactBonuses?.map((description, index) => (
            <p key={`${index}-${description}`} className="leading-relaxed text-slate-400">
              套装效果：{description}
            </p>
          ))}
          {artifactName && (
            <p className="text-slate-500">
              {artifactStatCount
                ? `已录入 ${artifactStatCount}/5 件圣遗物词条。`
                : "单件圣遗物主词条与副词条暂无数据，可在圣遗物选择器中录入。"}
            </p>
          )}
          {preview.permanentBuffs > 0 && (
            <p>角色天赋与命之座：已合并 {preview.permanentBuffs} 项常驻属性效果。</p>
          )}
        </div>
      )}
      {preview.conditionalBuffs > 0 && (
        <p className="text-micro leading-relaxed text-slate-400">
          另有 {preview.conditionalBuffs} 项条件效果，按战斗时序、能量、生命值与触发状态实时计算，不提前写入面板。
        </p>
      )}
    </section>
  );
}

interface Props {
  open: boolean;
  character: CharacterDefinition | null;
  defaultCharacter?: CharacterDefinition | null;
  /** Current equipment selection. Used only for the read-only stat preview. */
  equipment?: CharacterEquipmentSelection;
  onClose: () => void;
  onSave: (
    updatedStats: Stats,
    constellation?: number,
    talentLevels?: { normal: number; skill: number; burst: number },
    level?: number
  ) => void;
}

export function CharacterStatsModal({
  open,
  character,
  defaultCharacter,
  equipment,
  onClose,
  onSave,
}: Props) {
  if (!character) return null;

  return (
    <CharacterStatsModalInner
      key={character.id}
      open={open}
      character={character}
      defaultCharacter={defaultCharacter}
      equipment={equipment}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function CharacterStatsModalInner({
  open,
  character,
  defaultCharacter,
  equipment,
  onClose,
  onSave,
}: {
  open: boolean;
  character: CharacterDefinition;
  defaultCharacter?: CharacterDefinition | null;
  equipment?: CharacterEquipmentSelection;
  onClose: () => void;
  onSave: (
    updatedStats: Stats,
    constellation?: number,
    talentLevels?: { normal: number; skill: number; burst: number },
    level?: number
  ) => void;
}) {
  const kitDetails = getCharacterKitDetails(character.id);
  // Full kit (per-level talent tables, scaling stats, cooldowns). The modal's
  // own prop is the LEGACY shape, which has already collapsed each multiplier
  // to a single talent level and so cannot drive a level selector.
  const kit = findCharacter(character.id);
  const firstTabRef = useRef<HTMLButtonElement | null>(null);
  const constellationGroupLabelId = useId();

  // Constellation rows come from the pure four-row-truth-table adapter, joined
  // to hand-authored Chinese prose where a kit supplies it. The component makes
  // no judgement about what is simulated; it renders the adapter's decision.
  const constellationRows = useMemo(() => {
    const proseById = new Map<string, string>();
    for (const c of kitDetails?.constellations ?? []) {
      proseById.set(`${character.id}-c${c.level}`, c.descriptionZh);
    }
    return buildConstellationRows(character.id, (perkId) => {
      const descriptionZh = proseById.get(perkId);
      return descriptionZh === undefined ? {} : { descriptionZh };
    });
  }, [character.id, kitDetails]);

  const constellationsSimulated = anyRowSimulated(constellationRows);
  const constellationCoverage = perkCoverage(constellationRows);
  const hideConstellationSupportLabel = character.id === "raiden-shogun";
  const passiveRows = useMemo(() => {
    const proseById = new Map<string, string>();
    for (const p of kitDetails?.passives ?? []) proseById.set(p.id, p.descriptionZh);
    return buildPassiveRows(character.id, (perkId) => {
      const descriptionZh = proseById.get(perkId);
      return descriptionZh === undefined ? {} : { descriptionZh };
    });
  }, [character.id, kitDetails]);
  // This character's own support reason, translated. `tierReasonZh` returns
  // undefined on a miss rather than falling back to the English source.
  const tierReasonDetail = tierReasonZh(getCharacterMetadata(character.id).tierReason);
  const initialConstellation =
    character.constellation !== undefined
      ? character.constellation
      : kitDetails?.defaultConstellation ?? 0;
  const initialTalents = character.talentLevels ??
    kitDetails?.defaultTalentLevels ?? { normal: 6, skill: 9, burst: 10 };

  const [activeTab, setActiveTab] = useState<"stats" | "constellation" | "talents">("stats");
  const [level, setLevel] = useState(character.level);
  const [constellation, setConstellation] = useState(initialConstellation);
  const [talentNormal, setTalentNormal] = useState(initialTalents.normal);
  const [talentSkill, setTalentSkill] = useState(initialTalents.skill);
  const [talentBurst, setTalentBurst] = useState(initialTalents.burst);

  /**
   * Talent levels the CURRENTLY SELECTED constellation adds, for display.
   *
   * Keyed off the live `constellation` state rather than the saved character,
   * so the ability tables track the radio group immediately. Never merged into
   * `talentNormal/Skill/Burst`: the engine applies the boost itself and folding
   * it in here would apply it twice.
   */
  const talentBoosts = useMemo(
    () => talentBoostsForConstellation(character.id, constellation),
    [character.id, constellation],
  );

  function handleConstellationKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let next: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (constellation + 1) % CONSTELLATION_LEVELS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (constellation + CONSTELLATION_LEVELS.length - 1) % CONSTELLATION_LEVELS.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = 6;
    }
    if (next === undefined) return;
    event.preventDefault();
    setConstellation(next);
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[data-constellation="${next}"]`)
      ?.focus();
  }

  const element = character.element;

  const selectedWeapon = equipment?.weaponId
    ? findWeapon(equipment.weaponId)
    : undefined;
  const selectedArtifact = equipment?.artifactSetId
    ? findArtifact(equipment.artifactSetId)
    : undefined;
  const selectedArtifactBonuses = selectedArtifact?.bonuses
    .filter(
      (bonus) =>
        equipment?.artifactPieces !== undefined &&
        equipment.artifactPieces >= bonus.pieces,
    )
    .map((bonus) => bonus.descriptionZh);
  const selectedWeaponPassive = selectedWeapon?.passive
    ? getWeaponPassiveZh(
        selectedWeapon.id,
        selectedWeapon.passive.name,
        selectedWeapon.passive.desc,
        equipment?.refinement,
      )
    : undefined;
  const selectedWeaponStats = selectedWeapon
    ? findWeaponStatsAtLevel(
        selectedWeapon.id,
        equipment?.weaponLevel ?? DEFAULT_WEAPON_LEVEL,
      )
    : undefined;
  const selectedWeaponBaseAtk = selectedWeapon
    ? selectedWeaponStats?.baseAtk ??
      findWeaponBaseAtkAtLevel(
        selectedWeapon.id,
        equipment?.weaponLevel ?? DEFAULT_WEAPON_LEVEL,
      ) ??
      selectedWeapon.baseAtk
    : undefined;
  const selectedWeaponStatSummary = selectedWeapon
    ? "基础攻击 " +
      selectedWeaponBaseAtk +
      ` · ${equipment?.weaponLevel ?? DEFAULT_WEAPON_LEVEL}级` +
      (selectedWeaponStats === undefined
        ? " · 武器副词条暂无数据"
        : selectedWeaponStats.subStat.type === "none"
          ? ""
          : " · " +
            selectedWeaponStats.subStat.labelZh +
            " " +
            (selectedWeaponStats.subStat.type === "elementalMastery"
              ? selectedWeaponStats.subStat.value
              : (selectedWeaponStats.subStat.value * 100).toFixed(1) + "%"))
    : undefined;

  /**
   * Values shown in editable ATK/HP/DEF fields on first open. A freshly
   * selected character has intrinsic stats without a `base` split, while the
   * team card already treats its starter weapon as equipped. Resolve that
   * weapon here so saving an unchanged modal cannot silently remove it. The
   * artifact editor stays in the separate loadout; its values appear in the
   * read-only panel and are applied by the equipment adapter exactly once.
   */
  const editorInitialStats = (() => {
    if (character.baseStats.base !== undefined) return character.baseStats;
    const curve = kit ? baseStatsAtLevel(kit, character.level) : null;
    const source: Stats = {
      ...(defaultCharacter?.baseStats ?? character.baseStats),
      ...(curve ?? {}),
      base: undefined,
    };
    return selectedWeapon
      ? applyWeaponStats(
          source,
          selectedWeapon,
          equipment?.weaponLevel ?? DEFAULT_WEAPON_LEVEL,
        )
      : source;
  })();
  const initial = editorInitialStats;

  const [atk, setAtk] = useState(initial.atk);
  const [hp, setHp] = useState(initial.hp ?? 15000);
  const [def, setDef] = useState(initial.def ?? 800);
  const [critRatePct, setCritRatePct] = useState((initial.critRate * 100).toFixed(1));
  const [critDmgPct, setCritDmgPct] = useState((initial.critDmg * 100).toFixed(1));
  const [erPct, setErPct] = useState((initial.energyRecharge * 100).toFixed(1));
  const [em, setEm] = useState(initial.elementalMastery);
  const [elemDmgPct, setElemDmgPct] = useState(
    (((initial.elementalDmgBonus?.[element] ?? 0) * 100)).toFixed(1),
  );
  const [dmgBonusPct, setDmgBonusPct] = useState(
    ((initial.dmgBonus ?? 0) * 100).toFixed(1),
  );

  /**
   * Canonical base split for the live level and selected weapon. The modal
   * edits final values, but the engine also needs the underlying base values
   * so later ATK%/HP%/DEF% equipment bonuses scale correctly.
   */
  const currentBase = useMemo(() => {
    const curve = kit ? baseStatsAtLevel(kit, level) : null;
    if (curve === null || curve === undefined) {
      return character.baseStats.base;
    }
    return {
      atk: curve.atk + (selectedWeaponBaseAtk ?? 0),
      hp: curve.hp,
      def: curve.def,
    };
  }, [character.baseStats.base, kit, level, selectedWeaponBaseAtk]);

  /**
   * Rebuild curve-driven values at a new character level while retaining the
   * selected weapon's exact level and secondary stat. Artifact stats remain in
   * the equipment selection and are applied by the shared preview/adapter.
   */
  function statsAtSelectedLevel(nextLevel: number): Stats | null {
    if (!kit) return null;
    const curve = baseStatsAtLevel(kit, nextLevel);
    if (!curve) return null;
    const intrinsic: Stats = {
      ...(defaultCharacter?.baseStats ?? character.baseStats),
      atk: curve.atk,
      hp: curve.hp,
      def: curve.def,
      // Strip a previous weapon-resolved base split before applying the
      // weapon again at its selected level.
      base: undefined,
    };
    return selectedWeapon
      ? applyWeaponStats(
          intrinsic,
          selectedWeapon,
          equipment?.weaponLevel ?? DEFAULT_WEAPON_LEVEL,
        )
      : intrinsic;
  }
  const liveCharacter = useMemo<CharacterDefinition>(
    () => ({
      ...character,
      level,
      constellation,
      talentLevels: {
        normal: talentNormal,
        skill: talentSkill,
        burst: talentBurst,
      },
      baseStats: {
        ...character.baseStats,
        atk,
        hp,
        def,
        critRate: Math.max(0, (Number(critRatePct) || 0) / 100),
        critDmg: Math.max(0, (Number(critDmgPct) || 0) / 100),
        energyRecharge: Math.max(1, (Number(erPct) || 100) / 100),
        elementalMastery: Math.max(0, Number(em) || 0),
        dmgBonus: Math.max(0, (Number(dmgBonusPct) || 0) / 100),
        elementalDmgBonus: {
          ...character.baseStats.elementalDmgBonus,
          [element]: Math.max(0, (Number(elemDmgPct) || 0) / 100),
        },
        ...(currentBase === undefined ? {} : { base: currentBase }),
      },
    }),
    [
      character,
      level,
      constellation,
      talentNormal,
      talentSkill,
      talentBurst,
      atk,
      hp,
      def,
      critRatePct,
      critDmgPct,
      erPct,
      em,
      dmgBonusPct,
      element,
      elemDmgPct,
      currentBase,
    ],
  );
  const engineCharacter = useMemo(
    () => toEngineCharacter(liveCharacter),
    [liveCharacter],
  );
  const intrinsicEngineCharacter = useMemo(
    () => (defaultCharacter ? toEngineCharacter(defaultCharacter) : null),
    [defaultCharacter],
  );
  const initialStatsPreview: InitialStatsPreview = useMemo(
    () =>
      resolveInitialStatsPreview({
        character: engineCharacter,
        intrinsicCharacter: intrinsicEngineCharacter,
        selection: equipment,
      }),
    [engineCharacter, intrinsicEngineCharacter, equipment],
  );

  function applyPreset(preset: "dps" | "subDps" | "em" | "default") {
    if (preset === "default" && defaultCharacter) {
      // Reset to the roster preset at the CURRENT selected character level,
      // then reapply the selected weapon at its CURRENT weapon level. Using
      // `defaultCharacter.baseStats` directly here would restore a level-90
      // snapshot while the header still says (for example) level 40, and it
      // would also drop the weapon contribution from the editable fields.
      const base = statsAtSelectedLevel(level) ?? defaultCharacter.baseStats;
      setAtk(base.atk);
      setHp(base.hp ?? 15000);
      setDef(base.def ?? 800);
      setCritRatePct((base.critRate * 100).toFixed(1));
      setCritDmgPct((base.critDmg * 100).toFixed(1));
      setErPct((base.energyRecharge * 100).toFixed(1));
      setEm(base.elementalMastery);
      setElemDmgPct((((base.elementalDmgBonus?.[element] ?? 0) * 100)).toFixed(1));
      setDmgBonusPct(((base.dmgBonus ?? 0) * 100).toFixed(1));
      if (defaultCharacter.constellation !== undefined) {
        setConstellation(defaultCharacter.constellation);
      }
      if (defaultCharacter.talentLevels) {
        setTalentNormal(defaultCharacter.talentLevels.normal);
        setTalentSkill(defaultCharacter.talentLevels.skill);
        setTalentBurst(defaultCharacter.talentLevels.burst);
      }
      return;
    }

    if (preset === "dps") {
      setAtk(2000);
      setCritRatePct("70.0");
      setCritDmgPct("140.0");
      setErPct("125.0");
      setEm(80);
      setElemDmgPct("46.6");
    } else if (preset === "subDps") {
      setAtk(1600);
      setCritRatePct("60.0");
      setCritDmgPct("120.0");
      setErPct("200.0");
      setEm(100);
      setElemDmgPct("46.6");
    } else if (preset === "em") {
      setAtk(1200);
      setCritRatePct("40.0");
      setCritDmgPct("80.0");
      setErPct("160.0");
      setEm(850);
      setElemDmgPct("0.0");
    }
  }

  /**
   * Applies a character level by REPLACING HP/ATK/DEF from the published curve.
   *
   * `baseStats` on a roster character is a level-90 SNAPSHOT. Writing `level`
   * alone would leave a level-1 Bennett attacking with 191 base ATK instead of
   * 16 — measured at 818 damage where the correct answer is 68.5, a number that
   * looks responsive (the attacker's level does move the DEF multiplier) while
   * the stats behind it never changed. The curve lookup lives in
   * `characterProgression`; this handler only pushes the result into the fields
   * the user can see, so the panel and the engine never disagree.
   */
  function handleLevelChange(nextLevel: number) {
    const clamped = kit ? clampCharacterLevel(kit, nextLevel) : nextLevel;
    setLevel(clamped);
    const resolved = statsAtSelectedLevel(clamped);
    if (!resolved) return;
    setAtk(resolved.atk);
    setHp(resolved.hp);
    setDef(resolved.def);
  }

  function handleSave() {
    const updatedStats: Stats = {
      ...character.baseStats,
      atk: Math.max(0, Number(atk) || 0),
      hp: Math.max(0, Number(hp) || 0),
      def: Math.max(0, Number(def) || 0),
      critRate: Math.max(0, (Number(critRatePct) || 0) / 100),
      critDmg: Math.max(0, (Number(critDmgPct) || 0) / 100),
      energyRecharge: Math.max(1, (Number(erPct) || 100) / 100),
      elementalMastery: Math.max(0, Number(em) || 0),
      dmgBonus: Math.max(0, (Number(dmgBonusPct) || 0) / 100),
      elementalDmgBonus: {
        ...character.baseStats.elementalDmgBonus,
        [element]: Math.max(0, (Number(elemDmgPct) || 0) / 100),
      },
      ...(currentBase === undefined ? {} : { base: currentBase }),
    };

    onSave(
      updatedStats,
      constellation,
      {
        normal: talentNormal,
        skill: talentSkill,
        burst: talentBurst,
      },
      level,
    );
    onClose();
  }

  const displayName = charNameZh(character.name);
  const elementLabel = elementZh(element);

  return (
    <Dialog
      open={open}
      title={`角色养成配置 · ${displayName}`}
      onClose={onClose}
      initialFocusRef={firstTabRef}
      size="detail"
    >
      <div className="space-y-5">
        {/* Character Info Bar */}
        <div className="flex items-center gap-3.5 rounded-xl border border-surface-border bg-surface-raised/80 p-3.5">
          <CharacterAvatar
            characterId={character.id}
            characterName={character.name}
            element={character.element}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                {displayName}
              </h3>
              <ElementTag element={character.element} />
              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                {constellation} 命
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              {/*
                Live `level` state, not `character.level`. The prop is the SAVED
                value, so rendering it here left the summary stale the moment the
                user moved the level selector — while the talent figures beside
                it were already live, making one row disagree with itself.
              */}
              等级 {level} · 天赋：普攻{" "}
              {formatTalentLevelSummary(talentNormal, talentBoosts.normal)} / 战技{" "}
              {formatTalentLevelSummary(talentSkill, talentBoosts.skill)} / 爆发{" "}
              {formatTalentLevelSummary(talentBurst, talentBoosts.burst)}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-1">
          <button
            ref={firstTabRef}
            type="button"
            onClick={() => setActiveTab("stats")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors",
              activeTab === "stats"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-surface-raised"
            )}
          >
            面板属性
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("constellation")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5",
              activeTab === "constellation"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-surface-raised"
            )}
          >
            <span>命之座</span>
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-micro font-mono text-amber-400">
              {constellation}命
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("talents")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors",
              activeTab === "talents"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-surface-raised"
            )}
          >
            天赋与技能
          </button>
        </div>

        {/* TAB 1: 面板属性 */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            {/*
              Character level. Selecting one REPLACES base HP/ATK/DEF from the
              published curve, so the three fields below always describe the
              chosen level rather than a level-90 snapshot.
            */}
            {kit && (
              <div className="space-y-1.5">
                <label
                  htmlFor="character-level"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  角色等级
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    id="character-level"
                    value={level}
                    onChange={(e) => handleLevelChange(Number(e.target.value))}
                    className={cn(
                      "rounded-md border border-surface-border bg-surface px-2 py-1.5 font-mono text-sm tabular-nums text-slate-100",
                      FOCUS_RING,
                    )}
                  >
                    {characterLevels(kit).map((lv) => (
                      <option key={lv} value={lv}>
                        Lv. {lv}
                      </option>
                    ))}
                  </select>
                  <span className="text-micro text-slate-400">
                    切换等级会按曲线覆盖下方的生命值 / 攻击力 / 防御力
                  </span>
                </div>
              </div>
            )}

            <InitialStatsSummary
              preview={initialStatsPreview}
              element={element}
              weaponName={selectedWeapon?.nameZh}
              weaponStatSummary={selectedWeaponStatSummary}
              weaponPassiveName={selectedWeaponPassive?.nameZh}
              weaponPassiveDescription={selectedWeaponPassive?.descZh}
              artifactName={selectedArtifact?.nameZh}
              artifactPieces={equipment?.artifactPieces}
              artifactBonuses={selectedArtifactBonuses}
              artifactStatCount={
                countArtifactPiecesWithStats(equipment?.artifactLoadout)
              }
            />

            {/* Quick Archetype Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                快速套用模板:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("dps")}
                  className="rounded-md border border-red-500/30 bg-red-950/25 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-900/40"
                >
                  主C输出 (2000攻/70暴/140爆)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("subDps")}
                  className="rounded-md border border-sky-500/30 bg-sky-950/25 px-3 py-1 text-xs font-medium text-sky-300 hover:bg-sky-900/40"
                >
                  副C高充能 (1600攻/60暴/120爆/200充)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("em")}
                  className="rounded-md border border-emerald-500/30 bg-emerald-950/25 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-900/40"
                >
                  精通特化 (850精通)
                </button>
                {defaultCharacter && (
                  <button
                    type="button"
                    onClick={() => applyPreset("default")}
                    className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700"
                  >
                    恢复基础预设
                  </button>
                )}
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-surface-border bg-surface-raised/40 p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 font-medium">
                    最终攻击力 (ATK)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    step={10}
                    value={atk}
                    onChange={(e) => setAtk(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium">
                      暴击率 (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={critRatePct}
                      onChange={(e) => setCritRatePct(e.target.value)}
                      className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-amber-300 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium">
                      暴击伤害 (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={400}
                      step={1}
                      value={critDmgPct}
                      onChange={(e) => setCritDmgPct(e.target.value)}
                      className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-amber-300 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium">
                    元素充能效率 (%)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={400}
                    step={1}
                    value={erPct}
                    onChange={(e) => setErPct(e.target.value)}
                    className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-sky-300 focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium">
                      {elementLabel}伤害加成 (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      step={1}
                      value={elemDmgPct}
                      onChange={(e) => setElemDmgPct(e.target.value)}
                      className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium">
                      通用全伤害加成 (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      step={1}
                      value={dmgBonusPct}
                      onChange={(e) => setDmgBonusPct(e.target.value)}
                      className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium">
                    元素精通 (EM)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={2000}
                    step={10}
                    value={em}
                    onChange={(e) => setEm(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-emerald-300 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium">
                      生命值 (生命)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      step={500}
                      value={hp}
                      onChange={(e) => setHp(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-slate-100 focus:border-slate-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-medium">
                      防御力 (防御)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      step={50}
                      value={def}
                      onChange={(e) => setDef(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-slate-100 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 命之座 */}
        {activeTab === "constellation" && (
          <div className="space-y-4">
            {/*
              THE OVERCLAIM GUARD (CHARACTER-DETAIL-046 §15.5a, UI-AUDIT-055 F2).
              Stated BEFORE the selector, because the user must know the
              selection's limits before they make one. Reconciled talent-level
              boosts are connected; every other effect retains the caveat.
            */}
            {!hideConstellationSupportLabel && <div
              className={cn(
                "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
                STATE_CHIP.warning,
              )}
            >
              <span aria-hidden="true" className="mt-0.5">
                {STATE_GLYPH.warning}
              </span>
              <p className="leading-relaxed">
                {constellationsSimulated
                  ? "仅已建模且达到所选命座层数的效果参与计算；其余效果暂不计入。"
                  : "本角色的命之座效果尚未参与计算。层数选择会被保存。"}
              </p>
            </div>}

            {/*
              Seven-segment single-select. `radiogroup` per §15.8: exactly one
              value is active, which `aria-pressed` (a toggle) cannot express —
              it reported up to seven simultaneously-pressed buttons for one
              choice. Roving tabindex keeps the group a single tab stop.
            */}
            <div className="rounded-xl border border-surface-border bg-surface-raised/50 p-4">
              <div
                id={constellationGroupLabelId}
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
              >
                选择命之座层数（当前：<span className="font-mono tabular-nums">{constellation}</span> 命）
              </div>
              <div
                role="radiogroup"
                aria-labelledby={constellationGroupLabelId}
                onKeyDown={handleConstellationKeyDown}
                className="grid grid-cols-4 gap-1.5 sm:grid-cols-7 sm:gap-2"
              >
                {CONSTELLATION_LEVELS.map((c) => {
                  const selected = constellation === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      data-constellation={c}
                      aria-checked={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setConstellation(c)}
                      className={cn(
                        "flex min-h-11 min-w-11 flex-col items-center justify-center rounded-md border py-2 text-xs font-bold",
                        TRANSITION_COLORS,
                        FOCUS_RING,
                        selected
                          ? "border-amber-400 bg-amber-500/25 text-amber-300"
                          : "border-surface-border bg-surface hover:border-slate-500 text-slate-300"
                      )}
                    >
                      <span>{c} 命</span>
                      <span className="text-micro font-normal text-slate-400">
                        {c === 0 ? "初始" : `C${c}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/*
              THE FOUR-ROW TRUTH TABLE (§15.5). Branches on the two axes —
              whether the effect reaches the engine, and whether prose exists —
              INDEPENDENTLY. It must not branch on "does this character have
              hand-authored kit details", which was true for 4 of 132 and
              collapsed all four states into two.
            */}
            {/*
              §15.6's per-character coverage statement, with the DIRECTION of
              error. This is also the one surface that renders this character's
              own `tierReason`: COMPONENTS §7.3 suppresses the per-card reason
              in the roster picker precisely BECAUSE the detail view carries it,
              so removing it here would lose the information rather than
              relocate it. Counts come from the adapter as numeric slots in a
              fixed template — never a sentence assembled from fragments.
            */}
            {!hideConstellationSupportLabel && <div className="rounded-md border border-surface-border bg-surface/60 px-3 py-2 text-xs text-slate-300">
              <p className="leading-relaxed">
                命之座共 {constellationCoverage.total} 项，其中已建模{" "}
                <span className="font-mono tabular-nums">
                  {constellationCoverage.simulated}
                </span>{" "}
                项。
                {constellationCoverage.describedOnly > 0 &&
                  " 未建模效果未计入，结果可能与实际表现不同。"}
              </p>
              {tierReasonDetail !== undefined && (
                <p className="mt-1 leading-relaxed text-slate-400">{tierReasonDetail}</p>
              )}
            </div>}

            {constellationRows.length > 0 ? (
              <ul className="space-y-2.5">
                <li className="rounded-md border border-surface-border bg-surface/80 p-3.5">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-slate-800 px-1.5 py-0.5 text-micro font-mono font-bold text-slate-300">第 0 层</span>
                    <h5 className="text-sm font-semibold text-slate-100">无命之座</h5>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">未激活任何命之座加成；角色按当前天赋等级参与计算。</p>
                </li>
                {constellationRows.map((row) => {
                  const copy = chinesePerkDisplayCopy(row);
                  return (
                    <li
                      key={row.id}
                      className="rounded-md border border-surface-border bg-surface/80 p-3.5"
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-sm bg-slate-800 px-1.5 py-0.5 text-micro font-mono font-bold text-slate-300">
                          第 {row.constellationLevel} 层
                        </span>
                        <h5 className="text-sm font-semibold text-slate-100">
                          {copy.label}
                        </h5>
                        {!hideConstellationSupportLabel && row.kind === "described-only" && (
                          <span
                            className={cn(
                              "rounded-sm border px-1.5 py-0.5 text-micro font-medium",
                              STATE_CHIP.warning,
                            )}
                          >
                            尚未参与计算
                          </span>
                        )}
                        {!hideConstellationSupportLabel && row.kind !== "described-only" && (
                          <span
                            className={cn(
                              "rounded-sm border px-1.5 py-0.5 text-micro font-medium",
                              (row.constellationLevel ?? 0) <= constellation
                                ? STATE_CHIP.success
                                : STATE_CHIP.info,
                            )}
                          >
                            已建模 · {(row.constellationLevel ?? 0) <= constellation ? "已解锁" : "未解锁"}
                          </span>
                        )}
                        {row.kind === "simulated-no-text" && (
                          <span className="text-micro text-slate-400">
                            暂无中文描述文本。
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {copy.description}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <PendingDataNotice
                subject="本角色的命之座数据"
                consequence="其效果未参与本次模拟，实际伤害可能高于此处结果。"
              />
            )}
          </div>
        )}

        {/* TAB 3: 天赋与技能 */}
        {activeTab === "talents" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                战斗天赋倍率
              </h4>

              {/*
                Multipliers come from the kit's per-level tables. Changing a
                level here changes the multipliers shown AND the level saved to
                the team, so what the user reads is what the engine will run.
              */}
              {kit ? (
                <>
                  <AbilityCard
                    ability={kit.normalAttacks.hits[0] ?? kit.skill}
                    nameZh={talentZhForSlot(character.id, "normal")?.nameZh}
                    descriptionZh={talentZhForSlot(character.id, "normal")?.descriptionZh}
                    slotLabel="普通攻击"
                    level={talentNormal}
                    talentBoost={talentBoosts.normal}
                    onLevelChange={setTalentNormal}
                  />
                  <AbilityCard
                    ability={kit.skill}
                    nameZh={talentZhForSlot(character.id, "skill")?.nameZh}
                    descriptionZh={talentZhForSlot(character.id, "skill")?.descriptionZh}
                    slotLabel="元素战技"
                    level={talentSkill}
                    talentBoost={talentBoosts.skill}
                    onLevelChange={setTalentSkill}
                  />
                  <AbilityCard
                    ability={kit.burst}
                    nameZh={talentZhForSlot(character.id, "burst")?.nameZh}
                    descriptionZh={talentZhForSlot(character.id, "burst")?.descriptionZh}
                    slotLabel="元素爆发"
                    level={talentBurst}
                    talentBoost={talentBoosts.burst}
                    onLevelChange={setTalentBurst}
                  />
                </>
              ) : (
                <PendingDataNotice
                  subject="该角色的天赋倍率数据"
                  consequence="该角色暂不可用于模拟，其伤害结果不会被计算。"
                />
              )}
            </div>

            {/* Passive talents: rendered when present, honestly absent otherwise. */}
            <div className="space-y-2.5 border-t border-surface-border pt-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                固有天赋
              </h4>
              {passiveRows.length > 0 ? (
                <div className="space-y-2">
                  {passiveRows.map((row, index) => (
                    <div
                      key={row.id}
                      className="rounded-md border border-surface-border bg-surface/80 p-3"
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-sm border border-state-info-border bg-state-info-bg px-1.5 py-0.5 text-micro font-medium text-state-info-fg">
                          {row.unlockAscension === undefined ? "固有天赋" : `突破 ${row.unlockAscension}`}
                        </span>
                        <h5 className="text-xs font-semibold text-slate-100">固有天赋 {index + 1}</h5>
                        <span className={cn("rounded-sm border px-1.5 py-0.5 text-micro font-medium", row.kind === "described-only" ? STATE_CHIP.warning : STATE_CHIP.success)}>
                          {row.kind === "described-only" ? "尚未参与计算" : "已建模"}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {row.descriptionZh ?? "暂无中文描述文本。"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <PendingDataNotice
                  subject="固有天赋"
                  consequence="其效果未参与本次模拟，实际伤害可能高于此处结果。"
                />
              )}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          <div className="text-xs text-slate-400 font-mono">
            {constellation} 命 · 天赋 {talentNormal}/{talentSkill}/{talentBurst}
          </div>
          <div className="flex items-center gap-3">
            <Button size="md" variant="quiet" onClick={onClose}>
              取消
            </Button>
            <Button size="md" variant="primary" onClick={handleSave}>
              保存并套用配置
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
