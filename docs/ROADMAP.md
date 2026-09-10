# ROADMAP.md

> **Planning expansion — 2026-09-07:** [MASTER-PLAN.md](MASTER-PLAN.md) is now the
> forward-looking roadmap, with detailed Astra-authored engine/optimizer,
> product/UX and data/platform/quality plans in `planning/`. This document retains
> prior phases, source decisions and history. Its historical open labels do not
> override the current master plan or accepted PROJECT-STATUS entries.

**The reference document for anyone picking up this project.** Read this, `AGENTS.md`,
`docs/ARCHITECTURE.md` and `docs/PROJECT-STATUS.md` before starting work.

`PROJECT-STATUS.md` is the *current* state (what landed, what is in flight).
This file is the *forward* plan (what remains, in what order, and why).

Last updated: 2026-09-07. All gates green: typecheck 0, lint 0, 1783/1783 tests, build compiles.

### Manager reconciliation — current cycle, 2026-09-07

The phase tables below contain historical open labels. Code review and a fresh
QA baseline establish this dispatch order; use it before redispatching those rows:

1. **Completed this cycle:** reconcile the 259 talent boosts and preserve generic character
   definitions through the website adapter. UI support must remain specific to
   the verified talent channel; seven other expressible effects are not wired.
   Implement the matching selection/disclosure UX from
   `design/PERK-WIRING-2026-09-07.md`. Independent QA accepted the implementation;
   1791 tests, typecheck, lint and production build passed.
2. **Next substantial engine task:** E1, a time-driven reaction tick scheduler
   including aura drain snapshot preservation. Scope and test it separately.
3. **Next data/product tasks:** additional sourced perk/weapon/artifact effects,
   preserving withhold-on-conflict. Artifact selection currently does not affect
   website simulation; its configured stats need a separate integration task.
4. **Later:** optimizer build-search scope and broader dashboard improvements.

Verified already present (not new work for this cycle): A3 per-character tier,
A4 machine-readable unverified fields, A5 level curves, B1 enemy modifiers, B2
resume and incremental optimizer tests, C1 dialogs, C3 URLs, C4 tier baseline,
C5 radius scale, and D3 performance budget tests. B4 is removed in production
engine state; compatibility type/adapter cleanup remains. C2/C6 need the scoped
perk UX review rather than wholesale reimplementation.

Historical phase labels below are retained for context. PROJECT-STATUS's dated
current orchestration section records acceptance and final gate results.

---

## 0. The one rule that matters most

**Never enter a value you cannot verify. Mark it UNVERIFIED and move on.**

This project already had to delete and regenerate its entire 132-character roster because
659 multipliers were written from memory. The audit that caught it found **83% of
normal-attack multipliers matched no real game value at any talent level**, and the tell was
statistical: 331 of 669 multipliers ended in the digit `5`, where a uniform distribution
predicts ~67.

Every structural sanity check *passed* on that data. Cooldowns were sane, energy costs sat on
the real ladder, ids were unique, multipliers were in believable bands. **Structural checks
are not provenance checks.** A wrong number that looks plausible is worse than a missing one,
because nothing ever fails.

Corollaries that are now project law:

- Two independent sources must agree, or the value is withheld and reported. Never split the
  difference, never pick the nicer one.
- Prefer **visible-nothing over invisibly-wrong**. `toLegacyCharacterDefinition` omits
  non-ATK terms rather than folding them into ATK, so an HP-scaler reports 0 instead of a
  confident wrong number. Keep that instinct everywhere.
- Fail **closed**, never open. An unrecognised support tier resolves to the *least* supported
  state. Under-promising is recoverable; over-promising is the failure mode.

---

## 1. Where the project stands

Working and verified:

- **Engine** — deterministic event simulation, energy/particle model, cooldowns, action
  validation, multi-hit data-driven kits, four seams (buff, enemy, energy, reaction).
- **Damage** — audited term-by-term against KQM TCL. DEF reduction capped at 90%, target DMG
  reduction subtracts inside the bracket, `BaseDMGMultiplier` inside the sigma,
  `flatDamageBonus` wired.
- **Reactions** — aura/gauge model, ICD, amplifying and transformative, all coefficients
  cross-verified.
- **Roster** — 132 characters generated from Project Amber, cross-verified against Lunaris,
  with per-talent-level tables (1-15) and correct scaling stats (ATK/HP/DEF/EM).
- **Optimizer** — real beam search over `simulateRotation`, deterministic, memo-keyed.
- **UI** — team builder, rotation editor, timeline, damage breakdown, character portraits.

Known-incomplete, tracked below.

---

## 1b. Open follow-ups (small, precisely scoped)

- **Channel reconciliation (scoped task; the UI gate depends on it).** The presentation table
  (`generated/perkEffects.ts`, read by the UI's `classifyPerk`) and the engine channel
  (`ConstellationDefinition.buffs` -> `talentLevelResolver`) are **the SAME 259 perks in two
  representations, and their id sets are IDENTICAL** — set difference empty in both directions.
  An earlier "260 vs 259" reading (mine) was a grep artifact: `perkEffects.ts:94` is the interface
  field declaration `talentLevelBoost?: {...}`, not a data row. Verified.
  So unification is low-risk. A test asserting the two stay in lockstep would make future drift
  fail loudly. **`PERK_EFFECTS_REACH_ENGINE` must stay `false` until this lands** — widening the
  adapter type alone is NECESSARY BUT NOT SUFFICIENT, because the gate discriminates channel-1
  rows whose `support` flag would then be describing channel-2 behaviour. (Combat retracted its
  own earlier "can flip with no engine change" as overstated; I had repeated it.)
- **frontend — widen the adapter's team type.** `RunSimulationInput.team` in
  `src/features/simulation/simulationAdapter.ts` is `readonly CharacterDefinition[]`, the LEGACY
  four-slot shape that carries no passives or constellations. So the UI hands the engine perkless
  definitions and the (working) perk harvest correctly finds nothing. Pass
  `GenericCharacterDefinition` through. NOTE this is necessary but NOT sufficient to flip the gate
  — see channel reconciliation above. NOTE also the reason recorded in `perkPresentation.ts` / `rosterModel.ts` — "adapter passes
  constellationLevel: 0" — is NOT the live blocker; `liftCharacter` is only reached for legacy
  definitions, where empty is the honest answer. The team TYPE is the blocker.
- **mechanics — four stale comments that are now FALSE.** `Buff.talentLevelModifiers`' doc and the
  exported `UNWIRED_TALENT_LEVEL_NOTE` in `buffs/types.ts` both assert a talent boost has no effect
  on damage; `makeBuffResolver.ts`'s header and `makeTalentLevelResolver`'s doc say the same.
  `UNWIRED_TALENT_LEVEL_NOTE` is an exported const, so it is reachable from code and could be
  rendered in the UI — prioritise that one.
- **E1 reaction tick scheduler — open, correctly not half-landed.** Combat scoped it and declined
  to smuggle it in beside a behaviour change. The blocker is engine-side SIZE, not mechanics: EC
  ticks fire on an INDEPENDENT clock (every 1.0s from the reaction, including after the final
  action), while `evaluateTriggers` only fires at hit boundaries. Needs a genuine time-driven tick
  queue interleaved into the main loop.
  **PREREQUISITE found while scoping:** `snapshotEnemyAuras` / `restoreEnemyAuras` in
  `engine/reactionSeam.ts` copy element/gauge/since/decayRate and **DROP `drains`**. Once EC
  attaches a drain, resume would silently lose it and the resumed run would decay slower than the
  original. Sequence this WITH E1, not before.

## 2. Ordered plan

Sequenced by dependency. **Each phase's gate must pass before the next starts** —
typecheck 0, lint 0, full suite green, `npm run build` compiles.

### Phase A — Close the honesty gaps (highest value)

The tool currently claims less than it could, and in one place more than it should.

| # | Item | Owner | Notes |
|---|---|---|---|
| ~~A1~~ | ~~`reactionBonus` buff plumbing~~ | mechanics | **DONE.** Per-reaction fold landed; a reaction-less bonus is skipped-and-reported, never a global scalar. An empty bag OMITS the key (materialising `{}` broke fold-identity, and `{}` vs absent hash differently, splitting optimizer memo entries for zero information). |
| ~~A2~~ | ~~Constellation/passive effects as `Buff` data~~ **DONE (259 talent-level boosts, engine-wired)** | data | Prose is not simulatable. Bucket each effect: expressible / numerically-clear-but-not-expressible / ambiguous. Report counts. |
| A3 | Per-character support tier | data | Replace the blanket `GENERATED_SUPPORT_TIER`. Derive per character from what is actually emitted. |
| A4 | Per-value provenance in emitted data | data | UNVERIFIED markers exist only as `//` comments — unreachable from TS. Emit `unverified?: {field, reason}[]`. |
| A5 | `baseStatCurves` level coverage | data | Reportedly only L90. A level selector would silently return L90 stats at every level. |

### Phase B — Coverage the engine cannot yet reach

| # | Item | Owner | Notes |
|---|---|---|---|
| B1 | Wire `enemyModifierResolver` shred into the damage pipeline | combat | **No seam exists**, so the new 90% DEF cap cannot be tested end-to-end — only as a unit on `defMultiplier`. Combat just corrected a +10.53% error there. |
| B2 | `resumeFrom` wiring | combat | Declared but inert (`simulateRotation.ts` pushes a warning and simulates from t=0). Optimizer runs O(W·D²) instead of O(W·D). Perf, not correctness. |
| B3 | Weapon + artifact game data | data | The *shape* exists (`resolveEquippedStats`, set counting). Values do not. Weapon passives are prose and need authoring as `Buff` data. |
| B4 | Remove `CharacterState.currentEnergy` | combat + qa | Confirmed **write-only**: 3 writes, 0 reads. Deprecated mirror, live drift risk. Touches ~12 test files. |

### Phase C — UI implementation (specs already written)

Specs are done and audited: `DASHBOARD-AND-DIALOGS-041.md`, `CHARACTER-DETAIL-046.md`,
plus DESIGN-SYSTEM and COMPONENTS amendments.

| # | Item | Owner | Notes |
|---|---|---|---|
| C1 | Dialog contract | frontend | `size` prop replacing per-caller className sizing; **body scroll lock** (`overscroll-behavior` prevents chaining, NOT background scroll — an earlier audit wrongly credited it); one scroller per dialog. |
| C2 | Character detail page | frontend | Branch on the **four-row truth table** over `effects` × `descriptionZh`. Today's `constellations.length > 0` collapses four cases into two. |
| C3 | URL/deep-link state | frontend | `team`, `view`, `el`, `q`, `sort`. Results never in the URL. Sharing a build is the core social function of a theorycrafting tool. |
| C4 | Tier at scale | frontend | Roster baseline stated **once**; per-card chip only on deviation. A signal with zero variance is not a signal. |
| C5 | Radius scale enforceable | frontend | Move `borderRadius` from `theme.extend` to `theme` — extension is why "no other radii" was never enforceable. |
| C6 | Remaining audit findings | frontend | Coloured-glow bans, `aria-pressed` misuse on single-select constellation segments, talent selects capped at 11 while data holds 15. |

### Phase D — Optimizer maturity

| # | Item | Owner | Notes |
|---|---|---|---|
| D1 | Build search as a **separate pass** | optimizer | Rotation search is sequential/dependency-heavy; build search is combinatorial over a static space. A build changes *scoring*, not *legality*. Alternate: optimise rotation at fixed build, then build at fixed rotation. |
| D2 | Legal-but-warned candidates | optimizer | Currently pruned entirely. Needs a ruling — that may be discarding valid rotations. |
| D3 | Performance budget | optimizer + qa | First place the engine is called hundreds of thousands of times. No profiling exists yet. |

### Phase E — Mechanics depth

| # | Item | Owner | Notes |
|---|---|---|---|
| E1 | Electro-charged / burning tick SCHEDULER | combat | Timings are now SOURCED but nothing consumes them — scheduling is engine-owned and unbuilt, so auras still persist longer than in game. **Caution on the numbers:** KQM does NOT say EC secondary targets tick every 60 frames (that is same-target spacing; the chain applies no aura). The burning evidence vault contradicts itself (2U vs 1U, 2s vs 2.5s); the curated page is treated as authoritative and the discrepancy is logged in `unverified.ts`. Re-read that entry before implementing. |
| E2 | Bloom cores | mechanics | Detonate 6s, cap 5 on-field. |
| E3 | Quicken aura creation | mechanics | `Quicken Duration = min(Dendro, Electro gauge) × 5 + 6`. |
| E4 | Multi-target | engine + mechanics | The aura model supports per-target; the engine is single-target, so Swirl cannot spread. |
| E5 | Snapshot semantics | mechanics | Both modes expressible, only `dynamic` implemented. Indistinguishable until multi-hit DoT abilities land. |

**Deliberately NOT closing:** `simultaneous-reaction-priority`. KQM explicitly declines to
publish an order ("case by case basis"). Our fixed element order is a deterministic
convention, not a game-matching rule, and the entry must say so.

---

## 3. Working agreements

**Verify, don't trust.** Every claim in a handoff gets checked against the code before it is
accepted. This has caught real errors in *both* directions — agents reporting defects that
were test artifacts, and agents reporting success on work that was dead in the UI.

**Mutation-test the wiring, not just the logic.** The two most valuable finds in this project
were a feature fully implemented and fully tested but **never rendered**, and a test suite
that passed against the *buggy* implementation. Green gates prove nothing about untested
wiring. Mutate the binding and confirm a test fails.

**Mutate outside the tree.** In-tree `cp`-restore looks like an ownership violation to a
concurrent observer. It caused a false alarm once.

**Ownership is real.** Agents edit only their own paths and *report* cross-boundary defects
rather than reaching across. Two agents editing one contract concurrently produces a
corrupted merge neither can verify.

**Design the abstraction once.** Weapon passives, artifact set bonuses and constellations are
the same idea — conditional, stacking, refinement-scaled effects. They all go through the one
declarative buff system. Three parallel implementations of one concept is the specific
outcome this project forbids.

**Conditions stay plain data.** Never predicate functions — that is what keeps impurity out
and Web Worker serialisation intact.

**Determinism is non-negotiable.** No RNG, no wall-clock, no unordered iteration. Byte-identical
`SimulationResult` for identical inputs. The optimizer's beam search depends on it.

**THIS REPO HAS NO GIT COMMITS.** Every deletion is permanent and unrecoverable. An agent
deleted another's scratch file believing it was its own; it could not be restored. When in
doubt, do not delete.

---

## 4. Source access (verified 2026-09-04)

| Source | Access |
|---|---|
| KQM TCL | Direct curl **403**. Use `https://r.jina.ai/https://library.keqingmains.com/<path>` (200, Markdown), or clone `github.com/KQM-git/TCL` for raw LaTeX — **preferred**. |
| Project Amber | `https://gi.yatta.moe/api/v2/en/avatar/{id}` — 200 with a browser UA. Python `urllib` gets 403; `curl` works. |
| Lunaris | `https://api.lunaris.moe/data/{version}/en/char/{id}.json` (7.0.54). Verifier source. |
| Character portraits | `https://api.lunaris.moe/data/assets/avataricon/UI_AvatarIcon_{Codename}.webp`, fallback `https://gi.yatta.moe/assets/UI/UI_AvatarIcon_{Codename}.png`. |
| Genshin Wiki (fandom) | **402/403 — blocked.** Do not rely on it. |

**Portrait filenames are internal game codenames, not display names.** `Amber` → `Ambor`,
`Jean` → `Qin`, `Raiden Shogun` → `Shougun`. Deriving from the display name breaks ~27% of the
roster. `characterAssets.ts` holds derivation plus 40 verified overrides. Some characters
(Skirk, Sandrone) have no icon on *any* CDN — the fallback path is live, not hypothetical.

---

## 5. Product decisions already made — do not re-litigate

| Decision | Ruling |
|---|---|
| Traveler modelling | **One identity with a form list**, never copies. The party duplicate-guard keys on identity; branded types make the wrong comparison a compile error. |
| Unauthored characters | **Not shown.** No disabled placeholder cards. |
| Role taxonomy | **None.** Filter by element/weapon/rarity only — role is subjective and cannot be cross-verified. |
| UI language | **Chinese-primary** (`zh-CN`). CJK does not wrap on spaces; English-derived rules (65-75ch, `text-balance`) do not transfer. |
| Tier at scale | Roster baseline **once**; per-card chip only on deviation. |
| URL state | **Deep-linkable** — team, filters, view. |
| Artifact substat rolls | **Not modelled.** The simulation path must stay deterministic. Artifacts are authored stat values. |
| Base-stat precedence | **`Stats.base` wins** over the id-keyed map — the bag's own base describes that bag; an id-keyed map goes stale when gear changes. |
| ICD ownership | `src/simulation/reactions/icd.ts` is the single owner. |
| Snapshot semantics | Both expressible, `dynamic` implemented, revisit when multi-hit DoT lands. |

---

## 6. Open questions needing a product decision

### Source conflicts — RULED (manager, 2026-09-07): keep withholding

The data agent investigated all 47 and the "prefer the newer source" question is **settled: no.**
Evidence: 19 of 20 remaining conflicts are the verifier carrying a SUPERSET of the primary's
numbers (extra params, never contradicting). The one genuine contradiction is **Venti C2** —
primary says 12% RES shred, verifier says 24% PLUS a cooldown reset PLUS a 300% DMG mechanic
absent from the primary entirely. Corroborating: the verifier publishes 2 characters
(`10000140`, `10000143`) with full kits the primary does not publish at all.
That is the signature of a **beta/unreleased branch**. Preferring the newer source would import
unreleased values — exactly the silent-wrongness this project exists to avoid. Withhold-on-conflict
stays. The 2 beta characters are already correctly excluded.
The "Radiance: Stellar-Conduct" lead was a red herring: it appears on 15 characters but overlaps
the disputed set only twice and causes neither conflict.

### A documented exception to the two-source rule

`Apprentice's Notes` base ATK DROPPED 185 -> 140 at L71. Cause: 1-2 star weapons ascend only to
L70, but BOTH sources publish rows above the cap with the ascension bonus silently dropped —
they mirror the same upstream table and reproduce its artifacts identically, so cross-verification
**could not see it**. 10 weapons x 20 fabricated levels are now withheld on a STRUCTURAL fact
rather than on disagreement. This is the one sanctioned case of rejecting a published number that
both sources agree on: agreement is not proof when the sources share an upstream.

1. **Per-character build state in the URL** — encoded `build` param vs. team-identity only.
   Recommendation: team-only until the build model stops changing shape.
2. **Constellation depth** — if the data yields prose only, `partial` and its warning are
   permanent. Whether to hand-author effects for high-value characters is a product call.
3. **Optimizer scope** — is build optimisation in scope, or does the tool stay rotation-only?
4. **Overclaim handling** — should an authored-vs-derived tier disagreement fail the build?
   Currently defence-in-depth; qa asserts zero overclaims today.
