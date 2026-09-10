# CHARACTER-DETAIL-046.md — §15 Character detail view

Owner: `uiux-engineer`. Spec for `frontend-engineer`. TASK #046, part D.
Extends COMPONENTS.md §6 (character configuration panel), which remains
authoritative for the *configuration* controls. This section specs the **detail /
inspection** half of the same surface, which §6 reserved and did not fill.

Today's surface is `src/features/team-builder/CharacterStatsModal.tsx` (682
lines), a `panel`-size dialog with three tabs: 面板属性 / 命之座 / 天赋与技能.

---

## 15.0 Facts this spec is built on (verified 2026-09-04, not assumed)

The brief said constellations and passives are "currently EMPTY for all 132
characters". Verification refines that, and the refinement changes the spec:

| Fact | Evidence |
|---|---|
| 139 generated character entries exist | `generated/{pyro…geo}.ts`, `export const` counts |
| Every generated character has `passives: []` and `constellations: []` | e.g. `generated/anemo.ts:5326-5328` |
| **Exactly 4 characters have authored constellation/passive prose** — raiden, bennett, xiangling, xingqiu | `characters/kits/raidenNationalKit.ts`; `getCharacterKitDetails` (:510) reads `RAIDEN_NATIONAL_KITS` and nothing else |
| Per-level talent tables 1–15 are real | `talentTable(values)`, `TalentTable { values: readonly number[] }` (`simulation/character/talent.ts:23`) |
| `talentValueAt` **clamps** rather than throwing, so a short table silently returns its last value | `talent.ts:47-54` |
| Scaling stats are authored per-term, not folded into ATK | `generated/pyro.ts` header; `TalentScalingTerm` (`kit.ts:69`) |
| `baseStatCurves` contains **only level 90** — one point, not a curve | `generated/pyro.ts:44-48` (`byLevel: { 90: … }`) |
| The whole generated roster is claimed `PARTIAL` | `registry.ts:48` `GENERATED_SUPPORT_TIER` |
| UNVERIFIED is a **source comment block, not data** | `generated/anemo.ts:5332+` — plain `//` lines, unreachable from TypeScript |
| Portraits are wired | `next.config.mjs:12-15` remotePatterns; `characterAssets.ts:27-29` |
| Talent selects offer **1–11**; the data holds **1–15** | `CharacterStatsModal.tsx:555, 585, 615` |

Two of these are spec-blocking and are raised as findings, not designed around
(§15.9).

## 15.1 The one-sentence job

> Let a user answer *"what will this character actually do at this build, and how
> much of that does the simulator really model?"* — without leaving the team
> they are building.

The second clause is the differentiator. A wiki answers the first clause better
than this product ever will. Only the simulator can answer the second, and the
project's stated failure mode is plausible-but-wrong output. **The detail view's
distinctive value is the honesty layer**, and it should be designed as the
primary feature rather than as a disclaimer bolted to a wiki page.

## 15.2 Surface: still a dialog, now `panel` size, four tabs

Stays a dialog (COMPONENTS §6.2 already ruled a side panel for desktop; that
ruling was written for a non-modal config panel and is not yet built). Interim
position: keep the dialog, adopt §13's `panel` size and its sticky/footer slots,
and revisit the desktop side-panel form when §6.2 is actually implemented. A
route (`/character/[id]`) is **not** recommended — the user is mid-team-build and
a full navigation loses that context, which is the exact reason §6.2 wanted
non-modal in the first place.

Tabs go from three to four, in this order:

| # | Tab | Tier | Content |
|---|---|---|---|
| 1 | 面板属性 | 1 | identity, derived stats, the manual stat overrides that exist today |
| 2 | 天赋与技能 | 2 | per-ability breakdown at the selected talent level — **the new centre of gravity** |
| 3 | 命之座 | 2 | constellation selection + text where it exists |
| 4 | 模拟覆盖 | 2 | what the engine does and does not execute for this character |

Reordering 天赋与技能 above 命之座 is deliberate: talents change damage
continuously and are the thing a user tunes; constellation is a mostly-fixed
account fact. Today's order (`CharacterStatsModal.tsx:200`-ish) puts the fixed
thing before the tuned thing.

Tab strip lives in `Dialog`'s `sticky` slot (§13.4) so it never scrolls away —
today it does, and from the bottom of a 6-entry constellation list there is no
visible way back.

## 15.3 Tab 1 — 面板属性

Two blocks, clearly separated, because they have different epistemic status and
today the UI blurs them.

### (a) Derived, read-only

```
基础属性 (Lv.90 · 6 突破)                        来自角色数据
生命值   9,461      攻击力   223      防御力   601
突破加成  攻击力 +24.0%
```

- `font-mono tabular-nums`, right-aligned numerals, per DESIGN-SYSTEM.
- Sourced from `baseStatCurves` / `ascensionBonus` through an adapter calling
  `src/simulation/character`. **Never computed in the component** (COMPONENTS
  §6.3, N11).
- **Level control constraint (NEW, from verification):** `baseStatCurves.byLevel`
  contains only key `90`. A level selector offering 1–90 would therefore return
  level-90 stats for every selection — silently wrong. Until curves are
  populated, the level field renders as **read-only text `Lv.90`** with a `micro`
  note `当前仅收录 90 级基础属性。` A disabled control with a visible reason is the
  system's rule (DESIGN-SYSTEM, Interaction states); an enabled control that lies
  is not an option.

### (b) Manual overrides — the existing panel, relabelled

The current fields (`atk`, `critRate`, `critDmg`, `energyRecharge`,
`elementalMastery`, elemental DMG bonus) and the three presets
(`applyPreset`, `:113-139`) are **总面板属性** — post-artifact, post-weapon totals
the user asserts. They are not derived and they are not base stats. Today they sit
in the same visual register as (a), which invites the reading that the tool
computed them.

- Header: `实战总属性 (手动输入)` with a one-line explanation as **visible text**,
  not a tooltip: `武器与圣遗物尚未建模，请在此直接填写最终面板数值。` This is
  COMPONENTS §6.3's reserved-position rule, honoured.
- Every input has a real `<label>`; none is placeholder-labelled.
- Percent fields carry a suffix `%` as adjacent text and store fractions. The
  current code divides by 100 on save (`:145-152`) — correct; the label must make
  the unit unambiguous at the point of entry.
- `energyRecharge` floors at 100% (`Math.max(1, …)`, `:150`). That floor is a real
  constraint and must be **stated before the click**: `最低 100%`. A value clamped
  without notice is a silent data edit.
- The preset buttons keep their numbers in the label (`主C输出 (2000攻/70暴/140爆)`)
  — good, that is a genuinely informative label — but drop the per-preset
  red/blue/green borders. Three differently-coloured buttons of identical
  function is decorative colour, and DESIGN-SYSTEM reserves colour for state.
  All three are `variant="secondary"`; the selected one takes the standard
  `selected` treatment (amber border + `aria-pressed`).

## 15.4 Tab 2 — 天赋与技能 (the new centre)

### Talent-level selection

Three independent `<select>`s — 普通攻击 / 元素战技 / 元素爆发 — never one
"talent level" field (COMPONENTS §6.4). This is already right in the code.

**Range must be 1–15, not 1–11.** `CharacterStatsModal.tsx:555/585/615` generate
`{ length: 11 }`. The data is a 1–15 table and `talentValueAt` clamps, so levels
12–15 are unreachable through the UI while being present in the data. See finding
F-2.

- Levels above 10 are the constellation-boosted range (C3/C5 raise a talent cap by
  +3 in game). COMPONENTS §6.4 explicitly states that cap-raising is **not
  modelled and must not be implied.** The resolution: offer 1–15 (the data's real
  range) and render a `micro` note under the group — `等级 11–15 需要对应命座解锁，
  本工具不校验该前置条件。` Honest about both the range and the unmodelled rule.
- A shared `全部设为` quick-set control (10 / 13 / max) above the three selects.
  It writes all three and is not a fourth source of truth.

### Ability breakdown per level

One card per ability, in `allAbilities()` engine order — the UI never re-sorts
(COMPONENTS §6.6).

```
元素战技 (E)  · 雷罚恶曜之眼                          Lv.9  [ 9 ▾ ]
  技能伤害      2.10 × 攻击力              3 段        雷元素
  持续时间      25.0 s
  冷却时间      10.0 s        元素微粒   —              ← absent ≠ 0
  ▸ 逐段伤害明细 (3)
```

Row rules, all inherited from COMPONENTS §6.6 and restated because this is the
surface that implements them:

- **Multipliers are shown at the selected talent level and the level is named on
  the card.** `Lv.9` appears on the card itself, not only in the select. A screen-
  shotted number with no level attached is unusable.
- **Hit count always shown, including `1 段`.** Showing it only when >1 makes
  single-hit indistinguishable from unstated.
- **Scaling stat is named, never assumed to be ATK.** `2.10 × 攻击力`,
  `1.24 × 生命值上限`, `0.85 × 元素精通`. The generator authors HP-scaling skills as
  HP-scaling; the UI must not flatten that back. Where an instance has multiple
  terms they stack on separate lines, never sum into one number.
- **Absent means absent.** No `particles` renders `—` with the `micro` legend
  `— 表示该数据未收录，不代表数值为 0。` `0 个微粒` and "not recorded" are different
  claims and the difference is load-bearing for energy analysis.
- Cooldown comes from a `TalentTable` and is level-dependent; the panel states
  once, as visible text: `冷却时间与倍率均按当前天赋等级显示。`

### Level-delta affordance (NEW — this is what a simulator can show that a wiki can't)

When the user changes a talent level, each affected multiplier shows a `micro`
delta beside the new value for 4 s: `2.10 ×攻击力  ▲ +0.16`. Announced once
through the page live region, not per-row.

- Colour is `state.success` for an increase and `state.info` for a decrease —
  **not** `state.error`; a lower multiplier from a lower level is not an error.
- Never colour-only: the `▲` / `▼` glyph plus the signed number carries it, and
  the glyph is `aria-hidden` with the sign in the text.
- Suppressed under `prefers-reduced-motion`? No — this is not motion, it is a
  transient value. It is suppressed under nothing, and it persists for 4 s rather
  than animating.

### Expanded instance table (Tier 3)

Per COMPONENTS §6.6's instance table, unchanged: one row per
`DamageInstanceDefinition` with 命中 / 延迟 / 元素 / 类型 / 倍率 / 元素附着 / ICD.
Real `<table>` with `<th scope="col">`. Mobile becomes a definition-list stack per
instance, not a horizontally scrolling table.

Two honesty rules restated because they are the ones most likely to be dropped:
- `application` absent → the text `无元素附着` in `state.info`, **never a blank
  cell**. A blank reads as "not displayed"; the truth is "declared not to apply".
- `icd` absent → `沿用组内 ICD`, never `无`. `无` would claim every hit applies an
  aura, which is the opposite of the truth.

## 15.5 Tab 3 — 命之座, with 4-of-139 coverage

The constellation **selector** (0–6, seven segments) works for every character and
is independent of whether prose exists. It stays exactly as it is
(`CharacterStatsModal.tsx:443-464`) — a 7-segment radio group, current value
readable without opening anything, `C0` labelled `初始` so it is not read as
"unset". This is correct and should not be touched.

The **prose list** exists for 4 characters. Three states, and the difference
between the second and third is the whole point:

| State | Condition | Render |
|---|---|---|
| prose present | `getCharacterKitDetails(id)` returns constellations | today's list (`:468-521`) |
| prose absent, **effects also absent** | generated character: `constellations: []` | §15.5a |
| prose absent, **effects present** | a future data drop lands `effects` without `descriptionZh` | §15.5b |

### 15.5a Prose absent and unmodelled — the honest empty state

Today's copy (`:517`) is:
`当前角色暂未录入文本级命座说明，已支持在上方自由调节 0～6 命之座层数。`

This is well-intentioned and **materially misleading**, and it is the single most
important copy fix in this spec. It says the *text* is missing. It does not say
that setting the constellation to 6 **changes nothing about the simulation**,
because `constellations: []` means there is no effect for the engine to apply. A
user who reads that sentence, sets C6, and re-runs will see an identical damage
number and conclude the tool is broken — or worse, will not re-run and will
believe the C6 number they are looking at.

Replace with:

```
⚠ 本角色的命之座效果尚未建模。
   调整层数不会改变模拟结果。0～6 的选择会被保存，
   待命座数据接入后即刻生效。
```

`state.warning`, glyph `aria-hidden`, text carries the meaning. The selection is
still persisted — discarding it would lose work the user will want later.

### 15.5b Prose absent, effects present — do not conflate

If a future data drop provides `effects` without Chinese prose, the row renders
the constellation by **name and unlock level with its modelled effect summarised
from the effect data**, plus `micro`: `暂无中文描述文本。` That row is
`state.success`-adjacent, not warning — the thing that matters (it is simulated)
is true. Conflating "no text" with "no effect" in either direction is the error
this table exists to prevent.

### Spec'd without assuming what the parallel data agent lands

The four combinations are enumerated so the component is written once:

| `effects` | `descriptionZh` | Row treatment |
|---|---|---|
| non-empty | present | full row, active/inactive marker, no caveat |
| non-empty | absent | full row + `暂无中文描述文本。` (§15.5b) |
| empty | present | row shown, text shown, **`⚠ 已录入说明但尚未模拟` chip** — COMPONENTS §6.6's declared-but-unimplemented rule |
| empty | absent | §15.5a empty state |

The component branches on **the two fields independently**. It must not branch on
"does this character have kit details", which is what
`kitDetails && kitDetails.constellations.length > 0` (`:468`) does today and which
collapses all four cases into two.

Same table governs 天赋 passives (固有天赋), which have the identical shape.

## 15.6 Tab 4 — 模拟覆盖 (NEW)

The honesty layer, given its own tab instead of being scattered as chips. This is
the tab that makes the tool trustworthy rather than merely pretty.

```
模拟覆盖情况                                    ⚠ 部分支持

已模拟
  ✓ 普通攻击 / 重击 — 逐段倍率、元素、附着
  ✓ 元素战技 — 倍率、冷却、微粒产出
  ✓ 元素爆发 — 倍率、冷却、能量消耗
  ✓ 属性缩放 — 攻击力 / 生命值 / 防御力 / 元素精通

未模拟
  ⚠ 固有天赋 (0 项已建模)
  ⚠ 命之座 (0 项已建模)
     数据来源仅以文本形式发布上述内容，未提供可解析参数。
     影响方向: 实际伤害将被低估。

数据核验
  ◇ 施法时间为引擎默认值，非数据源提供    (见 F-1)
```

Rules:
- **The reason is per-character and comes from data**, never inferred by the
  component (DESIGN-SYSTEM's tier rule, as amended). Today's source is
  `GENERATED_TIER_REASON` (`registry.ts:50`).
- **Direction of error is required.** DESIGN-SYSTEM: "knowing whether a number is
  under- or over-stated is what makes the caveat actionable." Missing passives and
  constellations both *add* damage, so the direction is `低估` — say so.
- This tab's chip is mirrored in the dialog header, so the user sees it without
  opening the tab. The tab is where the **full sentence** lives, satisfying
  DESIGN-SYSTEM's requirement that the complete explanation be reachable as
  visible text somewhere — which is what licenses short chips everywhere else.
- Per decision 2 (roster-scale tiering), this tab is a **per-character deviation
  surface** and is exempt from the "state the baseline once" rule: the user
  clicked into one character specifically to ask this question.

## 15.7 UNVERIFIED values — how they surface

DESIGN-SYSTEM: `UNVERIFIED` marks a **field**, not a character; it is orthogonal
to tier; the value is still shown, qualified, with an inline `◇ 未核验` chip
adjacent to the value it qualifies; where several exist in one panel, one
`state.info` summary line so a fast scanner cannot miss all of them.

Applied here:

- Chip renders **beside the specific number**, e.g. `施法时间 0.5 s ◇ 未核验`.
- The chip's adjacent text names the field and the reason —
  `施法时间为引擎默认值` — because `◇ 未核验` alone tells the user to distrust
  something without saying what.
- Summary line in Tab 4's 数据核验 block: `本角色有 1 项数值未经第二数据源核验。`
- **The chip is never the sole carrier.** Tab 4 lists every unverified field as
  visible text, so a user who never hovers or never opens Tab 2 still finds it.
- A character with unverified fields **does not change tier**. Do not let the
  chip's presence colour the header chip.

**This is currently unimplementable and that is finding F-1**, not a design gap:
the UNVERIFIED block is a `//` comment (`generated/anemo.ts:5332+`), invisible to
TypeScript. The spec above is written to be correct the moment the generator emits
it as data, and the component should be built against the shape below rather than
waiting.

Required emitted shape (a request to whoever owns the generator, routed through
the Manager — **not** a design decision I can make alone):

```ts
readonly unverified?: readonly {
  readonly field: string;    // "castTime" | "particles" | …
  readonly reason: string;   // user-facing, why it is unverified
}[];
```

Keyed by field so the UI can place the chip on the right value. A free-text blob
would force the UI to parse prose, which is exactly the inference DESIGN-SYSTEM
forbids.

## 15.8 States, responsive, accessibility

### States

| State | Behaviour |
|---|---|
| open | Focus to the dialog heading (§13.7.4), not the first tab button |
| loading | Not applicable — all data is local and synchronous. Do not add a spinner for a synchronous read. |
| talent level changed | Delta affordance (§15.4); one live-region announcement: `元素战技 天赋等级 9。技能伤害 2.10 倍攻击力。` |
| constellation changed | Live region; if unmodelled, the announcement says so: `命之座 6。该角色命座效果未建模，结果不变。` |
| dirty + dismiss attempt | Confirm (§13.6) — this dialog holds ~9 edited fields |
| character data absent for a slot | `本角色无此招式。` — genuinely legitimate data, not an error |
| unmodelled mechanic | §15.5a / §15.6 |
| save | Dialog closes; invoking surface announces; result becomes stale (COMPONENTS §1.5) |

### Responsive

| Region | Desktop ≥1024 | Tablet 640–1023 | Mobile <640 |
|---|---|---|---|
| Dialog | `panel`, `sm:max-w-2xl` | same | full-width bottom sheet |
| Tabs | 4 horizontal | 4 horizontal | horizontally scrollable strip with edge affordance; **never a `<select>`** — a picker that hides the other three tabs' existence |
| Stat grid | 3 columns | 2 | 1, label-above-value |
| Instance table | `<table>` | `<table>` | definition-list stack per instance |
| Talent selects | 3 across | 3 across | stacked full-width, ≥44px targets |

### Accessibility

- Tabs are a real tablist: `role="tablist"` / `role="tab"` with `aria-selected`
  and `aria-controls`; panels `role="tabpanel"` with `aria-labelledby`. Arrow keys
  move between tabs, `Home`/`End` jump to first/last, and the tablist is **one tab
  stop** — Tab from the tablist goes into the active panel. Today's three buttons
  (`:200-260`) are plain `<button>`s with no tablist semantics and three separate
  tab stops.
- Heading levels: `Dialog` renders `h2`; character name `h3`; tab panel sections
  `h4`; ability names `h5`. No level skipped. Verify after the restructure.
- The constellation segments are a `<fieldset>` + `<legend>` radio group, each
  segment's accessible name `命之座 N 层`. `aria-pressed` on a `<button>`
  (`:474`) is a toggle, not a single-select — it lets AT report several as pressed
  at once. **Change to radios**, or to `role="radiogroup"` with `aria-checked`.
- Every unmodelled/unverified state is visible text, never `title`-only. The
  `tierReason` title-only defect logged in PROJECT-STATUS (TeamSlot.tsx:112,
  CharacterPicker.tsx:412) is the pattern this spec must not repeat.
- Derived stat block is `aria-live="polite"` with **`aria-atomic="false"`** —
  reading the whole block on every select keystroke is noise.
- 200% zoom, zh-CN: verified with the §13.2 single-scroller fix in place. The
  removed `max-h-[46vh]` / `max-h-[50vh]` regions were the failure here.

## 15.9 Findings raised, not designed around

```
UI REVIEW
Issue: UNVERIFIED provenance is a source comment, unreachable by the UI
Where: src/game-data/characters/generated/anemo.ts:5332+ (and each element file)
Problem: DESIGN-SYSTEM mandates an inline "◇ 未核验" marker on the specific value,
  with a per-panel summary line. The data exists — cast times are engine defaults
  for 16 anemo characters alone — but is emitted as `//` comment lines, so no
  component can read it. The design rule is currently unimplementable.
Recommendation: Generator emits `unverified?: { field, reason }[]` on each
  character (§15.7). Routed via Manager to whoever owns
  scripts/generate-characters/emit.py. Not a frontend fix.
Priority: High
```
```
UI REVIEW
Issue: Talent selects cap at 11; the data holds 15 levels
Where: CharacterStatsModal.tsx:555, :585, :615 — Array.from({ length: 11 })
Problem: Generated tables are 1..15 (talentTable / TalentTable.values). Levels
  12-15 are unreachable through the UI. talentValueAt clamps rather than throwing,
  so nothing surfaces the gap.
Recommendation: Range 1-15, plus the micro note in §15.4 stating that 11-15
  require constellation unlocks which this tool does not validate (COMPONENTS §6.4
  forbids implying the cap rule is modelled).
Priority: High
```
```
UI REVIEW
Issue: Constellation empty state says the TEXT is missing; the EFFECT is missing
Where: CharacterStatsModal.tsx:517
Problem: "暂未录入文本级命座说明" tells the user the description is absent. In fact
  `constellations: []` for all 139 generated characters means there is no effect
  for the engine to apply, so changing constellation does not change the
  simulation at all. A user sets C6, sees an unchanged number, and concludes the
  tool is broken — or trusts a C6 result that is really a C0 result.
Recommendation: §15.5a copy, state.warning: the effect is unmodelled, the level
  selection is saved but does not change results.
Priority: High
```
```
UI REVIEW
Issue: Constellation branch collapses four distinct data states into two
Where: CharacterStatsModal.tsx:468 — kitDetails && kitDetails.constellations.length > 0
Problem: Branches on "does this character have hand-authored kit details" (true
  for exactly 4 of 139: raiden, bennett, xiangling, xingqiu). `effects` presence
  and `descriptionZh` presence are independent and both matter; a future data drop
  landing one without the other renders wrongly under this condition.
Recommendation: Branch on the two fields independently per §15.5's four-row table.
Priority: Med
```
```
UI REVIEW
Issue: Constellation segments use aria-pressed for single-select
Where: CharacterStatsModal.tsx:474
Problem: aria-pressed is a toggle. isUnlocked is true for every level <= current,
  so AT reports up to seven simultaneously "pressed" buttons for what is a
  single-choice control.
Recommendation: radiogroup semantics (§15.8). The visual "unlocked below current"
  treatment is legitimate and stays — it is styling, not the selection state.
Priority: Med
```
```
UI REVIEW
Issue: Manual total stats are visually indistinguishable from derived base stats
Where: CharacterStatsModal.tsx, 面板属性 tab
Problem: User-asserted post-artifact totals and engine-derived base stats render in
  the same register, inviting the reading that the tool computed the totals.
Recommendation: Two labelled blocks per §15.3, with the visible explanation that
  weapons and artifacts are not yet modelled (COMPONENTS §6.3's reserved-position
  rule).
Priority: Med
```
```
UI REVIEW
Issue: Level is fixed at 90 in data but presented as a character property
Where: generated/*.ts baseStatCurves.byLevel = { 90: … }; CharacterStatsModal
  header renders "Lv.{character.level}"
Problem: Only level 90 is sourced. Any future level selector would silently return
  level-90 stats for every choice.
Recommendation: Read-only "Lv.90" plus the micro note in §15.3(a). Do not ship a
  level selector until curves are populated.
Priority: Med
```
```
UI REVIEW
Issue: Preset buttons use decorative red/blue/green
Where: CharacterStatsModal.tsx:~135-165
Problem: Three buttons of identical function in three colours. DESIGN-SYSTEM
  reserves colour for state; this is colour as decoration.
Recommendation: All secondary; selected preset takes the standard selected
  treatment with aria-pressed.
Priority: Low
```

## 15.10 Product decisions needed (not decided here)

1. **Build state in the URL** — §12.5's open item. Recommendation (b): team
   identity in the URL now, encoded build param later.
2. **Who owns constellation/passive prose for the other 135 characters?** The
   parallel data agent is adding it; this spec renders correctly whether they land
   effects, prose, both, or neither (§15.5's four-row table). But if the plan is
   prose-only, the `partial` tier and §15.5a's warning stay accurate forever, and
   the product should decide whether that is acceptable or whether effects are the
   real deliverable. That is a product call, not a design one.
3. **Does the roster-level tier statement (decision 2) cover the detail view?** I
   have ruled that it does not — Tab 4 is exactly the per-character deviation
   surface decision 2 reserved. Flagging it so the Manager can overrule if the
   intent was broader.
