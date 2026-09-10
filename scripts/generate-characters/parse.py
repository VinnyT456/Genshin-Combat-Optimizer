#!/usr/bin/env python3
"""
Stage 2 of the character-data generator: parse cached JSON into a normalised
intermediate model, cross-verifying every multiplier against the second source.

WHY A PARSER AND NOT A TRANSCRIPTION
Project Amber ships each talent as a per-level `params` array plus a
`description` template that names what each slot MEANS:

    "5-Hit DMG|{param5:F1P}+{param6:F1P}"   -> two hits, summed
    "Skill DMG|{param1:F1P} Max HP"         -> scales off Max HP, not ATK
    "Thunderclap Slash DMG|{param3:F1P}×2"  -> one value, struck twice

The template is the ONLY place the shape lives -- the raw params array is just
floats. So the label grammar has to be parsed to recover multi-hit structure,
press/hold variants and the scaling stat. Those three facts are precisely what
the previous hand-authored roster lost.

GRAMMAR (surveyed exhaustively over all 134 cached Amber characters)
  {paramN:P} {paramN:F1P} {paramN:F2P}   a ratio  -> a damage multiplier
  {paramN:F1} {paramN:F2} {paramN:I}     a scalar -> duration / cost / stamina
  "@+@"                                  hits struck in sequence, summed
  "@×3" / "@*4"                          one value repeated N times
  "@ Max HP" / "@ DEF" / "@ Elemental Mastery" / "@ ATK"   scaling stat override
  "@/@"                                  alternatives (press/hold, low/high)

Only rows whose value is a RATIO and whose label reads as damage become
abilities. Healing, shields, buff ratios and costs are deliberately excluded:
they are real data but the ability shape cannot express them, so emitting them
as damage would repeat the original error in a new form.
"""

from __future__ import annotations

import dataclasses
import json
import pathlib
import re

# --- Talent levels ---------------------------------------------------------
MIN_TALENT_LEVEL = 1
MAX_TALENT_LEVEL = 15

# --- Amber talent `type` discriminator ------------------------------------
TALENT_TYPE_NORMAL_OR_SKILL = 0
TALENT_TYPE_BURST = 1
TALENT_TYPE_PASSIVE = 2

# --- Label classification --------------------------------------------------
# A row is damage if its label says DMG, or matches one of these known
# damage-bearing labels that omit the word. Kept as an explicit allowlist so an
# unrecognised label is skipped and reported, never silently guessed at.
DAMAGE_LABEL_EXACT = frozenset(
    {
        "aimed shot",
        "fully-charged aimed shot",
        "aimed shot charge level 1",
        "level 1 aimed shot",
        "charged attack",
        "dot",
        "ice lance dot",
        "coda at dawn's tolling dot",
    }
)

# Labels that contain "DMG" but describe a BONUS/multiplier applied to damage
# rather than a damage instance of their own.
NON_DAMAGE_LABEL_SUBSTRINGS = (
    "dmg bonus",
    "dmg increase",
    "dmg decrease",
    "res decrease",
    "dmg absorption",
    "absorption",
    "dmg reduction",
    "bonus ratio",
    "conversion rate",
)

# --- Scaling stat detection -----------------------------------------------
# Matched against the text following a param placeholder in the template.
SCALING_STAT_PATTERNS: tuple[tuple[str, str], ...] = (
    ("max hp", "hp"),
    ("current hp", "hp"),
    ("elemental mastery", "elementalMastery"),
    ("def", "def"),
    ("atk", "atk"),
)
DEFAULT_SCALING_STAT = "atk"

# --- Slot detection --------------------------------------------------------
PRESS_MARKERS = ("press", "tap")
HOLD_MARKERS = ("hold",)
# Amber embeds a platform-layout macro where the word "Press" belongs.
LAYOUT_MACRO = re.compile(r"\{LAYOUT_[A-Z]+#([^}]*)\}")
# A run of adjacent per-platform alternatives collapses to its first entry.
LAYOUT_MACRO_RUN = re.compile(r"(?:\{LAYOUT_[A-Z]+#[^}]*\})+")

PARAM_TOKEN = re.compile(r"\{param(\d+):([^}]*)\}")
REPEAT_TOKEN = re.compile(r"[×xX*]\s*(\d+)")


@dataclasses.dataclass(frozen=True)
class ScalingTerm:
    """One (stat, per-level table) pair. `table` is indexed level 1..15."""

    stat: str
    table: tuple[float, ...]


@dataclasses.dataclass(frozen=True)
class DamageInstance:
    """One damage tick: a label, its scaling terms, and how often it lands."""

    label: str
    terms: tuple[ScalingTerm, ...]
    repeat: int
    # The row label as Amber wrote it, before alternative-splitting renamed it.
    # Lunaris keys its rows by that original label, so verification looks up
    # `source_label` while the emitted data uses the clearer split `label`.
    source_label: str
    # Index of this alternative within the original row (0 when not split).
    source_index: int


@dataclasses.dataclass(frozen=True)
class ParsedAbility:
    name: str
    slot: str  # "normal" | "charged" | "plunge" | "skill" | "burst"
    variant: str | None  # "press" | "hold" | None
    instances: tuple[DamageInstance, ...]
    cooldown: float | None
    energy_cost: int | None


@dataclasses.dataclass(frozen=True)
class Unverified:
    """A value the sources could not agree on, or a row we could not model."""

    character: str
    talent: str
    label: str
    reason: str


def strip_layout_macro(text: str) -> str:
    """
    Collapse Amber's platform macro to a single word.

    The macro is a run of per-platform alternatives -- mobile says "Tap" where
    desktop says "Press" -- encoded as adjacent `{LAYOUT_*#word}` groups. Only
    the first is kept, so "#{LAYOUT_MOBILE#Tap}{LAYOUT_PC#Press}{LAYOUT_PS#Press}
    DMG" becomes "Tap DMG" rather than the concatenated "TapPressPress DMG".
    """
    return LAYOUT_MACRO_RUN.sub(
        lambda run: LAYOUT_MACRO.match(run.group(0)).group(1),  # type: ignore[union-attr]
        text.lstrip("#"),
    ).strip()


def is_ratio_format(fmt: str) -> bool:
    """`P`-suffixed formats are percentages; everything else is a raw scalar."""
    return fmt.endswith("P")


def classify_label(label: str) -> bool:
    """True if this row describes a damage instance."""
    lowered = label.lower().strip()
    if any(marker in lowered for marker in NON_DAMAGE_LABEL_SUBSTRINGS):
        return False
    if "dmg" in lowered:
        return True
    return lowered in DAMAGE_LABEL_EXACT


def detect_scaling_stat(trailing_text: str) -> str:
    """Read the scaling stat out of the text that follows a param token."""
    lowered = trailing_text.lower()
    for needle, stat in SCALING_STAT_PATTERNS:
        if needle in lowered:
            return stat
    return DEFAULT_SCALING_STAT


def detect_variant(label: str) -> str | None:
    lowered = label.lower()
    if any(marker in lowered for marker in HOLD_MARKERS):
        return "hold"
    if any(marker in lowered for marker in PRESS_MARKERS):
        return "press"
    return None


def build_level_table(
    promote: dict, param_index: int, ratio: bool
) -> tuple[float, ...] | None:
    """
    Collect one param slot across talent levels 1..15.

    Returns None when the slot is absent or uniformly zero -- a zero column is
    padding in Amber's fixed-width params array, not a real value.
    """
    values: list[float] = []
    for level in range(MIN_TALENT_LEVEL, MAX_TALENT_LEVEL + 1):
        entry = promote.get(str(level))
        if entry is None:
            break
        params = entry.get("params") or []
        if param_index >= len(params):
            return None
        values.append(float(params[param_index]))
    if not values or all(value == 0 for value in values):
        return None
    # Ratios arrive already as fractions (0.8806 == 88.06%); no conversion.
    _ = ratio
    return tuple(values)


def split_alternatives(label: str, expression: str) -> list[tuple[str, str, int]]:
    """
    Split a row that encodes ALTERNATIVES rather than a sum.

    "Low/High Plunge DMG|{p1:P}/{p2:P}" is two distinct attacks that are never
    dealt together, so summing them would invent damage. A "/" between ratio
    tokens marks such a row; the label usually carries matching "/"-separated
    names ("Stone Stele/Resonance DMG"), which are paired up positionally.

    Rows joined by "+" are left alone -- those genuinely are one attack whose
    hits land together.
    """
    parts = [part for part in re.split(r"(?<=\})\s*/\s*(?=\{)", expression) if part]
    if len(parts) < 2:
        return [(label, expression, 0)]

    names = [name.strip() for name in label.split("/")]
    if len(names) == len(parts):
        # "Low/High Plunge DMG" -> the trailing words qualify every alternative.
        suffix = names[-1].split(" ", 1)
        tail = suffix[1] if len(suffix) > 1 else ""
        labels = [
            f"{name} {tail}".strip() if index < len(names) - 1 else name
            for index, name in enumerate(names)
        ]
    else:
        labels = [f"{label} ({index + 1})" for index in range(len(parts))]
    return [(name, part, index) for index, (name, part) in enumerate(zip(labels, parts))]


def parse_row(
    promote: dict,
    label: str,
    expression: str,
    source_label: str,
    source_index: int,
) -> tuple[DamageInstance | None, str | None]:
    """
    Parse one "Label|expression" row into a damage instance.

    Terms within the row are SUMMED -- that is the "@+@" multi-hit case and the
    hybrid "@ ATK+@ Max HP" case. Alternatives ("@/@") are split upstream by
    `split_alternatives` so they never reach here as one instance.

    Returns (instance, skip_reason). Exactly one is non-None.
    """
    tokens = list(PARAM_TOKEN.finditer(expression))
    if not tokens:
        return None, "no parameters"

    ratio_tokens = [t for t in tokens if is_ratio_format(t.group(2))]
    if not ratio_tokens:
        return None, "scalar row (duration/cost), not damage"

    terms: list[ScalingTerm] = []
    for index, token in enumerate(ratio_tokens):
        param_index = int(token.group(1)) - 1
        table = build_level_table(promote, param_index, ratio=True)
        if table is None:
            continue
        # Scaling stat comes from the text between this token and the next.
        start = token.end()
        end = (
            ratio_tokens[index + 1].start()
            if index + 1 < len(ratio_tokens)
            else len(expression)
        )
        terms.append(ScalingTerm(detect_scaling_stat(expression[start:end]), table))

    if not terms:
        return None, "all parameter slots empty"

    repeat_match = REPEAT_TOKEN.search(expression)
    repeat = int(repeat_match.group(1)) if repeat_match else 1

    return (
        DamageInstance(
            label=strip_layout_macro(label),
            terms=tuple(terms),
            repeat=repeat,
            source_label=strip_layout_macro(source_label),
            source_index=source_index,
        ),
        None,
    )


def slot_for(talent_index: str, talent_type: int, label: str) -> str:
    """Map a talent + row label onto an engine ability slot."""
    lowered = label.lower()
    if talent_type == TALENT_TYPE_BURST:
        return "burst"
    if talent_index == "0":  # the normal-attack talent
        if "plunge" in lowered:
            return "plunge"
        if "charged" in lowered or "aimed" in lowered:
            return "charged"
        return "normal"
    return "skill"


def parse_character(amber: dict) -> tuple[list[ParsedAbility], list[Unverified]]:
    """Turn one cached Amber payload into abilities plus an unverified log."""
    data = amber["data"]
    name = data["name"]
    abilities: list[ParsedAbility] = []
    unverified: list[Unverified] = []

    for talent_index in sorted(data.get("talent", {}), key=int):
        talent = data["talent"][talent_index]
        promote = talent.get("promote")
        talent_type = talent.get("type")
        if not promote or talent_type == TALENT_TYPE_PASSIVE:
            continue

        talent_name = talent["name"]
        descriptions = promote[str(MIN_TALENT_LEVEL)].get("description") or []

        grouped: dict[tuple[str, str | None], list[DamageInstance]] = {}
        for description in descriptions:
            if not description or "|" not in description:
                continue
            label, expression = description.split("|", 1)
            label = strip_layout_macro(label)
            if not classify_label(label):
                continue

            for part_label, part_expression, part_index in split_alternatives(
                label, expression
            ):
                instance, skip_reason = parse_row(
                    promote, part_label, part_expression, label, part_index
                )
                if instance is None:
                    unverified.append(
                        Unverified(
                            name, talent_name, part_label, skip_reason or "unparsed"
                        )
                    )
                    continue

                slot = slot_for(talent_index, talent_type, part_label)
                grouped.setdefault((slot, detect_variant(part_label)), []).append(
                    instance
                )

        for (slot, variant), instances in grouped.items():
            abilities.append(
                ParsedAbility(
                    name=talent_name,
                    slot=slot,
                    variant=variant,
                    instances=tuple(instances),
                    cooldown=talent.get("cooldown"),
                    energy_cost=talent.get("cost"),
                )
            )

    return abilities, unverified


def load_cache(cache: pathlib.Path, source: str, char_id: str) -> dict | None:
    path = cache / source / f"{char_id}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def lunaris_id_for(amber_id: str) -> str:
    """
    Translate an Amber character id into the Lunaris spelling.

    The two agree everywhere except Traveler's elemental forms, which Amber
    writes as "10000005-anemo" and Lunaris as "10000005_ANEMO".
    """
    if "-" in amber_id:
        base, _, element = amber_id.partition("-")
        return f"{base}_{element.upper()}"
    return amber_id


# --- Cross-verification ----------------------------------------------------
# Lunaris renders the same numbers rounded to 2 decimal places OF A PERCENTAGE,
# i.e. to 1e-4 as a fraction. Agreement is therefore asserted at half that
# quantum plus a small float-repr allowance, and no tighter: demanding more
# would flag rounding boundaries (0.46125 -> "46.13%") as disagreements.
VERIFY_TOLERANCE = 5.5e-5

PERCENT_VALUE = re.compile(r"(-?\d+(?:\.\d+)?)%")


# Lunaris groups multipliers under these keys; they map onto our ability slots.
# Verification is scoped per group because labels COLLIDE across groups -- both
# Yelan's skill and her burst have a row literally called "Skill DMG", and
# matching them globally compares the wrong pair and reports a false conflict.
LUNARIS_GROUP_SLOTS: dict[str, frozenset[str]] = {
    "normalattack": frozenset({"normal", "charged", "plunge"}),
    "elementalskill": frozenset({"skill"}),
    "elementalburst": frozenset({"burst"}),
}


def lunaris_values(lunaris: dict) -> dict[str, dict[str, list[list[float]]]]:
    """Flatten Lunaris multipliers to {group: {label: [per-level [values]]}}."""
    out: dict[str, dict[str, list[list[float]]]] = {}
    for group, skill in (lunaris.get("skills") or {}).items():
        if not isinstance(skill, dict):
            continue
        rows_by_label: dict[str, list[list[float]]] = {}
        for label, per_level in (skill.get("multipliers") or {}).items():
            if not isinstance(per_level, list):
                continue
            rows: list[list[float]] = []
            for cell in per_level:
                rows.append(
                    [float(m) / 100.0 for m in PERCENT_VALUE.findall(str(cell))]
                )
            rows_by_label[strip_layout_macro(label).lower()] = rows
        out[group] = rows_by_label
    return out


def verify_ability(
    ability: ParsedAbility, reference: dict[str, dict[str, list[list[float]]]]
) -> tuple[int, int, list[str]]:
    """
    Compare parsed tables against Lunaris. Returns (checked, agreed, notes).

    Only Lunaris groups whose slots include this ability's slot are searched,
    so same-named rows in a different talent cannot be mistaken for a match.
    """
    scoped: dict[str, list[list[float]]] = {}
    for group, rows_by_label in reference.items():
        if ability.slot in LUNARIS_GROUP_SLOTS.get(group, frozenset()):
            scoped.update(rows_by_label)

    checked = 0
    agreed = 0
    notes: list[str] = []
    for instance in ability.instances:
        # Lunaris keys rows by Amber's ORIGINAL label, so a split alternative
        # is found under its pre-split name and offset by its position.
        rows = scoped.get(instance.source_label.lower())
        if rows is None:
            rows = scoped.get(instance.label.lower())
        if rows is None:
            # Amber's layout macro lists "Tap" first (mobile); Lunaris renders
            # the desktop wording "Press" for the same row.
            rows = scoped.get(
                instance.source_label.lower().replace("tapping", "press").replace(
                    "tap", "press"
                )
            )
        if rows is None:
            notes.append(f"no Lunaris row for {instance.source_label!r}")
            continue
        offset = instance.source_index
        for term_index, term in enumerate(instance.terms):
            column = offset + term_index
            for level_index, value in enumerate(term.table):
                if level_index >= len(rows):
                    break
                candidates = rows[level_index]
                if column >= len(candidates):
                    break
                checked += 1
                if abs(candidates[column] - value) <= VERIFY_TOLERANCE:
                    agreed += 1
                else:
                    notes.append(
                        f"{instance.label} L{level_index + 1} term{term_index}: "
                        f"amber={value} lunaris={candidates[column]}"
                    )
    return checked, agreed, notes
