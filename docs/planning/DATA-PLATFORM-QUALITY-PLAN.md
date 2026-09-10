# Data, Platform and Quality Plan

Date: 2026-09-07. Scope: the planning deliverable for TASK #061. This document does not indicate implementation, deployment approval, or an existing external-service integration. It complements [the master plan](../MASTER-PLAN.md) and [the engine/optimizer plan](ENGINE-OPTIMIZER-PLAN.md); their combat rules and interaction decisions remain authoritative for their respective domains. Planning prose is English; the website remains Chinese-primary (`zh-CN`).

## 1. Evidence standards and verified baseline

Use four statuses consistently: **Verified existing** means implementation or configuration was read in this planning pass; **Verified gap** means a missing implementation path or a conflict with an established requirement; **Proposed** means future delivery design; **Research** means a source, protocol, cost, or fact still needs investigation. The **1791 tests / 104 files** baseline comes from the latest 2026-09-07 acceptance in `PROJECT-STATUS.md`. This planning pass did not rerun the full suite. A historical “complete” label is not evidence of current full coverage.

| Area | Status and evidence from this pass | Planning consequence |
|---|---|---|
| Layering and determinism | Verified existing: pure TS engine, declarative Buffs, equipment stat model, separate optimizer; see `docs/ARCHITECTURE.md` and `src/simulation/character/equipment.ts` | Data releases, browser jobs, and server jobs reuse the same model. Platform code must not duplicate combat formulas |
| Character generation and live registry | Verified existing: `scripts/generate-characters/{fetch,parse,emit,curves,perks}.py`; `characters/registry.ts` imports `generated` | Retain the generator and add verification/release gates; do not return to hand-entering multiplier tables |
| 132 character definitions | Documentation and generated modules record 132 character/form definitions; Traveler forms share one identity. This is not 132 distinct fully supported characters | Count released playable identities, forms, generated definitions, and verified executable definitions separately; establish a versioned released-roster denominator |
| Source metadata | Verified existing: source names, fetch timestamp, Lunaris version, per-character `unverified` and `reasonCode` | This is not yet a replayable evidence chain for every number. File headers are not field-level acceptance |
| Character multiplier release blocking | **Verified gap:** the `emit.py` verification loop appends conflicts but still passes the original `abilities` to generation. Missing verifier rows are labelled primary-only but emitted. The command prints conflicts and returns `0` | DATA-001 is P0. Established withholding policy and the multiplier path disagree. This observation does not prove that the current cache contains multiplier conflicts or invalidate the recorded 28,380 comparisons |
| Cache versions and atomic publication | **Verified gap:** fetch caches by source/id, reuses details by default, but fetches the latest version manifest and rewrites aggregate provenance. Emit deletes existing output TS files before writing replacements individually | Potential mixed-version batches and partial output after interruption; address in DATA-002. Do not overwrite live generated files merely to investigate |
| Constellation execution | Verified existing: 259 talent-level boosts reconcile to the engine in `talentBoostChannelReconciliation.test.ts`; the website preserves the generic definition | The other seven presentation effects marked `modelled` are not thereby proven executable. Historical 1234-total/266-modelled counts should be regenerated from a manifest |
| Generated weapons | Verified existing: `weapons/generated/` contains per-level base ATK, substats, refinement buckets, and uncertainty records | This is a separate path from the website weapon catalog; generated data existing does not mean users consume it |
| Website weapon registry | **Verified gap:** `weapons/registry.ts` imports legacy `weaponsData.ts`; website `WeaponDefinition` represents 4/5-star L90 data. Tests separately cover the generated table and legacy UI catalog | DATA-004 must establish verified registry data, ID mapping, and lossless selection; stop maintaining two sets of combat values |
| Weapon stat mapping | **Verified audit item:** `weaponModel.ts` maps `physicalDmg` to generic `dmgBonus`; an existing test asserts that mapping | Review across layers and validate with physical/elemental attack controls. A test mirroring implementation cannot establish semantic correctness |
| Artifacts | Verified gap: 31 presentation set definitions without a provenance header or generator. The engine already has five slots, fixed main/substat values, and set-counting APIs | DATA-005 precedes trusted artifact data/effect integration. No artifact upgrade randomness is introduced |
| Enemies and scenarios | Verified gap: game data contains a test enemy. Editable UI parameters are not a verified bestiary | DATA-008 separates released enemy definitions from user-authored scenario assumptions |
| URL state | Verified existing: `urlState.ts` covers team slots, filters, and view, with pure codecs and tests | URLs do not currently persist full builds, rotations, or reproducible experiments; sharing needs a separate protocol |
| Persistence, accounts, APIs, Worker | Verified gap: no localStorage/IndexedDB implementation, Worker instance, or fetch integration found in `src`; `src/app` has no route handlers | Remain browser-first. Accounts, server search, and public-profile import services are proposed, not existing integrations |
| Test foundation | Verified existing: Vitest Node environment; determinism, API, boundary, real-team, coverage, equipment, incremental-search, and performance tests | Extend independent evidence and end-to-end wiring coverage rather than rebuilding the foundation |
| Engineering releases | Verified gap: no `.github` CI, browser automation dependency, or monitoring integration found; `git rev-parse --verify HEAD` returns no revision | Git may already be initialized, but no recoverable commit exists. Review backups/first version before release automation |

Evidence precedence: the current orchestration section in `docs/PROJECT-STATUS.md` supersedes historical entries. `ROADMAP.md` and `WORK-MAP.md` contain completed items and old counts. The code gaps above require task-specific validation; old “complete” labels must not close them.

## 2. Data truth and release system

### 2.1 The data release unit

Introduce an immutable `DataReleaseManifest` with separate version dimensions:

| Field | Meaning |
|---|---|
| `schemaVersion` | Structure version of the external data package |
| `gameVersion` / `releaseChannel` | Verified game version and released-content scope; not inferred from a mirror's latest path |
| `dataReleaseId` | Identifier of an approved package whose contents cannot change in place |
| `contentHash` | Digest of canonical content, excluding non-computational metadata such as download time |
| `sourceSnapshots` | Source ID, actual request URL, source version, retrieval time, response digest, and licensing/attribution notes |
| `generatorRevision` | Generator and parsing-rule version; use an explicit source digest until Git revisions exist |
| `verificationReport` | Compared, expected, missing, conflicting, structurally rejected, and withheld counts; never only agreed/checked |
| `coverageReport` | Executable coverage and limitations by identity, form, ability, equipment, and scenario |
| `approvalRecord` | Review decision and evidence references without adding personal information to public data packages |

Keep `dataReleaseId` separate from `engineVersion`, `rulesetVersion`, `optimizerVersion`, and `inputSchemaVersion`. A wording correction need not change a combat-result hash; a formula correction must change the relevant engine/rules version. Multiple corrected data releases can target one game version; a “7.x” label is insufficient.

### 2.2 Collect → verify → propose → approve

1. **Freeze the collection manifest.** Specify sources, candidate versions, entity list, and target released-content scope. A changed source version creates an update proposal, not an automatic production replacement.
2. **Keep immutable source snapshots.** Cache by source/version/batch/entity; record the actual retrieval time and digest for each response. Reused responses retain their old records rather than appearing newly fetched.
3. **Normalize.** Map IDs, fields, units, levels, and ascension phases while preserving original labels and locations. Apply explainable transformations, not “reasonable-looking” repairs.
4. **Verify.** Compare every candidate number against two sources using documented rounding semantics rather than an arbitrary tolerance. Check the expected index set of every table; an early loop exit on missing final levels cannot count as complete agreement.
5. **Check rules and valid ranges.** Establish level/ascension caps, slot constraints, refinement indices, and released identities from citable evidence. Shared-upstream structural errors must still be rejected, as with existing low-rarity weapon rows above L70.
6. **Quarantine conflicts.** Missing sources, contradictions, version mismatches, ambiguous parsing, and shared-upstream structural anomalies each have reason codes and affected paths. Their numbers do not enter verified executable data. Retain source text and research records; do not substitute zero for an unknown value.
7. **Generate candidates.** Write to a separate staging directory and produce machine-readable diffs, affected features, and coverage changes. Failure must not touch the previous approved package. Promote a directory or manifest pointer only after the entire candidate validates.
8. **Review and publish.** Review source agreement, released-content scope, numerical changes, affected goldens, licensing, and execution coverage. Unapproved updates remain candidates; failures retain the current package and investigation evidence.

### 2.3 Make source policy executable

- Agreement between two sources is a minimum gate, not sufficient proof of mathematical or semantic correctness. Project Amber and Lunaris may share upstream game files; independent websites must not be described as independent measurements. Record `upstreamRelationship: known-shared | assessed-independent | unknown`.
- Official descriptions, reproducible frame/damage observations, and KQM rules evidence help establish semantics and expose shared-upstream blind spots. Mechanics facts must also meet the project's two-source requirement. Insufficient evidence remains research; a secondhand summary cannot fill the gap by assertion.
- Never average conflicts, choose whichever source is newer, or splice beta parameters into released data. Matching version labels still require scope verification. Existing disputes such as Venti C2 remain withheld.
- DATA-001 distinguishes blocking conflicting multipliers from retaining non-executable source text. Inventory existing single-source/default fields for migration: default timings and similar model assumptions may remain explicitly labelled assumptions, but cannot count as verified character facts.
- A withheld ability can remain in reference material with a limitation. The master plan determines whether it is available in explicitly restricted exploratory simulation. A trustworthy result must not silently treat a missing ability as a fully modelled zero-damage kit.
- The same upstream observations cannot serve as both a fit dataset and independent validation. Weapon curves reconstructed from verifier values and replayed against those values demonstrate internal consistency; record that evidence dependence and strengthen it with independent formula or measured anchors.
- Current source availability, licensing, cache redistribution, image use, and attribution obligations remain research. This planning pass performs no new source fetches, access-limit workarounds, or assumptions of a stable public API SLA.

### 2.4 Field evidence and conflict records

A proposed `EvidenceRecord` contains at least: stable entity ID, form, ability/stat path, level/ascension/refinement coordinates, unit, both source locations and snapshot digests, raw and normalized values, rounding rule, verdict, reason code, and generator-rule version. Repeated tables can use a table-level locator plus cell indices; the browser's initial bundle need not contain redundant URLs for every cell.

A proposed `ConflictRecord` contains: conflict ID, candidate data version, both evidence records, conflict category, affected abilities and tests, blocked scope, decision and rationale, and the eventual resolving release ID. Keep an append-only decision history rather than deleting the original dispute when resolved.

Keep distinct failure categories: **unverified source**, **unsupported rule**, **expressible definition not connected to execution**, **invalid user input**, and **runtime failure**. Carry machine codes into data reports/APIs and localized explanations. Chinese UI labels such as “来源未确认” and “规则尚不支持” should not collapse into one generic “暂未支持”.

## 3. Complete-roster and equipment coverage

### 3.1 Full-roster support is a continuing acceptance process

Use a source-verified, version-frozen released roster as the denominator. Model Traveler as one identity with multiple forms and prevent duplicate party admission. Future forms likewise need stable identity mappings rather than identity inferred from English display names. Source entries whose released playable status is unconfirmed remain in candidate reference data; do not show unauthored placeholder cards.

For each identity/form, inventory normal/charged/plunging attacks, skill variants, burst, passives, C0–C6 or applicable unlock conditions, resources/states, infusions/coordinated attacks, off-field behavior, and equipment interactions. Record separately for each feature:

1. Whether its numbers and semantics are verified;
2. Whether a generic declarative structure can express it;
3. Whether the runtime engine executes that structure;
4. Whether the configured website build reaches the engine without loss;
5. Whether independent assertions and regression scenarios exist;
6. Remaining assumptions and their affected outputs.

A successful run does not prove complete mechanics. Presentation `modelled` does not prove runtime support. Existing coverage matrices provide a starting point, but test evidence should resolve to character × ability × behavior. `ALL_CHARACTERS_TEST_EVIDENCE` currently declares damage/energy/reaction assertions for the entire roster; audit that declaration against actual assertion scope.

Sequence batches by the number of characters unlocked by reusable capabilities, importance to core workflows, evidence maturity, and validation cost. Do not add character role or strength taxonomies. Each release batch lists completed behavior, remaining gaps, and test evidence. Missing shared primitives belong in the engine plan, not character-specific branches in engine code.

### 3.2 Weapons and artifact sets

- Unify stable weapon source IDs and display aliases. Preserve compatibility mappings for old IDs; imports and old links must never silently select another item. Separate provenance for display names, bilingual search labels, icons, and combat values.
- Make level and ascension phase explicit coordinates. If current per-level tables cannot distinguish pre/post-ascension states at the same level, establish evidence and extend the model instead of forcing a single `level` index.
- Read verified refinement data per rank; do not infer an unknown R3 through linear interpolation from R1. Valid-range data describes low-rarity caps, absent substats, same-name/version distinctions, and items that cannot refine.
- Passive conditions, durations, trigger intervals, stacking, independent stack expiry, and off-field eligibility use the same declarative Buff system. Clear numbers without complete semantics remain non-executable.
- Generate verified artifact sets, slots, main-stat legality, and per-level values before connecting set effects. Substats are the user's fixed owned values; random drops and upgrade rolls are outside scope.
- Keep static build stats separate from conditional combat Buffs. Do not pre-add a conditional grant to the panel and apply it again on the timeline. Equipment replacement recomputes from intrinsic stats and the full current loadout rather than accumulating onto previously resolved stats.

### 3.3 Inventory and imports

Introduce separate `InventoryItem` and `BuildRevision` records. An owned item instance ID differs from a game-definition ID. An item records type, source definition, level/ascension/refinement or slot, fixed main/substats, lock state, import source, and timestamp. Build revisions reference instances or frozen copies. Multiple saved builds can reference one item, but one simultaneously deployed team cannot allocate that instance twice. Switching builds does not mutate the underlying inventory item.

Import sequence: **this product's exported JSON → local inventory-format adapters → optional public-profile services**. GOOD and Enka.network are candidate protocols/services requiring research, not existing integrations. Public showcased builds generally are not a complete account inventory; make returned scope and missing records explicit.

Each import passes size limits, schema validation, ID mapping, unit normalization, valid-range checks, duplicate-resolution preview, and transactional commit. Preserve the original file and error paths when rejecting fields so users can correct them. Parsing failure must not become a default premium weapon or zero substats. Repeated imports can recognize existing records, but equal values alone cannot merge two distinct owned items.

Never request or store game passwords, cookies, or login tokens. Import must not act as a game login. Even a public UID can link personal information; exclude it from share packs, logs, and analytics by default. Query public external profiles only on an explicit user action and respect source refresh limits.

## 4. Local storage, experiments, and sharing

### 4.1 Browser-first storage

Use IndexedDB for inventory, teams, build revisions, rotations, enemy scenarios, optimization experiments, and preferences; consider localStorage only for small interface preferences. A storage repository interface separates UI code from the storage backend so later account synchronization does not change the engine.

| Object | Main properties |
|---|---|
| `InventoryItem` | Owned instance, fixed values, locks, and source information |
| `BuildRevision` | Immutable build version: identity/form, level/talents/constellation, equipment references |
| `TeamRevision` | Ordered slots and build revisions; verifiable identity/item allocation constraints |
| `RotationRevision` | Ordered actions with stable action IDs referencing valid abilities |
| `ScenarioRevision` | Versioned enemies, horizon, initial state, and explicit assumptions |
| `Experiment` | Input references, version tuple, input hash, execution status; results are disposable cache |
| `SavedComparison` | Experiment references and user notes without duplicating the full game database |

Use revisions and transactions. Preserve original records before migration and allow backup export after failure. Handle disabled storage, quota exhaustion, browser eviction, concurrent tabs, and interrupted migrations. Failed autosave is visible; “已保存” must mean the transaction actually committed. Initially preserve both revisions or ask the user to resolve multi-tab conflicts rather than silently accepting the last write.

Keep old results as history when inputs change, but label them as belonging to an earlier configuration. Cache keys include all numerical inputs and engine/data/rules versions; Chinese UI copy, viewport size, and fetch timestamps do not affect numerical identity. Caches are not source records: clearing results must not delete teams or inventory.

### 4.2 Shared input schema first; portable ReplayPack later

PLAT-003 has two deliverable slices under one task family:

- **Early shared schema slice, master M1:** the smallest validated plain-data simulation/search request needed by the existing website and Worker. Include selected definitions/build values, rotation or search settings, scenario, supported initial conditions, version identifiers, and a request/input identity. Construct runtime resolvers inside the execution boundary. This slice can use the current bundled data identity until the release manifest is finalized. It does not require saved projects, downloadable files, migration UI, historical runtime retention, or a complete portable ReplayPack.
- **Portable product slice, master M5:** extend that same schema into `ReplayPack v1`, canonical hashes, file import/export, migration/compatibility handling, and reusable saved experiments. Do not create a second conflicting request model. Completing this slice is not a gate for PLAT-004 or the reachable optimizer at M1.

The proposed `ReplayPack v1` is a downloadable JSON package containing self-contained inputs. Compression may be added as transport, but define the uncompressed format first. It contains:

- Input schema version, character-definition references, fixed build/equipment values, rotation, scenario, initial conditions, and simulation settings;
- `dataReleaseId`, `engineVersion`, `rulesetVersion`, and optimizer version/budget when produced by search;
- Required data-subset hashes, canonical input hash, optional result summary/hash, and capability limitations;
- Separate metadata such as title, user notes, and producing application version, excluding public UID, import credentials, and local filesystem paths by default.

Permanent effects may use `Infinity`, and some runtime settings contain resolver functions. **Do not directly JSON.stringify runtime objects.** Define plain-data DTOs, an explicit permanent-duration marker, allowed values, and Worker/server-side resolver construction. Reject functions, arbitrary code, unencoded non-finite numbers, and unknown fields. Apply this constraint already to the M1 transport slice; full file compatibility features can wait until M5.

Keep three replay meanings distinct:

1. **Exact replay on the original version:** required historical engine, rules, and data are available and compatible; recompute and verify the result summary.
2. **Migration and new simulation:** the structure migrates successfully and explicitly uses a newer version, producing a new experiment rather than claiming the original result was reproduced.
3. **Read-only inspection:** required historical runtime/data is absent or the schema is unsupported. Display the supplied result as an external record whose validity cannot be checked; do not silently run the latest engine.

Embedding selected data fragments mitigates missing historical data, but packs do not carry arbitrary executable rules or automatically download old programs. Reproducibility promises depend on actual retention of runtimes/data; release policy must specify retention and expiration behavior.

Short URLs and server storage are later conveniences. Existing team/filter URLs remain compatible. Do not put full inventories or long event logs in query strings. Importing someone else's pack must not overwrite the current local project. Hash verification proves content consistency, not author trustworthiness or result correctness; recomputation is still required.

## 5. Optional backend and server search

### 5.1 Introduction order and boundaries

Deliver local Worker search using the early shared request DTO, then decide whether server search is justified by real measurements. Next.js can continue serving pages and lightweight APIs; long searches belong in isolated job executors with CPU, memory, and timeout limits rather than occupying page requests. Database, queue, and hosting providers need architecture decisions; no provider is installed or provisioned by this plan.

Use three shared layers: application API for authorization/validation/quotas, scheduling for idempotency/retries/leases, and execution using the same versioned pure engine/optimizer. The engine knows nothing about users, databases, or HTTP. Browser and server share input schemas and versioned output contracts, not separate formula implementations.

### 5.2 Draft search-job API

| API | Behavior |
|---|---|
| `POST /api/v1/search-jobs` | Accept canonical input references, data version, bounded budget, and idempotency key; after validation return job ID, state, and input hash |
| `GET /api/v1/search-jobs/:id` | Return authorized status, phase, work performed, best-known score, and the complete version tuple |
| `POST /api/v1/search-jobs/:id/cancel` | Request cancellation idempotently; cancellation is distinct from successful completion; return acknowledgment state |
| `GET /api/v1/search-jobs/:id/result` | Return immutable Top-N, search budget, early-termination reason, result hash, and coverage limitations |
| `DELETE /api/v1/search-jobs/:id` | Remove deletable user records/results, cancelling first if active; response follows the declared retention policy |

Proposed states: `queued → running → succeeded | failed | cancelled | expired`, with `cancelRequested` as an intermediate flag if needed. Expired leases may retry a job, but outputs must remain idempotent. Job ID is not input hash. Reuse computation only for matching inputs, versions, and budgets; cross-user caching must not reveal whether another user's private build exists.

Express deterministic budgets as algorithmic work such as expanded nodes, depth, or beam settings. Server wall-clock timeouts are resource safeguards: an interrupted result is partial and includes completed work, without promising equivalence to a same-seconds search on another machine. The optimizer contract owns deterministic parallel-result merging and tie-breaks.

Bound file size, team size, action count, candidate count, horizon, Top-N, nesting depth, optional inventory size, and output event volume; limiting `beamWidth` alone is inadequate. Validate before queue admission and authorize every job-state request. Inputs cannot specify arbitrary fetch URLs, modules, resolvers, or server paths.

### 5.3 Accounts and synchronization — optional

Accounts support cross-device persistence and private sharing, not basic simulation. Start only when local schemas are stable, export/import and migration work, users have a real cross-device need, and the operator has approved data-handling and cost decisions.

Plan object ownership, per-device revisions, conflict copies, export/deletion access, recovery, and retention periods. Builds and experiments default to private; sharing explicitly publishes a particular immutable revision. Use an established authentication solution and assess session security, CSRF, and authorization isolation rather than designing a password protocol. Website accounts remain separate from game logins.

### 5.4 Community and content — optional

Begin with reviewed reference pages, release notes, example teams/rotations, and public ReplayPacks. Each states applicable versions, input conditions, data gaps, and recomputable results. Only then investigate comments, favorites, following, or public discovery.

Do not rank different scenarios by one DPS number. Show comparable conditions and avoid presenting low-coverage, assumption-heavy results as strength conclusions. Treat all user text as untrusted; restrict formats/links and sanitize HTML. Define reporting, withdrawal, version takedown, copyright feedback, anti-spam, and moderation ownership before enabling public publication. Community features do not block local computation.

## 6. Deployment, privacy, and operability

### 6.1 Release gates

- Review the working tree, ignore rules, source caches, personal information, temporary artifacts, and secrets before establishing a recoverable version. Do not blindly commit the directory. Current `.gitignore` has no general source `.cache` exclusion, so evidence/cache storage policy must be settled before publishing a repository.
- Separate development, preview, and production configuration. Each application build binds to an approved data manifest; production must not fetch “latest” game data on startup.
- CI installs from the lockfile and runs typecheck, lint, tests, offline generator fixtures, production build, and delivered browser workflows. Use fixed test services only where necessary; random external API availability must not decide correctness gates.
- Review preview artifacts before release. Retain paired previous application/data versions for rollback. Prefer backward-compatible additive database migrations first. Rehearse behavior for old clients and old share links during rollback.
- Maintain an inventory of dependency, icon, font, source-data, and content redistribution licenses. Public deployment is a later execution decision; this document selects no provider, opens no account, uploads no data, and publishes no website.

### 6.2 Observability

Proposed structured events include version tuples, anonymous session/job correlation IDs, error codes, queue wait, execution time/expanded nodes, cancellation latency, peak memory, and data-verification/withholding counts. Distinguish parser failure, source conflict, authorization rejection, exhausted resource budget, and program failure.

Do not collect complete builds, rotations, UIDs, notes, or raw import files by default. For diagnostics, users can deliberately generate a sanitized replay package. Error reporting uses an allowlist of fields rather than automatically uploading request bodies and tokens. Product analytics collect the minimum usability information; choice and retention policies are settled before deployment.

Prioritize alerts for failed data-release protections, unauthorized access, error-rate spikes, sustained queue backlog, unexpected job cost, and result-hash differences. A known unsupported mechanic is a capability limitation, not a runtime crash alarm.

### 6.3 Security acceptance

Client-side imports are also untrusted: limit size, decompression expansion, and nesting depth; validate schemas, reject prototype-pollution keys, and escape text. JSON data must not become arbitrary HTML or code. Servers must not offer arbitrary URL proxying; public-profile queries allow only approved sources and strict identifier formats to prevent SSRF.

Backend scope includes request throttling, job quotas, timeouts/forced cancellation, object-level authorization tests, log redaction, dependency vulnerability response, and secret management. Assess CSP, image-source allowlists, cache isolation, and cross-origin policies for the chosen deployment. Current third-party images contact outside services; account for them in privacy/offline behavior and investigate caching only where licensing permits.

Local-first does not mean complete offline functionality already exists. Numerical computation can run locally; image and on-demand data-chunk caching/fallback need separate design. An offline bundle or PWA remains optional future scope, not a claim justified solely by the absence of a backend.

## 7. Quality system and completion criteria

### 7.1 Test layers

| Layer | Work | Failure prevented |
|---|---|---|
| Generator unit/offline fixtures | Agreement, missing rows, truncated level tables, conflicts, mixed versions, units/rounding boundaries, structural caps, unknown parsing syntax | Validation logs an issue but still generates trusted values |
| Evidence replay | Frozen snapshots → normalized evidence → verification report → identical artifact digest; independent anchors reference recorded evidence | Output validates itself; shared-upstream errors masquerade as independent confirmation |
| Declarative schema | IDs, dependencies, finite values, unlocks, targets, durations, forbidden functions, legal equipment combinations | Plain data compiles but cannot execute or cross transport boundaries |
| Unit/boundary | Preserve existing damage, reaction, energy, cooldown, stat, and resource boundary tests | Mathematical or timing-edge regression |
| Independent goldens | At least one independently calculated/source-measured baseline per shared mechanic; real-character build cases pinned to data versions | The function under test creates both expected and actual results |
| Property/metamorphic | Same input/order; input immutability; equivalent canonical inputs; split/resume equivalence; prefix consistency; finite outputs; irrelevant metadata has no numerical effect | State-space bugs missed by selected examples |
| Differential | Same request through direct engine, website adapter, Worker, and eventually server; cold replay versus resume; external simulators only as investigation signals | Correct engine tests while website/remote paths lose builds or mechanics |
| Wiring mutation | Disconnect talent/equipment/Buff/Worker-result bindings in a temporary copy and require relevant end-to-end assertions to fail | Tests establish presence but not an effect on results |
| Performance | Retain counted complexity gates; fixed-hardware first-load/input/Worker-start/memory/cancel/long-log measurements | Fast small examples hide growth, frozen UI, or ineffective cancellation |
| Browser/accessibility | Real keyboard, mobile layout, focus, screen-reader status, zoom, and delivered import/save/search flows | Node model tests cannot prove actual usability |
| Backend/operations | Authorization matrix, idempotency, cancellation races, retry, quotas, backup restore, data rollback | Tenant-isolation failures, duplicate jobs, mismatched results and versions |

Property tests are not unconditional monotonicity tests. More ATK may not affect pure HP damage; altered action duration can change Buff/reaction outcomes; a wider beam does not promise improvement under every early-stop policy. State each property's preconditions, domain, and exceptions. Test input generation may use a reproducible seed; randomness stays in test generation, and simulation itself remains RNG-free.

External differential testing requires matching versions, enemies, initial state, constellations, equipment, timing, crit mode, and supported mechanics. Classify disagreements as input/model/data/rounding/missing-mechanic issues; do not average or blindly follow another tool. Unverified external results must not automatically update goldens.

### 7.2 Minimum release qualification

Validate each delivered feature through its real entry path: input selection → applicable import/storage boundary → DTO → equipment/ability assembly → engine → displayed result, with export/replay added when that product slice ships. Coverage claims cannot exceed the weakest delivered link. **M1 Worker/optimizer acceptance does not require M5 persistence or portable exports**; test the shared request and direct/Worker replay at M1, then extend the same evidence chain for M5. Data batches separately expose source completeness, semantic verification, execution coverage, and website wiring coverage.

P0 gates: no unapproved candidate data in released packages; no undisclosed unknown numbers in trusted results; independently tested claimed behavior; relevant determinism/resume/authorization checks pass. Characters with unsupported mechanics may remain explicitly limited, but passing tests must not imply complete support.

Initial performance budgets are **proposed targets**, to be measured on fixed devices/input sets before ratification: core inputs usually respond within 100 ms; cancellation normally produces visible acknowledgment within 500 ms; larger first-time data loads expose progress; search does not cause sustained main-thread blocking. CI must not substitute arbitrary-machine absolute timing for complexity tests. Production p95/SLO values require actual capacity and samples, not invented claims before a service exists.

Target WCAG 2.2 AA: complete keyboard workflows, visible focus, dialog focus restoration, labels/error associations, live status announcements, non-color-only information, contrast, Chinese truncation/wrapping, touch targets, 200% zoom, and narrow-screen reflow. Combine automated scans with manual review. Actual 200% zoom verification was incomplete in the last cycle and remains an acceptance item.

## 8. Work packages, priorities, and dependencies

P0 prevents false confidence and unrecoverable releases; P1 delivers core usability; P2 adds scale/coverage; P3 is optional expansion. These are planning tasks, not completed implementation except where the baseline explicitly states otherwise. The manager assigns ownership under AGENTS. New `scripts` and platform modules need explicit ownership; this plan does not implicitly authorize cross-module rewrites.

| ID | Priority / status | Deliverable and boundary | Dependencies | Acceptance/testing |
|---|---|---|---|---|
| DATA-001 | P0 / Verified gap | Withhold missing/conflicting multipliers; count level completeness; align source claims with behavior | Established source policy | Injected conflict/missing/truncated tables cannot produce verified numbers; assert reports and failed publication; previous approved package unchanged |
| DATA-002 | P0 / Verified gap | Version-isolated caches, per-response evidence, manifest, staging/atomic publication | DATA-001; PLAT-001 | Reject mixed versions; reused cache retains original provenance; interruptions preserve release; identical snapshots yield identical digests |
| DATA-003 | P1 / Proposed | Released roster denominator, identity/form/field/execution/test matrix, conflict ledger | DATA-001/002; engine capability inventory | Traceable denominator; one Traveler identity; uncertain release state isolated; no support overclaims |
| DATA-004 | P1 / Verified gap | Generated weapon registry cutover, old-ID compatibility, level/ascension/refinement contract, separate presentation metadata | DATA-002; equipment-contract review | Website reaches generated record; low-star cap/missing value/old ID tests; physical-versus-elemental controls; non-L90 values affect output |
| DATA-005 | P1 / Verified gap | Two-source artifact acquisition/generator; sets, slots, legal main-stat tables | DATA-001/002; source-access/license research | Replace unsourced table as trusted input; withhold unsourced values; slot/level combinations; reproducible generation |
| DATA-006 | P1 / Proposed | Shared weapon/artifact/character effect backlog and first verified Buff batches | DATA-003; applicable DATA-004/005; required engine primitives | Matching presentation/declaration/execution identity; R1–R5, 2/4-piece, stacking/unlock boundaries; no double application |
| DATA-007 | P1 / Proposed | Fixed-stat inventory, item instances, build revisions, copy/lock/allocation constraints | DATA-004/005; PLAT-002; UI specification | Lossless save/reopen; no duplicate instance in simultaneous team; replacement recomputation; explicit missing slots |
| DATA-008 | P2 / Verified gap | Verified enemy records, versioned challenge scenarios, user assumptions | DATA-002; engine scenario contract | Traceable RES/level/phase evidence; test enemy distinct from released records; no invented real-enemy behavior |
| DATA-009 | P1/P2 / Proposed + Research | Local-file import first; GOOD/public-profile adapters later | DATA-007; portable PLAT-003; local PLAT-006 slice | Preview/deduplication/units/unknown fields/error paths; repeated/partial imports do not corrupt storage; no game credentials |
| DATA-010 | P2 / Proposed | Incremental candidate updates, impact reports, explicit approval and rollback | DATA-002/003; QA-002/003 | Updates only propose changes; data/golden diffs reviewable; reject beta contamination and unintended source-scope expansion |
| DATA-011 | P2 / Proposed | Full-roster semantic/mechanics/wiring acceptance in capability batches | DATA-003/006; corresponding engine primitives | Each batch reports complete/withheld/unimplemented features and independent scenarios, not only entry count |
| PLAT-001 | P0 / Verified gap | Working-tree review, recoverable first version, cache/personal-file exclusion policy | Manager review | Local recovery exercise and ignore-rule review; no public push or deletion of unowned files |
| PLAT-002 | P1 / Proposed | Local repository, IndexedDB schema/migrations/transactions/backups | Stable build/experiment DTO subset; no full export-product dependency | Refresh/multi-tab/quota/migration tests; “已保存” reflects a committed transaction |
| PLAT-003 | P1 / Proposed | Early shared request-schema slice for M1; full ReplayPack v1, canonicalization/version validation and file sharing/replay for M5 | Early: engine DTO/current bundled data identity; portable: DATA-002 and saved-project contract | Early: validated direct/Worker transport; portable: lossless round-trip, explicit incompatibility, encoded permanent duration, no private fields |
| PLAT-004 | P1 / Proposed | Worker boundary, request IDs, progress/cancel/stale-result isolation | Engine/optimizer execution contract; only early PLAT-003 schema slice | Direct/Worker equivalent request results; termination releases resources; old jobs cannot replace current-input results; no wait for M5 exports |
| PLAT-005 | P2 / Research | Server search API and bounded job executor | Shared PLAT-003 schema; PLAT-004; QA-005; real local measurements | Idempotency/state machine/quotas/authorization/cancel races/direct replay; approved capacity/cost decision |
| PLAT-006 | P1 → P2 / Proposed | Local import validation first; server authorization/privacy/log policy later | Relevant PLAT-003 schema; DATA-009 adapter review; server-enablement decision for backend slice | Malicious files/text/URLs and unauthorized access rejected; export/delete policy; private inputs absent from logs |
| PLAT-007 | P1 / Proposed | CI, preview artifacts, release/rollback procedure | PLAT-001; QA-001/002; delivered QA-006 flows | Lockfile build, offline data verification, paired app/data rollback; actual publishing remains a later authorized action |
| PLAT-008 | P2 / Proposed | Observability, diagnostic packs, capacity/queue/cost alerts | Relevant PLAT-005/006/007 scope | Failures diagnosable, sensitive fields removed, versions correlated, overload exercised |
| PLAT-009 | P3 / Research | Optional website accounts and cross-device synchronization | PLAT-002; portable PLAT-003; PLAT-006; product/operational decision | Private defaults, object isolation, preserved conflicting revisions, export/deletion on account closure |
| PLAT-010 | P3 / Research | Hosted short shares, reference content, optional community | Applicable PLAT-003/006/009 capabilities; public sharing need not require user accounts | Version/recomputation status, withdrawal/reporting/moderation/copyright process; no misleading cross-scenario rankings |
| QA-001 | P0 / Proposed | Baseline inventory and generated/executed/wired evidence ledger | Current code | Treat 1791 count as historical reference; verify/archive each claim; do not redispatch completed work |
| QA-002 | P0 / Proposed | Offline generator fixtures; conflict/completeness/atomic-publication gates | Stable DATA-001/002 interfaces | Fault injection causes genuine failures; no live API dependency; report denominators match artifacts |
| QA-003 | P1 / Proposed | Independent goldens and precise character-capability coverage | DATA-003; source evidence | Expected values not self-generated by the engine; broad evidence claims match actual assertions |
| QA-004 | P1 / Proposed | Property/metamorphic/differential tests and key wiring mutation | Relevant engine contracts; early PLAT-003/004 for M1, portable replay later | Explicit preconditions; reducible/replayable failures; temporary-copy mutation detects disconnected bindings |
| QA-005 | P1/P2 / Proposed | Data/Worker/browser performance and eventual server-capacity budgets | PLAT-004; DATA-004 as delivered; PLAT-005 later | Counted complexity plus fixed-device baseline; bundle/memory/cancel measurements; no claim of already-passed proposed budgets |
| QA-006 | P1 / Proposed | Real-browser core flows and WCAG 2.2 AA acceptance | Delivered UI/frontend slices; PLAT-004 at M1, PLAT-002 at M5 | Keyboard/screen-reader/mobile/200%/search cancellation and adoption; extend to import/save when delivered; real screenshots/logs |
| QA-007 | P2 / Proposed | Backend authorization/failure/recovery/privacy acceptance | Applicable PLAT-005/006/007/008 | Cross-user rejection, idempotent retries, backup restoration, job cost caps, no production personal data in tests |

### 8.1 Domain phases mapped to master milestones

DP labels organize this domain plan; they are not an alternative ordering of the master's M0–M8 milestones. Work within different DP phases may proceed in parallel when its specific dependencies are met.

| Domain phase | Scope and dependency path | Master milestone mapping |
|---|---|---|
| **DP0 — Trustworthy foundations** | PLAT-001 + QA-001 → DATA-001/002 + QA-002; prepare PLAT-007 CI. New generated batches become trusted release inputs only after these gates | **M0** trustworthy baseline; release controls continue into **M8** |
| **DP1 — Reachable, responsive computation** | Early PLAT-003 request-schema slice → PLAT-004 with QA-004/005/006. Use existing optimizer APIs and supported inputs. No saved-project or complete ReplayPack prerequisite | **M1** reachable optimizer; shared result evidence supports **M4** explain/compare |
| **DP2 — Verified builds and broader coverage** | DATA-003/004/005 → applicable DATA-006 batches; DATA-008/010/011 follow source maturity and corresponding engine primitives. QA-003/004 checks data/behavior claims | **M2** real builds; evidence for **M3** time/reactions and **M4** explanations; **M6** broad kit/scenario coverage; inventory/candidate data for **M7** advanced optimization |
| **DP3 — Durable, portable projects** | Stable shared schemas → PLAT-002, DATA-007, portable PLAT-003 and local DATA-009/PLAT-006; QA verifies true save/import/export/replay paths | **M5** reusable projects; inventory foundation also supports **M7** |
| **DP4 — Release readiness** | Incremental PLAT-007/006 + applicable QA-006. Prepare approved artifacts, licenses, privacy boundaries, and paired rollback before a hosting decision. Public deployment does not require accounts or server search | CI/reproducibility begins at **M0**; operational release gate is **M8** |
| **DP5 — Optional operated services** | Based on measured need, stage PLAT-005/008/009/010 and QA-007; do not bundle all platform features into first release | **M8** public service; server compute may support **M7**, but is not required for local M7 work |

The master remains the outcome schedule. In particular, M1 can start while M2/M3 are designed; DP3/M5 persistence must not be placed ahead of the initial optimizer merely because storage and transport share a schema.

## 9. Dispatchable task briefs

`#061-xx` identifiers are planning subtask numbers; the manager maps them to the active queue when dispatching. The listed file boundaries are proposed assignments; check current uncommitted work before implementation. No two contributors edit the same core file. “First wave” means preparation-ready briefs, not a demand to deliver M5 storage/export before M1.

### TASK #061-01 — DATA-001

Owner: Manager-designated data-generation implementer with independent QA; explicitly assign the `scripts` paths.
Goal: Enforce withholding of missing/conflicting character multipliers instead of only logging them.
Dependencies: Established two-source/withhold-on-conflict policy; QA-001 baseline.
Files / module: `scripts/generate-characters/{parse,emit}.py` and dedicated generator tests; generate into a separate candidate directory, not live `generated`.
Requirements: Return actionable field/table coordinates from validation; check expected length, missing rows, and same-named ability slots; do not emit unconfirmed multipliers; distinguish reference text from executable values; report expected/compared/passed/withheld totals; correct source headers.
Acceptance Criteria: Previously approved inputs remain reproducible. Injecting a contradiction, missing row, or missing final level removes affected executable data and yields a machine-detectable failed-publication/restricted-candidate state. No swallowed exceptions or zero-filled unknowns. Any reduced candidate coverage comes with a reviewable impact list.
Tests: Offline fixtures for rounding boundaries, single-source rows, genuine conflict, truncated tables, and same-named rows across skills. In a temporary copy, QA disables withholding and confirms failure. No network dependency.

### TASK #061-02 — DATA-002

Owner: The same data-generation implementer; manager approves the manifest contract.
Goal: Prevent mixed-version batches and interrupted generation from damaging an approved release.
Dependencies: DATA-001; PLAT-001 recovery point; manifest DTO review.
Files / module: `scripts/generate-characters/fetch.py`, `scripts/generate-weapons/fetch.py`, generator publication boundaries, and a shared data-pipeline module at a manager-approved path.
Requirements: Version/batch isolation; per-response source/digest; original retrieval dates on reuse; fully validated staging before promotion; scheduled fetching never automatically publishes.
Acceptance Criteria: Old details under a new manifest are rejected or accurately reference old snapshots. Failures leave current output untouched. Equal inputs produce equal content digests. Candidates include conflict, coverage-loss, and version diffs.
Tests: Disconnection, partial download, corrupt JSON, mixed version, and interrupted-write injection; identical digests from repeated offline generation; recoverable failed promotion.

### TASK #061-03 — DATA-004

Owner: Data implementer owns `src/game-data/weapons`; dispatch frontend consumers separately. uiux-engineer specifies selection/missing-value disclosure first.
Goal: Make website weapon combat values use verified generated data while preserving old IDs and Chinese reference presentation.
Dependencies: DATA-002; equipment contract and level/ascension-coordinate decision; cross-layer caller inventory.
Files / module: First task only `src/game-data/weapons/{registry,types}.ts` and a dedicated adapter. A subsequent frontend task changes `weaponModel.ts` and picker components; no simultaneous contract edits.
Requirements: Source-ID/legacy-alias mapping; source-supported rarity range; numbers from per-level generated tables; refinement affects only supported effects; explicit invalid-level/missing-value behavior; labels/images do not smuggle in unverified combat values.
Acceptance Criteria: A verified weapon selected on the website traces to the same generated record at damage execution. Changing level matters; above-cap low-rarity levels are rejected; old IDs do not change items. Independent physical/elemental controls determine the correct physicalDmg channel mapping.
Tests: Registry/source consistency, aliases, unknown IDs, low-rarity caps, level coordinates; frontend physical/elemental controls and repeated replacement without accumulation. Retire old combat values only after cutover, preserving aliases.

### TASK #061-04 — DATA-005

Owner: Data implementer; mechanics-engineer implements executable effects separately.
Goal: Establish traceable artifact data instead of treating the unsourced table as trusted input.
Dependencies: DATA-001/002; two-source access, released scope, and licensing research.
Files / module: Proposed `scripts/generate-artifacts/`, `src/game-data/artifacts/generated/`, registry/types; no Buff or React changes.
Requirements: Record evidence for sets and fixed main-stat values, slot/rarity/level legality; retain conditional-effect text without automatically compiling incomplete semantics; no random-upgrade model.
Acceptance Criteria: Every executable number has evidence coordinates; values without two sources are withheld; output is reproducible; reference records and executable set-effect support remain separate.
Tests: Source conflicts, unknown fields, slot restrictions, caps, table completeness, generation replay; supply manager with data diffs and affected features before acceptance.

### TASK #061-05 — PLAT-003, early shared-schema slice

Owner: Manager owns the contract; frontend implementer writes DTO/codec code, with combat-engineer reviewing the execution boundary.
Goal: Freeze the minimal plain-data request needed for website-to-Worker simulation/search at master M1, reusable later by storage and ReplayPack.
Dependencies: Existing engine/optimizer inputs; master build/rotation/scenario model; current bundled data identity. A finalized DATA-002 manifest and the full M5 export product are not prerequisites for this early slice.
Files / module: Proposed shared request types under `src/types/` and codec/validation under `src/features/simulation/`; final paths coordinated with the engine/optimizer plan. No server required.
Requirements: Schema/engine/data identity, selected build/scenario inputs, request/input identity, permitted settings, explicit permanent-duration representation, and executor-side resolver construction. Never serialize resolver functions, game credentials, or UID. Keep the schema extensible for the later portable envelope without implementing its entire UX now.
Acceptance Criteria: One validated request yields matching direct-engine and Worker results; website configuration survives conversion; originals remain unchanged; unsupported transport fields fail explicitly. Search delivery can proceed without file export, historical runtimes, or saved projects.
Tests: Structured-clone/codec round-trip, field-order normalization where used, Infinity/function handling, unknown IDs/settings, unsupported schema, and stale request identity. At M5 extend the same fixtures for file limits, canonical pack hashes, migration, tampering, and missing historical packages.

### TASK #061-06 — PLAT-002, master M5 preparation

Owner: Frontend implementer; uiux-engineer owns save/recovery/conflict specifications; manager reviews the storage seam.
Goal: Preserve teams, rotations, scenarios, and build revisions across refreshes and support recovery.
Dependencies: Stable build/experiment subset of PLAT-003; no account dependency and no gate on M1 delivery. Coordinate portable backup export as part of the M5 product slice.
Files / module: Proposed `src/features/workspace/` and `src/lib/storage/`; pages consume services and contain no damage math.
Requirements: IndexedDB transactions, schemaVersion, recoverable migration, revisions, multi-tab overwrite protection, visible save failures, and cache deletion that preserves source records.
Acceptance Criteria: In a real browser, create/configure/edit/refresh/resimulate with matching values. Migration/quota failure preserves exportable original records. Input changes mark prior results stale.
Tests: Repository contract, migration fixtures, concurrent-tab conflicts, injected quota failure, full browser save/restore; disabled storage falls back to explicitly disclosed in-memory operation.

### TASK #061-07 — QA-002 / QA-003

Owner: qa-engineer, keeping test/review evidence independent of generator and engine authors.
Goal: Detect false verification, disconnected execution, and inflated coverage claims.
Dependencies: QA-001; DATA-001/002 interfaces; existing talent reconciliation and coverage modules.
Files / module: `src/tests/`, independent data fixtures, and manager-approved generator-test paths; no runtime engine/data changes.
Requirements: Audit coverage evidence against actual field assertions. Establish independently expected results for multiplier withholding, generated weapon wiring, talent channels, and stat boundaries; record non-applicable cases.
Acceptance Criteria: Injecting a source contradiction or disconnecting a real call causes relevant tests to fail. A whole-roster smoke run does not become proof that every character's reactions were verified.
Tests: Offline replay, independent golden anchors, temporary-directory mutation. Report passed and unverified cases; equivalent mutants are not evidence of successful detection.

### TASK #061-08 — PLAT-007 / QA-006, incremental gate preparation

Owner: Manager assigns engineering-configuration paths; qa-engineer defines browser acceptance; uiux-engineer reviews accessibility.
Goal: Turn manual checks into reproducible artifacts and actual-browser validation of delivered workflows.
Dependencies: PLAT-001, lockfile, stable data fixtures, and the initial page paths. Add M5 import/save flows when they are delivered rather than blocking M1 checks on them.
Files / module: Proposed CI configuration, browser-test configuration/fixtures, release instructions; no actual provisioning or deployment.
Requirements: Pin runtime/dependencies; typecheck/lint/test/build and offline data checks; Chinese layout, mobile, keyboard, 200% zoom; no production personal data.
Acceptance Criteria: A clean checkout produces an artifact with version identity. Deliberately disconnecting build/talent bindings fails relevant real-user flow assertions. Screenshots/logs locate failures. Production deployment remains a separate later decision.
Tests: CI job and equivalent local execution; initially team setup/simulation/search/adopt, later import/save/restore/export; automated accessibility scans plus manual keyboard/screen-reader records.

## 10. Research questions and non-blocking defaults

| Question | Current default | Decision required before |
|---|---|---|
| How to verify released game version/source branch | Do not accept a mirror's “latest” as proof; isolate candidates | First trusted new release under DATA-002/003 |
| What two shared-upstream mirrors establish | Numerical agreement plus structural constraints; disclose missing independent semantic evidence | Claiming complete support for a rule |
| External inventory protocols/public profiles | Product-native files first; no full-account inventory promise | Adding an external DATA-009 adapter |
| Historical engine/data retention | Explicit incompatible/read-only behavior; no unlimited exact-replay promise | First public portable sharing release |
| Local versus server search | Worker-first using the early shared schema; collect non-sensitive performance evidence | Starting PLAT-005 |
| Account/storage provider and cost | Account-free basic use; no provider selected | Provisioning PLAT-005/009 |
| Image/data redistribution rights | Maintain source/asset inventory; do not assume mirroring permission | Public release under PLAT-007 |
| Long-term source maintenance | Updates create candidates requiring approval | Starting DATA-010 |

This planning deliverable is complete when tasks have verifiable dependencies, file boundaries, and acceptance criteria. Actual completion of full-roster coverage, unresolved mechanics, external protocols, and public deployment must follow later implementation and evidence; a detailed plan cannot close those gaps in advance.
