# PROJECT-STATUS.md

## Astra planning expansion — 2026-09-07

The user requested an extensive plan, including new features, using Astra.
Three `gpt-6-astra` planners were assigned separate document ownership for engine/
optimizer, product/UX, and data/platform/quality. The manager integrates these in
[MASTER-PLAN.md](MASTER-PLAN.md); ROADMAP, WORK-MAP and UI-PLAN point to it.

Planning deliverables: master milestones M0–M8 and a manager dispatch shortlist;
43 ENG/MECH/OPT packages; 28 DATA/PLAT/QA packages with eight dispatch briefs;
106 UX packages with user flows and state/validation matrices. These 177 packages
include coordinated responsibilities for shared deliverables, not 177 isolated
implementations. Optional scope and source-blocked work are explicitly separated.
Document checks confirm unique task IDs within the inventories and valid local
Markdown links. Engine-plan review corrected an already-implemented plunge task
and preserved the prior condition-language decision; platform phases map to the
master so full export/persistence does not block the first worker/search release.

The planning expansion itself is documentation only. A follow-up implementation
cycle is recorded below separately; its accepted code and validation claims are
limited to the files and tests named there.

Planning review raised priority for actual source-withholding enforcement in the
character emitter, source-version cache isolation, live weapon registry/bonus
channel audits and evidence-bound tactical insights. These are code-review
findings to reproduce and fix in scoped implementation work, not a claim that
all existing generated values are incorrect. Exact evidence and acceptance
criteria are in the linked domain plans.

## Current orchestration — 2026-09-08

This section supersedes the historical status entries below. They are retained
as an audit trail, not a current dispatch queue.

The Astra follow-up roadmap is captured in
[ASTRA-ROADMAP-EXPANSION-096.md](planning/ASTRA-ROADMAP-EXPANSION-096.md). It
adds prioritized engine, evidence, optimizer, UX, persistence and QA gaps plus
TASK #097–#106 dispatch briefs. These remain planned until a worker reports
acceptance and validation.

### Optimizer/search UI implementation cycle

The product owner explicitly requested Luna implementation agents and a Sol
UI/UX planner. The Sol role was used for the UI/UX specification only; the
production code was implemented by Luna frontend work. No worker was allowed to
claim real cancellation or live progress while the adapter remains synchronous.

| Task | Owner/model | Scope | State |
|---|---|---|---|
| #063 | optimizer-engineer / gpt-5.6-luna | Add deterministic optimizer result metadata: stable candidate IDs, rank/tie-break keys, objective, budget, depth and stop reason | Accepted |
| #064 | uiux-engineer / gpt-5.6-sol | Trustworthy rotation-search workflow specification, Chinese copy, immutable request identity, accessibility and Worker/job acceptance criteria | Accepted |
| #065/#068 | frontend-engineer / gpt-5.6-luna | Implement the bounded search presentation/state slice, stale-run token guard, honest disclosures, duration validation and reversible candidate adoption; correct optimality wording | Accepted as partial Worker slice |
| #066 | qa / gpt-5.6-luna | Reconcile adversarial tests with the frozen public contracts without weakening assertions | Accepted |
| #067 | engine cleanup / gpt-5.6-luna | Minimal `prefer-const` lint correction in reaction tick scheduling | Accepted |

**Validation:** strict typecheck passed; **2,191 tests across 122 files passed**;
production build passed; lint passed with two existing unused-variable warnings
in `src/game-data/artifacts/setBonusBuffs.test.ts`. `git diff --check` passed.

The shipped UI slice is intentionally bounded: it runs the current optimizer
through the synchronous adapter and explicitly discloses that Worker-backed
cancellation, live progress events, queued/canceling lifecycle, immutable
visible request summaries and full stale-result state are still required for the
complete TASK #064 acceptance. Those follow-up seams are tracked in
`OPT-008`/`PLAT-004` and the [optimizer UI specification](design/OPTIMIZER-UI-064.md).

No deployment, external account action or git commit was performed. Existing
reaction, artifact and data work in the dirty worktree was preserved.

### Multi-page redesign and evidence hardening — 2026-09-08

The product owner requested a multi-page interface inspired by the supplied
A.J.A.X. tracker and KeqingMains. Sol produced the implementation-ready
[multi-page product specification](design/MULTI-PAGE-PRODUCT-073.md), covering
the dashboard, team/build, rotation, optimizer, analysis, library, history and
coverage information architecture. The specification keeps Chinese as the
primary product language, requires explicit capability and provenance states,
and preserves the existing simulation contracts.

| Task | Owner/model | Scope | State |
|---|---|---|---|
| #073 | uiux-engineer / gpt-5.6-sol | Multi-page IA, shell, route states, responsive/accessibility rules and handoff | Accepted |
| #074/#081 | frontend-engineer / gpt-5.6-luna | Route shell, dashboard at `/`, `/workspace` workbench, `/analysis`, query-preserving navigation, complete run/search identity fingerprints | Accepted |
| #077 | frontend-engineer / gpt-5.6-luna | Artifact picker sorting and semantic controls; C0–C6 constellation coverage display | Accepted |
| #078/#082 | localization / gpt-5.6-luna | Chinese-first UI sweep, including level/talent labels and enemy/ability surfaces | Accepted |
| #072 | data-source-guard / gpt-5.6-luna | Fail-closed character publication when verifier evidence is missing or conflicting | Accepted |
| #073 (transport) | optimizer-worker / gpt-5.6-luna | Serializable search request identity, lifecycle seam, stale-response checks and replay metadata | Accepted as local transport slice |
| #075 | weapon-registry / gpt-5.6-luna | Verified generated weapon values in the live registry and provenance-safe fallback behavior | Accepted |
| #079/#080 | reviewer + browser debugger | Diff review and route smoke evidence | Completed; findings fixed in #081 |

The frontend routes now provide a dashboard launchpad at `/`, a preserved
stateful workbench at `/workspace`, workflow routes for team, rotation,
analysis, optimizer and library, plus a compatibility `/simulation` route.
URL query state is carried across route links, and a versioned session draft
snapshot preserves the editable team/build, enemy, rotation, simulation
settings and search controls across route unmounts. Computed results remain
bound to immutable input fingerprints. Character and config fingerprints now
include damage-changing stats, progression, equipment and buffs. The search
fingerprint includes the full team build and scenario, so edited builds mark
older candidates stale.

Artifact sets now expose verified icon IDs with Lunaris primary and Yatta
fallback sources. The picker uses shared sorting/filtering and semantic,
keyboard-accessible equip controls. Character progression surfaces C0–C6 rows,
unlocked state and simulated-versus-described-only coverage. Generated passive
rows use the same support truth table, ascension unlock metadata and
Chinese-only absence states; source English names and prose never appear in
the product UI. Visible level and talent labels use Chinese; standard
technical acronyms and keyboard names stay as technical UI terms. Mobile
navigation uses a focus-contained sheet with inert background content,
Escape/backdrop close and trigger-focus restoration.

The character emitter withholds an entire ability when any executable multiplier
lacks verifier evidence or has a source conflict, while retaining coordinate
diagnostics in the unverified block. The live weapon registry likewise fails
closed when generated combat rows are absent and preserves legacy metadata only
for labels/icons/passive prose. The optimizer transport remains explicitly
local and synchronous; Worker execution, live progress and true cancellation
are still capability-gated follow-up work.

**Validation:** full Vitest suite passed **2,202 tests across 127 files**;
strict typecheck passed; production build passed for 12 routes; lint passed
with two pre-existing unused-variable warnings in
`src/game-data/artifacts/setBonusBuffs.test.ts`; `git diff --check` passed.
Browser smoke testing found no runtime console errors. Mobile viewport and
200% zoom remain unverified by the available browser surface.

No deployment, external account action or git commit was performed. Existing
dirty reaction, artifact, data and optimizer work was preserved.

### Follow-up hardening cycle — 2026-09-08

Manager dispatched Luna workers against review findings and the Astra annex.

| Task | Owner/model | Scope | State |
|---|---|---|---|
| #093 | frontend-engineer / gpt-5.6-luna | Mobile inert scope and post-draft equipment hydration | Accepted |
| #094 | frontend/team-builder / gpt-5.6-luna | Chinese-only constellation and passive absence states | Accepted |
| #095/#110 | frontend/team-builder / gpt-5.6-luna | Artifact and weapon effect disclosure; lint-safe display-only contract | Accepted |
| #098/#111 | game-data / gpt-5.6-luna | Generated weapon combat-field provenance and fail-closed legacy join | Accepted |
| #108 | frontend/layout / gpt-5.6-luna | Inert every background sibling for Home and AppShell mobile sheets | Accepted |
| #112/#115 | frontend / gpt-5.6-luna | Chinese ability labels, hit labels and evidence-bound tactical insight copy | Accepted |
| #113/#119 | frontend/timeline / gpt-5.6-luna | Chinese timeline, event, breakdown and unknown-character fallbacks | Accepted |
| #114/#116 | frontend/localization / gpt-5.6-luna | Fail-closed weapon passive translation and lint cleanup | Accepted |
| #118 | frontend/localization / gpt-5.6-luna | Unknown action and orphaned-character Chinese fallback labels | Accepted |
| #120 | combat-engineer / gpt-5.6-luna | Serialize and restore pending Electro-Charged tick queue state | Accepted |
| #121 | reviewer / gpt-5.6-terra | Final gate review of integration, provenance, localization and replay state | Approved |

Artifact set bonuses and weapon passive prose now show their Chinese source
wording together with separate runtime status. Conditional rows that have an
engine path display `已接入模拟（条件效果）`; source verification metadata is
kept independent. Weapon base ATK and substats remain simulated through
selected character stats.
The mobile sheet keeps its dialog interactive while inerting all background
siblings, including AppShell header links. Character progression, timeline,
breakdown, search and insight surfaces no longer render raw English ability or
event prose; unknown values use Chinese absence labels. Energy-loop, reaction and
tempo insights state only what emitted evidence proves. Pending time-driven
reaction ticks now survive a split/resume checkpoint with captured attribution,
pricing inputs and deterministic sequence state.

**Latest validation:** full Vitest suite passed **2,219 tests across 132 files**;
strict typecheck passed; production build passed for 12 routes on a sequential
rerun; lint passed with only two pre-existing unused-variable warnings in
`src/game-data/artifacts/setBonusBuffs.test.ts`; character emitter unittest
passed (3 tests); `git diff --check` passed. Terra final review found no
blocking findings. Browser mobile and 200% zoom evidence remain unverified.

No deployment, external account action or git commit was performed.

### Remaining artifact lifecycle effects — 2026-09-09

Unfinished artifact rows now have runtime records. Character-side resistance,
shield strength and aura-duration channels are exposed through the buff
resolver. Equipment state effects cover Gambler cooldown reset on defeat, Exile
timed party energy, Scholar particle energy, Adventurer/Lucky Dog pickup
healing, Traveling Doctor burst healing and Scroll Nightsoul Burst energy. The
engine emits deterministic pickup, healing and resource events, schedules timed
effects, applies cooldown reset after cast bookkeeping, and carries the new
state through the snapshot seam. Legacy one-piece Prayers sets use a runtime
one-piece tier and render in the picker. Runtime labels show
`已接入模拟（条件效果）` for generated unimplemented rows that reach a runtime
channel; source support flags remain provenance metadata.

Validation: full Vitest suite passed **2,496 tests across 150 files**; strict
typecheck and lint pass. No deployment or git commit performed.

### Damage-changing build inputs — 2026-09-09

The product owner requested three parallel Luna implementation tasks for
artifact, talent and constellation damage support. The existing engine seams
were completed and verified end to end through the website adapter.

| Task | Owner/model | Scope | State |
|---|---|---|---|
| #122 | artifact/equipment / gpt-5.6-luna | Carry character-keyed weapon refinement and artifact piece selections into `SimulationConfig`; persist selections; gate modelled set tiers; add adapter and DOM coverage | Accepted |
| #123 | talent / gpt-5.6-luna | Resolve talent multiplier and cooldown tables at configured and boosted levels; fail closed on missing or invalid tables | Accepted |
| #124 | constellation/perk / gpt-5.6-luna | Verify C0–C6 gating, self/party target scope and direct constellation stat buffs through the combat engine | Accepted |

The page now owns equipment selections and passes them to `runSimulation()`.
Selections are keyed by character id, retain refinement and artifact piece
count, survive session reload, and enter run fingerprints so changed gear marks
old results stale. The adapter emits synthetic zero-stat artifact pieces only
for set-tier counting; generated data has no verified main or substats, so no
invented artifact stats enter damage values. Modelled weapon and set buffs flow
through the same mechanics resolver as passives and constellations. Unsupported
or unknown effects fail closed and remain disclosed in Chinese UI copy.

Talent levels select sourced per-level multiplier and cooldown rows. A
constellation talent-level boost resolves once per cast, clamps the resulting
level to the published table range, and cannot be double-applied by the UI.
Unlocked constellation buffs preserve their authored target scope; C0 excludes
all C1–C6 rows, and self-scoped buffs do not leak to teammates.

**Validation:** full Vitest suite passed **2,465 tests across 146 files**;
strict typecheck passed after the production build regenerated `.next` types;
production build passed; lint passed with no warnings or errors; character
emitter unittest passed (3 tests); `git diff --check` passed. Focused adapter,
talent, constellation and DOM suites passed 118 tests.

### Complete artifact effect runtime — 2026-09-09

Added `completeSetBonusBuffs.ts` as a separate runtime compiler so the website
equipment path can consume deterministic damage-relevant set effects beyond the
original 46 modelled two-piece rows. The compiler covers sourced four-piece
damage bonuses, reaction bonuses, elemental/aura gates, enemy HP thresholds,
weapon restrictions, shield/character HP gates, party buffs, DEF/RES shred and
Emblem-style ER conversion. It reuses the existing `Buff` resolver. Every
generated set now has a runtime record, and every damage-bearing effect that fits
the current stat/reaction vocabulary contributes to simulation. Echoes of an
Offering uses an explicit expected-value additive-damage conversion so the
deterministic engine does not sample its proc. Healing-focused 2pc tiers use
tier-specific deterministic healing effects; Ocean-Hued Clam and Song of Days
Past still add their sourced damage through `healingEvents`. Pickup, cooldown,
energy, stamina, resistance-only, shield-generation and unreconciled lunar
lifecycle effects remain visible but inert until their state exists, preventing
unsupported triggers from becoming permanent damage buffs.

The adapter carries the conservative generated set record for compatibility and
adds the complete runtime record in a separate `runtimeSetBonuses` channel.
All equipment selections therefore retain their existing fingerprint shape
while four-piece effects reach execution. The picker shows separate source and
runtime support labels, so conditional effects report when they are compiled
for simulation. `BuffCondition` now supports enemy aura, HP, shield and
weapon-type predicates; optional enemy and character HP state is carried through
snapshots for threshold evaluation.

Latest validation: full Vitest suite passes **2,483 tests across 148 files**;
strict typecheck and lint pass. Focused artifact, healing, conversion and
equipment adapter suites pass.

No deployment, external account action or git commit was performed.

### Artifact runtime harvest audit — 2026-09-09

An integration audit now walks every generated artifact tier through the actual
equipment harvesters. The checked-in generated catalog has **122 rows across 63
sets** (46 source-modelled and 76 source-unimplemented; the task brief said
119, which does not match the generated source). Every row reaches at least one
executable seam: a `Buff`, a healing effect, or an `ArtifactStateEffect`; no
generated tier is silently dropped by the runtime registry or tier gate.

The audit does not promote source support flags. Remaining limitations are
explicit and intentional: character self-resistance, shield-strength and
shield-state predicates remain defensive-only channels; pickup, energy,
cooldown-reset and healing effects require their declared events; attack-speed,
stamina, incoming-healing, and full Nightsoul/lunar lifecycle rules remain
outside the engine; and several conditional bonuses use the engine's available
state approximation rather than claiming complete game-state fidelity. Artifact
main-stat/substat value tables remain unavailable from the verified sources, so
the picker continues to use zero-stat synthetic pieces solely for tier counting.

Validation: the new direct-harvest audit passed for all 122 rows, alongside the
focused artifact/compiler, support-presentation, resource-trigger and healing
suites. No generated values or core engine files were changed.

### Conditional artifact trigger integration — 2026-09-09

The remaining executable conditional rows now use the same serialized resource
state that character mechanics use. Martial Artist, Instructor, Heart of Depth,
Noblesse Oblige, Tenacity of the Millelith, Pale Flame and Shimenawa create
short-lived source resources on their authored trigger; their Buff rows read
those resources with the existing owner and target gates. Trigger activation is
after the triggering cast, so a burst or skill cannot consume its own new buff.
Reaction triggers recognize amplifying, additive and transformative outcomes.
Resource values and pending artifact events remain in `SimulationSnapshot`, so
split/resume runs preserve conditional uptime. Equipment harvesting attaches
the wearer id to every artifact Buff, preventing party-scoped source conditions
from failing closed or leaking to another character.

The support presentation now has a regression proving every published artifact
tier has an executable stat path or an explicit state/healing path. Source
provenance still distinguishes generated rows marked unimplemented from the
runtime label `已接入模拟（条件效果）`; this keeps data verification status
separate from execution coverage. Shimenawa's energy-consumption gate is now
enforced at skill cast and emits its energy event when the 15-energy threshold
is met.

Validation: focused artifact, resource-trigger, healing, support-presentation
and equipment suites pass; strict typecheck and `git diff --check` pass.

### Artifact state completion — 2026-09-09

The remaining stack based sets now use the same serializable resource channel:
Husk of Opulent Dreams gains Geo hit stacks (up to four), Nymph's Dream maps
its 1/2/3 stack thresholds to ATK and Hydro DMG, and Long Night's Oath grants
the correct plunge-only 15% per stack window with its charged/skill gain
values. Crimson Witch, Pale Flame, Bloodstained Chivalry, Desert Pavilion,
Flower of Paradise Lost, Nighttime Whispers and A Day Carved from Rising Winds
now use skill, defeat, reaction or hit triggers for their conditional bonuses.
Vourukasha's Glow, Marechaussee Hunter, Vermillion Hereafter and Fragment of
Harmonic Whimsy expose explicit event keyed resources for damage taken, HP
changes, HP decreases and Bond of Life changes. These effects stay
inactive until the corresponding event is supplied, so a missing scenario
input cannot silently grant permanent uptime.

`ArtifactStateEffect` now accepts `resourceEvent` triggers with an
`eventResourceId`, plus optional element gates for hit triggers. Healing events
emit an `hpChange` trigger for the healed character; callers that model HP loss,
Bond of Life or incoming damage can provide matching `resourceEvents`. Resource
values remain snapshot/resume safe and all trigger transitions appear in the
timeline.

Validation: artifact compiler, runtime harvest audit, support presentation,
resource lifecycle and healing suites pass (all generated tiers reach an
executable seam); strict typecheck and `git diff --check` pass. Exact game
timers for attack speed, stamina, shield creation, Nightsoul/Moonsign and
pickup-world simulation remain outside the current engine.

### Previous accepted cycle — 2026-09-07

User requested manager-led planning/UIUX and explicitly authorized Sol workers
for this cycle. Three Sol agents were assigned with separate ownership:

| Task (this cycle) | Owner | Scope | State |
|---|---|---|---|
| #056 | combat/mechanics integration | Prove presentation talent boosts match engine buffs; correct stale wiring comments | Accepted |
| #057 | frontend | Preserve generic kits/builds through website simulation; accurate perk disclosure and keyboard selection | Accepted |
| #058 | QA | Baseline, independent integration review, roadmap reconciliation | Accepted |
| Planning/UIUX | manager | This status, roadmap, architecture, `design/PERK-WIRING-2026-09-07.md` | Completed for this cycle |

Baseline independently verified: **1783 tests / 102 files**, typecheck and lint
pass. `next lint` is deprecated but works with the installed version.

Priority is completing the website constellation connection, not introducing new
mechanics. All 259 talent-boost rows reconcile to engine buffs. Seven additional
`modelled` perks have no proven engine connection and must not be promoted by a
global gate. Acceptance also requires a configured website team to reach the
engine with selected constellations and equipment intact.

**Cycle result:** website roster now retains a lossless generic definition beside
its legacy display projection. The simulation adapter overlays current stats,
level, talents and constellation before execution. Only the reconciled talent
channel is presented as connected; unsupported effects retain their caveats.
Unlocked and supported states are distinct. Keyboard arrows/Home/End work, and
mobile radios wrap into four columns with minimum 44×44px targets.

**Validation:** frontend full gate passed **1791 tests / 104 files**, typecheck,
lint and production build. Independent QA accepted the implementation after
65 focused tests and caller-path review. Following the manager's mobile target
correction, typecheck and 45 relevant tests passed. Final edits were comments
and documentation only. Root verified desktop/mobile rendering, Home selection,
Left wraparound, focus and locked/unlocked text in the running browser. Exact
200% zoom remains unverified because the browser key API rejected zoom shortcuts.

Next scoped work: time-driven reaction ticks with snapshot drain preservation;
artifact equipment integration; additional sourced effects. No new game values
were authored and no deployment or git commit was performed in this cycle.

Roadmap audit found A3/A4/A5, B1/B2, C1/C3/C4/C5 and performance budget tests
already present. B4's production energy mirror is gone, but a legacy type and
optimizer compatibility adapter remain. Do not redispatch historical finished
tasks based on the old entries below.

Maintained by `manager`. Update on every orchestration cycle.

**Current phase:** M1 Reachable optimizer — synchronous search presentation slice
landed; Worker-backed job lifecycle remains the next implementation gate.
**Last updated:** 2026-09-09
**Team:** 7 agents — manager, combat-engineer, mechanics-engineer, optimizer-engineer, uiux-engineer, frontend-engineer, qa-engineer.

## Base-stat precedence — RULED (manager, 2026-09-03)

`Stats.base` WINS; the id-keyed `baseStats` map in `makeBuffResolver` is a demoted FALLBACK.

I relayed combat-engineer's proposed `baseStats[id] ?? base.base` to mechanics-engineer without
checking its direction. **That precedence was backwards, and mechanics corrected it.** Their
argument is decisive: `stats.base` travels WITH the bag being folded, so by construction it is
the base of that bag; the map is keyed by character id alone and cannot see which bag it is
applied to, so it goes stale the moment gear, weapon or stance changes the bag it was written
for. When the two disagree the stale one is ALWAYS the map — so map-wins would let a stale entry
silently rescale every percentage modifier. My relay was uncritical; the fix is theirs.

Implemented as a named, documented, separately-tested `resolveBaseValues()` rather than an inline
`??` at three call sites, so the rule is one thing to find and change. Mutation-verified:
ignoring `Stats.base` fails 9 tests; inverting precedence to map-wins fails 4.

The explicit map is KEPT (not deleted): redundant on the engine path, which always routes through
`statsWithBase`, but `BuffResolver` is a PUBLIC seam and qa-owned tests legitimately pass base-less
`Stats` literals plus a map. Skip-and-report is likewise kept and pinned by a test — unreachable
via `simulateRotation`, but reachable through the public API since `Stats.base` is optional.

Mechanics also reported an EQUIVALENT MUTANT honestly rather than claiming coverage: per-channel
merge vs all-or-nothing is observationally identical today because `BaseStats` requires all three
channels. They pinned the PRECONDITION with a `@ts-expect-error` guard, so if `BaseStats` ever
becomes partial the directive goes unused and typecheck fails, forcing the question to be revisited.

## SESSION STATE — 2026-09-03, three agents killed by spend limit (resets 8:20pm ET)

Repo verified HEALTHY after the deaths: typecheck 0 errors, lint clean, **1242/1242 tests, 69
files**, build compiles. Nothing needs reverting. `/compact` also failed on the same limit, so
this section is the durable handoff.

### TASK #032 data regeneration — MOSTLY LANDED, needs finishing
- `scripts/generate-characters/{fetch.py,emit.py}` — a real GENERATOR, as required (not hand entry).
- `src/game-data/characters/generated/{pyro,hydro,electro,cryo,anemo,dendro,geo}.ts` emitted.
- **It solved the lunaris version segment I could not**: `https://api.lunaris.moe/data/{version}/en/char/{id}.json` at version 7.0.54.
- Provenance header present and correct: Project Amber primary, Lunaris verifier, fetch timestamp.
  **Values the two sources disagreed on are NOT emitted**; unpublished rows go to an UNVERIFIED block.
  That is exactly the standard the user demanded.
- **Manager spot-check PASSED**: Bennett N1 emits the full 15-level table with `0.8806` at index 10 —
  the audit's known-good L10 value in its correct position. Real datamined tables, not scalars.
- **NOT YET DONE**: the generated files are NOT wired into the registry (`src/game-data/index.ts` /
  `characters/registry.ts` do not reference `generated/`). The OLD fabricated files are still live.
  Cutover + deleting the fabricated originals is the remaining work.

### TASK #033 frontend UI — PARTIAL
Landed: `CharacterStatsModal.tsx`, `WeaponPicker.tsx`, `weaponModel.ts`, `resonance.ts` + tests,
`rosterModel` expanded. Died at "update buildBreakdownTables to wire it all together".
NOT done: character images (verified CDNs: `https://api.lunaris.moe/data/assets/avataricon/UI_AvatarIcon_{Name}.webp`
200 image/webp ~17KB, fallback `https://gi.yatta.moe/assets/UI/UI_AvatarIcon_{Name}.png`);
`next.config.mjs` still has NO `images.remotePatterns` (required for `next/image` on remote hosts);
§10 duplicate-row disambiguation; `:reaction` breakdown keys; Findings M-Q incl. the `tierReason`
title-only defect at `TeamSlot.tsx:112` / `CharacterPicker.tsx:412`.

### TASK #034 uiux audit — LOST
Died verifying a `text-black/80` contrast claim in `TimelineLane`. No findings written. Re-run.
Skills CONFIRMED INSTALLED: `impeccable`, `web-design-guidelines` (both at `~/.claude/skills/`).
`uiux-max` / `ui-ux-pro-max` do NOT exist on this machine — do not attempt them.

## CRITICAL — character data is fabricated (TASK #028 audit, 2026-09-03)

`src/game-data/characters/*.ts` (92 characters, 659 multipliers) landed WITHOUT a handoff while
agents were being killed by spend limits. qa audited every value automatically — a census, not a
sample — and the Manager independently confirmed the two strongest findings.

**VERDICT: the numbers are written from memory, not sourced. Regenerate; do not patch.**

- **83% of 383 normal-attack multipliers match no real game value at ANY talent level 1-15.**
  Skill/burst: 11% exact, median error 8.4%.
- **Round-number tell (Manager-verified):** 331 of 669 multipliers end in the digit `5`; a uniform
  distribution predicts ~67. Real datamined values end in 5 about 5.5% of the time. 100% of file
  values have <=2 decimals vs 5.5% of real values.
- **No talent level explains it.** Best fit (L9) still shows 7.09% median error with 5.5% matching,
  so this is NOT "right values, wrong level". Mean bias is -0.68% with median per-value error 7.6%
  — noise around plausibility, not a fixable transform.
- Worst: Xianyun skill 4.25 vs 0.4464 (+852%), Keqing burst 8.42 vs 1.584 (+432%),
  Navia burst 6.85 vs 1.3536 (+406%).

**Structural defects — these mean the SHAPE is wrong, so no numeric fix suffices:**
1. **Talent level is INERT roster-wide (Manager-verified).** Every ability uses `flatTalent()`;
   ZERO per-level tables exist. `src/simulation/character/talent.ts` was built specifically to
   prevent this ("storing a scalar bakes in one level and makes the data unusable at any other").
   Its core contract is unused by 100% of the data.
2. **Wrong scaling stat, not wrong number (Manager-verified).** Only `scaling: "atk"` appears
   ANYWHERE in the roster. Yelan's skill is 0.40704 x Max HP in game, authored as ATK 3.84. Every
   HP-scaler in the game is mis-authored. A category error no numeric fix repairs.
3. **Multi-hit / press-hold variants collapsed to one scalar** — Xiangling N4 is 0.2788x4, Hu Tao
   N5 is 0.59363+0.628, several skills have distinct press vs hold values. ~30% of N-string
   entries are structurally UNREPRESENTABLE in the authored shape.
4. Hu Tao burst 6.17 is the LOW-HP variant, not the base 4.93952 — a plausible value taken from
   the wrong row.

**What IS sound:** burst energy costs 97.7%, cooldowns 95.8%, ids unique, `maxEnergy` agrees with
burst cost. Every structural plausibility check PASSES — which is exactly the lesson: the data
passes every sanity test that can be written and is still 83% wrong. Structural checks are not
provenance checks.

**FIX PATH FOUND:** `https://gi.yatta.moe/api/v2/en/avatar/{id}` (Project Amber) returns HTTP 200
via `curl` with a browser user-agent (Python urllib gets 403; WebFetch remains blocked on fandom
402/403). It serves DATAMINED per-talent-level (1-15) params straight from game files — the same
upstream the wikis derive from. Regenerate from this rather than hand-patching.

## Completed

- **Full Playable Character System (88 Characters / Forms across All 7 Elements + Traveler)**
  - All currently playable Genshin Impact characters authored with Level 90 stats, talent multipliers, cooldowns, energy costs, particle yields, weapon types, and rarities in `src/game-data/characters/`.
  - Pyro (16), Hydro (13), Anemo (12), Electro (14), Cryo (16), Geo (11), Dendro (10), Traveler (1 identity with 6 swappable elemental forms: Anemo, Geo, Electro, Dendro, Hydro, Pyro).
  - Scalable Character Registry (`src/game-data/characters/registry.ts`) exposing `allCharacters`, `charactersById`, `characterRosterEntries`, `filterCharacters`, and backward-compatibility adapter `toLegacyCharacterDefinition`.
- **TASK #025 `mechanics-engineer` — Reusable Mechanics Abstractions**
  - Pure stat conversion engine (`src/simulation/buffs/conversions.ts`): HP->ATK (Hu Tao), DEF->ATK (Noelle/Itto), ER->Electro DMG (Raiden), EM conversions, caps, and thresholding.
  - Weapon infusion system (`src/simulation/reactions/infusions.ts`): deterministic priority resolver (`resolveInfusedElement`), overridable vs non-overridable rules, damage type targeting.
  - Coordinated attack & proc triggers (`src/simulation/buffs/triggers.ts`): declarative trigger effects, ICD tracking, proc dispatch.
  - Stance packages & snapshot policies in `src/simulation/buffs/types.ts`.
- **TASK #026 `combat-engineer` — Engine Generic Execution & Multi-Hit Planning**
  - `simulateRotation` and `validateAction` upgraded to seamlessly support both `GenericCharacterDefinition` and legacy `CharacterDefinition`.
  - Multi-hit ability expansion (`planAbility`): distinct scaling, delay offsets, independent ICD.
  - Active stance tracking (`activeStance`), active infusions (`resolveInfusedElement`), active trigger evaluation (`activeTriggers`), and resource effects (`applyStateEffects`).
- **TASK #028 `optimizer-engineer` — Rotation Search & Beam Search Optimizer**
  - `optimizeRotation(team, enemy, config, simConfig)` conforming to `CONTRACT.ts`.
  - Candidate action generation (`actionGenerator.ts`) exploring swaps, normals, charged, skills, and bursts with legality pruning via `validateAction`.
  - Deterministic beam search ranking top-N rotations by `total-damage` or `dps`.
- **TASK #029 `frontend-engineer` — TeamBuilder Full Roster Integration**
  - `CharacterPicker` updated to browse, filter (by Element, Weapon, Rarity, and Search query), and deploy any character from the full 88-entry roster.
  - Support tier badges (`Full`, `Partial`, `Data`) and responsive grid.
- **TASK #030 `qa-engineer` — Roster Integrity & Coverage Matrix Validation**
  - 1163/1163 tests green across 62 suites.
  - Zero overclaims verified across all 88 character entries (`verdict !== "overclaims"`).
  - Multi-element team execution tested (Raiden National, Hu Tao Double Hydro, Ayaka Freeze).
  - 4,137-line coverage matrix report generated.

- **Phase 1 vertical slice** (all gates green: build ✓, typecheck ✓ strict, lint ✓, tests 15/15 ✓)
  - Next.js 15.5 + TS strict + Tailwind + Vitest scaffold.
  - Shared engine types (`src/types`).
  - Damage pipeline: ATK-scaling, crit (expected/always/never), DEF, RES, DMG%/elem%.
  - `simulateRotation()` — deterministic, event-driven timeline; cooldown + burst-energy validation.
  - Game data: 1 test character, 1 test enemy, 1 sample rotation (data-driven).
  - UI: dark theorycrafting slice — team, setup, SIMULATE, headline stats, clickable timeline, damage breakdown.
- **Agent team + docs** — 7 agents in `.claude/agents/` (incl. `uiux-engineer`), `AGENTS.md`, `docs/ARCHITECTURE.md`, this file.
- **Design docs skeleton** — `docs/design/` seeded: DESIGN-SYSTEM, UX-FLOWS, COMPONENTS, UI-DECISIONS (initial specs / TBD placeholders).
- **TASK #001 `combat-engineer` — Phase 2 API contract FROZEN** (accepted; typecheck ✓, lint ✓, 41/41 tests ✓).
  Verified independently by Manager, not on report.
  - `validateAction()` extracted as a real export and the SINGLE source of validation truth —
    engine imports it, no forked logic. Returns a discriminated union with machine-readable
    `ValidationErrorCode`s so the optimizer can prune and schedule.
  - Buff seam live: `BuffResolver` / `BuffContext` / `resolveStats()`, no-op by default.
  - `SimulationResult.finalState: SimulationSnapshot` — post-run per-character energy + cooldowns.
    Unblocks optimizer beam search (no re-simulating each prefix from t=0) and frontend energy UI.
  - `SimulationConfig` gained `swapCost` (default 0.6s), `timeLimit`, `partySize`, `buffResolver`,
    `resumeFrom` (declared, inert — shape frozen so resumption is not a breaking change later).
  - Swap magic number `0.5` removed → `DEFAULT_SWAP_COST_SECONDS`. `EPSILON` centralized.
  - `src/simulation/{energy,cooldowns}` extracted as modules with pure, tested helpers.
- **TASK #003 `combat-engineer` — particle energy wired + 4-character teams** (accepted).
  Particle model live: on-field full share, off-field party-scaled, ER applied per receiver.
  `energyGenerated` (flat, not ER-scaled) and `particles` (ER-scaled) are independent and
  additive, so all 41 Phase 1 tests passed unmodified. Added `testHydro/testElectro/testAnemo`
  + `testTeam`/`teamRotation`. Contract amendment landed: `CombatEvent.energyByCharacter`,
  swap `fromCharacterId`/`duration`, `SimulationResult.structuredWarnings` +
  `effectiveSwapCost` (both required fields).
- **TASK #004 `mechanics-engineer` — buff/debuff model** (accepted). `getActiveBuffs()`,
  `makeBuffResolver()`, plain-data buffs with declarative conditions (not predicates, so
  impurity cannot be smuggled in and Web Worker serialization holds). Application order
  documented: `base * (1 + Σpct) + Σflat`. Purity asserted via `structuredClone`. No
  character named anywhere in logic. Flagged the `Stats.atk` base-vs-final ambiguity and
  skips-and-reports `%` modifiers rather than silently inflating damage.
- **TASK #005 `qa-engineer` — determinism harness + contract tests** (accepted). +121 tests.
  Harness is a registry (5 scenarios × 3 automatic checks), pins key order for optimizer
  memo-hashing, asserts no NaN/Infinity leak. Engine/`validateAction()` agreement PROVEN by
  independent replay — a drift fails loudly rather than hiding behind shared code.
- **TASK #006 `frontend-engineer` — design tokens + 4-char TeamBuilder** (accepted).
  Created `src/components/`; engine reached only through `simulationAdapter.ts` (verified:
  zero simulation imports in components). Branching logic pushed into pure `teamModel.ts`
  (44 tests) since no jsdom in repo. Fixed 3 contrast defects (one more than specced).
- **TASK #007 `combat-engineer` — energy constant correction** (accepted).
  `PARTICLE_OFF_ELEMENT_MULTIPLIER` 0.5 → 1/3, derived from the documented 3→1 energy pair.
  Off-element gains were ~50% too high. KQM reference values pinned as regression tests.
- **TASK #008 `combat-engineer` — DEF/RES shred seam + 2 QA defects** (accepted).
  Separate `EnemyModifierResolver` hook (frozen `BuffResolver` untouched); DEF reduction and
  ignore multiply, each clamped at 0; RES subtracted before the piecewise multiplier so
  shredding past zero enters the negative-RES branch. Negative `swapCost` now clamps with an
  `invalid-config` warning; `abilityId` is authoritative (`mismatched-ability`), checked after
  ability resolution so `unknown-ability` stays the more specific error.
- **TASK #010 `uiux-engineer` — 6 spec deltas + self-audit** (accepted). The audit found
  **6 more instances of the same contradiction class**, 5 in unimplemented §2/§3 specs —
  including §3.3 speccing axis labels as `text-slate-500`, the exact defect delta 5 forbids.
  Frontend would have shipped a contrast failure by following the spec correctly. Recorded a
  precedence rule: DESIGN-SYSTEM wins conflicts; specs are audited against system rules
  before implementation, not after.
- **TASK #011 `frontend-engineer` — Findings A/B + §3 multi-lane timeline** (accepted).
  `src/features/timeline/` deleted and replaced, not ported — no `ring-white`, `text-[10px]`,
  `text-slate-500`, `transition-all`, bare `transition`, or `md:` remain in src. Selection
  model lifted into `page.tsx` as the single source §2 will scrub off. Skip-link added.
  Flagged N5 rather than hiding it (see #012).
- **TASK #009 `uiux-engineer` — UI review of #006** (accepted). Ratified 6 of frontend's 8
  flagged judgment calls, corrected 1 (slot height), partially corrected 1 (result
  invalidation correct but silent). Notably found its OWN §1.3 contained an internal
  contradiction — it instructed a `title`-only explanation, violating its own
  "tooltips are never the sole information source" rule; frontend's deviation was the
  correct resolution. 7 UI REVIEW findings filed.
- **TASK #002 `uiux-engineer` — Phase 2 design specs COMPLETE** (accepted; zero `src/**` touched).
  4-char TeamBuilder, per-character energy display, multi-lane timeline. DESIGN-SYSTEM TBDs
  resolved: semantic state tokens (contrast measured, not estimated), 7-step type scale,
  spacing/radius scales, interaction-state matrix, a11y checklist. 7 decisions logged.

- **TASK #012 `combat-engineer` — `CombatEvent.duration` on damage events** (accepted).
  Cast time bound ONCE to `appliedCastTime` and used both for the emitted `duration` and to
  advance the clock, so the reported duration is by construction the value actually applied —
  not a second lookup that could drift. Closes N5; frontend's `castTimeFor()` is now deletable.
- **TASK #013 `mechanics-engineer` — shred seam wired** (accepted).
  `makeEnemyModifierResolver()` / `makeResolvers()` added; `Buff.enemyModifiers?` lets one
  plain-data buff carry both stat and enemy effects without a second authoring path.
  `PARTICLE_COLORLESS_MULTIPLIER` left UNVERIFIED rather than guessed — correct call.
- **TASK #014 `uiux-engineer` — UI review of §3 RotationTimeline** (accepted).
  Cleared §2. Filed findings H–L, including **Finding I (High): a shipped defect** — at
  >=640px both the lane chart AND the event list render stacked, because the branch
  `mode === "list"` yields `"sm:block"` with no base display class. Manager verified it
  independently at `RotationTimeline.tsx:227`. All 354 tests passed while it shipped: none
  asserted view exclusivity at a breakpoint. Lesson recorded — green gates are not coverage.

- **TASK #015 `frontend-engineer` — Finding I + H/J/K/L + §2 energy** (accepted).
  View exclusivity extracted into pure `viewMode.ts`; every branch carries a base display
  class, so the bare-`sm:block` defect class is structurally impossible. Manager verified all
  six (mode x {639,640,1040}) combinations independently. `castTimeFor()` deleted; lane
  geometry now derived, not comment-coupled; `formatEnergy` shared. §2 EnergyPanel landed
  with `scrubTime` DERIVED from `selectedEventIndex`, as specced.
- **TASK #016 `combat-engineer` — ER-buff energy-time seam** (accepted).
  Third seam `energySeam.ts`. ER resolves at particle-COLLECTION time per RECEIVER (not
  caster — ER belongs to whoever collects). `BuffResolver` reused verbatim, `src/types`
  untouched. Mutation-verified: `time: clock` -> `time: 0` fails exactly the partial-window
  test, proving time resolution rather than a rotation-start snapshot.
- **TASK #017 `qa-engineer` — regression suite** (accepted). +109 tests (354 -> 512).
  Found NO new defects: energy composition, DEF channel separation, RES piecewise branches,
  buff order and both new error codes all verified correct. Every suite mutation-verified
  (reintroducing the shipped `sm:block` defect fails 8 of 21; collapsing the DEF channels
  fails 4; reverting off-element 1/3 -> 0.5 fails 5). Pinned the SHAPE of
  `PARTICLE_COLORLESS_MULTIPLIER`, with instruction to REPLACE rather than re-pin if it
  proves party-size dependent.
  Manager note: I raised an ownership violation on `pipeline.ts` from an mtime; it was qa's
  cp-restore after in-tree mutation testing, and the file is byte-identical. My call was
  wrong. Practice agreed: mutate outside the tree.

- **TASK #018 `combat-engineer` — character + ability framework** (accepted; Phase A).
  17 modular files in `src/simulation/character/`. Migration by ADDITIVE COEXISTENCE:
  `liftCharacter()` adapts the legacy shape, so zero pre-existing files were modified and all
  512 prior tests pass UNMODIFIED (verified: nothing outside the module calls `planAbility()`
  or `liftCharacter()`; `pipeline.ts:104` is still ATK-only). An in-place rewrite would have
  hit ~15 test files plus `timelineModel.ts`/`energyModel.ts` — correctly refused.
  Expresses: multi-hit kits, ATK/HP/DEF/EM scaling, talent-level tables, ICD, gauge units,
  constellations/passives as data, and a state/stack/resource seam.
  Caught its own vacuous test: a layering check matched the substring `"window."` in the prose
  "the time window." rather than a DOM access; detector fixed and both checks mutation-verified.
  **Deliberately NOT wired into the engine** — see Manager decisions pending.
  Known-inexpressible (drives Phase B): infusion/element override, conditional effects
  (`StateEffect` can grant stacks but not branch on them), off-field persistent sources
  (Oz, rain swords — no duration/tick model), reaction-scaling instances, healing/shielding,
  and buffs keyed off resource values (mechanics' `BuffCondition` has no resource predicate).

- **TASK #021 `optimizer-engineer` — readiness assessment** (accepted; assessment only, no
  algorithm). Found two blocking contract defects that would have been invisible until the
  numbers were already wrong; Manager verified both independently before routing.
  B1: `SimulationSnapshot` cannot carry ICD/resource/aura state, so resumption would
  systematically OVERSTATE reaction damage in proportion to search depth.
  B2: plunges and N-attack-string positions are UNGENERATABLE rather than rejected — a validator
  cannot detect a candidate that was never proposed, so pruning sees nothing wrong while the
  search quietly explores a smaller space.
  Also correctly declined to request a build-search seam as premature. Wrote only
  `src/simulation/optimizer/CONTRACT.ts` (types + rationale, no implementation).

- **TASK #022 `combat-engineer` — snapshot resumability, action space, ICD consolidation** (accepted).
  **B1 CLOSED, not merely representable** — `CharacterSnapshot.{icd?,resources?,normalStringIndex?}`
  and `SimulationSnapshot.enemyAuras?` added. Mutation-verified: dropping `icd` from the snapshot
  fails 4 of 7 resume tests with the literal bias signature `expected 9 to be 3` (nine element
  applications where three should occur). A test also DEMONSTRATES the defect, and another proves
  a snapshot with none of the new fields still works — i.e. genuinely additive.
  **B2** — `ActionType` widened with `plungeLow`/`plungeHigh`; `normalIndex`/`normalStringIndex`
  track N-string position. Plunges and N-string positions are now generatable.
  **S1** — `damageByAbility` keyed by ability ID; `abilityNamesById` supplies display labels.
  **ICD consolidated** onto `reactions/icd.ts`; `character/icd.ts` DELETED. Combat agreed with the
  ruling and noted the merge needed ZERO test changes — evidence the duplication was real rather
  than two silently-diverged implementations.
  **N10 Traveler** — `isSameCharacter()` compares `identityId` only, and the wrong comparison is
  hard to WRITE: `CharacterIdentityId` and `CharacterFormId` are distinct branded types, so
  `a.formId === b.identityId` is a compile error, not a silently-false comparison.
  **Seam fix** — `damageTypeForActionType()` is total over the union incl. `swap`, with
  `const exhaustive: never` enforcement; mutation-verified that an unmapped new member fails to
  compile. That is the property that would have caught the plunge widening at the point of change.
- **TASK #023 `mechanics-engineer` — aura tolerance + resource-aware BuffCondition** (accepted).
  `BuffCondition.resources?` is plain data (`resourceId`/comparator/value/owner), no callback, so
  "stacks >= 3" is expressible with no character named. Judgment calls ratified: a MISSING resource
  reads as 0 ("it is zero" is a real answer) while an UNRESOLVABLE owner FAILS CLOSED ("I cannot
  tell" is not); OR is deliberately inexpressible (author two buffs) because a boolean AST is the
  first step toward the predicate language the declarative model exists to prevent.
  Also delivered the TASK #019 handoff that the spend-limit kill had lost: `unverified.ts`
  quarantines 12 mechanics, the sharpest being `simultaneous-reaction-priority` — deterministic
  but NOT asserted to match the game, and flagged by mechanics itself as the item most likely to
  be silently wrong.

## In progress

**2026-09-03: three agents terminated mid-flight on an account spend limit (HTTP 429), not on
failure. Repo verified clean afterwards: typecheck ✓, lint 0 errors, 676/676 tests, build ✓.
Nothing needs reverting.** Salvage state per task below. Limit resets 4:20am America/New_York.

- **TASK #019** `mechanics-engineer` — aura/reactions/ICD. **Substantially LANDED before death.**
  `src/simulation/reactions/` holds aura, icd, reactionTable, reactionDamage, resolver,
  applyElement, constants, plus `abilityContract.ts` (the ability-side seam it was told to
  STATE, not implement) and `unverified.ts` (values it declined to guess — the no-guessing rule
  held). 3 test files. Died on final verification, not mid-implementation. NEEDS: a Manager
  review pass + its 8-field handoff, which never arrived.
- **TASK #020** `uiux-engineer` — character-selection UX contract. **ACCEPTED.**
  MANAGER ERROR, corrected: I earlier recorded this as "LOST — no new sections". That was FALSE.
  The pre-limit run had already landed DESIGN-SYSTEM's "Support tier & data verification"
  section plus COMPONENTS.md §4-§9 (~600 lines). My check used `grep "^## §"`, but the headers
  are `## 6.3` / `# §7`, so the pattern matched nothing and I read zero matches as absence.
  A pattern that fails to match is not evidence of absence. I then briefed the re-run to
  "start fresh", which would have clobbered accepted work; uiux verified before writing and
  audited/closed the real gaps instead. Lesson: verify a salvage claim with a pattern proven
  to match something, or by line count, before recording a loss.
- **TASK #022** `combat-engineer` — snapshot resumability (B1) + addressable action space (B2).
  **NOTHING LANDED.** Verified: `ActionType` at `src/types/index.ts:22` still has no `plunge`.
  Died during initial reads. Re-dispatch from scratch; the brief is fully specified below.

### Re-dispatch queue (in priority order, when budget allows)

1. **TASK #022 re-run** (`combat-engineer`) — highest value, blocks the wiring:
   - B1: extend `SimulationSnapshot` (`src/types/index.ts:188`) with OPTIONAL fields for ICD
     counters, resource states, enemy aura. VERIFIED mechanism: `icd.ts:52-66` treats
     `counter === undefined` as expired ⇒ `hits = 0` ⇒ `applies = true`, so resuming with empty
     counters re-applies the first hit's element and OVERSTATES reaction damage in proportion to
     search depth. `resumeFrom` is still inert, so this is free right now.
   - B2: `ActionType` has no `plunge` though `DamageType` does; no normal-string index exists
     anywhere (grepped). Plunges and N-string positions are UNGENERATABLE, not rejected —
     invisible to pruning, so the search silently explores a smaller space.
   - S1: key `damageByAbility` (`simulateRotation.ts:350`) by ability id, not `ability.name`.
2. **TASK #019 review** (`manager`) — read the landed reactions module, reconcile the DUPLICATE
   ICD (`reactions/icd.ts` vs `character/icd.ts`) to one owner, collect what `unverified.ts`
   quarantined.
3. **TASK #020 re-run** (`uiux-engineer`) — unchanged brief.

### Product decisions — DECIDED (user, 2026-09-03), from uiux OQ-1/4/6

- **OQ-4 Traveler data shape: SINGLE IDENTITY + FORM LIST.** Traveler is ONE registry entry
  carrying a list of swappable elemental forms — not 6 entries sharing an identity field.
  Satisfies the user's "must not be modelled as copies" constraint directly, and makes the
  party duplicate-guard correct BY CONSTRUCTION rather than dependent on every consumer
  remembering to compare an identity field. uiux flagged this guard as the single
  highest-risk implementation bug (§5.6): key on IDENTITY, never form id, or two Travelers
  enter one party undetected.
- **OQ-6 Unauthored characters: NOT SHOWN.** The browser lists only characters that actually
  exist in the registry. No disabled placeholder cards — they would require a full roster
  list (itself unverified data) and dilute the usable characters.
- **OQ-1 Role taxonomy: NONE.** Filter by element / weapon / rarity only — all objective
  facts. DPS/sub-DPS/support is subjective, shifts with patches and team context, and cannot
  be cross-verified, so it would violate the project's no-guessing rule. Revisit only if
  filtering proves inadequate in practice.

### Manager decisions pending

- **Engine wiring of the character framework** — changes `computeDamage()`'s signature and makes
  one action emit N damage events; breaking for optimizer + frontend, and a real architecture
  change (needs an `ARCHITECTURE.md` sync). HELD until TASK #022 lands.
  When it is wired, `BuffContext.snapshot` (`simulateRotation.ts:222`) MUST be built once per
  CAST, not per instance — optimizer's cost model is `O(W·D·Ī)`, so per-instance rebuilds
  multiply its whole search budget by mean-instances-per-action (~3-8x) for zero search quality.
- **Duplicate ICD — RULED (manager, 2026-09-03): `src/simulation/reactions/icd.ts` is the
  single owner.** Both encode 3-hit/2.5s and neither imports the other, so this is one concept
  implemented twice. Rationale: ICD is an elemental-application mechanic (mechanics' domain per
  AGENTS.md), and the reactions version is the SUPERSET — it has `icdKey()` for per-sequence
  grouping and `resolveIcdConfig()` for per-ability deviation, which real kits require;
  `character/icd.ts` has only `advanceIcd` + a single `STANDARD_ICD` constant.
  ACTION (bundle into the TASK #022 re-run, combat-engineer): delete `src/simulation/character/icd.ts`
  and re-point its three consumers — `character/index.ts:2`, `character/execution.ts:8-9`,
  `character/kit.ts:3` — at the reactions module. Keep `IcdPolicy`'s role in the kit model as a
  per-ability override that feeds `resolveIcdConfig()`, rather than a second source of truth.
- ~~Aura decay path-independence~~ **RESOLVED in TASK #023.** Mechanics ruled: decay is
  composable within a STATED TOLERANCE, `AURA_GAUGE_RELATIVE_TOLERANCE = 1e-9`. It went in
  expecting to recommend "store the origin, problem disappears" and found that option does not
  exist: `refreshAura()`'s `max()`, `consumeAura()`'s subtraction, and Pyro's replace-if-stronger
  each genuinely REDEFINE the origin, so "single-step from origin" would have to store and replay
  the full application history — the step-wise path with extra storage and identical arithmetic.
  There is no path avoiding the repeated subtraction, only a choice of where it happens.
  Bound measured, not fitted: 1 re-anchor 2.2e-16, 12 -> 8.9e-16, a pathological 2000 -> 6.9e-14
  relative; the 1e-9 ceiling sits ~4 orders above the pathological case, so approaching it signals
  a real algorithmic fault. Pinned from BOTH sides (too loose AND too tight both fail).
  Contract for qa: `since`/`decayRate`/`element` are EXACT and may be pinned; only `gauge` is
  toleranced — use `auraStatesEquivalent()`, never `toEqual`. Optimizer must `quantizeGauge()`
  before memo-hashing or equivalent states hash apart.

- **EPSILON duplication — RULED (manager, 2026-09-03): mechanics' deviation ACCEPTED, no shared
  module.** I had told mechanics not to duplicate `EPSILON` without justification; it declined to
  import and gave a better reason than my note. VERIFIED: `src/simulation/{reactions,buffs}` have
  ZERO production imports from `simulation/engine` (the only matches are two comments; the two
  real imports are in `.test.ts`, where reaching up is legitimate). Importing `EPSILON` would have
  made `auraTolerance.ts` the sole production layering inversion, and it is a DIFFERENT quantity:
  relative-on-gauge-units vs absolute-on-seconds/energy. Same magnitude is coincidence, not
  shared meaning. NOT extracting a layer-neutral numerics module: two constants that merely share
  a magnitude do not justify a new shared layer, and collapsing them would invite a future edit to
  one to silently retune the other. Cross-referenced in comments; revisit if a THIRD such constant
  appears.

### Artifact event semantics hardening — 2026-09-09

Conditional rows that previously risked being interpreted as permanent maximum
uptime now require their declared event. Tiny Miracle's incoming-element RES,
Viridescent Venerer's swirl shred, Archaic Petra's crystallize-element bonus,
Scroll/Celestial/Lunar set windows, Finale's mutually exclusive normal/burst
windows, Gilded Dreams activation, and the newer Stellar/Lunar sets all use
resource-gated runtime records. Element-specific event ids such as `swirl:pyro`
and `crystallize:geo` keep a reaction from leaking into the wrong element.

Healing events now enter the timeline in timestamp order, update HP, trigger
Marechaussee/Vermillion resource effects, apply outgoing and incoming healing
bonuses separately, and carry healing history through checkpoints so Clam and
Song conversions remain resume-safe. External `damageTaken`/`hpDecrease`
resource events reduce the target's HP and trigger the corresponding artifact
windows. Thundering Fury's skill cooldown reduction is represented as a
deterministic reaction lifecycle effect.

## Blocked

- (none)

## Next tasks (after current fan-out lands)

- **Phase 3 mechanics** — DECIDED (user, 2026-09-02): finish Phase 2, then Phase 3.
  `mechanics-engineer` leads aura + reactions + ICD.
- **combat-engineer**: delete the `@deprecated CharacterState.currentEnergy` mirror once
  frontend reads `finalState` (duplication is a live drift risk).
- **uiux-engineer**: Phase 3 reaction/aura UX specs.
- **optimizer-engineer**: still Phase 4. Contract it needs exists (`validateAction()`,
  `finalState`, `resumeFrom` shape). No deep implementation until Phase 2/3 land.
- **`PARTICLE_COLORLESS_MULTIPLIER`**: still unverified. Needs a source or a decision;
  may be a shape change (party-size table), not just a value.

## Agent Status

| Agent | Status |
|---|---|
| manager | active — Phase 2 close-out; Finding I verified and routed |
| combat-engineer | active — TASK #016 (ER-buff energy-time seam) |
| mechanics-engineer | idle — TASK #013 accepted; next is Phase 3 aura/reactions |
| optimizer-engineer | idle — Phase 4; contract unblocked |
| uiux-engineer | idle — TASK #014 accepted; next is Phase 3 UX specs |
| frontend-engineer | active — TASK #015 (Finding I + H/J/K/L + §2 energy) |
| qa-engineer | active — TASK #017 (regression + breakpoint test) |

## UI defects

Findings A/B (High) fixed in #011 and verified; C/D/E/F folded in or specced; G ruled
no-change (Alt+Arrow bubbling is intentional — a focusable container per slot would add 4
tab stops and worsen the traversal cost of Finding F).

**Open — routed in TASK #015:** I (High, ship blocker), H + J (Medium), K + L (Low).

## Known Limitations

- Local UI/UX skills (`.claude/skills/`, `skills/`) do **not** exist; `uiux-engineer`
  relies on session-provided skills and falls back to project conventions.
- Genshin mechanics **not yet implemented** — no reactions, aura, ICD, snapshot,
  DEF/RES shred, non-ATK scaling, or EM. Buffs in progress (TASK #004).
- ~~ER buffs do not affect energy gain~~ **FIXED in TASK #016.** Third seam
  (`energySeam.ts`) alongside `buffSeam.ts` and `enemySeam.ts`. ER now resolves at particle
  COLLECTION time, per receiver — a buff live for part of a rotation applies to exactly the
  particles inside its window. `BuffResolver` reused verbatim, not modified. Flat
  `energyGenerated` stays un-ER-scaled (correct per game behaviour).
- Energy constants VERIFIED against KQM TCL + Genshin Impact Wiki (2026-09-02): base 3,
  matching 1, off-element 1/3, off-field share `{1:1.0, 2:0.8, 3:0.7, 4:0.6}`. Composition
  confirmed free of double-counting. **`PARTICLE_COLORLESS_MULTIPLIER = 0.6` remains
  UNVERIFIED** — no accessible source; may be party-size dependent (would need a table, a
  shape change). Not guessed.
- `Stats.atk` is documented as FINAL atk, but Genshin ATK% scales BASE atk. The resolver
  takes base values separately and skips-and-reports `%` modifiers when base is absent.
  `Stats` likely needs `baseAtk`/`baseHp`/`baseDef` eventually.
- Particle ICD not modelled — each cast emits its full emission.
- `timeLimit` gates action START, not end: a long action starting before the limit overruns
  it. Documented, reviewed, intentional — not a bound on `duration`.
- `swapCost: 0` permits unbounded zero-time swap chains; a future optimizer pruning concern.
- **Snapshot semantics — DECIDED (user, 2026-09-02): keep both expressible, defer.**
  `BuffSnapshotMode` stays data-expressible; the resolver implements `dynamic` only. The two
  modes are currently indistinguishable — the engine emits one damage instance at cast, so
  nothing can observe the difference. Revisit when multi-hit/DoT abilities land in Phase 3,
  with a real case to test against.
- ~~`vitest.config.ts` excluded `.test.tsx`~~ **FIXED** — glob now covers both extensions.
- `CharacterState.currentEnergy` is a `@deprecated` mirror of `energy.current` — drift risk
  until removed.
- Optimizer **not implemented** — no `optimizeRotation()` yet.
- Only 1 test character / 1 test enemy exist (more landing in TASK #003); damage is
  ATK-scaling only.
- Design specs for Phase 2 are complete; Phase 3+ specs remain `TBD`.
- No multi-target, no real swap timing, single-lane timeline.

## Later phases (not started)

- **Phase 3** — mechanics: elemental aura + reactions (vaporize/melt/EC/overload/superconduct), ICD, DEF/RES shred, full damage pipeline (flat terms, non-ATK scaling, EM).
- **Phase 4** — optimizer: beam search, Top-N rotations, objectives, ranking, explainability.
- **Phase 5** — frontend/perf: rich timeline viz, rotation comparison, Web Worker offload, perf tuning.
