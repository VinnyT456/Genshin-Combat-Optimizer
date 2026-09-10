# DASHBOARD-AND-DIALOGS-041.md

Owner: `uiux-engineer`. Spec for `frontend-engineer`. TASK #046.
Supersedes nothing; **extends** DESIGN-SYSTEM.md (authoritative) and COMPONENTS.md.

Scope: (A) dashboard information hierarchy, (B) empty vs post-simulation as two
layouts rather than one layout with holes, (C) §13 — the dialog contract, (D) the
four verified defects that motivated it.

Verified against code at 2026-09-04. Every defect below carries a file:line that
was read, not inferred.

---

# §12 — The dashboard

## 12.1 What the dashboard is for

`src/app/page.tsx` is the only page. It is simultaneously the configuration
surface and the results surface, and today it renders both at once as a single
vertical stack of `Section`s (`page.tsx:304–558`). That is the defect this
section exists to fix: **before the first run there are no results, and a page
that reserves space for absent results teaches the user that the tool is broken.**

The dashboard has exactly two layouts. Not one layout with conditional holes.

| Layout | Condition | Job |
|---|---|---|
| **Configure** | `result === null` | Get the user to a first successful run. |
| **Analyze** | `result !== null` | Answer "how much, from whom, when, and why". |

`resultStale` is **not** a third layout. It is Analyze with a persistent banner
(§12.6). Introducing a third would mean three code paths to keep honest, and the
stale state's whole point is that the old numbers are still on screen.

## 12.2 Information hierarchy — the three tiers, bound to real fields

The agent brief's Tier 1/2/3 is restated here as a **binding rule about vertical
order**, because "always visible" is not implementable as written on a scrolling
page. The operative rule:

> **Tier 1 must be legible without scrolling on a 1280×800 desktop viewport
> immediately after a run completes.** Tier 2 is reachable with one scroll and no
> click. Tier 3 requires a deliberate click and never occupies vertical space
> before that click.

| Tier | Content | Placement |
|---|---|---|
| 1 | Team (4 avatars + names), Total Damage, DPS, Duration, and the §7 tier caveat line **above** the numbers | Fixed-order block, top of Analyze, `max-w-7xl` |
| 2 | Per-character damage, per-ability damage, reaction damage, timeline | Below Tier 1, in that order, each an open `Section` |
| 3 | Buff instances, energy internals, cooldown internals, individual damage instances, event detail | Behind `DetailDisclosure` / the event detail panel / dialogs |

**Ordering rationale that must not be reversed on implementation:** per-character
damage precedes per-ability damage precedes reactions. A user's first question
after a total is "who", not "which button". Today's `Section` order
(`page.tsx:522/533/558` — energy, timeline, breakdown) puts energy — a Tier 3
diagnostic — above the Tier 2 breakdown. **That is a hierarchy inversion and must
be corrected**: energy moves below damage breakdown, or into a disclosure.

### The tier caveat sits above the number

COMPONENTS §7's last table row is binding here and is currently unimplemented on
this page. If any team member's derived tier is `basic` or `partial`, a
`state.warning` line renders **above** the Total Damage value, not below it and
not in the footer. Given `GENERATED_SUPPORT_TIER = "PARTIAL"` for the entire
generated roster (`registry.ts:48`), this line will render for essentially every
run today. See §12.7 — that fact changes what the line should say.

## 12.3 Configure layout (`result === null`)

Full width, single column, no results scaffolding rendered at all — no empty
Tier-1 stat block with `—` placeholders, no collapsed results `Section` headers.

```
┌ 原神战斗循环模拟器 ────────────────────────────────────┐
│  一次确定性的战斗循环模拟。配置队伍与敌人，然后运行。      │  ← one sentence, what it does
├────────────────────────────────────────────────────────┤
│  ① 队伍阵容配置                                         │
│     [slot][slot][slot][slot]                            │
├────────────────────────────────────────────────────────┤
│  ② 战斗环境与动作时序编排                                │
│     enemy · sim config · rotation editor                │
├────────────────────────────────────────────────────────┤
│  [ 执行循环模拟 ]   就绪 · 4 名角色 · 12 个动作           │  ← readiness, not a disabled button alone
└────────────────────────────────────────────────────────┘
```

Rules:
- The numbered `①②` markers are permitted **here only**, because this genuinely
  is an ordered two-step flow the user performs once. They are banned as
  decorative section eyebrows anywhere else (impeccable absolute ban on numbered
  section scaffolding; this is the licensed exception, and it is licensed because
  the order carries information the user needs).
- The run button's adjacent readiness string is **required**, not decorative. It
  already exists in spirit at `page.tsx:370` (`就绪 · 点击运行模拟获取伤害与充能数据`)
  but that string states an instruction, not a state. Replace with a count-bearing
  state: `就绪 · 4 名角色 · 12 个动作`. When not ready, the button carries the real
  `disabled` attribute **and** the visible reason (`EMPTY_TEAM_REASON`,
  `page.tsx:54`), per DESIGN-SYSTEM's disabled rule.
- The view switcher (`page.tsx:266/278/290`) is **hidden entirely** in Configure.
  A three-way `all / setup / results` toggle when only one of the three has
  content is a control that lies about what is available.

### Empty state copy

The current empty block (`page.tsx:394–400`, `尚未生成模拟结果`) is correct in
spirit and lives in the wrong place — it renders *inside* the results region,
which is the region that should not exist yet. In Configure layout it is deleted;
its job is done by the Configure layout itself. An empty state that teaches the
interface beats an empty state that describes its own absence.

## 12.4 Analyze layout (`result !== null`)

```
┌ Tier 1 ────────────────────────────────────────────────┐
│ ⚠ 本次结果包含 4 名角色的机制未被完整模拟。 [查看详情]     │  ← §7, above the numbers
│                                                        │
│ [av][av][av][av]   总伤害 1,284,301                     │
│ 雷电将军 班尼特…      DPS 61,157 · 时长 21.0 s          │
├ Tier 2 ────────────────────────────────────────────────┤
│ 角色伤害占比        (bars, per character)               │
│ 技能伤害拆解        (per ability)                       │
│ 元素反应伤害        (per reaction)                      │
│ 动作时序           (timeline, 4 lanes)                  │
├ Tier 3 ────────────────────────────────────────────────┤
│ ▸ 能量微粒流转   ▸ 模拟内核诊断                          │
└────────────────────────────────────────────────────────┘
```

Rules:
- Tier-1 numbers are `font-mono tabular-nums`, type step `display` (`text-2xl`).
  Their labels are type step `label`. No stat gets a card of its own — the
  hero-metric template (big number, small label, gradient accent) is an
  impeccable absolute ban, and four of them in a row is the canonical AI
  dashboard tell. **One bordered block containing all Tier-1 values**, separated
  by rules, not four floating cards.
- Configure does not vanish in Analyze. It collapses to a single summary row
  above Tier 1 with an `编辑配置` button that returns to Configure layout while
  **retaining** the result (which becomes `resultStale` on any actual edit, per
  COMPONENTS §1.5). The view switcher becomes meaningful here and is shown.
- Warnings/errors (`page.tsx:490/506`) are Tier 2, not Tier 1, **unless**
  `result.errors.length > 0`, in which case the error block takes Tier 1's slot
  and the damage numbers are suppressed. A total damage figure printed above an
  engine error is the plausible-but-wrong output this project exists to prevent.

## 12.5 URL state — deep-linkable (RULED, decision 3)

Team, filters, and view live in the URL. Sharing a build is a theorycrafting
tool's core social function, so this is information architecture, not polish.

| Key | Type | Example | Owner |
|---|---|---|---|
| `team` | ordered, comma-separated character ids | `?team=raiden,bennett,xiangling,xingqiu` | §1 |
| `view` | `all` \| `setup` \| `results` | `&view=results` | §12.4 |
| `el` | element filter, comma-separated | `&el=pyro,hydro` | §4.4 |
| `q` | roster search query | `&q=班尼特` | §4.4 |
| `sort` | roster sort key | `&sort=release` | §4.4 |

Contract:
- **Character ids, never array indices.** An index-keyed URL silently means a
  different team the day the roster order changes.
- **Absent key means default**, never "explicitly empty". `?team=` with an empty
  value is normalized to absent on read.
- **Unknown id is a recoverable, named error**, not a silent drop: the slot
  renders `state.error` with `未知角色 ID「xyz」— 已跳过。` and the rest of the team
  still loads. Silently dropping a member would produce a shared link that
  simulates a different team than the sender ran.
- **Results are not in the URL.** Only inputs. A link is a *reproduction
  instruction*, and the recipient must get their numbers from the engine, not from
  the sender's querystring — otherwise a stale link becomes a source of wrong
  damage figures with no way to detect it.
- Writing uses `router.replace` with `scroll: false` for filter/search/view (they
  are not navigation events and must not fill the back stack), and `router.push`
  for team composition changes (which the user does expect to undo with Back).
- Search state is debounced 300 ms before it touches the URL.
- `useSearchParams` requires a `<Suspense>` boundary in the App Router. That
  boundary must wrap only the reading subtree, and its fallback must be the
  **Configure layout skeleton**, never a spinner (product register: skeletons,
  not spinners in the middle of content).

**PRODUCT DECISION NEEDED (P1):** per-character *build* state — level,
constellation, talent levels, and the manually edited stat panel in
`CharacterStatsModal` — is not in the table above. It is the state a user most
wants to share, and it is also ~9 numeric fields × 4 characters, which will not
fit a readable querystring. Two options: (a) a compact encoded `build` param
(base64url of a fixed-order tuple) — shareable, opaque, needs a version byte and a
migration story; (b) URL carries team identity only, and builds are shared by the
existing copy-summary export (`page.tsx:180`). I recommend (b) for now and (a)
when the build model stops changing shape — encoding a schema that is still moving
guarantees broken links. This needs a Manager/product ruling; I have not decided it.

## 12.6 Stale results

Analyze layout, unchanged content, plus a `state.warning` banner pinned above
Tier 1: `配置参数已发生变化 — 请重新执行模拟以更新测算数据。` (already
`page.tsx:57`) with the re-run button adjacent.

The numbers **stay on screen and stay legible**. Dimming them to 50% opacity is
the tempting move and it is wrong twice: it fails the contrast floor, and it makes
the user squint at numbers that are still exactly correct for the configuration
that produced them. Staleness is a claim about *provenance*, not about legibility,
and it is carried by the banner text.

## 12.7 Defect M6/D2 — the element-colour ternary with decorative glows

`page.tsx:448–461`. An 8-branch inline ternary maps `e.element` to a Tailwind
background **and an 8px coloured box-shadow glow**:

```
e.element === "pyro"
  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
  : e.element === "hydro"
  ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]"
  : … 8 branches …
```

Three separate violations, all confirmed:

1. **Wrong colours.** `bg-red-500` / `bg-sky-500` / `bg-purple-500` are Tailwind
   defaults, not the project's element tokens. DESIGN-SYSTEM defines pyro
   `#ec4c3a`, hydro `#2f9fe0`, electro `#b26cf5` and measured every one of them
   for contrast on both surfaces. The Tailwind defaults were never measured, so
   the AA guarantee in DESIGN-SYSTEM does not cover what is on screen.
2. **Decorative glow.** `shadow-[0_0_8px_rgba(...)]` is an arbitrary-value shadow
   on a surface whose stated rule is *"Shadows: none. Elevation is expressed by
   surface value + border"*, with a single exception for overlay layers. A
   timeline marker is not an overlay layer. This is the amber-glow family D2
   rejected. **Remove.**
3. **Duplicated element mapping.** `ElementTag` (`src/components/ui/ElementTag.tsx`)
   already owns element→colour. A second mapping inline in a page component means
   two places to update and guarantees drift; it has already drifted.

**Fix:** one exported `ELEMENT_MARK` record keyed by `ElementType`, colocated with
`ElementTag`, returning the token class. Zero ternary branches in `page.tsx`. No
shadow. And per DESIGN-SYSTEM's never-color-only rule the marker must still carry
the element name in adjacent text or an `aria-label` — an 8px coloured dot alone
is exactly the color-only status the system forbids.

---

# §13 — The dialog contract

Four dialog surfaces exist today: `CharacterPicker`, `WeaponPicker`,
`ArtifactPicker`, `CharacterStatsModal`, all rendering through one
`src/components/ui/Dialog.tsx`. They currently use **three different sizing
idioms** and one of them fights the shared component. §13 makes the contract
explicit so a fifth dialog cannot invent a fourth idiom.

Note the product-register position first: **modal is the last resort, not the
first thought.** Every dialog below is justified by a full-surface job (browse 132
characters; configure one character deeply) that genuinely cannot be inline. A
dialog for a confirmation, a single field, or a message is not permitted — those
are inline, a disclosure, or a live region.

## 13.1 The sizing scale (NEW — closed set)

Three sizes. A dialog picks one by name. It does not pass `max-w-*` / `h-*` /
`max-h-*` through `className`.

| Name | Desktop ≥640 | Mobile <640 | Use | Today's users |
|---|---|---|---|---|
| `sheet` | `sm:max-w-lg`, height content-derived, `max-h-[90vh]` | bottom sheet, `max-h-[90vh]` | one focused form; short content | (none yet) |
| `panel` | `sm:max-w-2xl`, height content-derived, `max-h-[90vh]` | bottom sheet, `max-h-[90vh]` | one entity configured in depth | `CharacterStatsModal` |
| `browser` | `w-[96vw] max-w-7xl h-[90vh]` — **fixed** height | full-screen, `h-[100dvh]` | browse/filter a large collection | `CharacterPicker`, `WeaponPicker`, `ArtifactPicker` |

Implementation: `Dialog` gains `size?: "sheet" | "panel" | "browser"` (default
`"panel"`) and **the `className` escape hatch for sizing is removed**. The
existing `!className?.includes("max-w-")` sniff at `Dialog.tsx:119` is the tell
that the escape hatch was already being abused; a string sniff on a caller's class
list is not a contract.

Why `browser` is fixed-height and the others are content-derived: a browser
contains a scrolling list whose length varies with the filter. Content-derived
height there means the dialog resizes as the user types into the search box —
motion that conveys nothing and moves the results out from under the pointer.
A configuration panel has no such problem, and a fixed height there would produce
dead space under short content.

`CharacterPicker` at `h-[88vh]` and `ArtifactPicker`/`WeaponPicker` at `h-[90vh]`
is a 2vh discrepancy with no reason behind it (`CharacterPicker.tsx:307`,
`ArtifactPicker.tsx:85`, `WeaponPicker.tsx:91`). Both become `h-[90vh]`.

## 13.2 Scroll ownership — exactly one scroll container per dialog

**This is the rule the current code breaks.**

`Dialog` already owns its scroll: the body is
`<div className="flex-1 overflow-y-auto p-4">` (`Dialog.tsx:130`) inside a panel
that is `overflow-hidden` (`Dialog.tsx:117`).

### Defect D-1 (High) — a second, conflicting scroll context

`CharacterStatsModal.tsx:175` passes
`className="max-w-2xl max-h-[88vh] overflow-y-auto"` **onto the dialog panel
itself**. The panel is already `overflow-hidden`; the two collide on the same
element. The `overflow-y-auto` cannot win against a sibling declaration on the
same class list in an unspecified order, so the resulting behaviour depends on
Tailwind's emitted rule order rather than on anything the author chose. The
`max-h-[88vh]` also silently overrides the shared `max-h-[90vh]`, which is how the
2vh drift in §13.1 got in.

**Fix:** delete the entire `className` from that call site; pass `size="panel"`.

### Defect D-2 (High) — three nested scroll regions in one dialog

Same file: `max-h-[46vh] overflow-y-auto` at line 469 (constellation list) and
`max-h-[50vh] overflow-y-auto` at line 532 (talents tab), *inside* the dialog body
that is itself `overflow-y-auto`, inside the panel from D-1. That is up to three
nested scrollers stacked vertically. Consequences, all real:

- The user cannot tell which region a wheel event will scroll.
- Keyboard `PageDown` scrolls whichever region has focus, which is unpredictable.
- At 200% zoom the inner `46vh` region becomes a ~4-line porthole while the outer
  region also scrolls — the failure mode audit checklist item 7 exists to catch.
- The `vh` units are measured against the *viewport*, not the dialog, so on a
  short viewport the inner regions can exceed the dialog they sit in.

**Fix, and it is a layout decision, not a CSS tweak:** inner regions get **no**
`max-h` and **no** `overflow`. The dialog body is the only scroller. The tab
content is as tall as it is, and the one scroll container handles it. This is what
makes the tab strip's position stable, which §13.4 requires.

**Rule:** a dialog has exactly one scrolling element — the `Dialog` body. Any
`overflow-y-auto` inside dialog content is a defect unless it is a genuinely
2-dimensional data table's *horizontal* scroll (`overflow-x`), which is permitted
and must carry a visible edge affordance.

## 13.3 Defect D-3 (High) — no body scroll lock anywhere

`grep` for `document.body.style`, `overflow.*hidden.*body`, `useScrollLock`,
`preventScroll` across `src/`: **zero matches.** No dialog locks background scroll.

The earlier audit credited `overscroll-behavior: contain` (`Dialog.tsx:122`,
`Dialog.tsx:130`) with this. **That credit was wrong and I am correcting it here.**
`overscroll-behavior: contain` prevents *scroll chaining* — it stops a scroll
gesture that has reached the end of the dialog's scroller from continuing into the
page beneath. It does nothing at all when the pointer is over the scrim, over any
non-scrolling part of the dialog, or when the user scrolls the page with a
keyboard, a scrollbar drag, or a trackpad gesture that never entered the dialog's
scroller. The background page scrolls freely in all of those cases today.

Why it matters beyond tidiness: the dialog is `position: fixed`, so a background
scroll moves the page *behind* a stationary dialog. On mobile that reads as the
dialog having broken loose from the page; on desktop, closing the dialog leaves
the user somewhere they never navigated to, having lost the team slot they were
editing.

**Fix, specified precisely because the naive version has a known bug:**

- On open: record `document.body.style.overflow` and the current
  `window.scrollY`; set `body { overflow: hidden }`.
- Compensate for the vanished scrollbar: add
  `padding-right: <scrollbar width>px` to `body`, computed as
  `window.innerWidth - document.documentElement.clientWidth`. Without this, the
  whole page shifts sideways the instant a dialog opens — the single most common
  implementation of this fix, and a visible layout jump.
- On close: restore both properties to the exact recorded values, not to `""`.
- The lock is **reference-counted** in `Dialog` itself, not at each call site.
  `CharacterStatsModal` can be opened from within `CharacterPicker`; two nested
  dialogs must not have the inner one's close release the outer one's lock.
- `prefers-reduced-motion` is irrelevant here; this is not motion.

This belongs in `Dialog`, so all four surfaces get it from one place, and a fifth
gets it for free.

## 13.4 Structure inside a dialog

```
┌ header — never scrolls ───────────── [✕] ┐   Dialog owns this (Dialog.tsx:124)
│ title (h2)                               │
├ sticky region — optional, never scrolls ─┤   NEW: tabs / search / filters
├ body — the one scroller ─────────────────┤
│ …                                        │
├ footer — optional, never scrolls ────────┤   NEW: primary action
│                          [取消] [保存]     │
└──────────────────────────────────────────┘
```

- `Dialog` gains `sticky?: ReactNode` and `footer?: ReactNode` slots. Both render
  outside the scroller as flex siblings, so they cannot scroll away.
- **`CharacterStatsModal`'s tab strip belongs in `sticky`.** Today it is inside the
  body (`CharacterStatsModal.tsx:200`-ish) and scrolls out of view; a user reading
  the bottom of the 命之座 list has no visible way back to 面板属性.
- A picker's search + filter row belongs in `sticky` for the same reason.
- **`CharacterStatsModal`'s save action belongs in `footer`.** A destructive-ish
  commit that scrolls out of reach is how users lose edits.
- Footer button order is `[secondary] [primary]`, primary rightmost, and the
  primary is the only `variant="primary"` element in the dialog.

## 13.5 Dialog states

Every dialog implements all of these. Currently none implements loading or error.

| State | Rule |
|---|---|
| opening | No entrance animation beyond a ≤150 ms opacity fade on the scrim. The panel does not scale, slide, or bounce on desktop. Mobile bottom sheet may translateY. Both suppressed under `prefers-reduced-motion`. |
| loading | Skeleton rows in the body matching the real row geometry — never a centered spinner. `aria-busy="true"` on the body. |
| empty | Body renders the reason **and the recovery**: `没有符合当前筛选条件的角色。[清除筛选]`. `pickerEmptyState.ts` already models this; it must be reachable, and per COMPONENTS §4.4 filters must never hide *why* something is missing. |
| error | `state.error` block in the body; the dialog stays open and closable. A dialog that closes itself on error destroys the user's context along with their input. |
| dirty-close | A `panel`-size dialog with unsaved edits confirms before discarding on scrim click. See §13.6. |
| success | Dialog closes; the *invoking surface* announces via the page-level `aria-live` region (`LiveRegion.tsx`). A live region inside a closing dialog is unmounted before it can be read. |

## 13.6 Dismissal

| Gesture | `sheet` / `browser` | `panel` (has a form) |
|---|---|---|
| `Esc` | closes | closes; confirms first if dirty |
| Scrim click | closes | **does not close if dirty** — confirms |
| `✕` | closes | closes; confirms first if dirty |

The `panel` asymmetry is deliberate and matches COMPONENTS §6.7's ruling that an
unintentional close of a form is worse than an extra click. `CharacterStatsModal`
holds ~9 edited numeric fields; a stray scrim click currently discards all of them
with no warning (`Dialog.tsx:107`).

"Dirty" means *the user changed a control*, not *the values differ from a
default*. Applying a preset (`applyPreset`, `CharacterStatsModal.tsx:113–139`)
counts as dirty.

## 13.7 Dialog accessibility — specced here, not deferred

Already correct in `Dialog.tsx` and must not regress: `role="dialog"`,
`aria-modal="true"`, `aria-labelledby` to the title (`:112–114`), focus trap on
Tab/Shift-Tab (`:63–78`), `Esc` to close (`:58–61`), focus restore to the invoker
(`:93–94`).

Required additions:

1. **`aria-hidden` / `inert` on the rest of the page while open.** `aria-modal`
   alone is honoured inconsistently; without `inert` on the sibling content a
   screen-reader user can still virtual-cursor into the page behind the dialog,
   which `aria-modal` claims is unavailable. Applying `inert` to the app root
   siblings also fixes background focus for free and pairs naturally with §13.3's
   reference count.
2. **`aria-describedby`** pointing at the dialog's first explanatory paragraph
   where one exists (the tier sentence, the empty-state reason).
3. **The scrim button.** `Dialog.tsx:103–109` is a `<button aria-hidden="true"
   tabIndex={-1}>`. This is acceptable — it is pointer-only affordance, the
   keyboard path is `Esc`, and hiding it from AT prevents a meaningless "button"
   in the reading order. Keep it; do not "fix" it into a focusable control.
4. **Initial focus** goes to the dialog's heading (`tabindex="-1"`), not the first
   focusable child. Today it lands on the first focusable element
   (`Dialog.tsx:88–90`), which in `CharacterStatsModal` is a tab button and in the
   pickers is the search input. Landing on a `<select>` or a tab risks a stray
   value change on some platforms (COMPONENTS §6.7 already ruled this for the
   config panel); making it uniform in `Dialog` closes it everywhere.
5. **Heading levels.** `Dialog` renders the title as `<h2>` (`Dialog.tsx:125`).
   Content inside must therefore start at `h3`. `CharacterStatsModal` currently
   renders an `<h3>` for the character name *and* `<h4>`/`<h5>` inside — which is
   consistent; it must stay that way after the §14 restructure.
6. **Zoom.** Every dialog is verified at 200% zoom with zh-CN content. The
   `browser` size's fixed `h-[90vh]` is safe (it is viewport-relative); the
   removed inner `max-h-[46vh]` regions from D-2 were not.

## 13.8 Where the Web Interface Guidelines and DESIGN-SYSTEM disagree

Two disagreements found. Both are called out rather than silently resolved.

**(a) Native `<dialog>` vs. a custom div.** The Web Interface Guidelines prefer
the native `<dialog>` element / popover API, primarily to escape stacking contexts
and to get focus trapping and inertness from the platform. DESIGN-SYSTEM does not
address the mechanism, and `Dialog.tsx` is a hand-rolled `position: fixed` div
with a manual trap.

*Recommendation: do not migrate now.* The custom implementation is already
correct on the two things the native element gives you for free here (trap,
restore), the project needs a bottom-sheet variant that `::backdrop` styling makes
awkward, and a migration touches all four surfaces while frontend is mid-task on
them. Revisit when `inert` (§13.7.1) is added — if that turns out to need
`showModal()` to be reliable, the balance flips. Logging this in UI-DECISIONS as
an open item rather than a closed one.

**(b) Scrollbar-gutter.** The Guidelines suggest `scrollbar-gutter: stable` as the
tidier alternative to padding compensation in §13.3. It is cleaner, but it must be
set on the scroll container *ahead of time* (reserving the gutter permanently,
which shifts the default page layout for every user including those who never open
a dialog). *Recommendation: use the padding compensation in §13.3.* It costs a
computed value at open time and changes nothing for users who never open a dialog.

---

# §14 — Defect register from this task

Filed in review format, prioritized. `frontend-engineer` implements; I do not.

```
UI REVIEW
Issue: Dialog panel carries a conflicting second scroll context
Where: src/features/team-builder/CharacterStatsModal.tsx:175
Problem: className="max-w-2xl max-h-[88vh] overflow-y-auto" is applied to the
  Dialog panel, which Dialog.tsx:117 already sets to overflow-hidden. Two
  conflicting overflow declarations on one element; outcome depends on emitted
  rule order, not on intent. The max-h-[88vh] also silently overrides the shared
  max-h-[90vh].
Recommendation: Delete the className. Pass size="panel" (§13.1).
Priority: High
```
```
UI REVIEW
Issue: Three nested scroll regions inside one dialog
Where: CharacterStatsModal.tsx:175 (panel), Dialog.tsx:130 (body),
  CharacterStatsModal.tsx:469 (max-h-[46vh]), :532 (max-h-[50vh])
Problem: Up to three vertically stacked scrollers. Wheel and PageDown targets are
  unpredictable; at 200% zoom the vh-based inner regions collapse to a few lines
  while the outer region also scrolls; vh is measured against the viewport, not
  the dialog, so inner regions can exceed their container on short viewports.
Recommendation: Remove max-h and overflow from both inner regions. The Dialog
  body is the only scroller (§13.2). Move the tab strip to a sticky slot so it
  does not scroll away (§13.4).
Priority: High
```
```
UI REVIEW
Issue: No body scroll lock on any dialog
Where: src/components/ui/Dialog.tsx (absent); grep for document.body.style /
  useScrollLock / preventScroll across src/ returns zero matches
Problem: The background page scrolls freely under every open dialog. The earlier
  audit credited overscroll-behavior: contain (Dialog.tsx:122,130) with
  preventing this; that was incorrect. overscroll-behavior prevents scroll
  CHAINING out of a scroller that has hit its end. It does nothing for pointer
  over the scrim, keyboard scroll, scrollbar drag, or a gesture that never
  entered the dialog's scroller.
Recommendation: Reference-counted lock inside Dialog: record and set
  body.overflow, compensate padding-right by
  (window.innerWidth - documentElement.clientWidth) to prevent the sideways jump,
  restore recorded values exactly on close (§13.3).
Priority: High
```
```
UI REVIEW
Issue: Four dialog surfaces, three sizing idioms, escape hatch sniffed by string
Where: CharacterPicker.tsx:307 (h-[88vh]), ArtifactPicker.tsx:85 (h-[90vh]),
  WeaponPicker.tsx:91 (h-[90vh]), CharacterStatsModal.tsx:175 (max-w-2xl
  max-h-[88vh]), Dialog.tsx:119 (!className?.includes("max-w-"))
Problem: Sizing is passed as raw utility classes through className, so there is no
  contract; the 88vh/90vh split has no rationale behind it; and Dialog detects the
  override by string-sniffing the caller's class list.
Recommendation: Closed three-name size scale (§13.1). Remove the className sizing
  escape hatch and the string sniff.
Priority: Med
```
```
UI REVIEW
Issue: Element colour mapped by 8-branch inline ternary with decorative glows
Where: src/app/page.tsx:448-461
Problem: (1) Uses Tailwind defaults bg-red-500 / bg-sky-500 / bg-purple-500, not
  the DESIGN-SYSTEM element tokens (#ec4c3a / #2f9fe0 / #b26cf5) whose AA contrast
  was measured — so the measured guarantee does not cover what renders.
  (2) shadow-[0_0_8px_rgba(...)] is a decorative glow on a non-overlay element,
  against "Shadows: none" (D2 rejected exactly this).
  (3) Duplicates the element->colour mapping that ElementTag already owns; it has
  already drifted from it.
Recommendation: One exported ELEMENT_MARK record colocated with ElementTag. No
  shadow. Element name still present as text or aria-label (never colour-only).
Priority: Med
```
```
UI REVIEW
Issue: Decorative coloured glows beyond page.tsx (full extent, verified)
Where: src/features/team-builder/TeamSlot.tsx:145
  shadow-[0_0_20px_-3px_rgba(245,158,11,0.25)] — amber glow on the ACTIVE slot;
  src/features/simulation/InsightsPanel.tsx:15,21,27
  shadow-[0_0_8px_rgba(...)] on the success / warning / info status dots
Problem: Same D2 rejection as page.tsx:448-461, in three more places. The
  InsightsPanel case is the worse of the two: it glows a semantic STATE dot, so
  the glow re-encodes information the state token and its adjacent label already
  carry, and it does so with an arbitrary rgba that is not the state token's own
  value. TeamSlot's amber glow duplicates a selection state that the ring-1
  ring-amber-400 border on the same line already expresses.
Recommendation: Delete all four. TeamSlot's selection stays as ring + border
  (DESIGN-SYSTEM's `selected` treatment, already present on that line).
  InsightsPanel dots keep bg-<state>.fg and their text label. No shadow.
Priority: Med
```
```
UI REVIEW
Issue: Tier-3 diagnostics rank above Tier-2 analysis
Where: src/app/page.tsx:522 (energy), :533 (timeline), :558 (breakdown)
Problem: The energy panel — a Tier-3 internal — sits above the damage breakdown,
  which is Tier 2. A user's first question after a total is "who", not "how much
  energy".
Recommendation: Order per §12.2: character damage, ability damage, reaction
  damage, timeline, then energy in a disclosure.
Priority: Med
```
```
UI REVIEW
Issue: Results scaffolding renders before any result exists
Where: src/app/page.tsx:394-400 and the view switcher at :266/278/290
Problem: The empty state renders inside the results region, and a three-way
  all/setup/results switcher is offered when two of the three are empty.
Recommendation: Two layouts (§12.3, §12.4). Configure hides the switcher and the
  results region entirely.
Priority: Med
```
```
UI REVIEW
Issue: Readiness string states an instruction, not a state
Where: src/app/page.tsx:370 — "就绪 · 点击运行模拟获取伤害与充能数据"
Problem: DESIGN-SYSTEM requires constraints surfaced before the click. This tells
  the user what the button does, which the button's own label already says.
Recommendation: Count-bearing state — "就绪 · 4 名角色 · 12 个动作"; when blocked,
  real disabled attribute plus the visible blocking reason (§12.3).
Priority: Low
```
