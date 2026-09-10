# UI-DECISIONS.md

Owner: `uiux-engineer`. Log of significant UI/UX decisions. Append newest at top.

Template:

```
## Decision
<decision>

## Reason
<reason>

## Alternatives
<alternatives>

## Status
proposed | accepted | deprecated
```

---

## Decision
Support tier is a **first-class, authored display property of every character** (`full` /
`basic` / `partial`), rendered as text + glyph on every surface that names a character, and
reused onto the existing `state.success` / `state.info` / `state.warning` tokens rather than
getting a palette of its own.

## Reason
The project's stated failure mode is plausible-but-wrong output. A character whose defining
mechanic is unimplemented must never render identically to a fully-simulated one, or the user
forms a false belief from a confident-looking number. Making it authored data (not inferred
from whether fields look populated) prevents a character being silently promoted to `full` the
day someone adds an unrelated field. A fifth colour family would compete with the state
palette it sits beside, for no added meaning.

## Alternatives
A separate tier palette (rejected: DESIGN-SYSTEM forbids inventing tokens ahead of need);
inferring tier from data completeness (rejected: silently wrong, and wrong in the optimistic
direction); a single footnote on the results page (rejected: the user selects a character long
before reaching results, and by then the belief is formed).

## Status
accepted

---

## Decision
`partial` uses `state.warning` and **requires a named reason with a direction of error**
(`Stack-based scaling is not simulated — damage will read low.`). It never uses `state.error`.

## Reason
The character is usable and its output is real — it is *incomplete*, not *invalid*;
`state.error` stays reserved for things that cannot run. A bare `partial` chip with no reason
is worse than none: it makes the user distrust everything without telling them what to
distrust. The direction of error is what converts a caveat into something actionable — knowing
a number is understated is usable information, knowing only that it is "wrong" is not.

## Alternatives
`state.error` for `partial` (rejected: overstates, and collides with genuinely unrunnable
config); tier chip with no reason string (rejected above); hiding `partial` characters
entirely (rejected: the user would conclude the tool has no such character).

## Status
accepted

---

## Decision
The result-level caveat for a team containing a `basic`/`partial` character sits **above** the
Tier-1 damage number; the engine-wide `UNSUPPORTED_MECHANICS` disclosure sits **below** it,
collapsed.

## Reason
The two gaps have different blast radii. A `partial` character in *this* team demonstrably
changes *this* number, so it must be read before the number it qualifies. A globally
unimplemented mechanic may not touch this rotation at all, and the UI currently cannot tell
which — hoisting it above every result on every run would train users to dismiss the region,
and a dismissed caveat is worse than a well-placed one.

## Alternatives
Both above (rejected: warning fatigue, and it would make every run look broken); both below
(rejected: the per-team caveat would be read after the number it invalidates); merging them
into one banner (rejected: different subjects, different remedies, different scopes).

## Status
accepted

---

## Decision
The Traveler is **one roster entry with a form chosen at or after selection**, never six
entries. Selecting it places a **formless** character and blocks `Simulate` with a reason,
rather than defaulting to an element.

## Reason
Six entries would be a factual misstatement of the game and would let two "different"
Travelers into one party — the §1.3 duplicate guard could not catch it, because their ids
differ. Defaulting silently to an element would put a character in the party the user never
picked, and every downstream number would be for the wrong element: a wrong answer produced
without a single error state, which is precisely this project's failure mode.

## Alternatives
Six roster entries (rejected above); one entry defaulting to Anemo (rejected above); an
expandable Traveler card in the grid (rejected: expanding one card in a fixed-height
virtualized grid breaks the row model, and form choice is configuration, not identity).

## Status
accepted

---

## Decision
The character grid is a **composite widget with roving `tabindex`** (`role="grid"`, exactly one
card in the tab order), and disabled cards remain arrow-reachable.

## Reason
~100 cards as ~100 tab stops makes `Tab` unusable and strands a keyboard user between the
search field and the dialog's close button. Unlike the timeline — where `role="grid"` was
rejected because that component could not honestly supply 2D structure — the browser genuinely
is a uniform grid of same-sized cells with a real row/column model, so the role is accurate.
The earlier rejection was of a *dishonest* role, not of the role. Skipping disabled cards would
make the grid geometry lie about what is on screen.

## Alternatives
One tab stop per card (rejected above); `role="listbox"` (rejected: no row/column model, so
arrow-key row movement would be unannounced); skipping disabled cards (rejected above).

## Status
accepted

---

## Decision
Virtualize above **60 rendered cards**, as a single constant flipping one code path — not
"always virtualize", and not a second component. §1.4's earlier threshold of 50 is retracted.

## Reason
Today's 4-character roster must not inherit a windowing library's focus and scroll bugs for no
benefit, but the behaviour has to flip automatically as the roster grows rather than depending
on someone remembering to switch it on. One constant gives both. The original 50 was a guess
made against a 4-entry roster; leaving two thresholds in the doc would guarantee one gets
implemented.

## Alternatives
Always virtualize (rejected: cost with no benefit at current scale, and it is the riskiest
path for focus management); never virtualize (rejected: ~100+ cards); two separate components
(rejected: divergence, and the accessibility model would have to be built twice).

## Status
accepted

---

## Decision
Level, ascension, constellation and the **three separate** talent levels are all closed
`<select>`/radio controls, and an illegal level/ascension pair **warns with a one-click fix**
rather than auto-correcting.

## Reason
The legal sets are small and closed, so a select cannot produce an invalid value at all —
strictly better than validating free text after the fact, and consistent with "surface
constraints before the click". The three talents level independently in game and in
`TalentLevels`; collapsing them into one field would be a silent data error the user cannot
see. Auto-correcting a field the user did not touch is the UI form of the data rule this
project already enforces in the engine: do not quietly substitute a value.

## Alternatives
Free-text numeric inputs (rejected: invites `999` and needs an error state a select makes
impossible); steppers (rejected: 1–90 is too many presses); one "talent level" field
(rejected above); silent auto-correction of ascension (rejected above — logged as OQ-5 for the
user to overrule).

## Status
accepted

---

## Decision
Timeline span selection is exposed as `aria-pressed` on a plain `<button>`, not `aria-selected`,
and the timeline does not declare `role="grid"`.

## Reason
`aria-selected` is only valid on descendants of listbox/grid/tablist/tree; on a bare button it is
invalid ARIA that may be ignored, leaving selection unannounced. Declaring `role="grid"` to
legalise it would demand full grid structure and 2D semantics — a half-implemented grid role
promises navigation it does not deliver, which is worse for AT users than correct button
semantics. The roving tabindex, which was the genuinely load-bearing part of the original
"grid-like" wording, is implemented and retained.

## Alternatives
Full `role="grid"` with rowgroup/row/gridcell (large surface, easy to get subtly wrong, no user
benefit over a toggle here); keep `aria-selected` (invalid, silently unannounced); no state
attribute at all (selection visible only as a colour ring — fails never-colour-only).

## Status
accepted

---

## Decision
`scrubTime` is derived from `selectedEventIndex`; there is exactly one selection state shared by
the timeline, the event detail panel and the energy panel.

## Reason
UX-FLOWS commits to "one selection model, three consumers". Two independent states would allow
the energy panel to report one timestamp while the detail panel beside it reports another — the
tool contradicting itself in two adjacent panels. Deriving at the point of use makes that
category of drift unrepresentable rather than merely discouraged.

## Alternatives
Independent `scrubTime` state synced via effects (sync bugs are inevitable and silent); storing a
derived timestamp alongside the index (two sources of the same truth).

## Status
accepted

---

## Decision
Where a component-level instruction in COMPONENTS.md conflicts with a rule in DESIGN-SYSTEM.md,
the **DESIGN-SYSTEM rule wins** and the component spec is the thing that gets corrected. Specs
are audited against the system rules before implementation, not after.

## Reason
§1.3 shipped an instruction ("the control is not shown — a `title` explains") that directly
contradicted the system's *tooltips are never the sole information source* rule, and it survived
review until `frontend-engineer` deviated toward the stronger rule while implementing. A
follow-up audit of §2/§3 found four more instances of the same class: `text-slate-500` axis
labels, clamped spans explained only by `title`, sub-40px swap durations reachable only by
tooltip, and a hover-only time cursor. All were spec defects, not implementation defects. A
precedence rule plus a pre-implementation audit is cheaper than discovering each one during
review or, worse, after it ships.

## Alternatives
Resolve conflicts case-by-case (produces inconsistent outcomes and invites re-litigation);
treat the component spec as authoritative because it is more specific (would have shipped four
accessibility defects); rely on implementation review to catch it (catches it one full
build-and-review cycle too late).

## Status
accepted

---

## Decision
Editing the team discards the current `SimulationResult`, and the discard is announced via the
live region **and** explained by a persistent `state.info` line in the Result section's position:
`Team changed — run the simulation again to see results for this team.`

## Reason
A retained result asserts per-character damage shares, an `On field` badge and an energy readout
for a party that no longer exists — a false claim about what is on screen. But clearing silently
removes four sections in one render, so half the page vanishes with no cause given and reads as a
crash. The clear is correct; the silence was the defect. A code comment explains it to the next
developer, not to the user.

## Alternatives
Keep the stale result (asserts numbers for a team that is gone); grey the result out as stale
(ambiguous — users read dimmed numbers as still true); block team edits while a result is loaded
(makes the tool hostile to the iteration it exists to support).

## Status
accepted

---

## Decision
Placing a character who already occupies another slot **swaps the two slots** rather than
rejecting the input; the picker remains the primary duplicate guard (disabled row, `Already in
slot N`), and a swap announces both moved characters by name.

## Reason
Slot position is meaningful party order, so "change slot 3 to the character in slot 1" is a
reorder, and a reorder is never an error — rejecting it turns a legitimate intent into a dead
click. Because a swap mutates two slots, a single-slot "added" announcement under-reports the
change and leaves the displaced character unnamed for screen-reader users.

## Alternatives
Reject the placement (dead click, no path to the user's actual intent); silently drop the
original occupant (destroys data the user did not ask to lose); hide already-teamed characters in
the picker (a missing row reads as missing data).

## Status
accepted

---

## Decision
Swap is rendered as a hatched span of real width bridging two lanes, never a tick or arrow,
and a permanent legend states `Swap 0.6 s — swapping costs time and is included in Duration and DPS.`

## Reason
Swap cost is a configurable, real time cost (default 0.6 s). A zero-width marker would let a
user conclude swapping is free and misread every DPS comparison. Width encodes cost; the
vertical bridge encodes the transfer of control.

## Alternatives
Arrow between lanes (implies instantaneous); dot on a shared axis (Phase 1 behavior, hides
cost); footnote only (users do not read footnotes while scanning a chart).

## Status
accepted

---

## Decision
Energy is displayed as `x / y` numerals first, bar second, with an always-present burst
availability chip carrying the *reason* (`⚠ Burst unavailable · needs 12 more energy` /
`· cooldown 4.2 s`), and the readout is always stamped with the timestamp it reflects.

## Reason
Phase 2 uses a particle, party-size-scaled, ER-applied model — energy is dynamic and differs
per character, and off-field characters gain energy. An unstamped bar is unreadable in that
model, and "surface constraints before the click" requires the blocking reason to be visible
without interaction.

## Alternatives
Bar-only (fails color-only rule and gives no number); energy shown only in the Tier-3 event
detail (buries the single most common question); post-click error toast (rejected by the
constraint-feedback principle).

## Status
accepted

---

## Decision
Ability class is encoded by a letter glyph (`N` / `C` / `E` / `Q`) on every timeline span,
in addition to element color.

## Reason
Two characters of the same element are indistinguishable by color, and skill vs burst is the
single most important distinction on the chart. Color alone also violates the never-color-only
rule.

## Alternatives
Shape coding (too small at span heights); color-only (rejected); text labels on every span
(does not fit at 0.5 s widths).

## Status
accepted

---

## Decision
Mobile timeline is a chronological event **List** by default, with an optional single-character
**Lane** mode — not a shrunk 4-lane chart.

## Reason
Four lanes on a shared axis under 640px is illegible and gesture-dependent. A list keeps every
event, keeps swap time visible as a reading-flow line item, is virtualizable, and is fully
keyboard/screen-reader navigable.

## Alternatives
Horizontal scroll of the desktop chart (pinch-dependent, tiny targets); hiding the timeline on
mobile (removes the product's analytical core).

## Status
accepted

---

## Decision
Team slots are positional (numbered 1–4), empty slots render at full height as add-affordances,
and reordering is available via labelled arrow buttons — drag is at most an enhancement.

## Reason
Party order is meaningful to the rotation, so it must be visible. Reserving slot height avoids
layout shift. Gesture-only reordering has no keyboard or touch-accessible equivalent.

## Alternatives
Free-form chip list (loses order legibility); drag-and-drop only (accessibility failure);
hiding empty slots (causes layout jump and hides remaining capacity).

## Status
accepted

---

## Decision
Semantic state palette limited to four tokens (success/warning/error/info) with `fg`/`bg`/`border`
triplets; disabled is not a color state but opacity + a mandatory visible reason string.

## Reason
DESIGN-SYSTEM explicitly forbids inventing tokens ahead of need. Four states cover every Phase 2
UX state. A disabled control with no stated reason is the most common failure this product could
make, given how many actions are gated by energy and cooldown.

## Alternatives
Full 9-step semantic ramps per state (unneeded); reusing the amber accent for warning (would
make warnings read as primary actions).

## Status
accepted

---

## Decision
No webfont — keep the system UI stack for prose and the existing mono stack for all numerals,
with `tabular-nums` applied globally to `.font-mono`.

## Reason
The product is a dense numeric comparison tool; column alignment matters more than brand voice.
System fonts cost nothing, cannot FOUT, and read as neutral/technical, matching the accepted
direction.

## Alternatives
Inter/Geist (adds a network dependency and a loading state for negligible gain); a display
typeface (fights the restrained direction).

## Status
accepted

---

## Decision
Dark, information-dense theorycrafting aesthetic — not a generic SaaS dashboard.

## Reason
Product is an analysis tool; users want data density and precision over decoration.

## Alternatives
Light admin-dashboard style; card-heavy marketing look — both rejected as low-density.

## Status
accepted

---

<!-- Add new decisions above this line. Phase 1 baseline only. -->

---

## TASK #031 — duplicate ability rows; claim-vs-derived; unverified surface

**D-31.1 — Duplicate ability labels disambiguate by OWNING CHARACTER, not by id.**
The id-keying is correct and stays. Rejected the id-as-suffix pattern even though frontend
already uses the id as a missing-label fallback, because that fallback's value is that its
appearance SIGNALS a contract bug; making the id routine would destroy that signal and put an
internal identifier in front of every user. Rejected ordinals as meaningless and sort-order
dependent. The owner is what the user is actually asking. Applied only to rows that actually
collide — a qualifier on every row is noise. Derivable from `damage.sourceCharacterId`
already on timeline events, so no engine contract change. Residual same-owner collision falls
back to the id, which is the one case where nothing else distinguishes them. (§10)

**D-31.2 — The user sees the DERIVED tier. Always. The claim is never displayed as the tier.**
On an overclaim, showing the claim shows a promise the code cannot keep — the core defect. On
an underclaim, showing the claim shows a caveat that is not true, which trains users to
disbelieve caveats. The derived tier is honest in both directions, so the claim never wins.
Its only job in the UI is to be compared. (§11.2)

**D-31.3 — Overclaim gets `state.error`; underclaim gets nothing in the product UI.**
Deliberate asymmetry, recorded so it does not read as an oversight. An overclaim is a defect
in the tool's own metadata — strictly worse than a known gap, and the one thing a user cannot
reason around — so it is the single place `state.error` is extended beyond "cannot run"
(flagged as PD-2 for ratification). An underclaim carries no risk and no user action;
surfacing it would dilute the chip that matters. It belongs in qa's coverage report. (§11.3)

**D-31.4 — DESIGN-SYSTEM's "tier is authored data" rule AMENDED, not overridden.**
Self-audit caught this: DESIGN-SYSTEM said tier is "authored alongside the character, never
inferred", which as written forbids displaying a derived tier. Its stated rationale is
narrower — it forbids UI inference from populated-looking fields, to prevent silent
PROMOTION. The derived tier is computed outside the UI and can only DEMOTE, so the failure
the rule guards against cannot occur through it. Rather than let COMPONENTS quietly contradict
the authoritative document, DESIGN-SYSTEM was amended to its actual intent: no COMPONENT may
compute a tier. Precedence rule from TASK #010 held — the system document was changed first.

**D-31.5 — Unverified character data is marked at ABILITY grain, `state.info`, and gets NO
result-level banner.** Character-grain marking would be a second competing tier signal.
`state.info` keeps three epistemic states distinct: unsure (`info`), missing (`warning`),
broken (`error`); escalating provenance to `warning` would flatten them. No result-level line
because if the audit's result is broad it would appear on every run and be invisible within a
day — warning fatigue, which §7.1 already names as the reason the mechanic-gap disclosure sits
below the fold. Recorded a re-spec TRIGGER: if the audit returns a narrow enumerable set, a
result-level line becomes affordable. The spec does not assume the audit's outcome either way.
(§11.7)

**D-31.6 — Values are never dimmed or hidden to indicate unverified.**
Dimming would fail the text contrast floor AND imply the number is less real than it is.
DESIGN-SYSTEM already rules that hiding an unverified value is the worse lie. Full contrast,
adjacent marker. (§11.7)

**Self-audit result.** One contradiction found and fixed before handoff (D-31.4). One claimed
defect DOWNGRADED on verification: §11.6 initially asserted the `DATA_ONLY` mis-mapping was
live; checking the authored data showed no character uses that spelling, so it is latent. It
is still filed (Finding O) precisely because latent means untested. One defect UPGRADED on
verification: `tierReason` is `title`-only across ~half the roster (Finding M) — the same
tooltip-as-sole-source class this spec forbids and that TASK #009 already corrected once.

---

## TASK #046 — dashboard, dialogs, character detail (2026-09-04)

### D-046-1 · zh-CN is the product language, and Latin typography rules were wrong for it
**Decision.** `zh-CN` primary. DESIGN-SYSTEM's typography section gains a CJK/i18n block that
**supersedes** three earlier rules: the 65–75`ch` measure (→ 24–36 Han characters; `ch` banned
outright), `text-wrap: balance` on headings (→ removed; it optimizes ragged-right in a
space-delimited script and Chinese has no inter-word spaces), and `line-clamp` sizing.
**Why it was load-bearing.** A Han glyph is ~1.0em wide vs ~0.5em for Latin, so a box holds
about half as many Chinese characters. Every card height and dialog content height derived
from an English mock is wrong by roughly 2× in the clamping direction. This is the concrete
reason §4.10's `h-24` had to be re-ruled rather than kept.
**Rejected.** Adding a Chinese webfont — 3–8 MB even subsetted, against a system stack that is
excellent on every target. Latin faces are listed *first* in the stack so numerals stay in the
Latin face and `tabular-nums` column alignment survives.

### D-046-2 · Tier at scale: baseline stated once, per-card chip only on deviation
**Decision.** COMPONENTS §7.3. The roster is 139 generated entries and `registry.ts:48` claims
one identical `PARTIAL` tier with one identical reason for every one of them.
**Why.** A chip rendering identically on ~135 of 139 cards with an identical reason carries
zero per-character information. Users are right to ignore it, and a caveat users are right to
ignore is worse than none — it trains them to skip the place a real warning will later appear.
A signal with zero variance is not a signal.
**What makes it safe.** Baseline is **computed** from the rendered list, never authored, so the
moment a second tier value exists chips reappear automatically on the minority. No majority →
every card shows its chip (fails toward verbosity, never toward a hidden caveat). The
result-view caveat above the damage number is **untouched**; the detail view always shows the
full sentence unconditionally, and that is what licenses the omissions elsewhere.
**Explicitly NOT extended** to §11's disagreement chip (§11.4a): §7.3's premise is zero
variance, and a claim-vs-derived disagreement is by construction high-variance.

### D-046-3 · URL state is information architecture, not later polish
**Decision.** Team (by **character id**, never index), filters, search and view live in the URL.
**Why.** Sharing a build is a theorycrafting tool's core social function.
**Contract that matters.** Results are **not** in the URL — only inputs. A link is a
reproduction instruction; the recipient's numbers must come from the engine, or a stale link
becomes an undetectable source of wrong damage figures. Unknown ids are a named, recoverable
error, never a silent drop — silently dropping a member produces a link that simulates a
different team than the sender ran.
**Open (P1, routed to product).** Per-character build state (level, constellation, talents,
~9 stat fields × 4) does not fit a readable querystring. Recommended: team identity in the URL
now, encoded `build` param once the build model stops changing shape. Encoding a schema that is
still moving guarantees broken links.

### D-046-4 (D1) · Radius conceded to 4 steps, and made ENFORCEABLE
**Decision.** `sm` / `md` / `xl` / `full`. `xl` added for dialog panels and sheets.
**Why the concession.** The scale said "no other radii" while `tailwind.config.ts:77` declared
`borderRadius` under `theme.extend` — which *adds* `sm`/`md` without removing `lg`/`2xl`/`3xl`.
The prohibition was never enforceable, and `rounded-xl` was already live at `Dialog.tsx:118`.
**Why it is still closed.** `borderRadius` moves from `theme.extend.borderRadius` to
`theme.borderRadius` — a replacement. After that, `rounded-lg` fails to compile a class and the
rule enforces itself instead of relying on diligence.

### D-046-5 (D2) · Shadows: partial concession
**Accepted.** `shadow-sm` on `CARD` (reads as a crisp edge, not elevation).
**Rejected.** Decorative hover-lift (`hover:shadow-lg` / `hover:-translate-y-*`) — hover
feedback is a colour change, and 132 cards rising on hover is the AI-dashboard tell. Coloured
glows — verified live in **four** places beyond `page.tsx`: `TeamSlot.tsx:145` and
`InsightsPanel.tsx:15,21,27`. The InsightsPanel case is the worst: it glows a semantic *state*
dot, re-encoding information the token and label already carry, using an arbitrary rgba that is
not the token's own value.

### D-046-6 · `h-24` is DORMANT, and the dependency is inverted
**Ruling.** Not a violation. No virtualization library is installed; `estimateSize` and `h-24`
appear nowhere in `src/`; the card is content-sized.
**Inversion.** Content at final zh-CN copy is the fixed **input**; the height constant is
**derived** by measuring the real card at 200% zoom, then frozen. `h-24`/`h-28` are estimates
pending measurement, not values. Do not add the constant preemptively — an unused constant
nothing measures is exactly how the English-mock number would get frozen in.

### D-046-7 · The dialog contract (§13) — and a correction to an earlier audit
**One scroll container per dialog.** `CharacterStatsModal.tsx:175` puts `overflow-y-auto` on a
panel `Dialog.tsx:117` already sets to `overflow-hidden` — two conflicting declarations on one
element, resolved by emitted rule order rather than by intent. Plus `max-h-[46vh]` (:469) and
`max-h-[50vh]` (:532) nested inside the dialog body's own scroller: up to three stacked
scrollers, `vh`-measured against the viewport rather than the dialog.
**Body scroll lock: absent everywhere.** Zero matches for `document.body.style`,
`useScrollLock`, `preventScroll` across `src/`. **The earlier audit credited
`overscroll-behavior: contain` with this and that credit was wrong** — `overscroll-behavior`
prevents scroll *chaining* out of a scroller that has hit its end. It does nothing for a
pointer over the scrim, keyboard scroll, scrollbar drag, or a gesture that never entered the
dialog's scroller.
**Closed 3-name size scale** (`sheet`/`panel`/`browser`), replacing three ad-hoc idioms and
`Dialog.tsx:119`'s `!className?.includes("max-w-")` string sniff — a sniff on a caller's class
list is not a contract.

### D-046-8 · Guidelines vs DESIGN-SYSTEM — two disagreements, both recommended AGAINST
- **Native `<dialog>` / popover API.** Guidelines prefer it. Recommendation: **not now.** The
  custom implementation is already correct on trap and focus-restore, a bottom-sheet variant
  makes `::backdrop` awkward, and migration touches all four surfaces mid-task. Revisit if
  `inert` turns out to need `showModal()`. Logged **open**, not closed.
- **`scrollbar-gutter: stable`.** Cleaner than padding compensation, but must be reserved
  ahead of time — shifting layout permanently for every user including those who never open a
  dialog. Recommendation: padding compensation, which costs one computed value at open time.

### D-046-9 · The character detail view's distinctive value is the honesty layer
**Decision.** Fourth tab, `模拟覆盖`. Talents tab promoted above constellations (talents are
tuned continuously; constellation is a mostly-fixed account fact).
**Why a tab and not scattered chips.** A wiki answers "what does this character do" better than
this product ever will. Only the simulator can answer "how much of that is actually modelled",
and the project's stated failure mode is plausible-but-wrong output. Design the honesty layer
as the primary feature, not as a disclaimer bolted to a wiki page.
**The copy fix that matters most.** `CharacterStatsModal.tsx:517` says the constellation *text*
is missing. In fact `constellations: []` for all 139 generated characters means there is no
effect for the engine to apply — setting C6 changes the simulation by nothing. A user either
concludes the tool is broken, or trusts a "C6" result that is really a C0 result.
**Spec'd without assuming the parallel data drop.** `effects` presence and `descriptionZh`
presence are independent; the component branches on both, over a four-row truth table. Today's
`kitDetails && kitDetails.constellations.length > 0` (:468) collapses all four into two, and is
true for exactly 4 of 139 characters (raiden, bennett, xiangling, xingqiu — the hand-authored
`raidenNationalKit`).

### D-046-10 · UNVERIFIED is currently unimplementable — raised, not designed around
DESIGN-SYSTEM mandates an inline `◇ 未核验` marker on the specific value. The provenance data
**exists** (cast times are engine defaults for 16 anemo characters alone) but is emitted as `//`
comment lines at `generated/anemo.ts:5332+`, unreachable from TypeScript. Requested shape:
`unverified?: { field, reason }[]`, keyed by field so the UI can place the chip on the right
value. A free-text blob would force the UI to parse prose — the exact inference DESIGN-SYSTEM
forbids. Routed to the Manager; not a frontend fix and not a design decision I can make alone.
