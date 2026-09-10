# Astra roadmap expansion — 2026-09-08

This annex records the second Astra planning pass requested by the product
owner. It expands the master plan with implementation gaps found against the
current M1 baseline. It adds no game values and does not claim any feature is
implemented.

## Current gaps that change priority

- The optimizer still runs synchronously. Worker execution, live progress,
  cancellation, retry, stale-response rejection and retained job records remain
  incomplete.
- Generated character and weapon publication paths need a runtime registry audit
  proving that only approved rows reach the live application. Missing or
  conflicting evidence must withhold rows atomically.
- Artifact and weapon data have separate display and effect channels. Base
  stats, substats, refinements, passives and set bonuses need independent
  channel tests and an end-to-end picker-to-engine contract.
- Delayed effects are not yet guaranteed to execute in one globally ordered
  clock. Display sorting cannot replace state execution ordering.
- Checkpoint state needs a complete future-relevant inventory, including aura
  drain and pending events. Cold and resumed runs need discrete event
  equivalence tests, with any numeric tolerance documented.
- Tactical insight copy must be evidence-bound. Ending energy cannot prove a
  loop; absent reaction events cannot prove no reaction; swap share cannot prove
  no idle time.
- Explainability is split across result panels. A shared trace should connect a
  hit to formula terms, buffs, reaction ownership, energy changes, aura state,
  skipped actions and warnings.
- Coverage is documented but needs a user-facing explorer. Sourced,
  expressible, executable, live-wired and regression-tested are separate states.
- No IndexedDB project library, portable ReplayPack, migration workflow or
  reproducible sharing protocol exists.
- Offline/PWA behavior and storage failures are not yet implemented.
- Browser checks still lack mobile, 200% zoom, reduced motion, storage failure,
  large trace and large candidate rendering coverage.

## Feature portfolio

### Engine and mechanics

**P0 — canonical clock and checkpoints.** Define same-time ordering, action-end
and observation-end behavior, drain-to-idle policy, pending-event queues and
future-state fields. Test casts, swaps, delayed hits, particles, buffs and
expiry in one ordering. Treat unsourced ordering as a documented model
convention.

**P0 — evidence-bound diagnostics.** Emit proof-backed loopability, reaction and
idle findings. Fall back to narrower observations when trace evidence cannot
prove a claim.

**P1 — energy funnel.** Attribute particle source, arrival, recipient, ER
conversion, overflow and deficit per character. Link every amount to an event;
never infer funnel behavior from ending energy.

**P1 — aura/reaction visualization contract.** Expose target-scoped aura
applications, gauge/residue, consumption, decay, ICD, trigger owner and
non-trigger reason only when engine emits them.

**P1 — declarative entity lifecycle.** Model summons, fields, coordinated
attacks, cores, pickups, refresh, replacement, expiry and owner attribution
with reusable data. Keep unsupported families source/model-blocked.

**P2 — encounter state.** Add HP, shields, healing, death, multi-target and
phase transitions only with sourced scenario semantics and target attribution.

### Data and evidence

**P0 — immutable release manifest.** Store source, version, digest, evidence
verdict and publication decision for every executable row. Record shared
upstream provenance explicitly.

**P0 — live registry gate.** Prove runtime character and weapon registries use
approved generated rows. Fixtures must show missing or conflicting verifier
evidence blocks publication.

**P0 — equipment channel audit.** Verify base stats, substats, refinement,
passive and set channels independently. Prevent double application. Keep random
artifact rolls out of scope until fixed owned stats exist.

**P1 — coverage explorer.** Add `/coverage` with filters by entity, mechanic,
source verdict, representation, execution, live wiring and regression evidence.
Counts must never imply full kit support.

**P1 — inventory and import adapters.** Make first-party ReplayPack import and
export lossless. Treat external profile formats as explicit adapters requiring
schema and terms review; never ask for credentials or silently substitute items.

**P2 — release-diff center.** Show changed fields/effects between data releases,
preserve original inputs and label a new-version rerun as a new experiment.

### Optimizer

**P0 — serializable Worker protocol.** Pass plain data only. Rebuild resolver
functions in Worker. Support request IDs, progress, cancel, retry, failure and
obsolete-response states.

**P1 — enforced constraints.** Support fixed prefix, allowed/excluded actions,
max swaps/actions, duration, resource bounds and required burst states. Hide
controls that engine-backed search cannot enforce.

**P1 — measured presets and replay certificates.** Fast/balanced/thorough
presets expose measured limits. Each candidate stores effective conditions,
replay result, budget and stop reason. Say “预算内找到的最佳候选,” never global
optimality.

**P1 — diverse Top-N and reversible adoption.** Stable IDs and ties; optional
structural deduplication with reason; copy candidate into editor without
mutating source run.

**P2 — build-aware and robustness search.** Alternate build and rotation search
only after equipment resolution is trustworthy. Simulate each sensitivity point
and scenario; do not interpolate universal stat weights.

### Frontend and UX

**P0 — immutable identity surfaces.** Header, analysis, history and exports show
engine/data/rules/schema versions, assumptions, horizon, budget and stale state.
Old results stay attributable to original inputs.

**P1 — explainability workspace.** Selecting a hit or action reveals formula
terms, buffs, reaction owner, energy changes and warnings through the shared
trace. Missing trace is explicit.

**P1 — energy and aura panels.** Link per-character deficit/overflow and
particle flow to timeline events. Render only emitted target-and-time aura state.

**P1 — comparison and counterfactuals.** Compare matched runs, identify changed
inputs and causal facts such as extra bursts. Require controlled reruns for
causal language.

**P1 — named presets and build revisions.** Add named teams, build revisions,
rotation presets, compatibility previews, duplicate-item checks and reversible
adoption while preserving current draft.

**P2 — teaching views.** Add rerunnable lessons for aura, ICD, funneling,
snapshotting and “why no reaction/burst?” using the same engine and explicit
assumptions.

**P2 — shareable event anchors.** Restore inputs and rerun before locating a
timeline event. Version drift shows stale-anchor explanation.

### Persistence, platform and quality

**P0 — recoverable baseline and CI.** Record a safe revision, automated
typecheck/lint/test/build, retained reports and secret/cache exclusions.

**P1 — IndexedDB projects.** Transactional autosave with visible status,
quota/disabled-storage/eviction handling and migration recovery.

**P1 — ReplayPack v1.** Canonical DTO with versions, hashes, assumptions and
limitations. Reject functions, unknown incompatible versions, non-finite
values, invalid IDs and silent omissions. Import never overwrites current work.

**P1 — reproducible sharing.** Separate exact replay, migration/new run and
read-only inspection. Include complete inputs, versions, limitations and
optional result summary.

**P2 — offline/PWA shell.** Keep bundled data, local projects, simulation and
export usable offline. Asset failure uses stable portrait/text fallbacks.

**P0/P1 — QA matrix.** Add contract/mutation tests, replay evidence packs,
selection-to-export fixtures, measured trace/candidate budgets, keyboard paths,
mobile, 200% zoom, reduced motion and storage failure checks.

## Recommended next Luna dispatches

1. **TASK #097 — QA:** recoverable baseline and CI evidence ledger.
2. **TASK #098 — game-data:** live registry and source-release audit.
3. **TASK #099 — optimizer:** serializable Worker request/response seam.
4. **TASK #100 — combat:** clock, horizon and checkpoint contract audit.
5. **TASK #101 — frontend + UIUX:** immutable run identity and truthful
   diagnostics.
6. **TASK #102 — combat + mechanics:** energy funnel trace contract.
7. **TASK #103 — frontend + UIUX:** preset and enforced constraint workflow.
8. **TASK #104 — platform + frontend:** IndexedDB project and ReplayPack DTO.
9. **TASK #105 — frontend + UIUX:** explainability, aura and energy panels.
10. **TASK #106 — QA:** browser matrix and performance certification fixtures.

Each dispatch needs one owner, a frozen seam, explicit acceptance tests and a
Chinese capability disclosure. These are proposed assignments; Manager must
convert each into the canonical task protocol before execution.
