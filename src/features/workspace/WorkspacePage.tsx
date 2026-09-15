"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { allCharacters, testEnemy } from "@/game-data";
import { RotationTimeline } from "@/features/rotation-timeline/RotationTimeline";
import { EventDetailPanel } from "@/features/rotation-timeline/EventDetailPanel";
import { DamageBreakdown } from "@/features/damage-breakdown/DamageBreakdown";
import { EnergyPanel } from "@/features/energy/EnergyPanel";
import { TeamBuilder } from "@/features/team-builder/TeamBuilder";
import {
  type Team,
  emptyTeam,
  memberCount,
  members,
  orphanedActionCount,
  referenceCharacterLevel,
  resolveActiveId,
  teamFrom,
} from "@/features/team-builder/teamModel";
import { EnemyConfigurator } from "@/features/setup/EnemyConfigurator";
import { SimulationSettings } from "@/features/setup/SimulationSettings";
import { RotationEditor } from "@/features/setup/RotationEditor";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import { useUrlState } from "@/features/simulation/useUrlState";
import {
  equipmentStorageKey,
  type CharacterEquipmentSelection,
  type EquipmentSelections,
  emptyEquipmentSelections,
  parseSelections,
  pruneSelections,
  serializeSelections,
} from "@/features/team-builder/equipmentSelection";
import {
  findWeapon,
} from "@/game-data/weapons/registry";
import { findArtifact } from "@/game-data/artifacts/registry";
import type { AppView, WorkspaceMode } from "@/features/simulation/urlState";
import { generateRotationInsights } from "@/features/simulation/insightsModel";
import { InsightsPanel } from "@/features/simulation/InsightsPanel";
import {
  createRun,
  isRunStale,
  type RunInputs,
  type SimulationRun,
} from "@/features/simulation/runState";
import { resolveDashboardState } from "@/features/simulation/dashboardState";
import { RotationSearchPanel } from "@/features/optimizer/RotationSearchPanel";
import {
  DEFAULT_SEARCH_DURATION_SECONDS,
  scoreForObjective,
  type OptimizationObjective,
  type SearchBudget,
  type SearchOutcome,
} from "@/features/optimizer/optimizerAdapter";
import {
  createSearchJobRequest,
  createWorkerSearchJob,
  type SearchTransportJob,
} from "@/features/optimizer/searchTransport";
import type { SearchPhase } from "@/features/optimizer/searchPresentation";
import { requestFingerprint } from "@/features/optimizer/searchState";
import {
  NO_ADOPTION,
  adoptCandidate,
  canRestore,
  clearAdoptionOnManualEdit,
  restoreIncumbent,
  type AdoptionState,
} from "@/features/optimizer/incumbentRotation";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { LiveRegion } from "@/components/ui/LiveRegion";
import { cn } from "@/components/ui/cn";
import {
  FOCUS_RING,
  STATE_CHIP,
  STATE_TEXT,
  TRANSITION_COLORS,
} from "@/components/ui/tokens";
import { elementBgClass, fmtNum } from "@/lib/format";
import { MAIN_CONTENT_ID } from "@/components/ui/landmarks";
import { detectResonances } from "@/features/team-builder/resonance";
import {
  toWebsiteCharacter,
} from "@/features/team-builder/rosterModel";
import { mergeRecommendedBuildEquipment } from "@/features/team-builder/recommendedBuildSelection";
import type {
  CharacterDefinition,
  Element,
  EnemyState,
  Rotation,
  SimulationConfig,
} from "@/types";
import {
  charNameZh,
  elementZh,
  enemyNameZh,
  resonanceNameZh,
  resonanceShortDescZh,
  resonanceFullDescZh,
} from "@/lib/i18n";
import { loadWorkspaceImportContext, parseWorkspaceDraft, saveWorkspaceImportContext, serializeWorkspaceDraft, workspaceDraftKey } from "@/features/simulation/workspacePersistence";
import { EnkaImportDialog } from "@/features/enka-import/EnkaImportDialog";
import type { EnkaCommit } from "@/features/enka-import/contracts";
import { WorkspaceNavigation, type WorkspaceTarget } from "./WorkspaceNavigation";
import styles from "./workspace.module.css";

// ---------------------------------------------------------------------------
// Main page orchestration: holds team, enemy, rotation, and simulation config.
// Consumes the simulation engine through simulationAdapter. No combat math here.
// ---------------------------------------------------------------------------

const EMPTY_TEAM_REASON = "请至少配置 1 位出战角色以进行战斗模拟。";
const EMPTY_ROTATION_REASON = "请在动作时序流中添加至少 1 个动作。";
const STALE_RESULT_NOTICE =
  "配置参数已发生变化 — 下方结果仍对应执行模拟时的配置，请重新执行模拟以更新测算数据。";
const STALE_RESULT_ANNOUNCEMENT =
  "配置已变更，下方结果对应的是变更前的配置。";
const SEARCH_BLOCKED_REASON = "请至少配置 1 位出战角色以搜索循环。";

/**
 * The team cards show a starter weapon for every character. Keep that visible
 * default in the simulation state too, so the first panel and first run use
 * the same build instead of displaying a weapon the engine never receives.
 */
function defaultEquipmentForTeam(team: Team): EquipmentSelections {
  let selections = emptyEquipmentSelections();
  for (const character of team) {
    if (character === null) continue;
    selections = mergeRecommendedBuildEquipment(selections, character);
  }
  return selections;
}

function mergeDefaultEquipment(
  team: Team,
  selections: EquipmentSelections,
): EquipmentSelections {
  let next = selections;
  for (const character of team) {
    if (character === null) continue;
    next = mergeRecommendedBuildEquipment(next, character);
  }
  return next;
}

function equipmentWithImportedOverrides(
  team: Team,
  imported: EquipmentSelections,
): EquipmentSelections {
  const merged: Record<string, CharacterEquipmentSelection> = {
    ...defaultEquipmentForTeam(team),
  };
  for (const [characterId, selection] of Object.entries(imported)) {
    if (!team.some((character) => character?.id === characterId)) continue;
    merged[characterId] = { ...merged[characterId], ...selection };
  }
  return merged;
}

/** Accessible name for the segmented control that scopes the single page. */
const VIEW_SWITCHER_LABEL = "工作区视图";

/**
 * The three scopes of the single-page workspace, in visual order.
 *
 * This product is ONE page: these switch which regions of it are shown, and
 * the choice is mirrored into `?view=` so a scope stays shareable.
 */
const VIEW_OPTIONS: readonly { view: AppView; label: string }[] = [
  { view: "all", label: "全部总览" },
  { view: "setup", label: "战术配置" },
  { view: "results", label: "数据看板" },
];

export default function WorkspacePage() {
  // The displayed result is stored as a RUN — a result permanently bound to the
  // inputs that produced it (`runState.ts`). Every result region below reads
  // `run.inputs`, never the live editor state, so editing the team cannot
  // relabel numbers that were computed for a different team (UX-005).
  const [run, setRun] = useState<SimulationRun | null>(null);

  const roster = useMemo(
    () => allCharacters.map(toWebsiteCharacter),
    [],
  );
  // A new workspace has no implicit combat state. Saved state, a URL deep
  // link, Enka import, or an explicit preset are the only paths that populate
  // the team.
  const [team, setTeam] = useState<Team>(() => emptyTeam());
  const initialTeamRef = useRef(team);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [enkaOpen, setEnkaOpen] = useState(false);
  const [enkaRoster, setEnkaRoster] = useState<readonly CharacterDefinition[] | null>(null);
  const selectableRoster = enkaRoster ?? roster;

  // Simulation & Setup state
  const [enemy, setEnemy] = useState<EnemyState>(testEnemy);
  // Keep the first workspace coherent with its empty team: an authored
  // rotation without its characters would otherwise be an orphaned sequence.
  const [rotation, setRotation] = useState<Rotation>([]);
  const [simConfig, setSimConfig] = useState<Partial<SimulationConfig>>({
    critMode: "expected",
    swapCost: 0.6,
  });

  const [announcement, setAnnouncement] = useState("");
  // Rotation search state. `adoption` preserves the hand-authored rotation so
  // adopting a suggestion is always reversible (`incumbentRotation.ts`).
  const [searchPhase, setSearchPhase] = useState<SearchPhase>("idle");
  const [searchBudget, setSearchBudget] = useState<SearchBudget>("balanced");
  const [searchObjective, setSearchObjective] =
    useState<OptimizationObjective>("total-damage");
  const [searchDuration, setSearchDuration] = useState(
    DEFAULT_SEARCH_DURATION_SECONDS,
  );
  const [searchOutcome, setSearchOutcome] = useState<SearchOutcome | null>(null);
  const [searchRequestSummary, setSearchRequestSummary] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [searchRequestFingerprint, setSearchRequestFingerprint] = useState<string | null>(null);
  const searchRunIdRef = useRef(0);
  const searchJobRef = useRef<SearchTransportJob | null>(null);
  const [adoption, setAdoption] = useState<AdoptionState>(NO_ADOPTION);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);
  /**
   * The team's equipment choices.
   *
   * Owned HERE and not by `TeamBuilder`, because this is the component that
   * calls `runSimulation`. While the choices lived inside the builder nothing
   * could hand them to the adapter, so weapon passives and artifact set
   * bonuses — both fully implemented and tested on the engine side — reached
   * the engine for no build the user could construct.
   */
  const [equipment, setEquipment] = useState<EquipmentSelections>(() =>
    defaultEquipmentForTeam(team),
  );
  // Team and view live in the URL so a configuration is shareable and
  // bookmarkable, and Back/Forward moves between configurations.
  const { state: urlState, push: pushUrlState, hydrated: urlHydrated } = useUrlState();
  const view: AppView = urlState.view;
  const mode: WorkspaceMode = urlState.mode;
  const [readyMode, setReadyMode] = useState<WorkspaceMode | null>(null);
  const [redirectingToEntry, setRedirectingToEntry] = useState(false);
  const navigationTargetRef = useRef<WorkspaceTarget | null>(null);

  useEffect(() => {
    if (!urlHydrated) return;
    setRedirectingToEntry(false);
    setReadyMode(null);
    try {
      const context = mode === "uid" ? loadWorkspaceImportContext(window.sessionStorage, mode) : null;
      if (mode === "uid" && context === null) {
        setRedirectingToEntry(true);
        window.location.replace("/");
        return;
      }
      if (context !== null) {
        setEnkaRoster(context.availableCharacters);
      }
      const raw = window.sessionStorage.getItem(workspaceDraftKey(mode));
      const saved = raw === null ? null : parseWorkspaceDraft(raw);
      const allowedRoster = context?.availableCharacters ?? roster;
      const restoredTeam = saved !== null
        ? saved.team.map((savedCharacter) => {
            if (savedCharacter === null) return null;
            const source = allowedRoster.find((candidate) => candidate.id === savedCharacter.id);
            return source === undefined ? null : { ...source, ...savedCharacter };
          })
        : context !== null ? teamFrom(context.characters) : initialTeamRef.current;
      setTeam(restoredTeam);
      if (saved !== null) {
        setEnemy(saved.enemy);
        setRotation(saved.rotation);
        setSimConfig(saved.simConfig);
        setSearchBudget(saved.searchBudget as SearchBudget);
        setSearchObjective(saved.searchObjective as OptimizationObjective);
        setSearchDuration(saved.searchDuration);
      }
      // Restored from its own key rather than the workspace draft: equipment
      // is optional state whose absence must never invalidate a saved team.
      const parsedEquipment = parseSelections(
        window.sessionStorage.getItem(equipmentStorageKey(mode)),
        (id) => findWeapon(id) !== undefined,
        (id) => findArtifact(id) !== undefined,
      );
      setEquipment(
        equipmentWithImportedOverrides(
          restoredTeam,
          { ...context?.equipment, ...parsedEquipment },
        ),
      );
      setReadyMode(mode);
    } finally {
      setDraftHydrated(true);
    }
  // Hydrate once per roster load. Team changes after hydration are handled by
  // `handleTeamChange` and the URL adoption effect, so this effect must not
  // re-read storage and overwrite a fresh in-memory edit.
  }, [roster, mode, urlHydrated]);
  useEffect(() => {
    if (!draftHydrated || readyMode !== mode) return;
    window.sessionStorage.setItem(workspaceDraftKey(mode), serializeWorkspaceDraft({ team, enemy, rotation, simConfig, searchBudget, searchObjective, searchDuration }));
  }, [draftHydrated, mode, readyMode, team, enemy, rotation, simConfig, searchBudget, searchObjective, searchDuration]);
  useEffect(() => {
    if (!draftHydrated || readyMode !== mode) return;
    window.sessionStorage.setItem(
      equipmentStorageKey(mode),
      serializeSelections(equipment),
    );
  }, [draftHydrated, equipment, mode, readyMode]);

  const setView = useCallback(
    (nextView: AppView) => {
      pushUrlState({ ...urlState, view: nextView });
    },
    [urlState, pushUrlState],
  );

  const handleWorkspaceNavigate = useCallback(
    (target: WorkspaceTarget) => {
      navigationTargetRef.current = target;
      const targetView: AppView = target === "results" ? "results" : "setup";
      const targetIsVisible = view === targetView || (view === "all" && (target !== "results" || run !== null));
      if (targetIsVisible) {
        // Let the browser perform the same operation after React has committed
        // when a view is already visible. This avoids jumping to a stale node.
        requestAnimationFrame(() => {
          const id = target === "results"
            ? "result-heading"
            : target === "environment" ? "setup-heading" : `${target}-heading`;
          const heading = document.getElementById(id);
          if (!heading) {
            navigationTargetRef.current = null;
            return;
          }
          if (typeof heading.scrollIntoView === "function") {
            heading.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "start",
            });
          }
          heading.focus({ preventScroll: true });
          navigationTargetRef.current = null;
        });
      } else {
        setView(targetView);
      }
    },
    [run, setView, view],
  );

  useEffect(() => {
    const target = navigationTargetRef.current;
    if (target === null) return;
    const targetView: AppView = target === "results" ? "results" : "setup";
    if (view !== targetView && view !== "all") return;
    const frame = requestAnimationFrame(() => {
      const id = target === "results"
        ? "result-heading"
        : target === "environment" ? "setup-heading" : `${target}-heading`;
      const heading = document.getElementById(id);
      if (!heading) {
        navigationTargetRef.current = null;
        return;
      }
      if (typeof heading.scrollIntoView === "function") {
        heading.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      }
      heading.focus({ preventScroll: true });
      navigationTargetRef.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [view, run]);

  // Adopt the team encoded in the URL. Runs on first load and on Back/Forward
  // (both surface as a new `urlState`). Ids that no longer exist in the active
  // roster resolve to an empty slot rather than bypassing the Enka character
  // lock through a manually edited URL.
  useEffect(() => {
    if (!urlHydrated) return;
    const encoded = urlState.team;
    if (encoded.every((id) => id === null)) return;
    setTeam((current) => {
      const next = encoded.map((id, index) =>
        id === null
          ? null
          : (() => {
              const character = selectableRoster.find((candidate) => candidate.id === id);
              return character === undefined
                ? null
                : { ...character, ...(current[index]?.id === id ? current[index] : {}) };
            })(),
      );
      const sameAsCurrent =
        next.length === current.length &&
        next.every((c, i) => (c?.id ?? null) === (current[i]?.id ?? null));
      return sameAsCurrent ? current : next;
    });
  }, [urlState.team, urlHydrated, selectableRoster]);

  // URL navigation and quick presets can introduce characters without going
  // through the picker. Add starter weapons for those members after the team
  // state settles, while preserving every explicit selection already present.
  useEffect(() => {
    if (!draftHydrated || !urlHydrated) return;
    setEquipment((current) =>
      mergeDefaultEquipment(
        team,
        pruneSelections(
          current,
          team.filter((c): c is CharacterDefinition => c !== null).map((c) => c.id),
        ),
      ),
    );
  }, [draftHydrated, team, urlHydrated]);

  const teamMembers = useMemo(() => members(team), [team]);
  const count = memberCount(team);
  const resonances = useMemo(() => detectResonances(team), [team]);

  // The inputs a run would be made from right now.
  // `equipment` is included because `handleSimulate` runs WITH it: an input the
  // run carries but the live comparison omits makes every fresh result report
  // itself stale, and an input the run omits but the engine reads makes a
  // changed build report itself current. Both are the same defect from
  // opposite sides, so the two objects are built from one list of inputs.
  const liveInputs: RunInputs = useMemo(
    () => ({ team: teamMembers, rotation, enemy, config: simConfig, equipment }),
    [teamMembers, rotation, enemy, simConfig, equipment],
  );

  // Staleness is DERIVED by comparing fingerprints, not stored as a flag that
  // every edit handler must remember to set. A comparison cannot be forgotten
  // when a new input control is added.
  const resultStale = useMemo(
    () => isRunStale(run, liveInputs),
    [run, liveInputs],
  );

  // `resolveDashboardState` already encoded this branch table and was fully
  // tested, but nothing rendered it — the page reimplemented the logic inline.
  // Wiring it here removes the duplicate rather than adding a third copy.
  const dashboard = useMemo(
    () =>
      resolveDashboardState({
        memberCount: count,
        rotationLength: rotation.length,
        hasResult: run !== null,
        resultStale,
      }),
    [count, rotation.length, run, resultStale],
  );
  const canSimulate = dashboard.canSimulate;

  const orphaned = useMemo(
    () => orphanedActionCount(team, rotation.map((a) => a.characterId)),
    [team, rotation],
  );

  const resolvedActiveId = resolveActiveId(team, activeCharacterId);

  const elementalShares = useMemo(() => {
    if (!run || run.result.totalDamage <= 0) return [];
    const total = run.result.totalDamage;
    return Object.entries(run.result.damageByElement)
      .map(([element, damage]) => ({
        element,
        damage,
        pct: damage / total,
      }))
      .filter((e) => e.damage > 0)
      .sort((a, b) => b.damage - a.damage);
  }, [run]);

  const charactersById = useMemo(() => {
    const map = new Map<string, CharacterDefinition>();
    for (const c of roster) {
      map.set(c.id, c);
    }
    return map;
  }, [roster]);

  // Insights describe the RUN, so they are generated from the run's own team.
  // Reading the live team here would attribute an old rotation's findings to a
  // team that never produced them.
  const insights = useMemo(() => {
    if (!run) return [];
    return generateRotationInsights(run.result, run.inputs.team);
  }, [run]);

  // Edit handlers no longer flag staleness; `resultStale` is derived. They only
  // update inputs, which keeps each one a single obvious responsibility.
  const handleTeamChange = useCallback(
    (nextTeam: Team) => {
      const allowedIds = new Set(selectableRoster.map((character) => character.id));
      const restrictedTeam = nextTeam.map((character) =>
        character === null || allowedIds.has(character.id) ? character : null,
      );
      setTeam(restrictedTeam);
      // Selections are keyed by character id, so a removed character's gear
      // would otherwise persist invisibly and reappear on re-add. Pruned on
      // team change rather than on render, which would fight the picker.
      setEquipment((current) =>
        mergeDefaultEquipment(
          restrictedTeam,
          pruneSelections(
            current,
            restrictedTeam.filter((c): c is CharacterDefinition => c !== null).map((c) => c.id),
          ),
        ),
      );
      pushUrlState({
        ...urlState,
        team: restrictedTeam.map((c) => c?.id ?? null),
      });
    },
    [urlState, pushUrlState, selectableRoster],
  );

  const handleEnkaCommit = useCallback((commit: EnkaCommit) => {
    const nextTeam: Team = [...commit.characters.slice(0, 4), null, null, null, null].slice(0, 4);
    setEnkaRoster(commit.availableCharacters);
    setTeam(nextTeam);
    // Enka currently exposes more weapon/artifact ids than this local catalog
    // can safely join. Preserve imported selections, then fill any gaps with
    // the same recommended baseline used for ordinary team additions. Start
    // from the baseline so a future mapped weapon does not suppress its
    // character's recommended artifact loadout.
    setEquipment(equipmentWithImportedOverrides(nextTeam, commit.equipment));
    setActiveCharacterId(commit.characters[0]?.id ?? null);
    setRotation([]);
    setRun(null);
    setSearchOutcome(null);
    setSearchRequestSummary(null);
    setSearchRequestFingerprint(null);
    setSelectedCandidateId(null);
    setAdoption(NO_ADOPTION);
    saveWorkspaceImportContext(window.sessionStorage, "uid", commit);
    pushUrlState({ ...urlState, mode: "uid", team: nextTeam.map((character) => character?.id ?? null) });
    setAnnouncement(`已导入 ${commit.characters.length} 位角色，装备已替换。`);
  }, [pushUrlState, urlState]);

  const handleEnemyChange = useCallback((nextEnemy: EnemyState) => {
    setEnemy(nextEnemy);
  }, []);

  const handleRotationChange = useCallback((nextRotation: Rotation) => {
    setRotation(nextRotation);
    // A hand edit means the editor no longer holds the adopted candidate, so
    // the restore offer must go — restoring would overwrite the fresh edit.
    setAdoption(clearAdoptionOnManualEdit());
  }, []);

  const handleConfigChange = useCallback(
    (nextConfig: Partial<SimulationConfig>) => {
      setSimConfig(nextConfig);
    },
    [],
  );

  // Announce staleness when it appears, rather than from inside each edit
  // handler. One effect replaces four scattered announcement call sites.
  useEffect(() => {
    if (resultStale) setAnnouncement(STALE_RESULT_ANNOUNCEMENT);
  }, [resultStale]);

  const handleSimulate = useCallback(() => {
    if (!canSimulate) return;
    const inputs: RunInputs = {
      team: teamMembers,
      rotation,
      enemy,
      config: simConfig,
      equipment,
    };
    const output = runSimulation(inputs);
    setRun(createRun(inputs, output.result, output.swapCostIsDefault));
    setSelectedEventIndex(null);
    setAnnouncement(
      `模拟计算完成。总伤害 ${fmtNum(output.result.totalDamage)}，循环总耗时 ` +
        `${output.result.duration.toFixed(2)} 秒。`,
    );
  }, [canSimulate, teamMembers, rotation, enemy, simConfig, equipment]);

  // --- Rotation search -----------------------------------------------------

  const searchBlockedReason = count > 0 ? null : SEARCH_BLOCKED_REASON;
  const liveSearchFingerprint = useMemo(
    () => requestFingerprint({ team: teamMembers, enemy, objective: searchObjective, duration: searchDuration, budget: searchBudget, config: simConfig }),
    [teamMembers, enemy, searchObjective, searchDuration, searchBudget, simConfig],
  );

  const handleSearch = useCallback(() => {
    if (searchBlockedReason !== null) return;
    const runId = ++searchRunIdRef.current;
    setSearchRequestFingerprint(liveSearchFingerprint);
    setSearchRequestSummary(
      `当前阵容与配置 · ${enemyNameZh(enemy.name)} · ${searchObjective === "dps" ? "秒伤 (DPS)" : "总伤害"} · ${searchDuration}秒 · ${searchBudget === "fast" ? "快速" : searchBudget === "thorough" ? "深入" : "均衡"}`,
    );
    setSelectedCandidateId(null);
    setSearchPhase("queued");
    const job = createWorkerSearchJob(createSearchJobRequest(`search-${runId}`, {
        team: teamMembers,
        enemy,
        budget: searchBudget,
        objective: searchObjective,
        durationSeconds: searchDuration,
        config: simConfig,
      }))
    searchJobRef.current = job;
    void job.run((event) => {
      if (runId === searchRunIdRef.current && event.type === "started") setSearchPhase("searching");
    }).then((response) => {
      if (runId !== searchRunIdRef.current) return;
      searchJobRef.current = null;
      if (response.kind === "canceled") {
        setSearchPhase("canceled");
        setAnnouncement("搜索已取消。当前配置和已有结果均已保留。");
      } else if (response.kind === "failed") {
        setSearchPhase("failed");
        setAnnouncement("搜索未完成。");
      } else {
        setSearchOutcome(response.outcome);
        setSearchPhase(response.outcome.candidates.length > 0 ? "results" : "empty");
        setAnnouncement(response.outcome.candidates.length > 0 ? `循环搜索完成，找到 ${response.outcome.candidates.length} 个候选循环。` : "循环搜索完成，未找到候选循环。");
      }
    });
  }, [
    searchBlockedReason,
    teamMembers,
    enemy,
    searchBudget,
    searchObjective,
    searchDuration,
    simConfig,
    liveSearchFingerprint,
  ]);

  const handleCancelSearch = useCallback(() => {
    if (searchJobRef.current === null) return;
    setSearchPhase("canceling");
    searchJobRef.current.cancel();
  }, []);

  const handleSelectCandidate = useCallback((candidateId: string) => {
    setSelectedCandidateId((current) => current === candidateId ? null : candidateId);
  }, []);

  const handleAdopt = useCallback(
    (candidate: Rotation, rank: number) => {
      const transition = adoptCandidate(rotation, candidate, rank, adoption);
      setRotation(transition.rotation);
      setAdoption(transition.adoption);
      setAnnouncement(`已将候选循环 #${rank} 复制到动作时序编辑器，原循环已保留。`);
    },
    [rotation, adoption],
  );

  const handleRestoreIncumbent = useCallback(() => {
    const transition = restoreIncumbent(adoption);
    if (transition === null) return;
    setRotation(transition.rotation);
    setAdoption(transition.adoption);
    setAnnouncement("已还原为搜索前的原循环。");
  }, [adoption]);

  // The user's own rotation is the baseline a candidate is compared against.
  // Only a FRESH run qualifies: a stale run describes different inputs, so
  // presenting it as the baseline would compare against the wrong rotation.
  const baselineScore = useMemo(() => {
    if (run === null || resultStale) return null;
    return scoreForObjective(run.result, searchObjective);
  }, [run, resultStale, searchObjective]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to trigger simulation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSimulate();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSimulate]);

  // Copy rotation summary to clipboard.
  //
  // Every field comes from `run.inputs`, never from live state. This function
  // was the clearest instance of the UX-005 defect: it read the live enemy,
  // live team and live rotation length, so copying a summary after editing the
  // team produced a report whose header described one team and whose damage
  // numbers came from another.
  function handleCopySummary() {
    if (!run) return;
    const { result, inputs } = run;
    const summaryText = [
      `=== 原神战斗循环模拟器 测算报告 ===`,
      `出战阵容: ${inputs.team.map((c) => `${charNameZh(c.name)} (${elementZh(c.element)})`).join(", ")}`,
      `目标敌人: ${enemyNameZh(inputs.enemy.name)} (Lv ${inputs.enemy.level}, 基础全抗性 ${((inputs.enemy.resistances.pyro ?? 0.1) * 100).toFixed(0)}%)`,
      `总伤害: ${fmtNum(result.totalDamage)}`,
      `秒伤 (DPS): ${fmtNum(result.dps)}`,
      `循环耗时: ${result.duration.toFixed(2)} 秒`,
      `平均切人耗时: ${result.effectiveSwapCost.toFixed(2)} 秒`,
      `执行动作数: ${inputs.rotation.length} 步`,
      result.warnings.length > 0 ? `模拟提示: ${result.warnings.join("; ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  }

  const showSetup = view === "all" || view === "setup";
  const showResults = view === "all" || view === "results";

  if (!urlHydrated || readyMode !== mode || redirectingToEntry) {
    return <main id={MAIN_CONTENT_ID} className="mx-auto max-w-7xl px-4 py-10" aria-busy="true" />;
  }

  return (
    <main id={MAIN_CONTENT_ID} className={styles.page}>
      <header className={styles.topbar}>
        <span className={styles.brand}>GENSHIN // ROTATION LAB</span>
        <span className={styles.mode}>{mode === "uid" ? "UID 导入" : "自由实验"}</span>
        <div className="flex gap-2">
          {mode === "uid" ? (
            <Button variant="secondary" size="sm" onClick={() => setEnkaOpen(true)}>更换 UID</Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEnkaOpen(true)}>从 UID 导入</Button>
          )}
          <Button variant="quiet" size="sm" onClick={() => {
            if (!window.confirm(mode === "uid" ? "重置并退出 UID 工作区？" : "重置自由实验工作区？")) return;
            window.sessionStorage.removeItem(workspaceDraftKey(mode));
            window.sessionStorage.removeItem(equipmentStorageKey(mode));
            if (mode === "uid") window.sessionStorage.removeItem("genshin-workspace-context-v1:uid");
            if (mode === "uid") window.location.replace("/");
            else window.location.reload();
          }}>{mode === "uid" ? "重置并退出" : "重置工作区"}</Button>
        </div>
      </header>

      <div className={styles.shell}>
        <WorkspaceNavigation
          activeView={view}
          hasResults={run !== null}
          onNavigate={handleWorkspaceNavigate}
        />
        <div className={styles.content}>
          <div className={styles.hero}>
            <div>
              <p className={styles.eyebrow}>COMBAT // ROTATION OPTIMIZER</p>
              <h1 className={styles.title}>原神战斗循环模拟器</h1>
              <p className={styles.subtitle}>配置队伍、敌人与动作时序，再用确定性模型复盘一轮真实执行结果。</p>
            </div>
          </div>

        {/* Compact telemetry rail: readable status cells instead of a floating card stack. */}
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <p className={styles.metricLabel}>TEAM / MEMBERS</p>
            <p className={styles.metricValue}><strong>{count}/4</strong> 角色</p>
          </div>
          <div className={styles.metric}>
            <p className={styles.metricLabel}>TARGET / LEVEL</p>
            <p className={styles.metricValue}>{enemyNameZh(enemy.name)} <span className="font-mono text-xs font-normal text-slate-400">Lv.{enemy.level}</span></p>
          </div>
          <div className={styles.metric}>
            <p className={styles.metricLabel}>ROTATION / ACTIONS</p>
            <p className={styles.metricValue}><strong>{rotation.length}</strong> 步</p>
          </div>
          <div className={styles.metric}>
            <p className={styles.metricLabel}>RESONANCE</p>
            {resonances.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {resonances.map((r) => (
                  <span
                    key={r.id}
                    className="rounded-sm border border-amber-500/30 bg-amber-500/5 px-1.5 py-0.5 text-micro font-medium text-amber-300"
                    title={resonanceFullDescZh(r.name) || r.fullDesc}
                  >
                    {resonanceNameZh(r.name)}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.metricValue}>未激活</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-l-2 border-cyan-300/60 bg-surface-raised/70 px-3 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-micro text-slate-500">
            <span className="font-mono text-cyan-300/70">STATUS</span>
            <span aria-hidden="true">·</span>
            <span>{canSimulate ? "配置就绪" : "等待配置"}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{resonances.length > 0 ? resonanceShortDescZh(resonances[0]!.name) || resonances[0]!.shortDesc : "可开始编辑战斗环境"}</span>
          </div>
          {/* The scope switch is stateful navigation, but visually it reads as a compact console tab bar. */}
          <div role="group" aria-label={VIEW_SWITCHER_LABEL} className="inline-flex border border-surface-border bg-surface text-xs">
            {VIEW_OPTIONS.map((option) => {
              const selected = view === option.view;
              return (
                <button
                  key={option.view}
                  type="button"
                  onClick={() => setView(option.view)}
                  aria-pressed={selected}
                  className={cn(
                    "border-l border-surface-border px-3 py-1.5 font-mono font-semibold first:border-l-0",
                    TRANSITION_COLORS,
                    FOCUS_RING,
                    selected
                      ? "border-b-2 border-b-cyan-300 bg-cyan-300/10 text-cyan-100"
                      : "text-slate-500 hover:bg-fuchsia-300/5 hover:text-fuchsia-100",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

      {/* The primary action starts in the first viewport and remains reachable while editing. */}
      <div className={styles.runBar}>
        <div className="flex items-center gap-4">
          <Button
            size="md"
            variant="primary"
            onClick={handleSimulate}
            disabled={!canSimulate}
            className="min-w-44 tracking-wide"
          >
            执行循环模拟
          </Button>
          <div className="hidden items-center gap-1.5 font-mono text-xs text-slate-500 sm:flex">
            <kbd className="rounded border border-surface-border bg-surface px-1.5 py-0.5 font-mono text-slate-300">⌘</kbd>
            <span>+</span>
            <kbd className="rounded border border-surface-border bg-surface px-1.5 py-0.5 font-mono text-slate-300">↵</kbd>
            <span>快捷执行</span>
          </div>
        </div>
        <div className={styles.runMessage}>
          {!canSimulate
            ? (count === 0 ? EMPTY_TEAM_REASON : EMPTY_ROTATION_REASON)
            : "就绪 · 点击运行模拟获取伤害与充能数据"}
        </div>
      </div>

      {/* 1. Team Builder Section */}
      {showSetup && (
        <>
          <Section
            title="队伍阵容配置"
            id="team-heading"
            actions={!enkaOpen ? <Button variant="secondary" size="sm" onClick={() => setEnkaOpen(true)}>打开 Enka 导入</Button> : undefined}
          >
            <EnkaImportDialog open={enkaOpen} onClose={() => setEnkaOpen(false)} onCommit={handleEnkaCommit} />
            <TeamBuilder
              roster={selectableRoster}
              team={team}
              onTeamChange={handleTeamChange}
              activeCharacterId={resolvedActiveId}
              onSetActive={setActiveCharacterId}
              // Only a FRESH run may annotate the live team's slots. The
              // builder maps per-character damage shares onto the team it is
              // rendering; feeding it a stale run would attribute one team's
              // damage to another team's portraits.
              result={resultStale ? null : (run?.result ?? null)}
              orphanedActionCount={orphaned}
              equipment={equipment}
              onEquipmentChange={setEquipment}
            />
          </Section>
          {/* 2. Setup Section: Configurable Enemy, Sim Settings & Rotation Editor */}
          <Section title="战斗环境与动作时序编排" id="setup-heading">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Target Enemy & Sim Parameters */}
              <div className="flex flex-col gap-6 lg:col-span-4">
                <EnemyConfigurator
                enemy={enemy}
                onChange={handleEnemyChange}
                referenceLevel={referenceCharacterLevel(team)}
              />
                <SimulationSettings config={simConfig} onChange={handleConfigChange} />
              </div>

              {/* Right Column: Interactive Rotation Sequencer */}
              <div className="lg:col-span-8">
                <RotationEditor
                  rotation={rotation}
                  onRotationChange={handleRotationChange}
                  team={team}
                />
              </div>
            </div>
          </Section>

          {/* 2b. Rotation search: bounded budgets, Top-N suggestions, adopt. */}
          <Section title="循环搜索" id="search-heading">
            <RotationSearchPanel
              phase={searchPhase}
              budget={searchBudget}
              objective={searchObjective}
              durationSeconds={searchDuration}
              outcome={searchOutcome}
              baselineScore={baselineScore}
              blockedReason={searchBlockedReason}
              canRestore={canRestore(adoption)}
              adoptedRank={adoption.adoptedRank}
              selectedCandidateId={selectedCandidateId}
              requestSummary={searchRequestSummary}
              draftChanged={searchRequestFingerprint !== null && searchRequestFingerprint !== liveSearchFingerprint}
              team={teamMembers}
              onBudgetChange={setSearchBudget}
              onObjectiveChange={setSearchObjective}
              onDurationChange={setSearchDuration}
              onSearch={handleSearch}
              onCancel={handleCancelSearch}
              onAdopt={handleAdopt}
              onSelectCandidate={handleSelectCandidate}
              onRestore={handleRestoreIncumbent}
            />
          </Section>
        </>
      )}

      <LiveRegion message={announcement} />

      {/* Stale Result Banner */}
      {resultStale && (
        <Section title="测算状态提示" id="stale-heading">
          <div className={cn("flex flex-wrap items-center justify-between gap-2 rounded-sm border p-4 text-sm", STATE_CHIP.info)}>
            <div className="flex items-center gap-2 font-mono">
              <span>{STALE_RESULT_NOTICE}</span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleSimulate} disabled={!canSimulate}>
              重新执行战斗模拟
            </Button>
          </div>
        </Section>
      )}

      {/* 4. Results Section */}
      {showResults && run === null && view === "results" && (
        <section aria-labelledby="result-heading" className={styles.empty}>
          <h2 id="result-heading" tabIndex={-1} className={styles.emptyTitle}>
            尚未生成模拟结果
          </h2>
          <p className={styles.emptyText}>
            请点击上方「执行循环模拟」按钮以生成实战数据看板、能量分析与战术洞察。
          </p>
        </section>
      )}

      {showResults && run !== null && (
        <>
          <Section
            title="核心输出数据看板"
            id="result-heading"
          >
            <div className="space-y-6">
              {/* Primary Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  label="总伤害"
                  value={fmtNum(run.result.totalDamage)}
                  description="循环中所有技能造成的伤害总和"
                />
                <Stat
                  label="秒伤 (DPS)"
                  value={fmtNum(run.result.dps)}
                  description="循环总耗时内的平均每秒伤害"
                />
                <Stat
                  label="循环总耗时"
                  value={`${run.result.duration.toFixed(2)} 秒`}
                  description="涵盖技能施法前摇、后摇与切人耗时"
                />
                <Stat
                  label="切人后摇耗时"
                  value={`${run.result.effectiveSwapCost.toFixed(2)} 秒 / 次`}
                  description={
                    run.swapCostIsDefault
                      ? "本次模拟采用引擎默认切人耗时"
                      : "本次模拟采用自定义切人延迟参数"
                  }
                />
              </div>

              {/* Elemental Damage Distribution Bar */}
              {elementalShares.length > 0 && (
                <div className="border border-surface-border/80 bg-surface-raised/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">元素伤害分布:</span>
                    <span className="font-mono text-xs text-slate-400">
                      {elementalShares.map((e) => `${elementZh(e.element)} ${(e.pct * 100).toFixed(1)}%`).join(" · ")}
                    </span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-sm bg-surface-raised ring-1 ring-surface-border">
                    {elementalShares.map((e) => (
                      <div
                        key={e.element}
                        className={cn(
                          "h-full transition-[width] duration-150",
                          elementBgClass(e.element as Element),
                        )}
                        style={{ width: `${e.pct * 100}%` }}
                        title={`${elementZh(e.element)}: ${fmtNum(e.damage)} (${(e.pct * 100).toFixed(1)}%)`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Real Tactical Insights Panel */}
              <InsightsPanel insights={insights} />

              {/* Utility action: Copy summary */}
              <div className="flex items-center justify-end">
                <Button size="sm" variant="quiet" onClick={handleCopySummary} className="font-mono text-micro">
                  {copiedSummary ? "测算摘要已复制到剪贴板" : "复制循环摘要"}
                </Button>
              </div>

              {/* Warnings & Errors */}
              {run.result.warnings.length > 0 && (
                <div className="rounded-sm border border-state-warning-border bg-state-warning-bg p-3 font-mono">
                  <div className="mb-1 text-xs font-semibold text-state-warning-fg">
                    模拟提示 ({run.result.warnings.length})
                  </div>
                  <ul className="space-y-1 text-xs">
                    {run.result.warnings.map((w, i) => (
                      <li key={i} className={STATE_TEXT.warning}>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {run.result.errors.length > 0 && (
                <div className="rounded-sm border border-state-error-border bg-state-error-bg p-3 font-mono" role="alert">
                  <div className="mb-1 text-xs font-semibold text-state-error-fg">
                    模拟错误 ({run.result.errors.length})
                  </div>
                  <ul className="space-y-1 text-xs">
                    {run.result.errors.map((e, i) => (
                      <li key={i} className={STATE_TEXT.error}>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>

          {/* 5. Energy Kinetics Section */}
          <Section title="能量微粒流转" id="energy-heading">
            <EnergyPanel
              team={run.inputs.team}
              timeline={run.result.timeline}
              finalState={run.result.finalState}
              selectedEventIndex={selectedEventIndex}
              onSelectEvent={setSelectedEventIndex}
            />
          </Section>

          {/* 6. Timeline & Event Detail Panel */}
          <Section title="动作时序与换人节奏" id="timeline-heading">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <RotationTimeline
                timeline={run.result.timeline}
                duration={run.result.duration}
                team={run.inputs.team}
                warnings={run.result.structuredWarnings}
                effectiveSwapCost={run.result.effectiveSwapCost}
                swapCostIsDefault={run.swapCostIsDefault}
                selectedEventIndex={selectedEventIndex}
                onSelectEvent={setSelectedEventIndex}
              />
              <EventDetailPanel
                event={
                  selectedEventIndex === null
                    ? null
                    : (run.result.timeline[selectedEventIndex] ?? null)
                }
                charactersById={charactersById}
                totalDamage={run.result.totalDamage}
              />
            </div>
          </Section>

          {/* 7. Damage Breakdown Section */}
          <Section title="伤害多维拆解" id="breakdown-heading">
            <DamageBreakdown result={run.result} team={run.inputs.team} />
          </Section>
        </>
      )}

      {/* Sleek Minimal Footer */}
      <footer className={styles.footer}>
        <div>
          原神战斗输出循环模拟器 · 确定性战斗内核与时序编排
        </div>
        <div className="flex items-center gap-3">
          <span>原神 Wiki 战斗伤害公式标准</span>
          <span>·</span>
          <span>能量动力学流转</span>
        </div>
      </footer>
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="relative flex flex-col justify-between border border-surface-border/80 bg-surface-raised/90 p-4 transition-colors hover:border-cyan-400/50">
      <div>
        <div className="font-mono text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="mt-2 font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
          {value}
        </div>
      </div>
      {description && (
        <div className="mt-3 border-t border-surface-border/50 pt-2 text-xs text-slate-400 leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
}
