# TASK #073 — 多页面产品重构规范

Owner: `uiux-engineer`（gpt-5.6-sol）  
Implementation owner: `frontend-engineer`（gpt-5.6-luna）  
Status: implementation-ready design specification; Manager review required  
Date: 2026-09-08

This specification turns the current single-page simulator into a Chinese-first,
multi-page rotation-analysis product. It changes information architecture and
presentation only. It does not authorize new mechanics, data claims, persistence,
Worker behavior, or public deployment.

Authoritative dependencies:

- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for tokens, Chinese typography, contrast,
  motion and semantic states.
- [COMPONENTS.md](COMPONENTS.md) for existing team, energy, timeline, tier and
  disclosure contracts.
- [OPTIMIZER-UI-064.md](OPTIMIZER-UI-064.md) for immutable search runs,
  cancellation, replay and adoption.
- [CHARACTER-DETAIL-046.md](CHARACTER-DETAIL-046.md) for talent, perk and
  simulation-coverage truth tables.
- [MASTER-PLAN.md](../MASTER-PLAN.md) for product milestones and capability status.

Where this document conflicts with an earlier recommendation to keep all work on
one page or to avoid `/character/[id]`, this document supersedes that recommendation.
The product owner explicitly requested a multi-page product. The detailed honesty,
data, accessibility and interaction rules in the earlier documents remain binding.

---

## 1. Product direction

The product has four jobs, each deserving a stable place:

1. **Configure** a real team, builds, enemy and assumptions.
2. **Author or search** a legal rotation.
3. **Simulate** the chosen rotation deterministically.
4. **Understand and compare** what happened, with the exact limits of the model.

The interface should feel like a compact desktop tool rather than a long form or a
marketing dashboard. The references contribute two useful patterns:

- A.J.A.X.: persistent application navigation, dense status summaries, collection
  browsing with a master/detail split, and quiet Genshin visual cues.
- KeqingMains: searchable entity catalogs, deep entity pages, a local table of
  contents and readable long-form technical sections.

Do not copy their branding, logos, artwork, content, ad layout, serif typography or
English copy. Preserve this project's restrained dark palette, system font, amber
action accent, existing element tokens and stricter disclosure model.

The primary product sentence is:

> 配置队伍与循环，运行确定性战斗模拟，并查看每个结果的依据与限制。

Never lead with `最强`, `最优`, `完美循环` or a global-accuracy promise.

---

## 2. Information architecture and routes

### 2.1 Primary navigation

The application shell has six top-level destinations in this order:

| Label | Route | Job |
|---|---|---|
| 总览 | `/` | Resume work, see current configuration and latest trustworthy result |
| 队伍与配装 | `/team` | Build the four-character team and configure equipment/progression |
| 循环编辑 | `/rotation` | Author, validate and reorder actions |
| 循环搜索 | `/optimizer` | Search within a declared objective, window and budget |
| 模拟分析 | `/analysis` | Read the latest run summary, breakdown and timeline |
| 对比与历史 | `/compare` | Compare compatible runs and browse session/saved history |

Supporting catalogs are reached from `/team`, global search and entity links:

| Route | Purpose |
|---|---|
| `/characters` | Searchable character catalog |
| `/characters/[characterId]` | Character facts, build controls, talent data and simulation coverage |
| `/weapons` | Searchable weapon catalog |
| `/weapons/[weaponId]` | Weapon stats, refinement values, effect coverage and equip action |
| `/artifacts` | Artifact-set catalog and filters |
| `/artifacts/[setId]` | Set bonuses, provenance, modelled status and equip action |
| `/optimizer/runs/[runId]` | Immutable completed/failed/canceled search record |
| `/analysis/runs/[runId]` | Immutable simulation run analysis |
| `/analysis/runs/[runId]/timeline` | Full timeline inspector |
| `/history` | All available local/session runs; `/compare` is the task-focused entry |
| `/coverage` | Engine/data coverage, versions and known mechanics limitations |

Routes use plural nouns and stable IDs. Unknown IDs render a named recoverable
error; they are never silently dropped or replaced. Inputs may be deep-linked.
Computed result values are never trusted from query parameters.

### 2.2 Route readiness

| Route group | Current dependency | First implementation behavior |
|---|---|---|
| `/`, `/team`, `/rotation`, `/analysis` | Existing page state, team builder, editor, simulation result | Implement now by extracting current regions without changing engine calls |
| `/characters*`, `/weapons*`, `/artifacts*` | Existing registries and picker presentation models | Implement now; disabled/effect caveats remain data-driven |
| `/optimizer` | Existing synchronous adapter | Show the shipped bounded-search slice with its current honest disclosure; do not offer real cancel/progress |
| `/optimizer/runs/[runId]` | Full O-JOB contract from TASK #064 | Route shell may land now; immutable records become complete only after Worker job identity exists |
| `/analysis/runs/[runId]` | `SimulationRun` identity | Session-memory record first; local durable history waits for PLAT-002/003 |
| `/compare`, `/history` | Retained `SimulationRun` snapshots | Session history first, clearly labelled `本次会话`; durable saved projects wait for M5 |

The UI must never simulate a future capability. If a route needs a contract that has
not landed, render a useful local state explaining the limit and link to the nearest
available workflow.

### 2.3 Shared page context

All workflow routes operate on one current draft. Navigation must not discard it.
The initial extraction target is a frontend-owned state boundary:

```ts
interface WorkspaceDraft {
  team: Team;
  activeCharacterId: string | null;
  equippedWeapons: Readonly<Record<number, EquippedWeaponSelection>>;
  equippedArtifacts: Readonly<Record<number, EquippedArtifactSelection>>;
  enemy: EnemyState;
  rotation: Rotation;
  simulationConfig: Partial<SimulationConfig>;
  searchDraft: SearchDraft;
  revision: number;
}

interface WorkspaceRuns {
  currentSimulation: SimulationRun | null;
  sessionSimulationRuns: readonly SimulationRun[];
  currentSearch: SearchRunViewModel | null;
  sessionSearchRuns: readonly SearchRunViewModel[];
}
```

This is application state, not a second combat model. Existing pure adapters compute
fingerprints, roster views, breakdown rows and timeline models. Components receive
display-ready values. State persistence and migrations remain platform work.

---

## 3. Application shell

### 3.1 Desktop, `>=1024px`

A fixed 224px left rail follows the A.J.A.X. application pattern without its
branding. The main canvas fills the remaining width, capped at `max-w-7xl` for
ordinary pages and allowed to use the full available width for the timeline.

```
┌──────────────┬──────────────────────────────────────────────────────┐
│ 循环研究所    │ Breadcrumb / page title              当前草稿状态  │
│              ├──────────────────────────────────────────────────────┤
│ 总览          │                                                      │
│ 队伍与配装    │ Page content                                         │
│ 循环编辑      │                                                      │
│ 循环搜索      │                                                      │
│ 模拟分析      │                                                      │
│ 对比与历史    │                                                      │
│              │                                                      │
│ 模拟覆盖      │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

- Rail uses `surface.raised`; selected route uses amber left rule, subtle
  `amber-500/10` fill and `aria-current="page"`.
- Product name is text, no copied game or reference-site logo.
- Bottom rail contains `模拟覆盖`, data/engine version summary and a disclosure
  link, not an account avatar until accounts exist.
- The page header contains breadcrumbs, `h1`, optional supporting sentence and a
  compact draft status: `已配置 4 人 · 12 个动作 · 结果已过期`.
- Use links for routes and buttons for actions. Route selection is never a set of
  stateful buttons.

### 3.2 Tablet, `640–1023px`

The rail collapses to a 64px icon-and-short-label column. Page title and the
full current-step label remain in the header. At 200% zoom, use the mobile shell
rather than preserving the narrow rail.

### 3.3 Mobile, `<640px`

- Top app bar: product name, current page title, `打开导航` button.
- Navigation opens as a full-height sheet with the six routes in DOM order.
- Persistent bottom action bar appears only when the route has one clear primary
  action: `保存队伍`, `运行模拟`, `开始搜索`. It respects safe-area insets.
- No page-level horizontal scroll. Tables become definition lists or have a named,
  visibly scrollable container only when lossless conversion is impossible.
- Browser Back returns to the prior route and preserves draft state and scroll
  position where practical.

### 3.4 Global route states

| State | UI |
|---|---|
| hydrating URL/current draft | Route-shaped skeleton; never a centered spinner |
| unknown route entity | `找不到该角色（ID：{id}）。` + catalog link; keep current draft |
| route prerequisite absent | Explain the requirement and primary recovery action |
| stale current result | Persistent warning in header and affected page; old run remains linked by its immutable identity |
| runtime error | Page-level error boundary with `重试` and `返回总览`; never clear the draft |
| offline/local data | Existing bundled data continues; never imply a network refresh is required |

---

## 4. Dashboard / 总览 `/`

The dashboard is a launchpad and status page, not a miniature copy of every route.
It answers: what am I working on, what is trustworthy, and what should I do next?

### 4.1 Layout

1. **Current draft summary**: team portraits, enemy, rotation action count, crit
   mode and observation window. Actions: `继续配置`, `编辑循环`.
2. **Primary next action**: exactly one state-dependent card.
3. **Latest run**: total damage, DPS, duration and status disclosures in one
   bordered block; `查看分析`.
4. **Latest search**: status/count/budget and `查看候选`; omitted if never run.
5. **Session history**: last five runs as compact rows; `查看全部`.
6. **Coverage notice**: one quiet, always-reachable link to `/coverage`.

No four-card hero-metric row. Tier caveats remain above the result numbers. An
engine error suppresses result metrics as specified in DASHBOARD §12.

### 4.2 Next-action states and Chinese copy

| Condition | Heading | Body | Action |
|---|---|---|---|
| no team | `先配置出战队伍` | `选择至少1位角色，然后设置其配装与天赋。` | `前往队伍配置` |
| team, no rotation | `编排一个战斗循环` | `添加切人、攻击、战技或爆发动作。` | `前往循环编辑` |
| runnable, no run | `配置已就绪` | `当前队伍包含 {n} 位角色、{m} 个动作。` | `运行模拟` |
| stale run | `配置已更改` | `最新结果仍对应之前的配置。重新运行后才会更新。` | `重新运行模拟` |
| fresh run | `本次结果可分析` | `结果与当前配置一致。` | `查看完整分析` |

The dashboard consumes `DashboardState`, `SimulationRun`, search view models and
display adapters. It does not determine action legality or support status.

---

## 5. Team and build `/team`

### 5.1 Desktop layout

Use a two-column workbench:

- Main column: four positional team slots, resonance summary, enemy/scenario.
- Right 360px inspector: selected slot's build summary and quick actions.

The inspector is non-modal and follows the selected slot. `查看角色详情` opens the
character page while keeping a return link to `/team?slot={n}`. Existing dialogs
remain for collection picking during the first migration slice; they may later
become route-based catalog overlays.

### 5.2 Slot and build content

Each slot shows character, element/form, progression, selected weapon, artifact
set summary, key total stats, support deviation and config completeness. Existing
TeamSlot duplicate, Traveler, keyboard reorder, result invalidation and caveat
rules remain binding.

Right inspector sections:

1. `角色与成长`: level, ascension, three talent levels, constellation.
2. `武器`: weapon, level, refinement and modelled-passive state.
3. `圣遗物`: selected set/pieces or declared manual-stat mode.
4. `实战总属性`: user-entered or resolved values, clearly labelled by source.
5. `模拟覆盖`: per-character summary, always visible before save.

Never imply an equipment effect participates in combat because its descriptive
text exists. Each effect must independently use the §11 vocabulary: `已模拟`,
`已收录说明`（contextual short form: `仅说明`）, `未建模` or `未核验`.

### 5.3 Component contract

```ts
interface TeamPageProps {
  draft: WorkspaceDraft;
  roster: readonly CharacterRosterItem[];
  selectedSlot: number | null;
  latestRun: SimulationRun | null;
  onSelectSlot(slot: number): void;
  onTeamChange(next: Team): void;
  onCharacterConfigChange(slot: number, next: WebsiteCharacterDefinition): void;
  onWeaponChange(slot: number, next: EquippedWeaponSelection): void;
  onArtifactChange(slot: number, next: EquippedArtifactSelection): void;
  onEnemyChange(next: EnemyState): void;
}
```

All build mutations increment the workspace revision and recompute staleness. A
mutation never relabels an existing run.

### 5.4 Mobile

Slots form a vertical list. Selecting a slot opens an inline accordion immediately
below it; only one is open. Detailed character/build editing uses a full-height
route/sheet. Reorder uses visible up/down buttons. The primary `保存并继续编辑循环`
action remains reachable in the bottom action bar.

---

## 6. Entity catalogs and detail pages

### 6.1 Shared catalog contract

`/characters`, `/weapons` and `/artifacts` use a common collection shell:

1. `h1` + count + baseline coverage sentence.
2. Search input.
3. Faceted filters and stable sort.
4. Grid/list results.
5. Optional preview pane at desktop.

This follows the references' collection strength while retaining the existing
roving-focus and filter rules. Catalog cards are links to detail routes. `装备到…`
is a separate button/menu; do not make one control both navigate and equip.

```ts
interface CatalogPageModel<TItem, TFilters> {
  title: string;
  totalCount: number;
  visibleCount: number;
  query: string;
  filters: TFilters;
  sort: string;
  items: readonly TItem[];
  empty: CatalogEmptyState | null;
  coverageBaseline: CoverageBaseline | null;
}
```

Queries and filters live in the URL. The current team/build does not.

### 6.2 Character catalog `/characters`

Retain the existing element, weapon and rarity filters; no subjective role filter.
The Traveler remains one identity with form selection. Card content: portrait,
Chinese name, element/form, rarity, weapon type and a support-deviation marker.
Baseline coverage is stated once when it has a strict majority.

Desktop uses a 4–6 column grid plus a 320px preview pane after selection. Mobile
uses two columns and no preview pane. The roving grid remains one tab stop if cards
are implemented as composite selection controls; if every card is a normal link,
use ordinary link tab order and pagination/windowing so the page does not expose
139 consecutive stops. Do not mix these two keyboard models.

### 6.3 Character detail `/characters/[characterId]`

The page converts CHARACTER-DETAIL §15 from a dialog into a durable entity page.

Desktop layout:

- 240px local contents rail: `概览`, `属性`, `天赋与技能`, `命之座与固有天赋`,
  `模拟覆盖`, `数据来源`.
- Main reading column, `max-w-4xl`.
- Sticky build action strip: target slot, `应用到队伍`, `返回队伍`.

Page header: portrait, name, element, rarity, weapon type, current configured
level/constellation and full coverage sentence. `模拟覆盖` is visible in the first
viewport; do not bury it at the bottom of a KQM-style long guide.

The four-row perk truth table remains exact:

| Executable effects | Chinese description | Render |
|---|---|---|
| present | present | `已建模并参与计算` |
| present | absent | `已建模（暂无中文说明）` |
| absent | present | `仅说明；效果未参与计算` |
| absent | absent | `暂无数据` |

The page distinguishes `source prose`, `presentation metadata` and `engine
execution`. `已解锁` describes eligibility only; it never implies the current
rotation triggered the effect.

Required data: registry character, configured overlay, ability detail model,
perk rows, coverage/tier presentation, field-level provenance and source version.
If unverified fields are still unavailable as runtime data, show the coverage that
is known and omit field badges; never infer them from comments.

### 6.4 Weapon catalog/detail

`/weapons` filters by weapon type, rarity and effect support. Cards show name,
rarity, type, level-90 base ATK only when sourced, substat and passive coverage.

`/weapons/[weaponId]` sections:

1. `武器概览`: image, type, rarity, available level/refinement.
2. `基础属性`: sourced values by selected level.
3. `精炼效果`: R1–R5 tabs/table with exact values.
4. `模拟覆盖`: static stats and each modifier channel independently.
5. `数据来源与版本`.

Required data: generated weapon definition, `ResolvedWeaponView`, live-registry
identity, selected level/refinement and effect support metadata. The detail page
must expose whether the live execution path uses this generated definition. If
that proof is unavailable, say `武器数值可查看；当前执行路径尚未核验。`

### 6.5 Artifact catalog/detail

`/artifacts` is a set catalog first. Filters: 2-piece/4-piece support, stat/effect
category, source verification. Do not imply an inventory tracker exists.

`/artifacts/[setId]` sections:

1. `套装概览`.
2. `2件套效果`.
3. `4件套效果`.
4. `触发条件与影响范围`.
5. `模拟覆盖`.
6. `数据来源与版本`.

Each set effect row carries one of:

- `✓ 已模拟` — declarative effect is connected to the engine path.
- `◇ 仅说明` — readable description exists, execution is unproven.
- `⚠ 未建模` — known missing effect with an explicit result consequence.
- `◇ 未核验` — a specific authored value lacks verification.

Required data: artifact set registry, generated set effects, executable set-bonus
mapping and provenance. Static two-piece stats and conditional four-piece effects
must not be collapsed into one set-level boolean.

### 6.6 Entity page states

| State | Behavior |
|---|---|
| loading | Header and section skeletons at final geometry |
| unknown ID | Named error with catalog recovery link |
| described but unmodelled | Show prose and adjacent `仅说明；未参与模拟` |
| executable but no prose | Show effect summary derived from structured data and `暂无中文说明` |
| field absent | `—` plus `该数据未收录，不代表数值为0。` where absence/zero matters |
| cannot equip | Disabled action with visible reason, e.g. weapon type mismatch |

---

## 7. Rotation editor `/rotation`

### 7.1 Layout

Desktop is a three-pane editor:

- Left 260px: character/action palette with legal action classes.
- Center: ordered rotation steps and validation markers.
- Right 320px: scenario summary, duration, energy/cooldown preview and selected
  action details.

The palette must derive from the configured team's effective action space. Do not
hard-code capabilities that the generator/validator cannot emit. A disabled burst
shows the exact energy/cooldown reason beside it.

Top actions: `撤销`, `重做`, `清空`, `运行模拟`. `清空` confirms; single-step delete
uses the existing undo-window decision. Search handoff banner remains above the
editor: `编辑器当前使用候选 #{rank}。搜索前的循环已保留。`

### 7.2 Component contract

```ts
interface RotationWorkspaceProps {
  team: readonly WebsiteCharacterDefinition[];
  rotation: Rotation;
  actionOptions: readonly ActionOptionView[];
  validation: RotationValidationView;
  selectedActionId: string | null;
  adoptedCandidate: AdoptedCandidateView | null;
  onRotationChange(next: Rotation, reason: RotationEditReason): void;
  onRun(): void;
  onRestoreIncumbent(): void;
}
```

`ActionOptionView` carries legality and display-ready reason from the adapter. The
component never calls damage math or reconstructs cooldown/energy rules.

### 7.3 Mobile

One pane at a time: `动作序列` is primary; `添加动作` opens a bottom sheet grouped
by character; `动作详情` opens after selecting a row. Drag may enhance reordering,
but 44px up/down buttons and keyboard commands remain. Every action name and error
wraps; notation is supplemental to the accessible chronological list.

### 7.4 States

- Empty: `尚未添加动作。可从角色动作列表添加，或前往循环搜索。`
- Orphaned actions: name count and affected character/form; never silently delete.
- Invalid action: remains in editor with structured reason and remedy.
- Running: editor remains readable; mutation policy follows run identity and must
  not relabel the active run.

---

## 8. Optimizer `/optimizer` and search run detail

`OPTIMIZER-UI-064.md` remains authoritative. This section places that workflow in
the multi-page product.

### 8.1 Search page

Two-column desktop layout:

- Left 360px sticky conditions panel: objective, 5–60 second window, effort,
  effective scope and start/retry actions. Add cancel only after the O-JOB Worker
  contract is active.
- Right: immutable active-run status, candidate list and selected preview.

The current team/build/enemy summary is visible before start. `编辑队伍` and
`编辑环境` are route links. If those inputs change during an async run, the run
summary stays frozen and a stale warning appears.

Current synchronous slice copy:

> 当前搜索在主线程中一次完成，暂不提供实时进度与取消。结果仅代表本次预算内找到的候选。

Do not render queued, canceling, progress percent or ETA until the Worker emits the
corresponding event.

### 8.2 Candidate row

Each row shows rank, objective score/unit, actual replay duration, action count,
fresh/stale comparison state, first eight actions, limitations and `查看候选`.
Selection is non-destructive. Adoption says `复制此候选到编辑器` and preserves the
incumbent rotation. Candidate IDs and engine rank are stable; array index is never
identity.

### 8.3 Search run route `/optimizer/runs/[runId]`

This is an immutable record view. Header includes status, completed time, objective,
effective budget, nodes/depth, stop reason and request fingerprint/version. It has
no editable controls. Actions: `使用相同条件重新搜索`, `复制候选到编辑器`,
`加入对比`.

Required data and event contract are exactly TASK #064 §8. If no retained run
exists, render `本次会话中找不到该搜索记录。` and return to `/optimizer`.

---

## 9. Analysis and timeline

### 9.1 Analysis `/analysis` and `/analysis/runs/[runId]`

The default route points to the latest run. The ID route reads one immutable run.
Layout order:

1. Per-team caveat/error above metrics.
2. One summary block: total damage, DPS, duration, swaps and observation window.
3. Damage by character.
4. Damage by ability.
5. Damage by element/reaction where emitted.
6. Compact timeline preview.
7. Energy/cooldown diagnostics and known mechanic gaps in disclosures.

Do not infer repeatability from ending energy. Until multi-cycle replay establishes
it, use `循环可重复性尚未验证` rather than `循环顺畅` or `可无缝循环`.

```ts
interface AnalysisPageModel {
  run: SimulationRun;
  identitySummary: RunIdentityView;
  trustNotices: readonly TrustNotice[];
  headline: ResultHeadlineView | null;
  breakdowns: BreakdownTablesView;
  timeline: TimelineModel;
  energy: EnergyPanelModel;
  engineLimitations: readonly MechanicLimitationView[];
}
```

If the run has engine errors, `headline` is null and the error takes its place.

### 9.2 Full timeline `/analysis/runs/[runId]/timeline`

Desktop reserves the full content width for four lanes and a 340px selected-event
inspector. The KQM local-contents concept becomes filters: `动作`, `伤害`, `能量`,
`警告`, then character lanes. Use the existing shared x-axis, real-width swaps,
roving focus and chronological alternative.

Mobile defaults to the chronological event list. Optional lane mode shows one
character at a time. Event detail is a bottom sheet. Never shrink the four-lane
chart into the viewport.

Timeline filters alter presentation only; they do not recompute the run. Selected
event identity is stable across display filtering when the event remains visible;
otherwise clear selection and announce it.

### 9.3 Timeline states

Reuse COMPONENTS §3.8: empty, all skipped, errors, long and dense. A missing full
trace is distinct from an empty trace: `此记录仅保留摘要，无法查看事件时序。`

---

## 10. Compare and history

### 10.1 `/compare`

The comparison workflow begins with two run selectors, A and B. Compatible runs
must share team/build, enemy, simulation settings, objective/window semantics and
engine/data version unless a difference is explicitly selected as the thing being
tested.

Header states:

- `可直接比较` when identity matches.
- `条件不同` followed by exact differing fields.
- `版本不同，不能归因` when engine/data versions differ.

Never compute a percentage when the baseline is zero/nonpositive. Never attribute a
damage delta to a cause unless trace evidence supports it.

Sections:

1. Setup differences.
2. Headline delta with baseline state.
3. Character/ability/element aligned tables.
4. Duration, swap time, action counts and warnings.
5. Aligned event evidence where possible.
6. `可以确认` vs `仅观察到` explanations.

```ts
interface ComparisonPageModel {
  left: ComparableRunSummary | null;
  right: ComparableRunSummary | null;
  compatibility: ComparisonCompatibility;
  metricRows: readonly ComparisonMetricRow[];
  setupDifferences: readonly SetupDifference[];
  evidence: readonly ComparisonEvidence[];
  limitations: readonly string[];
}
```

### 10.2 `/history`

Before durable persistence, heading is `本次会话记录` with visible copy:
`关闭或刷新页面后，这些记录可能消失。` Rows show run kind, team, timestamp,
result/status, duration/objective and version. Actions: `查看`, `加入对比`.

Empty: `本次会话还没有记录。运行一次模拟或循环搜索后，记录会显示在这里。`
Loading is only valid after persistence exists. A session array read is synchronous
and must not get a fake spinner.

When M5 lands, the route can add saved-project filters, tags, import/export and
migration states without changing the row contract.

---

## 11. Coverage `/coverage`

This page centralizes evidence without removing contextual warnings elsewhere.
Sections:

1. `当前版本`: engine, data manifest, optimizer and schema identities.
2. `角色覆盖`: derived support tier, claim disagreements and per-character reason.
3. `装备覆盖`: static values vs executable effects.
4. `机制限制`: `UNSUPPORTED_MECHANICS` and uncertain items.
5. `结果如何解释`: sourced facts, assumptions, described-only effects and executed
   effects.

Exact vocabulary:

| Label | Meaning |
|---|---|
| `已模拟` | Structured effect is connected to the execution path and tested |
| `已收录说明` | Human-readable description exists; it may not affect simulation |
| `未建模` | Known effect/mechanic does not execute |
| `未核验` | A specific value lacks required corroboration |
| `搜索候选` | Best found within declared deterministic budget; not global optimum |

Do not use one `支持` boolean across these categories.

---

## 12. Visual system for the multi-page shell

This extends rather than replaces DESIGN-SYSTEM.

### 12.1 Color

- Page: `surface #0d0f17`.
- Rail/panels: `surface.raised #161a26`.
- Borders: `surface.border #242a3a`.
- Primary action and selected route: amber.
- Elements: existing eight measured tokens only.
- States: existing success/warning/error/info triplets only.

No purple theme copied from the references, no gradients for data/status, no
colored glows and no decorative hover elevation. A faint, low-contrast elemental
line or watermark may appear in an entity header only if it carries no information,
does not reduce contrast and uses no remote game asset.

### 12.2 Typography

- `html lang="zh-CN"`.
- Existing CJK-capable system stack, no webfont.
- Page `h1`: `text-2xl`, weight 600. Entity name may reach 28px only in its detail
  header; this is the sole extension above the existing scale and should be added
  as a named `entity-title` token if implemented.
- Section `h2`: `text-lg`, weight 600.
- Body: 14/22px Chinese line height.
- Numeric comparisons: mono + tabular numerals; never put Han text in mono.
- No `text-balance`, no `ch` widths, no English-sized fixed text boxes.

### 12.3 Spacing and surfaces

- App shell outer padding: 16px mobile, 24px tablet, 32px desktop.
- Section gap: 32px. Card gap: 16px. Dense row: `px-3 py-2`.
- Default card padding: 16px.
- Radii remain the closed set: `sm`, `md`, `xl` overlays only, `full` avatars.
- Cards use borders and at most the existing `shadow-sm` token.
- Collection/detail split has one enclosing bordered surface and one divider,
  avoiding a card per row.

### 12.4 Standard components

| Component | Contract |
|---|---|
| `AppShell` | rail/mobile navigation, skip link, main landmark, page header |
| `PageHeader` | breadcrumbs, h1, supporting copy, draft/run state |
| `LocalContents` | anchor navigation for entity/coverage pages; collapses to horizontal scroll/menu on mobile |
| `CatalogShell` | URL filters, count, results, preview and empty recovery |
| `TrustNotice` | typed state + visible explanation + optional detail link; never tooltip-only |
| `RunIdentitySummary` | exact inputs/version/age/freshness; no mutable controls |
| `MetricGroup` | related metrics in one bordered block; no hero-card grid |
| `MasterDetail` | selected list item + detail, DOM order list before detail |
| `MobileActionBar` | one primary plus at most one secondary action, safe-area aware |

Use existing `Button`, `IconButton`, `StatusChip`, `ElementTag`, `Section`,
`DetailDisclosure`, `LiveRegion`, `Dialog` and avatar components. Do not fork their
focus, state or token logic inside route components.

---

## 13. Accessibility and interaction

1. Every page has one `h1`, logical `h2/h3` order, a skip link and named main/nav
   landmarks.
2. Route links expose `aria-current="page"`. Breadcrumbs use a labelled `nav` and
   ordered list.
3. Changing route sends focus to the new `h1` only after user navigation. Browser
   Back restores prior focus when the target still exists.
4. Filters use labelled form controls and URL state. Results counts announce after
   a settled change, not each keystroke.
5. Page and dialog scroll ownership remain separate. Opening mobile navigation
   locks the body through the existing shared lock.
6. All touch targets are at least 44px at mobile and 200% zoom.
7. No color-only meaning. Glyphs are supplemental and `aria-hidden`; labels carry
   the status.
8. Reduced motion removes route fades, sheet motion and indeterminate animation;
   static status text remains.
9. Numeric tables use semantic `<table>` on desktop when genuinely tabular and a
   labelled definition-list layout on mobile.
10. Charts have an equivalent chronological/table view. Timeline selection uses
    the existing roving-focus model.
11. Disabled controls carry a visible reason except self-evident list bounds already
    exempted by the design system.
12. Errors that block action use associated inline text; async completion uses one
    polite live region per workflow, never nested announcements.
13. At 320px and at 200% zoom, no page-level horizontal scrolling, clipped Chinese
    copy or unreachable primary action.

---

## 14. Loading, empty, error and stale-state matrix

| Surface | Loading | Empty | Error | Stale |
|---|---|---|---|---|
| Catalog | 12 geometry-matched skeletons | Name active query/filters + clear action | Keep usable records; isolate failed item | Not applicable |
| Entity | Header/section skeletons | Not legitimate; missing ID is error | Named entity/field error + catalog return | Configured overlay differs from current draft: show both identities |
| Team | Four slot skeletons | Four full-height add affordances | Preserve other slots and name failed data | Latest run warning; run remains accessible |
| Rotation | Editor skeleton only during draft hydration | Teach add/search paths | Keep actions and show structured validation issue | Adopted/search source stale badge |
| Optimizer | Only real queued/running state may show job UI | Successful zero-candidate state | Failed is not zero candidates | Freeze request summary and retain outcome |
| Analysis | Run-shaped skeleton only when loading persisted record | `尚未运行模拟` + configure action | Suppress headline if engine error | Old result readable with provenance banner |
| Compare | Skeleton only for stored-run load | Prompt to select A and B | Failed run remains selectable as failure evidence, not metrics | Compatibility panel names mismatch |
| History | Only after async storage exists | Session-specific empty copy | Preserve readable records, isolate failed load | Version badges per row |

Skeletons reserve final geometry. Synchronous local reads do not get loading theater.

---

## 15. Migration from the current single page

Implement in reversible slices. Do not combine route extraction with engine or game
data refactors.

### Slice 1 — shell and route aliases

1. Create shared `AppShell`, `PageHeader` and mobile navigation.
2. Add `/team`, `/rotation`, `/optimizer`, `/analysis` routes using the current
   components and one lifted workspace state provider.
3. Keep `/` as a temporary redirect/overview that can still reach every current
   feature.
4. Preserve existing `team`, roster-filter and view query decoding. Translate the
   old `view=setup/results/all` links to the nearest route; do not break them.

### Slice 2 — dashboard and catalogs

1. Build the real dashboard from derived state.
2. Turn existing character/weapon/artifact picker models into catalog routes.
3. Keep pickers as overlays launched from `/team`, backed by the same models; no
   duplicated filtering or coverage logic.
4. Add entity detail routes and return-to-slot context.

### Slice 3 — analysis routes

1. Extract result summary and breakdown into `/analysis`.
2. Add immutable run selection in session memory.
3. Move full timeline to its own route while retaining a compact preview.
4. Add session history and comparison with strict compatibility rules.

### Slice 4 — full search lifecycle

1. Land the O-JOB Worker contract.
2. Replace synchronous-only search disclosure with real queue/progress/cancel.
3. Add immutable `/optimizer/runs/[runId]` records.
4. Preserve candidate adoption and one-level incumbent restore.

### Slice 5 — durable projects

Only after PLAT-002/003: local persistence, migrations, portable export/import and
durable history. Route structure does not need to change.

During migration, there must be one owner for workspace state and one instance of
each editor/result region. Do not render the old entire page behind the new routes.

---

## 16. Acceptance criteria

### Information architecture

1. The six primary destinations are real routes and reload at the same destination.
2. Every current core task is reachable in at most two primary-navigation actions.
3. Browser Back/Forward preserves route, catalog filters and the current draft.
4. Old `view=` links resolve to the correct new route without silently changing the
   team.
5. Unknown entity/run IDs render named recovery states.

### Trust and correctness

6. No route component computes damage, reactions, energy rules, legality, support
   tier or search rank.
7. Every result metric is bound to an immutable run identity; changing draft inputs
   never relabels it.
8. Character, weapon and artifact details distinguish executable, described-only,
   missing and unverified information at effect/field grain.
9. Search always says `本次预算内找到的候选`; forbidden optimality claims do not
   appear except in explicit denials.
10. Ending energy alone never produces a loopability claim.
11. Engine errors suppress headline metrics; empty, failed, canceled and stale are
    distinct states.
12. Static optimizer UI does not expose cancellation/progress until O-JOB is real.

### Responsive and accessibility

13. Desktop rail, tablet compact rail and mobile navigation preserve the same route
    order and accessible names.
14. Keyboard-only users can configure a team, edit/run a rotation, inspect results,
    search/select/adopt a candidate, open an entity and compare two runs.
15. Route focus, dialog focus restore, roving grids/timeline and live announcements
    follow §13.
16. At 320px, 1280×720 at 200% zoom and reduced motion, the core journey has no
    page-level horizontal overflow, clipped warnings or inaccessible action.
17. Chinese names, source notes and limitation copy wrap without fixed-height
    clipping; Han text never uses mono.

### State and integration

18. One workspace revision/fingerprint drives stale detection across all routes.
19. Team/build changes preserve prior run records while clearly marking them as old.
20. Catalog filters and picker filters use the same pure presentation functions.
21. Candidate adoption updates `/rotation`, preserves the incumbent and keeps the
    immutable candidate record.
22. Compare refuses causal/percentage claims when identity or baseline requirements
    are not met.
23. Session history says it is session-only until persistence actually lands.

### Validation expected from implementation

24. Pure tests cover route decoding, legacy redirects, workspace reducer, staleness,
    catalog URL state, run lookup and comparison compatibility.
25. Integration tests cover team → rotation → run → analysis across route changes,
    plus search candidate → editor adoption.
26. Browser checks cover desktop/mobile navigation, Back/Forward, direct entity
    routes, 200% zoom, keyboard, screen-reader announcements and reduced motion.
27. Existing simulation/optimizer tests remain unchanged unless a public contract is
    deliberately and additively revised by its owner.

---

## 17. Luna frontend handoff

### TASK #074 — Multi-page shell and state extraction

**Owner:** `frontend-engineer` / gpt-5.6-luna  
**Goal:** Land migration Slice 1 without changing simulation/search behavior.  
**Dependencies:** TASK #073 accepted; current `runState`, `dashboardState`,
`useUrlState`, team/editor/search/analysis components.  
**Files/module:** `src/app/**`, new frontend-owned shell/state modules under
`src/components` or `src/features/workspace`; no `src/simulation/**` or
`src/game-data/**` edits.  

**Requirements:**

1. Implement `AppShell`, route navigation and mobile sheet.
2. Extract one workspace provider/reducer from `page.tsx`; preserve current default
   team, rotation, configs, run token guard and candidate adoption semantics.
3. Add `/team`, `/rotation`, `/optimizer`, `/analysis`; route existing components
   without cloning their internal logic.
4. Make `/` the TASK #073 dashboard or a minimal safe dashboard if the slice is
   bounded; it must link to all four workflow routes.
5. Translate legacy `view=` URLs to route destinations and preserve team/filter
   query state.
6. Keep the current synchronous-search disclosure. Do not add fake progress/cancel.
7. Use existing tokens and Chinese copy; no new visual theme or engine facts.

**Acceptance criteria:** TASK #073 items 1–7, 12–20 and 24–27 relevant to Slice 1.

**Tests:** route codec/legacy redirects, reducer/staleness, direct-route hydration,
navigation preserving draft, candidate adoption across route change; typecheck,
lint, relevant Vitest and production build.

**Handoff after TASK #074:** UI/UX review at desktop, 320px, 200% zoom, keyboard and
reduced motion; then QA. Catalog/detail extraction should be a separate Luna task
after the shell is accepted so the state migration and catalog redesign do not
share one failure surface.

Canonical worker report:

```
Agent: frontend-engineer
Task: TASK #074 — Multi-page shell and state extraction
Changed: <files>
API / Contracts: <workspace/route contracts, or none>
Tests: <added / result>
Dependencies: TASK #073 + existing frontend adapters
Potential Issues: <legacy URLs, state hydration, responsive limitations>
Ready For: uiux-engineer review, then qa-engineer
```

---

## 18. Deliberate exclusions

- No new Genshin mechanics, source values or equipment execution claims.
- No automatic team/build optimization.
- No accounts, cloud sync, public profiles or social publishing.
- No route-level data fetching added solely to create loading states.
- No copied reference branding, text, artwork, advertising or layout defects.
- No removal of contextual caveats because `/coverage` exists.

The redesign succeeds when the product feels easier to navigate while becoming
more explicit about which facts were sourced, which effects actually executed and
which candidates were merely the best found within a bounded search.
