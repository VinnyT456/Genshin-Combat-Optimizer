export type WeaponType = "sword" | "claymore" | "polearm" | "catalyst" | "bow";
export type WeaponRarity = 4 | 5;

export type WeaponSubStatType =
  | "critRate"
  | "critDmg"
  | "atkPercent"
  | "energyRecharge"
  | "elementalMastery"
  | "hpPercent"
  | "defPercent"
  | "physicalDmg"
  | "none";

export interface WeaponSubStat {
  readonly type: WeaponSubStatType;
  readonly value: number;
  readonly labelZh: string;
}

export interface WeaponPassive {
  readonly name: string;
  readonly nameZh?: string;
  readonly desc: string;
}

export interface WeaponDefinition {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly weaponType: WeaponType;
  readonly rarity: WeaponRarity;
  readonly baseAtk: number; // At Level 90
  readonly subStat: WeaponSubStat; // At Level 90
  readonly iconUrl: string;
  readonly version?: string;
  readonly versionWeight?: number;
  readonly passive?: WeaponPassive;
  /** Combat values originate from the generated, cross-verified registry. */
  readonly dataSource?: "generated";
  /** Stable generated record ID retained for downstream lossless lookup. */
  readonly generatedId?: string;
}
