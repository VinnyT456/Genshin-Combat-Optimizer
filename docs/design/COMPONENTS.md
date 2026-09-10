# COMPONENTS.md

Owner: `uiux-engineer`. Planned core UI components. **`Planned` ≠ `Implemented`.**
`frontend-engineer` implements from the spec here; update status as work lands.

| Component | Purpose | Status | Notes |
|---|---|---|---|
| TeamBuilder | Select + arrange up to 4 characters | **Specced — ready to build** | Spec §1. Flow 1 |
| TeamSlot | One of 4 slots: filled / empty / active | **Specced — ready to build** | Spec §1.3, child of TeamBuilder |
| CharacterPicker | Modal/sheet list of selectable characters | **Specced — ready to build** | Spec §1.4 |
| CharacterSelector | Pick a character, show element/stats | Superseded | replaced by TeamSlot + CharacterPicker |
| EnergyMeter | Per-character energy bar + numeric readout | **Specced — ready to build** | Spec §2.3 |
| EnergyPanel | All 4 characters' energy, time-scrubbed | **Specced — ready to build** | Spec §2 |
| BurstAvailability | `Energy 48/60 · Burst unavailable` affordance | **Specced — ready to build** | Spec §2.4 |
| EnemyConfigurator | Set enemy level + resistances | Planned | Flow 2, not this task |
| SimulationControls | Duration, initial state, run button | Partial | single SIMULATE button in Phase 1 |
| OptimizerControls | Constraints, objective, beam width, optimize | Planned | Flow 3, Phase 4 |
| RotationTimeline | Per-character lanes, events, click-to-detail | **Specced — ready to build** | Spec §3. Replaces single-lane `src/features/timeline` |
| TimelineLane | One character's row on the shared axis | **Specced — ready to build** | Spec §3.4 |
| SwapMarker | Swap as a *time-consuming* span between lanes | **Specced — ready to build** | Spec §3.5 |
| EventDetailPanel | Selected event's damage/energy/context | **Specced — ready to build** | Spec §3.7 |
| DamageBreakdown | Damage by ability/character/element | Implemented | `src/features/damage-breakdown` |
| RotationComparison | Best vs alternative, explain diff | Planned | Flow 5, Phase 4 |
| ResultSummary | Tier-1 headline stats | Partial | inline stat cards in Phase 1 page |

## Boundary reminder
Components **consume** `simulateRotation()` / `optimizeRotation()` via thin adapters.
No damage/reaction/optimizer/energy math inside components. Where a spec below says
"display X", X must arrive from the engine — see §0.

---

# §0 — Data required from the simulation contract

`combat-engineer` is freezing the API concurrently. These are the fields these three
features need. Names are *conceptual*; Manager reconciles against the frozen contract.
Where a field does not exist today it is marked **NEW**.

## 0.1 Already available (Phase 1, confirmed in `src/types/index.ts`)
- `CharacterDefinition`: `id, name, element, level, maxEnergy, baseStats{atk,critRate,critDmg,energyRecharge,…}`,
  and the four `AbilityDefinition`s with `name, element, castTime, cooldown, energyCost, energyGenerated`.
- `SimulationResult`: `totalDamage, dps, duration, damageByCharacter, damageByAbility, damageByElement, timeline, errors, warnings`.
- `CombatEvent`: `timestamp, type ("damage"|"swap"|"energy"|"info"), characterId, description, damage?, energy?`.
- `DamageInstance`: `finalDamage, nonCritDamage, critDamage, element, abilityName, damageType, rawDamage`.

## 0.2 NEW — required for Phase 2 UI

| # | Need | Why | Used by |
|---|---|---|---|
| N1 | **Per-character energy over time.** Either (a) every `CombatEvent` carries `energyByCharacter: Record<string, number>` (snapshot after the event), or (b) `energy` events are emitted for *every* character whose energy changed, including off-field gain. (a) is strongly preferred: it lets the UI scrub to any timestamp with no client-side accumulation. | Energy is party-scaled with particles + ER; off-field characters gain energy with no event of their own. Today `CombatEvent.energy` is a single scalar for the acting character only — insufficient. | EnergyPanel, EnergyMeter, TimelineLane |
| N2 | **Post-run per-character state** on `SimulationResult`, e.g. `finalState: Record<characterId, { currentEnergy: number; maxEnergy: number; cooldowns: Record<abilityId, number> }>`. | Tier-1/2 end-of-rotation readout ("Ember ended at 42/60"). | EnergyPanel, ResultSummary |
| N3 | **Explicit swap duration on the swap event**, e.g. `CombatEvent.duration` (seconds) on `type:"swap"`, plus `fromCharacterId`. Today swap costs a hardcoded 0.5 s inside the engine and the event records only the destination. | The timeline must render the swap as a *span* with real width and name both ends. Manager's decision: swap cost is configurable, default 0.6 s. | SwapMarker, RotationTimeline |
| N4 | **Configurable swap cost surfaced on `SimulationConfig`**, e.g. `swapTime?: number` (default 0.6), and echoed back on the result so the UI can label "Swap 0.6 s (default)" vs a user override. | "Swap cost must read as time, not a free transition" — the number must be visible and attributable. | SimulationControls, SwapMarker |
| N5 | **Action duration on damage events**, e.g. `CombatEvent.duration` = the ability's `castTime`. Derivable today from `definition[ability].castTime`, but only if the event exposes `abilityId` (it does, via `damage.abilityId`) — for non-damage actions there is no path. | Lanes render actions as spans, not points; a 1.5 s burst must look longer than a 0.5 s normal. | TimelineLane |
| N6 | **Machine-readable warnings/errors.** Today `warnings: string[]`. Needed: `{ code, message, actionIndex?, characterId?, timestamp? }[]`. | To attach "skipped — on cooldown" to the *right lane at the right time* rather than dumping prose at the bottom of the page. Prose strings can ship as `message`; the UI needs the `characterId` to place it. | RotationTimeline, TeamSlot |
| N7 | **Burst availability inputs at a timestamp** — `currentEnergy` (from N1) and `cooldowns[burstId]` (from N2/N1). If the engine can expose `availableAt` per ability per character over time, the UI prefers that; otherwise the UI derives display-only from energy + cooldown map. **This is a display derivation, not game math** — confirm with Manager that deriving `energy >= energyCost && clock >= availableAt` in a UI adapter is acceptable, or ask the engine to expose a boolean. | The "surface constraints before the click" principle. | BurstAvailability |
| N8 | **Party size / energy model metadata** echoed on the result, e.g. `config.partySize` and a flag that particle+ER energy is active. | The energy readout must be able to say *why* the number is what it is; and the UI must not silently imply a model the engine is not running. | EnergyPanel footnote |

If N1 lands as (b) rather than (a), the UI must accumulate per-character energy by
replaying `energy` events — acceptable but strictly worse (fragile, and any missed event
silently desyncs the display). **Preference stated: (a).**

Fields the UI does **not** need and should not receive: intermediate damage terms beyond
what `DamageInstance` already has, buff internals (Phase 3), optimizer state (Phase 4).

---

# §1 — TeamBuilder (4-character team)

## 1.1 Purpose
Let the user assemble and arrange up to 4 characters, see each one's build at a glance,
and understand which character is "active" (on-field). The team is the first Tier-1 fact
on the page; it must be legible before anything is simulated.

## 1.2 Data in
```
characters: CharacterDefinition[]      // full roster, from game-data
team: (CharacterDefinition | null)[]   // length 4, holes allowed
activeCharacterId: string | null       // on-field character
onSelect(slotIndex, characterId | null)
onReorder(fromIndex, toIndex)
onSetActive(characterId)
result?: SimulationResult              // optional; enriches slots after a run
```
No engine calls inside the component.

## 1.3 Layout / IA

Four slots in a single row on desktop (`grid grid-cols-4 gap-4`), 2×2 on tablet,
vertical list on mobile. Slots are **positional** — slot 1..4 is the party order, and the
order is meaningful to the rotation, so it is always shown as a number.

Filled slot (`TeamSlot`), card `rounded-md border border-surface-border bg-surface-raised p-4`:

```
┌──────────────────────────────────────┐
│ 1  ● PYRO                    [Active]│   row A: slot no. · element chip · active badge
│ Ember (Test Pyro)                    │   row B: name, body-strong, truncate
│ Lv 90 · ATK 1,800                    │   row C: label, mono numbers
│ CR 60% / CD 140% · ER 120%           │   row D: label, mono numbers
│ ◇ Energy  48 / 60  ▓▓▓▓▓▓▓░░░        │   row E: EnergyMeter (only after a run)
│ [Change]                    [Remove] │   row F: actions
└──────────────────────────────────────┘
```

- Slot number: `micro`, `text-slate-400`, always present. It is the tab-order anchor.
  (Text, so 4.5:1 — `slate-500` fails. See DESIGN-SYSTEM text-vs-mark.)
- Element chip: dot in `element.<el>` + the element **name in text** (`PYRO`, `micro`,
  uppercase, colored). Never the dot alone.
- Active badge: `state.success` bg/fg chip reading `Active`, plus `aria-current="true"`
  on the slot. Only one slot may carry it.
- Rows C/D are `font-mono tabular-nums`, `label` size. These are Tier-2 detail kept
  visible because a 4-character team's builds are the primary thing being compared.
- Row E appears only when a `SimulationResult` is present; see §2.
- Row F: `Change` is a `<button>` opening the CharacterPicker; `Remove` is a `<button>`
  with `aria-label="Remove Ember (Test Pyro) from slot 1"`.

Empty slot:
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ 2                                    │
│            + Add Character           │
│      Slot 2 of 4 · optional          │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```
Dashed 1px `surface.border`, same height as a filled slot (no layout shift when filled).
The whole slot is one `<button>`, `aria-label="Add character to slot 2"`.

### Active / on-field concept
- Exactly one team member is active at a time. Before a simulation, the active character
  is the one the rotation starts on — default slot 1.
- Setting active is a **click on the character's name row** plus an explicit control; the
  primary affordance is a small `Set Active` button revealed on hover **and always present
  in the DOM** (never hover-only — hover-only controls fail touch and keyboard).
  Implementation: the button is rendered always, visually `opacity-0 focus-visible:opacity-100
  group-hover:opacity-100` is **not acceptable**; use `text-slate-400 hover:text-slate-200`
  so it is always visible but quiet. (`slate-500` is button text here and fails the 4.5:1
  text floor — the "quiet" variant is `slate-400`.)
- During/after a run, "active" is derived from the timeline (swap events), and the badge
  moves as the user scrubs the timeline. In that mode the slot badge reads `On field`, the
  manual `Set Active` control is **replaced** (not merely hidden) by a quiet, always-visible
  `text-micro text-slate-400` label reading `Follows timeline` on the on-field slot.
  The full sentence `Active character follows the timeline while a result is loaded.` is
  carried in that label's `title` **and** rendered as visible `text-slate-400` micro text
  **once beneath the slot grid** — one instance per team, never repeated in all four slots.

  > **Corrected 2026-09-02.** An earlier revision of this spec said the control "is not shown —
  > a `title`/help text explains…". That instruction contradicted DESIGN-SYSTEM's
  > *tooltips are never the sole information source* rule: a `title` attached to nothing is
  > unreachable by keyboard and invisible on touch, so the explanation would not exist for
  > those users. Where a component-level instruction conflicts with a DESIGN-SYSTEM rule, the
  > **DESIGN-SYSTEM rule wins** and this spec is the thing that gets fixed.

### Reordering
Party order changes via **arrow buttons** (`Move left` / `Move right`, icon-only, with
`aria-label`), not drag-only. Drag-and-drop may be added as an enhancement but the
button path is mandatory (gesture-only actions need a keyboard alternative). Announced via
`aria-live="polite"` (`Ember moved to slot 2`).

**Keyboard.** `Alt+←` / `Alt+→` (and `Alt+↑` / `Alt+↓`, which mean the same thing on the
mobile vertical layout) reorder the slot **while focus is anywhere within that slot** — on
its `Change`, `Set Active`, arrow, or remove control. The slot container itself is
deliberately **not** a tab stop: four extra stops would cost more than the shortcut saves,
given a filled slot already carries up to five controls and the page has no other way to
skip them. The arrow buttons remain the discoverable path; `Alt+Arrow` is an accelerator for
users already inside the slot, never the only way to reorder.

**Holes.** Reordering uses splice semantics over all four positional slots, empty ones
included: removing the slot from its old index and inserting it at the new index shifts any
intervening hole rather than blocking on it. Moving a character into an empty slot is
therefore legal and is a normal move, not a special case — a 3-character party occupying
slots 1, 2 and 4 is a legitimate arrangement.
- Move buttons are enabled at **any non-edge slot**, regardless of whether the neighbouring
  slot is filled. Only slot 1 disables `Move left` and only slot 4 disables `Move right`,
  where the visible reason is self-evident from the slot number.
- Rationale: disabling a move because the adjacent slot is empty would produce a disabled
  control whose only possible reason string is "the slot next to you is empty", which is not
  a reason a user would accept — and DESIGN-SYSTEM requires every disabled control to carry
  a reason a user *would* accept.
- Empty slots are never themselves reordered; they have no move controls.

### Duplicate handling in the team model
The picker is the specced guard: a character already on the team renders `disabled` with
`Already in slot N`, so the ordinary path cannot create a duplicate (§1.4, §1.5).
For any other entry point, placing a character who already occupies another slot **swaps the
two slots** rather than rejecting the input. Since slot position is meaningful party order, a
"change slot 3 to the character in slot 1" is a *reorder*, and a reorder is never an error —
rejecting it would make a legitimate intent a dead click.
- A swap mutates **two** slots, so its announcement must name both:
  `Ember moved to slot 3, Frost moved to slot 1.` A single-slot "added" announcement under-
  reports the change and leaves the displaced character unnamed.
- A plain placement into an empty slot keeps the simple form: `Ember added to slot 3.`

## 1.4 CharacterPicker
Opens as a dialog on desktop/tablet, a bottom sheet on mobile.
- Role `dialog`, `aria-modal="true"`, labelled by its heading `Add Character to Slot 2`.
- Focus moves to the search input on open; `Esc` closes; focus returns to the invoking slot.
- Focus is trapped inside; `overscroll-behavior: contain` on the sheet.
- Search input has a real `<label>` (visually hidden is fine), `type="search"`,
  `spellCheck={false}`, placeholder `Search characters…` (ellipsis character).
- Already-teamed characters are **not hidden** — they are shown `disabled` with the reason
  `Already in slot 1`.

> **SUPERSEDED by §4 (Character System Phase A).** The dialog *shell* specced here (role,
> focus, `Esc`, return focus, sheet behaviour) still stands and is unchanged. Its **body** is
> now `CharacterBrowser` (§4). Two clauses of the original §1.4 are formally retracted rather
> than left to rot, because both are now wrong:
>
> | Retracted | Replaced by |
> |---|---|
> | "Each roster row: name, element, level…" — a **row**, and showing **level** | §4.3: a fixed-height **card**, and level is configuration, not identity, so it is excluded |
> | "Roster > 50 entries: virtualize. Under 50: plain list." — threshold 50, two code paths | §4.9: threshold **60 rendered cards**, one code path that flips on a constant |
>
> The 50 was specced against a 4-entry roster as a guess; §4.9's 60 is the operative number.
> Only §4.9 may be cited for virtualization.

## 1.5 States

| State | Behavior |
|---|---|
| empty (0 selected) | 4 empty slots. Primary `Simulate` button is `disabled` with adjacent reason `Add at least 1 character to simulate.` |
| partial (1–3) | Valid. No warning — a 1–3 character team is a legitimate simulation. Remaining slots stay as empty affordances. Footnote: `Party-size energy scaling assumes N characters.` (uses N8) |
| full (4) | All slots filled; CharacterPicker's `Add` affordances are gone; `Change` remains. |
| loading roster | 4 skeleton slots at final height, `aria-busy="true"`. |
| error | If game-data fails to load: `state.error` panel, `Character data failed to load. Reload the page to try again.` — error copy always includes the next step. |
| duplicate attempt | Prevented at the picker (disabled row with reason). No post-hoc error. |

### Result invalidation on team edit (DECIDED)

Any mutation of the team — add, remove, change, reorder, swap — **discards the current
`SimulationResult`**. A retained result would keep asserting `damageByCharacter` shares, an
`On field` badge, and an energy readout for a party that no longer exists, and §1.5's
"success (post-run)" state binds slot enrichment to the *current* team. A stale result is a
false claim about the thing on screen.

Discarding is correct. Discarding **silently** is not: clearing the result removes the
Result, Energy, Timeline and Damage Breakdown sections in one render, so roughly half the
page vanishes with no explanation and reads as a crash rather than as a consequence.

Required behavior when a non-null result is discarded:
- Announce once through the team's existing `aria-live="polite"` region:
  `Team changed. Previous simulation result cleared.`
- Render a persistent `state.info` line **in the position the Result section occupied**, so
  the space is explained rather than left as a gap:
  `Team changed — run the simulation again to see results for this team.`
  The copy names the cause and the next step, per the error-copy rule (every message carries
  the remedy).
- The notice clears when the next run completes.
- The `Simulate` affordance returns to its ordinary enabled state; the returning `Set Active`
  control is the correct consequence of leaving timeline-derived mode, not a regression.

A code comment explaining the clear is not sufficient — the explanation is owed to the user,
not to the next reader of the source.

| invalid config | If the rotation references a character no longer in the team, the offending slot area shows a `state.warning` inline note with the count: `2 rotation actions reference a removed character.` |
| success (post-run) | Slots gain the energy row and a per-character damage share (`31.4% of total`, from `damageByCharacter`). |
| team edited while a result exists | The result is **discarded** — see the invalidation rule below — and the discard is announced and explained, never silent. |

## 1.6 Responsive
- Desktop ≥1024: 4 across.
- Tablet 640–1023: 2×2.
- Mobile <640: single column, full-width slots; stat rows C/D collapse into one wrapped
  line; picker is a bottom sheet; reorder arrows become `Move up`/`Move down`.

## 1.7 A11y
- The four slots are a `<ul>`/`<li>` list (`aria-label="Team, 4 slots"`), not bare divs.
- Slot heading level: page `h1` → section `h2 Team` → slot name `h3`.
- Icon-only reorder/remove buttons: `aria-label` with slot + character name.
- Active state uses `aria-current="true"`, not just the colored badge.
- All slot mutations announce via a single `aria-live="polite"` region.
- Element color is never the only signal — the element name is always in text.

---

# §2 — Per-character energy display

## 2.1 Purpose
Make energy a first-class, always-legible per-character readout, and make
"why is this burst unavailable" answerable **without clicking anything**.
Phase 2 model: particles, party-size-scaled, energy recharge applied — energy is dynamic,
differs per character, and **off-field characters still gain energy**. The display must
make that visible, otherwise off-field gain looks like a bug.

## 2.2 Data in
```
team: CharacterDefinition[]                   // maxEnergy, burst energyCost, burst cooldown
energyAt(t): Record<characterId, number>      // from N1
finalState: Record<characterId, {currentEnergy, maxEnergy, cooldowns}>  // from N2
scrubTime: number | null                      // null = end of rotation
partySize: number                             // from N8
```

## 2.3 EnergyMeter (per character)

One line, three parts, in this order:

```
◇ Energy   48 / 60   ▓▓▓▓▓▓▓▓░░░░   80%
```
- Glyph `◇` is `aria-hidden`; the word `Energy` carries meaning.
- `48 / 60` is `font-mono tabular-nums`, `body` size — **this is the number people read**,
  the bar is secondary.
- Bar: `h-1.5 rounded-sm bg-surface-border` track; fill `state.info` while below cost,
  `state.success` at/above burst cost. **The fill color change is redundant** with the
  availability chip in §2.4 — never the only signal.
- A 1px tick mark at the burst-cost fraction, `bg-slate-400`, with the cost visible in the
  availability chip. The tick is the "you need this much" line.
- Full energy (`>= maxEnergy`): bar fully `state.success`, numeric reads `60 / 60`, and the
  chip reads `Burst ready`.
- `role="meter"` with `aria-valuenow/min/max` and
  `aria-label="Ember energy, 48 of 60, burst requires 30"`.

Precision: one decimal only when the fractional part is non-zero and the value is below the
burst cost (`29.4 / 60` matters; `48.0 / 60` does not). Otherwise round. Use `Intl.NumberFormat`,
not hand-rolled formatting.

### Slot-height contract (DECIDED — gates row E)

Adding the energy row to `TeamSlot` makes filled slots taller. Empty and skeleton slots must
grow with them, or the layout shift that §1.3's "same height as a filled slot" rule exists to
prevent comes back the moment §2 lands.

**Height is content-derived, never hand-measured.**

- The slot grid stretches its rows (CSS grid default `align-items: stretch`; state it
  explicitly as `items-stretch` so a later change cannot silently remove it). Each slot is
  `h-full`. The tallest filled slot in a row therefore sets the height, and empty/skeleton
  slots match **automatically** — including after row E, §3, or any future row is added.
- `SLOT_MIN_HEIGHT` is **demoted to a floor for the all-empty case only**. When zero slots are
  filled there is no filled slot to measure against, and four collapsed dashed rectangles read
  as broken. That is its sole remaining purpose and the constant must carry a comment saying so.
- Re-measuring `SLOT_MIN_HEIGHT` against filled-slot content is **forbidden**. If a future
  change makes empty slots look short again, the bug is a missing `items-stretch`/`h-full`,
  not a stale pixel value. Off-scale arbitrary heights (`min-h-[9.5rem]`) are tolerated **only**
  in this one floor constant, and nowhere else in the product.
- Skeleton slots follow the same rule: `h-full` plus the floor, so the loading state does not
  jump when the roster resolves.

#### Derived geometry (extends to §3 lane heights)

The rule above says height is content-derived. **§3's lane stack is the documented exception**,
and the exception needs its own guard rail.

The swap marker must span vertically from the outgoing lane to the incoming one — one
absolutely positioned element bridging two rows across a gap. No pure-CSS construct expresses
that without knowing the row pitch, so `LANE_HEIGHT_PX` / `LANE_GAP_PX` / `LANE_HEADER_WIDTH_PX`
are legitimately necessary, not a shortcut. Where geometry must be known in JS:

- The px value and its Tailwind class are **one declaration, not two that must agree.** Derive
  the class from the constant (e.g. `h-[${LANE_HEIGHT_PX}px]`) or the constant from a single
  exported source consumed by both. A `// w-28 = 112px` comment is documentation, not
  enforcement: changing `h-10` to `h-12` while `LANE_HEIGHT_PX` stays 40 misaligns every swap
  marker, and that failure typechecks, lints and passes tests silently.
- Such constants are **exported from the module that owns the geometry** and imported by every
  consumer. Never re-declared per file.
- This exception is limited to elements that must bridge or overlay a layout box. Ordinary
  sizing stays content-derived; if a new px constant is proposed, first prove CSS cannot do it.
- Same lineage as `SLOT_MIN_HEIGHT`: an off-scale hard value is tolerated only where the layout
  system genuinely cannot express the requirement, and only with a single source of truth.

## 2.4 BurstAvailability chip — "surface constraints before the click"

Rendered adjacent to the meter and, critically, **next to any control that would cast a burst**.
Exactly one of these, always with text:

| Condition | Chip | Token |
|---|---|---|
| energy ≥ cost, off cooldown | `✓ Burst ready` | `state.success` |
| energy < cost | `⚠ Burst unavailable · needs 12 more energy` | `state.warning` |
| on cooldown | `⚠ Burst unavailable · cooldown 4.2 s` | `state.warning` |
| both | show the **later-resolving** one, and append `+ 12 energy` — full string: `⚠ Burst unavailable · cooldown 4.2 s · +12 energy` | `state.warning` |
| character has no burst / not in team | chip omitted entirely | — |

The canonical inline form required by UX-FLOWS is preserved verbatim in the slot header:
`Energy 48/60 · Burst unavailable`. The chip above is the expanded form.
Glyphs `✓ ⚠` are `aria-hidden`; text carries the state. Never render a disabled burst
control without this chip visible in the same view.

## 2.5 EnergyPanel (all four)

A dense 4-row block, one row per character, sharing a column grid so bars align:

```
ENERGY                                       at 6.40 s  [◀ scrub ▶]  [End of rotation]
─────────────────────────────────────────────────────────────────────────────────────
● Ember      48 / 60  ▓▓▓▓▓▓▓▓░░  ✓ Burst ready
● Frost      22 / 80  ▓▓▓░░░░░░░  ⚠ Burst unavailable · needs 58 more energy
● Volt       80 / 80  ▓▓▓▓▓▓▓▓▓▓  ⚠ Burst unavailable · cooldown 3.1 s
  ─ empty slot 4 ─
Particle energy · party of 3 · ER applied. Off-field characters gain energy.
```
- Header states the timestamp the readout reflects. **This is mandatory** — an energy
  number with no time attached is meaningless in a dynamic model.
- Scrubbing is bound to the timeline selection: selecting a timeline event sets `scrubTime`.
  An `End of rotation` button resets to `finalState`.

  **Single selection model (contract — do not duplicate).** `scrubTime` is **derived from the
  existing `selectedEventIndex`**, never stored as a second piece of state:

  ```
  scrubTime = selectedEventIndex === null
    ? null                                        // null = end of rotation → finalState
    : result.timeline[selectedEventIndex].timestamp
  ```

  Computed at the point of use. `End of rotation` is `setSelectedEventIndex(null)`. One
  selection, three consumers — timeline, EventDetailPanel, EnergyPanel (UX-FLOWS). Two
  independent states would let the energy panel report 6.40 s while the detail panel beside it
  reports 4.10 s: a tool contradicting itself in two adjacent panels, and a drift that would be
  filed as a review finding later. Clearing selection on simulate/team-change already applies. Keyboard: `←`/`→` step event-to-event
  when the panel or timeline has focus. The `◀ ▶` scrub controls are real `<button>`s with
  `aria-label` (§2.8) — the arrow-key path is an accelerator layered on them, never the only
  way to scrub, since a keyboard shortcut with no visible control is undiscoverable.
- The footnote (from N8) names the model so users do not attribute off-field gain to a bug.
  If the engine reports a different model, the footnote must reflect what actually ran —
  the UI never asserts a model it cannot read from the result.
- Character rows are `<tr>` in a real `<table>` with `<th scope="row">` names and a caption
  (`Per-character energy at 6.40 seconds`). Tabular data gets a table.

## 2.6 States

| State | Behavior |
|---|---|
| no result yet | Panel renders with `— / 60` placeholders and the copy `Run a simulation to see energy over time.` Bars are empty tracks, not zero-fills (a 0-fill implies "0 energy", which is a claim). |
| loading | Skeleton rows at final height, `aria-busy="true"`. |
| running | Panel dimmed `opacity-60`, header reads `Simulating…`, previous values retained but visibly stale. |
| success | Values populate; `aria-live="polite"` announces `Simulation complete. 4 characters, energy updated.` |
| error | Row shows `—` and a `state.error` note `Energy unavailable for this character.` The rest of the panel still renders. |
| unsupported | If N1/N8 are absent from the frozen contract, the panel renders `finalState` only, header reads `at end of rotation`, and the scrub control is **not rendered** (not rendered disabled — an unavailable capability should not be advertised). Footnote: `Energy over time not available in this build.` |
| empty team | Panel not rendered at all; TeamBuilder's empty state covers it. |

## 2.7 Responsive
- Desktop/tablet: the 4-row aligned grid above.
- Mobile: energy moves **into each TeamSlot card** (row E) and the standalone panel
  collapses to a single summary line `Energy · 3 of 4 bursts unavailable` that expands to
  the full rows. Bars stay full-width; the availability chip wraps under the numbers rather
  than truncating — the reason text must never be truncated.

## 2.8 A11y
- `role="meter"` per bar with a full `aria-label`; the numeric text is also present visually.
- Energy state never color-only — every bar is paired with `x / y` text and a chip.
- Scrub controls are `<button>`s with `aria-label` (`Previous event`, `Next event`).
- Timestamp change announced once, debounced, via `aria-live="polite"` — not on every
  keystroke of a scrub hold.
- `state.info` (#7dd3fc) on `#161a26` is 11.2:1 — safe at `micro` size.

---

# §3 — Multi-lane RotationTimeline

## 3.1 Purpose
Replace the Phase 1 single-lane track with **one lane per character on a shared time axis**,
so the user can read who acted when, how long each action took, and — critically — that
swapping costs real time. This is the analytical core of the product.

## 3.2 Data in
```
timeline: CombatEvent[]        // with N3 (swap duration + fromCharacterId) and N5 (action duration)
duration: number
team: CharacterDefinition[]    // lane order = party order
warnings: StructuredWarning[]  // N6, for in-lane skip markers
swapTime: number               // N4, for the legend
selectedIndex / onSelect
```

## 3.3 Layout

```
                0s        2s        4s        6s        8s       10s
        ┌────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
 1 Ember│ ███E   │███ ███  │ ▓▓▓▓Q   │         │         │         │
 2 Frost│        │         │      ▨▨ │ ███E    │  ███    │         │
 3 Volt │        │         │         │      ▨▨ │   ███ E │         │
 4  —   │        │         │         │         │         │         │
        └────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
         ▨▨ = swap (0.6 s)   E skill  Q burst   ███ action span
```

- **Lane header column**, fixed width `w-28` (desktop), `position: sticky; left: 0`, with
  slot number, element dot **+ character name**, so lanes stay identified while the track
  scrolls horizontally.
- **Shared x-axis** across all lanes, rendered once at the top and repeated at the bottom
  for tall stacks. Ticks at sensible whole-second intervals (1 s if duration ≤ 15 s, else
  2 s / 5 s), labeled `micro`, `text-slate-400`, with `s` unit on the first and last tick only.
  (Axis **labels** are text and take the 4.5:1 floor. Only the axis **rules/gridlines** may use
  `slate-500` — see the text-vs-mark table in DESIGN-SYSTEM.)
- Lane height `h-10`, `gap-1` between lanes, alternating lane background
  (`bg-surface-raised` / `bg-surface-raised/60`) so a 4-lane stack is scannable. This is a
  zebra rule, not decoration.
- Empty slots render as a **dimmed lane with a `—` header**, not omitted — a 3-character
  team should still show four positional rows so lane identity is stable across edits.
  (If the team is permanently 3, the 4th lane may be omitted; keep it while a slot exists.)
- **Actions are spans, not dots.** Width = `duration / totalDuration` (N5). Minimum rendered
  width 8px so a 0.1 s action stays clickable. Where the width is clamped, the true duration is
  carried by the span's **accessible name** (`…, lasts 0.10 seconds`) and by the detail panel;
  a `title` may be added on top of those but is never the only carrier — it is unreachable by
  keyboard and invisible on touch.
- Span fill: `element.<element>` at 70% opacity with a 1px full-opacity left edge marking the
  start instant. Ability class marked by a letter glyph inside or above the span:
  `N` normal · `C` charged · `E` skill · `Q` burst. **Letter is mandatory** — element color
  alone must not distinguish a skill from a burst, and two pyro characters would otherwise
  be indistinguishable by color.

## 3.4 TimelineLane
One `<li>` per character containing an ordered set of `<button>` spans. The lane itself is
not interactive; only the spans and swap markers are.

## 3.5 SwapMarker — swap must read as *time*

This is the load-bearing detail of §3.

- A swap is rendered as a **hatched span of real width** (`duration` from N3, default 0.6 s)
  — never a zero-width tick, never an instantaneous arrow.
- It occupies the region **between the two lanes involved**, spanning vertically from the
  outgoing character's lane to the incoming character's lane, drawn in `text-slate-400`
  diagonal hatch on `bg-slate-500/20` with 1px `surface.border` edges. The vertical
  connection communicates "control moved from A to B"; the horizontal width communicates
  "and it cost this much time".
- Label: if the span is ≥ 40px wide, render `0.6 s` inline (`micro`, `tabular-nums`).
  Below 40px the duration lives in the span's accessible name and the detail panel, and the
  **always-visible legend below the chart states the swap cost numerically** — so the cost is
  legible without hovering, clicking, or a screen reader. A tooltip may duplicate it, never
  replace it.
- A legend line under the timeline always reads:
  `Swap 0.6 s — swapping costs time and is included in Duration and DPS.`
  with the value from N4 and the word `default` appended when unmodified. Users must not be
  able to read this chart and conclude swaps are free.
- Accessible name: `Swap from Ember to Frost at 4.10 seconds, costs 0.6 seconds`.
- Sum of swap time is surfaced as a Tier-2 stat next to Duration:
  `Duration 12.40 s · 3 swaps · 1.80 s swapping (14.5%)`. This is arithmetic over event
  durations, which is presentation, not game math — but if `combat-engineer` prefers to
  provide `totalSwapTime` on the result, the UI will consume it (add as N3b).

## 3.6 Interaction
- Click or `Enter`/`Space` on a span selects it → EventDetailPanel + EnergyPanel scrub to
  that timestamp.
- Keyboard model: the timeline is a single tab stop with a **roving tabindex** — exactly one
  span carries `tabIndex=0`, all others `-1`. `←`/`→` move between events **within a lane**;
  `↑`/`↓` move between lanes, landing on the nearest event in time; `Home`/`End` jump to
  first/last event overall. This is far better than 40 sequential tab stops.
- **Vertical nav skips lanes that have no events.** `↑`/`↓` continue past an empty lane to the
  next lane that actually holds an event, and stop at the edge of the stack without wrapping.
  Landing on an empty lane would give the user a focus position with nothing to inspect and no
  signposted way out; a 4-slot team running a single-character rotation would otherwise trap
  focus in three consecutive dead lanes. Keyboard navigation reaches **information**, not
  coordinates. No-wrap is deliberate and matches horizontal nav: wrapping a time series would
  silently jump the user across the whole rotation.
- Hover **and keyboard focus** both brighten the span to full opacity and draw the hairline
  vertical time-cursor across all lanes at that timestamp, so cross-lane simultaneity is
  readable without a pointer. `transition-opacity duration-150`; the cursor is suppressed under
  `prefers-reduced-motion` (§3.10) but selection remains indicated by the ring.
  Selection (click/`Enter`) also pins the cursor, so touch users reach it too — no affordance
  in this chart is hover-only.
- Selected span: 2px `amber-400` ring + **`aria-pressed`** on the span `<button>`.

  > **Corrected 2026-09-02.** Earlier revisions specified `aria-selected`. That attribute is
  > only valid on descendants of `listbox` / `grid` / `tablist` / `tree`; on a plain `<button>`
  > it is invalid ARIA and may be ignored outright, so the selected state would have gone
  > unannounced. Declaring `role="grid"` to legalise it would require full grid structure and
  > 2D semantics — a half-implemented grid role promises navigation it does not deliver, which
  > is worse for AT users than correct button semantics. `aria-pressed` is a valid toggle state
  > on a button and carries the same meaning. The **roving tabindex** described below is the
  > part of the "grid-like" wording that was load-bearing, and it stands.
- Skipped-action markers (from N6) render in the owning lane at the attempted timestamp as a
  hollow `state.warning` outline with a `⚠` glyph and label
  `Skipped — Flame Strike on cooldown until 6.00 s`. This puts the Phase 1 bottom-of-page
  warning list where it actually means something. The prose list stays as a fallback summary.

## 3.7 EventDetailPanel
Right-hand panel (desktop), below timeline (tablet), bottom sheet (mobile). Shows:
- Tier 1: character name, ability, timestamp, expected damage.
- Tier 2: element + damage type, cast duration, crit / non-crit values, share of total.
- Tier 3 (collapsed `<details>`): energy before/after for the actor, party energy at that
  instant, cooldown state, raw damage. Collapsed by default — Tier 3 is on demand.
Keeps the existing Phase 1 `dl` structure and copy where it already works.

## 3.8 States

| State | Behavior |
|---|---|
| no result | Timeline not rendered; the Result section shows `Run a simulation to see the rotation timeline.` |
| loading | Lane skeletons at final height with the axis drawn, `aria-busy="true"`. |
| empty timeline (0 events) | Axis + 4 empty lanes + `state.info` note `No actions executed. Check that the rotation references characters in your team.` (error copy carries the fix) |
| all actions skipped | Lanes show only warning markers + a `state.warning` summary `All 5 actions were skipped.` with the first reason. |
| single character | Renders as a single lane; no swap markers; the swap legend is hidden (nothing to explain). |
| error | `state.error` panel with `result.errors`; timeline still renders whatever events exist. |
| very long duration (>60 s) | Axis switches to 5 s ticks; container scrolls horizontally with a visible right-edge fade and a `Scroll for more →` hint; keyboard nav still reaches offscreen events (scroll into view on focus). |
| very dense (>200 events) | Spans below 8px are merged into a `×N` cluster marker per lane per 0.2 s bucket, expandable on click. Do not render 500 sub-pixel buttons. |

### Deferred from §3.8/§3.9 (scoping decided 2026-09-02)

| Item | Status | Rationale |
|---|---|---|
| Hover/focus time-cursor across lanes | **Scope now — §3 completion** | Cross-lane simultaneity is a stated purpose of §3; without it the lanes are four independent strips. Spec is ready (§3.6 already requires focus + selection, not hover alone). |
| Mobile **Lane** mode + ghost marks | **Deferred; scope reduced** | List mode covers mobile fully and is the specced default. Ghost marks are the costliest part for the least value. One excellent mobile mode beats two mediocre ones. Revisit after real mobile use. |
| >200-event cluster merging (`×N` buckets) | **Deferred to Phase 4** | Phase 2 rotations run ~5–20 events. Speculative until the optimizer emits long rotations. |
| List virtualization | **Deferred to Phase 4** | Plain DOM is fine under ~200 rows. Revisit **together with** cluster merging — both are triggered by the same event-count pressure. |

Deferred items stay in the spec as written; they are unbuilt, not unspecced.

## 3.9 Responsive — mobile is a different interaction, not a shrunk chart

Below 640px the 4-lane chart is unreadable. Mobile gets **two modes, toggleable**, default
`List`:

1. **List mode (default).** A chronological, virtualized list of events grouped by
   timestamp. Each row: `4.10 s │ ● Ember │ Inferno Burst Q │ 84,210`. Swaps appear as
   full-width rows reading `⇄ Swap Ember → Frost · 0.6 s` so swap time remains visible as a
   line item that occupies the reading flow. Tapping a row opens the detail bottom sheet.
2. **Lane mode.** One character at a time, chosen by a horizontal tab strip of the 4
   characters; a single lane rendered full-width against the shared axis, with faint
   ghost marks for other characters' events so cross-character timing is not lost.

Tablet 640–1023: the desktop stacked-lane chart in a horizontally scrollable container with
the sticky lane-header column; detail panel moves below.

## 3.10 A11y
- Container `role="group"` with `aria-label="Rotation timeline, 4 character lanes, 12.4 seconds"`,
  and an adjacent visually-hidden text summary listing events in order — the chart is never
  the only way to reach the information.
- Every span is a `<button>` with a full accessible name including character, ability,
  timestamp, and damage. Hover tooltips duplicate, never replace, the detail panel.
- Focus ring visible on spans even when clipped by the scroll container
  (`scroll-margin-inline` + scroll-into-view on focus). Sticky lane headers must not cover
  a focused span.
- Reduced motion: the time cursor and opacity transitions are disabled; selection is still
  clearly indicated by the ring **and by `aria-pressed`** (see §3.6 — never `aria-selected`
  on a plain button).
- Selection state is exposed as `aria-pressed` on every span and swap button. Ring colour is
  never the only indicator of which span is selected.
- Zebra lane striping and element fills both exceed 3:1 against the lane background.

---

---

# §4 — CharacterBrowser (roster at ~100+ scale)

Supersedes §1.4 `CharacterPicker`, which was specced against a 4-entry roster and explicitly
said "under 50: plain list". That list is now the *degenerate* case of this component, not a
separate one — see §4.9. `CharacterPicker` remains the name of the dialog **shell**; its
body becomes `CharacterBrowser`.

## 4.1 Purpose
Let a user find and select one character out of ~100 characters plus 6 Traveler forms, in
under a few seconds, without knowing the roster by heart — and understand, before selecting,
how well the tool actually simulates that character.

## 4.2 Data in
Per roster entry, all from `GenericCharacterDefinition` + a small display-only projection
built in an adapter (`src/features/team-builder/rosterModel.ts`, frontend-owned, pure):

| Field | Source | Used for |
|---|---|---|
| `id`, `name` | definition | identity, search |
| `element` | definition | chip, filter, group |
| `weaponType` | `kit.ts` `WeaponType` | filter, secondary line |
| `rarity` | `kit.ts` `Rarity` (4 \| 5) | filter, sort |
| `supportTier` | **NEW — see §7 / N9** | chip, filter, sort |
| `tierReason` | **NEW — see §7 / N9** | the `partial` sentence |
| `isTravelerForm`, `travelerFormElement` | **NEW — see §5 / N10** | grouping, form switcher |
| slot occupancy | `teamModel.slotOf()` | `Already in slot N` |

The browser derives **no** game math. Role (`dps` / `sub-dps` / `support` / `healer`) is
NOT in the model and is **not invented by the UI** — see §4.4 and Open Question OQ-1.

## 4.3 Layout / IA

Three zones, top to bottom, inside the dialog/sheet body. Zone heights are fixed so the
scrolling zone never resizes as filters change.

```
┌─ CharacterPicker dialog ─────────────────────────────────────┐
│ Add Character to Slot 2                                  [✕] │
├──────────────────────────────────────────────────────────────┤
│ [🔎 Search characters…                                     ] │  A  control bar (sticky)
│ Element ▾   Weapon ▾   Rarity ▾   Support ▾    Sort: A–Z ▾   │
│ ⌫ Pyro ✕   ⌫ 5★ ✕                          Clear all        │  B  active filter chips
├──────────────────────────────────────────────────────────────┤
│ 14 of 106 characters                                         │  C  result count (live)
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│ │ ● PYRO     │ │ ● PYRO     │ │ ● PYRO     │ │ ● PYRO     │ │  D  virtualized grid
│ │ Name       │ │ Name       │ │ Name       │ │ Name       │ │
│ │ 5★ · Sword │ │ 4★ · Bow   │ │ 5★ · Claym │ │ 5★ · Cat.  │ │
│ │ ✓ Full     │ │ ⚠ Special… │ │ ◇ Basic    │ │ ✓ Full     │ │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                            ⋮                                 │
└──────────────────────────────────────────────────────────────┘
```

Zone A — control bar, `sticky top-0 bg-surface-raised`, `border-b border-surface-border`.
Zone B — renders only when ≥1 filter is active; when it renders it pushes zone D, which is
acceptable because it is a direct consequence of the user's own action in zone A.
Zone C — always present, even at `0` and at `106 of 106`. A count that appears and
disappears is a layout jump *and* removes the only confirmation that a filter did anything.

### Card, not row
Cards in a responsive grid, not a vertical list. At 100+ entries a one-per-row list is
~100 screens of scroll; a 4-up grid is ~25 rows. Card size is uniform and fixed
(`h-24`-class fixed height, exact value in §4.10) — uniform size is what makes
virtualization simple and the arrow-key grid model honest.

Card content, top to bottom:
1. Element chip (`ElementTag` — dot + element **name in text**, existing component).
2. Character name, `body-strong`. **Prefer wrapping to two lines over truncating**
   (`line-clamp-2` at the card's fixed height, which §4.10 sizes to fit two lines). Truncation
   is the fallback only if a name exceeds two lines.
   Where truncation does occur, the full name must be reachable by three independent routes,
   because each covers a user the others miss:
   - the card's **accessible name**, never truncated (screen-reader user);
   - `title` (mouse user) — supplementary, never the only route;
   - the **config panel header** (§6.3), which renders the full name as untruncated visible
     text once the character is placed (sighted keyboard user, who gets neither of the above).

   The third route is the one that matters for the "tooltips are never the sole information
   source" rule: a sighted keyboard-only user can hover nothing and hear nothing, so a
   `title`-plus-`aria-label` pair would still leave them unable to read the name.
3. `5★ · Sword`, `label` size, `text-slate-400`. Rarity as `★` glyph plus the numeral; the
   numeral carries the meaning so the glyph is `aria-hidden`.
4. Support-tier chip (`StatusChip`), per DESIGN-SYSTEM "Support tier". `full` renders as a
   quiet `✓ Full` chip and is **not** omitted here — in a browser, absence would read as
   "unknown", not "fine".

Cards do **not** show level, talent levels, or stats. Those are configuration, not identity,
and belong to §6. A browser card answers "is this the character I want", nothing else.

### Grouping
Default sort `A–Z` renders one flat grid, no group headers. Sorting by `Element` inserts
sticky group headers (`section` type style: `text-xs uppercase tracking-wide text-slate-400`)
naming the element, with the element's own colour on the label. Group headers participate in
virtualization as fixed-height rows; they are `<h3>` inside the list's landmark, never bare
divs, and they are **not** focus stops.

## 4.4 Filters, search, sort

**Search** (`type="search"`, real `<label>`, visually hidden). Matches on name, element,
weapon type, and Traveler form label. Substring, case-insensitive, diacritic-insensitive
(`String.prototype.normalize("NFD")` + strip combining marks) — a user typing `noelle`
should match `Noëlle`. Debounce **120 ms** for the render, but the input value itself is
never debounced (the field must never feel laggy). No autocomplete dropdown: the grid *is*
the result set, and a dropdown over a live-filtering grid duplicates the same information in
two places.

**Filters** — four, all multi-select, all applied as AND across facets and OR within a facet:

| Facet | Values | Control |
|---|---|---|
| Element | 7 elements | popover with checkboxes |
| Weapon | 5 `WeaponType` values | popover with checkboxes |
| Rarity | `4★`, `5★` | two toggle buttons inline (only two values — a popover would be more clicks than the choice is worth) |
| Support | `Full`, `Basic`, `Special mechanic missing` | popover with checkboxes |

Each popover trigger shows its own active count (`Element (2) ▾`), so state is legible with
the popover closed. Active filters additionally appear as removable chips in zone B — this
is deliberate redundancy: the chips are the *undo* affordance, the trigger counts are the
*status* affordance, and a user who scrolled past zone A still sees the count in zone C.

**Sort** — a single `<select>` (not a popover; it is single-choice):
`A–Z` (default) · `Element` · `Rarity, high first` · `Support tier`. Sorting by support tier
orders `full → basic → partial`, which is also the order that puts the most trustworthy
results first. **All sorts are stable and tie-break on name ascending**, so the grid never
reorders arbitrarily between renders — the same requirement determinism imposes on the
engine, applied to the view.

**Role filter is NOT specced.** `role` does not exist in `GenericCharacterDefinition`, it is
an opinion rather than a fact, and inventing a role taxonomy in the UI is exactly the kind of
"plausible but unverified" data this project forbids. See OQ-1.

### Filters never hide the reason a character is missing
A character excluded by a filter is absent; a character present but unselectable is shown
disabled with a reason (§1.4's rule, retained). These are different and must stay different.
When a filter combination yields 0 results the empty state names the filters (§4.7).

## 4.5 Selection
Click / `Enter` / `Space` on a card selects it into the invoking slot and closes the dialog,
returning focus to the invoking slot's `Change`/`Add` control (§1.4, unchanged).
Announcement is `describeSelection()`'s existing sentence (§1.3) — unchanged, because the
swap semantics did not change.

Cards for characters already in **another** slot are `disabled` with `Already in slot N`
rendered as visible text on the card, per §1.4. They stay in the grid and stay counted in
zone C. A disabled card is **still reachable by arrow keys** (see §4.6) — skipping it would
make the grid geometry lie about what is on screen.

## 4.6 Keyboard model — one tab stop, not a hundred

This is the load-bearing accessibility decision of this component.

The grid is a **composite widget with roving `tabindex`**, `role="grid"` with
`role="row"`/`role="gridcell"`, exactly one card in the tab order at a time (`tabindex="0"`;
all others `tabindex="-1"`). 100 cards as 100 tab stops would make `Tab` unusable and would
strand a keyboard user between the search field and the dialog's close button.

> Note on `role="grid"`: UI-DECISIONS previously rejected `role="grid"` **for the timeline**,
> because that component could not honestly supply 2D grid structure. The character browser
> genuinely is a uniform 2D grid of same-sized cells with a real row/column model, so the
> role is accurate here. The rejection was of a *dishonest* role, not of the role itself.

| Key | Behavior |
|---|---|
| `Tab` | search → each filter trigger → sort → the grid (as one stop) → close button |
| `↑ ↓ ← →` | move between cards; `→` at row end wraps to the next row's first card (linear reading order, because the grid reflows at breakpoints and a strictly columnar model would be wrong at 2-up) |
| `Home` / `End` | first / last card **in the current row** |
| `Ctrl+Home` / `Ctrl+End` | first / last card in the whole grid |
| `PageUp` / `PageDown` | one viewport of rows |
| `Enter` / `Space` | select (no-op with a reason announcement on a disabled card) |
| `Esc` | close the dialog (from anywhere, including inside a filter popover — the popover closes first, the dialog second) |
| typing a letter | **not** bound to type-ahead — the search field owns text entry, and two competing text targets is a trap |

Focus management rules:
- The roving `tabindex` anchor resets to the **first card** whenever the filtered result set
  changes. Keeping the old index would land focus on an unrelated character.
- When focus moves to a card outside the viewport, `scrollIntoView({ block: "nearest" })`.
  With virtualization this means the row must be **rendered before** focus is moved, not
  after — otherwise focus lands on a node that is about to be unmounted and falls back to
  `<body>`, which is a keyboard trap in practice. Frontend: move focus in an effect after the
  scroll/render commit, not in the key handler.
- The sticky control bar must not overlay a focused card: the scroll container carries
  `scroll-padding-top` equal to the control-bar height.
- Focus ring uses the standard `FOCUS_RING` token and must be visible against the card's
  selected/hover fills — verify at review, since the ring sits inside a scroll container.

Screen-reader semantics:
- Grid `aria-label="Character roster"`, `aria-rowcount` / `aria-colcount` reflecting the
  **filtered** set (virtualized rows require the real totals, or a SR reports "row 3 of 3"
  while 106 exist).
- Each card's accessible name: `"<Name>, <Element>, <Rarity> star, <WeaponType>, <tier label>"`,
  followed by `", already in slot N"` when disabled. Full name always, never truncated.
- Result count in zone C is inside `aria-live="polite"`, announcing
  `14 of 106 characters match.` — debounced to the same 120 ms as the render so it announces
  once per settled query, not once per keystroke.

## 4.7 States

| State | Behavior |
|---|---|
| loading roster | 12 skeleton cards at final card height, grid `aria-busy="true"`. Never a spinner — the grid geometry is known, so reserve it (CLS). |
| empty (no filters, roster genuinely empty) | `state.error` panel: `Character data failed to load. Reload the page to try again.` A roster is never legitimately empty, so a zero-length roster is an error, not an empty state. |
| no results (search) | `No characters match “<query>”.` + `Clear search` button. Never a bare `0 results`. |
| no results (filters) | Names the filters that are excluding: `No characters match Pyro + Bow + 5★.` + `Clear all filters` button + a `Clear last filter` button. The user must be able to reverse one step without losing the whole query. |
| all remaining are already teamed | `Every matching character is already in your team.` — distinct copy from "no results", because the situation and the remedy are different. |
| disabled card | visible `Already in slot N` on the card, `disabled` attribute, still arrow-reachable, activation announces the reason rather than doing nothing silently. |
| error loading a single character's data | that card renders with a `state.error` chip `Data error` and is disabled with reason `This character's data failed to load.` The rest of the grid stays usable — one bad record must not blank the roster. |

## 4.8 Responsive

| | Desktop ≥1024 | Tablet 640–1023 | Mobile <640 |
|---|---|---|---|
| Shell | dialog, `max-w-3xl` | dialog | full-height bottom sheet (§1.4, unchanged) |
| Grid | 4 columns | 3 columns | 2 columns |
| Filters | inline triggers in one row | inline, wraps to two rows | **`Filters (2)` button** opening a nested full-screen filter sheet with `Apply` / `Clear all` |
| Sort | inline `<select>` | inline | inside the filter sheet |

Mobile-specific: the nested filter sheet is a second layer — `Esc`/back closes it back to the
browser, not all the way out. Cards are ≥44px tall by construction; the 2-column card keeps
the same content but drops the `5★ · Sword` line to a second wrapped line rather than
truncating it.

## 4.9 Virtualization posture

- **Threshold: virtualize above 60 rendered cards**, not "always". Below that the plain grid
  is simpler, and today's 4-character roster must not carry a windowing library's focus and
  scroll bugs for no benefit. The threshold is one constant, so the behavior flips
  automatically as the roster grows — no second code path to remember to switch on.
- Fixed row height is a **requirement**, not an optimization: it is what makes
  `aria-rowcount`, `scrollIntoView`, and the arrow-key row model all agree.
- The virtualized window must render **at least one row above and below** the viewport, so
  arrow-key movement to an adjacent row never targets an unmounted node.
- Filtering re-derives the list and resets scroll to top and the roving anchor to card 0.
- Library choice is `frontend-engineer`'s call; the contract is: fixed row height, real
  `aria-rowcount`, focus-safe on scroll, and no `key` reuse across filter changes.

## 4.10 Tokens used
No new tokens. `CARD`, `FOCUS_RING`, `TRANSITION_COLORS`, `DISABLED`, `TOUCH_TARGET`,
`STATE_CHIP`, `ElementTag`, `StatusChip`, radius `rounded-md`, spacing steps `2/3/4`,
type steps `body-strong` / `label` / `micro`.

### Card height — the one deliberate exception to §2.3 (AUDITED)

§2.3 states height is **content-derived, never hand-measured**, and permits an off-scale
fixed height only in the all-empty floor constant, "and nowhere else in the product". The
browser card is the second and only other exception, and it is granted here explicitly
rather than by quietly reading §2.3 as permission — because it is **not** the same case:

- §2.3's slots are four peers in one row; the tallest can set the height for all, so
  measuring is unnecessary and therefore forbidden.
- Virtualized rows have no such peer to measure against. A windowing container must know row
  height **before** the row exists, in order to size the scrollbar and map a scroll offset to
  an index. Content-derived height is not merely inconvenient here, it is unavailable.

So the constraint is inverted, not waived, and the fixed value must satisfy:

| Rule | Value |
|---|---|
| Desktop / tablet card | `h-24` (96px) |
| Mobile card (metadata line wraps) | `h-28` (112px) |
| Where the number lives | ONE exported constant per breakpoint, adjacent to the virtualizer's `estimateSize`, never re-typed in the card |
| Comment required on the constant | naming virtualization as the reason, mirroring §2.3's required comment on `SLOT_MIN_HEIGHT` |

`h-24` / `h-28` are Tailwind **sizing** steps; DESIGN-SYSTEM's `1,2,3,4,6,8,12` restriction
governs padding and gap, which is why the card's internal `p-3`/`gap-2` stay on-scale.

**Overflow rule, which is what makes a fixed height safe:** the card's content must fit at
the constant at 200% browser zoom (audit checklist item 7). If it does not, the fix is to
remove a line from the card, never to raise the constant per-locale — a taller constant
silently breaks the virtualizer's `estimateSize` agreement. Frontend must verify this at
review; it is the single failure mode of this exception.

### RE-RULED (TASK #046) — `h-24` is DORMANT, and the dependency is inverted

Verified state of the code: **no virtualization library is installed**, `estimateSize`
appears nowhere in `src/`, `h-24` appears nowhere in `src/`, and the browser card is
content-sized today. The roster is 139 generated entries, which is above §4.9's threshold of
60 — so §4.9 *will* apply, but it is not applied yet.

`h-24` is therefore **dormant, not violated.** There is no defect to file against the
current code, and this ruling exists so that the number is not treated as settled when the
work finally happens.

**The dependency is inverted.** The original table reads as though `h-24` were the input and
the content had to fit inside it. That is backwards, and it is backwards in a way that
decision 1 (zh-CN primary) makes actively dangerous: `96px` was chosen against an English
draft, and DESIGN-SYSTEM's CJK section establishes that a Chinese string occupies ~1.2× the
horizontal space and that `line-clamp` values chosen for English clamp Chinese to half the
content. A constant inherited from an English mock would silently truncate the roster's
Chinese names and tier labels.

The corrected contract, binding when §4.9 is implemented:

| | Rule |
|---|---|
| **Input** | The card's content at its final zh-CN copy — name, element, tier chip, metadata line — is the FIXED requirement. |
| **Derived** | The height constant is MEASURED against that rendered card, then frozen as the exported constant. It is an output of the design, not a premise of it. |
| **Verification gate** | Measured at **200% browser zoom** with **zh-CN** content, on the real card, before the constant is committed. Both conditions, not either. |
| **`h-24` / `h-28`** | Treated as **estimates pending measurement**, not as values. If measurement yields a different Tailwind sizing step, that step is correct and this document is amended. |
| **If content will not fit** | Remove a line from the card (§4.10's original rule stands). Never raise the constant per-locale; never let the constant float. |

Until §4.9 is implemented the card stays content-sized and no constant exists. Do not add
one preemptively — an unused constant that nothing measures is exactly how the English-mock
number would get frozen in.

---

# §5 — Traveler: one identity, six forms

## 5.1 The problem
The Traveler is one character whose element is chosen, not fixed. Rendering six entries
named after six elements would be a factual misstatement of the game and would let a user
place two "different" Travelers in one team — which the duplicate guard in §1.3 would not
catch, because their ids would differ.

## 5.2 Decision
**One roster entry. Form is a property of the placed character, chosen at or after
selection.** The browser shows the Traveler exactly once.

## 5.3 Browser presentation
The Traveler card carries, in place of a single `ElementTag`, a row of the available form
elements as small element dots **plus** the text `6 forms`:

```
┌────────────────────┐
│ ● ● ● ● ● ●  6 forms│
│ Traveler           │
│ 5★ · Sword         │
│ ◇ Basic            │
└────────────────────┘
```

Accessible name: `"Traveler, 6 elemental forms, 5 star, Sword, Basic support"`. The dots are
`aria-hidden`; `6 forms` is the text that carries it. The card is **not** expandable in the
grid — expanding one card in a virtualized fixed-height grid breaks the row model, and the
choice belongs to configuration anyway.

Filtering by element **includes** the Traveler in every element facet it has a form for, and
when the Traveler card appears under an element filter it shows that form's dot emphasized
and reads `6 forms · Anemo available`. A user filtering for Anemo who does not see the
Traveler would conclude, wrongly, that the tool has no Anemo Traveler.

## 5.4 Form selection
Selecting the Traveler places it in the slot with **no form chosen yet**, and the slot enters
an explicit incomplete state rather than defaulting to one element:

- The team slot renders `state.warning`: `⚠ Choose an element` with a `Choose element`
  button. Defaulting silently to (say) Anemo would put a character in the party the user
  never picked, and every downstream number would be for the wrong element.
- `Simulate` is `disabled` while any slot holds a formless Traveler, with the adjacent reason
  `Choose an element for Traveler before simulating.`
- The chooser is a **radio group** (`role="radiogroup"`, `aria-label="Traveler element"`) of
  the available forms, each option showing the element dot + name **and its own support tier
  chip** — forms are implemented independently, so their tiers genuinely differ, and hiding
  that behind one character-level tier would be the exact "plausible but wrong" failure.
- Once chosen, the slot renders as a normal filled slot whose element chip reads the chosen
  form, and the name reads `Traveler` with a `label`-size `Anemo form` line beneath. The name
  is never rewritten to "Anemo Traveler" — that is not the character's name.

## 5.5 Changing form
The config panel (§6) carries the form radio group permanently, so switching is one
interaction and does not require removing and re-adding the character.

**Changing form invalidates the result** by the same rule as any team mutation (§1.5), and
additionally **invalidates rotation actions** that reference the old form's ability ids. The
existing `orphanedActionCount()` path reports this; copy:
`Traveler changed to Anemo — N rotation actions reference the previous form.`

## 5.6 Duplicate rule
The Traveler is one character: it may occupy **one** slot, regardless of form. Two Travelers
in different forms is not a legal party. The picker's `Already in slot N` disable applies to
the Traveler card as a whole. This must be enforced on the **Traveler identity id**, not the
form id — flagged to `frontend-engineer` as the single most likely bug in this section.

## 5.7 A11y
- The form radio group is a real radio group; arrow keys move between forms, `Tab` enters and
  leaves it as one stop.
- Changing form announces via the team's existing live region:
  `Traveler set to Anemo form. Basic support.`
- The tier of the *chosen form* is what the slot and all result views display.

---

# §6 — CharacterConfigPanel

## 6.1 Purpose
Configure one placed character: level, ascension, three talent levels, constellation, and
(later) weapon + artifacts — without turning the team builder into a spreadsheet the first
time a user opens it.

## 6.2 Where it lives
**Not inline in the slot.** Four expanded config forms in a 4-across grid is unreadable, and
the slot card's job (§1.3) is comparison at a glance. Config opens as a **panel scoped to one
character**:

- Desktop ≥1024: a right-side panel beside the team grid, opened by the slot's `Configure`
  button. Non-modal — the user must be able to see the other three slots while tuning one.
- Tablet: a modal dialog (there is not room for a side panel beside a 2×2 grid).
- Mobile: a bottom sheet.

The slot gains one control (`Configure`) beside the existing `Change` / `Remove`. That is a
third button on a card that already has up to five controls; accepted, because the
alternative — making the whole card a click target for config — collides with `Set Active`
and with the card's own selection semantics.

## 6.3 Layout / IA — tiered, not flat

Tier 1 (always visible when the panel is open):

```
┌─ Configure: Ember ──────────────────────── [✕] ┐
│ ● PYRO · 5★ · Sword          ✓ Full support    │
│ Every ability, passive and constellation in    │   ← tier sentence, visible text
│ this character's data is executed.             │
├────────────────────────────────────────────────┤
│ Level        [ 90 ▾ ]   Ascension  [ 6 ▾ ]     │
│ Constellation  ( 0 )( 1 )( 2 )( 3 )( 4 )( 5 )( 6 )│
│ Talents   Normal [ 9 ▾ ]  Skill [ 9 ▾ ]  Burst [ 9 ▾ ] │
├────────────────────────────────────────────────┤
│ Base ATK 800 · HP 12,000 · DEF 700             │   ← derived, read-only, mono
│ Ascension bonus  CRIT DMG +38.4%               │
├────────────────────────────────────────────────┤
│ ▸ Kit (§6.6)                                   │   ← Tier 2, collapsed by default
│ ▸ Passives (2)                                 │
│ ▸ Constellations (0 of 6 active)               │
└────────────────────────────────────────────────┘
```

Rules:
- The three talent levels are **three separate labelled controls**, never one "talent level"
  field. They are independent in game and in `TalentLevels`; collapsing them into one would
  be a silent data error the user cannot see.
- Level and ascension are related but distinct. Selecting a level **does not** silently set
  ascension: instead, an illegal pair (e.g. level 90 at ascension 2) renders a `state.warning`
  inline note naming the constraint and offering the fix — `Level 90 requires ascension 6.
  [Set ascension 6]`. Auto-correcting the user's other field without telling them is the
  behavior this project's data rules forbid, in UI form.
- Constellation is a **7-segment radio group** `0..6`, not a stepper or a dropdown — the range
  is small, fixed, and the current value must be readable without opening anything. Each
  segment's accessible name is `Constellation N`; `C0` is labelled `0 (none)` in text so it is
  not mistaken for "unset".
- The derived stat block is **read-only**, `font-mono tabular-nums`, and recomputes as the
  controls change. It is display of engine-owned values, never computed in the component —
  it must arrive through an adapter calling into `src/simulation/character` (`ascensionValue`,
  the base-stat curves). See N11.
- Weapon and artifacts are **not specced here** — they do not exist in the model yet. The
  panel reserves their position with a `state.info` line: `Weapon and artifacts are not yet
  configurable.` Reserving the slot with an honest sentence is better than a disabled control
  implying it is coming next week, and better than silence implying stats are complete.

## 6.4 Talent / level control type
All numeric level fields are `<select>`, not free-text or steppers:
- The legal set is small and closed (1–90 level, 1–15 talent, 0–6 ascension/constellation),
  so a select cannot produce an invalid value at all — preferable to validating a text input
  after the fact, and consistent with "surface constraints before the click".
- Free text would invite `999` and require an error state that a select makes impossible.
- Each has a real `<label>`; none is placeholder-labelled.
- Talent selects show the level only (`9`), with the label carrying the talent name; the
  in-game convention of C3/C5 raising a talent cap is **not** modelled and is not implied —
  if the model later gains it, the select's max becomes derived and the change is contained.

## 6.5 Defaults
A newly placed character opens at whatever its data declares (`level`, `talentLevels`,
`constellationLevel`, `ascensionPhase` are all required fields on
`GenericCharacterDefinition`, so there is always a value). The UI **invents no default**.
The panel shows a quiet `micro` line `Defaults from character data.` until the user changes
something, then that line is replaced by `Modified` + a `Reset to defaults` button.

## 6.6 Kit / ability display (multi-hit, data-driven)

This is the display of `KitAbility` and `DamageInstanceDefinition`, and it must not flatten
multi-hit into one row — a 3-hit burst that reads as one hit is wrong in exactly the way the
old scalar model was wrong.

Collapsed (Tier 2), one row per ability, in `allAbilities()` order — which is deterministic
and already fixed by the engine, so the UI simply preserves it and never re-sorts:

```
Normal Attack
  ▸ N1   1 hit    ATK          0.4 s   —
  ▸ N2   1 hit    ATK          0.3 s   —
  ▸ N4   2 hits   ATK          0.5 s   —
Charged Attack
  ▸ CA   1 hit    ATK          0.7 s   —
Elemental Skill
  ▸ Skill  3 hits  ATK · EM    0.5 s   CD 6.0 s · 3 particles
Elemental Burst
  ▸ Burst  5 hits  ATK         1.2 s   CD 15.0 s · 40 energy
```

Row content and rules:
- **Slot grouping**: `normalAttacks.hits` render under one `Normal Attack` heading with their
  N-index; `loops: true` renders as a `micro` note `String loops back to N1.` — declared in
  the data, so it is stated rather than assumed.
- **Plunges get their own headings.** `plungeLow` and `plungeHigh` are separate abilities in
  `AbilitySlot` and, as of `src/simulation/engine/actionSpace.ts`, separate castable
  `ActionType`s — they merely collapse onto one `"plunge"` *damage type*. Render them as two
  rows (`Plunge (low)` / `Plunge (high)`), never merged into one "Plunge". Merging would make
  the kit display contradict the action space the optimizer searches over.
- Absent slots are not rendered as empty headings — see §6.7's `Not available for this
  character.` row. Many characters legitimately have no charged attack or no plunge data.
- **Hit count** is `instances.length`, always shown, including `1 hit`. Showing it only when
  >1 would make single-hit indistinguishable from unstated.
- **Scaling** is the set of `ScalingTerm.stat` values across the ability's instances, joined
  with `·` (`ATK · EM`). Hybrid scaling is a real and important property; it is Tier-2
  visible, not hidden. Stat abbreviations are the game's (`ATK`, `HP`, `DEF`, `EM`) and are
  spelled out in an adjacent `micro` legend line, since `EM` is not universally known.
- **Cast time** in seconds, mono, non-breaking space before the unit (`0.5 s`).
- **Cooldown** comes from a `TalentTable` and is therefore level-dependent: it is displayed
  **at the character's current talent level**, and the panel states that once, as visible
  text: `Cooldowns and multipliers shown at the current talent levels.`
- Abilities with `energyCost > 0` show it; `particles` shows the emission count. Absent means
  absent — never rendered as `0` (`0 particles` and "this ability has no particle data" are
  different claims).

### Expanded ability — the instance table (Tier 3)
Expanding a row reveals one table row per `DamageInstanceDefinition`, in declaration order:

| Column | Source | Notes |
|---|---|---|
| Hit | `instance.name` | `Hit 1`, `Cutting DMG` — as authored |
| At | `instance.delay ?? 0` | `+0.00 s`, mono; makes multi-hit timing visible |
| Element | `instance.element` | `ElementTag`, dot + text |
| Type | `instance.damageType` | `Skill` / `Normal` … |
| Scaling | `instance.scaling[]` | `1.24 × ATK` per term, one line each, summed terms shown stacked |
| Application | `instance.application` | gauge units, e.g. `1U Pyro` |
| ICD | `instance.icd` | see below |

Two honesty rules, both of which the engine's own comments already demand:
- `application` **absent** renders as the text `No elemental application` in
  `state.info`, **not** as a blank cell. The adapter deliberately leaves it absent for lifted
  legacy characters precisely so no reaction is invented; a blank cell would read as "not
  displayed" rather than "declared to not apply an element", and a user would then wonder why
  their reaction never fires.
- `icd` absent renders as `Inherits group ICD` (it is an *override* field per `kit.ts`), never
  as `None`. `None` would claim every hit applies an aura — the opposite of the truth.

Instance tables are `<table>` with real `<th scope="col">`. At 5+ instances they are the
densest thing in the product; they use `px-3 py-2` dense rows and `tabular-nums`, and on
mobile they become a definition-list stack per instance rather than a horizontally scrolling
table (the same principle as §3.9: a different interaction, not a shrunk one).

### Passives and constellations
One row each: name, unlock condition (`Ascension 4` / `C2`), and an `active` / `inactive`
marker derived from `unlockedPassives()` / `activeConstellations()` — **derived by the engine
helpers via an adapter, not by comparing numbers in the component.**
- Inactive rows are shown, dimmed, with the reason (`Requires ascension 4`), not hidden.
- A passive or constellation whose `effects` array is empty is a **declared-but-unimplemented**
  effect and renders `⚠ Not simulated` (`state.warning`) with the sentence
  `This effect is declared but not yet simulated — it contributes no damage.` This is the
  per-effect counterpart of the `partial` support tier, and it is how a `basic`-tier
  character shows the user *which specific things* are missing rather than only that
  something is.

## 6.7 States

| State | Behavior |
|---|---|
| no character selected | The panel is closed. There is no "empty config panel" state — an empty form for nobody is a dead surface. |
| open | Focus moves to the panel heading (`tabindex="-1"`, focused programmatically), not to the first input — landing on a `<select>` risks a stray value change on some platforms. |
| changed | Live region: `Ember set to constellation 2.` Result invalidation per §1.5 fires on any config change, with the same visible explanation. |
| invalid pair (level/ascension) | `state.warning` inline note + a one-click fix button. Never auto-corrected silently. |
| unsupported mechanic | Tier chip + sentence in the header (§7). |
| unverified value | Inline `◇ Unverified` chip beside the specific value + one summary line if several (DESIGN-SYSTEM). |
| data missing for a slot | e.g. `chargedAttack` absent: the row reads `Not available for this character.` — the game genuinely has characters without some slots, so absence is legitimate data, not an error. |
| closing | `Esc` closes; focus returns to the `Configure` button that opened it. Non-modal on desktop means `Esc` must be bound on the panel, and clicking outside does **not** close it (an unintentional close of a form is worse than an extra click). |

## 6.8 Responsive
Desktop: side panel `w-96`, team grid narrows to accommodate. Tablet: modal dialog.
Mobile: bottom sheet at ~90vh with `overscroll-behavior: contain`; the collapsed Tier-2
sections stay collapsed by default so the first screen is level + talents + constellation,
which is what a mobile user came for.

## 6.9 A11y
- Panel `role="region"` `aria-label="Configure Ember"` on desktop (non-modal); `role="dialog"`
  `aria-modal="true"` on tablet/mobile. The role differs because the behavior differs — a
  non-modal panel declared `aria-modal` would lie to a screen reader about the rest of the
  page being inert.
- Every control has a visible `<label>`. Grouped controls (`Talents`, `Constellation`) are
  wrapped in `<fieldset>` + `<legend>`.
- Collapsible Tier-2 sections are `<button aria-expanded>` controlling a region by
  `aria-controls`; the ability rows inside are `<button aria-expanded>` in turn. Nesting depth
  is 2 and must not grow.
- The derived stat block is `aria-live="polite"` but **`aria-atomic="false"`** — announcing
  the whole block on every keystroke of a select is noise; only the changed line should speak.
- Headings: panel `h2` → `Kit` `h3` → ability name `h4`. No level skipped.

---

# §7 — Support tier in the UI

Visual language, tokens, and the three tiers are defined in **DESIGN-SYSTEM.md § "Support
tier & data verification"**, which is authoritative. This section specs only *placement*.

> **SUPERSEDED IN PART by §11 (TASK #031).** When this section was written the authored
> claim was the only tier source. A DERIVED tier now exists. §11.2 rules that the **derived**
> tier is what "tier" means in every row of the table below; the claim is displayed only as
> the subject of a disagreement. Placement and copy rules here are otherwise unchanged.

| Surface | Rendering |
|---|---|
| Browser card (§4.3) | `StatusChip`, short label, all three tiers including `full` |
| Team slot (§1.3) | chip in row A beside the element chip; `full` renders quietly |
| Config panel header (§6.3) | chip **plus the full sentence as visible text** — this is the one place the complete explanation is guaranteed to exist, which is what lets every other surface use a short chip without violating the tooltip rule |
| Traveler form chooser (§5.4) | per-form chip |
| Damage breakdown row / timeline lane header | chip when tier ≠ `full`; omitted for `full` |
| Result summary | if **any** team member is `basic` or `partial`, one `state.warning` line above the Tier-1 stats: `This result includes N characters whose mechanics are not fully simulated.` with a disclosure listing which and why |

That last row is the most important one in this spec. Tier-1 headline damage is the number a
user will screenshot and act on; an unqualified `Total Damage` for a party containing an
unsimulated mechanic is precisely the plausible-but-wrong output the project guards against.
The caveat sits **above** the number, not in a footnote below it.

Copy rules:
- Never say "unsupported" for a `partial` character — it *is* supported, incompletely. Say
  what is missing and which way the number is wrong.
- Never phrase tier as a promise (`coming soon`). It describes the present.

## 7.3 AMENDED AT SCALE (TASK #046, decision 1 ratified) — baseline once, chip on deviation

The placement table above was written against a 4-character roster, where a per-card tier
chip was a per-character signal. **The roster is now 139 generated entries and
`registry.ts:48` claims a single `GENERATED_SUPPORT_TIER = "PARTIAL"` for every one of
them, with a single identical `GENERATED_TIER_REASON` string.**

A chip that renders identically on ~135 of 139 cards, carrying an identical reason, conveys
**zero per-character information.** Users are correct to ignore it, and a caveat that users
are correct to ignore is worse than no caveat: it trains them to skip the place where a real
per-character warning will later appear. A signal with zero variance is not a signal.

The rule therefore becomes:

| Where | Rendering |
|---|---|
| **Roster picker header** (§4.4, beside the result count) | **State the baseline ONCE, as visible text**, in the same region as the filters: `本工具当前对全部角色为「部分支持」— 命之座与固有天赋尚未建模。` with a disclosure carrying the full reason. |
| **Roster card** (§4.3) | **No tier chip when the character matches the roster baseline.** A chip renders only when the character DEVIATES — a different tier, or a different reason string. |
| **Result view** (Tier 1, DASHBOARD §12.2) | **State the baseline ONCE**, above the damage numbers, per §7's original last row. Unchanged and still the most important placement in this spec. |
| **Team slot** (§1.3) | Chip only on deviation. |
| **Timeline lane / breakdown row** | Chip only on deviation (was already "omit for `full`"; now "omit when equal to baseline"). |
| **Config panel / detail view** (§6.3, CHARACTER-DETAIL-046 §15.6) | **Always the full sentence, unconditionally.** This is the per-character surface a user opened specifically to ask this question, and it is what licenses the omissions above. |

### How "baseline" is determined — computed, never authored

`baseline = the tier + reason pair shared by a strict majority of the currently rendered
list.` Computed from the same data the cards render, in the adapter, not in a component.
Two consequences that are the whole point:

- The moment a second tier value exists in the roster, chips **automatically reappear** on
  whichever group is now the minority. No code path to remember to switch on.
- Filtering changes the rendered list, so it changes the baseline. A filter that isolates
  the 4 deviating characters makes *them* the baseline and the statement changes to match.
  This is correct: the statement describes what is on screen.
- If no tier holds a strict majority, there is no baseline: **every card shows its chip.**
  This is the safe direction — the failure mode is verbosity, never a hidden caveat.

### What this amendment does NOT relax

- The **result-view caveat above the damage number** is untouched. It is a statement about
  the number the user will screenshot, and it is required whether it is a baseline statement
  or a per-character one.
- **`partial` still requires a named reason with a direction of error.** Suppressing the
  chip does not suppress the reason; the reason moves to the header statement and the detail
  view, both as visible text.
- **The tooltip rule is untouched.** The baseline statement is visible text in the picker
  header, not a `title`. Suppressing per-card chips is only defensible *because* the
  statement is unmissable somewhere the user is already looking.

## 7.1 Two different gaps, two different surfaces (ADDED on audit)

The product now has **two** independent honesty registries, and conflating them would make
both useless. They must never share a chip.

| | Character-level tier (§7 above) | Engine-level mechanic gap |
|---|---|---|
| Question answered | "Is *this character* fully simulated?" | "Is *this game mechanic* implemented at all?" |
| Source | authored per character — **N9**, does not exist yet | `UNSUPPORTED_MECHANICS` in `src/simulation/reactions/unverified.ts` — **exists today** |
| Scope | one roster entry | the whole simulation, every team |
| Where shown | browser card, slot, config header, breakdown row | Result view only, once — never on a character |

The engine-level registry is real, live data with a stable shape
(`{ id, status: "unsupported" | "uncertain", note }`) and a lookup
(`findUnsupportedMechanic`). Its own header states consumers "may render this so a user is
told a number is incomplete rather than being shown a confidently wrong one" — so rendering
it is the intended use, not an appropriation.

**Naming collision, resolved.** `MechanicStatus` uses the word `"unsupported"`; §7's copy
rules forbid the word "unsupported" for a `partial` character. These do not conflict, because
they describe different subjects — a *mechanic* genuinely is unsupported; a *character* is
incompletely supported. Frontend must not reuse the mechanic's raw `id` or `status` string as
UI copy in either surface.

### Rendering the engine-level registry

One collapsed disclosure in the Result view, **below** the Tier-1 stats (unlike §7's
per-character caveat, which sits above them). The distinction is deliberate:

- A `partial` **character in this team** changes *this* number, so it must be read before the
  number. It goes above.
- A globally unimplemented mechanic may or may not touch this rotation, and the UI cannot
  currently tell which. Hoisting it above every result would train users to dismiss it —
  the classic warning-fatigue failure — and a dismissed caveat is worse than a placed one.

```
Total Damage  1,234,567        ← Tier 1
⚠ This result includes 2 characters whose mechanics are not fully simulated.   ← §7, above
...
▸ 7 combat mechanics are not yet simulated          ← state.info, Tier 3, collapsed
```

- Trigger: `<button aria-expanded>`, `state.info`, `micro`, label `N combat mechanics are not
  yet simulated`. Never `⚠`/`state.warning` — this is a standing property of the tool, not
  something that went wrong with this run.
- Expanded: one row per entry — a human title, the `status` rendered as text
  (`Not implemented` for `"unsupported"`, `Uncertain` for `"uncertain"`), and the `note`
  verbatim as visible body text, **not** a tooltip.
- The `note` strings are engineer-authored and contain source names and `TODO:`. They are
  shown verbatim anyway: an honest, slightly technical sentence beats a UI-writer's paraphrase
  that could drop the qualifier that made it accurate. Flagged as **OQ-7**.
- The count is derived from the array length. Never hard-coded — the list grows as mechanics
  are triaged, and a stale numeral is its own small lie.

### Where this registry must NOT appear
Not on a character card, not in a team slot, not in the config panel. It is not that
character's fault and attaching it there would make every character look degraded.

## 7.2 Per-value `UNVERIFIED` (DESIGN-SYSTEM) vs. these two

DESIGN-SYSTEM's `◇ Unverified` marker is a **third**, finer thing: one *field* whose numeric
value could not be cross-verified (precedent: `PARTICLE_COLORLESS_MULTIPLIER`). It is inline,
beside the value, and orthogonal to both registries above. Summary of the three, which
frontend should keep straight:

| Marker | Grain | Token | Placement |
|---|---|---|---|
| Support tier | character | `success` / `info` / `warning` | on the character, everywhere |
| `◇ Unverified` | one value | `info` | inline, beside that value |
| Mechanic gap | whole engine | `info` | once, Result view, collapsed |

---

# §8 — Open questions requiring a product decision

These are deliberately **not** decided here. Each is a product/data question whose wrong
answer would be invisible in the UI, and this project's rule is that unverifiable things are
marked, not guessed.

**OQ-1 — Role taxonomy.** Should characters carry a `role` (DPS / sub-DPS / support / healer)
for filtering? It is the filter users will most expect. But role is an opinion, contested per
character, team-dependent, and absent from the data model. Options: (a) no role filter — the
spec's current position; (b) role as authored data with an explicit "editorial, not
mechanical" label; (c) a derived proxy (e.g. "has healing effects") that is factual but
narrower. **Recommend (a) now, revisit with (c).** Needs the user's call.

**OQ-2 — Tier granularity.** Three tiers, or per-mechanic flags? Three tiers are legible but
lossy (`basic` covers "one C6 missing" and "no passives at all"). §6.6's per-effect
`⚠ Not simulated` marker is the mitigation, but if the user wants tier itself to be finer,
that is a data-model change, not a UI change. Needs the user's call.

**OQ-3 — Whose tier is the team's tier?** Specced as "worst member wins" for the result-level
caveat. Alternative: list every non-`full` member with no aggregate. Current spec does both
(aggregate line + disclosure list); confirm that is not over-warning.

**OQ-4 — Traveler form scope.** Are all six forms one identity for *ability data* purposes,
sharing normal attacks and differing only in skill/burst? The UI spec assumes forms differ in
skill/burst and share identity, which matches the game, but the data model does not yet
express it (see N10). If the model instead stores six full kits under one id, §5 still holds;
if it stores six ids, §5.6's duplicate guard needs an explicit identity field.

**OQ-5 — Level/ascension coupling.** §6.3 specs "warn + offer the fix, never auto-correct".
If the user prefers auto-correction, it must at minimum be announced. Confirm.

**OQ-7 — Voice of the mechanic-gap notes.** §7.1 renders `UNSUPPORTED_MECHANICS[].note`
verbatim. The notes are engineer-authored, cite sources, and contain `TODO:`. Options:
(a) verbatim — maximally honest, slightly technical (spec's position); (b) add an optional
`userNote` field authored for players, falling back to `note`; (c) UI-writer paraphrase —
**rejected outright**, since a paraphrase can drop the qualifier that made the sentence true.
**Recommend (a) now, (b) if a user ever reports the copy as confusing.** Needs the user's call.

**OQ-6 — Roster scope in the browser.** Should characters with **no data at all** (known to
exist in game, not yet authored) appear as greyed-out "not yet added" entries so the user can
see coverage? Pro: honest about scope, and the roster's completeness becomes visible.
Con: ~100 dead cards for a long time, and it needs a name list, which is data entry the user
explicitly deferred. **Recommend: no placeholder cards; instead one line under the result
count — `Showing N of the characters currently in the tool.`** Confirm.

---

# §9 — Data required from the character model (extends §0)

| # | Need | Why | Used by |
|---|---|---|---|
| N9 | **`supportTier: "full" \| "basic" \| "partial"` and `tierReason?: string` on the character definition** (or a parallel registry keyed by character id). Authored data, never inferred. | The entire §7 honesty contract. Without it the UI cannot distinguish a fully-simulated character from one missing its defining mechanic, which is the project's core failure mode. | §4, §1.3, §6, §7, result summary |
| N10 | **Traveler identity expressed in the model**: an identity id shared across forms, plus the available form elements. Whatever the shape, the UI needs (a) "these are one character" and (b) "these are the forms". | §5. Without (a), two Travelers can enter one party and the duplicate guard cannot see it. | §4.3, §5 |
| N11 | **A pure derived-stats accessor** the UI can call for a configured character: base ATK/HP/DEF at level, plus the resolved ascension bonus. `ascensionValue()` and `baseStatCurves` exist; the UI needs one function rather than reimplementing the lookup. | §6.3's derived block. A component doing its own curve lookup is business logic in the UI. | §6.3 |
| N12 | **Per-effect implemented flag** (or the convention that an empty `effects` array means unimplemented, stated explicitly and relied on). | §6.6's per-passive `⚠ Not simulated`. Currently the UI would be *inferring* from an empty array — acceptable only if the model declares that convention. Otherwise a genuinely no-op passive is mislabelled. | §6.6 |
| N13 | **Ability display metadata that already exists but must be confirmed stable**: `allAbilities()` order, `instances` declaration order, `NormalAttackString.loops`. The UI relies on these being deterministic and never re-sorts them. | §6.6 | §6.6 |

| N14 | **Nothing new — confirmation only.** `UNSUPPORTED_MECHANICS` / `findUnsupportedMechanic` (`src/simulation/reactions/unverified.ts`) must stay exported and shape-stable (`{ id, status, note }`), and must be reachable through the frontend's simulation adapter rather than imported directly by a component. | §7.1's disclosure is the only place the user learns the engine has known gaps. A direct component import would also breach the "UI consumes APIs only" seam. | §7.1 |

N9 and N10 are **blocking** for §4/§5/§7 as specced. N11–N13 are needed for §6 but have
workarounds that are strictly worse and are called out inline.

---

## Per-component spec expectations
Each component spec states: purpose, props/data in, layout/IA, key states
(loading/empty/error/disabled/success), responsive behavior incl. a mobile alternative,
a11y notes, interaction states. §1–§3 above are the reference format.

---

# §10 — Duplicate ability rows in the damage breakdown (RULED — TASK #031)

## 10.1 The situation

`damageByAbility` is keyed by ability ID (combat TASK #022 S1). Display names are not
unique, so two genuinely distinct buckets can carry the same `label`. The breakdown then
renders two rows reading e.g. the same name with different numbers.

The data is CORRECT. The rendering is AMBIGUOUS. Those are different problems and only the
second one is mine. Nothing about the id-keying should be reverted or worked around —
`breakdownModel.ts` already states the rationale and it is right.

## 10.2 The ruling

**Disambiguate with a visible, per-row QUALIFIER derived from the owning character. Never
with the raw ability id, and never with a tooltip.**

Three candidate qualifiers were considered:

| Candidate | Verdict |
|---|---|
| Raw ability id as visible suffix (`Flame Strike (pyro-e)`) | **Rejected.** See 10.3. |
| Ordinal (`Flame Strike (1)`, `Flame Strike (2)`) | **Rejected.** Carries no meaning; the numbering is an artefact of sort order, so it changes between runs and teaches the user nothing about *which* is which. |
| **Owning character name** (`Flame Strike · <Character>`) | **ADOPTED.** |

The owning character is the answer to the question the user is actually asking when they see
two identical labels — *whose is this?* It is stable across runs, it is already a name the
user chose in the team builder, and it needs no new engine contract (see 10.5).

## 10.3 Why the id is not the answer here, even though it is elsewhere

Frontend correctly implemented the raw id as a fallback when a label is MISSING
(`resolveLabel`). That pattern is right and stays. It does **not** extend to this case, and
the distinction is worth stating because the two look superficially similar:

- **Label missing** → the id is shown because there is *nothing else*, and its appearance is
  a deliberate contract-bug signal. It is an exception surface. A theorycrafter seeing
  `pyro-e` in the table learns "something is wrong with the label map".
- **Label duplicated** → the label is present and correct. Appending the id would make the
  *normal, expected* case look like the *broken* case, destroying the diagnostic value of the
  fallback. It would also put an internal identifier in front of every user for a condition
  they cannot act on.

So: the id stays as the missing-label fallback, and never becomes a routine suffix.

## 10.4 Rendering rule

Apply the qualifier **only to rows whose resolved label collides with another row in the same
table.** A qualifier on every row is noise; the disambiguation must be conditional on the
ambiguity actually existing. This keeps the common case (all labels distinct) visually
unchanged.

Row markup for a collided row:

```
Flame Strike · Character Name          123,456 · 12.3%
[========------------------------]
```

- Separator is a middot with hair spacing (` · `), matching the existing value/percent
  separator already used in this component.
- The qualifier is `text-slate-400` (the lowest permitted TEXT grey — `slate-500` is
  forbidden for text by DESIGN-SYSTEM and this is text). The ability name keeps the default
  body colour so the primary identity still reads first.
- The qualifier is inside the same `truncate` container. If truncation clips it, the full
  string remains available in `title` — but the `title` is **not** the sole source: the same
  attribution is present in the By Character table and in the event detail panel for every
  event of that ability. This satisfies the tooltip rule by redundancy, not by promise.
- No new colour, no icon, no badge. This is a name, not a status.

## 10.5 Data — no engine contract change required

`SimulationResult.damageByAbility` is `abilityId -> number` with no owner. But every damage
event in `result.timeline` carries `damage.sourceCharacterId` alongside `damage.abilityId`,
so `abilityId -> sourceCharacterId` is derivable in the presentation model from data that
already exists.

Spec for `breakdownModel.ts` (frontend implements; this is a pure-model change, testable
without a DOM, which is where the collision logic belongs):

1. Build `ownerByAbilityId` from the damage events in the timeline.
2. Resolve the character's display name from the team the UI already holds. If a character id
   has no resolvable name, fall back to the character id — that is the *missing-label*
   condition from 10.3 recurring one level up, and the same rule applies.
3. After labels are resolved, detect collisions: any `label` appearing on more than one row in
   the same table.
4. For colliding rows only, emit a `qualifier` field on `BreakdownRow`. Non-colliding rows
   leave it undefined. The component renders the qualifier when present and nothing when not —
   the component still decides nothing.

An ability id whose owner cannot be determined from the timeline (should be impossible — the
bucket exists because an event contributed to it) leaves `qualifier` undefined; a row is never
blocked from rendering by a failed lookup.

**If two colliding rows resolve to the SAME owner** (one character with two same-named
abilities — an ability and its re-cast), the character name does not disambiguate. In that
case only, append the ability id after the owner: `Flame Strike · <Character> · pyro-q`. This
is the residual case where nothing else distinguishes them, and it is rare enough that the
id's diagnostic connotation is an acceptable cost. It must NOT be the first-line strategy.

## 10.6 Accessibility

- The qualifier is real text in the DOM, in reading order, inside the row. A screen reader
  reads `Flame Strike, Character Name, 123,456, 12.3 percent` — unambiguous without hover.
- No `aria-label` override on the row. An `aria-label` would REPLACE the visible text for AT
  users, reintroducing exactly the divergence between seen and heard content this rule exists
  to prevent.
- Do not use `visually-hidden` text to carry the qualifier for AT only. Sighted users have the
  same ambiguity; hiding the fix from them would be a different accessibility failure.
- The existing bar remains `aria-hidden` decoration; the numeric value is already text.

## 10.7 States

| State | Behaviour |
|---|---|
| no collision | rows render exactly as today — zero visual change |
| collision, distinct owners | `Name · Owner` on the colliding rows only |
| collision, same owner | `Name · Owner · abilityId` on those rows only |
| label missing entirely | unchanged — raw ability id as the label (`resolveLabel`) |
| owner unresolvable | qualifier omitted; row still renders with its label and value |

## 10.8 Responsive

Mobile (<640) the breakdown is one column and the row has full width, so the qualifier fits
more often than on the 3-up desktop layout. No separate mobile treatment. If truncation is
severe at the narrowest width, the qualifier truncates before the ability name — the name is
the primary identity — which the ordering of the two spans already produces naturally.

---

# §11 — Claim vs. derived tier, and unverified data (RULED — TASK #031)

## 11.1 What changed

Two independent things now exist:

- The **AUTHORED CLAIM** — `SupportClaim` in `src/types/index.ts`, written by whoever authored
  the character. This is a promise.
- The **DERIVED TIER** — `CharacterCoverage.tier` in `src/tests/coverage/characterCoverage.ts`,
  computed from what the engine can actually execute and what tests actually assert. This is
  an observation.

`reconcileClaim()` compares them and returns `verdict: "agrees" | "overclaims" | "underclaims"`,
plus `ignoredGaps` on an overclaim.

Neither derives the other. That separation is the entire value: a disagreement is *detectable*.
A UI that shows only the claim throws that away and re-creates the plausible-but-wrong failure
the two-source design exists to catch.

## 11.2 The ruling — which number does the user see?

**The user always sees the DERIVED tier as the tier. The CLAIM is never displayed as the
tier.** When they disagree, the disagreement itself is surfaced as an additional, louder
signal.

Rationale, stated so it is not re-litigated:

- On an **overclaim**, showing the claim would show a promise the code cannot keep. That is
  the exact defect. Non-negotiable.
- On an **underclaim**, showing the claim is *safe* but shows a caveat that is not true. A
  false caveat is still a false statement, and it trains the user to disbelieve caveats. The
  derived tier is the honest one in both directions, so there is no case where the claim wins.
- The claim therefore has exactly one job in the UI: to be *compared*. It is never the value.

## 11.3 The disagreement surface

A disagreement is a **defect in the product's own data**, not a property of the character. The
user is not the person who can fix it, but they are the person whose number is at risk, so
they must be told — plainly, once, and without being asked to interpret two competing labels.

### `verdict: "overclaims"` — the dangerous case

Wherever that character's tier appears, render the derived tier chip as normal, and adjacent to
it a second `state.error` chip:

```
⚠ Special mechanic missing    ✕ Data mismatch
```

- Token: `state.error`. Reserved elsewhere for "cannot run" — extended here deliberately, and
  this is the only extension. Rationale: `state.warning` already means "this character is
  incompletely simulated", and the two must not read as the same severity. An overclaim means
  the tool's own metadata is wrong, which is a strictly worse condition than a known gap, and
  it is the one thing on screen that a user cannot reason around. It is not a *simulation*
  error, but it is an error.
- Label text: `Data mismatch`. Never `overclaim` — that is the API's word for the direction of
  the delta, not a user-facing concept.
- **The label is never alone.** In the config panel header (§6.3), the full explanation is
  visible text, not a tooltip:

  > `This character's data claims <derived-label-of-claim> support, but the engine can only
  > simulate it at <derived-label>. Damage for this character may be wrong.`
  > followed by the `ignoredGaps` list, one line per gap: the gap's `detail` verbatim.

  `ignoredGaps[].detail` is documented as "Must be substantive, never a placeholder" and is
  rendered verbatim for the same reason §7.1 renders mechanic notes verbatim: a paraphrase can
  drop the qualifier that made it true. `kind` is a machine token and is NOT shown as copy.
- In the **result summary**, a party containing an overclaiming character escalates §7's
  existing caveat line from `state.warning` to `state.error` and changes its wording:

  > `✕ N characters in this team have inconsistent support data. Their damage may be wrong.`

  It stays **above** the Tier-1 stats, for §7's reason — it changes *this* number.

### `verdict: "underclaims"` — the quiet case

No user-facing chip. The derived (better) tier is shown, and nothing else. An underclaim means
the user is getting *more* than promised; there is no risk to disclose and no action to take.
Surfacing it would be noise and would dilute the overclaim chip, which is the one that matters.

It must still be visible to the team: it is a real data inconsistency. It belongs in the
coverage report qa already generates, not in the product UI. **This is a deliberate asymmetry,
recorded so it does not read as an oversight.**

### `verdict: "agrees"`

Nothing extra. §7's existing tier presentation, unchanged.

## 11.4 Where the disagreement chip appears

Same list as §7's tier placement, with one subtraction:

| Surface | Overclaim treatment |
|---|---|
| Browser card (§4.3) | chip beside the tier chip |
| Team slot (§1.3) | chip beside the tier chip |
| Config panel header (§6.3) | chip **plus the full sentence and the `ignoredGaps` list**, as visible text — the one place the complete explanation is guaranteed |
| Traveler form chooser (§5.4) | chip per affected form |
| Breakdown row / timeline lane header | **NOT shown.** The derived tier chip already appears there when tier ≠ full, which is the actionable signal at that grain. A second chip in a dense results row costs more than it tells. |
| Result summary | the escalated `state.error` line described above |

## 11.4a AMENDED AT SCALE (TASK #046, decision 2) — the disagreement chip is EXEMPT

§7.3 suppresses the **tier** chip when a character matches the roster baseline. That
suppression does **not** extend to the **disagreement** chip in this section, and the reason
is the same reason §7.3 suppresses the first one.

§7.3's argument is that a signal with zero variance carries no information. A disagreement
between the authored claim and the derived tier is, by construction, **high-variance**: it
fires only where the two sources conflict, which is a per-character fact and exactly the
thing a user cannot infer from the baseline statement. Suppressing it would be applying
§7.3's conclusion where §7.3's premise does not hold.

Concretely:

| Signal | At-scale rule |
|---|---|
| Tier chip | suppressed at baseline (§7.3) |
| **`verdict: "overclaims"` chip** | **always shown, everywhere §11.4 lists it.** This is the dangerous case: the character claims more support than the engine can deliver. |
| `verdict: "underclaims"` chip | shown; low-variance in principle but harmless and rare |
| `verdict: "agrees"` | nothing rendered (unchanged) |

A useful consequence today: the whole generated roster claims `PARTIAL` (`registry.ts:48`),
which is a deliberate **under**-claim — the generator sources real damage kits but declines
to claim `FULL` while passives are empty. So the derived tier may well exceed the claim for
many characters, and §11.2's ruling (the derived tier is what "tier" means) combined with
§7.3's baseline computation means the **derived** tier is what the baseline is computed
from. The claim is only ever the subject of a disagreement, never the baseline itself.

## 11.5 Accessibility — specified here, not deferred

Tier and disagreement are status information that must survive with no colour, no hover, and
no sight.

**Tier chip:**
- The short label is real text inside the chip. The glyph stays `aria-hidden` (StatusChip
  already enforces this). Colour is never the carrier.
- The chip is not an interactive element and must not receive `role="status"` — the tier is a
  standing property of the character, not an announcement. `role="status"` on 88 roster cards
  would produce an unusable live-region storm.
- In a browser card and a team slot, the tier must be part of the control's accessible name so
  a user tabbing the roster hears it without inspecting the card. Compose it into the existing
  `aria-label` (`CharacterPicker` already builds an `accessibleName`) rather than adding a
  second labelled element: `<Character>, Pyro, 5 star, Sword, special mechanic missing`.

**Overclaim chip:**
- Same rules, plus: the chip's text and the explanatory sentence are associated with the
  chip via `aria-describedby` pointing at the visible sentence element in the config panel.
  `aria-describedby` supplements the name; it does not replace visible text, and the sentence
  exists on screen regardless.
- On the browser card and slot, where only the chip appears, its label is appended to the
  control's accessible name in the same way: `…, data mismatch`.
- **Not** `role="alert"`. The condition is present on arrival, not raised in response to an
  action; `alert` would interrupt on every render.

**Result summary caveat line:**
- Lives inside the existing `aria-live="polite"` region that announces simulation completion,
  so it is read as part of "the run finished" rather than as a separate interruption. It is
  the FIRST content in that region, matching its visual position above the Tier-1 stats — a
  caveat announced after the number has already failed.

**Unverified marker:** see 11.7.

## 11.6 Tier vocabulary — one mapping, three spellings (DEFECT, must be fixed)

`SupportTier` in `src/types/index.ts` accepts SEVEN spellings (`FULL`/`PARTIAL`/`DATA_ONLY`/
`NOT_IMPLEMENTED`/`full`/`basic`/`partial`). The coverage module has its OWN three-value
`SupportTier` (`FULLY SUPPORTED`/`BASIC SUPPORT`/`SPECIAL MECHANICS NOT YET IMPLEMENTED`).
`formatSupportTier()` in `rosterModel.ts` maps a third way.

DESIGN-SYSTEM defines **three** tiers and they are authoritative for display. The UI must
present exactly three, from exactly one mapping:

| Derived tier (coverage module) | Chip label | Token | Glyph |
|---|---|---|---|
| `FULLY SUPPORTED` | `Full support` | `state.success` | `✓` |
| `BASIC SUPPORT` | `Basic support` | `state.info` | `◇` |
| `SPECIAL MECHANICS NOT YET IMPLEMENTED` | `Special mechanic missing` | `state.warning` | `⚠` |

**Latent defect:** `formatSupportTier()` maps `DATA_ONLY` and `NOT_IMPLEMENTED` to
`{ label: "Data", state: "info" }`. Both mean a mechanic is missing, which DESIGN-SYSTEM
assigns `state.warning` — such a character would render in the SAME calm blue as a
merely-basic one. VERIFIED as latent, not live: no authored character currently uses either
spelling (the data uses only `FULL`/`full`/`PARTIAL`/`partial`). It becomes live the first
time one is authored, with no test to catch it. Filed as UI REVIEW.

Its `default:` branch also returns `Full support` for an unrecognised string, and
`formatSupportTier(undefined)` likewise returns `Full support`. An unknown or absent tier
therefore renders as the STRONGEST possible claim. The safe default for an honesty signal is
the most conservative tier, never the most confident one. Filed as UI REVIEW.

Note `label: "Data"` also has no counterpart in the three-tier vocabulary above — it is a
fourth user-facing word for a concept the design system deliberately keeps to three.

Short labels used in dense contexts may shorten to `Full` / `Basic` / `Missing`, but the
CONFIG PANEL always uses the long label plus the full sentence.

## 11.7 Unverified data — the surface, specced before it is needed

Two distinct unverified conditions exist. They must not share a surface.

### (a) Engine-level mechanic gaps — ALREADY SPECCED

`UNSUPPORTED_MECHANICS` (12 entries). §7.1 governs it unchanged: one collapsed `state.info`
disclosure in the Result view, BELOW the Tier-1 stats, count derived from array length, notes
verbatim. Nothing in this task changes it.

### (b) Character data with no provenance — NEW

The live provenance audit (qa TASK #028) may find character abilities authored with no source
citation and no `UNVERIFIED` marker. **This spec does not assume the audit's result and does
not assume any count.** It specifies the surface so that whatever the audit returns, the UI
already has somewhere honest to put it.

**Grain: the ability, not the character.** A character with one uncited ability is not an
unverified character. Marking the whole character would be a second, competing tier signal
and would over-warn; marking the field is DESIGN-SYSTEM's existing `◇ Unverified` rule
("`UNVERIFIED` marks a FIELD, not a character") applied at the grain the audit produces.

**Token: `state.info`. Not `warning`.** An unverified number is not known to be wrong — it is
not known to be *right*. DESIGN-SYSTEM already assigns `state.info` to `◇ Unverified` and to
"not yet modelled"; reusing it keeps "we are unsure" visually distinct from "this is missing"
(`warning`) and "this is broken" (`error`). Escalating provenance to `warning` would flatten
three different epistemic states into one colour.

**Placement, from finest to coarsest:**

1. **Inline, beside the value** — `◇ Unverified` chip, `micro`, in the §6.6 ability instance
   table, adjacent to the specific number. The value is still shown; DESIGN-SYSTEM is explicit
   that hiding it would be the worse lie.
2. **Panel summary line** — where several values in one panel are unverified, one `state.info`
   line so a fast scanner cannot miss all of them:
   `N values in this kit have no verified source.` Count derived, never hard-coded.
3. **Config panel header** — if a character has ANY unverified ability data, one `state.info`
   chip `◇ Unverified data` beside the tier chip, with the visible sentence:
   `Some values in this kit could not be verified against a source. They are shown as authored.`
4. **Result summary** — **NOT a new line.** If the audit's outcome is broad, a per-run
   unverified banner would appear on essentially every run and become invisible within a day —
   the warning-fatigue failure §7.1 already names. Provenance stays attached to the data it
   describes, where it is encountered in context. **If the audit returns a NARROW result
   (a small, enumerable set), revisit: a result-level line becomes affordable and useful.**
   That is a re-spec trigger, recorded here so it is a decision and not a drift.

**Explicitly NOT done:**
- No greyed-out or hidden values. An unverified number is shown at full contrast with a
  marker. Dimming it would fail the text contrast floor AND imply it is less real than it is.
- No strikethrough, no asterisk-with-footnote. The marker is adjacent and readable in place.
- Unverified data does NOT change support tier. DESIGN-SYSTEM already rules this and it holds:
  tier answers "can the engine run this", provenance answers "is the input trustworthy". They
  are orthogonal and a character can be `Full support` with unverified constants.

**Accessibility:**
- `◇` is `aria-hidden`; `Unverified` is real text. Never colour-only.
- The inline marker sits inside the same table cell as the value it qualifies, so a screen
  reader in table-navigation mode reads value and marker together. It must NOT be in a
  separate column — a separate column separates the qualifier from the number it qualifies at
  exactly the moment a user is reading cell by cell.
- The panel summary line is plain text in document order, not a live region. It is present on
  arrival, not announced.
- If the marker ever becomes hoverable for the source note, that note must ALSO exist as
  expandable visible text. Tooltip is never the sole source.

## 11.8 Data required (extends §9)

| # | Need | Why | Used by |
|---|---|---|---|
| N15 | **The derived tier and the reconciliation reachable from the app layer.** `characterCoverage.ts` lives in `src/tests/`, which the product cannot import. The UI needs `{ derivedTier, verdict, ignoredGaps }` per character id through a non-test module, exposed via the simulation adapter seam (never imported directly by a component — same rule as N14). Whether that is a build-time artefact or a runtime module is an ENGINEERING call, not a design one. | §11.2–§11.4. Without it the UI can only show the claim, which is the exact failure this section exists to prevent. | §1.3, §4.3, §6.3, result summary |
| N16 | **Ability-level provenance on the character model** — per ability (or per instance) a marker that its values are unsourced, whatever shape the audit produces. Authored data, never inferred from a field looking empty. | §11.7(b). The UI must not guess which numbers are unverified. | §6.6, §6.3 |
| N17 | **`ownerByAbilityId` derivable, confirmation only.** `damage.sourceCharacterId` on timeline damage events must stay present and stable. No new field requested. | §10.5 | §10 |

N15 is **blocking** for §11.2–§11.4 as specced. Until it lands, the UI shows the CLAIM as
today and no disagreement chip — which is the current, known-incomplete state, and must not be
mistaken for this spec being implemented.

## 11.9 Product decisions the Manager should route

- **PD-1 — Is a claim/derived disagreement a build-breaking condition?** qa currently asserts
  zero overclaims across all 88 entries. If that assertion stays, an overclaim can never reach
  a user and §11.3's error chip is dead code that exists for defence in depth. If the
  assertion is relaxed, the chip becomes live. Design's position: **build the chip either
  way** — a guard that is never exercised is a guard nobody can trust, and the cost is one
  conditional. But whether the build should FAIL on an overclaim is a product/process call,
  not a design one.
- **PD-2 — `state.error` extended to a metadata defect.** §11.3 uses `state.error` for a
  condition that is not a simulation failure. This is the only place the token is stretched
  beyond "cannot run". Recorded for explicit ratification rather than assumed.
- **PD-3 — Provenance scope depends on the audit.** §11.7(b) item 4 has a stated re-spec
  trigger on a narrow audit result. Route the audit outcome back here.

---

# §12 — UI REVIEW (TASK #031)

Findings from reviewing the landed tier surfaces against DESIGN-SYSTEM. Frontend implements;
this section does not rewrite code.

```
UI REVIEW — Finding M
Issue:   `tierReason` is rendered ONLY as a `title` attribute.
Where:   src/features/team-builder/TeamSlot.tsx:112
         src/features/team-builder/CharacterPicker.tsx:412
Problem: DESIGN-SYSTEM: "tooltips are never the sole information source", and its
         support-tier section states tier is "never tooltip-only" — the full
         explanatory sentence must be reachable without hover. `title` is
         unreachable by keyboard, unreliable on touch, and inconsistently exposed
         by screen readers. This is not hypothetical: 48 of the authored entries
         claim `PARTIAL`/`partial`, so ~half the roster carries a reason that
         a keyboard or touch user can never read. This is the same defect class
         my own §1.3 contained and that TASK #009 corrected — it has recurred.
Recommendation:
         Keep `title` as a convenience, but the sentence must exist as visible
         text somewhere reachable. Per §7 that guaranteed place is the config
         panel header (§6.3), which does not exist yet. Until it does, the
         CharacterPicker card is the honest place: render the reason as visible
         `text-slate-400` `micro` text in the card body for non-`full` tiers,
         truncated to two lines with the full text in the expanded/config view.
         Do NOT solve this by lengthening the chip label.
Priority: High
```

```
UI REVIEW — Finding N
Issue:   `formatSupportTier()` defaults an unknown or absent tier to `Full support`.
Where:   src/features/team-builder/rosterModel.ts — `default:` branch and the
         `if (!tier)` early return.
Problem: An honesty signal that fails OPEN. An unrecognised or missing tier string
         renders as the strongest possible claim — precisely the plausible-but-wrong
         output the tier system exists to prevent. A typo in authored data, or a new
         tier spelling added upstream, silently promotes a character to fully
         supported.
Recommendation:
         Fail closed. An unrecognised or absent tier maps to the most conservative
         tier the vocabulary allows, with a label that says so. Additionally, prefer
         an exhaustive `switch` over a closed union with a `never` check so a new
         tier spelling is a COMPILE error rather than a silent fallthrough — the
         same property combat used for `damageTypeForActionType()`.
Priority: High
```

```
UI REVIEW — Finding O
Issue:   `DATA_ONLY` / `NOT_IMPLEMENTED` map to `state.info` with label `Data`.
Where:   src/features/team-builder/rosterModel.ts — `formatSupportTier()`.
Problem: Both spellings mean a kit mechanic is not implemented, which DESIGN-SYSTEM
         assigns `state.warning`. Rendering them `info` presents a character with a
         missing mechanic in the same calm blue as one that is merely basic. `Data`
         is also a fourth user-facing word for a three-word vocabulary.
         Currently LATENT — no authored character uses either spelling — which is
         exactly why it will not be caught until it ships.
Recommendation:
         Map both to `state.warning` / `Special mechanic missing` (short form
         `Missing`) per §11.6's table. Add a test asserting the tier->token mapping
         for EVERY member of the union, so an unmapped spelling fails.
Priority: Medium
```

```
UI REVIEW — Finding P
Issue:   Support tier is not part of the roster card's accessible name.
Where:   src/features/team-builder/CharacterPicker.tsx — `accessibleName` is built
         without the tier; the chip is separate content inside the button.
Problem: A screen-reader user arrowing the roster hears the composed name and must
         separately explore the card to discover the tier. At ~88 entries that is
         not a realistic interaction, so the honesty signal is effectively
         sighted-only.
Recommendation:
         Append the tier's short label to the existing composed accessible name
         (§11.5). Do not add a second labelled element or a live region.
Priority: Medium
```

```
UI REVIEW — Finding Q
Issue:   Duplicate-looking rows in the By Ability breakdown.
Where:   src/features/damage-breakdown/DamageBreakdown.tsx / breakdownModel.ts
Problem: Correct data, ambiguous rendering — see §10.1. `title={row.label}` repeats
         the label and disambiguates nothing.
Recommendation: Implement §10. Collision-conditional owner qualifier, resolved in
         `breakdownModel.ts` so it is testable without a DOM.
Priority: Medium
```
