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
  enhancementWarning: string;
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

// 主要玩家資訊介面
export interface PlayerProfile {
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
  last_crawled_at: string;
  profile_url: string;
  profile_banner: string;
  mythic_plus_weekly_highest_level_runs: MythicPlusRun[];
  mythic_plus_previous_weekly_highest_level_runs: MythicPlusRun[];
  gear: Gear;
}

// 神話鑰石副本通關記錄
export interface MythicPlusRun {
  dungeon: string;
  short_name: string;
  mythic_level: number;
  completed_at: string;
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

// 副本詞綴
export interface Affix {
  id: number;
  name: string;
  description: string;
  icon: string;
  icon_url: string;
  wowhead_url: string;
}

// 玩家裝備資訊
export interface Gear {
  created_at: string;
  updated_at: string;
  source: string;
  item_level_equipped: number;
  item_level_total: number;
  artifact_traits: number;
  corruption: CorruptionSummary;
  items: ItemSlots;
}

// 腐化值總結
export interface CorruptionSummary {
  added: number;
  resisted: number;
  total: number;
  cloakRank: number;
  spells: any[];
}

// 裝備欄位集合
export interface ItemSlots {
  head: Item;
  neck: Item;
  shoulder: Item;
  back: Item;
  chest: Item;
  waist: Item;
  wrist: Item;
  hands: Item;
  legs: Item;
  feet: Item;
  finger1: Item;
  finger2: Item;
  trinket1: Item;
  trinket2: Item;
  mainhand: Item;
  offhand?: Item; // 可選，因為並非所有職業都有副手
}

// 基本物品屬性
export interface Item {
  item_id: number;
  item_level: number;
  icon: string;
  name: string;
  item_quality: number;
  is_legendary: boolean;
  is_azerite_armor: boolean;
  azerite_powers?: AzeritePower[];
  corruption: ItemCorruption;
  domination_shards: any[];
  tier?: string;
  gems: number[];
  enchants?: number[];
  bonuses: number[];
}

// 艾澤萊晶岩能力
export interface AzeritePower {
  id: number;
  spell: Spell;
  tier: number;
}

// 法術資訊
export interface Spell {
  id: number;
  school: number;
  icon: string;
  name: string;
  rank: any;
}

// 物品腐化值
export interface ItemCorruption {
  added: number;
  resisted: number;
  total: number;
}