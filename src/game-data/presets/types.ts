import type { Rotation } from "@/types";

export interface PresetSlot {
  characterId: string;
  roleZh: string;
  flexIds?: readonly string[];
}

export interface PresetTeam {
  slot1: PresetSlot;
  slot2: PresetSlot;
  slot3: PresetSlot;
  slot4: PresetSlot;
}

export interface PresetErRequirement {
  characterId: string;
  minimumEr: number;
  recommendedWeapon?: string;
  conditionZh: string;
}

export interface PresetWeaponRecommendation {
  weaponId: string;
  rank: number;
  refinement?: number;
  commentZh: string;
}

export interface PresetArtifactRecommendation {
  setId: string;
  pieces: 2 | 4;
  rank: number;
  commentZh: string;
}

export interface PresetBuildRecommendation {
  weapons: readonly PresetWeaponRecommendation[];
  artifacts: readonly PresetArtifactRecommendation[];
  mainStats: {
    sands: string;
    goblet: string;
    circlet: string;
  };
  substatPriorityZh: readonly string[];
}

export interface PresetTalentsRecommendation {
  priorityZh: string;
  recommendedLevels: {
    normal: number;
    skill: number;
    burst: number;
  };
  keyConstellations: readonly {
    level: number;
    impactZh: string;
  }[];
}

export interface PresetMechanicsCaveat {
  topicZh: string;
  detailZh: string;
}

/**
 * Standardized Playstyle & Rotation Preset based on theorycrafting repositories
 * like KeqingMains (KQM) Quickguides and Extended Guides.
 */
export interface PlaystylePreset {
  id: string;
  characterId: string;
  nameZh: string;
  nameEn: string;
  sourceUrl: string;
  author?: string;
  version: string;

  team: PresetTeam;
  rotation: Rotation;
  rotationNotesZh: readonly string[];
  erRequirements: readonly PresetErRequirement[];
  build: PresetBuildRecommendation;
  talents: PresetTalentsRecommendation;
  mechanicsCaveatsZh: readonly PresetMechanicsCaveat[];
}
