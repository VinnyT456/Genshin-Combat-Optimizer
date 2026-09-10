# Product, UX, and Feature Implementation Plan

Date: 2026-09-07. Task: #062. Author: Astra, product/UIUX planning. **Planning only: the new capabilities in this document have not been implemented.**

This document supplies the detailed product work inventory for the Genshin damage calculator and rotation optimizer. The Manager integrates it into the master plan, assigns bounded tasks, and accepts implementation evidence. It does not change existing product decisions or treat proposals as approved scope. Every UI task follows `uiux-engineer → Manager review → frontend-engineer → UI review → QA`. Engine, mechanics, data, optimizer, and persistence changes belong to their respective owners; frontend must not implement combat calculations.

The planning artifact is in English. The website remains Chinese-primary, and proposed user-facing copy is illustrated in Chinese. [MASTER-PLAN.md](../MASTER-PLAN.md) owns milestone order; the capability slices in §8 map explicitly to its M0–M8 outcomes.

## 1. Evidence and baseline corrections

Reviewed `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT-STATUS.md`, `docs/ROADMAP.md`, and `docs/WORK-MAP.md`, together with the existing design flows, design system, component specifications, two audits, character detail specification, dashboard/dialog specification, and 2026-09-07 perk-wiring specification under `docs/design/`. Code evidence includes `src/app/page.tsx`, `features/{setup,team-builder,character-detail,simulation,rotation-timeline,energy,damage-breakdown}`, and the public optimizer contract.

Interpretation order: current code and accepted 2026-09-07 evidence > explicit dated decisions > historical open-task labels. Static inspection in this task does not replace browser acceptance. No code tests were run for this document, and no claim is made that every existing test adequately covers its user flow. Historical character, weapon, and test counts are snapshots; product counts should come from current data.

| Existing foundation | Actual state | Treatment in this plan |
|---|---|---|
| Team building, character search, element/weapon/rarity filters, portraits, slot movement | Present | Preserve and improve; do not recreate the picker |
| Traveler identity, form model, duplicate-identity protection | Model and design constraints exist | Verify the complete website flow; never introduce multiple Traveler identities |
| Character stats, talents, constellation dialog | Three tabs exist; talent-table presentation already supports levels 1–15 | Add level/ascension, base-versus-effective talent semantics, and coverage tab; not a new “11 to 15” task |
| Reconciliation of 259 talent boosts and lossless website generic-character adapter | Accepted | Retain regression coverage; do not promote the seven other expressible effects to connected status |
| Weapon and artifact pickers | UI exists; this does not prove equipment reaches simulation | P0 audit of provenance → selection → stats/effects → execution; artifact selection currently remains local display state |
| Automatic rotation search | Engine has deterministic beam search, Top-N, total-damage/DPS; no website entry point | Expose existing capability; Worker, cancellation, and progress are new delivery requirements |
| Rotation action editing | Presets, quick append, sequence ribbon, up/down movement, deletion, clear, orphan warnings exist | Extend the editor instead of listing its baseline as new work |
| Timeline, event list/detail, energy panel, damage breakdown | Present; selection shares an event index | Add stable event identity, filtering, audit information, and comparison without rebuilding panels |
| Elemental damage shares | Already rendered by `page.tsx` | Improve aggregation definitions, filtering, and accessibility |
| `structuredWarnings` / `finalState` | Warnings reach the timeline; final state feeds energy and insights | Add navigation, grouping, and replay semantics; do not describe them as entirely unrendered |
| Tactical insights and copied summary | Present | Tighten evidence and wording; add consistency and copy-failure handling |
| URLs, dialog scroll lock, focus restoration, semantic states, responsive foundations | Present | Fix actual differences; do not redo accepted contracts |
| Stale-result notice | Present; old numbers remain, but some presentation reads current draft metadata | Introduce immutable run snapshots and eliminate new-team/old-result combinations |
| Projects, inventory, complete-input persistence/sharing, run comparison, formula trace | No complete user workflow | New features, with data/platform contracts first |

### 1.1 Product risks to preserve through implementation

These are inspection findings to verify and address, not fixes completed in this task:

- `TeamBuilder` stores equipment selection locally by slot; artifact selection does not update simulation input. Equipment identity must survive character movement, replacement, and reload correctly.
- The website weapon path still depends on a legacy registry. The generated full weapon catalog cannot automatically count as available to users. Platform planning identified a potential `physicalDmg` → generic damage-bonus mapping error for the equipment owner to verify.
- `CharacterStatsModal` has hardcoded `dps`/`subDps`/`em` stat templates. These values must not appear as verified character recommendations. Remove role labels or recast the templates as explicit, attributable manual assumptions.
- `page.tsx` renders old results with current team, enemy description, and swap configuration in some places. Copied summaries also read current inputs. Editing can therefore make labels and numbers describe different experiments.
- Insights equate full energy at the end with a seamless loop, absence of separate reaction-damage events with mono-element/direct damage, and a low swap-time share with no idle time. These fields do not prove those conclusions.
- The run button currently checks only nonempty team and rotation. Starting character, Traveler form, action support, equipment, and initial-state transport need an explicit complete preflight contract.
- Current `timeLimit` constrains action start, not necessarily final action completion or the damage-statistics endpoint. Distinguish an action-start cutoff from a fixed measurement window; relabeling cannot manufacture strict-window behavior.

## 2. Product outcome and non-negotiable constraints

The product should let a user complete a reproducible experiment: **configure a team and combat conditions → author or search a rotation → understand the result → change one variable and compare → save and share the inputs.**

The first product focus is simulation and rotation search with a fixed team and build. Build search and team search are explicit future proposals, not automatic scope. A single-ability calculator can become a short path through the same experiment model; it must not introduce a second damage formula.

1. Chinese is the primary interface language. Explain E, Q, DPS, and similar terms on first use. Character taxonomy uses objective element, weapon, and rarity attributes, never main-DPS/sub-DPS/support roles.
2. Traveler is one identity with supported forms. Form changes are explicit configuration actions; a missing form never silently selects a default. Unauthored characters do not appear as selectable placeholders.
3. Never fabricate unverified values, average conflicting sources, or prefer a newer source to fill a conflict. Existing engine assumptions remain labeled assumptions, not game facts.
4. Available prose, expressible effects, connected effects, unlocked effects, and effects actually triggered in this run are five different facts. Without execution evidence, do not say an effect is active.
5. Unsupported does not mean invalid. Invalid input must not masquerade as a successful run with a minor caveat. If error direction is unknown, use “可能与实际表现不同”, not a promise of underestimation.
6. Search returns candidates found within the stated conditions, action space, and budget. Never promise global optimality or that a wider beam must improve the answer.
7. Authored artifact stats are deterministic values. Do not introduce random substat rolls into simulation.
8. Damage, reactions, energy, cooldowns, legality, formulas, and state traces come from tested lower-layer interfaces. UI only sorts, formats, and organizes evidence.
9. Each result binds to its actual inputs, engine version, data version, and effective configuration. Draft edits cannot rewrite the identity of an old run.
10. Chinese typography, 200% zoom, keyboard use, and touch access are acceptance conditions. Preserve accepted desktop/mobile foundations instead of restarting them wholesale.

### 2.1 Planning defaults and decisions still needed

These recommendations make independent work actionable. The Manager settles differences before the dependent implementation; none requires stopping unrelated correctness or infrastructure work.

| Decision | Recommended default | Work awaiting the decision |
|---|---|---|
| Serving curious and experienced users | Default to quick start, progressively reveal advanced settings; one shared project model | Does not block accuracy or Worker contracts |
| Product structure | Team & setup → Rotation → Results; manual/search modes inside Rotation | Approve navigation before implementation; preserve old URL compatibility |
| Mobile scope | Complete configuration, run, result reading, and basic editing; dense comparison can stack vertically | No requirement to reproduce desktop tables or multitrack dragging on phones |
| Saving | Local projects first, versioned file import/export; full-build URLs after schema stability | Cloud accounts, sync, and a public project gallery need separate decisions |
| Search objectives | Initially only existing total damage/DPS, with honest duration definitions | Time-to-kill, target allocation, loop feasibility, and robustness objectives require product/engine decisions |
| Build/team search | Feasibility and contract design only until scope approval | UX-101–104 implementation awaits approval |
| Assets and release | Keep system fonts and existing asset fallback; use the platform release plan | Hosting, attribution/licensing presentation, and third-party access policy belong to Manager/platform |
| Telemetry | Begin with local acceptance and performance evidence; do not silently upload builds | Product analytics/cloud diagnostics require an explicit data-scope design |

## 3. Information architecture and screen hierarchy

Top-level navigation is a reversible workflow with links and a current-stage marker, not one enormous tablist. Stages preserve drafts and do not impose a mandatory completion order. Use tabs or radios inside stages only for genuinely mutually exclusive content.

```text
Project workspace
├─ Project name, save status, latest run status, Save / Import / Share
├─ Stages: 队伍与配置 → 循环 → 结果
├─ Team & setup
│  ├─ 1–4 slots, starting character, coverage summary
│  ├─ Character: 面板属性 / 天赋与技能 / 命之座 / 模拟覆盖
│  ├─ Weapon, five artifact slots, manual stat sources and override policy
│  └─ Enemy/scenario, initial state, calculation mode, time semantics
├─ Rotation
│  ├─ Manual: action list, action palette, validation, presets, history
│  ├─ Search: objective, time conditions, budget, supported scope/limitations
│  └─ Candidate list → preview → editable copy / save candidate
├─ Results
│  ├─ Run conditions and coverage → headline metrics and warnings
│  ├─ Overview / timeline / damage / energy / aura / buffs
│  ├─ One selected event → synchronized analysis views
│  └─ Baseline vs alternative → input diff → output diff → explanation/sensitivity
└─ Project library, inventory, reference/help (progressively introduced)
```

### 3.1 Information tiers and presentation

| Tier | Visible by default | On demand |
|---|---|---|
| Primary decision | Experiment, effective configuration, run status, total damage/DPS/actual duration, omissions affecting this result | Every field of the input snapshot |
| Comparison and diagnosis | Candidate rank, character/ability/element composition, key warnings, ending energy/cooldowns | Events, time intervals, character filters |
| Explanation and verification | Selected-event facts, reaction category, cast/hit relation | Formula terms, buff sources, ICD, aura, snapshots, provenance, limitations |

Before a run, avoid empty charts occupying the workspace. After a run, do not let the full equipment editor push conclusions out of view. Place stable, clearly distinct “模拟此循环” and “搜索循环” actions in their relevant stages. Show caveats before the numbers they qualify; keep the global mechanics registry in a lower disclosure. State common coverage once, then show deviations at the relevant character, value, or event.

Desktop uses primary content plus a detail sidebar; tablet moves detail below; mobile defaults to event lists, grouped fields, and stacked comparison. The editable action sequence and the analysis timeline are different objects: editing actions changes future inputs, while selecting a damage event inspects an already completed run.

## 4. Global state contract

Draft state, save state, and run state are independent. A saved draft may coexist with stale results; canceled search does not imply saving failed. One `loading` or `dirty` boolean cannot represent these states.

| State | Visible content and primary action | Prohibited behavior |
|---|---|---|
| First visit | “从示例开始” / “新建空白项目”; explicit example assumptions and coverage | Unexplained preloaded team presented as a recommended finished build |
| Empty team | Add character; adjacent run reason “请先添加角色” | Fake zero-damage result |
| No rotation | Append action / compatible preset / search suggestions | Requiring a complete manual rotation before search |
| Invalid configuration | Inline field error plus issue summary and repair navigation | Silent clamp/substitution followed by execution that hides original input |
| Unverified data / disconnected effect | Name the specific field/effect and result limitation; preserve draft | Green readiness implying the effect works; treating coverage as an ordinary execution error |
| Ready | Input summary and exact draft version to be run | Hiding effective initial energy or time rules |
| Running | Throttled progress, cancel, previous result; safe draft editing | Editing in-flight inputs, freezing the main thread, fabricated percentages |
| Canceling / canceled | Request acknowledged, then confirmed stopped; preserve draft/prior results | Incomplete rankings shown as final; automatic restart |
| Valid result | Completed run snapshot, metrics, diagnostics | “Guaranteed in-game value” or “global optimum” |
| No candidates | Distinguish no legal candidates, budget exhausted without a finding, and data/execution failure | One generic “team is too weak” explanation |
| Result with skipped actions | Attempted/executed/skipped counts and reasons | Exporting the original draft as if every action executed |
| Stale result | Full-contrast old values, original input version, changed fields; rerun or restore original inputs | New-team labels on old numbers; announcing removal while retaining results |
| Partial result / memory stop | Completed scope and stop reason; save verified candidates if the contract permits | Mixing partial statistics with final totals |
| Execution failure | Chinese error, retry, copyable diagnostics; preserve project | Unbounded retries or raw stack trace as the only explanation |
| Save failure | Reason, retry, export backup; keep editing possible | “Saved” before successful persistence |
| Old-version restore / import conflict | Version diff, unknown items, mapping preview; create a copy | Silently dropping characters, gear, actions, or provenance |

### 4.1 Consistency invariants

- Freeze normalized inputs and assign a run ID at start. Responses belong only to that run. Editing, late replies after cancel, retries, and project switching cannot insert old output into a new run.
- Result views, shared summaries, energy state, character labels, and event details all read one run snapshot. Draft changes update only stale reasons.
- Staleness covers team, form, level, talents, constellation, gear, manual overrides, enemy, initial state, rotation, simulation settings, and effective data version. Filters and tabs do not make results stale.
- Keep previous results. When a rerun finishes, replace the current display and retain history according to the selected policy. Invalid drafts may still inspect prior results.
- Changing search objective/budget makes the old ranking outdated for the new search conditions, without invalidating each candidate's underlying simulation. Distinguish “candidate remains inspectable” from “current search completed.”

## 5. Critical user flows

### F1: Obtain and understand a first result

1. Choose an example from the Chinese first-run state; see “示例输入” and coverage, not an implied recommended build.
2. Inspect example team, enemy, starting character, calculation mode, and actual time rules.
3. Choose “模拟此循环”; validate and run without unnecessarily stealing focus.
4. Read run conditions, omitted effects, total damage, DPS, and duration.
5. Select an event to inspect its character, hit, energy, and available calculation evidence.
6. Change a talent or action; old results immediately say they belong to the pre-edit configuration. Rerun and compare.

Acceptance: no external guide or account required; both example and empty flows work; switching complexity modes never resets hidden advanced settings.

### F2: Build an accurate team and equipment configuration

1. Add characters through objective filters; explicitly select a Traveler form.
2. Set level/ascension, base talents, and constellation; show supported ranges and effective-talent sources.
3. Select legal weapon level/refinement and enter/import five artifact pieces.
4. Separate intrinsic stats, equipment contributions, manual overrides, and combat buffs; trace duplicate contributions to their source.
5. Show whether values and effects actually participate before saving.
6. Preserve other manual settings under documented rules when changing weapons, slot order, or form. Equipment follows the character, not the next occupant of its old slot.

Acceptance: controls change the correct engine inputs; equipment is never folded twice; an unmodeled set says disconnected instead of pretending to apply its bonus.

### F3: Author and repair a rotation

1. Load a compatible preset or append actions; the palette lists actual supported actions/variants.
2. Insert, duplicate, move, and batch-delete; retain buttons and keyboard equivalents for any dragging interaction.
3. Engine-backed validation identifies the step, reason, and location; show execution conditions without guessing future damage.
4. Team edits preserve orphaned draft actions and offer explicit mapping/deletion previews.
5. Undo restores the previous edit; redo restores the same action identity with sensible focus/selection migration.
6. After running, distinguish authored actions from actual events; a skipped-action warning returns to its editor location.

Acceptance: delete, clear, and preset replacement are undoable; core editing works by keyboard; unsupported wait/cancel syntax cannot become a different executable action silently.

### F4: Search → choose → edit

1. A configured team/scenario can search without a manually authored rotation.
2. Select an existing objective, time conditions, and fast/balanced/thorough budget; budget describes search effort, not guaranteed quality.
3. Run in a Worker while inspecting data or editing the next draft; the in-flight input summary stays fixed.
4. Show real completed work. Without a progress denominator, show “搜索中” and cancellation rather than inventing a completion percentage.
5. Return Top-N or a precise empty state. Each candidate shows actual duration, score definition, conditions, and execution warnings.
6. Preview a full candidate simulation. “复制为可编辑循环” creates a draft version and retains the original candidate.
7. Edit and rerun, then compare with the original. Do not automatically replace the draft with rank one.

Acceptance: cancellation acknowledges promptly and stops computation; late responses cannot overwrite a new job; emitted candidates receive independent full replay; wording consistently describes candidates found.

### F5: Explain one damage number

1. Open damage by character, ability, element, or time interval.
2. Select a hit; energy/aura/buff views point to the same event, explicitly distinguishing before/after state.
3. Show source action, target, effective element, damage category, crit mode, reaction, and trigger owner.
4. Expand actual formula terms with values, sources, and conditions. Without trace data, say “本版本未记录该项”.
5. Jump to the buff source, equipment/constellation selection, application event, or ICD-suppressed record.

Acceptance: the formula reconciles to the event within contract precision; UI never reverse-engineers absent intermediate values or guesses reactions from names.

### F6: Compare A and B fairly

1. Pin a run as baseline A and select a candidate/new run B.
2. Inspect input differences first: versions, enemy, timing, crit mode, initial state, equipment.
3. Different conditions may be viewed side by side, labeled “条件不同”; offer copying common conditions and rerunning, never silent normalization.
4. Show totals, absolute/relative deltas, duration, executed actions, energy deficits, and provable event differences.
5. Separate observed association from counterfactual evidence. Only a rerun isolating a change can support an estimated effect of that change.

Acceptance: zero baselines never yield Infinity; negative improvements remain visible; scrolling/filtering cannot switch run identity.

### F7: Recover and share

1. After autosave, explicitly say “已保存到此设备”; allow rename, duplicate, and export.
2. Refresh restores complete identical inputs; unavailable storage still permits work and backup export.
3. Preview shared inputs, account identifiers/personal notes, data version, and omissions.
4. Recipients validate versions and unknown items before rerunning. Numbers carried by an external link are not trusted results.
5. An old link that cannot fully restore shows missing content and opens a repairable copy, never a replacement default team.

### F8: Determine whether a rotation can continue

1. Show ending energy and cooldowns separately; full energy is not skill availability.
2. “验证下一轮” actually runs the next rotation from the snapshot and identifies the first unmet action/time.
3. Multicycle checks state tested cycles, initial conditions, any proven stable-state criterion, and remaining unknowns.
4. Without continuation or state-equivalence evidence, say “本轮结束状态”, not “infinite loop.”

## 6. Feature catalog conventions

**Global risk priority:** P0 means correctness, trustworthy representation, or recoverability, consistent with the master plan. P1 means core workflow value, P2 depth/efficiency, and P3 optional future scope. **R1 is a separate release marker:** required for the first reachable-optimizer release, M1. A `P1 / R1` feature is release-critical without being a global correctness emergency. `P0 / R1` has both meanings. Earlier local P0 labels for onboarding, navigation, search controls, undo, and accessibility are translated into this distinction; task IDs remain unchanged.

**Status:** `Extend` = an existing foundation needs a specific improvement; `New` = no complete workflow exists; `Dependency` = lower-layer data/interface needed; `Proposal` = product decision required before implementation. These are not completion percentages.

**Tests:** U = pure model unit tests; I = website-to-lower-layer integration/regression; E = browser end-to-end; A = keyboard, screen-reader, contrast, zoom, and responsive checks; P = performance/main-thread response; V = versions, persistence, import/export round trips. Tests below identify acceptance directions. Implementation should use counterexamples that fail when wiring is wrong, not merely snapshot strings.

**External dependency aliases**, mapped to concrete master-plan tasks by the Manager:

| Alias | Required capability/evidence | Owner |
|---|---|---|
| D-COVER | Character/effect/value provenance, support, connection status, Chinese reason codes; no inference from nonempty fields | Data + mechanics/combat |
| D-GEAR | Weapon/artifact provenance audit, legal levels, verified stats and set/refinement effects; one complete build → effective Stats path | Data + equipment/combat |
| E-RUN | Serializable run inputs/outputs, effective settings, initial state, time definitions, validation through public adapters | Combat + platform |
| E-TRACE | Optional budgeted stable event/action IDs, damage/energy/aura/ICD/buff/snapshot trace | Combat + mechanics |
| O-JOB | Worker jobs, real progress, cancellation/termination, error isolation, budgets, full candidate replay | Optimizer + platform |
| E-LOOP | Actual next-/multicycle runs and explicit continuation criteria; not an ending-energy boolean | Combat + optimizer |
| E-SCENE | Verified enemy/scenario data, target identity, independently scoped multitarget/phase support | Data + mechanics/combat |
| P-STORE | Versioned project/run envelopes, migration, storage recovery, size bounds, input fingerprints | Platform |
| P-SHARE | Input package import/export, compatibility, optional sharing service; external results are untrusted | Platform |
| P-IMPORT | Permitted official/public account sources, rate limits, caching, field mapping, missing-data handling | Platform + data |

Each UX ID is an estimable work package, not permission to cross ownership boundaries. Larger packages need a specification and fixed API before splitting into UI implementation, lower-layer capability, and QA tasks.

### A. Workspace, onboarding, and state

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-001 | Separate editable inputs, run snapshots, selection, and view preferences; consolidate scattered page state | P0 / Extend | E-RUN | Every result region uses one snapshot; changing the team cannot change old-result ownership | U/I/E |
| UX-002 | Team & setup → Rotation → Results navigation, compatible with existing all/setup/results URLs | P1 / R1 / Extend | UX-001; IA approval | Browser back/forward restores stages without losing drafts; current stage is accessible | E/A/V |
| UX-003 | Quick start with example/empty entry points and explicit example assumptions/coverage | P1 / R1 / New | UX-002, D-COVER | First visit supports empty start; one-click example run makes no optimal-build claim | E/A |
| UX-004 | Simple/advanced progressive disclosure, hidden-settings summary, saved preference | P1 / New | UX-001 | Switching modes preserves every input; advanced changes remain summarized in simple mode | U/E |
| UX-005 | Immutable run snapshots, stale reasons, restore-original-inputs, rerun | P0 / Extend | UX-001, E-RUN | Editing team/gear/environment leaves old numbers, names, energy, and copied content bound to the original run | U/I/E |
| UX-006 | Unified preflight issue summary and field navigation; distinguish blockers, skipped actions, coverage gaps | P0 / Extend | E-RUN, D-COVER | Disabled reason is adjacent; issue links focus the correct action/field | I/E/A |
| UX-007 | Consistent empty/loading/failure/canceled/partial-result states and copy | P1 / R1 / Extend | UX-001, O-JOB | Every state offers a useful next step; no result never renders fake zero metrics | U/E/A |
| UX-008 | Recent projects/runs with explicit draft and snapshot versions | P1 / New | P-STORE, UX-005 | Opening a project does not launch expensive search; run status cannot be mistaken for save status | E/V |
| UX-009 | Terminology help and keyboard-shortcut reference | P2 / New | UX-003, UX-091 | Chinese explanations for E/Q/expected crit; shortcuts respect IME and text editing | E/A |

### B. Characters, teams, builds, and inventory

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-010 | Improve character browsing: Chinese/English names, objective filters, no matches, unavailable data, portrait fallback | P1 / Extend | D-COVER | Disambiguate names; clear filters from empty results; never classify cards as main/sub DPS | U/E/A |
| UX-011 | Slot, identity, form, starting-character, and configuration lifecycle | P0 / Extend | UX-001, E-RUN | No duplicate Traveler; missing form has a reason; gear follows moved character; starting choice reaches the actual run | U/I/E |
| UX-012 | Character level, ascension, base and effective talent controls | P1 / Extend | D-GEAR, E-RUN | Only legal sourced combinations submit; base plus constellation boosts remain attributable without double-counting level-15 tables | U/I/E |
| UX-013 | Fourth character tab “模拟覆盖”; talents before constellations | P1 / Extend | D-COVER | Missing prose and missing effect remain distinct; unlocked never implies triggered; full Chinese reasons are available | U/I/A |
| UX-014 | Stat provenance and explicit manual-override modes | P0 / Extend | D-GEAR, UX-001 | Intrinsic/equipment/override/combat-buff contributions are distinct; weapon changes do not silently erase manual inputs or double-fold gear | U/I/E |
| UX-015 | Product acceptance for equipment-path audit and correctness fixes | P0 / Extend | D-GEAR | Selected weapon/artifacts match engine inputs; physical bonus cannot become all-damage bonus; disconnected selections say so immediately | I/E |
| UX-016 | Weapon level, ascension, refinement, stats, passive-support presentation | P1 / Dependency | D-GEAR, UX-015 | Use live verified registry and legal caps; stats versus passive connection shown separately; selection changes the correct result | U/I/E |
| UX-017 | Five artifact slots, main/substats, and sources | P1 / Dependency | D-GEAR, UX-014 | Enter deterministic piece stats; reject invalid fields; no random rolls; missing provenance is visible | U/I/E |
| UX-018 | Set counts, mixed sets, activation conditions, coverage | P1 / Dependency | UX-017, D-GEAR | Thresholds use verified data; static and conditional effects each have wiring evidence; no duplicate activation | U/I/E |
| UX-019 | Audit existing numeric templates and preset labels | P0 / Extend | UX-014, D-COVER | Hardcoded build values are not character recommendations; manual assumption templates list fields/sources; no DPS role taxonomy | U/E |
| UX-020 | Named character builds, duplicate, lock, apply to current team | P1 / New | UX-014–018, P-STORE | Multiple builds do not overwrite each other; reference-update policy is explicit; runs bind a build version | U/E/V |
| UX-021 | Team templates: save, copy, replacement preview, rotation compatibility | P1 / Extend | UX-011, P-STORE | Templates contain complete versioned inputs; replacement previews orphan actions without deleting them automatically | E/V |
| UX-022 | Local inventory: ownership, weapon/artifact instances, locks, filters | P2 / New | UX-020, P-STORE | User ownership differs from catalog support; unique item allocation conflicts are visible | U/E/V |
| UX-023 | Account/file import preview, mapping, missing and duplicate items | P2 / Dependency | P-IMPORT, UX-022 | Preview before import; unknowns remain unknown; absent talents/gear never become assumed finished builds | I/E/V |
| UX-024 | Build-change inspection: source of one change and its output effect | P2 / New | UX-020, UX-074 | Copy a build, change one variable, rerun; report does not assign a fixed character role | I/E |

### C. Enemies, scenarios, and assumptions

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-025 | Correct training-target configuration: level, per-element/physical resistance, custom-value sources | P0 / Extend | E-RUN | Mixed resistance is not called uniform; negative resistance/intermediate input/invalid values are explained; pre-shredded values are not treated as untouched base resistance | U/I/E |
| UX-026 | Time-semantics and crit-mode summary | P0 / Extend | E-RUN | Distinguish action cutoff, elapsed time, measurement window; forced crit is not labeled expected damage | I/E |
| UX-027 | Initial state: starting character, energy, existing cooldowns/status | P1 / Dependency | E-RUN | Actual defaults visible; custom fields only where supported; inexpressible states clearly unavailable | U/I/E |
| UX-028 | Verified enemy presets and saved custom scenarios | P1 / Dependency | E-SCENE, P-STORE | Source version visible; generic high resistance is not a real boss profile; preset changes preview overwritten fields | I/E/V |
| UX-029 | Enemy phases, vulnerability windows, waves | P2 / Proposal | E-SCENE, UX-028 | Only real supported phases exposed; comparison includes phase schedules; no invented movement coverage | I/E |
| UX-030 | Multitarget configuration and target selection | P2 / Dependency | E-SCENE, E-TRACE | Independent resistances/auras; clear target count, hit targets, aggregation; never multiply single-target output by target count as a substitute | I/E/A |
| UX-031 | Swap/action timing assumptions and latency sensitivity entry | P1 / Extend | E-RUN, D-COVER | User assumptions and verified timing are distinct; defaults are not measurements; editor/result use identical effective timing | I/E |
| UX-032 | Scenario compatibility and missing-mechanic summary | P0 / Extend | D-COVER, E-SCENE | Disclose missing mechanics relevant to selected scenario before running; unknown error direction remains unknown | U/I/E |

### D. Manual rotations, text authoring, and validation

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-033 | Consistent editor model: stable action identity and actual action metadata | P0 / Extend | UX-001, E-RUN | Reordering preserves selection; no unsourced placeholder durations; actions map to events | U/I/E |
| UX-034 | Insert, duplicate, multiselect, move/delete, keyboard equivalents | P1 / Extend | UX-033 | Edit anywhere; optional dragging has equivalent buttons/keys; focus remains predictable | U/E/A |
| UX-035 | Undo/redo, including clear and preset replacement | P1 / R1 / New | UX-001, UX-033 | Delete/clear/preset replacement recoverable; preserve native text undo; restored actions and selection agree | U/E/A |
| UX-036 | Complete supported action palette: normal-string positions, low/high plunge, ability variants | P1 / Extend | E-RUN, D-COVER | Show only actual abilities; names agree with ability IDs; selected normal position and sequence state do not contradict | U/I/E |
| UX-037 | Preflight execution validation and issue navigation | P0 / Extend | E-RUN, UX-033 | Type cooldown, energy, orphan, missing-ability, time-limit issues; identify exact actions instead of only prose strings | U/I/E/A |
| UX-038 | Actual-execution preview and skipped-action feedback | P0 / Extend | UX-037, E-TRACE | Separate attempted/successful/skipped counts; return to source actions; do not silently remove invalid draft steps | I/E |
| UX-039 | Version-one rotation text grammar and bidirectional conversion | P2 / New | UX-033, E-RUN | Explicit supported character/action/index syntax; line/column errors; lossless valid-input round trip | U/I/E/A |
| UX-040 | Text authoring: completion, Chinese help, formatting, examples | P2 / New | UX-039 | Completion comes from actual team abilities; formatting preserves semantics; IME composition never submits accidentally | U/E/A |
| UX-041 | Wait, exact timestamps, repeat blocks, action canceling | P2 / Proposal | Corresponding action contracts, UX-039 | Verify each engine semantic first; unsupported syntax remains an error rather than becoming a normal attack/swap | U/I/E |
| UX-042 | Preset rotation compatibility matrix and preview | P1 / Extend | UX-033, D-COVER | State required team, forms, initial conditions, version; mismatch offers repair preview without automatic team replacement | U/E/V |
| UX-043 | Rotation snippet library and annotations | P2 / New | UX-034, P-STORE | Snippets carry character/action mapping; comments do not affect combat; repeated paste generates independent action IDs | U/E/V |

### E. Simulation and search jobs

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-044 | Unified simulation action and running experience | P1 / R1 / Extend | UX-005, E-RUN, O-JOB | Repeated clicks/shortcuts follow explicit job policy; UI stays responsive; output binds start-time inputs | U/I/E/P |
| UX-045 | Search entry for a fixed team/build, using existing total-damage and DPS objectives | P1 / R1 / New | UX-002, O-JOB, UX-026 | No manual rotation required; score name/unit/order agree; unimplemented objectives are not selectable | I/E |
| UX-046 | Fast/balanced/thorough budgets and advanced parameters | P1 / R1 / New | O-JOB | Presets derive from measured budgets; bounds/help exist; thorough is not guaranteed to beat fast | U/I/E/P |
| UX-047 | Worker progress, cancel/terminate, retry, obsolete-response protection | P0 / R1 / New | O-JOB, UX-005 | Canceled jobs cannot overwrite new results; real or indeterminate progress; Worker failure preserves project | U/I/E/P |
| UX-048 | Top-N list, stable ranking, preview, precise empty states | P1 / R1 / New | UX-045, O-JOB | Fewer than N results shown honestly; stable ties; candidates include full replay and effective-input summary | U/I/E/A |
| UX-049 | Candidate → preview → editable copy | P1 / R1 / New | UX-035, UX-048 | Never overwrite draft with rank one automatically; copy is undoable; original candidate/result stay immutable | U/I/E |
| UX-050 | Search-scope and assumption disclosure | P1 / R1 / New | D-COVER, O-JOB | Show action space, objective, budget; no “global optimum” or “guaranteed in-game” wording | U/E |
| UX-051 | Fixed opening, excluded actions, maximum swaps/actions, other constraints | P2 / Proposal | Optimizer constraint interface | Expose only enforced constraints; explain no-solution conflicts rather than ignoring restrictions | U/I/E |
| UX-052 | Saved search conditions and candidate history | P1 / New | UX-048, P-STORE | Conditions reproducible; rerunning cannot alter old ranking budget/version; partial runs labeled | I/E/V |
| UX-053 | Multitarget, time-to-kill, and sustain objectives | P2 / Proposal | Objective interface, E-SCENE/E-LOOP | Verify metrics and stopping conditions first; not killed/not converged is not zero seconds/infinite sustain | U/I/E |
| UX-054 | Search again with more budget; compare budgets | P2 / New | UX-048, UX-074 | New and old jobs distinct; negative improvement visible; resume-search offered only if supported | I/E/P |

### F. Results and diagnostics

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-055 | Calibrate result summary: duration, mode, attempted/executed actions, limitations | P0 / Extend | UX-005, UX-026, D-COVER | Old output reads old settings; relevant caveat precedes metric; zero damage differs from no run | U/I/E |
| UX-056 | Audit existing insight evidence and correct wording | P0 / Extend | E-RUN, D-COVER | Full energy describes energy only; no separate reaction hit does not imply no amplifying reaction; low swap share does not prove no idle time | U/I/E |
| UX-057 | Timeline filters, zoom, interval selection, synchronized event list | P1 / Extend | E-TRACE, UX-005 | Filtering does not silently change headline totals; interval scope explicit; same event selected across views | U/E/A/P |
| UX-058 | Cast/hit hierarchy, off-field hits, same-time events, boundary explanations | P1 / Extend | E-TRACE | Multihits are not duplicate casts; stable individually selectable same-time events; swaps occupy actual duration | U/I/E/A |
| UX-059 | Rich event detail: action, target, crit mode, reaction owner, before/after state | P1 / Extend | E-TRACE | Forced-crit result is not expected damage; before/after explicit; missing trace says not recorded | I/E/A |
| UX-060 | Cooldown tracks and action-availability inspection | P1 / Dependency | E-TRACE, E-RUN | Readiness includes time, energy, other conditions; full energy alone cannot produce a green burst-ready claim | U/I/E |
| UX-061 | Energy sources, funneling, overflow, per-character deficit, event navigation | P1 / Extend | E-TRACE | Preserve current panel; attribute particle/flat-energy changes; overflow requires actual engine evidence | U/I/E/A |
| UX-062 | Next-/multicycle continuation validation | P1 / Dependency | E-LOOP, UX-061 | State tested cycles and first failed action; no infinite-loop claim without stability proof | U/I/E |
| UX-063 | Aura timeline: target, gauge, consumption, residue, decay | P2 / Dependency | E-TRACE, E-SCENE | Use actual trace; discrete snapshots do not masquerade as exact continuous curves; no invented Burning coefficients | I/E/A |
| UX-064 | ICD/reaction diagnosis: hit, application, trigger, nontrigger reason | P2 / Dependency | E-TRACE, D-COVER | Hits differ from applications; trigger owner/target locatable; fixed priority labeled a model convention | I/E/A |
| UX-065 | Buff/debuff timeline and trigger chain | P2 / Dependency | E-TRACE, D-GEAR | Source, recipients, stacks, interval, snapshot/dynamic semantics visible; effect presence does not imply use this run | I/E/A |
| UX-066 | Per-hit damage formula inspector | P1 / Dependency | E-TRACE | Every term is traced; formula appropriate to damage category; final value matches the hit; no parallel frontend formula | U/I/E |
| UX-067 | Improve existing character/ability/element breakdown | P1 / Extend | UX-055, E-TRACE | Same-name abilities disambiguated by owner; reaction attribution follows contract; filters/denominators clear; no double counting | U/I/E/A |
| UX-068 | Damage over time, cumulative damage, interval statistics | P2 / New | E-TRACE, UX-057 | Table alternative; points reconcile to result; instantaneous/interval/whole-run DPS clearly distinguished | U/I/E/A |
| UX-069 | Structured warning center grouped by action/character/reason, with repair navigation | P1 / Extend | UX-037, E-TRACE | Collapse duplicates while preserving counts; links reach source action/event; severe errors are not hidden | U/E/A |
| UX-070 | Provenance/coverage detail and version summary | P0 / Extend | D-COVER, P-STORE | Verified/unverified/unmodeled/disconnected distinct; conflicts explain why; no misleading coverage percentage | U/I/E/A |
| UX-071 | Copied summaries and structured export | P1 / Extend | UX-005, UX-070, P-SHARE | Snapshot-derived content includes versions/assumptions/limits; clipboard failure has manual-copy fallback | U/E/V |
| UX-072 | Share a selected event or interval | P2 / New | UX-057, P-SHARE | Restore inputs and rerun before locating; version-induced mismatch reports a stale anchor, never the wrong event | I/E/V |
| UX-073 | Beginner result walkthrough | P1 / New | UX-055, UX-056 | Explain provable observations and useful next steps; per-run damage share never becomes a permanent role label | U/E/A |

### G. Comparison, explanation, and sensitivity

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-074 | Pin A/B runs and inspect input differences | P1 / New | UX-005, P-STORE | Versions/conditions appear first; incomparable runs labeled; baseline immutable under draft edits | U/I/E |
| UX-075 | Delta tables for damage/DPS/duration/character/ability/energy | P1 / New | UX-074, UX-067 | No infinite percentage for zero baseline; negative delta retained; units, denominators, sort agree | U/E/A |
| UX-076 | Paired timelines with time/action/event alignment | P2 / New | UX-074, UX-058 | Absolute-time/action alignment options; unmatched events explicit; mobile side switching preserves selection | U/E/A |
| UX-077 | Explain differences through separately labeled facts and counterfactuals | P2 / New | UX-074, E-TRACE | Facts such as two extra bursts link to events; no causal claim without controlled rerun | U/I/E |
| UX-078 | Single-variable sweeps: levels, talents, stats, resistance, timing assumptions | P2 / Dependency | E-RUN, O-JOB, UX-074 | Every point simulated; legal ranges; unsupported regions visible; interpolation cannot conceal thresholds | U/I/E/P |
| UX-079 | Finite-difference stat sensitivity and marginal-gain curves | P2 / Proposal | UX-078, D-GEAR | Show perturbation, baseline, fixed rotation versus reoptimization; not global stat weights or build advice | U/I/E |
| UX-080 | Cross-scenario robustness comparison | P3 / Proposal | UX-078, E-SCENE | Every scenario and aggregation weight visible; no confidence intervals without a defensible variance model | U/I/E |
| UX-081 | Comparison report export | P2 / New | UX-075, UX-070, P-SHARE | Export input differences, versions, limitations, metrics together; charts have text equivalents | E/A/V |

### H. Projects, import/export, and sharing

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-082 | Complete local draft autosave and save status | P1 / New | UX-001, P-STORE | Reload restores team/build/environment/actions/assumptions; failure never reports success; no account needed | E/V |
| UX-083 | Project library: names, duplicate, recent edit, tags, recovery/undo | P1 / New | UX-082 | Same-name projects distinguishable; deletion recoverable or explicitly irreversible; search does not change experiment inputs | U/E/V/A |
| UX-084 | Run history, pinned baselines, capacity management | P1 / New | UX-005, P-STORE | Deleting large traces preserves inputs; same-version reproducibility limits clear; export when storage is full | U/E/V |
| UX-085 | Project file import/export and migration preview | P1 / New | P-SHARE, P-STORE | Canonical input round trips; unknown fields/versions/identities repairable; no silent omission | U/I/E/V |
| UX-086 | Complete-input sharing format and recipient workflow | P1 / Dependency | P-SHARE, UX-085 | Preserve existing short URLs; version complete payloads; recipient recomputes and sees version differences | I/E/V |
| UX-087 | Share preview and account-identifier/note controls | P1 / New | UX-086 | Preview actual contents; account details not silently included in public links; exports explain scope | E/V |
| UX-088 | Data-update and old-project migration center | P2 / Dependency | P-STORE, D-COVER | List affected characters/effects/fields; preserve input copy; do not pretend unavailable old engines remain reproducible | I/E/V |
| UX-089 | Cloud sync, multidevice, collaboration, public project library | P3 / Proposal | Product decision, P-STORE, P-SHARE | Conflict origin/merge preview; explicit public/private state; no public writes before permissions are designed | I/E/V |

### I. Chinese UX, accessibility, responsiveness, performance

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-090 | Complete Chinese copy and reason-code mapping | P1 / Extend | D-COVER | Every active reason has Chinese or explicit missing-translation state; no silent English prose fallback; source text can be deliberately expanded | U/E/A |
| UX-091 | End-to-end keyboard, focus, dialogs, state announcements | P1 / R1 / Extend | Every UI task | Team → editor → search → cancel → candidate → result works by keyboard; focus retained; announcements do not flood | E/A |
| UX-092 | Chinese typography and 200% zoom completion | P1 / Extend | Existing DESIGN-SYSTEM | System CJK body fonts; monospace numerals only; important explanations not clipped; long names readable | E/A |
| UX-093 | Complete mobile core workflow | P1 / Extend | UX-002, UX-048, UX-057 | 44×44px targets; no page overflow; list alternative; controls respect keyboard/safe areas | E/A |
| UX-094 | Equivalent text for charts/tables, non-color status, contrast | P1 / Extend | All analysis views | Screen-reader/color-deficient users distinguish states/elements; chart tables; tooltips never sole disabled reason | E/A |
| UX-095 | Large-data rendering and staged loading | P1 / Extend | O-JOB, platform performance budget | Long traces/candidates do not stall input; virtualization preserves focus/accessibility; measure before thresholds | P/E/A |
| UX-096 | Reduced motion, offline/asset failure, unavailable-storage experience | P1 / Extend | Platform failure contracts | Motion-free use works; stable portrait fallback; already loaded local inputs remain inspectable/exportable | E/A/V |
| UX-097 | UI regression matrix and structured design review | P1 / R1 / Extend | Every UI change | Report Issue/Problem/Recommendation/Priority; retest actual wiring and affected breakpoints | E/A/I |

### J. Educational tools and explicitly reserved future scope

| ID | Feature and delivery boundary | Priority / status | Dependencies | Observable acceptance | Tests |
|---|---|---|---|---|---|
| UX-098 | Single-ability calculator shortcut | P2 / Proposal | E-RUN, UX-066 | A short experiment uses the same engine; enemy/buff/crit assumptions visible; no second damage implementation | I/E |
| UX-099 | Interactive aura/ICD/funneling/snapshot lessons | P2 / Proposal | E-TRACE, D-COVER | Sourced fixed experiments; unknown mechanics explicit; sliders rerun the product engine | I/E/A |
| UX-100 | Model coverage reference and version release notes | P2 / New | D-COVER, UX-088 | Data inclusion separate from execution support; actual additions and remaining omissions; character count does not imply complete coverage | U/E |
| UX-101 | Build-optimization product contract | P2 / Proposal | Scope decision, D-GEAR, UX-022 | Define fixed team/rotation, allowed equipment, locks, objective, legal builds, and reoptimization strategy | Specification review + contract-test design |
| UX-102 | Build-search UI and candidate comparison | P3 / Proposal | UX-101, build-search engine, O-JOB | Show actual inventory items; conflicts/missing items explicit; alternating optimization and fixed-rotation evaluation never called global optimality | I/E/P |
| UX-103 | Team-search product contract and feasibility | P3 / Proposal | Scope decision, UX-101, coverage policy | Define ownership, duplicate identity, shared equipment, enemy, budget; coverage differences disclosed in rankings | Specification review + feasibility experiment |
| UX-104 | Team search and candidate handoff | P3 / Proposal | UX-103, team-search engine, O-JOB | Objective conditions, no main/sub-DPS taxonomy; preview before copying to team draft | I/E/P |
| UX-105 | Playability constraints and practice mode | P3 / Proposal | Sourced action timing, constraint interfaces | Describe only supported execution constraints; no realistic feel score without latency/hit-rate models | Specification review + I/E |
| UX-106 | Community templates, public examples, discussion entry | P3 / Proposal | Release/content decision, P-SHARE | Template source/version/coverage visible; user content is not verified game data; never auto-publish personal projects | I/E/V |

## 7. Detailed requirements for critical screens

### 7.1 Character and equipment detail

- Preserve the current implemented dialog sizing, focus, and single-scroller contract. Differences in historical size names do not justify rewriting every caller.
- Character level is not an ordinary freeform stat label. Show level/ascension, intrinsic stats, base talents, and effective constellation-driven boosts. Character base ATK and weapon base ATK remain separately attributable.
- State whether a manual override replaces a final stat or adds a contribution. A field must not change meaning after weapon replacement.
- Equipment rows show numeric-stat coverage separately from passive/set execution coverage. Incompatible gear cannot silently equip; imported invalid items remain visible for repair.
- Use a consistent commit model for detail editing: edit a draft, save to apply, and preserve unsaved changes or confirm discard on dismissal. Distinguish this from immediately applied filters. Clicking a backdrop must not silently discard multiple edited values.
- Unverified fields show the assumption/source and reason; genuinely absent values say “尚无核验数据”. Neither becomes zero simply because data is missing.

### 7.2 Rotation search

- The first objective selector exposes only actual contract-supported total damage and DPS. Default to total damage with actual duration explained. Until strict-window semantics are settled, do not imply the objectives differ only by a constant denominator.
- Search-budget presets are application configuration, not game facts. Platform/optimizer measurements determine and document their numerical values. This plan does not invent beam widths, second counts, or completion promises.
- During search, keep team/scenario, objective, effective budget, and run version visible and immutable. Editing the next draft is allowed without changing the current run.
- If progress offers only a node count, show a node count. Without a total, do not turn it into a percentage. Estimated time is optional and requires a real estimator with limitations communicated.
- Minimum viable cancellation may terminate the Worker. Retaining candidates found before cancellation requires an incremental-candidate contract; UI cannot invent access to the Worker's internal state. Treat those as separate delivery levels.
- Default candidate rows show rank, score, actual duration, executed-action count, and important limitations. Node counts and advanced parameters can be disclosed on demand rather than occupying the beginner flow.
- Empty results offer only evidence-backed remedies: reduce constraints, increase budget, or repair configuration when applicable. If no constraint interface exists, do not recommend removing imaginary restrictions.

### 7.3 Results and explanation

- Total damage/DPS use the run's actual definitions. Interval selection introduces explicitly scoped interval metrics instead of silently replacing whole-run results. Exports preserve the metric scope.
- A connected passive/constellation/set effect is not proof it triggered in this rotation. Trace may show triggers, affected hits, and unmet conditions; without trace, present only supported facts.
- Aura, buffs, cooldowns, and energy share selection but state before/after sampling semantics. Equal floating-point timestamps cannot be the sole identity for simultaneous events.
- Detailed tracing may increase cost. Offer lightweight default results and budgeted detailed mode where necessary. Detailed replay checks consistency with the original run and binds identical input/version.
- Initial explanations may list hit counts, burst counts, reaction classifications, and buff-coverage observations. Causal explanations need controlled reruns. Do not guess untraced mechanics in prose.
- Energy diagnosis progresses from ending energy/cooldowns to actual next-cycle replay, then to multicycle stability evidence. Each evidence level uses different wording.

## 8. Capability slices and master-milestone mapping

The S0–S5 labels below group product capabilities; **they are not a competing release sequence**. The Manager's M0–M8 milestones and first-wave shortlist in [MASTER-PLAN.md §5–6](../MASTER-PLAN.md) govern execution. In particular, full builds belong to M2, timing correctness to M3, comparison to M4, and persistence to M5; grouping them together here does not pull them all into M1.

Milestones are outcome gates, not calendar promises. Estimate after lower-layer contracts are sufficiently stable. Correctness and job infrastructure can progress in parallel. A limited but honest optimizer does not need every long-tail kit/mechanic implemented first.

| Local capability slice | Contents and primary UX IDs | Master milestone mapping | Capability acceptance |
|---|---|---|---|
| S0 — Input identity and trustworthy representation | State/snapshots; equipment audit; assumptions; insight/provenance correction. 001, 005–007, 011, 014–015, 019, 025–026, 032–033, 056, 070 | **M0** evidence/accuracy; minimal versioned state and in-memory run identity also enable **M1** | No old-result/new-label combinations; selected configuration reaches calculation; unsupported channels clear; known unsupported claims corrected |
| S1 — Reachable rotation optimizer | Navigation/onboarding; Worker; existing objectives/budgets; Top-N; editable handoff; undo. 002–003, 035, 037–038, 044–050, 055, 091, 097 | **M1** | Real website F1/F4 flow; cancellation; responsive main thread; independently replayed candidates; no false optimality promise |
| S2 — Daily core workflow | Legal progression/equipment, template builds, comparison, save/export, mobile. 010, 012–013, 016–018, 020–021, 027–028, 034, 036, 042, 052, 074–075, 082–087, 090–096 | Split: builds/progression **M2**; initial-state/horizon correctness **M3** as needed; A/B **M4**; named projects/history/export **M5**. Accessibility/mobile accompany each delivering milestone | Correct end-to-end build effects; understandable comparison; complete-input restoration/sharing; core mobile/keyboard workflows |
| S3 — Combat explanation | Trace, energy continuation, formulas, aura/ICD/buffs, evidence-backed comparison. 057–069, 072, 076–079 | Time/snapshot foundations **M3**; explanation/comparison **M4**; advanced kit/multitarget traces **M6**. Persistent/shareable event references also need **M5** | Every displayed fact has trace evidence; numbers attributable; continuation conclusions use replay; gaps remain explicit |
| S4 — Efficiency and reference | Inventory/import, text authoring, snippets, repeated experiments, reports, reference. 022–024, 039–043, 054, 071, 078, 080–081, 088, 098–100 | Reusable data/text/import **M5**; explainers/reports/sensitivity **M4** when contracts allow; scenario/kit reference **M6**; robustness optimization, if approved, **M7** | Lossless round trips, complete provenance, acceptable long-session performance, lessons use the product engine |
| S5 — Separately approved extensions | Build/team search, cloud collaboration, complex scenarios, practice. 029–030, 041, 051, 053, 089, 101–106 | Scenarios/mechanics **M6**; advanced search **M7**; hosted sync/community/service **M8** | Product scope and lower-layer capability approved; listing a proposal is not permission to implement it |

The master crosswalk is complete: **M0 trustworthy baseline; M1 reachable optimizer; M2 real builds; M3 correct time/reactions; M4 explain/compare; M5 reusable projects; M6 broader kits/scenarios; M7 advanced optimization; M8 public service.**

If equipment data blocks M2, independent search, diagnosis, or persistence work may continue with explicit equipment limitations; do not mark “real builds” accepted prematurely. EC scheduling with drain snapshots, unverified Burning rules, multitarget, and snapshot semantics follow the engine plan; UI capabilities open only when their own prerequisites are supported.

### 8.1 Dependency staging, not accidental milestone inversion

Some catalog aliases name the eventual complete platform capability. They do not require that entire capability before its first consumer:

- UX-005/070 and M1 need a minimal immutable in-memory run envelope and effective data/version metadata. This is the early PLAT-003 contract, **not** a dependency on the entire M5 project library.
- UX-074 can compare two in-memory immutable runs in M4. Persistent baselines and history arrive with M5; the P-STORE reference covers their eventual durable representation.
- UX-038/057 may start from existing structured warnings and timeline events, adding stable identities as needed. They do not wait for every advanced formula/aura trace in M4/M6.
- UX-032 can show current capability limitations without waiting for the complete enemy bestiary or multitarget implementation.
- UI state extraction should cover search and stale-result correctness first. It is not a prerequisite for a wholesale application rewrite.

### 8.2 What the first optimizer release does not require

All 106 packages, cloud accounts, complete inventory, every enemy, all constellation/weapon passives, global-optimum guarantees, automated build/team recommendations, multitrack dragging, a text language, complete formula tracing, and every mechanic are **not** default M1 scope. M1 does require real execution, accurate limitations, Worker/cancel behavior, Top-N candidates, and editable handoff. It cannot claim disconnected effects are implemented to make the release look complete.

## 9. Executable task decomposition

Use the repository's existing task format rather than assigning an unbounded “redo the whole site” task:

```text
TASK #NNN
Owner: uiux-engineer / frontend-engineer / lower-layer owner (one accountable owner)
Goal: One observable user outcome; reference the relevant UX ID
Dependencies: Approved specification, interface version, prerequisite tasks
Files / module: Explicit permitted paths and out-of-scope ownership boundaries
Requirements: Main flow, state matrix, Chinese copy, accessibility, preserved behavior
Acceptance Criteria: Reproducible website outcome, including failure/stale paths
Tests: Relevant U/I/E/A/P/V; name a case that fails on incorrect wiring
```

Design tasks deliver structure, state diagrams/tables, interactions, copy, breakpoints, and acceptance criteria. Frontend tasks deliver real integration. Lower-layer tasks deliver tested field semantics. UI review files structured findings rather than rewriting React across ownership boundaries. QA checks the real control-to-engine path, avoiding the historical failure where a tested model was never used by its caller.

### 9.1 Recommended initial work packages

These packages support, rather than replace, the Manager's shortlist:

| Package | Primary owner | Purpose and boundary | Conditions for independent parallel work |
|---|---|---|---|
| P-A: Snapshot/state contract | Manager/platform, frontend integration | UX-001/005; normalized inputs, run identity, stale reasons, display ownership | Do not implement equipment math; consume a public input model |
| P-B: Equipment trust | Data/equipment owner; UIUX acceptance design | UX-014/015/019; source/path evidence and explicit manual overrides | Do not refactor workspace; freeze equipment inputs/outputs |
| P-C: Run/search contract | Optimizer/platform | UX-044–048; Worker, cancel, supported objectives, candidates | UI works against fixed message contract/test doubles; no search algorithm in components |
| P-D: Navigation/search interaction spec | UIUX | UX-002/003/035/045–050; Chinese screens and states | Uses P-A/P-C contracts; does not depend on every mechanic |
| P-E: Honest results | Frontend + UIUX + QA | UX-025/026/055/056/070; insufficient claims and mixed-version display | Integrate state contract; do not invent mechanic assumptions |
| P-F: First complete acceptance | QA + UIUX | F1/F3/F4, cancel races, retry, keyboard/mobile | Review fixed integrated code; not only mockups or isolated models |

## 10. Quality gates and verification scenarios

### 10.1 Minimum end-to-end experiment set

| Scenario | Required proof |
|---|---|
| Empty project → one supported character → one action → run | Usable without examples/accounts; all metrics originate in the engine |
| C0 versus an unlocked connected talent boost; unaffected talent control | Prove the channel is connected and narrowly applied; preserve accepted 259-row reconciliation |
| Change weapon/talent, move character, rerun | Gear/build belong to the character; base/final values are not double-counted; local edits preserve other inputs |
| Artifact before and after integration | Before connection, no successful-bonus claim; afterward, selected stats/effects reach the engine and are attributable |
| Traveler form change, duplicate selection, original-form actions | Identity protection, explicit form, repairable action mapping |
| Run A, edit to B, inspect energy/timeline/copied summary | Every old result still belongs to A; stale reasons describe B's changes; no current-roster-default substitution |
| Search → cancel → new search → old reply arrives | Job identity isolation; canceled is not completed; new output cannot be overwritten |
| No legal candidate / budget finds nothing / Worker failure | Distinct causes and recovery actions |
| Candidate copy → edit action → undo → rerun | Immutable candidate; consistent history; replay legality and score verifiable |
| Equal configured window with final action overrun | Actual horizon semantics visible; different measurement conditions not called a fair equal-window comparison |
| Amplifying-only reaction case / full energy with cooldown remaining | No false “pure direct damage” or “seamless loop” insight |
| Save failure / corrupt import / unknown character / old version | Preserve user data; no silent replacement; export/repair possible |
| 320–390px phone, tablet, desktop, 200% zoom | Readable critical text, 44px targets, no page overflow, complete result/edit paths |
| Keyboard-only + Chinese IME + screen reader | Complete team/edit/run/cancel/candidate flow; appropriate focus and announcements |

### 10.2 Strength of evidence

- Pure-model tests cover state combinations, but every integration needs evidence from a real caller path.
- Changing the `runSnapshot` source, dropping equipment transport, misclassifying reactions, or ignoring cancel identity should make designated regressions fail. Where valuable, mutation checks happen in isolated copies, never by overwriting another agent's work.
- Visual regressions include long actual Chinese labels, missing-coverage copy, and enlarged content. Short English placeholders cannot prove Chinese layout quality.
- Platform supplies device, dataset scale, and performance budgets. Record interaction responsiveness during search, event counts, and memory; this document invents no millisecond promise.
- Ordinary deterministic reruns compare stable outputs for identical inputs/versions. Snapshot-resume/aura comparisons use the engine's stated numeric tolerance instead of indiscriminately requiring byte-identical floating-point states.
- This planning task adds documentation only and does not run production builds. Implementation follows repository test/typecheck/lint/build requirements, plus browser evidence for UI changes.

## 11. Product success and scope maintenance

Success starts with completion, reproducibility, and explanation—not a larger damage number. Measure through manual task acceptance or deliberately designed local event evidence: first successful simulation, usable cancellation, candidate-to-editor handoff, complete-input recovery, recognition of differing comparison conditions, and ability to locate missing effects relevant to a result. Measurement does not require silently uploading account details or builds.

Record accepted evidence and versions in the master plan as work lands. Keep UX IDs stable; update status only from accepted implementation. Data regeneration does not mean broader gameplay support; picker visibility does not prove engine integration; a completed backend API does not prove a usable website flow. For each scope change, revisit run identity, coverage presentation, Chinese copy, keyboard use, responsive behavior, and import/export compatibility rather than reopening already completed historical tasks.
