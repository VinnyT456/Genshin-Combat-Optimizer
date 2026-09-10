# UI-AUDIT-055 — Post-implementation audit of Phase C

Auditor: `uiux-engineer`. Task #055. Date 2026-09-06 (second pass, re-verified).

Skills invoked: `web-design-guidelines`, `impeccable`.
Docs read: `AGENTS.md`, `docs/ROADMAP.md`, `docs/design/DESIGN-SYSTEM.md`,
`DASHBOARD-AND-DIALOGS-041.md`, `CHARACTER-DETAIL-046.md`, `UI-AUDIT-034.md`.

This replaces the first pass, which was written against a tree that has since
changed. Every finding below was re-verified against the working tree during
this pass. Where a file moved *under* the audit, that is stated explicitly
rather than filed as a defect.

---

## 0. Timing — the tree moved during this audit

`frontend-engineer` is actively implementing Phase C. Two distinct snapshots
were observed **within this single audit run**:

| Time | Files |
|---|---|
| 09-04 10:0x | `Dialog.tsx`, `scrollLock.ts`, `urlState.ts`, `useUrlState.ts`, `AbilityCard.tsx`, `PendingDataNotice.tsx`, `abilityDetailModel.ts` |
| 09-06 14:53 | `page.tsx`, `CharacterPicker.tsx`, `CharacterStatsModal.tsx`, `TeamSlot.tsx`, `WeaponPicker.tsx`, `ArtifactPicker.tsx`, `InsightsPanel.tsx` |
| 09-06 20:08 | `tierPresentation.ts`, `tierPresentation.test.ts` — **rewritten while this audit was reading it** |

Consequence, stated plainly: `npx tsc --noEmit` returned **0 errors** at the
start of this audit and **2 errors** twenty minutes later, both in
`CharacterPicker.tsx`. That is not a regression by the frontend — it is the
expected midpoint of a two-file change (adapter first, caller second). It is
recorded in §6 as IN-FLIGHT, **not** as a finding.

The reported repo state ("typecheck 0, 1651/1654") was accurate when measured
and is already stale. Re-measure before acting on this document.

### Phase C status as verified this pass

| Item | Status | Evidence |
|---|---|---|
| C1 Dialog contract + scroll lock | **LANDED, correct** | `scrollLock.ts:46-51`, `Dialog.tsx:106-110` |
| C3 URL/deep-link state | **LANDED, live** | `urlState.ts:45-50`, `page.tsx:86` |
| C4 Tier at scale (tier-alone ruling) | **LANDED in adapter, caller in flight** | `tierPresentation.ts:69-70` |
| C5 Radius scale enforceable | **LANDED, correct** | `tailwind.config.ts:19-25` |
| C2 Four-row truth table | **NOT LANDED** | `CharacterStatsModal.tsx:478` |
| C6 CJK rules | **PARTIALLY LANDED** | F3, F4, F5 |
| C6 `aria-pressed` | **REGRESSED** | F6 |
| C6 talent levels capped at 11 | **ALREADY FIXED** | `abilityDetailModel.ts:26` |

---

## 1. Answers to the five questions asked

**Q1 — Did the scroll lock ship correctly? YES.** My prediction of a sideways
page jump was wrong for this implementation, and I withdraw it.
`scrollLock.ts:46-51` measures `window.innerWidth - documentElement.clientWidth`
and adds it to the body's *computed* `padding-right` before setting
`overflow: hidden`. It is reference-counted (`:39-40`, `:59-60`) so nested
modals cannot orphan the lock, it reads the computed value rather than assuming
zero, and `Dialog.tsx:106-110` pairs acquire/release in one effect keyed on
`open`. The module comment even documents *why* `overscroll-behavior` was
insufficient. No finding.

**Q2 — Did §7.3's computed baseline land in an adapter or a component? ADAPTER.**
`tierPresentation.ts` is pure, React-free and separately tested.
`CharacterPicker.tsx:180-189` only *calls* it. No UI-inferred tier. No finding.

**Q3 — Is the four-row truth table branched on? NO.** This is F1, the most
serious finding in this document, and it is a correctness-of-claim defect
rather than a styling one.

**Q4 — CJK correctness? PARTIAL.** `lang="zh-CN"` is set and copy is Chinese,
but three specific rulings from DESIGN-SYSTEM §"Language & CJK typography" did
not land (F3, F4, F5), and one English-derived rule my own document ordered
removed is still present (F3).

**Q5 — Guideline/DESIGN-SYSTEM disagreements:** §5.

---

## 2. Findings

### F1 — Constellations claim to be "in effect" when nothing is modelled

**Priority: HIGH.** This is an overclaim, the one failure mode ROADMAP §0 names
as unrecoverable.

**Issue.** `CharacterStatsModal.tsx:478` branches on
`kitDetails.constellations.length > 0` — two cases where the spec requires four.

**Problem.** Three separate defects compound into a false numeric claim:

1. Verified against live data: **1234 of 1234** constellation/passive entries in
   `src/game-data/characters/generated/*.ts` carry `effects: []`. Zero entries
   have a populated `effects` array (`grep -c 'effects: \[\]'` → 1234;
   `grep -c 'effects: \[$'` → 0). Nothing is simulatable.
2. `CharacterStatsModal.tsx:522` renders the badge **"已激活生效"** — literally
   "activated and in effect" — for any constellation at or below the selected
   level. Nothing is in effect. The engine receives no buff from it.
3. `:486` `onClick={() => setConstellation(c.level)}` writes that level into
   team state, so the user sets C6, reads "已激活生效", runs the simulation, and
   gets a number that is arithmetically **identical to C0**. A wrong number that
   looks plausible is the exact thing ROADMAP §0 forbids.

The empty-state copy at `:534` — "暂未录入文本级命座说明" ("constellation text
not yet entered") — is also the dishonest half of the truth table. Text is
present for all 132 characters; what is missing is *effects*. It reports a
content gap where the real gap is a modelling gap.

**Recommendation.** Add a pure adapter beside `abilityDetailModel.ts` — call it
`constellationDisclosure.ts` — that returns one of four states from
`(effects.length, descriptionZh presence)`, and have the component render only
what it is handed:

| `effects` | `descriptionZh` | State | zh-CN copy |
|---|---|---|---|
| non-empty | present | `MODELLED` | 已建模并参与伤害计算 |
| empty | present | `TEXT_ONLY` | **效果未建模，不影响计算结果** |
| non-empty | absent | `MODELLED_NO_TEXT` | 已建模（暂无中文说明） |
| empty | absent | `ABSENT` | 暂无数据 |

Today's roster is 100% row 2. The badge must therefore read
**"效果未建模"**, never "已激活生效", and never "文本缺失". `PendingDataNotice`
already exists for exactly this and is unused here.

Additionally: while row 2 is universal, the constellation stepper at `:453-473`
is an affordance that cannot change any result. Either disable it with a stated
reason, or keep it and state above it that the selection does not affect the
simulation. Silently accepting input that changes nothing is worse than either.

**PRODUCT DECISION NEEDED (route to user, not to frontend):** ROADMAP §6.2 asks
whether to hand-author effects for high-value characters. Until that is ruled,
`TEXT_ONLY` is the permanent state of the entire roster and the copy above must
be treated as final, not provisional.

---

### F2 — `tierReasonZh` never matches live data; English prose renders in a zh-CN UI

**Priority: HIGH.** Verified by string count, not by inspection.

**Issue.** `src/lib/i18n.ts:431-446` translates a tier reason by testing four
English substrings, then `return reason` unchanged as a fallback.

**Problem.** The first branch tests `"Damage kit sourced from datamined data"`.
The live generator emits `"Damage kit sourced (per-level talent tables, ..."`.
Measured against `provenance.ts`:

```
grep -c 'Damage kit sourced from datamined data'  → 0
grep -c 'Damage kit sourced (per-level'           → 132
```

**Zero of 132** reasons match any branch. Every one falls through to
`return reason` and renders a ~250-character English paragraph — "the buff
vocabulary has no channel for", "Unconfirmed fields: castTime, constellations" —
in a product whose primary language is Chinese. This reaches the screen at
`CharacterPicker.tsx:307` and at the roster statement.

It is silent because the fallback is a valid `string`; TypeScript cannot see
that a translation function returned untranslated input.

**Recommendation.**
1. *Immediate:* stop rendering untranslated text. Have `tierReasonZh` return
   `undefined` on no-match and let callers render nothing rather than English.
   Visible-nothing over invisibly-wrong, per ROADMAP §0.
2. *Durable:* substring-matching English prose is the wrong seam. The reason
   should carry a structured discriminator from `game-data` (e.g.
   `reasonCode: "KIT_SOURCED_EFFECTS_UNMODELLED"` plus counts), with the zh-CN
   sentence composed from that. **Cross-module — route via `manager` to the
   `game-data` owner.** Do not let the frontend widen the substring match; that
   re-creates the same fragility one release later.
3. Add a test asserting every `tierReason` in the live roster maps to a
   translation. That test would have failed the day the generator's wording
   changed.

---

### F3 — `text-balance` survives where DESIGN-SYSTEM ordered it removed

**Priority: MEDIUM.**

**Issue.** DESIGN-SYSTEM's CJK table rules `text-wrap: balance` **"Do not use"**
and names the file: *"Remove from `Dialog.tsx:125`"*. It is still present, at
the shifted line:

- `src/components/ui/Dialog.tsx:154` — `className="text-lg font-semibold text-balance"`
- `src/features/rotation-timeline/EventDetailPanel.tsx:47` — same class

**Problem.** `balance` optimizes ragged-right in a space-delimited script. CJK
has no inter-word spaces, so the line breaker already breaks between nearly any
two characters and every line is near-full — no benefit. On a heading mixing Han
with a Latin token (`元素爆发 DPS`) it can force a worse break. Both call sites
render dialog and event titles that are Chinese-primary.

**Recommendation.** Delete `text-balance` at both sites. If orphan control is
wanted on genuinely long prose, `text-pretty` is the ruled-in alternative
(DESIGN-SYSTEM: *"Keep"* — script-independent, degrades to no-op).

---

### F4 — Font stack has no CJK family; DESIGN-SYSTEM specifies one

**Priority: MEDIUM.**

**Issue.** `tailwind.config.ts:73-82` ships
`ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif`.
DESIGN-SYSTEM §"Font stack" specifies `PingFang SC`, `Hiragino Sans GB`,
`Microsoft YaHei`, `Noto Sans CJK SC` inserted **after** the Latin faces and
**before** `Helvetica Neue`.

**Problem.** With no CJK family named, Han glyphs resolve through the generic
`sans-serif`, i.e. whatever the OS defaults to. On Windows that is frequently
SimSun — a serif face — so the entire Chinese UI renders in a mismatched serif
against a sans Latin. It is invisible on the macOS dev machine and wrong on a
large share of the target audience's machines.

The ordering matters and the existing config gets the *principle* right by
accident: Latin first means numerals and ability codes (`N1`, `CD`, `DPS`) stay
in the Latin face and `tabular-nums` column alignment survives. Inserting the
CJK families after `Roboto` preserves that.

**Recommendation.** Apply the documented stack verbatim. Leave `fontFamily.mono`
untouched — DESIGN-SYSTEM requires it stay CJK-free (see F5).

---

### F5 — `font-mono` applied to strings containing Han characters

**Priority: MEDIUM.**

**Issue.** DESIGN-SYSTEM: the mono stack *"is applied only to numerals
(`font-mono tabular-nums`), never to a string containing Han characters"*.
Violations, all verified:

- `src/app/page.tsx:261` — `<span className="font-semibold font-mono ...">{count}/4 角色</span>`
- `src/app/page.tsx:291` — `{rotation.length} 步`
- `src/features/setup/RotationEditor.tsx:105` — mono span inside a Han sentence
- `src/features/setup/SimulationSettings.tsx:76` — `<span className="text-slate-300 font-mono">角色切人耗时:</span>` (pure Han, no numeral at all)
- `src/features/rotation-timeline/TimelineList.tsx:33` — `font-mono` on `暂无执行动作记录。` (pure Han prose)

**Problem.** `ui-monospace, SFMono-Regular, Menlo, monospace` contains no CJK
glyphs, so each Han character falls back mid-string to a different face. The
result is visibly mismatched baselines, weights and widths *within one line* —
the specific artifact the rule exists to prevent. `SimulationSettings.tsx:76`
and `TimelineList.tsx:33` are worse than the others: they are pure Chinese with
no numeral, so `font-mono` buys nothing and costs the fallback.

Also at `SimulationSettings.tsx:76`: ASCII `:` terminates a Chinese label.
DESIGN-SYSTEM requires full-width `：`. Same class of issue at
`CharacterStatsModal.tsx:451` — `选择命之座层数 (当前: {constellation} 命):`
uses ASCII `(`, `:` and `)` where `（`, `：`, `）` are specified.

**Recommendation.** Scope `font-mono` to the numeral only:
`共 <span className="font-mono tabular-nums">{count}</span>/4 角色`. Remove it
entirely from `SimulationSettings.tsx:76` and `TimelineList.tsx:33`. Convert the
ASCII punctuation in Chinese strings to full-width.

---

### F6 — `aria-pressed` removed from the constellation stepper, leaving no state at all

**Priority: MEDIUM.** This is a regression against the C6 item, not a fix of it.

**Issue.** C6 called out *"`aria-pressed` misuse on single-select constellation
segments"*. The current stepper at `CharacterStatsModal.tsx:454-472` has **no**
ARIA state: no `aria-pressed`, no `role="radio"`, no `aria-current`. Selection
is conveyed only by amber border/background at `:466`.

**Problem.** The remedy for the wrong ARIA role was to apply the right one, not
to remove ARIA. A screen-reader user now cannot determine which of the seven
constellation levels is selected — the buttons are indistinguishable. This also
violates the never-color-only rule: sighted-mouse users see amber; assistive-tech
users get nothing. (The visible `(当前: N 命)` in the label at `:451` is a partial
mitigation but it is a separate node, not the control's own state.)

Note the inverse defect one level down: `:487` still sets
`aria-pressed={isUnlocked}` on the constellation **detail** buttons, where
`isUnlocked` is a derived display property, not a toggle state. Those buttons
*set* the level on click, so `aria-pressed` describes the wrong thing.

**Recommendation.** Model the 7-segment stepper as a radio group:
`role="radiogroup"` with an `aria-label` on the container, `role="radio"` +
`aria-checked` on each segment, roving `tabIndex`, arrow-key navigation. For the
detail list at `:483-528`, drop `aria-pressed` and put the unlocked/locked state
in the accessible name instead — it is a status, not a pressed state.

---

### F7 — Roster statement heading level and `line-clamp` sizing unverified for CJK

**Priority: LOW.**

**Issue.** DESIGN-SYSTEM's CJK table flags `line-clamp` as a *"Load-bearing
correction"*: a Han glyph is ~1.0em against a Latin ~0.5em, so any box sized
against English copy holds roughly half the content. It requires every
`line-clamp` value and fixed height be *chosen against zh-CN copy at 200% zoom*.

**Problem.** I found no evidence in the tree that this measurement was performed
for the cards touched in this phase; `COMPONENTS §4.10`'s `h-24` amendment is
called out in DESIGN-SYSTEM as needing measurement rather than inheritance.

**Recommendation.** Not a code change to guess at — ask `frontend-engineer` to
confirm whether card heights were measured against zh-CN at 200% zoom. If they
were inherited from the English draft, re-measure. Filed LOW because I could not
demonstrate a live overflow, only an unverified assumption.

---

## 3. Explicitly withdrawn / downgraded

Recorded because the discipline matters more than the finding count.

- **Scroll-lock sideways jump (my earlier prediction): WITHDRAWN.** Verified
  correct at `scrollLock.ts:46-51`. The implementation is better than the spec
  I wrote, because it reads the *computed* padding rather than assuming zero.
- **C4 keyed on `(tier, reason)`: WITHDRAWN mid-audit.** True at 09-04, fixed at
  09-06 20:08 while this pass was running. See §6.
- **Talent selects capped at 11 (C6): NOT A FINDING.** `abilityDetailModel.ts:26`
  derives `TALENT_LEVELS` from the engine's `MAX_TALENT_LEVEL = 15`. Already fixed.
- **Coloured-glow bans (C6): NOT A FINDING.** `grep` for coloured `shadow-*`
  utilities across `src/` returns nothing.
- **C5 radius: NOT A FINDING.** `tailwind.config.ts:19-25` replaces rather than
  extends, with a comment explaining precisely why extension was unenforceable.

---

## 4. Verified-correct work worth preserving

- `scrollLock.ts` — reference counting, computed-padding compensation, and a
  comment that documents the rejected alternative. Model implementation.
- `Dialog.tsx:37-43` named `DialogSize`; one scroller at `:159`; focus trap
  `:88-98`; focus restore `:121-123`; `Esc` handling.
- `urlState.ts:45-50` — total decoding, defaults omitted from the query,
  results never serialized.
- `tierPresentation.ts:69-70,113-133` — the tier-alone ruling implemented with
  the reasoning recorded in-file, including *why* the baseline deliberately
  carries no `tierReason`.
- `CharacterPicker.tsx:180-189` — baseline computed over the whole roster, not
  the filtered view, so the claim does not change as the user filters.
- `globals.css:19-21` global `tabular-nums`; `:52-60` `prefers-reduced-motion`;
  `:40-46` `touch-action: manipulation`; `:6` `color-scheme: dark`.
- `PendingDataNotice.tsx` — states consequence, not just absence. The right
  component for F1's fix.

---

## 5. Where the Web Interface Guidelines and DESIGN-SYSTEM disagree

**D1 — `text-wrap: balance` on headings.** Guidelines recommend it. DESIGN-SYSTEM
forbids it for CJK. **DESIGN-SYSTEM wins** and says so explicitly; the Guidelines
are authored against Latin text. F3 follows DESIGN-SYSTEM.

**D2 — Line length in `ch`.** Guidelines cap measure in `ch`. DESIGN-SYSTEM bans
`ch` outright, because `ch` is the advance width of `0` and has no relation to a
Han glyph. **DESIGN-SYSTEM wins.** The tree currently uses no `ch` units at all —
compliant.

**D3 — `aria-pressed` for selected state.** Guidelines endorse `aria-pressed` for
toggles. Neither document covers the *single-select segmented control*, which is
a radio group, not seven independent toggles. **Gap in both.** F6 recommends
`role="radio"`/`aria-checked`; DESIGN-SYSTEM should absorb that as a rule so the
next segmented control does not re-litigate it.

**D4 — Translation fallback.** Guidelines say nothing about what a translation
function should do when it cannot translate. DESIGN-SYSTEM says nothing either.
ROADMAP §0 *does*: visible-nothing over invisibly-wrong. **Gap in my own
document, exposed by F2.** DESIGN-SYSTEM should gain an i18n-hygiene rule: *a
translation lookup that misses returns `undefined` and the caller renders
nothing; it never falls through to the source string.* Silently emitting English
into a Chinese UI is the localization analogue of the confident wrong number.

**D5 — Disabled vs. absent affordances.** Guidelines prefer explaining a
constraint before the click. DESIGN-SYSTEM has no rule for a control that is
*enabled and accepts input but cannot affect the result* — the constellation
stepper in F1. **Gap in both.** Recommendation: a control that cannot change any
output is not "disabled", it is *not-yet-connected*, and must say so adjacent to
itself.

---

## 6. IN-FLIGHT — not findings

`tierPresentation.ts` was rewritten at 20:08 during this audit.
`CharacterPicker.tsx` (14:53) has not yet caught up, so `npx tsc --noEmit`
currently reports:

```
CharacterPicker.tsx(349,29): error TS2339: Property 'tierReason' does not exist on type 'TierBaseline'.
CharacterPicker.tsx(351,46): error TS2339: Property 'tierReason' does not exist on type 'TierBaseline'.
```

`TierBaseline` deliberately dropped `tierReason` (`tierPresentation.ts:50-52`),
which makes `CharacterPicker.tsx:349-351` — the roster statement's reason
paragraph — dead code awaiting deletion. This is the expected midpoint of the
adapter-then-caller change and needs no separate task; noted so the next reader
does not file it twice.

Likewise stale, from the same rewrite: `tierPresentation.test.ts:24` and `:54-60`
still assert the old `(tier, reason)` keying and now fail. They encode the
superseded behaviour and must be updated to the tier-alone ruling, not
"repaired" back toward it. The `:91` real-roster test remains correct and is the
one that should stay.

**Design-system consequence of the ruling, for the record:** DESIGN-SYSTEM's
"tier may never be omitted for basic/partial" is still satisfied. The claim is
stated once, more prominently, and the per-character reason now lives on the
detail surface (§15.6). But `shouldShowCardReason` returning `false` whenever a
roster statement shows means the reason has **exactly one** rendering surface.
If §15.6 does not in fact render it, the information is lost entirely rather
than relocated — worth confirming before this is called done.

---

## 7. Handoff order

1. **F1** — highest value; stops a live overclaim. Adapter first, then component.
2. **F2 part 1** (return `undefined` on no-match) — one line, stops English prose.
3. **F6** — accessibility regression; restore state to the stepper.
4. **F3**, **F4** — two small, mechanical CJK corrections.
5. **F5** — scope `font-mono` to numerals; full-width punctuation.
6. **F7** — confirm the zh-CN measurement was done.
7. **F2 part 2** — blocked on `manager` routing a `game-data` seam.

Blocked on a product ruling: **F1's** permanence (ROADMAP §6.2).
