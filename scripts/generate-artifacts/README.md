# generate-artifacts

Generates `src/game-data/artifacts/generated/` from two independent datamined
sources. The emitted files are the source of truth; **never hand-edit them.**

```bash
python3 scripts/generate-artifacts/fetch.py      # -> .cache/
python3 scripts/generate-artifacts/emit.py       # -> src/game-data/artifacts/generated/
python3 -m unittest discover -s scripts/generate-artifacts -p 'test_*.py'
```

## Why this exists

`src/game-data/artifacts/artifactsData.ts` was 31 hand-authored sets with no
provenance header and no generator. An audit against both sources found:

- **22 of 60 set bonuses numerically contradicted.**
- **6 sets whose Chinese names were fabricated**, five of which also carried the
  bonus text of an entirely different set.

Structurally it looked perfect — unique ids, plausible percentages, sane
version weights. That is the same signature as the 132-character roster this
project had to delete. Structural checks are not provenance checks.

## Sources

| Role | Source | What it gives |
|---|---|---|
| Primary | Project Amber `/{lang}/reliquary/{id}` | set identity, rarity, the five slots, official bonus prose in `en` and `chs` |
| Verifier | Lunaris `/{version}/en/artifact/{id}.json` | the same bonuses pre-parsed into a numeric `params` array |

Amber ships prose; Lunaris ships numbers. Agreement is therefore between two
different *representations* produced by two different pipelines — a real check
on transcription.

**It is not independent measurement.** Both datamine one game binary and share
an upstream, the same caveat that surfaced with the 1–2 star weapon ascension
cap. Corroboration is claimed at that strength and no higher.

**Amber's Chinese locale is not a second source.** It is a translation of
Amber's English — one extraction rendered twice. It is carried for display and
never votes on a value.

## The three buckets

Identical to `generate-characters/perks.py`, deliberately: a set bonus and a
constellation are the same kind of object, and three parallel implementations
of one idea is what the project forbids.

| `support` | Meaning | Count |
|---|---|---|
| `modelled` | maps onto the existing `Buff` vocabulary, both sources corroborate | 46 |
| `unimplemented` | numbers unambiguous, no channel for the effect; numbers still emitted | 76 |
| `unverified` | prose unparsable or sources disagree; display only | 0 |

A row that is not `modelled` always states a `reason`.

## Rules the generator enforces

- **Withhold on conflict.** Never split, never pick the nicer one.
- **Silence is not agreement.** Lunaris pads `params` with zeros; an all-zero
  array means the source states nothing, not that it states zero. Getting this
  wrong once produced 30 false "conflicts" — failing closed on a *bug* rather
  than on evidence still corrupts the output.
- **No RNG.** A probabilistic bonus is `unimplemented`, never an expected value.
  The simulation path is deterministic and the optimizer depends on it.
- **Determinism.** Ascending set id, ascending piece count, sorted dicts. A
  re-run on an unchanged cache is byte-identical. The fetch timestamp comes from
  the cache's provenance record, never the clock.

## Known gaps — absent, not guessed

- **Main-stat and substat value tables.** Neither source publishes them; every
  candidate endpoint 404s (probes recorded in `fetch.py`). Stated in code as
  `MAIN_STAT_VALUES_UNAVAILABLE` so the gap is reachable from TypeScript.
- **Per-level main-stat progression.** Same reason.
- **Legal main-stat distributions per slot.** Flower/Plume are game-fixed (flat
  HP / flat ATK) and stated as such; the variable slots' legal sets are a game
  rule neither source ships as data.
- **Substat rolls.** Out of scope by project rule — `SUBSTAT_ROLLS_OUT_OF_SCOPE`.
