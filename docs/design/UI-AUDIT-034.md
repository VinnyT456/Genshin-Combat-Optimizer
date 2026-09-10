# UI-AUDIT-034 — External compliance audit

Owner: `uiux-engineer`. Audit only — no `src/**` changed.
Standard applied: **Vercel Web Interface Guidelines** (fetched
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`,
2026-09-03) + `impeccable`. Cross-checked against `DESIGN-SYSTEM.md`.

> Correction to the TASK #031 note: the guidelines fetch is NOT blocked on this
> machine. `curl` retrieved the source document successfully. The #031 claim that it
> required an unavailable network fetch was wrong and is withdrawn.

Every finding below was read in the file before filing. Line numbers are as of this
audit; `frontend-engineer` is editing these files concurrently, so re-grep the symbol
rather than trusting the line if it has moved.

---

## Summary

| Priority | Count |
|---|---|
| High | 6 |
| Medium | 9 |
| Low | 5 |
| Product decision required | 3 |

The three least-reviewed surfaces (`RotationEditor`, `SimulationSettings`,
`EnemyConfigurator`) account for a disproportionate share. The timeline, energy panel
and `Dialog` are the strongest code in the app and are largely clean.

---

## Where the Web Interface Guidelines and DESIGN-SYSTEM DISAGREE

These are the findings that only an external standard produces. In each case I state
which side I recommend rather than deferring to my own document.

### D1. Radius scale — DESIGN-SYSTEM is losing, and it should concede

**DESIGN-SYSTEM** ("Borders / radius / shadows"): `rounded-sm` · `rounded-md` ·
`rounded-full`, "No other radii."
**Reality:** 7 distinct radii in `src/**` — `rounded-md` (28), `rounded-xl` (26),
`rounded-sm` (25), `rounded-full` (10), `rounded-lg` (9), `rounded-2xl` (2),
`rounded-t-xl` (1).

The guidelines take no position on radius, so this is purely internal — but it is the
clearest case of a spec that has been overtaken. `rounded-xl` is not scattered
accidentally: it is baked into the shared `CARD` token
(`src/components/ui/tokens.ts:19`) and into `Dialog` (`src/components/ui/Dialog.tsx:118`).
The design has evolved to a softer card language and the spec did not follow.

`tailwind.config.ts:79-84` only **extends** `borderRadius` with `sm`/`md`. Because
`extend` does not remove Tailwind's defaults, `rounded-xl`/`lg`/`2xl` still resolve.
The "no other radii" rule has never been enforceable.

**Recommendation:** amend DESIGN-SYSTEM to a 4-step scale — `sm` (2px, inline chips
and bars) · `md` (6px, dense controls, inputs, list rows) · `xl` (12px, cards, panels,
dialogs) · `full` (avatars, circular markers) — and **delete** `rounded-lg` and
`rounded-2xl` (11 sites) which carry no distinct meaning. Then make it real by
overriding rather than extending `borderRadius` so an unlisted radius fails to compile
to anything. Do not attempt to revert 26 `rounded-xl` sites to `md`; the spec is the
thing that is wrong here.

### D2. Shadows — DESIGN-SYSTEM says "none"; the guidelines are silent; the code says otherwise

**DESIGN-SYSTEM:** "Shadows: **none**. Elevation is expressed by surface value +
border, not shadow." Sole exception: overlay layers.
**Reality:** `shadow-sm` ×11, `shadow-[0_0_20px...]` ×11, `shadow-md` ×3, `shadow-lg`
×2, `shadow-xl` ×1, `shadow-inner` ×1 — across `TeamSlot`, `InsightsPanel`,
`CharacterPicker`, `CharacterAvatar`, `page.tsx`, and the shared `CARD` token.

**Recommendation:** partially concede, but hold the line where it matters. Permit
`shadow-sm` on the `CARD` token (it is doing real work separating stacked panels on a
near-black background) and `shadow-lg`/`xl` on overlays as already excepted. **Reject**
`hover:shadow-lg hover:-translate-y-0.5` on the picker card
(`CharacterPicker.tsx:223`) and the amber glow `shadow-[0_0_20px_-3px_rgba(245,158,11,0.25)]`
on the active team slot (`TeamSlot.tsx:138`): both are decorative lift, which the stated
design direction explicitly names as an anti-goal ("Avoid: ... AI-slop dashboard"), and
the active slot already carries `ring-1 ring-amber-400` which is sufficient and cheaper.

### D3. `transition-all` — the guidelines are right and DESIGN-SYSTEM already agreed; the code ignores both

**Guidelines:** "Never `transition: all` — list properties explicitly" (listed under
Anti-patterns).
**DESIGN-SYSTEM:** "`transition-colors duration-150` only — never `transition: all`".
**Reality:** 16 live `transition-all` sites. `src/components/ui/tokens.ts:11` even
carries the comment "Never `transition-all`" directly above the token that exists to
prevent it.

No disagreement — both authorities agree and the code violates both. Filed as M1.

### D4. URL state — the guidelines demand something DESIGN-SYSTEM never considered

**Guidelines:** "URL reflects state — filters, tabs, pagination, expanded panels in
query params"; "Deep-link all stateful UI (if uses `useState`, consider URL sync)".
**DESIGN-SYSTEM:** silent. No section addresses URL or deep-linking anywhere.

This is a genuine gap in my own document, and it matters more for this product than
for most. A theorycrafting tool's entire social function is *sharing a build* — "here
is the rotation, look at the numbers". Today `page.tsx:79` holds the view mode, and
team/enemy/rotation/simConfig (`page.tsx:64-75`) are all local `useState`. Nothing is
shareable; a reload discards a hand-built rotation with no warning.

**Recommendation:** adopt the guideline. Add a "URL & shareable state" section to
DESIGN-SYSTEM. See P1 — the full scope is a product decision, but the `view` tab at
minimum should be a query param today.

---

## HIGH

### H1. Team slot keyboard shortcuts are attached to an unfocusable element
`src/features/team-builder/TeamSlot.tsx:76-87` (handler), `:108-133` (element)

**Issue:** `handleKeyDown` implements Alt+←/→ reorder and Delete/Backspace removal, and
is bound at `:131` to a `<div>` that is `draggable` but has **no `tabIndex`, no `role`,
and is not a `<button>`**. The only `role`/`tabIndex` in the file is at `:252-253`, on a
different, inner element.

**Problem:** the `<div>` never receives keyboard focus, so `onKeyDown` never fires from
the keyboard. Every one of those shortcuts is dead for keyboard users. Reordering is
therefore **drag-only**, which the guidelines forbid outright: "Drag/swipe/pinch/path
gestures need tap/click and keyboard alternatives unless essential." The `title` at
`:133` advertises "快捷键: Alt+←/→" — a promise the component cannot keep, and one that
is itself only reachable by hover (see H2). This is the same class of defect as the
stacked-timeline regression: a control that exists in the code and not in the product.

**Recommendation:** give the slot a real roving-tabindex group. Add `tabIndex={0}` and
`role="listitem"` (the parent is already a list) or restructure so an explicit
"Move left / Move right / Remove" control group exists as real `<button>`s, visible on
focus-within as well as hover. Keyboard reorder must not depend on the drag surface at
all. Announce the resulting order change through the existing `LiveRegion`.
**Priority: High.**

### H2. `tierReason` remains `title`-only — unreachable by keyboard and touch
`src/features/team-builder/TeamSlot.tsx:153` · `src/features/team-builder/CharacterPicker.tsx:228`

**Issue:** both sites render `<StatusChip state={tierBadge.state} title={meta.tierReason}>`.
`StatusChip` (`src/components/ui/StatusChip.tsx:21`) puts `title` on a non-interactive
`<span>`.

**Problem:** confirmed still live, unchanged since it was first filed. A `title` on a
non-focusable `<span>` is hover-only: unavailable to keyboard users, unavailable on
touch, and inconsistently exposed by screen readers. DESIGN-SYSTEM is unambiguous here
— "Tier is never tooltip-only. Every place a tier chip appears, the full explanatory
sentence is reachable without hover ... not solely as `title`" — and "`partial` requires
a named reason", with the reasoning that "a `partial` chip with no reason is worse than
none". For a product whose stated failure mode is plausible-but-wrong output, the reason
*is* the feature; the chip alone tells a user to distrust the number without telling
them what to distrust.

**Recommendation:** render the reason as visible text, not a tooltip.
- **Picker card:** the card is large; render `meta.tierReason` as a `micro`,
  `line-clamp-2` line inside the card body for `basic`/`partial`. Omit for `full`
  (DESIGN-SYSTEM permits a quiet or absent `full` chip).
- **Team slot:** the slot is dense. Use the `SkipButton` pattern already proven at
  `TimelineLane.tsx:174-211` — a real `<button>` carrying `aria-expanded` that reveals
  the sentence as adjacent visible text. That pattern was built for exactly this problem
  and should be lifted into `src/components/ui/` as a shared `ExplainChip` rather than
  reimplemented.

Note this is independent of the §11 / N15 block: the *display* of an authored
`tierReason` needs no derived-tier logic. Do not let it wait on N15.
**Priority: High.**

### H3. Timeline span labels fail WCAG AA at every element — verified by measurement
`src/features/rotation-timeline/TimelineLane.tsx:136` and `:143`
(`text-black/80` on `spanFillClass` from `laneStyles.ts:8-17`)

**Issue:** this is the claim the previous run died verifying. It is **real, and worse
than stated**. Composited `text-black/80` over `bg-element-{e}/70` with the parent
`opacity-80` at `:128`, against both `bg-surface-raised` and `bg-surface-raised/60`:

| element | contrast (opacity-80) | at full opacity (hover/selected) |
|---|---|---|
| pyro | **2.39** | 3.08 |
| electro | **2.58** | 3.34 |
| hydro | **2.77** | 3.64 |
| geo | **3.31** | 4.47 |
| dendro | **3.41** | 4.61 |
| anemo | **3.64** | 4.96 |
| cryo | **3.93** | 5.40 |
| physical | **4.11** | 5.67 |

**Zero of eight reach the 4.5:1 text floor** in the resting state. Pyro, electro and
hydro fail even the 3:1 non-text floor. DESIGN-SYSTEM's "Contrast floor" section sets
4.5:1 for text and warns specifically that element colours must be re-checked when placed
on a tinted background — that check was never run for this composite.

**Downgrade note, stated honestly:** both spans are `aria-hidden="true"` and the same
information is in `aria-label={action.label}` (`:114`), which `timelineModel.ts:280-281`
builds from character + ability + damage. So this is **not** a screen-reader defect, and
it is not the "tooltip is the sole source" violation it first looks like. It is a
straightforward low-vision legibility defect affecting the primary visual encoding of the
app's core view. That is why it stays High rather than becoming Critical.

**Recommendation:** do not solve this by darkening element colours — DESIGN-SYSTEM
already pins pyro at its 4.68 floor and the fills are the timeline's whole visual
language. Instead:
1. Drop the `opacity-80` at `:128` and bake the resting transparency into the fill,
   so hover/selected is a *border/ring* change rather than an opacity change. Opacity on
   a text-bearing container is what makes this unfixable per-element.
2. Raise the fill from `/70` toward full element colour and switch the glyph and label
   to a **per-element** foreground chosen for contrast, not a blanket `text-black/80`.
   Add `SPAN_TEXT: Record<Element, string>` beside `SPAN_FILL` in `laneStyles.ts`:
   black-family for cryo/anemo/geo/dendro/physical, white-family for pyro/hydro/electro.
   At full-opacity fill, `text-black` on cryo/physical/anemo clears 4.5 comfortably and
   `text-white` on pyro clears it from the other side.
3. Re-measure and record the resulting table in DESIGN-SYSTEM before sign-off. I will
   not accept this fix on report.

**Priority: High.**

### H4. Both search inputs have no accessible name
`src/features/team-builder/CharacterPicker.tsx:329-338` ·
`src/features/team-builder/WeaponPicker.tsx:97-107`

**Issue:** `<input type="search">` with `placeholder` only — no `<label>`, no
`aria-label`, no `aria-labelledby`.

**Problem:** guidelines: "Form controls need `<label>` or `aria-label`" and "Form inputs
without labels" is a named anti-pattern. The placeholder disappears on first keystroke,
so a screen-reader user tabbing back into a half-typed query hears nothing but the value.
Both are the primary control of a full-screen dialog.

**Also on these two lines:**
- `placeholder-slate-500` — DESIGN-SYSTEM: `slate-500` measures 3.65 on
  `surface.raised` and is **"Forbidden"** for text. Placeholder text is text. Use
  `placeholder-slate-400`.
- Placeholders end in `...`; guidelines require `…` (and DESIGN-SYSTEM's Typography
  section says the same).
- No `spellCheck={false}` / `autoComplete="off"`. Guidelines require both on
  non-auth search fields; without them, browsers offer password-manager and spellcheck
  UI over a character-name query.

**Recommendation:** add `aria-label` naming the scope ("搜索角色" / "搜索武器"),
`spellCheck={false}`, `autoComplete="off"`, fix the ellipsis, and move the placeholder to
`slate-400`. The `WeaponPicker` clear button at `:108-114` also lacks `aria-label` — it
has visible text ("清除") so it is fine, but the `CharacterPicker` equivalent at `:341-348`
correctly carries one; keep them consistent.
**Priority: High.**

### H5. Simulation mitigation math lives in the UI
`src/features/setup/EnemyConfigurator.tsx:27-35`

**Issue:** the component computes the DEF multiplier `(90+100)/((90+100)+(level+100))`
and the full piecewise RES multiplier (negative / <0.75 / ≥0.75 branches) inline.

**Problem:** this is a UI/UX finding, not just an architecture one, because of what it
does to the user. `AGENTS.md` states "No business logic in UI. No magic numbers" and
"Frontend **consumes** APIs only — never computes damage or reactions." The `90` at `:28`
is a hardcoded character level that appears nowhere in the user's configuration — the
label says "对90级角色综合承伤率" but the user may have configured no such character.
The number is presented in `amber-400` at `:157` with the same visual weight as a real
simulation result, so a user cannot tell that this figure came from a different code path
than everything else on the page. Given that this project has already shipped
plausible-but-wrong numbers once, a second independent damage formula in the UI layer is
a category of risk this team specifically knows about.

**Recommendation:** either (a) delete the telemetry block `:153-171` and let the value
come from the simulation result, or (b) have `combat-engineer` export the mitigation
helpers and have the UI call them — never a local reimplementation. Route through the
Manager; this crosses an ownership boundary. If it stays, the `90` must be labelled as an
assumption at the point of display, not buried in the string.
**Priority: High.** Flagged to Manager as cross-module.

### H6. Character images ship without dimensions, preconnect, or a loading state
`src/components/ui/CharacterAvatar.tsx:129-136`, and `next.config.mjs`

**Issue:** raw `<img>` with `src`, `alt`, `loading="lazy"`, `onError` — no `width`, no
`height`. No `<link rel="preconnect">` for the image host. No loading state: the fallback
initial only renders after `onError`, so the interval before load is an empty tinted
circle.

**Problem:** guidelines are explicit — "`<img>` needs explicit `width` and `height`
(prevents CLS)", "Add `<link rel="preconnect">` for CDN/asset domains", and "Images
without dimensions" is a named anti-pattern. In the picker this renders ~139 times in a
grid; every one is an unsized lazy image on a third-party origin.

**Three further points, in scope as the spec review this task asked for:**
1. **The CDN is not the one that was verified.** `:51` and `:93` use
   `https://enka.network/ui/UI_AvatarIcon_{Name}.png`. `docs/PROJECT-STATUS.md` records
   the *verified* primary as `https://api.lunaris.moe/data/assets/avataricon/...webp`
   (200, image/webp, ~17KB) with `https://gi.yatta.moe/assets/UI/...png` as fallback.
   `enka.network` appears in neither. I have not verified it responds; that is
   `frontend-engineer`'s to confirm, but shipping an unrecorded third-party origin as the
   *primary* for every avatar in the app needs an explicit answer.
2. `alt={characterName}` is the **English** name while every visible name on the page is
   `charNameZh(...)`. A screen-reader user in a `lang="zh-CN"` document hears a different
   name than the one written beside the image. Use the same `charNameZh` value, or
   `alt=""` — the name is always adjacent in text, so decorative is defensible and
   arguably better.
3. `getCharacterAvatarUrl` at `:44-52` duplicates the identical override lookup inlined
   at `:87-93`. Two copies of a name-mapping table will drift.

**Recommendation for the spec** (this is the "flag what the spec should require" ask):
add an **Images** section to DESIGN-SYSTEM requiring, for every remote character/weapon
asset: explicit `width`/`height` matching the `SIZE_CLASSES` step; a three-state contract
(**loading** → neutral tinted circle, not a spinner, at this size; **loaded**; **failed**
→ initial glyph, which already exists and is good); `preconnect` to every origin in the
chain; `decoding="async"`; and the origin list recorded in DESIGN-SYSTEM so a CDN swap is
a design-system change and not a silent edit. If `next/image` is adopted,
`next.config.mjs` needs `images.remotePatterns` — still absent.
**Priority: High.**

---

## MEDIUM

### M1. `transition-all` at 16 sites, against both authorities
`page.tsx:263,275,287,460` · `TeamSlot.tsx:135,194,293,385` ·
`WeaponPicker.tsx:213` · `CharacterPicker.tsx:218,365,388,413` ·
`RotationEditor.tsx:165,344` · `EnemyConfigurator.tsx:163` ·
`InsightsPanel.tsx:50`

**Problem:** guidelines anti-pattern; DESIGN-SYSTEM motion budget ("only `opacity` and
`transform` animate; max 150ms"). Beyond principle, `transition-all` on
`TeamSlot.tsx:135` animates the `bg-gradient` and `border-color` of a card that also
carries `scale-[0.98]`/`scale-[1.02]` drag states — layout-adjacent properties on a
compositor-unfriendly path. `duration-200` (`:135`, `:163`) and `duration-300`
(`page.tsx:460`, `TeamSlot.tsx:293`) also exceed the 150ms ceiling.

**Recommendation:** replace all 16 with `TRANSITION_COLORS`, or an explicit
`transition-[opacity,transform] duration-150` where transform genuinely animates. The
token already exists at `tokens.ts:12`; these sites simply bypass it. For the two
progress bars (`page.tsx:460`, `TeamSlot.tsx:293`) animating `width`, use
`transition-[width] duration-150` — still not `all`.
**Priority: Medium.**

### M2. Rotation actions delete with no confirmation and no undo
`src/features/setup/RotationEditor.tsx:71-75` (`handleDeleteAction`), `:306-317` (control),
`:124-132` (清空 / clear-all)

**Problem:** guidelines: "Destructive actions need confirmation modal or undo window —
never immediate." A hand-built rotation is the single highest-effort artefact a user
creates in this product, it is not persisted anywhere (see D4), and 清空 discards the
entire sequence on one click with no dialog and no recovery. The per-row `✕` at `:306` is
a 24×24 target sitting 4px from the `↓` reorder button, so a mis-tap is likely and
unrecoverable.

**Recommendation:** an undo window is a better fit than a modal here — a confirm dialog
on every row delete would be intolerable in a sequence editor. Keep single-action delete
immediate but surface a persistent "已删除第 N 步 · 撤销" affordance in the existing
`LiveRegion` region for ~8s. Require a confirm for 清空 only. Increase the control hit
targets (see M3).
**Priority: Medium.**

### M3. Touch targets below 44px across the form surfaces
`RotationEditor.tsx:278-317` (`h-6 w-6` = 24×24, three controls per row) ·
`EnemyConfigurator.tsx:86-121` (`h-7 w-7` = 28×28 stepper, and the `h-7` input) ·
`RotationEditor.tsx:161-175`, `:339-352` (pills at `py-1`) ·
`CharacterPicker.tsx:365,388,413` (filter chips at `py-1`)

**Problem:** DESIGN-SYSTEM: "Mobile rules: hit targets ≥ 44×44px". A `TOUCH_TARGET`
token exists at `tokens.ts:22` (`min-h-11 min-w-11 sm:min-h-0 sm:min-w-0`). It is
correctly applied in `IconButton.tsx:31` — and **at none of the sites above**, because
none of them route through `IconButton`; each hand-rolls its own bare `<button>`. The
reorder/delete cluster is the worst case: three 24px targets with 4px gaps inside a
scrolling list.

**Recommendation:** the fix is not to paste `TOUCH_TARGET` into 8 more `className`s —
it is that these controls should be `IconButton`, which already carries the token, the
focus ring, and the mandatory `label` prop. The reorder/delete cluster and the level
stepper are exactly what `IconButton` is for. Route them through it; apply `TOUCH_TARGET`
directly only to the pill/chip rows, which are text buttons and not icon buttons. The
token's `sm:` reset means desktop density is preserved either way, so this costs nothing
on the surface these were designed for.
**Priority: Medium.**

### M4. Heading hierarchy skips a level in every results table
`src/features/damage-breakdown/DamageBreakdown.tsx:41`

**Problem:** `<h4>` rendered inside a `Section`, whose heading is `<h2>`
(`src/components/ui/Section.tsx:30`). Page is `<h1>` (`page.tsx:208`). So the document
goes h1 → h2 → h4, skipping h3. Guidelines: "Headings hierarchical `<h1>`–`<h6>`";
DESIGN-SYSTEM: "Headings strictly hierarchical `h1 → h2 → h3`". Same pattern to check in
`EnergyPanel.tsx:59` (`<h3>` — correct) and the `<h3>`s in `RotationEditor.tsx:101`,
`SimulationSettings.tsx:31`, `EnemyConfigurator.tsx:65` (correct).

**Recommendation:** `DamageBreakdown` `<h4>` → `<h3>`. Low effort, one line.
Additionally: these are three parallel data tables rendered as `<ul>` of `<li>`
(`:44-69`). The guidelines prefer semantic HTML — "Use semantic HTML (`<button>`, `<a>`,
`<label>`, `<table>`) before ARIA". A damage breakdown with label / value / percent
columns is a genuine `<table>` and would give screen-reader users row-column navigation
they currently do not have. Worth doing when §10 lands.
**Priority: Medium.**

### M5. View switcher is not a tab set, has no focus ring, and is not deep-linkable
`src/app/page.tsx:258-293` (three buttons), `:79` (`useState`)

**Problem:** three mutually-exclusive view buttons rendered as plain `<button>`s with
no `aria-pressed`, no `role="tablist"`/`role="tab"`, no `FOCUS_RING`, and
`transition-all`. Compare `RotationTimeline.tsx:200-214`, which does this correctly with
`aria-pressed` on both toggles — the pattern is already right elsewhere in the codebase.
Selection is signalled by `bg-amber-500` alone, which is the color-only-status case
DESIGN-SYSTEM forbids. And per D4, the view is not in the URL.

**Recommendation:** add `aria-pressed={view === ...}` to all three (simplest — matches
the timeline precedent and needs no tab-panel wiring), add `FOCUS_RING`, replace
`transition-all` with `TRANSITION_COLORS`, and sync `view` to a `?view=` query param.
**Priority: Medium.**

### M6. Element colours re-invented ad hoc in four components
`RotationEditor.tsx:148-157` (red/sky/purple/emerald ladder) ·
`TeamSlot.tsx:89-104` (gradient ladder) ·
`CharacterAvatar.tsx:61-70` (`ELEMENT_BG` gradient map) ·
`CharacterPicker.tsx` (`elementCardTint`)

**Problem:** `tailwind.config.ts:22-31` defines `element.*` as the single source of
elemental colour, DESIGN-SYSTEM publishes measured contrast ratios for exactly those
eight values, and `laneStyles.ts` uses them correctly. These four components instead use
generic Tailwind hues (`red-500`, `sky-500`, `purple-500`, `emerald-500`, `lime-600`,
`cyan-600`) that are *different colours*. The same character is therefore red-500 in the
rotation ribbon and `element-pyro #ec4c3a` in the timeline. Two of the four ladders are
also incomplete — `RotationEditor.tsx:148-157` has no branch for cryo, geo or dendro, so
those three characters silently fall through to the neutral `border-surface-border`
style and lose their element coding entirely.

None of the measured contrast in DESIGN-SYSTEM applies to any of these values.

**Recommendation:** one `elementSurfaceClass(element)` helper in
`src/lib/format.ts` beside the existing `elementBgClass`, built from `element.*` tokens,
covering all eight elements exhaustively (`Record<Element, string>`, so a missing element
is a type error rather than a silent neutral). Replace all four ladders.
**Priority: Medium.**

### M7. Disabled controls without a visible reason
`CharacterPicker.tsx:213` (`disabled={takenElsewhere}`) ·
`RotationEditor.tsx:280`, `:294` (reorder at list bounds)

**Problem:** DESIGN-SYSTEM: disabled requires "a real `disabled` attribute,
`opacity-60 cursor-not-allowed`, **plus an adjacent visible reason string**. Never a
disabled control with no explanation." The picker card dims a character with no statement
that they are already in the party — the user sees an unexplained greyed card among 139.
`page.tsx:358-364` does this correctly for the simulate button; that is the pattern.

**Recommendation:** picker — render a `StatusChip state="info"` reading `已在队伍中`
on the disabled card. Reorder buttons — bounds-disabled is self-evident from position
and is acceptable as-is; note the exception in DESIGN-SYSTEM rather than leaving the
rule looking violated.
**Priority: Medium.**

### M8. Number input missing `inputMode`, and steppers are unlabelled by value
`src/features/setup/EnemyConfigurator.tsx:98-109`

**Problem:** `type="number"` with no `inputMode="numeric"` — guidelines: "Use correct
`type` (`email`, `tel`, `url`, `number`) and `inputmode`". On mobile this shows a full
keyboard rather than a numeric pad. The input is `w-16 h-7`, below the touch floor (M3).
`handleLevelChange` at `:37-43` clamps to 1–110 silently, so typing `200` snaps the field
to `110` with no message — the guidelines require "Errors inline next to fields" and
DESIGN-SYSTEM requires an error state with `aria-invalid`/`aria-describedby`. Silent
clamping is the one behaviour that leaves the user believing they set something they did
not.

**Recommendation:** add `inputMode="numeric"`, `autoComplete="off"`; on out-of-range
input show an inline `state.warning` line ("等级范围 1–110，已调整为 110") rather than
snapping silently; announce via the existing live region.
**Priority: Medium.**

### M9. `SimulationSettings` groups are unlabelled to assistive tech
`src/features/setup/SimulationSettings.tsx:41-71`, `:74-104`

**Problem:** two groups of three mutually-exclusive `aria-pressed` buttons. The group
label ("暴击计算模式:", "角色切人耗时:") is a plain `<span>` at `:43` and `:76` with no
programmatic association, so a screen-reader user hears "期望暴击, pressed" with no
indication of what it configures. `aria-pressed` on a mutually-exclusive set is also the
weaker choice — this is a radio group.

**Recommendation:** wrap each in `role="radiogroup"` with `aria-labelledby` pointing at
the label span (give it a `useId`), and switch the buttons to `role="radio"` +
`aria-checked`. Alternatively use real `<fieldset>` + `<legend>` + visually-hidden
`<input type="radio">`, which the guidelines prefer ("Use semantic HTML ... before
ARIA") and which gets arrow-key navigation free. The same fix applies to
`EnemyConfigurator.tsx:126-151` (resistance presets) and the `CharacterPicker` filter
chip rows at `:365`, `:388`, `:413`.
**Priority: Medium.**

---

## LOW

### L1. `text-slate-500` used for text at five sites
`page.tsx:353` ("快捷执行"), `page.tsx:559` (footer), `TeamSlot.tsx:236`, `:333`,
`WeaponPicker.tsx:337`

DESIGN-SYSTEM measures `slate-500` at **3.65 on `surface.raised` — "Forbidden"** for
text, and marks it mark-only. The footer at `:559` is the exact case the spec calls out
by name ("footer prose ... was a defect"). All five are text. → `text-slate-400`.
Add `placeholder-slate-500` (H4) to this list. **Priority: Low.**

### L2. `text-[10px]` retired by spec, still live at four sites
`TeamSlot.tsx:212`, `:236`, `:333`, `CharacterAvatar.tsx:55`

DESIGN-SYSTEM: "`text-[10px]` ... is **retired** — smallest is 11px", and the `micro`
token exists in `tailwind.config.ts:73-76` for this. `CharacterAvatar.tsx:55` is the
avatar fallback initial and is arguably a glyph rather than text, but it is a character —
use `micro`. **Priority: Low.**

### L3. Straight ellipsis in user-facing copy
`CharacterPicker.tsx:334`, `WeaponPicker.tsx:102` (placeholders end `...`)

Guidelines and DESIGN-SYSTEM Typography both require `…`. Also check any future loading
label ends with `…` per the interaction-states table. **Priority: Low.**

### L4. Hardcoded cast times in the rotation list
`src/features/setup/RotationEditor.tsx:201` (`"0.50秒"`), `:217` (`"0.60秒"`)

`0.60` shadows `DEFAULT_SWAP_COST_SECONDS`, which the user can change to 0.4 or 0.8 in
`SimulationSettings` — so the list will state 0.60秒 for a swap the engine costs at
0.40秒. It is a small number displayed confidently and wrongly, which is this product's
named failure mode in miniature. `"0.50秒"` is a bare magic number
(`AGENTS.md`: "No magic numbers"). Derive both from config/data.
**Priority: Low** by blast radius, but note the class of defect.

### L5. Decorative gradient bar and non-token colour in enemy telemetry
`src/features/setup/EnemyConfigurator.tsx:161-166`

`bg-gradient-to-r from-amber-500 to-emerald-400` on a progress bar. DESIGN-SYSTEM
design direction names "heavy gradients" as an explicit avoid, and the gradient encodes
nothing — a mitigation of 40% and 90% both render as the same amber→emerald sweep,
merely clipped, so the colour at the bar's right edge is a function of *width* and not of
the value. That is a chart that implies an encoding it does not have. Use a flat
`bg-amber-500`, or make the colour a real threshold function. (`dataviz` reasoning: do
not spend a colour channel on nothing.) Same applies to `globals.css:11`'s page-level
radial gradient, which is subtle enough to keep. **Priority: Low.**

---

## PRODUCT DECISIONS REQUIRED — not mine to make

### P1. Is a configuration shareable by URL?
Per D4. Putting team + rotation + enemy + sim config in the URL is the difference between
a calculator and a theorycrafting tool people link each other to. It is also real scope:
a state codec, a versioning story for when the schema changes, and a decision about
whether a stale link should refuse to load or load partially. **Recommend at minimum the
`view` tab today** (trivial, and fixes M5), with the full build-sharing codec taken as its
own task if the user wants it. I have not specced it because the answer changes the
information architecture of the whole page.

### P2. Does the app persist work across reload?
Today it does not, and there is no `beforeunload` guard — the guidelines call for
"Warn before navigation with unsaved changes". A user who spends ten minutes building a
rotation loses it to a refresh, silently. Options: `localStorage` autosave (cheap, no UI),
an explicit save/load list (more UI, more discoverable), or a `beforeunload` warning only
(cheapest, most annoying). This interacts with P1 — if state lives in the URL, reload
survives for free and this question mostly dissolves. **Recommend deciding P1 first.**

### P3. Which avatar CDN is canonical, and is a third-party origin acceptable at all?
Per H6.1. The code uses `enka.network`; PROJECT-STATUS verified `api.lunaris.moe` and
`gi.yatta.moe`. Beyond picking one, there is a standing question the user should answer:
139 character portraits hotlinked from a third party means the app's visual completeness
depends on someone else's uptime and hotlink policy, and it sends a request per avatar to
an origin the user did not choose. Self-hosting is ~2.5MB of webp and removes the
question entirely. **Recommend self-hosting**, but it is a hosting/licensing call, not a
design one.

---

## What passed

Worth recording, because these were the risk areas and they came back clean.

- **`viewMode.ts`** — the responsive defect is properly fixed. Every branch carries an
  explicit base display class (`"block"` / `"hidden sm:block"` / `"block sm:hidden"` /
  `"hidden"`), the invariant is documented at the top of the file as the reason, and
  `viewMode.test.ts` pins it. Exactly the right shape of fix: the rule is encoded where
  it can be tested, not left as a comment on a className.
- **`Dialog.tsx`** — focus trap, focus restore on close, `Esc`, `role="dialog"` +
  `aria-modal` + `aria-labelledby`, `overscroll-behavior: contain` on both the panel and
  the scroll body, scrim as a real `<button>` rather than a clickable `<div>`, bottom
  sheet on mobile via `items-end sm:items-center`. Meets every guideline in the modal set.
- **`RotationTimeline.tsx`** — full roving tabindex with Arrow/Home/End across lanes,
  `role="group"` with a descriptive `aria-label`, correct `aria-pressed` on the view
  toggle, empty state present and informative.
- **`TimelineLane.tsx:174-211` `SkipButton`** — a genuinely good pattern: a real
  `<button>` with `aria-expanded` that reveals its reason as adjacent visible text
  precisely so the reason is never tooltip-only. This is the fix H2 needs; promote it.
- **`EnergyMeter.tsx`** — `role="meter"` with correct min/now/max and label; and the
  refusal to render a 0%-width fill for unknown energy (`:29-31`) is the right call for a
  product whose failure mode is confident wrongness.
- **`globals.css`** — `color-scheme: dark`, global `prefers-reduced-motion` reset,
  `touch-action: manipulation` on all interactive elements, global `tabular-nums` on
  `.font-mono`. Three guidelines satisfied at the root rather than per-component.
- **`SkipLink`** + `MAIN_CONTENT_ID` + `Section` `aria-labelledby` — landmark structure
  is sound.
- **`StatusChip`** — glyph `aria-hidden`, label always carries meaning. Never
  colour-only. (Its `title` prop is the H2 problem, but the component itself is correct.)

### One real gap at the root
`src/app/layout.tsx` has no `<meta name="theme-color">`. Guidelines: "`<meta
name="theme-color">` matches page background". Add `themeColor: "#0d0f17"` to the Next
`viewport` export. **Priority: Low**, folded into L-series.

---

## Self-audit of these recommendations against DESIGN-SYSTEM

Required by my own process; three contradictions found and resolved before filing.

1. **H3 recommends changing element fill opacity and adding a per-element text map.**
   DESIGN-SYSTEM says "do not darken" pyro and publishes ratios for the eight element
   colours *as foreground text*. My recommendation does not darken any element token — it
   changes the *fill alpha* of a background and adds a foreground map. No contradiction,
   but DESIGN-SYSTEM's contrast table must gain a second block ("element as background,
   with foreground") or the next reader will assume the published 4.68 covers this case.
   **Flagged as a required DESIGN-SYSTEM amendment, not just a code fix.**

2. **D1 recommends adopting `rounded-xl`, which my own document forbids.** Stated
   openly rather than resolved in the code's favour silently. The reason to concede is
   that the rule was never enforceable (`extend` vs override) and the violation is
   centralised in a shared token, i.e. the system chose a fourth radius deliberately and
   the document did not keep up. But I am recommending the scale still be *closed* at four
   steps and made enforceable — conceding the value, not the principle.

3. **M7 recommends exempting bounds-disabled reorder buttons from the "visible reason"
   rule.** That is a narrowing of a DESIGN-SYSTEM rule I wrote. Justification: the rule
   exists so a user is never blocked without explanation; "the first item cannot move up"
   is explained by the item's position, which is visible. Narrowing it here prevents the
   rule from being ignored everywhere because it is absurd somewhere. The amendment must
   be written into DESIGN-SYSTEM rather than left as an undocumented exception in this
   audit — otherwise the next audit files it again.

4. **Checked and found consistent:** M3's `TOUCH_TARGET` recommendation matches the
   44px rule and the token's existing `sm:` reset; M6's helper matches the existing
   `elementBgClass` convention in `src/lib/format.ts`; M2's undo-over-modal choice is not
   addressed by DESIGN-SYSTEM at all and is therefore a new decision, logged for
   UI-DECISIONS rather than presented as existing policy.

## Follow-ups for `docs/design/` (mine, once findings are actioned)
- DESIGN-SYSTEM: amend radius scale (D1), amend shadow rule (D2), add **URL &
  shareable state** section (D4), add **Images / remote assets** section (H6), add
  element-as-background contrast block (self-audit 1), narrow the disabled-reason rule
  (self-audit 3).
- COMPONENTS: spec `ExplainChip` (H2) and `elementSurfaceClass` (M6).
- UI-DECISIONS: log the undo-vs-confirm choice (M2) and the radius concession (D1).
