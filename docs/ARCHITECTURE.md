# ARCHITECTURE.md — Genshin Rotation Optimizer

## Layering

Strict one-way flow. Lower layers never import higher ones.

```
Game Data          src/game-data          (plain data: chars, enemies, sample rotations)
    ↓
Mechanics          src/simulation/reactions, src/simulation/buffs
    ↓                (aura, reactions, ICD, buffs/debuffs, DEF/RES/reaction modifiers)
Combat Engine      src/simulation/{engine,damage,energy,cooldowns}
    ↓                (state, event processing, validation, damage pipeline)
Simulation         simulateRotation()  — deterministic event-driven timeline
    ↓
Optimizer          src/simulation/optimizer  — beam search over rotations
    ↓
Frontend           src/app, src/components, src/features  — React/Next UI
```

Design layer (docs, not code): `uiux-engineer` owns `docs/design/` — the design
system, UX flows, component specs, and UI-decision log that the Frontend layer
implements against. Design specs precede and review React implementation; they
never contain simulation logic.

Cross-cutting: `src/types` (shared shapes), `src/lib` (pure UI/format helpers).
The entire simulation stack is **pure TypeScript** — no React, DOM, or IO — so it
runs in tests and (later) a Web Worker unchanged.

## Current implementation (2026-09-08)

The simulation supports generic multi-hit kits, sourced talent tables,
constellation buffs, equipment buffs, reactions, enemy modifiers, energy and
resumable snapshots.
The optimizer uses the simulation as a black box and has incremental resume and
performance regression coverage. Its result contract carries a stable candidate
ID, rank/tie-break key, objective, normalized budget, reached depth and explicit
stop reason. Generated character data includes per-character support/provenance,
machine-readable unverified fields and level curves.

Perk data currently has two representations: generated presentation metadata
(`generated/perkEffects.ts`) and executable constellation `buffs`. The regression
in `src/tests/talentBoostChannelReconciliation.test.ts` compares all 259 talent
boosts across identities, unlock levels, targets, duration and talent deltas.
Seven other presentation effects marked modelled are not covered by that
connection. Presentation support alone is not proof of execution.

Website integration preserves generic definitions through its adapter (accepted
2026-09-07). `toWebsiteCharacter()` retains the legacy display projection alongside
the original generic `engineDefinition`. `toEngineCharacter()` overlays current
stats, level, talents and constellation before `runSimulation()` executes the
team. This avoids re-lifting the lossy display projection. The adapter still
accepts direct legacy and generic definitions for existing consumers.

Website equipment uses a separate `equipmentAdapter` seam. Character-keyed
weapon refinement and artifact set-piece selections become
`SimulationConfig.equippedStats` and `equipmentBuffs`; the engine remains
unaware of picker state or artifact records. Modelled weapon passives and
artifact tiers are harvested with the same buff resolver as character perks.
`completeSetBonusBuffs.ts` compiles deterministic, damage-relevant four-piece
effects (including reaction bonuses, aura/HP/weapon gates, DEF/RES shred, ER
conversion and deterministic expected proc damage) into the same `Buff`
vocabulary. Every generated set has a runtime record; healing-focused 2pc
tiers use tier-specific healing effects, while Ocean-Hued Clam and Song of Days
Past use explicit healing events for sourced damage. Effects that require
unavailable lifecycle state remain inert rather than being applied at 100%
uptime.
Runtime equipment also carries serializable `ArtifactStateEffect` descriptors
for pickup healing, burst healing, party energy ticks, particle energy,
Nightsoul Burst energy and defeat-triggered cooldown resets. The engine consumes
these descriptors only at declared events and preserves healing, pickup and
resource records in the timeline. Legacy one-piece Prayers sets use a dedicated
runtime tier; `activeSetBonusKeys()` remains unchanged for callers that depend
on its historical 2pc/4pc contract.
Hit-triggered stacks can declare damage-type and element gates. Effects driven by
external state changes use `resourceEvent` plus an `eventResourceId` (for
example `bondOfLife`, `damageTaken`, `hpChange` or `hpDecrease`); they are inert
until the scenario supplies that event. Healing emits an `hpChange` event for
the healed character, and all resulting resources are serialised for resume.
Element-specific artifact events use exact ids such as `swirl:pyro`,
`crystallize:geo`, and `damageTaken:cryo`, preventing a reaction or incoming
hit from activating a different element's bonus. Healing history is carried in
`SimulationSnapshot.healingHistory`, and external damage events update HP before
the resource trigger is evaluated. Thundering Fury's reaction cooldown
reduction is represented as a state effect rather than a permanent stat buff.
Artifact picker selections use
synthetic zero-stat pieces only to satisfy tier counting because generated data
does not publish verified main or substats. The page persists selections and
includes them in run identity fingerprints.

Talent multiplier and cooldown tables resolve from each character's configured
level. Constellation talent-level deltas resolve once per cast and clamp the
resulting level to the authored table range. Active constellation stat, enemy,
reaction and energy channels retain their declared target scope and are gated
through `activeConstellations()`; no C1–C6 row is active at C0.

The current website search adapter is synchronous. The frontend search panel
exposes honest bounded-search disclosures and a run-token guard, but real
Worker-backed progress, cancellation and queued-job lifecycle remain a planned
`OPT-008`/`PLAT-004` seam; the UI must not simulate those states around a blocking
call.

The multi-page frontend shell (added 2026-09-08) keeps route composition in the
frontend layer. `/` is the dashboard launchpad; `/team`, `/rotation`,
`/analysis`, `/optimizer` and `/library` are workflow/catalog entry points;
`/workspace` hosts the original stateful workbench and `/simulation` remains a
compatibility alias. Navigation links preserve URL configuration parameters,
while the workbench remains the sole owner of live simulation state. This is a
route handoff boundary, not a second combat model. The design and known route
limitations are recorded in `docs/design/MULTI-PAGE-PRODUCT-073.md`.

`src/features/optimizer/searchTransport.ts` defines the serializable boundary
for future Worker jobs. It freezes request payloads, computes canonical request
fingerprints, reports stable success/failure identities and attaches cold-replay
metadata. The local adapter advertises Worker, live-progress, cancellation and
resume capabilities as unavailable until a real Worker implementation lands.

## Historical Phase 1 module snapshot

```
src/
  types/index.ts                         shared engine types
  game-data/
    characters/testPyro.ts               1 test character (data only)
    enemies/testEnemy.ts                 1 test enemy
    index.ts                             team + sampleRotation
  simulation/
    damage/pipeline.ts                   computeDamage(), defMultiplier(), resMultiplier()
    engine/simulateRotation.ts           simulateRotation()
  features/
    timeline/Timeline.tsx                event track + detail panel
    damage-breakdown/DamageBreakdown.tsx by ability/character/element
  lib/format.ts                          fmtNum, element colors
  app/{layout,page}.tsx                  UI shell + Phase 1 slice
```

In the original Phase 1 snapshot, these directories were owned by workers but
not yet created (they now contain the later phase implementations):
`src/simulation/{energy,cooldowns,reactions,buffs,optimizer}`, `src/components`,
`src/tests`. Energy + cooldown currently live inside the engine module and will
be extracted when they grow.

## API contracts (the seams between agents)

### Combat Engine → optimizer, frontend, qa
```ts
simulateRotation(
  team: (CharacterDefinition | GenericCharacterDefinition)[],
  rotation: Rotation,
  enemy: EnemyState,
  config?: SimulationConfig,
): SimulationResult
```
Deterministic, event-driven timeline. Supports both `GenericCharacterDefinition` (with multi-hit instances, delay offsets, weapon infusions, stances, coordinated triggers, and state effects) and legacy `CharacterDefinition`. Validates cooldown + burst energy; illegal actions are skipped with warnings, never thrown. Returns totals, per-ability/character/element breakdown, and a full `CombatEvent[]` timeline.

Internal engine APIs: `computeDamage()`, `validateAction()`, `planAbility()`, `processEvent()`.

### Mechanics → Combat Engine
Mechanics provides pure, deterministic rule evaluators:
- `applyActiveConversions(stats, buffs)`: Pure stat conversion engine (HP->ATK, DEF->ATK, ER->Electro DMG, EM conversions).
- `resolveInfusedElement(original, damageType, activeInfusions, time)`: Priority-based weapon infusion resolver.
- `canTriggerProc(lastProcTime, currentTime, icd)` / `evaluateTriggerProc()`: Declarative coordinated attacks and proc evaluation.
- `getActiveBuffs(time, state)`: Aura, reactions, ICD groups, DEF/RES modifiers.
**No character names or combo logic are hardcoded in mechanics** — all abilities are driven by declarative schemas.

### Optimizer → Combat Engine (black box)
```ts
optimizeRotation(
  team: (CharacterDefinition | GenericCharacterDefinition)[],
  enemy: EnemyState,
  config: OptimizerConfig,
  simConfig?: SimulationConfig,
): OptimizationResult
```
Performs deterministic beam search over the space of legal actions generated by
`generateCandidateActions()`. Evaluates candidate rotations by invoking
`simulateRotation()` as a black box. Ranks top-N candidates by objective
(`"total-damage"` or `"dps"`). Returns stable candidate identities and explicit
budget/depth/stop metadata so callers can describe the actual bounded search.
Never emits an illegal rotation.

### UI/UX → Frontend (spec, not code)
`uiux-engineer` produces `docs/design/*` (design system, UX flows, component
specs). `frontend-engineer` implements to those specs, then `uiux-engineer`
reviews. The seam is the spec + `UI REVIEW` findings, not shared source files.

### Frontend → Simulation (consume only)
UI calls `simulateRotation()` / `optimizeRotation()` behind thin adapters.
No damage or reaction math in components.

## Historical Phase 1 damage formula (not current coverage)

```
base    = talentMultiplier * scalingStat      (ATK-scaling only for now)
bonus   = 1 + genericDmg% + elementalDmg%
def     = (charLvl+100) / (charLvl+100 + enemyLvl+100)
res     = piecewise( enemyRes )               (handles negative / >0.75)
final   = base * bonus * crit * def * res
crit    = expected: 1 + critRate*critDmg | always | never
```

Not yet modeled (owned by later phases): flat additive terms, non-ATK scaling,
EM, reactions, DEF/RES shred, multi-target, swap timing, particles/ER.

## Determinism

No RNG anywhere in the simulation path. Same inputs → identical outputs. This is
a hard requirement so the optimizer search is stable and tests are exact.
