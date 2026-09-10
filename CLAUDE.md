# Genshin Rotation Optimizer

Next.js + TypeScript (strict) Rotation Optimizer. The simulation engine is pure
TypeScript, fully decoupled from React.

## Multi-agent team

This project is developed by a 7-agent team. **Before any work, read:**

- `AGENTS.md` — team roster, ownership, coding & communication rules, task protocol
- `docs/ARCHITECTURE.md` — layering and API contracts
- `docs/PROJECT-STATUS.md` — current phase, completed / in-progress / next tasks

Agents: `manager`, `combat-engineer`, `mechanics-engineer`, `optimizer-engineer`,
`uiux-engineer`, `frontend-engineer`, `qa-engineer` (defined in `.claude/agents/`).

`manager` orchestrates; each worker edits only its owned paths. Cross-module
changes go through the Manager and the public API seams, never by copying logic.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
```

## Rules

TS strict, no `any`, no business logic in UI, no magic numbers, tests with every
feature, determinism in the simulation path (no RNG).
