# Character data generator

Regenerates `src/game-data/characters/generated/` from datamined game data.

The roster is **generated, never hand-entered**. Hand-authoring is what produced
the fabricated data this generator replaces (TASK #028 audit: 83% of normal-attack
multipliers matched no real game value at any talent level). When the game
patches, re-run these two scripts rather than editing the emitted files.

## Running it

```bash
python3 scripts/generate-characters/fetch.py   # downloads to .cache/ (~5 min)
python3 scripts/generate-characters/emit.py    # writes the TypeScript
npm run typecheck && npm run lint && npm run test
```

`fetch.py` skips anything already cached; pass `--force` to re-download. Both
scripts are stdlib-only Python 3.10+ and take no dependencies.

`emit.py` is deterministic: the same cache always produces byte-identical
output. It reads no clock (the fetch timestamp is recorded in the cache) and
sorts every collection it emits.

## Sources

| Role | Source | Endpoint |
|------|--------|----------|
| Primary | Project Amber | `https://gi.yatta.moe/api/v2/en/avatar/{id}` |
| Verifier | Lunaris | `https://api.lunaris.moe/data/{version}/en/char/{id}.json` |

Both are independent mirrors of the game's own files. Amber carries full float
precision (`1.264896`); Lunaris pre-renders the same values rounded to two
decimals of a percentage (`"126.49%"`), which makes it unusable as a primary
numeric source but ideal as an agreement check. Lunaris additionally supplies
level-90 base stats and skill particle yields, which Amber does not expose
directly.

Both endpoints require a browser `User-Agent`; without one they return 403.

**Lunaris versioning:** the data path is keyed by a full game build string
(`7.0.54`), not `major.minor`. It must be read from
`https://api.lunaris.moe/data/version.json` — guessing the segment 404s.

## How values are cross-verified

Every multiplier is compared value-by-value, at all 15 talent levels, against
the verifier. Agreement is asserted to the verifier's rounding quantum and no
tighter, so a rounding boundary is not reported as a conflict.

At the last run: **28,380 of 28,380 compared values agreed, with 0 conflicts.**

## Coverage

The source publishes **134** character entries. That is 120 distinct characters
plus the Traveler, which the source lists as 14 separate entries (2 genders x 7
elements) and which this generator emits as 14 forms under ONE identity.

| | Count |
|---|---|
| Published by the source | 134 |
| Emitted | **132** |
| Skipped | 2 |

The 2 skipped are `Manekin` (`10000117`) and `Manekina` (`10000118`): the source
lists no element and no weapon for them, so they are unreleased placeholder
entries rather than playable characters. They are left out with a stated reason
rather than guessed at.

A conflict is a finding, not something to paper over — `emit.py` withholds the
affected ability before publication and lists it in the module's `UNVERIFIED`
block with a TODO. An ability whose verifier row is missing is handled the same
way. The generator retains the rest of a valid candidate and prints a
coordinate-level impact report, so missing evidence cannot become executable
data by accident.

## What the parser recovers

Amber ships per-level `params` as bare float arrays plus a `description`
template that names what each slot means. The template is the only place the
*shape* lives, so it is parsed to recover the three things the previous
hand-authored roster lost:

- **Per-level tables.** Every multiplier is a 15-entry `talentTable`, so
  `talentValueAt()` works and talent level is no longer inert.
- **Scaling stat.** `"Skill DMG|{param1:F1P} Max HP"` emits `stat: "hp"`.
  ATK, Max HP, DEF and Elemental Mastery are all read from the source text.
- **Multi-hit and press/hold.** `"{param3:F1P}×2"` becomes two independent
  instances (each crits and reacts separately); `"@+@"` becomes summed terms;
  `"@/@"` alternatives such as Low/High Plunge become separate abilities rather
  than being summed into damage that does not exist.

Only rows whose value is a ratio *and* whose label reads as damage become
abilities. Healing, shields, buff ratios and costs are deliberately excluded:
they are real data, but the current ability shape cannot express them, and
emitting them as damage would repeat the original error in a new form.

## What it emits

| File | Contents |
|------|----------|
| `{element}.ts` | One `GeneratedCharacter` const per character, plus that module's `UNVERIFIED` block |
| `meta.ts` | Roster facts that are not part of a combat definition: identity, form label, release date |
| `index.ts` | Barrel re-exporting all of the above |

`meta.ts` exists because `GenericCharacterDefinition` belongs to the combat
engine and is not this generator's type to extend. `registry.ts` joins the two
by character id.

Two fields there matter:

- **`identityId`** — the party duplicate-guard key. Equal to `characterId` for
  an ordinary character; **shared by all 14 Traveler forms**, so two Travelers
  cannot enter one party regardless of gender or element. The Traveler is ONE
  identity carrying a list of forms, never 14 roster entries.
- **`releaseDate`** — derived from the source's own `release` timestamp, so
  roster ordering survives a rename. The hand-kept table this replaced had no
  entry for `raiden-shogun`, `hu-tao`, `kamisato-ayaka` and six others, which
  silently sorted them all to the end.

## Known gaps

These are recorded per-character in the `UNVERIFIED` blocks of the emitted
files, not silently defaulted:

- **Cast times** are engine defaults. Neither source publishes ability timing.
- **Particle yields** come from Lunaris where available; characters whose entry
  omits them are flagged.
- **Conditional passives and constellations** remain reference-only when their
  trigger, stack, field, or lifecycle cannot be represented by the current
  declarative Buff vocabulary. Every unconditional structured row is emitted
  as an executable Buff; both sources' prose is retained for the remaining
  rows so they cannot be mistaken for damage that was simulated.
- **Support/heal bursts** (Barbara, Xiao, Nahida, Lauma) have no damage rows in
  the source. They are emitted with a real cooldown and energy cost but zero
  damage instances, and flagged.
- **Manekin / Manekina** (`10000117`, `10000118`) are skipped: the source lists
  no element for them, so they are unreleased placeholder entries.
