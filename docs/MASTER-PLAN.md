# Genshin Combat Simulator & Rotation Optimizer — Master Plan

Updated: 2026-09-08. Planning expansion requested by the product owner, developed
with three explicitly selected **gpt-6-astra** planning agents and integrated by
the manager. This document plans future work; it does not claim those features
have shipped or authorize external accounts, paid services or publication.

## 1. How to use this plan

This is the forward-looking entry point. It expands the existing ROADMAP and
WORK-MAP rather than discarding their decisions. Read in this order:

1. This document: goals, priority, milestones, dependencies and scope decisions.
2. [Engine, mechanics and optimizer plan](planning/ENGINE-OPTIMIZER-PLAN.md).
3. [Product, UX and feature plan](planning/PRODUCT-UX-FEATURE-PLAN.md).
4. [Data, platform and quality plan](planning/DATA-PLATFORM-QUALITY-PLAN.md).
5. [Project status](PROJECT-STATUS.md): accepted implementation and validation.
6. [Architecture](ARCHITECTURE.md) and [design system](design/DESIGN-SYSTEM.md):
   contracts that implementation must respect.

The second Astra planning pass is recorded in
[ASTRA-ROADMAP-EXPANSION-096.md](planning/ASTRA-ROADMAP-EXPANSION-096.md). It
prioritizes current integration gaps and proposes the next ten Luna dispatches.

Detailed domain task IDs are stable references. The manager turns a selected
task into a bounded assignment with Owner, Goal, Dependencies, Files/module,
Requirements, Acceptance Criteria and Tests before dispatch. Ideas are not all
equally urgent. P0 protects correctness or the ability to work safely; P1 delivers
the core product; P2 adds depth; P3 is optional expansion/research. An uncertain
mechanic may be important and still remain source-blocked.

Status vocabulary: **existing**, **partially implemented**, **verified gap**,
**planned**, **optional**, **research/source-blocked**. A schema, generated file,
unit test and reachable website feature are different completion stages.

## 2. Product destination

A player should be able to answer both “what happens if I execute this rotation?”
and “what better rotation can I execute with my actual team and equipment?” The
answer should include its assumptions, support limitations and an inspectable
event trace. A high damage number alone is insufficient.

Primary journey:

1. Start from a clearly labelled example, saved project or empty team.
2. Select up to four characters; enforce one identity per party, including Traveler.
3. Choose levels, ascensions, talents, constellations, weapons and artifacts.
4. Configure enemy, initial energy, time window and relevant combat conditions.
5. Author a rotation or search for suggestions within declared constraints.
6. Inspect damage, energy, cooldowns, aura, buffs and skipped actions.
7. Compare alternatives, understand differences, edit and rerun.
8. Save or export a reproducible project with its engine/data versions.

Audience assumption for planning: curious players get understandable defaults;
experienced theorycrafters can reveal detailed controls and evidence. This is one
product with progressive disclosure, not two divergent calculation engines.
Chinese remains the primary language. Mobile supports the complete core journey;
large comparisons and advanced traces may use dedicated layouts.

## 3. Current baseline and corrections to historical plans

The last accepted implementation cycle recorded 1,791 passing tests across 104
files, typecheck, lint and production build. Those are historical validation
results, not a claim that this documentation task reran every gate.

| Area | Existing foundation | Work still required |
|---|---|---|
| Combat | Pure deterministic simulation, damage pipeline, energy, cooldown validation, generic multi-hit kits | Globally ordered delayed events, complete ongoing-state checkpoints, more mechanics |
| Reactions | Aura/ICD and several reaction calculations | Timed reactions, reaction entities, multi-target interactions and unresolved rules |
| Characters | Generated registry, talent tables, scaling terms, levels, provenance | Per-mechanic coverage, remaining effects, live action variants and complete build UI |
| Constellations | 259 talent boosts reconciled and connected to website | Seven other expressible perks and non-modelled effects remain unsupported |
| Equipment | Equipment stat abstractions and generated weapon data | Live registry cutover, stat-channel audit, artifact provenance and complete effect wiring |
| Optimizer | Deterministic beam search, ranked results, candidate admission, incremental resume tests | Website access, worker execution, progress/cancel, constraints, richer objectives |
| Frontend | Team/build controls, rotation editing, simulation, timeline and results | Integrated optimization journey, comparisons, persistence and deeper diagnostics |
| Platform | Next.js app and local checks | Versioned persistence, CI, release workflow; optional accounts and server jobs later |

Do not repeat completed work merely because an old ROADMAP row is still open.
Equally, “132 generated rows” does not mean 132 independent identities or fully
supported combat kits. Generated weapon tables are not proof the live picker
uses them. The data planner found the live weapon registry still imports legacy
data, plus a physical-damage bonus mapping requiring a targeted audit.

Two additional source-review findings change the first-wave priority:

- The character emitter's ability-validation path can collect conflicts or
  missing-verifier warnings yet continue emitting primary-source abilities and
  exit successfully. Audit and enforce withholding at the actual publication
  boundary. This finding is about a missing guard; it is not evidence that every
  current emitted value is wrong.
- Some existing tactical insights infer seamless loops from full ending energy,
  direct-only damage from absent synthetic reaction events, or no idle time from
  low swap share. Replace these claims with evidence-bound diagnostics and replay
  checks. Full energy alone does not establish cooldown or resource feasibility.

Some earlier descriptions call engine/reactions “complete.” Treat that as the
tested implemented subset, not complete game coverage. Resume/cold equivalence
currently includes a documented aura tolerance; identical repeated runs and
checkpoint equivalence must be described separately.

## 4. Non-negotiable design rules

- Combat math stays in mechanics/engine modules. The UI, optimizer, backend and
  explanation layer consume the same public simulation contracts.
- Ordinary new characters use declarative data. A genuinely new mechanic may
  require a reviewed reusable abstraction; never hide character-name branches
  inside the generic engine.
- Verified data requires independent corroboration. Shared upstream provenance
  must be acknowledged; two mirrors are not two independent experiments.
- Withhold conflicting or unsupported values. Never replace missing values with
  plausible guesses, silently substitute another character, or label prose as
  executed effects.
- Preserve deterministic ordering, explicit clocks, stable identifiers and
  reproducible configurations. Random artifact generation remains out of scope.
- Expected CRIT damage does not make crit-triggered state transitions exact.
  Nonlinear probability-dependent effects need explicit semantics or disclosure.
- “Best found” is the optimizer claim. Beam search, larger budgets and alternating
  build search do not establish global optimality.
- Revalidate a rotation whenever its build or scenario changes. Energy, cooldown
  effects, resource conditions and action availability can change legality.
- Keep sourced facts, modelling assumptions, unsupported behavior and search
  uncertainty separate in results and exports.
- All user-facing work includes UX design, implementation review and meaningful
  validation. Existing design conventions win over generic English-centric rules.

## 5. Delivery strategy

Run product enablement and accuracy work in parallel where their interfaces are
stable. Do not postpone all user value until every character is perfect, and do
not release unsupported results without visible limits. No single large rewrite
should precede every feature.

| Milestone | Outcome | Main scope | Exit gate |
|---|---|---|---|
| M0 — Trustworthy baseline | Work and data can be reproduced | Recoverable version-control baseline, CI, truthful status/coverage, equipment/source audits | Checks reproducible; unsupported channels identified; no blanket support claims |
| M1 — Reachable optimizer | User searches, reviews and edits suggestions | Application state, worker adapter, search controls, progress/cancel, Top-N and adopt | Search works without freezing UI; results replay; stale requests cannot overwrite current work |
| M2 — Real builds | Equipment and progression reliably affect results | Sourced weapon cutover, artifacts, shared effect compilation, level/ascension controls | Picker → build → resolved stats/effects → engine proven end-to-end |
| M3 — Correct time and reactions | Persistent effects interleave correctly | Event scheduler, checkpoints, horizon policy, EC, source-gated reaction expansion | Cold/resume and boundary tests; delayed damage survives swaps and idle periods |
| M4 — Explain and compare | User understands and improves a rotation | Trace inspector, A/B comparisons, loop diagnostics, formula/effect explanations | Differences attributable to replay evidence; incomplete effects remain disclosed |
| M5 — Reusable projects | Work survives sessions and can be shared | Local projects, migrations, import/export, immutable run metadata and sharing | Round-trip replay matches supported version semantics; invalid imports rejected |
| M6 — Broad kit/scenario coverage | More real teams behave meaningfully | Resources, HP/shields/healing, summons/fields, snapshots, multi-target and enemy states | Representative kit families graduate through coverage tests |
| M7 — Advanced optimization | Inventory/team/robustness-aware suggestions | Constrained builds, alternating search, candidate teams, Pareto tradeoffs | Every emitted candidate legal under its actual build/scenario; budgets and limitations shown |
| M8 — Public service | Operable, maintainable hosted product | Release policy, licensing review, monitoring; optional sync/accounts/job backend | Deployment/recovery rehearsed; quotas/access control meet selected architecture |

Milestones are outcome gates, not invented calendar commitments. M1 can begin
against existing engine APIs while M2/M3 are designed. M4 needs sufficient trace
data; M5 starts locally without waiting for accounts. Public deployment is a
separate execution decision. M7 is proposed scope, not a prerequisite for M1.

## 6. First implementation waves

### Manager shortlist: start with these packages

The domain inventory has 177 identified work packages (43 engine/mechanics/search,
28 data/platform/QA, 106 product/UX). Some describe different layers of one
deliverable, as reconciled in §10; this is not an estimate of 177 separate releases.

| Order / parallel track | Referenced tasks | First concrete output |
|---|---|---|
| 1 — recovery and evidence | PLAT-001, QA-001 | Reviewed recoverable baseline and current capability/data-path ledger |
| 2 — source correctness | DATA-001, QA-002 | Reproducing conflict/missing-row fixtures and a fail-closed candidate publisher |
| 2 — result correctness, parallel | UX-005, UX-056 | Immutable displayed run identity and corrected unsupported insights |
| 3 — reproducible data | DATA-002 | Version-isolated source cache and atomic candidate promotion |
| 3 — product contract, parallel | UX-001, OPT-001, early PLAT-003 | Minimal versioned run/search input and stale-state contract |
| 4 — equipment audit | DATA-004/005, UX-014/015 | Verified live item mapping and full equipment correctness specification |
| 4 — responsive search, parallel | OPT-008, PLAT-004, UX-047 | Worker proof with cancellation, real progress and obsolete-response rejection |
| 5 — search product | UX-045/046/048/049/050 | Top-N search → preview → editable rotation using current capabilities |
| 5 — time foundation, parallel | ENG-001/002, OPT-002 | Reviewed clock/checkpoint/key inventory and isolated counterexample tests |
| 6 — scheduler | ENG-003/004, MECH-002 | Delayed-event interleaving and sourced EC execution with drain preservation |
| 6 — saved experiments, parallel | PLAT-002/003, UX-082–087 | Local project and portable-file workflow with migrations/replay identity |
| 7 — useful comparisons | OPT-010, UX-074–079 | Comparable run snapshots with trace-backed differences and limitations |

This shortlist is a proposed sequence, not a new implementation dispatch. Assign
one owner per concrete task and freeze the shared interface before parallel work.

### Wave 1 — unblock safe progress and the namesake feature

1. Confirm repository history and capture a recoverable baseline without staging
   secrets, caches or unrelated scratch files indiscriminately.
2. Establish automated typecheck, lint, tests and build gates; archive useful
   failure reports. Plan the deprecated lint-command migration deliberately.
3. Audit and enforce source-conflict withholding in the actual character emitter;
   make conflict/missing-verifier fixture tests fail on unsafe publication.
   Inventory live data paths, especially legacy weapon registry, elemental bonus
   mapping, artifact provenance and generated-source cache versions. Correct
   unsupported diagnostic claims before expanding them into comparison guidance.
4. Define application project/run/search state and immutable input fingerprints.
   Extract only the state needed for search and stale-result correctness.
5. Specify versioned worker requests/responses; rebuild non-serializable resolver
   functions inside the worker from plain data. Add bounded work, cancellation
   and stale-response rejection.
6. Expose existing optimizer objectives, bounded search presets, Top-N suggestions,
   baseline comparison and “copy into editor.” Preserve the incumbent rotation.
7. In parallel, design scheduler ordering/checkpoint/horizon contracts before
   implementing timed reactions.

### Wave 2 — close build and diagnostic gaps

1. Cut over weapon UI to verified level/refinement data with migration tests.
2. Regenerate or exhaustively audit artifact data before building trusted set
   effects on it; separate static stats from conditional effects.
3. Implement whole-build resolution through the shared equipment/buff channels.
4. Add character level/ascension controls and verify chosen talents/constellation
   do not double-apply boosts or silently use level-90 stats.
5. Add run history, A/B comparison, structured warnings and loop feasibility.
6. Land scheduler plus complete checkpoint state and then verified EC timing.
7. Complete mobile and 200% zoom checks with an automation surface that actually
   supports those measurements; do not infer success from screenshots alone.

### Wave 3 — durable projects and deeper mechanics

1. Add versioned local persistence and lossless export/import.
2. Add deterministic project examples and explanation walkthroughs.
3. Extend reaction entities, actor resources and snapshot semantics by sourced
   mechanic family; graduate representative character cohorts.
4. Prototype advanced optimization only after reliable build resolution and
   fixed-window/loop scoring semantics exist.
5. Select hosting/backend/account scope from measured usage and product needs.

## 7. Feature portfolio

The linked domain plans specify individual tasks, dependencies and acceptance.
This portfolio describes the intended product breadth so discoveries are not
lost between specialist plans.

| Capability family | Features to plan |
|---|---|
| Onboarding | Guided example, blank start, glossary, quick/advanced disclosure, saved project recovery, explanatory first results |
| Team management | Four-slot identity validation, Traveler forms, favorite characters, named teams, presets, compare substitutions, team-wide coverage summary |
| Builds | Level/ascension/talents/constellation, weapon level/refinement, five artifact slots, manual stats, imported inventory, loadout snapshots, item locks, duplicate allocation checks |
| Build analysis | Stat-source breakdown, effective vs base values, set activation, talent-upgrade deltas, ER sufficiency, marginal stat sensitivity, controlled upgrade comparisons |
| Enemy/scenario | Verified enemies, custom documented target, resistance/DEF, HP/phases, vulnerability windows, initial auras, shields, distance/target assumptions, repeatable scenario presets |
| Rotation editing | Action palette, normal string positions, press/hold variants, plunge, wait, swaps, block templates, text notation, validation, undo/redo, keyboard reordering, annotations |
| Simulation control | Initial energy/resources, window policy, expected/always/never crit, repeat cycles, step inspection, checkpoints, explicit assumptions, bounded execution |
| Timeline | Character lanes, damage/events, buffs, aura/ICD, energy, cooldowns, resources, reaction entities, filters, zoom/range selection, accessible chronological list |
| Results | Total and per-character/ability/element/reaction damage, cumulative damage, DPS by declared window, energy losses, missed actions, wasted uptime, damage formula trace |
| Comparison | A/B or selected candidates, matched setup checks, baseline deltas, event alignment, burst/reaction counts, uptime differences, field-time cost, changed-assumption badges |
| Rotation search | Fast/balanced/thorough budgets, progress, cancel, fixed actions/prefix, allowed actions, duration, Top-N diversity, replay verification, adopt/edit, run metadata |
| Advanced search | Sustained-loop objective, target HP objective, resource constraints, practical execution penalties, deterministic scenario robustness, inventory build search, team search |
| Project library | Autosave, named projects, snapshots, tags, local search, history, migrations, duplicate/rename, import validation, recoverable deletion |
| Sharing | Versioned portable files, reproducible links, read-only published snapshots, comparison exports, charts/images, source and limitations attached |
| Learning | Formula glossary, reaction walkthroughs, annotated rotations, “why no reaction/burst?” explanations, reproducible bug-report packages |
| Optional community | Curated examples, patch-tagged guides, contributions with provenance, moderated public builds; no uncontrolled global damage leaderboard |
| Optional platform | Accounts/sync, background jobs, saved server results, quotas, public API, developer SDK/CLI after core schema stabilizes |

## 8. Architecture evolution

Keep the computation kernel usable in local tests, a browser worker and a server
worker without importing React, networking or storage. Proposed application
boundaries are responsibilities, not permission to introduce unnecessary services:

| Boundary | Responsibility | Excludes |
|---|---|---|
| Data bundle | Versioned definitions, sources, support metadata | Network lookups during simulation |
| Build resolver | Inventory/loadout → stats and declarative effects | UI-specific state or duplicated combat formulas |
| Simulation | Inputs → deterministic events/results/checkpoint | Browser state, database writes, real-time clocks |
| Optimization | Search using simulation, candidate admission and budgets | Independent approximations presented as verified final scores |
| Application state | Project edits, validation, run identity, stale state | Damage/reaction math |
| Worker transport | Messages, cancellation, progress, error boundaries | Serialized functions or mutable shared user state |
| Persistence/share | Schemas, migrations, ownership, immutable result references | Reusing incompatible cached scores |
| API/job service, optional | Validated requests, queue/quotas, worker lifecycle | A second engine implementation |

Proposed contract decisions needing written specifications:

- `ProjectDocument`: schema version, teams/loadouts, scenario, rotation, search
  configuration and user annotations; no results masquerading as fresh inputs.
- `RunIdentity`: engine version, data manifest hash, input fingerprint, modeling
  assumptions, objective, algorithm version and completed deterministic budget.
- `RunResult`: totals plus trace/coverage/warnings; summary-only mode can reduce
  transfer cost but must be distinguishable from a fully inspectable result.
- `Checkpoint`: all future-relevant state, pending events and compatibility
  identity. No reuse across changed builds or incompatible engine/data versions.
- Worker messages: request ID, progress, partial/final/cancelled/error states;
  deterministic work checkpoints and a rule rejecting obsolete responses.
- Time horizon: distinguish action-start cutoff, damage observation cutoff and
  optional drain-to-idle. Report the denominator used for DPS and comparison.

## 9. Validation and release definition

A feature is complete only after all relevant layers connect. For a character
effect this means source evidence → emitted data → engine execution → website
selection → disclosed output → regression coverage. A unit test for the middle
stage is necessary but cannot establish end-to-end support.

Required evidence is selected by risk:

1. Pure unit tests for formulas, conditions, schemas and boundary rules.
2. Integration tests using live generated definitions and actual website adapters.
3. Determinism tests for repeat runs, stable ordering, worker parity and cache keys.
4. Checkpoint continuation tests with documented numeric equivalence where needed.
5. Independent reference cases, provenance checks and carefully scoped differential
   comparisons; matching another calculator is not automatic proof.
6. Property/metamorphic tests for valid invariants, with exceptions documented.
7. Mutation checks on critical connections so disconnecting a effect fails tests.
8. Browser checks for the main journey, cancellation, stale state, keyboard,
   Chinese wrapping, mobile, reduced motion, contrast and 200% zoom.
9. Performance measurements over declared fixtures and hardware; counting budgets
   in CI where wall-clock timing would be unreliable.
10. Migration/import/export recovery tests before storage and public sharing ship.

Do not fabricate numeric latency/SLA commitments before measuring representative
devices. Record target, observed distribution, fixture/version and accepted
regression threshold together. Optimize trace size, bundle size and memory as
well as raw engine throughput.

## 10. Ownership and working order

Existing roles remain authoritative. New responsibilities are proposed ownership
assignments for the manager to authorize, not silent expansions of worker scope.

| Track | Accountable owner | Collaborators |
|---|---|---|
| Product sequencing/contracts | manager | all owners |
| UX flows/design/review | uiux-engineer (manager may act in this role) | frontend, QA |
| Source/generation/coverage | designated game-data owner | mechanics, QA |
| Game rules | mechanics-engineer | data, combat, QA |
| Event execution/checkpoints | combat-engineer | mechanics, optimizer, QA |
| Search | optimizer-engineer | combat, frontend, QA |
| Browser application | frontend-engineer | UIUX, QA |
| Storage/API/deployment | designated platform owner, proposed | frontend, manager, QA |
| Validation | qa-engineer | every implementing owner |

Only one writer owns each core file at a time. Cross-module contracts are agreed
before workers implement both ends. Independent test design and evidence research
can run concurrently; integration acceptance cannot be delegated away.

### Shared deliverables are not duplicate implementations

Some domain tasks describe different responsibilities for the same feature. Group
them into one manager assignment chain rather than building parallel solutions:

| Shared deliverable | Domain responsibility split | Integration rule |
|---|---|---|
| Search worker | OPT-008: deterministic search execution; PLAT-004: transport/lifecycle; product plan: controls and states | One request protocol and worker entry point; resolver construction stays in execution context |
| Replay/project schema | Engine input/checkpoint contracts; PLAT-003: portable encoding/versioning; product plan: saving/sharing | Agree a minimal request schema for M1; full export/persistence features do not block it |
| Equipment | DATA-004/005/006: verified definitions/effects; engine/build resolver: execution; product plan: selection | One source of combat values; no UI reimplementation or parallel legacy table expansion |
| Explanation | ENG-011/OPT-010: trace and comparison evidence; product plan: readable presentation | One metric definition, with event references and explicit causal limits |
| Coverage | DATA-003: source/execution matrix; mechanics: capability support; product plan: disclosure | Distinguish field verification, implementation and current unlock state |
| Regression evidence | QA tasks: independent verification; each owner: focused tests | QA complements implementation tests and checks actual public wiring |

Product-plan dependency aliases resolve as follows. A dependency means the
specific interface slice a feature uses, not completion of every task in a track.

| UX alias | Concrete planning references |
|---|---|
| D-COVER | DATA-001/003, MECH-001 and capability acceptance |
| D-GEAR | DATA-004/005/006, ENG-012 |
| E-RUN | ENG-001/002, OPT-001, early PLAT-003 |
| E-TRACE | ENG-011 and each emitting mechanic's trace contract |
| O-JOB | OPT-008/009, PLAT-004 |
| E-LOOP | OPT-006, ENG-002/003/006 |
| E-SCENE | DATA-008, ENG-009/010 |
| P-STORE | PLAT-002 and project-schema slice of PLAT-003 |
| P-SHARE | Full PLAT-003 at M5; optional PLAT-010 hosting later |
| P-IMPORT | DATA-009, PLAT-006 |

Coverage labels and the M1 search interface can consume the existing bundled
coverage/version information through an agreed contract; they need not wait for
M5 persistence or the full import/export system.

## 11. Decisions and optional scope

The overview explicitly establishes the website optimizer and comparison workflow
as product goals; old questions asking whether any optimizer UI is wanted no
longer block planning. The following remain proposed defaults or future choices:

| Decision | Recommended planning default | Revisit when |
|---|---|---|
| First audience | Approachable defaults with expert disclosure | First usability sessions reveal a mismatch |
| Storage | Local-first, portable export | Cross-device demand justifies accounts |
| Search execution | Browser worker first | Measured jobs exceed reasonable device budgets |
| Mobile | Full core journey with alternate dense views | Advanced tool layout requires explicit tradeoffs |
| Build optimization | Later inventory-constrained feature | Equipment/effects coverage and scope are approved |
| Team search | Later bounded candidate roster | Build search and compute budgets are established |
| Account imports | Explicit user-chosen public/exported data | Provider terms/schema/rate limits are verified |
| Public sharing | Immutable snapshots with versions/limitations | Hosting and access policy are selected |
| Multiple languages | Complete Chinese experience first | Translation maintenance capacity exists |
| Community publishing | Curated examples before social features | Moderation and provenance workflows exist |

Keep out of the initial product: game automation, gameplay bots, credential-based
account scraping, invented future/beta kits presented as released, artifact roll
RNG, monetized resource advice, and claims of universal optimality or exact game
emulation without corresponding evidence. A natural-language assistant, if ever
added, must propose editable inputs and cite deterministic simulation output;
it cannot invent damage values or replace the combat engine.

## 12. Maintaining the plan

After each implementation cycle, update PROJECT-STATUS with actual evidence and
the relevant task status here/in its domain plan. Preserve task IDs and record
superseded decisions rather than leaving two contradictory active roadmaps.
Revisit priorities after each milestone, a data-version change, or a discovery
that invalidates a model assumption. Planning comprehensiveness is not a promise
to implement every optional feature before delivering the core tool.

## 13. Risks to resolve before they become expensive

| Risk | Failure users would see | Planned prevention |
|---|---|---|
| Source validation only logs errors | Plausible unsupported values presented as verified | Emission refusal/withholding tests, conflict fixtures and immutable manifests |
| UI and engine use different equipment registries | Selecting a verified-looking item runs old values | Registry cutover and UI-to-engine field/effect reconciliation |
| Derived support labels overclaim | “Supported” perk has no effect | Coverage staged by source, representation, execution and live wiring |
| Delayed events execute inside the wrong cast order | Buff/reaction timing wrong after swaps | Shared ordered event queue with cancellation and stable tie rules |
| Checkpoint omits pending effects | Optimization and full replay disagree | Full future-state inventory, cold/resume fixtures and compatibility fingerprint |
| Worker serializes callbacks | Search crashes or silently loses modifiers | Plain-data transport and resolver construction inside execution context |
| Search completes after a build edit | Old result labelled with a new team | Request IDs, immutable run snapshot and stale-response rejection |
| Damage/DPS use different windows | Short/incomplete runs rank deceptively well | Explicit horizon and denominator; apples-to-apples comparison rules |
| Expected damage drives probabilistic triggers | Deterministic number represents an invalid branch | Explicit event semantics, supported approximations, or source-blocked behavior |
| Equipment dominance pruning assumes all stats help | Useful conditional loadouts disappear | Effect-aware safe pruning; preserve candidates when dominance is unproven |
| End energy mistaken for repeatability | “Loopable” rotation fails its second burst | Multi-cycle replay and cooldown/resource/aura state diagnostics |
| Silent version migration | Shared result cannot be reproduced | Versioned data/engine/schema identities and explicit migration copies |
| Trace payload grows without bound | Browser freezes despite fast scoring | Summary/detail modes, bounded trace retention and measured memory budgets |
| Public search accepts unbounded work | Service overload/cost spikes | Admission limits, quotas, cancellation and bounded jobs |
| Community ranks unlike assumptions together | Misleading “best team” comparisons | Scenario/version/support labels and narrowly comparable cohorts |

## 14. Definition of a useful first public version

The first public version does not require complete game coverage. It does require:

- A declared supported roster/mechanic subset, with every caveat reachable from
  setup and results; no blanket “all characters accurate” marketing claim.
- A complete build → author/search → simulate → compare → save/export journey.
- Real sourced equipment on the execution path, with unsupported conditional
  effects excluded and disclosed.
- Search that remains responsive, can be cancelled and returns replayable,
  correctly labelled suggestions for the selected objective and window.
- Trace-backed damage/energy explanations and no unsupported seamless-loop claim.
- Reproducible examples, clear data versions and a useful issue-report export.
- Keyboard-accessible and mobile-usable core controls with verified text wrapping.
- Automated regression gates, recoverable releases and an appropriate privacy /
  asset-source policy for the selected hosting mode.

A release candidate should be tested using: a simple direct-damage team, an
amplifying-reaction team, an energy-constrained team, a sourced off-field/timed
effect team supported by the current engine, an unsupported-effect team that
must disclose limitations, and a deliberately invalid imported project. Each
fixture pins its data/engine versions and expected behavior rather than depending
on whichever upstream data happens to be current that day.
