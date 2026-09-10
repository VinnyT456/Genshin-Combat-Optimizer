# TASK #064 — Rotation Search: Trustworthy, Accessible Workflow

**Owner:** `uiux-engineer`  
**Status:** implementation specification; Manager review required  
**Primary implementation owner:** `frontend-engineer`  
**Lower-layer dependency owners:** `optimizer-engineer` + platform/Manager  
**Related work:** UX-005, UX-007, UX-026, UX-044–050, UX-054, UX-091–095; OPT-008/009; PLAT-004  
**Files in scope for the later implementation:** `src/features/optimizer/*`, the search orchestration in `src/app/page.tsx`, and one shared Worker/job seam agreed with the Manager  
**Out of scope:** new objectives, search constraints, game mechanics, build/team search, persistence, and automatic adoption

## 1. Goal and release boundary

Make the existing fixed-team rotation search usable as one trustworthy workflow: configure an objective and effort budget, start a search against an immutable snapshot, understand its actual progress, cancel or retry it, inspect up to five independently replayed candidates, and deliberately copy one into the rotation editor without losing the prior draft.

This slice exposes only capabilities the current optimizer supports:

- fixed current team/build and enemy;
- `总伤害` and `秒伤（DPS）` objectives;
- a 5–60 second search window;
- `快速` / `均衡` / `深入` effort presets;
- Top-5 legal rotation candidates;
- one-level restore of the rotation that existed before the first candidate copy.

The release claim is **“在本次搜索范围与预算内找到的候选”**. Never call a candidate `全局最优`, `最优`, `最佳`, `推荐循环`, or guaranteed in game. A larger effort preset explores more work; it does not guarantee a better candidate.

The complete slice depends on O-JOB: a Worker-backed job with cancellation, error isolation, progress events, immutable request identity, obsolete-response rejection, and from-zero replayed candidates. The frontend may implement the static layout and pure state reducer against mocks first. It must not fake percent progress or expose a cancel button around the current synchronous main-thread call.

## 2. Current UI audit

### Keep

- The panel is in the rotation stage and does not require a hand-authored rotation before search.
- Objective options match the engine contract and default to total damage.
- Budget options describe effort rather than promising result quality.
- Search duration is bounded in the adapter, not only in the input.
- Results report actual count versus requested Top-N.
- Each candidate shows rank, objective score, actual duration, action count, and an action preview.
- Copy is explicit. `incumbentRotation.ts` retains the original draft across browsing multiple candidates, and a manual edit clears the restore offer.
- A fresh simulation run is the only eligible comparison baseline.

### Correct in this slice

1. `window.setTimeout(... runSearch())` still executes synchronously on the main thread. The page can paint once and then becomes unresponsive. There is no honest cancel, retry, error isolation, or live progress.
2. The state model has only `idle | searching | results | empty`. It cannot represent cancellation, failure, stale output, or a retained prior result while a new search runs.
3. Search inputs are read from live page state when the timeout callback executes. They are not represented by a visible immutable request snapshot or a request fingerprint.
4. Older jobs have no identity guard and could overwrite newer state once execution becomes asynchronous.
5. `SEARCH_SCOPE_NOTICE` says `最佳结果`. Beam search establishes ranked candidates among those emitted, not the best reachable rotation. Replace this phrase.
6. The search summary exposes `束宽` in the default beginner flow. Beam width is an algorithm parameter, not a user decision. Put it in expandable `搜索详情`.
7. The loading copy says the page will briefly stop responding. That is an implementation defect, not an acceptable product state.
8. Results do not disclose the effective start-time team, enemy, crit mode, search window, or version. Editing the live draft can therefore make an old ranking look current.
9. Comparison copy says only `无基线可比较`. It must distinguish `尚未模拟当前循环`, `基线已过期`, and `目标已改变` where those facts are known.
10. The action preview is useful but candidate adoption is labeled `复制到编辑器` before a distinct preview/selection state exists. Selection must remain non-destructive; copying is a separate action.
11. Choice controls and candidate actions can be shorter than the design system's 44×44px mobile target. Dense horizontal rows can overflow at 200% zoom.
12. Search completion is announced through the page-wide live region, but start, cancellation, failure, staleness, selection, copy, and restore do not have a defined focus/announcement policy.

## 3. Information architecture and layout

Keep the section title `循环搜索`. Inside it, use four ordered regions:

1. **条件** — objective, time window, effort preset, and a visible effective-scope summary.
2. **Job status** — current immutable request, progress, cancel/retry, and state message. This region remains mounted between states.
3. **Candidates** — count, selected-candidate preview, ranked list, and search details disclosure.
4. **Editor handoff** — the persistent restore banner after a candidate is copied.

At desktop width, conditions may use a two-column grid, while status and candidates use the full section width. Below `sm`, every control and candidate action stacks into one column. DOM order must match the visual order. At 200% zoom, allow natural wrapping and vertical growth; no fixed card height, clipped prose, or page-level horizontal scrolling.

## 4. Immutable search request and visible disclosure

Starting a search creates a `SearchRun` bound to a deep, serializable snapshot. Later edits affect the next draft only. They never relabel or mutate the active/completed run.

The always-visible pre-start summary reads:

> 搜索范围：当前阵容与配置 · {enemyName} · {objectiveLabel} · {durationSeconds}秒 · {budgetLabel}

Directly below it:

> 搜索会组合当前阵容可执行的切人、普通攻击、元素战技与元素爆发。结果是本次预算内找到的候选，不代表全局最优，也不保证实战表现。

Only name action classes the action generator actually emits for this team. If charged/plunge/positioned normals are supported in the effective action space, derive their Chinese labels from the request metadata. Do not hard-code a broader list in React.

While a job is active, render `本次搜索条件` from `activeRun.requestSummary`, not from live controls:

- team member Chinese names and effective build/config identity;
- enemy Chinese name and level;
- objective and unit;
- requested and effective time window;
- effort preset;
- crit mode and other result-affecting simulation settings;
- engine/data/search version or explicit `版本信息暂不可用`.

If the live draft diverges, show a warning above the status/result:

> 当前配置已更改。本次搜索仍使用开始时的配置；结果完成后不会自动应用。

Offer `使用当前配置重新搜索` after the active job ends. Starting it creates a new run; it does not mutate old candidate data.

## 5. Exact frontend state contract

Use orthogonal draft, job, result, selection, and adoption state. Do not encode all conditions in one phase string.

```ts
type SearchJobStatus =
  | "idle"
  | "queued"
  | "running"
  | "canceling"
  | "canceled"
  | "succeeded"
  | "empty"
  | "failed";

type SearchProgress =
  | { kind: "indeterminate"; nodesExpanded: number; depth?: number }
  | {
      kind: "determinate";
      completed: number;
      total: number;
      nodesExpanded: number;
      depth?: number;
    };

interface SearchRunViewModel {
  runId: string;
  requestFingerprint: string;
  requestSummary: EffectiveSearchSummary;
  status: SearchJobStatus;
  progress: SearchProgress | null;
  startedAt: number | null;
  outcome: SearchOutcome | null;
  error: SearchErrorView | null;
  staleReasons: readonly SearchStaleReason[];
}

interface SearchUiState {
  draft: SearchDraft;
  activeRun: SearchRunViewModel | null;
  selectedCandidateId: string | null;
  adoption: AdoptionState;
}
```

`staleReasons` are derived by comparing the live request fingerprint with `activeRun.requestFingerprint`. At minimum map `team`, `build/config`, `enemy`, `objective`, `duration`, `budget`, `simulation settings`, and `version`. Do not discard a completed result merely because it became stale.

The panel's implementation props should converge on this shape:

```ts
interface RotationSearchPanelProps {
  draft: SearchDraft;
  run: SearchRunViewModel | null;
  blockedReason: string | null;
  selectedCandidateId: string | null;
  canRestore: boolean;
  adoptedCandidateId: string | null;
  onDraftChange(next: SearchDraft): void;
  onStart(): void;
  onCancel(runId: string): void;
  onRetry(): void;
  onSelectCandidate(candidateId: string): void;
  onAdoptCandidate(candidateId: string): void;
  onRestore(): void;
}
```

The component receives display-ready summaries and identifiers. It does not compute fingerprints, score candidates, infer action legality, or reconstruct effective engine settings.

## 6. State behavior and exact Chinese copy

### Idle / blocked

- Heading: `尚未搜索循环`
- Body: `设置搜索目标、时间窗口与投入程度后，开始查找当前阵容可执行的循环。`
- Primary action: `开始搜索`
- Empty-team disabled reason: `请先配置至少1位出战角色。`
- Invalid duration is an inline field error: `请输入5至60秒。` Use `aria-invalid` and `aria-describedby`; do not silently clamp a value the user is actively editing. The adapter remains the final safety clamp.

### Queued / running

- Queued status: `正在准备搜索…`
- Running status: `正在搜索循环…`
- Primary job action: `取消搜索`
- Keep the request summary visible and freeze its controls. Live page edits may continue only if the page architecture can clearly separate them as `下一次搜索配置`; otherwise disable relevant editors with the adjacent reason `本次搜索完成或取消后可修改。`
- Set `aria-busy="true"` on the status/result region, not on the whole page.

Progress rules:

- If the worker reports only nodes, show `已展开 {n} 个搜索节点` and an indeterminate bar/spinner. Never derive a percent from node count.
- Show `{completed}/{total}` and a determinate `progressbar` only when the backend supplies a stable, meaningful total for this exact phase. Expose `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- Optional depth text: `正在处理第 {depth} 层`. Depth is not a percent.
- Throttle visual/live updates so input and assistive technology remain usable. Announce start once, then at meaningful phase boundaries or no more than about every 5 seconds. Do not announce every node.
- Do not show remaining time without a measured estimator and explicit uncertainty.

### Canceling / canceled

- Immediately change the button to disabled `正在取消…`; retain focus on it until the worker acknowledges termination.
- On acknowledgment: `搜索已取消。当前配置和已有结果均已保留。`
- If the job contract does not return independently replayed partial candidates, show none. Do not scrape in-progress Worker state.
- If a previous completed result exists, keep it visible with `此前搜索结果` and its original request summary.
- Move focus to the status heading after acknowledgment. Provide `重新搜索`.

### Failed

- Heading: `搜索未完成`
- Generic body: `搜索过程中发生错误。当前配置和此前结果已保留。`
- Recoverable worker failure: `搜索进程意外停止。可以使用相同条件重试。`
- Invalid request: render the mapped Chinese reason and an action that focuses the responsible field.
- Actions: `重试相同条件` and, when the draft differs, `使用当前配置搜索`.
- Never render zero damage, an empty candidate list, or `未找到候选` for a failure.
- Put diagnostic identifiers behind `搜索详情`; do not expose raw exception prose as the primary message.

### Empty

- Heading: `未找到可执行的候选循环`
- Body: `本次搜索在上述阵容、敌人、时间窗口与投入程度下未返回候选。`
- Evidence-backed remedies only: `提高投入程度`, `延长时间窗口`, or configuration repair when a structured reason identifies one. Do not suggest removing constraints until UX-051 and an enforced constraint interface exist.
- Show `已请求5个，找到0个` and the exact completed-run summary. Empty is a successful run, not an error.

### Succeeded / stale

- Heading: `找到 {found} 个候选循环`
- Short count: `已请求 {requested} 个，找到 {found} 个。`
- Scope sentence: `以下候选按{objectiveLabel}排序，均已使用本次搜索条件从头验证。`
- A stale result remains readable. Warning: `当前配置已更改；以下候选仍对应 {completedAtLabel} 完成的搜索条件。`
- Disable `复制到编辑器` only when adoption would be unsafe under the current team/action identity. Adjacent reason: `当前阵容已更改，无法直接复制此候选。请恢复搜索时的配置或重新搜索。`

## 7. Candidate list, preview, and adoption

Each candidate needs a stable `candidateId`; do not use its array index as identity. Preserve deterministic engine rank. A default row contains:

- `候选 #{rank}`;
- objective score and unit (`总伤害` or `DPS`), formatted as a number only;
- actual replay duration;
- executed action count;
- comparison badge with an explicit baseline state;
- concise first-eight-action preview and `另有 {n} 个动作`;
- `查看候选` action.

Comparison labels:

- valid fresh baseline: `较当前循环 +{pct}%`, `-{pct}%`, or `与当前循环持平`;
- no run: `尚未模拟当前循环，无法比较`;
- stale baseline: `当前循环的模拟结果已过期`;
- objective mismatch: `尚无此目标的可比基线`;
- zero/nonpositive baseline: `基线为0，无法计算百分比`.

Selecting `查看候选` is non-destructive. It expands or opens one detail region linked with `aria-controls` and `aria-expanded`, showing the full chronological action list, effective search summary, score, duration, replay warnings/limitations, and the primary action:

> 复制此候选到编辑器

Supporting text:

> 复制会替换编辑器中的当前循环。第一次复制前的循环会保留，可在手动编辑前还原。

After copy:

- keep the immutable candidate/result in the list;
- update the editor with a cloned rotation;
- preserve the original incumbent across copying other candidates;
- show the persistent banner `编辑器当前使用候选 #{rank}。搜索前的循环已保留。`;
- actions: `前往动作编辑器` and `还原搜索前循环`;
- announce `已将候选 #{rank} 复制到动作编辑器。搜索前的循环已保留。`;
- focus stays on the invoked copy button. `前往动作编辑器` is an explicit focus/navigation action.

After restore, announce `已还原搜索前的循环。` and move focus to the rotation editor heading. Any manual edit after adoption clears the restore offer, matching the existing pure-state contract.

## 8. Optimizer/platform API fields required

The Manager must freeze one Worker/job contract before frontend integration. Existing `optimizeRotation()` may remain synchronous internally, but the website needs an asynchronous wrapper with these observable fields/events:

```ts
interface SearchJobRequest {
  runId: string;
  requestFingerprint: string;
  team: readonly EngineCharacterInput[];
  enemy: EnemyState;
  optimizerConfig: OptimizerConfig;
  simulationConfig: SimulationConfig;
  version: EffectiveVersionInfo;
}

type SearchJobEvent =
  | { type: "started"; runId: string; effective: EffectiveSearchSummary }
  | { type: "progress"; runId: string; progress: SearchProgress }
  | { type: "completed"; runId: string; outcome: SearchJobOutcome }
  | { type: "canceled"; runId: string }
  | { type: "failed"; runId: string; error: SearchJobError };

interface SearchJobOutcome {
  runId: string;
  requestFingerprint: string;
  requestedTopN: number;
  candidates: readonly SearchCandidate[];
  nodesExpanded: number;
  effective: EffectiveSearchSummary;
  completedAt: number;
}

interface SearchCandidate {
  candidateId: string;
  rank: number;
  rotation: Rotation;
  score: number;
  objective: OptimizationObjective;
  result: SimulationResult;
  executedActionCount: number;
  replayStatus: "verified";
  limitations: readonly SearchLimitation[];
}
```

Required semantics:

1. `runId` accompanies every event. The UI ignores events that do not match its current active run.
2. `requestFingerprint` covers every result-affecting input and effective version. It is computed outside presentation code.
3. `effective` reports what actually ran: objective, requested/effective duration, budget preset, numerical effort parameters, Top-N, action-space summary, simulation settings, team/build identities, enemy, and versions.
4. Progress is monotonic within one run. If no stable total exists, emit `indeterminate` with counters only.
5. Cancellation acknowledges termination. After cancel, the job emits no completion that can be adopted. Hard Worker termination is acceptable for this slice.
6. Candidate rotations and results are full from-zero replays. `replayStatus: "verified"` means the candidate passed the engine legality/replay invariant.
7. `candidateId` and tie order are deterministic for identical versioned requests.
8. `SearchJobError` has a stable code, recoverability, optional field target, and safe diagnostic id. Frontend owns Chinese copy mapping; raw internal messages are not user copy.
9. Partial candidates are out of scope unless the lower layer later returns a separately typed, replay-verified partial outcome.

## 9. Keyboard, focus, and ARIA contract

- Use native `fieldset`/`legend` for objective and effort. Existing pressed buttons may remain if each group has a clear legend and selection is announced; a native radio group is preferred for mutually exclusive values.
- Every interactive target is at least 44×44px on mobile and at 200% zoom. The duration input has an associated label and error description.
- Tab order: objective → duration → budget → start → active job action → candidate list → selected preview → adoption/restore actions.
- Do not implement custom arrow-key navigation unless using a conforming radio/toolbar pattern. Native radios provide arrow behavior automatically.
- The status/result container uses `role="region"`, `aria-labelledby`, and `aria-busy` while queued/running/canceling.
- Use one polite live region for state transitions. Errors that prevent continuation may use `role="alert"`. Never nest live regions or announce every progress counter update.
- Starting search leaves focus on the control, whose label becomes `取消搜索` only if it remains the same logical control; otherwise focus the cancel control after the started acknowledgment.
- Completion moves focus to the results heading only when search was explicitly started and focus is still inside the search panel. Do not steal focus if the user moved to edit another area.
- Retry returns focus to the job status heading on failure or to results on success.
- Candidate list is an ordered list. Rank is text, not color alone. Expanded detail follows its candidate row in DOM order.
- Warning, stale, failure, and adopted states include visible text or labelled glyphs; color is supplementary.
- Respect `prefers-reduced-motion`. An indeterminate indicator must have a motion-free equivalent, such as static status text.

## 10. Responsive and 200% zoom rules

- At `<640px`, objective/budget choices and all primary/secondary actions are full-width or wrap as separate 44px rows. Do not compress three effort choices into unreadable pills.
- Candidate metadata uses a vertical definition list on mobile. Score may remain visually prominent; Chinese labels never use the mono font.
- The full action preview becomes a numbered vertical list on mobile. Long character/action names wrap; identifiers use `overflow-wrap:anywhere` only in the details disclosure.
- At desktop, candidate summary may be a row, but copy/preview actions must wrap below metadata before they collide.
- At 200% zoom on a 1280×720 CSS viewport: no page-level horizontal scrollbar; no clipped scope/limitation copy; all job and adoption actions remain reachable; focus rings are fully visible.
- Use Chinese-primary copy to size the cards. No fixed heights or line clamps for state messages, candidate limitations, and request summaries.
- Numerals alone use `font-mono tabular-nums`; strings containing Han characters use the CJK-capable sans stack.

## 11. Acceptance tests

### Pure model/unit

1. Every transition in `idle → queued → running → succeeded/empty/failed` is explicit; running → canceling → canceled preserves the draft and prior completed result.
2. An event with an obsolete `runId` cannot replace progress, result, error, or selection for the current run.
3. Staleness is derived for each result-affecting input and clears only when fingerprints match; stale outcomes remain immutable and visible.
4. Invalid/non-finite duration has a visible validation result and never reaches the job request; the adapter still clamps hostile callers.
5. Comparison labels distinguish missing, stale, objective-mismatch, zero, positive, equal, and negative baselines.
6. Fewer than five candidates reports requested and found counts, including zero.
7. Candidate identifiers and deterministic tie order survive repeated identical requests.
8. Copying candidate 1, then 2, restores the original pre-copy rotation; manual editor change clears restore.
9. Copy modules contain no `最佳`, `最优`, `全局最优`, `保证`, or `推荐循环` claim. The phrase `不代表全局最优` is allowed only as an explicit denial.

### Integration

10. Start-time team/build/enemy/objective/duration/budget/config/version in the rendered summary exactly match the serialized worker request and completed outcome.
11. Changing live inputs during a run marks the run stale without changing its visible summary; completion never auto-applies a candidate.
12. Cancel terminates/acknowledges the Worker. A delayed completion from that run cannot overwrite a newer run.
13. Worker construction or execution failure renders `failed`, keeps the project/draft and previous outcome, and allows same-request retry.
14. Every displayed candidate is independently replayed from time zero, legal, distinct, score-consistent, and ordered by the declared objective.
15. Empty, canceled, and failed are distinguishable and never render fabricated zero metrics.
16. Search progress keeps the main thread responsive under each preset. Counter-only progress never renders a percent or ETA.

### Browser/accessibility

17. Keyboard-only flow completes: configure → start → cancel/retry → select candidate → inspect full preview → copy → go to editor → restore. Focus is visible and follows §9.
18. Screen reader announces start, completion count, empty, canceled, failed, stale, copy, and restore once each without node-by-node flooding.
19. Disabled start/adopt controls have adjacent visible reasons; the duration error is programmatically associated.
20. At 320px width and at 200% zoom, there is no page-level horizontal scrolling or clipped copy; every target is at least 44×44px.
21. At reduced motion, status remains understandable without animation.
22. Chinese names, long limitation text, and five dense candidates wrap without overlap; numeric columns remain aligned.

### Performance

23. Starting, canceling, changing the next draft, and moving focus remain responsive during `深入` search. Use measured interaction/main-thread evidence, plus deterministic node budgets where wall-clock CI assertions would be flaky.
24. Progress event throttling prevents render/live-region storms on a high-node-count fixture.

## 12. Handoff and dependency order

1. **Manager:** review this specification and assign one shared O-JOB contract; approve any additive public API change and update architecture documentation.
2. **optimizer-engineer/platform:** implement Worker-safe request/events, cancellation acknowledgment, progress semantics, error codes, identities, effective summary, and replay-verified Top-N output. Do not edit UI.
3. **frontend-engineer:** implement the state reducer, panel, orchestration, Chinese copy map, focus behavior, and responsive layout against the frozen contract. Do not compute simulation/search facts in React.
4. **uiux-engineer:** perform structured UI review using Issue / Problem / Recommendation / Priority at desktop, mobile, 200% zoom, keyboard, and reduced motion.
5. **qa-engineer:** verify obsolete-response rejection, replay legality, failure/cancel preservation, accessibility, responsiveness, and performance.

The static UI and reducer may be built against fixtures while O-JOB is in progress. Release acceptance waits for the real Worker path; synchronous main-thread search with painted loading state does not satisfy TASK #064.
