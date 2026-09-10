# DESIGN-SYSTEM.md

Owner: `uiux-engineer`. Formal design interface consumed by `frontend-engineer`.
Records **actual** tokens where they exist in code; `TBD` where undecided — do not
invent large token sets ahead of need.

Source of truth for implemented tokens: `tailwind.config.ts`, `src/app/globals.css`,
`src/lib/format.ts`.

## Design direction
Dark, technical, precise, information-dense, clean, modern, restrained. Feels like
Genshin theorycrafting + combat simulator + optimization tool.
Avoid: generic SaaS dashboard, heavy gradients, giant hero, pointless animation,
excess rounded cards, decorative UI, AI-slop dashboard.

## Colors (implemented — Phase 1)

Surfaces:
| Token | Value | Use |
|---|---|---|
| `surface` | `#0d0f17` | page background |
| `surface.raised` | `#161a26` | cards, panels |
| `surface.border` | `#242a3a` | borders, dividers |
| text base | `slate-200` | body text (globals.css) |

Elemental (damage/element coding):
| Element | Value |
|---|---|
| pyro | `#ec4c3a` |
| hydro | `#2f9fe0` |
| electro | `#b26cf5` |
| cryo | `#7ad4e8` |
| anemo | `#4ad2a6` |
| geo | `#e0a53b` |
| dendro | `#8bc34a` |
| physical | `#c9ced9` |

Accent (from current UI): amber (`amber-500/400`) for the primary action + damage bars.

### Semantic state tokens (DECIDED — Phase 2)

Four semantic states only. Each has a `fg` (text/icon on dark surface, AA-verified
against `#0d0f17` and `#161a26`), a `bg` (tinted fill for chips/rows, always used
*with* `fg` text, never alone), and a `border`.

Add to `tailwind.config.ts` under `theme.extend.colors.state`:

Contrast measured against `surface.raised #161a26` / `surface #0d0f17`. All pass AA at any size.

| Token | fg | bg | border | Contrast (raised / page) | Use |
|---|---|---|---|---|---|
| `state.success` | `#4ade80` | `rgba(74,222,128,0.12)` | `rgba(74,222,128,0.32)` | 9.96 / 10.98 | ready / available / burst castable / sim complete |
| `state.warning` | `#fbbf24` | `rgba(251,191,36,0.12)` | `rgba(251,191,36,0.32)` | 10.40 / 11.46 | skipped action, partial team, near-threshold, engine `warnings[]` |
| `state.error`   | `#f87171` | `rgba(248,113,113,0.12)` | `rgba(248,113,113,0.32)` | 6.27 / 6.92 | invalid config, engine `errors[]`, unusable action |
| `state.info`    | `#7dd3fc` | `rgba(125,211,252,0.12)` | `rgba(125,211,252,0.32)` | 10.41 / 11.47 | energy, neutral notices, "not yet modeled" |

Rules:
- `state.warning.fg` is deliberately distinct from the amber **accent** (`amber-500 #f59e0b`
  used for primary action + damage bars). Accent = "the thing you do"; warning = "the thing
  that went sideways". They are close in hue; never place a warning chip adjacent to the
  primary button without a text label.
- **Never color-only.** Every state use pairs the color with a text label and/or a glyph
  (`✓ Ready`, `⚠ Skipped`, `✕ Invalid`, `◇ Energy`). Glyphs are `aria-hidden`; the label carries meaning.
- Disabled is **not** a semantic state color — it is `text-slate-500` + `opacity-60` +
  `cursor-not-allowed`, plus a visible reason string (see Interaction states).
- Energy uses `state.info`, not a new token. Energy-full uses `state.success`.

### Contrast floor
Body/label text ≥ 4.5:1 on its surface. Non-text UI (bars, lane rules, focus rings,
timeline markers) ≥ 3:1.

Measured element colors on `surface.raised #161a26` — all pass AA for text at any size, so
element-colored names and chips are safe:

| pyro | hydro | electro | cryo | anemo | geo | dendro | physical |
|---|---|---|---|---|---|---|---|
| 4.68 | 5.92 | 5.25 | 10.26 | 9.14 | 7.95 | 8.27 | 11.00 |

`element.pyro` at 4.68 is the floor — do not darken it, and do not place it on a tinted
`state.*` background without re-checking. Element color is still never the sole signal;
the element name appears in text in the same row regardless.

Grey ramp: `slate-400` (6.77) is the lowest **text** grey allowed on `surface.raised`.
`slate-500` measures **3.65 — fails AA for text**.

The boundary is **text vs. mark**, not *where on the page the thing sits*:

| Category | Floor | `slate-500` | Examples |
|---|---|---|---|
| **Text** — anything a user reads as words or numerals | 4.5:1 | **Forbidden** | axis *labels* (`0s`, `12.4s`), tick numbers, slot numbers, footer prose, empty-state sentences, chip text, captions, help text |
| **Non-text mark** — geometry carrying no glyph | 3:1 | Permitted | axis *rules* and gridlines, dividers, lane separators, bar tracks, tick marks |

Being adjacent to an axis does not make a label a mark. An axis rule is a 1px line and is
non-text UI; an axis label is text and takes the 4.5:1 floor like any other text. The same
applies to an empty-state sentence — it is text, and it is the *only* thing on screen when
it renders, so it is the last place to economize on contrast.

`slate-500` on the darker page background measures 4.02 — technically above the small-text
threshold but marginal; **prefer `slate-400` for all text on either surface** and treat
`slate-500` as a mark-only token.

Phase 1 used `text-slate-500` for axis labels, footer prose, and the Damage Breakdown
`No damage recorded.` empty state — all three are text, all three were defects, all three
move to `slate-400`.

## Typography

- Mono stack (implemented): `ui-monospace, SFMono-Regular, Menlo, monospace` — used for
  numbers/stats. Every number that a user might compare column-to-column is mono +
  `tabular-nums`.
- UI font family (DECIDED): keep the **system UI stack**, no webfont. Rationale in
  UI-DECISIONS. Add to `tailwind.config.ts` `fontFamily.sans`:
  `["ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","Helvetica Neue","Arial","sans-serif"]`.
  Zero network cost, no FOUT, and a neutral technical voice. Revisit only if branding demands it.

### Type scale (DECIDED — Phase 2)

Seven steps. Tailwind defaults where they fit; only `text-[11px]` is custom.
Nothing above `text-2xl` exists in this product — there is no hero.

| Role | Class | Size / line-height | Weight | Use |
|---|---|---|---|---|
| `display` | `text-2xl` | 24 / 32 | 600 | page `h1`, Tier-1 stat values |
| `title` | `text-lg` | 18 / 28 | 600 | panel `h2` where a panel needs a real title |
| `body` | `text-sm` | 14 / 20 | 400 | default body, table cells, form values |
| `body-strong` | `text-sm` | 14 / 20 | 500–600 | character names, emphasized values |
| `label` | `text-xs` | 12 / 16 | 400 | field labels, secondary metadata |
| `section` | `text-xs` | 12 / 16 | 600, `uppercase tracking-wide`, `text-slate-400` | section headers (matches Phase 1 `Section`) |
| `micro` | `text-[11px]` | 11 / 14 | 400–500 | timeline axis ticks, chip text, dense counters |

- `text-[10px]` (used in Phase 1 Timeline) is **retired** — smallest is 11px.
- Numeric display: `font-mono tabular-nums`. Apply `font-variant-numeric: tabular-nums`
  globally to `.font-mono` in `globals.css` so damage/energy columns never jitter.
- Headings use `text-balance`; long single-line labels use `truncate` with the full value
  in `title`/tooltip **and** available elsewhere non-hover (tooltips are never the sole source).

## Language & CJK typography (DECIDED — TASK #046)

**`zh-CN` is the product language.** Not a localization of an English product — the primary
one. Several typography rules above were authored against Latin text and are wrong for CJK;
they are corrected here, and this section wins where it conflicts with anything earlier in
this file or with the Web Interface Guidelines.

`<html lang="zh-CN">`. Set it; layout, hyphenation, line-breaking, font fallback and screen-
reader voice selection all key off it.

### Font stack

Do **not** add a webfont. Chinese webfonts are 3–8 MB even subsetted, and the system stacks
are excellent on every target platform. Extend the existing `fontFamily.sans`:

```
"ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto",
"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
"Helvetica Neue", "Arial", "sans-serif"
```

The Latin faces come first deliberately: numerals and ability codes (`N1`, `CD`, `DPS`) then
render in the Latin face, and only Han glyphs fall through to the CJK face. Reversing the
order gives Han-face numerals, which are wider and break `tabular-nums` column alignment.

The mono stack is **unchanged and CJK-free**. It is applied only to numerals
(`font-mono tabular-nums`), never to a string containing Han characters — CJK glyphs in a
Latin mono face fall back mid-string and produce visibly mismatched baselines.

### The rules that change for CJK

| Latin rule (elsewhere in this file / in the Guidelines) | CJK ruling |
|---|---|
| Cap body line length at 65–75 **ch** | **24–36 Han characters per line.** `ch` is the width of `0` in the current font and has no relationship to a Han glyph's width; a 70`ch` measure is ~70 Han characters, roughly double a comfortable Chinese measure. Express as `max-w-[34em]` for prose, or a fixed `max-w-md` / `max-w-lg`. **Do not use `ch` units anywhere in this product.** |
| `text-wrap: balance` on h1–h3 | **Do not use.** `balance` optimizes for even ragged-right in a space-delimited script. Chinese has no inter-word spaces, so the browser's line breaker already breaks between almost any two characters and every line is already near-full. `balance` produces no visible improvement and, on headings mixing Han with a Latin token, can create a worse break. Remove from `Dialog.tsx:125` and the `display` type step. |
| `text-wrap: pretty` on long prose | **Keep.** Orphan avoidance is script-independent and `pretty` degrades to no-op safely. |
| `line-clamp-N` estimates a card's height from N lines | **Load-bearing correction.** At the same font-size a Han glyph is ~1.0em wide against a Latin average of ~0.5em, so a given box holds roughly **half** as many Chinese characters as English ones. A card sized for a 2-line English string clamps the Chinese equivalent to 2 lines of half the content — or, if unclamped, wraps to 4 lines and breaks the layout. **Every `line-clamp` value and every fixed height must be chosen against zh-CN copy, never against an English draft.** |
| Hyphenation / `word-break` | Chinese does not hyphenate. Do **not** set `hyphens`. Do **not** set `word-break: break-all` — it will break a Latin token mid-word. `overflow-wrap: anywhere` only on a container that genuinely holds unbroken ids. |
| `line-height` | Han glyphs are dense and full-height; the Latin-tuned line-heights in the type scale are **tight** for Chinese body text. Body (`text-sm`) moves from `20px` to **`22px`** line-height for `body` and `body-strong`. Other steps unchanged — labels and micro text are short and do not wrap. |
| `uppercase` / `tracking-wide` on the `section` step | **No effect on Han and is not harmful**, so it stays for mixed strings. But a section header that is pure Chinese gains nothing from it; do not add letter-spacing beyond `tracking-wide`, which visually loosens Han text far more than it does Latin. |
| Sentence-ending punctuation | Use full-width `。，、：（）` in Chinese strings. Do not mix in ASCII `.` `,` `(` `)`. Keep the DESIGN-SYSTEM rule that `…` is a real ellipsis. |

### Density consequence — this is what decision 1 was about

Chinese is roughly **60% of the character count** of the equivalent English string but each
character is **~2× the width**, so a translated string occupies **~1.2× the horizontal
space** while carrying more meaning per character. The practical effects, which every card
and dialog spec must respect:

- A label sized to fit its English text will usually still fit its Chinese text, but with
  much less slack — plan for ~20% more width, not less.
- A *paragraph* is the opposite: it is denser and shorter, so a Chinese empty-state sentence
  needs fewer lines than the English draft. Do not reserve English-sized vertical space.
- **Card heights and dialog content heights are derived from zh-CN copy at 200% zoom**, never
  from an English mock. This is the concrete reason `h-24` in COMPONENTS §4.10 must be
  measured rather than inherited (see §4.10's amendment).

### i18n hygiene, even as a single-language product

- No string concatenation to build a sentence from fragments. Chinese word order differs from
  English; a `"共 " + n + " 个角色"` template is fine, `a + verb + b` assembly is not.
- Numbers stay Arabic numerals with `zh-CN` grouping (`1,284,301`) — never 中文数字.
- Units follow the numeral with a **non-breaking space** in Latin units (`21.0 s`) and with
  **no space** before Chinese units (`3段`, `6命`). Both appear in this product.
- Dates, if ever shown, are `YYYY-MM-DD`.

## Dialogs (DECIDED — TASK #046)

Full contract in **DASHBOARD-AND-DIALOGS-041.md §13**, which is authoritative for behaviour.
The tokens are recorded here because they are design-system-level:

| Size | Desktop ≥640 | Mobile <640 |
|---|---|---|
| `sheet` | `sm:max-w-lg`, content height, `max-h-[90vh]` | bottom sheet, `max-h-[90vh]` |
| `panel` | `sm:max-w-2xl`, content height, `max-h-[90vh]` | bottom sheet, `max-h-[90vh]` |
| `browser` | `w-[96vw] max-w-7xl h-[90vh]` fixed | full-screen `h-[100dvh]` |

Closed set. A dialog names a size; it never passes `max-w-*` / `h-*` / `max-h-*` through
`className`. Radius `rounded-t-xl sm:rounded-xl`. Shadow `shadow-xl shadow-black/70`
(the overlay exception above).

**Exactly one scrolling element per dialog** — the dialog body. Nested `overflow-y-auto`
inside dialog content is a defect. `overflow-x` on a wide data table is permitted with a
visible edge affordance.

**Background scroll is locked while any dialog is open**, reference-counted, with
scrollbar-width padding compensation. `overscroll-behavior: contain` does **not** provide
this — it prevents scroll *chaining*, which is a different thing; an earlier audit credited
it incorrectly.

## Spacing / layout
- Tailwind default spacing scale. Allowed steps in this product: `1, 2, 3, 4, 6, 8, 12`
  (4/8/12/16/24/32/48px). Do not use `5`, `7`, `9`, `10`, `11`.
- Density defaults: card padding `p-4`; dense row padding `px-3 py-2`; gap between sibling
  cards `gap-4`; gap between sections `mb-8`.
- Page max-width: `max-w-5xl` for Phase 1 content, **`max-w-7xl` once the multi-lane
  timeline lands** — 4 lanes plus a detail panel need the width. Applies to the whole page
  so the header stays aligned.

## Borders / radius / shadows
- Radius scale (DECIDED — AMENDED TASK #046, D1): **four steps, closed set.**

  | Step | Value | Use |
  |---|---|---|
  | `rounded-sm` | 2px | inline chips, bars, dense markers |
  | `rounded-md` | 6px | **default** — cards, panels, buttons, inputs, tabs |
  | `rounded-xl` | 12px | dialog panels and bottom sheets only (§ Dialogs) |
  | `rounded-full` | — | circular timeline markers and avatars only |

  **Why `xl` was added.** The scale previously said "no other radii" while
  `tailwind.config.ts:77` declared `borderRadius` under `theme.extend` — which *adds* `sm`
  and `md` without *removing* Tailwind's `lg`/`xl`/`2xl`/`3xl`. The prohibition was therefore
  never enforceable, and `rounded-xl` is already in use on dialog panels
  (`Dialog.tsx:118`) and on several cards. Conceding the step the product actually needs,
  and making the rest genuinely unavailable, is better than a rule that only the diligent
  follow.

  **The scale is CLOSED and must become ENFORCEABLE.** `borderRadius` moves from
  `theme.extend.borderRadius` to `theme.borderRadius` — a **replacement**, not an extension:

  ```ts
  // tailwind.config.ts — theme.borderRadius (NOT theme.extend.borderRadius).
  // Replacing rather than extending is what makes the four-step scale real:
  // under `extend`, Tailwind's lg/2xl/3xl stay available and "no other radii"
  // is unenforceable prose.
  borderRadius: {
    none: "0",
    sm: "2px",
    md: "6px",
    xl: "12px",
    full: "9999px",
  },
  ```

  After this change `rounded-lg`, `rounded-2xl`, `rounded-3xl` **fail to compile a class**
  and the rule enforces itself. Existing `rounded-lg` usages (several in
  `CharacterStatsModal.tsx`) migrate to `rounded-md`; `rounded-t-xl` / `sm:rounded-xl` on the
  dialog panel are unaffected.
- Borders: 1px `surface.border`. Selected/active border: `state`-appropriate or `amber-500`.
- Shadows (AMENDED TASK #046, D2 — partial concession):

  | Allowed | Where |
  |---|---|
  | `shadow-sm` | on the `CARD` token only — a 1px-scale shadow that reads as a crisp edge, not as elevation |
  | `shadow-xl shadow-black/70` | overlay layers only: dialog panels, bottom sheets, popovers |
  | anything else | **forbidden** |

  Elevation is otherwise expressed by surface value + border. Specifically **rejected**:
  - **Decorative hover-lift** (`hover:shadow-lg`, `hover:-translate-y-*`). Hover feedback is
    a colour change (see Interaction states). A card that rises on hover animates a layout-
    adjacent property for no informational gain, and 132 of them in a roster grid is the AI-
    dashboard tell this system exists to avoid.
  - **Coloured glows** (`shadow-[0_0_8px_rgba(...)]`, amber or elemental). Colour carries
    state in this system; a glow is colour used decoratively and it re-encodes an element
    that is already encoded by the mark's fill and its adjacent text label. Live instance at
    `src/app/page.tsx:448-461` is a defect — see DASHBOARD-AND-DIALOGS-041 §12.7.

## Interaction states

Every interactive element implements the full matrix. Baseline classes:

| State | Rule |
|---|---|
| default | as specced per component |
| hover | contrast increases: raise surface (`bg-surface-raised` → `bg-[#1c2130]`) or brighten accent (`amber-500` → `amber-400`). `transition-colors duration-150` only — never `transition: all` |
| active | `active:translate-y-px` on buttons; no other movement |
| focus-visible | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface`. Never remove outline without this replacement. Use `:focus-visible`, not `:focus` |
| selected | 1px `amber-500` border + `bg-amber-500/10` + a non-color affordance (checkmark, or `aria-selected`/`aria-pressed`) |
| disabled | real `disabled` attribute, `opacity-60 cursor-not-allowed`, **plus an adjacent visible reason string**. Never a disabled control with no explanation |
| loading | label ends with `…` (`Simulating…`), control stays focusable, `aria-busy="true"`, region announced via `aria-live="polite"` |
| error | `state.error` border + inline message beneath the control, `aria-invalid`, `aria-describedby` |

Motion budget: only `opacity` and `transform` animate; max 150ms; everything wrapped in
`@media (prefers-reduced-motion: reduce)` → no transition. No decorative animation anywhere.

## Responsive rules
Breakpoints: Tailwind defaults. Targets: mobile `<640`, tablet `640–1023`, desktop `≥1024`.
Complex timeline + damage tables get an **alternative mobile interaction**, not a shrunk
desktop layout. Concrete patterns (DECIDED):

| Surface | Desktop ≥1024 | Tablet 640–1023 | Mobile <640 |
|---|---|---|---|
| Team builder | 4 slots in a row | 2×2 grid | vertical list, 1 slot per row |
| Timeline | 4 stacked lanes on one shared x-axis | same, horizontally scrollable | **lane-per-tab or chronological event list** — see COMPONENTS.md |
| Damage breakdown | 3 tables side by side | 2 columns, third wraps | 1 column, tables collapsible |
| Event detail | right-side panel | below timeline | bottom sheet |

Mobile rules: hit targets ≥ 44×44px, `touch-action: manipulation` on interactive controls,
`overscroll-behavior: contain` on the bottom sheet, no horizontal page scroll (only the
timeline's own scroll container scrolls sideways, with visible edge affordance).

## Accessibility
- Keyboard nav, visible focus, semantic HTML, WCAG AA contrast.
- Never color-only status — pair element/damage/state color with text or a labelled glyph.
- Tooltips never the sole information source — anything in a tooltip also exists in the
  detail panel or an expandable row.
- `aria-label` on every icon-only control; decorative glyphs `aria-hidden="true"`.
- `<button>` for actions, `<a>`/`<Link>` for navigation. No `<div onClick>`.
- Async results (simulation finished, validation) announced with `aria-live="polite"`.
- Headings strictly hierarchical `h1 → h2 → h3`; skip-link to `<main>`.
- Typography: `…` not `...`; curly quotes; non-breaking space in `0.6 s`-style units
  where the value and unit must not break.

### Audit checklist (run before every UI review sign-off)
1. Tab through the whole page — every interactive element reachable, focus always visible,
   order matches visual order, no trap.
2. Every icon-only button has `aria-label`.
3. Every disabled control has a visible adjacent reason.
4. Every status conveyed by color also has text/glyph.
5. Contrast: body ≥4.5:1, non-text ≥3:1 (spot-check element colors on both surfaces).
6. `prefers-reduced-motion` honored.
7. Zoom to 200% — no clipped content, no horizontal page scroll.
8. Screen-reader pass on the three Phase 2 features: team slot, energy readout, timeline event.
9. Empty / loading / error state exists and is announced for each async region.
10. Mobile: 44px targets, alternative timeline interaction reachable without gestures.

## Support tier & data verification (DECIDED — Character System Phase A)

The roster will contain characters the engine simulates completely, characters it
simulates approximately, and characters whose defining mechanic does not exist yet. The
product's stated failure mode is **plausible-but-wrong output**. A character whose special
mechanic is unimplemented must therefore never render identically to a fully-simulated one.
Support tier is a **first-class display property of every character**, not a footnote.

### The three tiers

Tiers are **reused, not new, colour**: they map onto the existing four semantic state
tokens. No new colour tokens are introduced — DESIGN-SYSTEM forbids inventing tokens ahead
of need, and a fifth palette would compete with the state palette it sits beside.

| Tier | Token | Glyph | Short label | Meaning |
|---|---|---|---|---|
| `full` | `state.success` | `✓` | `Full support` | Every ability, passive and constellation in this character's data is executed by the engine. |
| `basic` | `state.info` | `◇` | `Basic support` | Abilities and scaling are simulated. Some passives / constellations / conditional effects are not. |
| `partial` | `state.warning` | `⚠` | `Special mechanic missing` | A mechanic central to this character is not implemented. Damage output will be wrong, usually low. |

Rules:
- **Tier is never colour-only and never glyph-only.** The short label is always rendered as
  text wherever the tier appears. `StatusChip` already enforces `aria-hidden` on the glyph.
- **Tier is never tooltip-only.** Every place a tier chip appears, the full explanatory
  sentence is reachable without hover — as visible text in the config panel and in the
  browser's detail area, not solely as `title`.
- `partial` uses `state.warning`, not `state.error`. The character is usable and its result
  is real; it is *incomplete*, not *invalid*. `state.error` stays reserved for things that
  cannot run.
- Tier text is written from the **user's** perspective — what will be wrong — not the
  engineering perspective ("resource system not wired").
- A tier is **data**, never inferred by the UI from whether fields look populated.
  Inference would silently promote a character the day someone adds a field.

  **AMENDED (TASK #031).** When written, the only tier source was the authored claim, so
  "data" and "authored" were the same thing and this rule said "authored alongside the
  character". A second source now exists: qa's coverage matrix DERIVES a tier from what the
  engine can execute and what tests assert. That is not the UI inference this rule forbids —
  it is a computed artefact of the same standing as the claim, it lives outside the UI, and
  it can only DEMOTE, so the silent-promotion failure this rule exists to prevent cannot
  occur through it. The rule is therefore narrowed to its actual intent: **no component may
  compute or adjust a tier from character fields.** Which of the two sources the UI displays,
  and what happens when they disagree, is ruled in COMPONENTS.md §11.

### `partial` requires a named reason

A `partial` chip with no reason is worse than none — it makes the user distrust everything
without telling them what to distrust. Every `partial` character carries a short
user-facing sentence naming the missing mechanic and its direction of error, e.g.
`Stack-based scaling is not simulated — damage will read low.` The direction of error is
required: knowing whether a number is under- or over-stated is what makes the caveat
actionable.

### Unverified values

`UNVERIFIED` marks a **field**, not a character, and is orthogonal to tier: a fully
supported character can carry one unverified constant. It is rendered as an inline
`state.info` marker on the specific value, never as a whole-character banner, and its
adjacent text names the field. A character carrying one or more unverified fields does not
change tier.

- Marker: `◇ Unverified` chip, `micro`, adjacent to the value it qualifies.
- The value is still shown. Hiding it would be a worse lie than showing it qualified.
- Where several values in one panel are unverified, the panel additionally carries one
  `state.info` summary line so a user scanning quickly cannot miss all of them
  (`3 values in this kit are unverified.`).

### Where tier must appear

Non-negotiable, because each is a point where a user could otherwise form a false belief:

1. Every roster row / card in the character browser.
2. The filled team slot.
3. The character configuration panel header, with the full sentence.
4. Any results view that attributes damage to that character (Tier-2 breakdown rows and
   timeline lane headers carry the chip when the tier is not `full`).

`full` may be rendered as a quiet chip or omitted in dense result contexts (4) — the
absence of a caveat where every character is fully supported is not a false claim. `basic`
and `partial` may **never** be omitted anywhere in that list.

## Resolved / remaining TODOs
- [x] Semantic state color tokens — decided above.
- [x] Type scale + UI font decision — decided above.
- [x] Spacing + radius scales formalized — decided above.
- [x] Mobile alternative for timeline + damage table — decided above, detailed in COMPONENTS.md.
- [x] Support-tier + UNVERIFIED visual language — decided above (Character System Phase A).
- [x] Language / CJK typography — decided above (TASK #046, decision 1). Supersedes the
      Latin-authored `ch` line-length, `text-balance` and `line-clamp` rules.
- [x] Dialog sizing scale + scroll ownership + body scroll lock — decided above (TASK #046).
- [x] Radius scale enforceability (D1) and shadow concession (D2) — amended above.
- [ ] Optimizer-progress visual language (Phase 4).
- [ ] Reaction / aura color language (Phase 3) — do not invent before reactions exist.
