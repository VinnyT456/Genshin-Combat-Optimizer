#!/usr/bin/env python3
"""
Stage 1 of the weapon-data generator: fetch raw datamined JSON to a cache.

Mirrors `scripts/generate-characters/fetch.py` deliberately -- same two
INDEPENDENT sources, same primary/verifier split, same politeness budget --
because the cross-verification rule is the same rule. Anything that diverges
here would be a second provenance story for the same project.

  PRIMARY   Project Amber   https://gi.yatta.moe/api/v2/en/weapon/{id}
            Publishes the INPUTS to the game's stat formula: `upgrade.prop[]`
            (an `initValue` plus a NAMED growth curve) and `upgrade.promote[]`
            (the cumulative ascension bonus per phase). It does NOT publish the
            growth curve's per-level multipliers, so Amber alone cannot state a
            weapon's ATK at level 37.

  VERIFIER  Lunaris         https://api.lunaris.moe/data/{version}/en/weapon/{id}.json
            Publishes the OUTPUTS: `stats[level]` for every level 1..90, as
            ROUNDED values. Rounding makes it unusable as a primary numeric
            source and ideal as an agreement check.

The two therefore check each other exactly as they do for characters: Amber
supplies the coefficients, Lunaris supplies the answers.

Both endpoints require a browser User-Agent; without one they return 403.
Requests are sequential with a delay -- these are volunteer-run services.

Usage:
    python3 scripts/generate-weapons/fetch.py [--cache DIR] [--force]
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys
import time
import urllib.error
import urllib.request

AMBER_LIST = "https://gi.yatta.moe/api/v2/en/weapon"
AMBER_DETAIL = "https://gi.yatta.moe/api/v2/en/weapon/{id}"
LUNARIS_VERSION = "https://api.lunaris.moe/data/version.json"
LUNARIS_DETAIL = "https://api.lunaris.moe/data/{version}/en/weapon/{id}.json"

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
    """Return the version that produced this cache, if it is trustworthy."""
    try:
        payload = json.loads((cache / "_provenance.json").read_text("utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None
    version = payload.get("lunarisVersion") if isinstance(payload, dict) else None
    return version if isinstance(version, str) and version else None


def fetch_all(cache: pathlib.Path, force: bool) -> None:
    listing = get_json(AMBER_LIST)
    if not isinstance(listing, dict):
        raise RuntimeError("unexpected Amber listing payload")
    items = (listing.get("data") or {}).get("items") or {}
    if not items:
        raise RuntimeError("Amber listing published no weapons")

    version_payload = get_json(LUNARIS_VERSION)
    if not isinstance(version_payload, dict):
        raise RuntimeError("unexpected Lunaris version payload")
    # The data path is keyed by a FULL build string (e.g. "7.0.54"), never
    # major.minor -- guessing the segment 404s.
    version = version_payload.get("version")
    if not isinstance(version, str) or not version:
        raise RuntimeError("Lunaris published no version string")

    weapon_ids = sorted(items, key=int)
    print(f"Amber publishes {len(weapon_ids)} weapons; Lunaris version {version}")

    # Verifier detail files are version-sensitive. Never reuse a detail row
    # fetched for another Lunaris build: it can look structurally valid while
    # corroborating the wrong release. A missing or stale row is deliberately
    # left for the emitter to withhold rather than treated as evidence.
    refresh_lunaris = force or cached_lunaris_version(cache) != version

    fetched = skipped = missing = 0
    for weapon_id in weapon_ids:
        amber_path = cache / "amber" / f"{weapon_id}.json"
        if force or not amber_path.exists():
            write_json(amber_path, get_json(AMBER_DETAIL.format(id=weapon_id)))
            time.sleep(REQUEST_DELAY_SECONDS)
            fetched += 1
        else:
            skipped += 1

        lunaris_path = cache / "lunaris" / f"{weapon_id}.json"
        if refresh_lunaris or not lunaris_path.exists():
            try:
                write_json(
                    lunaris_path,
                    get_json(LUNARIS_DETAIL.format(version=version, id=weapon_id)),
                )
            except RuntimeError:
                # A weapon the verifier does not publish is a REPORTED gap, not
                # a reason to abort: the emitter withholds such a row rather
                # than trusting the primary source alone.
                missing += 1
            time.sleep(REQUEST_DELAY_SECONDS)

    write_json(
        cache / "_provenance.json",
        {
            "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "lunarisVersion": version,
            "sources": [
                {
                    "name": "Project Amber",
                    "role": "primary",
                    "endpoint": AMBER_DETAIL,
                },
                {
                    "name": "Lunaris",
                    "role": "verifier",
                    "endpoint": LUNARIS_DETAIL,
                },
            ],
        },
    )
    print(
        f"fetched {fetched}, reused {skipped} cached, "
        f"{missing} not published by the verifier"
    )


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--cache",
        type=pathlib.Path,
        default=pathlib.Path(__file__).parent / ".cache",
    )
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args(argv)
    fetch_all(args.cache, args.force)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
