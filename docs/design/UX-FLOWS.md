# UX-FLOWS.md

Owner: `uiux-engineer`. Records **decided** UX flows only — no invented page detail.

## Flow 1 — Team Builder
```
Slot → Browse (search / filter / sort) → Select → [choose Traveler form] → Configure → Continue
```
Pick up to 4 characters → configure character/build → continue to simulation setup.
Slots are positional (1–4); party order is meaningful. Exactly one character is **active**
(on-field): chosen manually before a run, derived from swap events once a result exists.
Detailed spec: COMPONENTS.md §1, §4, §5, §6.

Expanded for a ~100-character roster (Character System Phase A):

1. An empty slot's `Add` opens `CharacterPicker`; its body is `CharacterBrowser` (§4) —
   search + four multi-select filters + sort over a fixed-height card grid.
2. Every card carries its **support tier** (§7), so the user learns how well a character is
   simulated *before* selecting, not after reading a wrong number.
3. Selecting closes the dialog and returns focus to the invoking slot.
4. The **Traveler** is one entry (§5). Selecting it yields a formless slot that blocks
   `Simulate` until an element is chosen — never a silent default.
5. The slot's `Configure` opens `CharacterConfigPanel` (§6): level, ascension, constellation,
   three independent talent levels, then collapsed Tier-2 Kit / Passives / Constellations.
6. Any selection, form change, or config change **invalidates the current result** (§1.5),
   visibly and with a reason.

### Understanding-before-committing principle
The browser's job is not only "find a character" but "know what selecting it will and will not
simulate". Tier chip, per-effect `⚠ Not simulated` markers (§6.6), and the result-level caveat
(§7) are one continuous thread from selection to headline number — each is a point where a
user could otherwise form a false belief and never be corrected.

## Flow 2 — Simulation
```
Enemy → Duration → Initial State → Simulate
```
Configure enemy (level, RES) → set time window → set initial state → run
`simulateRotation()` → view result.

## Flow 3 — Optimizer
```
Constraints → Objective → Optimize → Results → Compare
```
Set constraints (cooldown/energy/window) → choose objective (total damage / DPS /
character damage) → run `optimizeRotation()` → view Top-N → compare rotations.

## Flow 4 — Timeline / Analysis
```
Rotation → Events → Damage → Buffs/Reactions → Analysis
```
From a rotation, read the per-character timeline → click an event → inspect its
damage, active buffs, reaction, energy → understand why the rotation performs.

## Flow 5 — Comparison (why A beats B)
```
Best Rotation vs Alternative → Compare → explain difference
```
Surface the drivers (reaction count, buff coverage, burst timing) that make A > B.

## Information hierarchy (applies to all result views)
- **Tier 1** (always visible): Team, Total Damage, DPS, Best Rotation, Duration.
- **Tier 2**: character damage, ability damage, reaction damage, timeline.
- **Tier 3** (on demand): buffs, energy, cooldown, individual instances, internals.

## Constraint feedback principle
Surface constraints **before** the click — e.g. `Energy 48/60 · Burst unavailable`
rather than an error after the user acts. The expanded form always carries the *reason and
the remedy*: `⚠ Burst unavailable · needs 12 more energy` / `· cooldown 4.2 s`.
Every disabled control has an adjacent visible reason. Detailed spec: COMPONENTS.md §2.4.

## Swap cost is visible time
Swapping characters costs real, configurable time (default 0.6 s) that counts toward Duration
and therefore DPS. It is rendered on the timeline as a span of proportional width bridging two
lanes, plus a permanent legend and a Tier-2 total (`3 swaps · 1.80 s swapping`). It is never
drawn as an instantaneous transition. Detailed spec: COMPONENTS.md §3.5.

## Phase 2 page order (single page)
```
h1 Genshin Rotation Optimizer
└ Team          — TeamBuilder, 4 slots            (Tier 1)
└ Setup         — enemy + rotation preview         (Tier 1/2)
└ [Simulate]    — disabled with reason when invalid
└ Result        — Total Damage · DPS · Duration (+ swaps) (Tier 1)
└ Energy        — EnergyPanel, timestamp-stamped   (Tier 2)
└ Timeline      — RotationTimeline + EventDetailPanel (Tier 2, Tier 3 collapsed)
└ Damage Breakdown                                  (Tier 2)
```
Timeline selection drives the Energy panel's scrub time and the detail panel — one selection
model, three consumers. Page width moves `max-w-5xl` → `max-w-7xl` when lanes land.

## Honesty surfaces (three grains, do not conflate)
| Marker | Grain | Where |
|---|---|---|
| Support tier | one character | everywhere that character is named |
| `◇ Unverified` | one value | inline, beside that value |
| Mechanic gap (`UNSUPPORTED_MECHANICS`) | whole engine | once, Result view, collapsed, below Tier 1 |

Detailed spec: COMPONENTS.md §7, §7.1, §7.2.

Remaining page-level detail for Flows 3 and 5: `TBD` — decided in Phase 4.
