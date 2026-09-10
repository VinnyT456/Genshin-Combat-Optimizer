# WORK-MAP.md — everything left to build

> **Superseded inventory snapshot:** the detailed, expanded task inventory now
> lives in [MASTER-PLAN.md](MASTER-PLAN.md) and its three linked domain plans.
> This 2026-09-07 snapshot predates the accepted perk wiring cycle and the Astra
> planning audit. “Complete” below describes a limited implemented subset, not
> full game accuracy; several “missing UI” statements are stale. Use the new
> plan for dispatch and PROJECT-STATUS for implementation acceptance.

**The complete task inventory for the Genshin combat optimizer / calculator.**
Companion to `ROADMAP.md` (phased plan) and `UI-PLAN.md` (product shape).
This file is the *exhaustive* list: what exists, what does not, and what each remaining item
actually costs.

Written 2026-09-07, verified against the live codebase — 265 TypeScript files, 1783 tests
passing, typecheck 0, lint 0, build compiles.

---

## 0. Read this first

Two rules govern every task below. Both were learned expensively.

**Never enter a value you cannot verify.** This project deleted and regenerated its entire
132-character roster because 659 multipliers were written from memory — 83% matched no real
game value. Every structural sanity check *passed* on that data. Structural checks are not
provenance checks.

**Agreement is not proof when two sources share an upstream.** Both sources publish weapon
rows above the 1-2 star ascension cap with the bonus silently dropped, because they mirror the
same table. Cross-verification could not see it; a structural argument caught it.

---

## 1. Status by layer

| Layer | State | Confidence |
|---|---|---|
| Engine (events, energy, cooldowns, validation) | Complete | High — mutation-tested |
| Damage pipeline | Complete, KQM-audited term by term | High |
| Reactions (aura, ICD, amplifying, transformative) | Complete | High |
| Character data (132, per-level tables, correct scaling) | Complete | High — 28,380 values cross-verified, 0 conflicts |
| Weapon data (246 weapons, base ATK + substats) | Complete | High — 41,710/41,710 replay exact |
| Optimizer (beam search, Top-N, deterministic) | Complete | High — perf-tested |
| **Weapon passives** | **0 modelled** | — |
| **Artifact data** | **31 sets, hand-authored, NO provenance header** | **Low — see 2.1** |
| **Constellation/passive effects** | 266 of 1234 modelled (all talent-level boosts) | Honest |
| **Optimizer UI** | **Does not exist** | — |
| UI (build, simulate, read) | Working, mid-refactor | Medium |

---

## 2. Data track

### 2.1 Artifact data — REGENERATE, do not extend `[CRITICAL]`

`src/game-data/artifacts/artifactsData.ts` is **31 hand-authored sets, 16.6KB, with no
provenance header and no generator**. That is precisely the shape of the fabricated-roster
incident: plausible values, no source, no way to tell right from wrong.

It has not been audited. Before *any* artifact feature is built on it, either regenerate it
through the generator (Project Amber publishes `reliquary` endpoints) or audit it the way the
character roster was audited — sample, cross-verify, extrapolate. Assume it is wrong until
shown otherwise.

Also needed: 5 slots x main-stat distributions, 4 substats, per-level main-stat values.
**No substat roll RNG** — the simulation path must stay deterministic.

### 2.2 Weapon passives as `Buff` data `[HIGH]`

246 weapons have stats; **zero have passives modelled**. Weapon passives are prose
("increases ATK by 20% for 8s after using an Elemental Skill"). Bucket them exactly as
constellations were: expressible / numerically-clear-but-inexpressible / ambiguous-prose.
Report counts. Many will need buff-vocabulary extensions — report, do not invent.

### 2.3 Artifact set bonuses as `Buff` data `[HIGH]`

Same abstraction as weapon passives and constellations. **Must reuse the declarative buff
system** — three parallel implementations of one idea is the outcome this project forbids.
Blocked on 2.1.

### 2.4 The other 968 perk effects `[MEDIUM, long tail]`

266 of 1234 modelled, all talent-level boosts. The remaining 968 split into ~622 with clear
numbers but no buff channel (healing, shields, interruption resistance, stamina, cooldown
modification, trigger-gated effects) and ~346 ambiguous prose. Each channel added to the buff
vocabulary unlocks a batch. Sequence by batch size.

### 2.5 Enemy data `[MEDIUM]`

One test enemy. Real content needs the actual bestiary: per-enemy RES profiles, levels,
Abyss/Theater configurations. Cross-verified like everything else.

---

## 3. Mechanics track

### 3.1 Reaction tick scheduler `[HIGH]` — engine-side, scoped, prerequisite known

Electro-charged is fully specified and schedulable **today**. Blocker is size, not knowledge:
EC ticks fire on an independent 1.0s clock including after the final action, while
`evaluateTriggers` only fires at hit boundaries. Needs a time-driven tick queue in the main
loop.

**Prerequisite, must ship together:** `snapshotEnemyAuras`/`restoreEnemyAuras` copy
element/gauge/since/decayRate and **drop `drains`**. Once EC attaches a drain, resume silently
loses it and the resumed run decays slower than the original.

**Burning stays unscheduled.** KQM retired the pre-3.0 summed-rate claim and published no
replacement. Do not invent a coefficient.

### 3.2 Remaining buff-vocabulary channels `[MEDIUM]`

Healing, shields, interruption resistance, stamina, cooldown modification, trigger-gated
conditions (on-hit, field uptime, stack counts, pickups). Each unlocks a slice of 2.4.

### 3.3 Multi-target `[MEDIUM]`

The aura model supports per-target; the engine is single-target, so Swirl cannot spread. Real
theorycrafting is often multi-target.

### 3.4 The 15 tracked unverified mechanics `[LOW, ongoing]`

`unverified.ts` carries 15 entries with reasons. Some are closable with better sources; at
least one (`simultaneous-reaction-priority`) is *deliberately* permanent — KQM declines to
publish an order, and our fixed element order is a deterministic convention, not a
game-matching rule. **That one must stay open.**

---

## 4. Engine track

| # | Task | Priority | Note |
|---|---|---|---|
| 4.1 | Snapshot `drains` (see 3.1) | HIGH | Ships with the tick scheduler |
| 4.2 | Channel reconciliation | HIGH | Presentation table vs engine channel — same 259 perks, identical id sets. Gates the UI's `PERK_EFFECTS_REACH_ENGINE` flip |
| 4.3 | Four stale comments in `buffs/` | MEDIUM | `UNWIRED_TALENT_LEVEL_NOTE` is an **exported const** — renderable in UI, so it could show a user a false statement |
| 4.4 | Snapshot semantics for multi-hit DoT | LOW | Both modes expressible, only `dynamic` implemented; indistinguishable until DoT lands |

---

## 5. Optimizer track — THE NAMESAKE FEATURE

**The search algorithm is BUILT and working.** This is not a thing to design; it is a thing to
expose. Verified in `src/simulation/optimizer/`:

- **Beam search** over the legal action space. Generate candidate actions -> simulate each ->
  score -> sort -> dedupe by transposition key -> truncate to `beamWidth` -> repeat. A
  completed-node pool feeds Top-N extraction.
- **Legality comes from the engine itself** (`validateAction()`), so the search cannot emit a
  rotation the engine would refuse. Proven by an independent-replay test.
- **`OptimizerConfig`**: `beamWidth` (candidates retained per depth), `simulationDuration`
  (combat window), `objective`, `topN`.
- **Returns `RankedRotation[]`** — each with the rotation, its full `SimulationResult`, and a
  score, ties broken deterministically.
- **Deterministic**: byte-identical results for identical inputs, total and stable ranking, no
  `Object.entries` order leaking through. This is why the whole project bans RNG in the
  simulation path.
- **Transposition keying** quantizes floats (`quantizeGauge`, `MEMO_KEY_DECIMAL_PLACES`) so
  equivalent states do not hash apart and get discarded from the beam.
- **Candidate admission is a REPAIR policy**, not accept-or-reject: an action-level warning
  means the engine DROPPED that action, so the candidate is repaired rather than the whole
  prefix being thrown away.
- **Performance-tested**: `resumeFrom` took worst case from 422 to 34.5 us/node at depth 80,
  roughly 12x. Growth is guarded by a COUNTING assertion (not wall-clock), so it survives
  concurrent load.

**What is missing is only the door.** Zero references to `optimizeRotation` exist in
`src/features`, `src/app`, or `src/components`. A user cannot reach any of the above.

### 5.0 What "optimal combat combo" should mean in the UI

The user picks a team and a combat window; the search returns the best action sequences it can
find. Design questions that need answering (see also `UI-PLAN.md`):

- **Objective choice.** Total damage is the default, but time-to-kill, damage-per-field-second,
  and energy-feasible-loop are all legitimate and mean different things. Exposing the objective
  is what makes the tool a theorycrafting instrument rather than a number generator.
- **Search budget as a user control.** `beamWidth` trades runtime for quality. A user should
  feel that trade (fast/balanced/thorough), not read a number.
- **Top-N, not top-1.** Returning several ranked rotations respects that the highest-damage
  line may be unplayable. This already exists in the engine.
- **Result -> editable rotation.** The single most valuable interaction available: take a
  suggestion, then hand-edit it. `RankedRotation.rotation` already carries what is needed.
- **Explainability.** A ranked list without reasons is hard to trust. Even minimal framing
  ("this line lands 2 more bursts in the window") changes the product from oracle to tool.
- **Greedy, not exhaustive.** Beam search gives no optimality guarantee, and a wider beam is
  only weakly monotone in quality. The UI must not promise "the best rotation" — it should say
  what it actually did.



| # | Task | Priority | Note |
|---|---|---|---|
| 5.1 | **Optimizer UI surface** | **CRITICAL** | Engine complete (see above), zero UI references. The namesake feature is unreachable. Includes objective picker, search-budget control, Top-N list, and result->editable-rotation handoff |
| 5.2 | Build search implementation | MEDIUM | Designed, not built. Blocked on artifact data (2.1) |
| 5.3 | Objectives beyond total damage | MEDIUM | Per-target, time-to-kill, energy feasibility |
| 5.4 | Web Worker offload | MEDIUM | Search blocks the main thread; the declarative-data discipline exists partly to keep buffs serialisable |
| 5.5 | Explainability | LOW | "Why is this rotation better?" — a ranked list without reasons is hard to trust |

---

## 6. UI track

See `UI-PLAN.md` for shape and rationale. Tasks:

| # | Task | Priority | Note |
|---|---|---|---|
| 6.1 | `page.tsx` state extraction | **HIGH, do first** | 631 lines, ~11 `useState`. Every new feature makes it worse |
| 6.2 | Optimizer surface + result→editable-rotation handoff | CRITICAL | The highest-value interaction available; costs nothing new in the engine |
| 6.3 | Stage spine (Build → Rotate → Results) + stale semantics | HIGH | `resultStale` exists as a notice; should be structural |
| 6.4 | Empty / first-run states | HIGH | Currently a preloaded team with no explanation |
| 6.5 | Honesty surfaces | HIGH | Three distinct uncertainty kinds must stay distinct |
| 6.6 | Adapter team-type widening | HIGH | `RunSimulationInput.team` is the legacy 4-slot shape carrying no perks |
| 6.7 | Equipment UI wiring | HIGH | `WeaponPicker`/`ArtifactPicker` exist; the stat path is the question |
| 6.8 | Character detail completion | MEDIUM | Talent selects cap at 11 (data holds 15); no level selector (curves hold 90) |
| 6.9 | Unrendered engine output | MEDIUM | `damageByElement`, `finalState` loop feasibility, `structuredWarnings` |
| 6.10 | Rotation comparison | MEDIUM | A/B two rotations — core theorycrafting workflow |
| 6.11 | Mobile | OPEN | Depends on §7 Q4 |

---

## 7. Cross-cutting

| # | Task | Priority | Note |
|---|---|---|---|
| 7.1 | **`git init` + first commit** | **CRITICAL** | **The repo has NO commits.** Every deletion is unrecoverable; an agent already lost another's file permanently. This is the cheapest highest-value task on the list |
| 7.2 | Persistence / saved builds | HIGH | Nothing survives a refresh beyond URL state |
| 7.3 | Import from an account | MEDIUM | Enka.network is the usual path — would remove most manual build entry |
| 7.4 | Export / share | MEDIUM | URL state is wired; a shareable permalink is nearly free |
| 7.5 | i18n completion | MEDIUM | Product is `zh-CN`; `tierReason` translates 0 of 132 pending `reasonCode` |
| 7.6 | Performance under real data | MEDIUM | Weapons file is 1.5MB; bundle and search cost need measuring |
| 7.7 | Deployment | HIGH | No pipeline, no hosting, no CI |
| 7.8 | CI gates | HIGH | Gates are run by hand today |

---

## 8. Suggested order

**Now, cheap, unblocks everything:**
1. `git init` (7.1) — nothing else is safe until deletions are recoverable
2. `page.tsx` state extraction (6.1)
3. Channel reconciliation (4.2) + adapter widening (6.6) — unblocks perks reaching the UI

**The product-defining move:**
4. Optimizer UI (5.1, 6.2) with the stage spine (6.3) and empty states (6.4)

**Make the numbers real:**
5. Artifact data audit/regeneration (2.1) — assume wrong until shown otherwise
6. Weapon passives (2.2), then artifact set bonuses (2.3)
7. Equipment UI (6.7)

**Depth:**
8. Reaction tick scheduler + snapshot drains (3.1, 4.1)
9. Buff-vocabulary channels (3.2) → perk batches (2.4)
10. Multi-target (3.3), build search (5.2), Worker offload (5.4)

**Ship:**
11. CI + deployment (7.7, 7.8), persistence (7.2), import/export (7.3, 7.4)

---

## 9. Open questions blocking scope

1. **Is the optimizer UI in scope now?** Reframes the entire IA.
2. **Who is the user?** KQM-fluent theorycrafter vs curious player — opposite defaults.
3. **Build optimization, or rotation only?**
4. **Mobile: real target or best-effort?**
5. **How prominent should uncertainty be**, given ~78% of perks are unmodelled?
6. **Is this shipping publicly?** Decides CI, hosting, licensing, and rate-limit etiquette
   toward the datamine APIs.
