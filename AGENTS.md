# AGENTS.md — Genshin Rotation Optimizer Team

Multi-agent team for the Next.js + TypeScript Genshin Rotation Optimizer.
Every agent reads this file, `docs/ARCHITECTURE.md`, and `docs/PROJECT-STATUS.md`
**before starting any task**.

## The team

| Agent | Role | Owns |
|-------|------|------|
| `manager` | Architect / Tech Lead | architecture, integration, `docs/PROJECT-STATUS.md` |
| `combat-engineer` | Game Simulation Engineer | `src/simulation/{engine,damage,energy,cooldowns}` |
| `mechanics-engineer` | Combat Mechanics Specialist | `src/simulation/{reactions,buffs}` |
| `optimizer-engineer` | Optimization Engineer | `src/simulation/optimizer` |
| `uiux-engineer` | Product Designer / UI-UX / Design Systems | `docs/design/` (specs, tokens, UX docs) |
| `frontend-engineer` | Next.js / React Engineer | `src/app`, `src/components`, `src/features` |
| `qa-engineer` | QA / Validation Engineer | `src/tests` + colocated `*.test.ts` |

Agent definitions live in `.claude/agents/*.md`.

## Agent Registry

| Agent | Ownership |
|---|---|
| manager | orchestration, architecture, delegation |
| combat-engineer | combat simulation (state, execution, timing, energy, cooldown, damage pipeline) |
| mechanics-engineer | Genshin mechanics (reactions, aura, ICD, snapshot, buffs) |
| optimizer-engineer | optimization (rotation search, beam search, scoring, pruning) |
| uiux-engineer | UI/UX design (information architecture, design system) |
| frontend-engineer | frontend implementation (Next.js / React) |
| qa-engineer | testing / validation / regression |

### Ownership boundaries (one line each)
```
Mechanics = 游戏规则     Combat = 模拟执行     Optimizer = 搜索
UI/UX = 设计            Frontend = 实现       QA = 验证       Manager = 协调
```
No unauthorized cross-ownership rewrites.

### Standard workflows
```
Simulation:  mechanics → combat → QA
Optimizer:   combat → optimizer → QA
UI:          uiux → frontend → uiux review → QA
```

## Ownership rules

1. Each agent edits **only** its owned paths.
2. **Never** let two agents edit the same core file.
3. Cross-module change required? →
   1. Worker states the reason.
   2. Manager reviews.
   3. Prefer solving through an interface / public API.
   4. Never copy another module's logic.
4. Game **data** (characters/weapons/artifacts/enemies) lives in `src/game-data`
   and is plain data — adding data must not require engine changes.

## Dependency order

```
game-data → mechanics → combat-engine → optimizer → frontend
```

- `qa-engineer` works **in parallel** with everyone.
- `frontend-engineer` may build against a **fixed API contract** with mocks in
  parallel — UI never blocks simulation, simulation never blocks UI once the
  contract is set.

### Design → implementation flow (UI features)

```
uiux-engineer: design spec → Manager review → frontend-engineer: implement
→ uiux-engineer: UI review → qa-engineer
```

- `uiux-engineer` owns UX decisions, the design system, and reviews; it writes
  **specs, not core React**, and does not touch `src/simulation/**` or
  `src/game-data/**` unless the Manager asks.
- `frontend-engineer` implements to spec and must not change core UX without
  discussing it with `uiux-engineer`.
- On review, `uiux-engineer` files structured `UI REVIEW` findings
  (Issue / Problem / Recommendation / Priority) — it does not rewrite the code.
- The Manager includes `uiux-engineer` in **every UI-touching task**.

## Public API contract (the seams)

| API | Owner | Consumers |
|-----|-------|-----------|
| `simulateRotation(team, rotation, enemy, config)` | combat-engineer | optimizer, frontend, qa |
| `validateAction()`, `computeDamage()` | combat-engineer | optimizer, qa |
| aura/reaction/buff hooks, `getActiveBuffs(time, state)` | mechanics-engineer | combat-engine |
| `optimizeRotation(...)` | optimizer-engineer | frontend, qa |

- Optimizer treats the combat engine as a **black box** — it calls
  `simulateRotation()`, never reimplements damage/energy/reaction math.
- Frontend **consumes** APIs only — never computes damage or reactions.
- Changing a public signature: grep callers first, notify Manager, prefer
  additive changes.

## Coding rules (all agents)

- TypeScript strict; avoid `any`.
- Small modules, pure functions preferred; no giant files.
- No duplicated logic; no premature abstraction for "maybe later".
- No business logic in UI. No magic numbers. Short comments on complex formulas.
- Read existing code before adding abstraction; no unrelated refactors.
- Public API changes must notify the Manager (and sync `docs/ARCHITECTURE.md`).
- Uncertain game mechanics must be **explicitly marked**, never guessed.
- Important behavior must have tests.

## How to run

```bash
npm run dev        # dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # eslint
npm run test       # vitest run
```

Add tests **with** every feature. Run the relevant tests before reporting done.

## Manager task protocol

Every task the Manager creates:

```
TASK #NNN
Owner:
Goal:
Dependencies:
Files / module:
Requirements:
Acceptance Criteria:
Tests:
```

## Worker submission format (canonical)

Every worker reports in this unified 8-field format:

```
Agent: <name>
Task: <task>
Changed: <files>
API / Contracts: <changed interfaces, or none>
Tests: <added / result>
Dependencies: <relied on>
Potential Issues: <risks / uncertain mechanics>
Ready For: <next agent>
```

> Legacy format (`Done / Changes / Tests / Issues / Needs`) is compatible if still
> referenced elsewhere, but the 8-field block above is the **canonical** format.

Blocked:

```
BLOCKED
Problem:
Expected:
Need from:
Suggested solution:
```

## Cross-module problem discovered

Do **not** silently edit another module. Report to Manager → create a follow-up
task → route to the owning agent.

## Git / safety

- Keep each agent's changes within its boundary.
- Never `git reset --hard` or `git checkout .` over others' uncommitted work.
- Never modify files you don't own without explicit Manager approval.
