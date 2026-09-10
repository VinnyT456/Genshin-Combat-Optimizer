// ============================================================================
// GENERATED FILE -- DO NOT EDIT.
//
// Regenerate with:
//   python3 scripts/generate-weapons/fetch.py
//   python3 scripts/generate-weapons/emit.py
//
// SOURCES (two INDEPENDENT datamined mirrors of the game's own files)
//   primary   Project Amber  https://gi.yatta.moe/api/v2/en/weapon/{id}
//   verifier  Lunaris        https://api.lunaris.moe/data/{version}/en/weapon/{id}.json (version 7.0.54)
//   fetched   2026-09-07T00:19:20Z
//
// Every emitted number is confirmed by BOTH sources. Per-level stats are
// recovered by solving each shared growth curve against the verifier's
// published values and then REPLAYING the solution back through every weapon
// that shares the curve; a level that fails is omitted and reported, never
// interpolated.
//
// Weapon PASSIVES are prose. They are bucketed, not guessed -- see
// `GeneratedWeaponPassiveBucket`. A passive that is not `expressible` carries
// its text and its bucket and NO invented effect.
// ============================================================================

export * from "./types";
export * from "./weapons";
