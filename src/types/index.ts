export interface PlayerInfo {
  name: string;
  realm: string;
}

export interface TierPieces {
  [key: string]: number;
}

export interface WowClassInfo {
  name: string;
  color: string;
  icon: string;
}

export interface IlvlTier {
  min: number;
  max: number;
  color: string;
}

export interface Player {
  name: string;
  ilvl: number | null;
  ilvlColor: string;
  key: string | number;
  currentRunsCount: string | number;
  previousRunsCount: string | number;
  time: string;
  tierPieces: string;
  classColor: string;
  localizedClassName: string;
  className: string;
}

export interface WowClassCssVars {
  [key: string]: string;
}

export interface WowClassNames {
  [key: string]: string;
}

export interface IlvlTiers {
  [key: string]: IlvlTier;
}

export interface ApiResponse {
  mythic_plus_weekly_highest_level_runs?: {
    mythic_level: number;
    completed_at: string;
  }[];
  mythic_plus_previous_weekly_highest_level_runs?: any[];
  gear?: {
    item_level_equipped: number;
    items?: {
      [key: string]: {
        tier?: string | number;
      };
    };
  };
  class?: string;
}