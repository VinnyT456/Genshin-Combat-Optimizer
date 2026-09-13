# Mobile Dashboard Refinement

Status: proposed design; awaiting product approval before implementation.  
Scope: the single-page dashboard at `/` below `640px`. Desktop behavior, combat
math, search behavior, and dialog redesign are out of scope.

## Goal

Make the main dashboard practical on a phone without turning it into a separate
product. A user should be able to understand the current draft, edit the core
inputs, run a simulation, and read the leading result without horizontal page
scroll or a long hunt for the primary action.

The existing dark, technical, Chinese-first visual identity remains. The work is
responsive refinement and information hierarchy, not a new theme.

## Measured baseline

The current page was inspected at a `390 x 844` viewport with the default team.

- Configure view expands the document to `1,287px` wide and `4,827px` tall.
- Results view expands to `682px` wide because the multi-lane timeline is active.
- The first simulation action appears after the team, setup, and search sections.
- The four full team cards consume roughly `2,000px` before environment setup.
- The audit found many visible controls below the `44 x 44px` mobile target.
- The timeline claims the chronological list is its mobile default, but initializes
  to the multi-lane view.

Primary causes:

- `src/app/page.tsx:599` uses desktop-scale vertical spacing on mobile.
- `src/app/page.tsx:614` places all telemetry and navigation in one dense ribbon.
- `src/app/page.tsx:667` renders a 24px-high view switcher.
- `src/app/page.tsx:717` does not allow its grid children to shrink below their
  min-content width.
- `src/app/page.tsx:768` places the primary action after all configuration tools.
- `src/features/team-builder/TeamSlot.tsx:47` gives every mobile slot a large
  minimum height.
- `src/features/setup/EnemyConfigurator.tsx:136` and
  `src/features/setup/SimulationSettings.tsx:48` retain dense desktop selectors.
- `src/features/setup/RotationEditor.tsx:285` uses 24px action controls.
- `src/features/rotation-timeline/RotationTimeline.tsx:60` initializes the
  desktop lane mode at every viewport width.

## Product invariants

1. `/` remains one dashboard; no route extraction or duplicate workspace state.
2. `?view=all|setup|results`, team deep links, Back/Forward, and draft persistence
   keep working.
3. Existing dialogs remain the detailed editing surfaces.
4. No combat, damage, energy, or search logic moves into the UI.
5. Desktop layout remains materially unchanged.
6. The document order remains useful to keyboard and screen-reader users.

## Mobile layout

### 1. Compact header and draft summary

Use `16px` page padding and `24px` section gaps. Keep the `h1`, shorten its
supporting sentence, and replace the wrapping telemetry ribbon with one bordered
summary group:

```text
原神战斗循环模拟器
配置队伍、编排循环、验证输出

┌──────────────────────────────────┐
│ 4/4 角色        15 个动作         │
│ 训练木桩 · Lv.90  热诚之火         │
├──────────────────────────────────┤
│  全部总览  │  战术配置  │ 数据看板 │
└──────────────────────────────────┘
```

- Summary values use a two-column definition grid, not independent stat cards.
- Long enemy/resonance text truncates visually but retains its complete accessible
  name and existing explanatory title.
- View buttons divide the available width and are at least `44px` high.
- Selected state keeps `aria-pressed`, amber fill, and visible focus treatment.

### 2. Compact configuration flow

The content remains in task order:

1. team;
2. environment and rotation;
3. optional search;
4. simulation.

Team slots stay a vertical list. Each slot becomes a compact summary on mobile:

```text
┌──────────────────────────────────┐
│ [头像] 雷电将军   Lv.90 · 2命  配置 │
│       护摩之杖 · 精1   圣遗物未配置 │
│       攻击 1,069 · 充能 132%       │
└──────────────────────────────────┘
```

Detailed talents and the full stat grid remain available through the existing
character configuration dialog. Weapon, artifact, active-character, reorder, and
remove actions remain reachable; no gesture is the only interaction.

Environment controls use shrinkable containers and mobile selectors:

- enemy level controls become `44px` targets;
- two-column resistance choices become one column at the narrowest width;
- three-option simulation selectors become one column on mobile and three columns
  from `sm` upward;
- labels wrap inside their own card instead of widening the page.

Rotation editing keeps the horizontal sequence ribbon as a named local scroller.
Action rows become at least `44px` high, with `44px` reorder/delete targets. Dense
secondary metadata may hide visually on mobile, but the accessible action name
stays complete.

Search remains below rotation because it is optional. Its controls stack, and its
candidate cards use one score row followed by full-width actions.

### 3. Persistent primary action

Below `640px`, render a fixed bottom action bar above the safe area:

```text
┌──────────────────────────────────┐
│ 就绪 · 4 名角色 · 15 个动作       │
│        [ 执行循环模拟 ]            │
└──────────────────────────────────┘
```

- One primary button, full width, minimum `48px` high.
- Disabled state retains the existing reason text.
- Stale results change the label to `重新执行战斗模拟`.
- `padding-bottom` on the page prevents the bar from covering content or focus.
- Use `env(safe-area-inset-bottom)` and a solid raised surface; no blur-dependent
  readability.
- The existing inline action bar remains for `sm` and wider screens.

### 4. Mobile result hierarchy

Results answer “how much?” before internal diagnostics:

```text
核心输出数据看板
┌──────────────────────────────────┐
│ 总伤害                    41,562  │
├──────────────────────────────────┤
│ DPS 6,112       时长 6.80秒       │
│ 切人 0.60秒/次   15 个动作         │
└──────────────────────────────────┘

循环诊断
伤害拆解
动作时序（默认列表）
能量详情
```

- Use one grouped metric surface rather than four large cards.
- Warnings and errors stay adjacent to the result summary. Engine errors suppress
  misleading headline metrics according to the existing dashboard contract.
- Damage breakdown precedes energy internals.
- The timeline defaults to the chronological list below `sm`; multi-lane remains
  an explicit, horizontally scrollable option.
- Energy remains readable as a compact definition/table surface; detailed
  diagnostics can follow the primary analysis.

## Responsive and accessibility contract

- Test widths: `320px`, `390px`, `430px`, and desktop `1280px`.
- `document.documentElement.scrollWidth === window.innerWidth` in default setup
  and post-run result states.
- Every visible mobile action target is at least `44 x 44px`, except the hidden
  skip link before focus.
- Sticky/fixed UI never covers a focused element.
- The primary action respects safe-area insets.
- Focus rings, reduced motion, semantic buttons, labels, live announcements, and
  URL-backed view state remain intact.
- Chinese labels wrap naturally; Latin IDs may use `overflow-wrap: anywhere` only
  where an unbroken identifier requires it.
- The chronological timeline is operable without horizontal gestures.

These requirements follow the project design system and the current
[Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines).

## Implementation boundaries

Expected files:

- `src/app/page.tsx`: mobile header summary, section spacing, shrink boundaries,
  result ordering, and mobile action bar.
- `src/app/globals.css`: safe-area/page overflow guard only if component classes
  cannot express the invariant locally.
- `src/components/ui/Button.tsx` or `tokens.ts`: reuse the existing touch-target
  token; do not create a second button system.
- `src/features/team-builder/TeamSlot.tsx`: compact mobile presentation.
- `src/features/setup/{EnemyConfigurator,SimulationSettings,RotationEditor}.tsx`:
  mobile stacking and touch targets.
- `src/features/optimizer/RotationSearchPanel.tsx`: mobile control stacking.
- `src/features/rotation-timeline/{RotationTimeline,viewMode}.tsx`: honest mobile
  list default and contained lane scroller.
- Existing DOM/unit tests plus focused mobile browser assertions.

No new dependency is required.

## Acceptance criteria

1. A default `390px` visit shows the product identity, draft summary, team heading,
   and persistent simulation action without horizontal scrolling.
2. The user can edit every core input and run the default rotation using touch,
   keyboard, or assistive technology.
3. A post-run `390px` results view shows Total Damage and DPS before energy and
   timeline internals.
4. Timeline list is the initial mobile presentation; lane mode remains available.
5. All existing deep-link, simulation, search, persistence, and desktop tests pass.
6. Browser checks find no page-level overflow or undersized visible mobile action
   targets at `320px`, `390px`, and `430px`.

## Implementation order

1. Fix shrink/overflow and shared touch-target foundations.
2. Refine header summary and mobile action bar.
3. Compact team/setup/search controls.
4. Group and reorder result content; fix timeline default.
5. Add focused tests, then verify real mobile and desktop renderings.

