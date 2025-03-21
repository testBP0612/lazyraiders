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
  realm: string;
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
  wclUrl: string;
  raiderIoUrl: string;
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
  name: string;
  race: string;
  class: string;
  active_spec_name: string;
  active_spec_role: string;
  gender: string;
  faction: string;
  achievement_points: number;
  thumbnail_url: string;
  region: string;
  realm: string;
  last_crawled_at: Date;
  profile_url: string;
  profile_banner: string;
  mythic_plus_weekly_highest_level_runs: any[];
  mythic_plus_previous_weekly_highest_level_runs: MythicPlusPreviousWeeklyHighestLevelRun[];
  gear: Gear;
}

export interface Gear {
  created_at: Date;
  updated_at: Date;
  source: string;
  item_level_equipped: number;
  item_level_total: number;
  artifact_traits: number;
  corruption: GearCorruption;
  items: { [key: string]: Item };
}

export interface GearCorruption {
  added: number;
  resisted: number;
  total: number;
  cloakRank: number;
  spells: any[];
}

export interface Item {
  item_id: number;
  item_level: number;
  icon: string;
  name: string;
  item_quality: number;
  is_legendary: boolean;
  is_azerite_armor: boolean;
  azerite_powers: Array<AzeritePower | null>;
  corruption: ItemCorruption;
  domination_shards: any[];
  gems: number[];
  enchants: number[];
  bonuses: number[];
  tier?: string;
  enchant?: number;
}

export interface AzeritePower {
  id: number;
  spell: Spell;
  tier: number;
}

export interface Spell {
  id: number;
  school: number;
  icon: string;
  name: string;
  rank: null;
}

export interface ItemCorruption {
  added: number;
  resisted: number;
  total: number;
}

export interface MythicPlusPreviousWeeklyHighestLevelRun {
  dungeon: string;
  short_name: string;
  mythic_level: number;
  completed_at: Date;
  clear_time_ms: number;
  keystone_run_id: number;
  par_time_ms: number;
  num_keystone_upgrades: number;
  map_challenge_mode_id: number;
  zone_id: number;
  zone_expansion_id: number;
  icon_url: string;
  background_image_url: string;
  score: number;
  affixes: Affix[];
  url: string;
}

export interface Affix {
  id: number;
  name: string;
  description: string;
  icon: string;
  icon_url: string;
  wowhead_url: string;
}
