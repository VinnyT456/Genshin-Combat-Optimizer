# UI-PLAN.md — what this product should feel like

> **Planning update — 2026-09-07:** the user's project overview explicitly includes
> website optimization and rotation comparison. Their inclusion no longer awaits
> the scope answer in §7 below. See [master plan](../MASTER-PLAN.md) and the
> [expanded product/UX plan](../planning/PRODUCT-UX-FEATURE-PLAN.md) for current
> flows, priorities, assumptions and evidence. This older design proposal is
> preserved for rationale; its missing-feature descriptions are not current status.

**Status: PLAN ONLY. Nothing here is implemented, and nothing here should be implemented
until the open questions in §7 are answered.**

Written 2026-09-07 against the live code, not against the specs. Where a spec and the code
disagree, this document follows the code and says so.

Companion documents: `DASHBOARD-AND-DIALOGS-041.md` and `CHARACTER-DETAIL-046.md` hold the
component-level specs. This file is the layer above them — what the product *is*, how a user
moves through it, and why the pieces sit where they do.

---

## 1. The finding that should reframe the whole UI

**`optimizeRotation()` is implemented, deterministic, performance-tested — and the UI has no
surface for it at all.** I verified: zero references to it in `src/features`, `src/app`, or
`src/components`.

This project is called a *rotation optimizer*. What it currently ships is a rotation
*simulator*: the user hand-authors a sequence and reads the damage back. The optimizer — beam
search over the legal action space, with Top-N ranked results, ~12x faster since `resumeFrom`
landed — is finished engine work sitting behind no door.

That is the single largest gap between what this product is and what it presents itself as,
and it should drive the information architecture rather than being bolted on later.

## 2. What the product actually is

Three activities, not one:

| Activity | Question the user is asking | State today |
|---|---|---|
| **Build** | "What team, weapons, artifacts, talent levels?" | Well developed — 132 characters, portraits, pickers |
| **Simulate** | "What does *this exact* rotation do?" | Complete — timeline, breakdown, energy |
| **Optimize** | "What rotation *should* I use?" | **Engine done, UI absent** |

The current `view` model — `"all" | "setup" | "results"` — encodes a two-activity product
(configure, then read). It has no room for the third, and "all" as a default means the answer
to *"what am I looking at?"* is *"everything at once."*

## 3. Proposed shape

### The spine: Build → Rotate → Results

Three named stages, always visible, always in that order, each deep-linkable (URL state is
already wired: `team`, `view`, `el`, `q`, `sort`).

- **Build** — team, per-character equipment and talent levels, enemy. This is where the
  character detail work lives.
- **Rotate** — the rotation editor, *and* the optimizer. These belong side by side because
  they answer the same question by different means: author it yourself, or ask for a
  suggestion and then edit it. The handoff **optimizer result → editable rotation** is the
  most valuable single interaction this product could have, and it costs nothing new in the
  engine — `OptimizationResult.ranked[]` already carries rotations.
- **Results** — timeline, breakdown, energy.

### Why not tabs

Tabs imply the stages are alternatives. They are a pipeline: a change in Build invalidates
Results. The UI already knows this — `resultStale` and `STALE_RESULT_NOTICE` exist. That
concept deserves to be structural rather than a notice bar: a stale Results stage should
*look* stale.

### The empty state is the tutorial

A first-time user currently lands on a preloaded National team with a preloaded rotation and
no explanation of what to press. The empty and first-run states are the highest-leverage
design surface here and should be treated as a real screen, not a placeholder — this is a
theorycrafting tool whose audience will include people who have never used one.

## 4. Honesty surfaces — the part that must not be designed away

This project's defining constraint is that **it must never present a plausible number that is
wrong**. That has cost real work to enforce and the UI is where it either holds or collapses.

Three distinct kinds of uncertainty, which must stay visually distinct:

1. **Not modelled** — 968 of 1234 constellation/passive effects. A user setting C6 must never
   see a number that is really C0. Current copy in `CharacterStatsModal` says the *text* is
   missing; the truth is that the *effect* is not modelled.
2. **Unverified value** — data neither source could confirm (cast times for all 132, particle
   yields for 18, and the 10 weapons x 20 fabricated levels rejected on a structural fact).
   `provenance.ts` makes these reachable from TypeScript; nothing renders them yet.
3. **Known-missing mechanic** — Burning's decay coefficient, simultaneous-reaction priority.
   `UNSUPPORTED_MECHANICS` carries these with reasons.

**Design rule:** a caveat that appears on every row is not a caveat, it is wallpaper. State
the roster-wide baseline **once**; surface the per-item detail only where it differs or where
the user is actually looking at that item. (This is already ruled for support tier; it
generalises.)

## 5. What the engine can surface that the UI does not

Verified against `SimulationResult` and the optimizer's public API:

- `damageByElement` — exists, unrendered.
- `structuredWarnings` — machine-readable, currently flattened into strings.
- `finalState` — post-run energy and cooldowns per character. Answers "could I actually loop
  this rotation?", which is the question every real theorycrafter asks second.
- `OptimizationResult.ranked[]` — Top-N rotations with scores. Nothing renders it.
- Per-talent-level tables (1-15) and 90-level stat curves — the data is there; the UI caps
  talent selects at 11 and has no level selector.

## 6. Structural debt to pay while redesigning

- `src/app/page.tsx` is **631 lines with ~11 `useState` hooks**. Every new feature makes this
  worse. The state belongs in a reducer or a small set of hooks *before* a third stage is
  added, not after.
- Four dialog surfaces, three sizing idioms (being addressed).
- `RunSimulationInput.team` is typed to the legacy four-slot `CharacterDefinition`, which
  carries no passives or constellations — so the UI hands the engine perkless definitions.
  This is why perk effects do not reach the engine from the UI today.

## 7. Open questions — these need answers before implementation

1. **Is the optimizer in scope for the UI now?** It changes the whole IA. If yes, "Rotate"
   becomes a two-mode stage and needs its own design pass. If no, this document's §3 collapses
   back to two stages and should be rewritten accordingly.
2. **Who is the user?** A KQM-fluent theorycrafter and a curious player want almost opposite
   defaults — density and jargon versus explanation and guardrails. Every layout decision
   below the top level depends on this and it has never been stated.
3. **Does the tool aim at build optimization too, or rotation only?** ROADMAP §D1 has build
   search designed but unimplemented. If build search is coming, the Build stage needs room
   for "optimize this" affordances that would otherwise be wasted.
4. **Mobile: real target or courtesy?** The timeline and breakdown are dense. Committing to
   mobile constrains the desktop design meaningfully; treating it as best-effort frees it.
5. **How prominent should uncertainty be?** There is a real tension between honesty and
   usability when ~78% of perks are unmodelled. Loud enough to prevent false confidence,
   quiet enough that the tool stays usable, is a product judgment rather than a design one.

## 8. Suggested sequence, once the above are answered

1. Answer §7 — particularly Q1 and Q2, which gate everything else.
2. `page.tsx` state extraction (unblocks safe work on every stage).
3. Stage spine + stale-state semantics.
4. Empty/first-run states.
5. Optimizer surface, if in scope — including the result → editable rotation handoff.
6. Honesty surfaces, per §4.
7. Long tail: `damageByElement`, `finalState` loop feasibility, talent/level selectors.

**Nothing above is committed.** It is a proposal to react to.
