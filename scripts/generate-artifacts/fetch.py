#!/usr/bin/env python3
"""
Stage 1 of the artifact-data generator: fetch raw datamined JSON to a cache.

Two INDEPENDENT datamined sources are fetched so that every emitted number can
be cross-verified. Neither source is authored by this project; both derive from
the game's own files.

  PRIMARY   Project Amber   https://gi.yatta.moe/api/v2/{lang}/reliquary/{id}
            Set identity, the five per-slot piece names, rarity (`levelList`)
            and the official set-bonus PROSE in both English and Chinese. The
            Chinese text is the product's display language, so it is fetched
            as a first-class locale rather than translated here.

  VERIFIER  Lunaris         https://api.lunaris.moe/data/{version}/en/artifact/{id}.json
            The same sets with the bonus text PRE-PARSED into a numeric
            `params` array. This is what makes it a real verifier rather than a
            mirror: Amber ships prose only, so agreement between "15%" scraped
            out of Amber's sentence and Lunaris's 0.15000000596046448 is
            agreement between two different representations of the value.

WHY THE NUMBERS STILL NEED CARE. Both projects datamine the same game binary,
so they share an upstream. Agreement therefore proves faithful extraction, NOT
independent measurement -- the same caveat that caught the 1-2 star weapon
ascension cap. Agreement is used here to reject transcription error, which is
exactly the failure mode that produced the hand-authored table this generator
replaces; it is not treated as proof of game behaviour.

WHAT IS DELIBERATELY NOT FETCHED. Neither source exposes artifact main-stat or
substat VALUE tables (probed: Amber `reliquary/{upgrade,mainaffix,affix}`,
Lunaris `{reliquary,artifact}affix.json`, `mainstat.json` -- all 404). Those
values are therefore NOT emitted. See the emitter's header; a missing table is
recorded as a gap, never filled from memory.

Both endpoints require a browser User-Agent; without one they return 403.
Requests are sequential with a delay -- these are volunteer-run services.

Usage:
    python3 scripts/generate-artifacts/fetch.py [--cache DIR] [--force]
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys
import time
import urllib.error
import urllib.request

AMBER_LIST = "https://gi.yatta.moe/api/v2/{lang}/reliquary"
AMBER_DETAIL = "https://gi.yatta.moe/api/v2/{lang}/reliquary/{id}"
LUNARIS_VERSION = "https://api.lunaris.moe/data/version.json"
LUNARIS_DETAIL = "https://api.lunaris.moe/data/{version}/en/artifact/{id}.json"
LUNARIS_LIST = "https://api.lunaris.moe/data/{version}/artifactlist.json"

# The two locales fetched from Amber. `chs` carries the official Chinese set
# names and bonus text the UI displays; `en` carries the English names used for
# search and for joining to Lunaris, which is English-only.
AMBER_LANGS = ("en", "chs")

# Both APIs 403 a default urllib/python User-Agent.
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

REQUEST_DELAY_SECONDS = 0.25
REQUEST_TIMEOUT_SECONDS = 30
MAX_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 2.0


def get_json(url: str) -> object:
    """GET `url` as JSON, retrying transient failures with linear backoff."""
    last: Exception | None = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(
                request, timeout=REQUEST_TIMEOUT_SECONDS
            ) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as err:
            last = err
            if attempt < MAX_ATTEMPTS:
                time.sleep(RETRY_BACKOFF_SECONDS * attempt)
    raise RuntimeError(f"failed to fetch {url}: {last}")


def write_json(path: pathlib.Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # sort_keys keeps the cache byte-stable so re-fetches produce clean diffs.
    path.write_text(
        json.dumps(payload, indent=1, sort_keys=True, ensure_ascii=False),
        encoding="utf-8",
    )


def cached_lunaris_version(cache: pathlib.Path) -> str | None:
    """Return the verifier version associated with this cache, if present."""
    try:
        payload = json.loads((cache / "_provenance.json").read_text("utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None
    version = payload.get("lunarisVersion") if isinstance(payload, dict) else None
    return version if isinstance(version, str) and version else None


def fetch_all(cache: pathlib.Path, force: bool) -> None:
    fetched = 0
    failed: list[str] = []

    # --- Project Amber -----------------------------------------------------
    # The English list decides the id set; `chs` is fetched for the same ids so
    # a locale that lags behind cannot silently drop a set.
    amber_list = get_json(AMBER_LIST.format(lang="en"))
    assert isinstance(amber_list, dict)
    set_ids = sorted(amber_list["data"]["items"])
    print(f"Project Amber: {len(set_ids)} artifact sets listed", file=sys.stderr)

    for lang in AMBER_LANGS:
        listing = amber_list if lang == "en" else get_json(AMBER_LIST.format(lang=lang))
        write_json(cache / "amber" / lang / "_list.json", listing)
        for set_id in set_ids:
            target = cache / "amber" / lang / f"{set_id}.json"
            if target.exists() and not force:
                continue
            try:
                write_json(
                    target, get_json(AMBER_DETAIL.format(lang=lang, id=set_id))
                )
                fetched += 1
            except RuntimeError as err:
                failed.append(f"amber/{lang}/{set_id}: {err}")
            time.sleep(REQUEST_DELAY_SECONDS)

    # --- Lunaris -----------------------------------------------------------
    # The data path is versioned by a full game build string ("7.0.54"), not a
    # major.minor pair, so the current value MUST be read from version.json --
    # guessing the segment yields 404.
    version_manifest = get_json(LUNARIS_VERSION)
    assert isinstance(version_manifest, dict)
    version = version_manifest["version"]
    write_json(cache / "lunaris" / "_version.json", version_manifest)
    print(f"Lunaris: game data version {version}", file=sys.stderr)
    # A verifier detail row without its source build is unsafe evidence. The
    # filenames are id-only, therefore a changed manifest invalidates all of
    # them and forces a refresh before the emitter can publish any set.
    refresh_lunaris = force or cached_lunaris_version(cache) != version

    lunaris_list = get_json(LUNARIS_LIST.format(version=version))
    assert isinstance(lunaris_list, dict)
    write_json(cache / "lunaris" / "_list.json", lunaris_list)

    # Iterate Amber's id set: a set present in only one source cannot be
    # cross-verified and must surface as a missing verifier, not be skipped.
    for set_id in set_ids:
        target = cache / "lunaris" / f"{set_id}.json"
        if target.exists() and not refresh_lunaris:
            continue
        try:
            write_json(
                target, get_json(LUNARIS_DETAIL.format(version=version, id=set_id))
            )
            fetched += 1
        except RuntimeError as err:
            failed.append(f"lunaris/{set_id}: {err}")
        time.sleep(REQUEST_DELAY_SECONDS)

    # The fetch timestamp is provenance, recorded once here rather than being
    # read from the clock during emission (which would break determinism).
    write_json(
        cache / "_provenance.json",
        {
            "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "lunarisVersion": version,
            "sources": [
                {
                    "name": "Project Amber",
                    "endpoint": AMBER_DETAIL,
                    "role": "primary",
                    "langs": list(AMBER_LANGS),
                },
                {
                    "name": "Lunaris",
                    "endpoint": LUNARIS_DETAIL,
                    "role": "verifier",
                },
            ],
        },
    )

    print(f"fetched {fetched} new file(s); {len(failed)} failure(s)", file=sys.stderr)
    for message in failed:
        print(f"  FAILED {message}", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--cache",
        type=pathlib.Path,
        default=pathlib.Path(__file__).parent / ".cache",
        help="directory for raw fetched JSON (default: ./.cache)",
    )
    parser.add_argument(
        "--force", action="store_true", help="re-fetch files already cached"
    )
    args = parser.parse_args()
    fetch_all(args.cache, args.force)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
