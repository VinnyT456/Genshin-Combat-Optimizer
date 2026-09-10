#!/usr/bin/env python3
"""
Stage 1 of the character-data generator: fetch raw datamined JSON to a cache.

Two INDEPENDENT datamined sources are fetched so that every emitted multiplier
can be cross-verified. Neither source is authored by this project; both derive
from the game's own files.

  PRIMARY   Project Amber   https://gi.yatta.moe/api/v2/en/avatar/{id}
            Full-precision per-talent-level params (e.g. 1.264896).

  VERIFIER  Lunaris         https://api.lunaris.moe/data/{version}/en/char/{id}.json
            The same values pre-rendered as percentage strings, rounded to 2
            decimals (e.g. "126.49%"). Rounding makes it unusable as a primary
            numeric source, but ideal as an agreement check. Also supplies
            level-90 base stats and skill particle counts, which Amber does not
            expose directly.

Both endpoints require a browser User-Agent; without one they return 403.
Requests are sequential with a delay -- these are volunteer-run services.

Usage:
    python3 scripts/generate-characters/fetch.py [--cache DIR] [--force]
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys
import time
import urllib.error
import urllib.request

AMBER_LIST = "https://gi.yatta.moe/api/v2/en/avatar"
AMBER_DETAIL = "https://gi.yatta.moe/api/v2/en/avatar/{id}"
LUNARIS_VERSION = "https://api.lunaris.moe/data/version.json"
LUNARIS_LIST = "https://api.lunaris.moe/data/{version}/charlist.json"
LUNARIS_DETAIL = "https://api.lunaris.moe/data/{version}/en/char/{id}.json"

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


def fetch_all(cache: pathlib.Path, force: bool) -> None:
    fetched = 0
    failed: list[str] = []

    # --- Project Amber -----------------------------------------------------
    amber_list = get_json(AMBER_LIST)
    assert isinstance(amber_list, dict)
    write_json(cache / "amber" / "_list.json", amber_list)
    amber_ids = sorted(amber_list["data"]["items"])
    print(f"Project Amber: {len(amber_ids)} characters listed", file=sys.stderr)

    for char_id in amber_ids:
        target = cache / "amber" / f"{char_id}.json"
        if target.exists() and not force:
            continue
        try:
            write_json(target, get_json(AMBER_DETAIL.format(id=char_id)))
            fetched += 1
        except RuntimeError as err:
            failed.append(f"amber/{char_id}: {err}")
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

    lunaris_list = get_json(LUNARIS_LIST.format(version=version))
    assert isinstance(lunaris_list, dict)
    write_json(cache / "lunaris" / "_list.json", lunaris_list)
    print(f"Lunaris: {len(lunaris_list)} characters listed", file=sys.stderr)

    # Lunaris spells Traveler's forms "10000005_ANEMO" where Amber writes
    # "10000005-anemo"; ids are cached under the Lunaris spelling and mapped at
    # parse time by `parse.lunaris_id_for`.
    for char_id in sorted(lunaris_list):
        target = cache / "lunaris" / f"{char_id}.json"
        if target.exists() and not force:
            continue
        try:
            write_json(
                target, get_json(LUNARIS_DETAIL.format(version=version, id=char_id))
            )
            fetched += 1
        except RuntimeError as err:
            failed.append(f"lunaris/{char_id}: {err}")
        time.sleep(REQUEST_DELAY_SECONDS)

    # The fetch timestamp is provenance, recorded once here rather than being
    # read from the clock during emission (which would break determinism).
    write_json(
        cache / "_provenance.json",
        {
            "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "lunarisVersion": version,
            "sources": [
                {"name": "Project Amber", "endpoint": AMBER_DETAIL, "role": "primary"},
                {"name": "Lunaris", "endpoint": LUNARIS_DETAIL, "role": "verifier"},
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
