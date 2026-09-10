#!/usr/bin/env python3
"""
Weapon-passive prose -> `Buff` data.

WHY THIS MODULE EXISTS, AND WHY IT IS NOT A SECOND CLASSIFIER
`scripts/generate-characters/perks.py` owns the three-bucket classifier and the
prose primitives (markup stripping, number extraction, conversion parsing,
`ParsedModifier`). This module REUSES all of it. What it adds is the part that
is genuinely weapon-specific and that the character vocabulary has no reason to
carry:

  1. WEAPON IDIOM. Constellation prose says "increases ATK by 20%". Weapon prose
     overwhelmingly says "increases Normal Attack DMG by 16%" or "Elemental
     Skill CRIT Rate by 6%" -- a stat SCOPED TO A DAMAGE TYPE. Measured over the
     236 passives in the cache, 27 scope to an attack type and 23 to Skill /
     Burst. `perks.STAT_PATTERNS` cannot see any of them, which is why the first
     emitted run produced ZERO modifiers across all 1168 refinement rows.

  2. SCOPE IS LOAD-BEARING, NOT DECORATION. `perks.detect_damage_types` already
     computes the scope, but the weapon emitter never carried it. Emitting
     "Normal Attack DMG +40%" (Rust) as an unscoped `dmgBonus` would inflate
     Skill and Burst damage that the weapon does not touch. A scope that cannot
     be attached is a reason to DEMOTE the row, never to drop the scope and keep
     the number. That rule is enforced in `parse_weapon_effects`.

  3. TRIGGERS. Nearly every weapon passive is conditional. `BuffCondition` can
     state some of those conditions (damage type, element, on-field) and cannot
     state others (on-hit triggers, stack accumulation, pickup events, uptime).
     The ones it cannot state are UNIMPLEMENTED with their numbers intact -- not
     promoted to permanent buffs. An always-on approximation of a conditional
     buff OVERSTATES it at every point in the rotation, which is the exact
     failure ROADMAP.md sec.0 exists to prevent.

WHAT IS NEVER DONE HERE
No number is averaged across refinements, no R1 value is reused for R2-R5, no
cap is assumed absent, and no effect is invented to give a number somewhere to
live. Refinement is data: each of the five levels is parsed from its own prose.
"""

from __future__ import annotations

import dataclasses
import re

import perks

# ---------------------------------------------------------------------------
# Damage-type scoping
# ---------------------------------------------------------------------------
#
# The prose names an attack category; `BuffCondition.damageTypes` names the
# engine's `DamageType`. These are the phrases the corpus actually uses, longest
# first so "Normal and Charged Attack" is not consumed by the "Normal Attack"
# prefix. The right-hand side is a tuple because several phrases legitimately
# scope to more than one type.
SCOPE_PHRASES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("normal and charged attack", ("charged", "normal")),
    ("normal, charged, and plunging attack", ("charged", "normal", "plunge")),
    ("elemental skill and elemental burst", ("burst", "skill")),
    ("elemental skill and burst", ("burst", "skill")),
    ("elemental burst", ("burst",)),
    ("elemental skill", ("skill",)),
    ("charged attack", ("charged",)),
    ("plunging attack", ("plunge",)),
    ("normal attack", ("normal",)),
)

# The stat a scoped clause grants. `DMG` is the generic damage channel; the
# crit channels are named explicitly because "Elemental Skill CRIT Rate" is a
# real and common weapon clause ("The Catch", Festering Desire).
SCOPED_STAT_WORDS: tuple[tuple[str, str], ...] = (
    ("crit rate", "critRate"),
    ("crit dmg", "critDmg"),
    ("dmg", "dmgBonus"),
)

_SCOPE_ALTERNATION = "|".join(re.escape(phrase) for phrase, _ in SCOPE_PHRASES)
_STAT_ALTERNATION = "|".join(re.escape(word) for word, _ in SCOPED_STAT_WORDS)

#: "Increases Normal Attack DMG by 16%" / "Elemental Burst CRIT Rate is increased by 6%".
#: Both voices, exactly as `perks.STAT_PATTERNS` accepts both.
#:
#: The `(?<!decreases )(?<!decrease )` guard is load-bearing, and it sits AFTER
#: the optional verb rather than before it. Because `increases?\s+` is optional
#: it can match zero characters, so a lookbehind placed before the group is
#: evaluated at the start of the noun phrase -- where the preceding character is
#: a harmless space -- and lets "but DEcreases Charged Attack DMG by 10%" match
#: as if it were an increase. Rust then emitted BOTH +10% and -10% on the same
#: scope, silently turning a tradeoff weapon into a pure gain. Anchoring the
#: guard immediately before the scope phrase rejects the decrease voice here and
#: leaves it to `SCOPED_STAT_DECREASE`, which signs it correctly.
SCOPED_STAT = re.compile(
    rf"(?:increases?\s+)?(?<!decreases )(?<!decrease )"
    rf"({_SCOPE_ALTERNATION})\s+({_STAT_ALTERNATION})"
    rf"(?:\s+dealt)?\s+(?:is\s+|are\s+)?(?:increased\s+)?by\s+{perks.PCT}"
    # A trailing "of <stat>" makes the clause a CONVERSION, not a flat grant:
    # Redhorn's "Normal and Charged Attack DMG is increased by 40% of DEF" is
    # 40% of a stat, not +40%. Emitting it as a flat bonus would be a fabricated
    # number, so the conversion form is excluded here and handled below.
    rf"(?!\s+of\s)",
    re.I,
)

#: The same clause in its DECREASE voice. Rust reads "increases Normal Attack
#: DMG by 40% but decreases Charged Attack DMG by 10%" -- emitting only the
#: increase would turn a tradeoff weapon into a pure gain, so the penalty is
#: parsed and emitted as a negative modifier on its own scope.
SCOPED_STAT_DECREASE = re.compile(
    rf"decreases?\s+({_SCOPE_ALTERNATION})\s+({_STAT_ALTERNATION})"
    rf"(?:\s+dealt)?\s+(?:is\s+|are\s+)?by\s+{perks.PCT}",
    re.I,
)

#: "<scope> DMG is increased by N% of <source stat>" -- a scoped CONVERSION.
#: `perks.CONVERSION_PATTERN` cannot see these: its target list is the four base
#: stats, and the target here is a damage channel confined to a damage type.
SCOPED_CONVERSION = re.compile(
    rf"({_SCOPE_ALTERNATION})\s+({_STAT_ALTERNATION})"
    rf"(?:\s+dealt)?\s+(?:is\s+|are\s+)?(?:increased\s+)?by\s+{perks.PCT}"
    r"\s+of\s+(?:\w+'s\s+|his\s+|her\s+|their\s+)?(?:Max\s+)?(ATK|DEF|HP|Elemental Mastery)",
    re.I,
)

#: Per-element DMG bonus, both voices. Feeds `elementalDmgBonus`, which REQUIRES
#: an element -- a modifier with this key and no element is ignored by the
#: resolver, so the element is captured or the clause is not emitted at all.
ELEMENTAL_DMG = re.compile(
    rf"(?:increases?\s+)?({'|'.join(sorted(perks.ELEMENT_WORDS))})\s+DMG"
    rf"(?:\s+Bonus)?\s+(?:is\s+)?(?:increased\s+)?by\s+{perks.PCT}",
    re.I,
)


#: Unscoped stat grants the SHARED classifier has no pattern for.
#:
#: `perks.STAT_PATTERNS` covers CRIT Rate, CRIT DMG, ATK%, Energy Recharge and
#: flat Elemental Mastery -- the channels constellations actually use. Weapons
#: also grant DEF% and HP%, and Redhorn's "DEF is increased by 28%" was being
#: dropped entirely for want of a pattern, leaving the weapon with only its
#: DEF-scaled conversion and none of the DEF that feeds it.
#:
#: These are ADDITIVE here rather than pushed into `perks`: the character
#: generator is another agent's file, and a weapon-only gap is fixed on the
#: weapon side. Both `StatKey`s already exist, so nothing new is invented.
EXTRA_STAT_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(
            rf"(?:DEF (?:is )?increased by|Increases DEF by) {perks.PCT}", re.I
        ),
        "defPercent",
    ),
    (
        re.compile(
            rf"(?:(?:Max )?HP (?:is )?increased by|Increases (?:Max )?HP by) {perks.PCT}",
            re.I,
        ),
        "hpPercent",
    ),
)


def parse_extra_modifiers(text: str) -> list[ScopedModifier]:
    """
    Unscoped DEF%/HP% grants the shared classifier does not recognise.

    A clause that also carries "of <stat>" is a conversion and is skipped, on
    exactly the same reasoning as `SCOPED_STAT`'s trailing guard.
    """
    found: list[ScopedModifier] = []
    for pattern, stat in EXTRA_STAT_PATTERNS:
        for match in pattern.finditer(text):
            if text[match.end() : match.end() + 4].lower().startswith(" of "):
                continue
            found.append(ScopedModifier(stat=stat, value=float(match.group(1)) / 100.0))
    return found


@dataclasses.dataclass(frozen=True)
class ScopedConversion:
    """
    A conversion whose OUTPUT is confined to a set of damage types.

    Redhorn Stonethresher: "Normal and Charged Attack DMG is increased by 40% of
    DEF". This is expressible today with no new engine channel, because
    `conversions` ride on a `Buff` and a `Buff` carries `conditions` -- the scope
    becomes the buff's `damageTypes` gate and the conversion targets `dmgBonus`.
    Emitting it as an unscoped conversion would grant the DEF-scaled bonus to
    Skill and Burst hits, which the weapon does not buff.
    """

    source_stat: str
    target_stat: str
    ratio: float
    damage_types: tuple[str, ...] = ()
    max_cap: float | None = None


@dataclasses.dataclass(frozen=True)
class ScopedModifier:
    """
    One stat grant plus the damage types it is confined to.

    `damage_types` empty means genuinely unscoped (a flat ATK% passive). It is
    NOT a "scope unknown" sentinel: a clause whose scope could not be resolved
    never becomes a `ScopedModifier` at all.
    """

    stat: str
    value: float
    damage_types: tuple[str, ...] = ()
    element: str | None = None


def _scope_for(phrase: str) -> tuple[str, ...]:
    """`DamageType`s named by a scope phrase. Exact lookup, never a guess."""
    lowered = phrase.lower().strip()
    for candidate, types in SCOPE_PHRASES:
        if candidate == lowered:
            return types
    return ()


def _stat_for(word: str) -> str | None:
    lowered = word.lower().strip()
    for candidate, stat in SCOPED_STAT_WORDS:
        if candidate == lowered:
            return stat
    return None


def parse_scoped_modifiers(text: str) -> list[ScopedModifier]:
    """
    Recover every damage-type-scoped and element-scoped stat clause.

    A clause is emitted ONLY when both halves resolve exactly: the scope phrase
    maps to at least one `DamageType`, and the stat word maps to a `StatKey`.
    A half that does not resolve yields nothing -- the row then falls through to
    the classifier with fewer modifiers and is bucketed on that basis, which is
    the honest outcome. Guessing either half would attach a real published
    number to the wrong channel, which is worse than not emitting it.
    """
    found: list[ScopedModifier] = []

    for sign, pattern in ((1.0, SCOPED_STAT), (-1.0, SCOPED_STAT_DECREASE)):
        for scope_word, stat_word, raw in pattern.findall(text):
            types = _scope_for(scope_word)
            stat = _stat_for(stat_word)
            if not types or stat is None:
                continue
            found.append(
                ScopedModifier(
                    stat=stat,
                    value=sign * float(raw) / 100.0,
                    damage_types=types,
                )
            )

    for element_word, raw in ELEMENT_DMG_FINDER(text):
        found.append(
            ScopedModifier(
                stat="elementalDmgBonus",
                value=float(raw) / 100.0,
                element=element_word.lower(),
            )
        )

    return found


def parse_scoped_conversions(text: str) -> list[ScopedConversion]:
    """
    Recover "<scope> DMG is increased by N% of <stat>" clauses.

    A cap is honoured exactly as `perks.parse_conversions` honours one: if the
    prose announces a ceiling this cannot read, the conversion is DROPPED rather
    than emitted uncapped, because an uncapped conversion grows without limit
    and "no cap" is not a safe default.
    """
    cap_match = perks.CONVERSION_CAP.search(text)
    cap = float(cap_match.group(1)) if cap_match else None
    if cap is None and perks.CONVERSION_CAP_HINT.search(text):
        return []

    found: list[ScopedConversion] = []
    for scope_word, stat_word, raw, source_word in SCOPED_CONVERSION.findall(text):
        types = _scope_for(scope_word)
        target = _stat_for(stat_word)
        source = perks.CONVERSION_SOURCE_STAT.get(source_word.lower())
        if not types or target is None or source is None:
            continue
        found.append(
            ScopedConversion(
                source_stat=source,
                target_stat=target,
                ratio=float(raw) / 100.0,
                damage_types=types,
                max_cap=cap,
            )
        )
    return found


def ELEMENT_DMG_FINDER(text: str) -> list[tuple[str, str]]:
    """
    Element-scoped DMG clauses, minus the ones that are really something else.

    "Physical DMG" is an element in this vocabulary, but "Elemental DMG Bonus"
    (Mappa Mare) names NO element and must not be read as one -- the regex
    cannot match it, and this wrapper exists so that intent is stated rather
    than left to the reader of a character class.
    """
    return [
        (element, raw)
        for element, raw in ELEMENTAL_DMG.findall(text)
        if element.lower() in perks.ELEMENT_WORDS
    ]


# ---------------------------------------------------------------------------
# Trigger classification
# ---------------------------------------------------------------------------
#
# `perks.has_unmodellable_condition` is deliberately broad and demotes on any of
# a long marker list. That is right for constellations, but applied to weapons
# it demotes nearly the entire corpus, including rows whose ONLY conditional
# word is the damage-type scope this module now expresses through
# `BuffCondition.damageTypes`. So the weapon path asks a narrower question:
# after the scope has been lifted out into a condition, does a trigger REMAIN
# that `BuffCondition` cannot state?
#
# These are the markers that survive that lifting. Every one of them is a real
# mechanism the buff vocabulary has no field for.
UNEXPRESSIBLE_TRIGGERS = (
    # Event triggers: the buff starts when something happens in the rotation.
    " hits ",
    " hit ",
    " on hit",
    " upon ",
    " after ",
    " when ",
    " while ",
    " every ",
    " each time ",
    " defeating ",
    " picking up ",
    " taking dmg",
    " triggering ",
    " using an elemental",
    # Accumulation: the effect's magnitude depends on a running count.
    " stack",
    " for each ",
    " per ",
    # Probability: nothing in the engine is allowed to be random.
    " chance",
    # Targeting the buff at someone the prose picks out at runtime.
    " nearby ",
    " party members",
    " other than ",
    # A branch on world state. Deathmatch reads "If there are at least 2
    # opponents nearby, ATK +16% and DEF +24%. If there are fewer than 2, ATK
    # +24%." Both branches state ATK%, so a parser that ignores the branching
    # emits BOTH and stacks two mutually exclusive numbers onto one character.
    # Enemy count is not a `BuffCondition` field, so the whole row is demoted.
    " if there ",
    " if the ",
    " opponents ",
    # A second clause bolted onto the first. "Ultimate Overlord's Mega Magic
    # Sword" reads "ATK increased by 12%. ... Based on the number of Melusines
    # you've helped, your ATK is increased by up to an additional 12%." The
    # arithmetic completeness check below cannot catch this one, because the
    # dropped clause states the SAME number as the parsed one and so leaves no
    # unconsumed value behind. Both markers are also inherently unmodellable:
    # "additional" announces a clause the parser has not accounted for, and
    # "up to" announces a ceiling reached under conditions the prose states
    # elsewhere -- emitting either at full value overstates it.
    " additional",
    " up to ",
)


def has_unexpressible_trigger(text: str) -> bool:
    """
    True when a trigger remains that `BuffCondition` cannot state.

    Asked AFTER damage-type scoping has been lifted into a condition, so a row
    is not demoted merely for naming an attack type.
    """
    lowered = f" {text.lower()} "
    return any(marker in lowered for marker in UNEXPRESSIBLE_TRIGGERS)


# Reasons. Worded so the emitted row, the generator's report and this module's
# docstring all say the same thing, and so a reader learns what the buff
# vocabulary would need rather than only that something failed.
REASON_TRIGGER = (
    "numbers are published and unambiguous, but the effect is gated on a "
    "trigger `BuffCondition` cannot state (an on-hit / on-cast / on-kill / "
    "orb-pickup event, a stack counter, an uptime window or a random chance). "
    "Emitting it as a permanent buff would overstate it at every point in the "
    "rotation, so the numbers are carried and the effect is left unwired. "
    "NEEDS: an event-triggered buff channel keyed on ability cast and on damage "
    "dealt, plus a stack counter driven by those same events"
)
REASON_PARTIAL = (
    "the parser read some of this passive's numbers but not all of them, so "
    "emitting it as expressible would claim a complete effect while silently "
    "dropping a clause. Primordial Jade Cutter is the worst case: 'HP increased "
    "by 20%' parses, and the HP-to-ATK conversion that is the entire reason to "
    "use the weapon does not -- a build would get the small half and none of "
    "the large one. The numbers that WERE read are carried on the row, and the "
    "row stays unwired until every clause in it is expressible"
)
REASON_SCOPE_UNRESOLVED = (
    "prose grants a stat but confines it to a subject this parser cannot map "
    "onto a `DamageType` or an `Element`; emitting the number unscoped would "
    "apply it to hits the weapon does not buff. NEEDS: nothing in the engine -- "
    "the scope phrase itself is unrecognised and must be added here"
)


#: Numbers that appear in prose but are never an effect magnitude, so their
#: presence must not make a row look partial. Durations ("for 15s"), stack
#: ceilings ("Max 3 stacks") and cooldowns ("once every 5s") are all structural.
NON_MAGNITUDE_NUMBER = re.compile(
    r"\d+(?:\.\d+)?\s*(?:s\b|sec|seconds?)"  # durations / cooldowns
    r"|max(?:imum)?\s+(?:of\s+)?\d+"  # stack ceilings
    r"|\d+\s+stacks?",
    re.I,
)


def accounts_for_every_number(
    text: str,
    scoped: list[ScopedModifier],
    plain: list[perks.ParsedModifier],
    enemy: list[perks.ParsedEnemyModifier],
    conversions: list[ScopedConversion],
) -> bool:
    """
    True when every magnitude in the prose landed in some emitted channel.

    WHY THIS EXISTS. Bucketing on TRIGGER WORDS alone lets a row through whose
    prose the parser only half-understood, and a half-understood passive is
    strictly worse than an unparsed one: it looks finished. Primordial Jade
    Cutter reads "HP increased by 20%. Additionally, provides an ATK Bonus based
    on 1.2% of the wielder's Max HP." The first sentence parses cleanly, the
    second -- the reason anyone equips the weapon -- does not, and the row was
    being emitted as `expressible` carrying only the 20%.

    So the test is arithmetic rather than lexical: collect every percentage the
    prose states, subtract the ones this run actually consumed, and if anything
    is left over the row is not fully expressed. This catches unknown phrasings
    the trigger list has never seen, which a marker list by construction cannot.
    """
    stated = {
        raw.rstrip("%")
        for raw in perks.numbers_in(NON_MAGNITUDE_NUMBER.sub(" ", text))
        if raw.endswith("%")
    }
    if not stated:
        return True

    def as_written(value: float) -> str:
        """A fraction back in the prose's own units, trailing zeros trimmed."""
        percent = abs(value) * 100.0
        return f"{percent:.10f}".rstrip("0").rstrip(".")

    consumed = {as_written(m.value) for m in scoped}
    consumed |= {as_written(m.value) for m in plain if m.stat != "elementalMastery"}
    consumed |= {as_written(m.value) for m in enemy}
    consumed |= {as_written(c.ratio) for c in conversions}

    return not (stated - consumed)


def classify_weapon_row(
    text: str,
    scoped: list[ScopedModifier],
    plain: list[perks.ParsedModifier],
    enemy: list[perks.ParsedEnemyModifier],
    conversions: list[ScopedConversion],
) -> tuple[str, str | None]:
    """
    Bucket one refinement row. Returns `(bucket, reason)`.

    ORDER, and why each step comes where it does:

      1. Nothing parsed at all -> defer entirely to the shared classifier, so a
         weapon row with no readable number is reported with exactly the same
         wording as a constellation in the same state.

      2. A remaining trigger -> UNIMPLEMENTED, numbers kept. This is checked
         BEFORE claiming expressibility because the numbers being clean is
         precisely what makes an unwired conditional passive dangerous: it looks
         ready to use.

      3. Otherwise EXPRESSIBLE. A row reaches here only if every clause resolved
         to a channel that exists and no trigger remains.
    """
    if not scoped and not plain and not enemy and not conversions:
        return perks.classify(text, plain, enemy, conversions, None)

    if has_unexpressible_trigger(text):
        return perks.BUCKET_UNIMPLEMENTED, REASON_TRIGGER

    if not accounts_for_every_number(text, scoped, plain, enemy, conversions):
        return perks.BUCKET_UNIMPLEMENTED, REASON_PARTIAL

    if perks.NO_CHANNEL_MARKERS and any(
        marker in text.lower() for marker in perks.NO_CHANNEL_MARKERS
    ):
        # A row that grants a real stat AND does something with no channel
        # (heals, shields, changes a cooldown). The stat half is genuine, but
        # emitting only that half silently drops the rest of the passive, so the
        # row is reported as partial rather than claimed complete.
        return perks.BUCKET_UNIMPLEMENTED, perks.REASON_NO_CHANNEL

    return perks.BUCKET_EXPRESSIBLE, None


def parse_weapon_effects(
    text: str,
) -> tuple[
    list[ScopedModifier],
    list[perks.ParsedEnemyModifier],
    list[ScopedConversion],
    str,
    str | None,
]:
    """
    Full parse of one refinement's prose.

    Returns `(modifiers, enemyModifiers, conversions, bucket, reason)` where
    `modifiers` is the UNION of the shared classifier's unscoped grants and this
    module's scoped ones, in one list, each carrying its own scope. That union
    is what lets a single row say "DEF +28% (always) and Normal/Charged DMG +40%
    of DEF" without two parallel shapes.
    """
    plain, enemy = perks.parse_stat_modifiers(text)
    scoped = parse_scoped_modifiers(text)
    scoped.extend(parse_extra_modifiers(text))

    conversions = [
        ScopedConversion(
            source_stat=c.source_stat,
            target_stat=c.target_stat,
            ratio=c.ratio,
            max_cap=c.max_cap,
        )
        for c in perks.parse_conversions(text)
    ]
    conversions.extend(parse_scoped_conversions(text))

    bucket, reason = classify_weapon_row(text, scoped, plain, enemy, conversions)

    modifiers = [
        ScopedModifier(stat=m.stat, value=m.value, element=m.element) for m in plain
    ]
    modifiers.extend(scoped)

    # Determinism: the emitted order must not depend on which regex ran first.
    # Sorted on the full tuple so two runs over identical input are byte-equal.
    modifiers.sort(key=lambda m: (m.stat, m.value, m.damage_types, m.element or ""))
    conversions.sort(
        key=lambda c: (c.source_stat, c.target_stat, c.ratio, c.damage_types)
    )

    return modifiers, enemy, conversions, bucket, reason
