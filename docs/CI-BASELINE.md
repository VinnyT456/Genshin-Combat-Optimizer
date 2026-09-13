# CI baseline

Baseline captured 2026-09-12 for the recovery checkpoint. The repository now
has one GitHub Actions workflow at `.github/workflows/ci.yml`. It runs on pushes
and pull requests with read-only repository permissions and executes the locked
dependency install followed by typecheck, lint, tests, and the production build.

## Local evidence

The commands below were run from the repository root against the current
worktree:

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass; Next.js emitted its deprecation notice for `next lint` |
| `npm run test` | Pass |
| `npm run build` | Blocked by current worktree: `src/app/page.tsx` imports deleted `workspacePersistence` |
| `git diff --check` | Pass |

The CI workflow uses `npm ci`, so dependency resolution is reproducible from
`package-lock.json`. Node.js 20 is selected because the project does not declare
an engines range and Next.js 15 supports the current Node 20 LTS line.

## Recovery notes

At capture time the worktree already contained user changes in
`src/features/team-builder/TeamBuilder.tsx` and `src/features/team-builder/TeamSlot.tsx`,
plus untracked `.claude/`, `report.md`, and build-authoring files under
`src/game-data/characters/`. These files were not modified, staged, or committed.

The build limitation is outside this task's owned paths: the concurrently
modified worktree currently deletes
`src/features/simulation/workspacePersistence.ts` while `src/app/page.tsx`
still imports it. It must be resolved by the owning worker before the
production-build gate can pass. The local checks do not prove
GitHub-hosted runner behavior, branch protection, or an external
network/package-registry outage. CI itself is not claimed as verified until the
workflow executes in GitHub. No secrets are required and no cache contents are
committed; the Actions cache is managed by `actions/setup-node` from the
lockfile.
