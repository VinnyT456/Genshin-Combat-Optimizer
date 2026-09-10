// Public surface of the elemental aura / reaction / ICD mechanics layer.
//
// The combat engine should need only `resolveElementalHit` and
// `toReactionModifiers`; the rest is exported for game-data authoring, tests
// and UI display.
export * from "@/simulation/reactions/types";
export * from "@/simulation/reactions/constants";
export * from "@/simulation/reactions/finiteness";
export * from "@/simulation/reactions/aura";
export * from "@/simulation/reactions/auraTolerance";
export * from "@/simulation/reactions/reactionTable";
export * from "@/simulation/reactions/reactionDamage";
export * from "@/simulation/reactions/icd";
export * from "@/simulation/reactions/applyElement";
export * from "@/simulation/reactions/abilityContract";
export * from "@/simulation/reactions/resolver";
export * from "@/simulation/reactions/unverified";
export * from "@/simulation/reactions/infusions";

