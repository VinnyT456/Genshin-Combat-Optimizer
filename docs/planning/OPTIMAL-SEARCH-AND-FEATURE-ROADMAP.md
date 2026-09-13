# Optimal Search Architecture and Website Feature Roadmap

Date: 2026-09-12  
Status: implementation-ready design; no production algorithm is changed by this document.

This plan answers two product questions:

1. How can the optimizer eventually prove that a combat combination is best for
   a precisely bounded problem?
2. Which website features should be built around that optimizer, and in what order?

It complements the broader master and domain plans. Where older build-search
notes assume that equipment affects legality only through Energy Recharge, this
plan supersedes that assumption: current and planned equipment effects can also
change cooldowns, resources, HP thresholds, triggers, and action availability.

## 1. Decision summary

Use one deterministic, anytime best-first search core with three behaviors:

- **Exact search:** exhausts the complete finite action space, optionally using
  only mathematically safe branch-and-bound pruning. It may report
  `proven-optimal` only when no unexplored node can beat the incumbent.
- **Bounded search:** uses the same core with a node/frontier budget and optional
  beam cap. It reports `best-found`, never global optimality.
- **Oracle search:** exhaustive search over deliberately small fixtures. This is
  primarily a correctness and quality test for the production search.

The combat engine remains the only source of legality, state transitions, damage,
energy, reactions, and delayed events. The optimizer generates choices, calls the
engine, compares results, and records proof metadata. It never reimplements combat
math.

The initial product target stays rotation search for one fixed team, build,
scenario, objective, and time horizon. Build search follows only after complete
equipment-effect identity and inventory constraints are available. Team search is
later because it multiplies team, build, rotation, and scenario spaces.

### Observable acceptance

For identical versioned inputs and deterministic work budget:

1. Candidate order and certificate are byte-stable.
2. Every emitted rotation replays from time zero with no skipped required action.
3. No stale Worker response can replace a newer search.
4. Exact mode claims optimality only after frontier closure or a valid bound proof.
5. Bounded or canceled runs retain the best verified incumbent and report the
   unfinished search state honestly.
6. Search state keys distinguish every field that can change future behavior.
7. Fixed-horizon candidates use the same observation window and denominator.

### Explicit non-goals

- No claim of complete Genshin fidelity while mechanics remain unsupported.
- No random search, Monte Carlo, reinforcement learning, or learned damage model.
- No generated artifact-roll inventory.
- No hidden weighted blend of damage, comfort, and survivability.
- No server infrastructure until browser measurements prove it is needed.
- No global-optimality label for build/team alternating search.

## 2. Current baseline and gaps

The repository already has valuable foundations:

- deterministic beam search over engine-validated actions;
- resumable one-action expansion through `SimulationConfig.resumeFrom`;
- stable candidate IDs, tie-breaks, constraints, budgets, and replay certificates;
- cold replay before a candidate is emitted;
- a serializable Worker transport with request identity and cancellation;
- Top-N presentation and reversible adoption into the rotation editor.

These should be extended, not replaced. Four correctness gaps block an honest
optimality claim:

### 2.1 State equivalence is not complete

`stateKey()` currently covers character state, time, active character, and enemy
auras. `SimulationSnapshot` also carries future-relevant state that the key does
not yet encode, including pending reaction ticks, artifact events, active triggers,
active infusions, runtime buffs, artifact trigger state, healing history, and aura
drains. Two nodes can therefore hash together while their future damage differs.

Before stronger pruning, add a field-by-field key audit and mutation tests. Every
new snapshot field must fail a completeness test until its key behavior is decided.

Exact mode also cannot silently reuse the bounded mode's lossy float quantization.
An approximate equivalence is valid for exact search only when the engine owns and
tests it as a future-behavior equivalence. Otherwise exact mode uses an exact
canonical key, while bounded mode may use documented quantization.

### 2.2 Decision time and observation time need separate contracts

A prefix must stop at its next decision boundary. It must not flush delayed hits,
reaction ticks, particles, or expiring fields to the final horizon and then resume
from the past. Terminal scoring may clone a node and drain pending events to the
observation horizon, but expansion continues from the original decision-time
checkpoint.

Define these times independently:

- **decision time:** when the next action can be selected;
- **action-start horizon:** latest time a new action may start;
- **observation horizon:** latest event included in score;
- **last processed event:** diagnostic output, not an objective denominator.

Default ranking should use total damage over one fixed observation horizon. Fixed-
horizon DPS is then that total divided by the declared horizon. Actual-duration DPS
may remain a separate metric, but it must not silently rank short incomplete lines
against full-window rotations.

### 2.3 Current depth limits do not prove a finite search space

The existing `MIN_ACTION_ADVANCE_SECONDS` is a safety cap, not a proof about every
action. Exact mode needs one of these conditions in the declared problem:

- every legal transition advances time by a proven positive minimum; or
- an explicit `maxActions` bound; or
- canonical elimination of every zero-time cycle.

If none holds, exact mode must refuse the request. Bounded mode may still run with
an explicit work cap.

### 2.4 Beam pruning has no optimality proof

Beam search intentionally discards nodes outside the retained width. A low-scoring
prefix can later trigger a burst, reaction, field, or energy loop that dominates a
high-scoring prefix. Wider beams can change pruning paths and need not be monotonic.

Keep beam search as a fast policy inside bounded mode. Do not use beam completion as
evidence of global optimality.

## 3. Search problem contract

One search request freezes:

- team identities, forms, levels, talents, constellations, weapons, artifacts,
  authored piece stats, and executable effects;
- enemy/scenario state and initial combat resources;
- action-start and observation horizons;
- objective and hard constraints;
- action-space version, engine version, data manifest, rules version, and algorithm
  version;
- deterministic work budget and search mode.

The action space comes only from `generateCandidateActions()` and engine validation.
Unsupported action variants are absent or rejected; they never fall back to another
action.

For the first exact objective, use:

> Maximize total damage emitted at or before the fixed observation horizon, subject
> to legal execution and explicit user constraints.

This is narrow enough to test and useful enough to ship. Other objectives extend
the contract later rather than changing its meaning.

## 4. Recommended algorithm

### 4.1 Search node

```ts
interface SearchNode {
  readonly prefix: Rotation;
  readonly checkpoint: SimulationSnapshot;
  readonly decisionTime: number;
  readonly accumulatedDamage: number;
  readonly pathLabels: {
    readonly actionCount: number;
    readonly swapCount: number;
    readonly requiredActionMask: string;
  };
  readonly upperBound: number;
  readonly stateKey: string;
  readonly rotationKey: string;
}
```

`pathLabels` contains only values that affect future constraints or dominance.
Adding every display metric would reduce useful transpositions. Omitting a required
action bit, swap count, or other constraint state would merge non-equivalent paths.

### 4.2 Frontier order

Use a deterministic priority queue ordered by:

1. higher admissible upper bound;
2. higher verified accumulated objective;
3. earlier decision time;
4. fewer actions;
5. code-unit `rotationKey` order.

No locale-dependent comparator or unordered object iteration may affect expansion.

### 4.3 Expansion

For each popped node:

1. Generate legal actions from its checkpoint.
2. Apply request constraints before expensive simulation where safe.
3. Execute exactly one action from the checkpoint to the next decision boundary.
4. Reject errors, skipped required actions, non-finite state, or breached hard
   constraints.
5. Update accumulated score and path labels.
6. Evaluate terminal candidates on a copy drained to the observation horizon.
7. Insert a non-terminal node only when it is not safely dominated.

### 4.4 Transposition dominance

For the first additive objective, node A dominates node B only when:

- both have the same complete future-state key;
- both have the same future-relevant path labels;
- A has at least as much accumulated damage;
- A is no worse for every hard resource constraint.

Retain A and discard B. For Top-N structurally different rotations, either retain
up to N path labels per equivalent state or treat diversity as a separate
post-processing product feature. Do not weaken the best-score proof silently to
produce visually different rows.

Pareto objectives need Pareto labels per state. They cannot reuse a single scalar
dominance rule.

### 4.5 Bounds

Start safely:

- The exhaustive oracle uses `Infinity` as the upper bound and prunes no node by
  estimated future damage.
- Initial production exact mode may also rely on exhaustive frontier closure for
  small constrained requests.
- Add branch-and-bound only after a conservative bound is proved.

A future admissible bound may combine damage already earned, pending scheduled
damage, remaining action slots, minimum action time, and per-action maximum damage.
Every term must be an overestimate under all executable buffs, reactions, resource
states, and delayed effects. If any capability lacks a safe bound, return
`Infinity`. A loose bound costs time; an unsafe bound loses the optimum.

For Top-N proof, the search may stop only when the highest remaining frontier bound
cannot exceed the Nth incumbent score. Ties follow the same deterministic ordering
as final ranking.

### 4.6 Anytime behavior

Exact and bounded modes share one loop:

```text
validate request
seed fixed prefix and incumbent
push root into deterministic frontier

while frontier is not empty:
  stop only at deterministic budget boundary or cancellation checkpoint
  pop highest-priority node
  prune only by proved dominance or admissible bound
  expand every legal action in deterministic order
  cold-evaluate promising terminal candidates
  update incumbent and Top-N set

emit replayed candidates plus search certificate
```

Bounded mode stops at a node-count or expansion-count budget. Wall-clock cancellation
is a responsiveness control, not a reproducibility budget. A canceled search may
return its last verified incumbent, but only if the Worker sends incremental
incumbent checkpoints explicitly.

### 4.7 Search certificate

```ts
interface SearchCertificate {
  readonly algorithmVersion: string;
  readonly requestFingerprint: string;
  readonly mode: "exact" | "bounded";
  readonly status:
    | "proven-optimal"
    | "best-found"
    | "canceled"
    | "no-candidates"
    | "failed";
  readonly nodesExpanded: number;
  readonly frontierRemaining: number;
  readonly bestScore: number | null;
  readonly frontierUpperBound: number | null;
  readonly optimalityGap: number | null;
  readonly stopReason: string;
  readonly candidateFingerprints: readonly string[];
  readonly coldReplayVerified: boolean;
}
```

`optimalityGap` is present only when an admissible finite frontier bound exists.
`proven-optimal` requires frontier exhaustion or a closed bound gap. UI wording must
derive from `status`; it cannot infer proof from a completed Worker.

## 5. Objectives and constraints

Implement in this order:

1. **Fixed-horizon total damage:** first exact objective and default.
2. **Fixed-horizon DPS:** derived from the same total and declared horizon.
3. **Loop-feasible damage:** hard constraint verified by replaying the next cycle;
   report the first failed action and resource deficit.
4. **Time to kill:** only after enemy HP, phases, invulnerability, and overkill
   semantics exist.
5. **Robustness:** evaluate named deterministic scenarios and report worst case,
   range, and rank stability.
6. **Pareto results:** expose damage/resource/survival tradeoffs without hidden
   weights.

Supported hard constraints should include fixed prefix, allowed/excluded action
types, maximum actions/swaps, required actions, minimum ending resources, and fixed
team/build. A control stays hidden until the engine-backed search enforces it.

“Comfort,” execution difficulty, latency, missed-hit probability, and player skill
must not become unexplained magic penalties. If added later, they are explicit user
scenario inputs with visible values.

## 6. Build and team search

### 6.1 Fixed-rotation build search

For each legal user-owned build:

1. Resolve complete stats and effect identity through the existing equipment and
   buff paths.
2. Re-simulate the fixed rotation from zero.
3. Reject any build that makes a required action skip.
4. Cache only by full executable build identity: stats, passives, set effects,
   conditions, refinements, source versions, and scenario.

Safe dominance filtering applies only inside a proved monotone equivalence class.
A piece with more ordinary stats is not automatically superior when thresholds,
caps, set activation, HP, cooldown, or resource effects differ.

### 6.2 Alternating build and rotation search

Use incumbent-retaining, deterministic multi-start alternating search:

```text
for each declared starting build:
  optimize rotation for build
  optimize build for rotation
  repeat until no improvement, a repeated pair, or round cap
return globally replayed best-found pairs
```

This is practical but not globally optimal. Report starting points, rounds, budgets,
and final replay. A temporary decrease is never accepted under the same objective.

### 6.3 Team search

Team search comes last. It must enforce character/form uniqueness, shared inventory,
equipment exclusivity, support coverage, and scenario compatibility. Each team is
scored through real build and rotation search, not role labels or static heuristics.

## 7. Implementation packages

| Order | Package | Owner | Outcome and acceptance |
|---|---|---|---|
| 1 | SEARCH-001 Complete state identity | optimizer + combat | Encode every future-relevant snapshot field, aura drain, and path label. Mutation test each field. Separate exact and approximate key policies. |
| 2 | SEARCH-002 Decision/observation horizon | combat | One-action expansion stops at a decision boundary; terminal copy drains to observation horizon. Cold/resume and delayed-event tests agree. |
| 3 | SEARCH-003 Exhaustive oracle | optimizer + QA | Tiny finite kits enumerate every legal sequence. Oracle proves best score and deterministic Top-N for test fixtures. |
| 4 | SEARCH-004 Anytime frontier core | optimizer | Deterministic priority queue, incumbent retention, transposition dominance, exact/bounded statuses, no unsafe heuristic pruning. |
| 5 | SEARCH-005 Safe upper bounds | optimizer + mechanics | Capability-aware admissible bound; unsupported capabilities return infinity. Oracle mutation tests catch underestimation. |
| 6 | SEARCH-006 Incremental Worker protocol | optimizer + frontend | Node-count progress, incumbent snapshots, cancellation checkpoints, stale-response rejection, bounded memory. |
| 7 | SEARCH-007 Proof-aware search UI | UIUX + frontend | Shows request, objective, budget, proof status, bound/gap when valid, limitations, Top-N replay, compare, and reversible adoption. |
| 8 | SEARCH-008 Loop objective | combat + optimizer | Next-cycle replay and first-failure evidence; no loop claim from ending energy alone. |
| 9 | SEARCH-009 Fixed-rotation build search | data + optimizer | User-owned inventory, locks, full effect identity, full replay, no random roll generation. |
| 10 | SEARCH-010 Alternating/robust search | optimizer + QA | Multi-start round caps, cycle detection, scenario matrix, incumbent monotonicity, explicit best-found label. |

SEARCH-001 through SEARCH-004 form the minimum technical slice for an honest exact
mode. SEARCH-006 and SEARCH-007 make it a usable website feature. Later packages do
not block bounded rotation search.

## 8. Website feature roadmap

Existing `/compare`, `/coverage`, `/history`, and `/projects` surfaces are early
foundations. Extend them rather than creating parallel routes or state models.

### Now: trust and complete the core journey

| Feature | User value | Dependency | Done when |
|---|---|---|---|
| Search Lab | Configure objective, horizon, prefix, allowed actions, and budget in one place. | SEARCH-004/006 | Request summary stays immutable; unsupported controls are absent; cancellation keeps UI responsive. |
| Proof and budget badge | Distinguish proven optimum from best found. | Search certificate | Every status comes from certificate fields; no “best” claim without proof. |
| Candidate preview and compare | Understand why a suggestion differs before copying it. | Existing Top-N + comparison model | Baseline/candidate inputs match; action, damage, energy, reaction, and duration deltas reconcile. |
| Search-to-editor workflow | Try a candidate without losing authored work. | Existing adoption seam | Preview, copy, undo, edit, rerun, and stale-state behavior pass keyboard tests. |
| Validation center | Group skipped actions, missing data, and unsupported mechanics with repair links. | Structured warnings | Every severe issue links to the relevant character/action/control; duplicates retain counts. |
| Active project hydration | Make imported/saved projects open in the real workspace. | ReplayPack + projects route | Import preview never overwrites; confirmed copy restores complete team/build/scenario/rotation/search state. |
| Mobile and accessibility completion | Make core workflow usable beyond desktop mouse input. | Current UI | Keyboard journey, inert dialogs, 320px viewport, 200% zoom, reduced motion, and safe areas pass. |

### Next: explain and improve rotations

| Feature | User value | Dependency | Done when |
|---|---|---|---|
| Per-hit formula inspector | Show where each damage number came from. | Complete trace | Terms, buffs, reaction, DEF/RES, and crit mode reconcile exactly to emitted damage. |
| Energy funnel explorer | Explain particle source, recipient, ER, overflow, and burst deficit. | Energy trace | Every amount links to an event; ending energy alone never claims loopability. |
| Aura and ICD timeline | Explain reactions and non-reactions. | Target-scoped trace | Applications, gauge, decay, owner, ICD, and non-trigger reason are emitted, not inferred. |
| Loop analyzer | Test whether a rotation repeats. | SEARCH-008 | Runs declared cycles, names first failure, and reports tested conditions instead of “infinite loop.” |
| Rich A/B comparison | Identify changed inputs and observed event differences. | History + trace | Incompatible versions are blocked; observed facts and causal counterfactuals use separate labels. |
| Scenario and enemy presets | Test the same rotation under meaningful targets. | Verified enemy data | Presets carry source/version/assumptions; custom scenarios remain visibly user-authored. |
| Coverage explorer 2.0 | Know which results are trustworthy. | Capability manifest | Filters source, representation, execution, live wiring, tests, and selected-team relevance separately. |

### Later: build, robustness, and sharing

| Feature | User value | Dependency | Done when |
|---|---|---|---|
| Inventory and loadout manager | Reuse real owned gear and prevent duplicate allocation. | Versioned inventory schema | Item identity, locks, ownership, and character assignment round-trip losslessly. |
| Fixed-rotation build optimizer | Find stronger owned builds for one rotation. | SEARCH-009 | Every build replays legally with full effects; no generated rolls or stat-only cache collision. |
| Alternating build/rotation optimizer | Discover pairings that static build scoring misses. | SEARCH-010 | Multi-start/cycle/round metadata visible; incumbent never regresses; labeled best found. |
| Sensitivity lab | Measure talent, stat, level, timing, and resistance changes. | Comparison + Worker jobs | Every point is simulated; thresholds and unsupported regions remain visible. |
| Robust rotation search | Prefer rotations that survive named scenario changes. | Scenario matrix | Reports each scenario, worst case, range, and rank stability without invented probabilities. |
| Shareable ReplayPack and event links | Send reproducible experiments. | Project hydration + versions | Recipient validates, reruns, sees version drift, and never receives hidden personal data. |
| Teaching lab | Learn aura, ICD, energy, and snapshot behavior interactively. | Explainability trace | Lessons use the production engine and disclose unsupported mechanics. |
| Data release diff | See why a saved result changed after an update. | Immutable manifests | Field/effect changes link to affected projects; rerun creates a new experiment. |

### Optional after measured demand

- Constrained team search over owned characters and gear.
- Cloud sync and collaboration with conflict previews.
- Curated, provenance-bearing community examples.
- Server search jobs, quotas, and public API.
- Offline/PWA shell for local simulation and project export.

These require separate product, permission, hosting, and operational decisions.

## 9. Recommended release slices

### Release A — trustworthy search

- Complete state identity and time-horizon contracts.
- Exhaustive oracle and anytime frontier core.
- Worker progress/cancel checkpoints.
- Search certificate and proof-aware UI.
- Candidate replay, compare, and reversible adoption.

### Release B — explain and compare

- Formula, energy, aura, ICD, and warning inspectors.
- Loop analyzer.
- Rich A/B history and project hydration.
- Mobile, keyboard, zoom, and large-result validation.

### Release C — build laboratory

- Inventory/loadout model.
- Fixed-rotation build search.
- Sensitivity sweeps.
- Alternating build/rotation experiments.

### Release D — scenario depth

- Verified enemy presets, phases, HP/shields, and multi-target state.
- Robustness search and Pareto comparisons.
- Wider sourced character/mechanic coverage.

### Release E — optional platform

- Reproducible public sharing, cloud sync, background jobs, API, and curated
  community content only after local workflows and operational requirements are
  measured.

## 10. Verification strategy

### Correctness

- Zero emitted illegal rotations.
- Zero cold-replay score mismatches.
- Exact mode equals exhaustive oracle on every tractable fixture.
- Every future-relevant state mutation changes exact key or has a proved reason not
  to.
- Same request and deterministic budget produce identical result and certificate.
- Top-N proof uses the Nth score and frontier bound, including ties.

### Search quality

- Compare bounded modes against exhaustive oracle on small spaces.
- Compare current beam, best-first bounded search, and multiple starting policies
  on representative fixtures.
- Report score gap, nodes, frontier size, memory, and replay cost. Do not report one
  team as universal quality evidence.

### Performance

- Count-based CI guards for expansions, simulations, and retained nodes.
- Named-device measurements for Worker latency, cancellation response, memory,
  serialization, and large-candidate rendering.
- Keep summary results separate from optional detailed traces when transfer size
  becomes material.

### Product

- One keyboard-only path from team setup through search, compare, adoption, run,
  save, export, and restore.
- Chinese long labels and limitation text at mobile width and 200% zoom.
- Storage disabled/quota failure, Worker failure, cancellation, empty result, stale
  result, and version mismatch all retain user work and explain recovery.

## 11. Risks and controls

| Risk | Control |
|---|---|
| Incomplete state key drops the winning path | Field inventory plus mutation tests before stronger transposition pruning. |
| Approximate key invalidates exact proof | Separate exact and bounded equivalence policies. |
| Prefix scoring ignores delayed payoff | Best-first frontier; no score-only pruning without an admissible bound. |
| Terminal scoring consumes future events needed for expansion | Separate decision checkpoint from terminal observation copy. |
| Zero-time cycles make exact space infinite | Require positive time advance, explicit max actions, or cycle normalization. |
| Build cache merges different passives | Key complete executable effect identity and versions, not only stats. |
| Worker completion is mistaken for proof | Certificate status drives wording. |
| Bounded search regresses below incumbent | Seed and retain incumbent through every policy and alternating round. |
| Unsupported mechanics distort ranking | Candidate and run carry coverage/limitation summary. |
| Feature roadmap duplicates state | Extend existing routes and shared project/run/search contracts. |

## 12. First recommended implementation task

Start with **SEARCH-001: Complete state identity**. It is small enough to isolate,
already affects current beam-search correctness, and is a prerequisite for every
stronger exact, build, loop, and robustness search claim.

The task should inventory `SimulationSnapshot` and path-dependent constraints,
extend the key or explicitly exclude display-only fields, add one mutation test per
field, and prove that cold and resumed states key consistently. Do not build a new
search algorithm until this gate passes.
