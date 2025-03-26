import { ref, onMounted } from 'vue';
import type {
  Player,
  PlayerInfo,
  TierPieces,
  WowClassCssVars,
  WowClassNames,
  IlvlTiers,
  PlayerProfile,
  Item,
  ItemSlots,
} from '../types';

// 配置
const config = {
  playersFile: 'players.txt',
  apiBaseUrl: 'https://raider.io/api/v1/characters/profile',
  region: 'tw',
  fields: 'mythic_plus_weekly_highest_level_runs,mythic_plus_previous_weekly_highest_level_runs,gear,class',
  tierSlots: ['chest', 'hands', 'head', 'legs', 'shoulder'],
  timezone: 'Asia/Taipei', // 台灣時區
};

// WoW 職業名稱與 CSS 變數映射
const wowClassCssVars: WowClassCssVars = {
  Warrior: 'var(--color-class-warrior)',
  Paladin: 'var(--color-class-paladin)',
  Hunter: 'var(--color-class-hunter)',
  Rogue: 'var(--color-class-rogue)',
  Priest: 'var(--color-class-priest)',
  'Death Knight': 'var(--color-class-death-knight)',
  DeathKnight: 'var(--color-class-death-knight)',
  Shaman: 'var(--color-class-shaman)',
  Mage: 'var(--color-class-mage)',
  Warlock: 'var(--color-class-warlock)',
  Monk: 'var(--color-class-monk)',
  Druid: 'var(--color-class-druid)',
  'Demon Hunter': 'var(--color-class-demon-hunter)',
  DemonHunter: 'var(--color-class-demon-hunter)',
  Evoker: 'var(--color-class-evoker)',
};

// WoW 職業名稱映射 (英文轉中文)
const wowClassNames: WowClassNames = {
  Warrior: '戰士',
  Paladin: '聖騎士',
  Hunter: '獵人',
  Rogue: '盜賊',
  Priest: '牧師',
  'Death Knight': '死亡騎士',
  Shaman: '薩滿',
  Mage: '法師',
  Warlock: '術士',
  Monk: '武僧',
  Druid: '德魯伊',
  'Demon Hunter': '惡魔獵人',
  Evoker: '喚能師',
};

// 裝等顏色等級 (可自定義)
const ilvlTiers: IlvlTiers = {
  poor: { min: 0, max: 599, color: 'var(--color-ilvl-poor)' },
  common: { min: 600, max: 619, color: 'var(--color-ilvl-common)' },
  uncommon: { min: 620, max: 629, color: 'var(--color-ilvl-uncommon)' },
  rare: { min: 630, max: 639, color: 'var(--color-ilvl-rare)' },
  epic: { min: 640, max: Infinity, color: 'var(--color-ilvl-epic)' },
};

// 可以附魔的裝備部位
const enchantableSlots = ['back', 'chest', 'wrist', 'legs', 'finger1', 'finger2', 'mainhand'];

// 可以插寶石的裝備部位
const socketableSlots = ['neck', 'finger1', 'finger2'];

const translateSlotNameMap: Record<string, string> = {
  head: '頭部',
  neck: '項鍊',
  shoulder: '肩膀',
  back: '披風',
  chest: '胸甲',
  waist: '腰帶',
  wrist: '護腕',
  hands: '手套',
  legs: '腿部',
  feet: '鞋子',
  finger1: '戒指 1',
  finger2: '戒指 2',
  trinket1: '飾品 1',
  trinket2: '飾品 2',
  mainhand: '主手武器',
  offhand: '副手武器',
};

const usePlayerData = () => {
  const players = ref<Player[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 解析玩家文本
  const parsePlayersList = (text: string): string[] => text.trim().split('\n');

  // 從玩家字串中提取名稱和伺服器
  const extractPlayerInfo = (playerString: string): PlayerInfo => {
    const [name, realm] = playerString.split('-');
    return { name, realm };
  };

  // 建立API請求URL
  const buildApiUrl = ({ name, realm }: PlayerInfo): string => {
    const url = new URL(config.apiBaseUrl);
    url.searchParams.append('region', config.region);
    url.searchParams.append('realm', realm);
    url.searchParams.append('name', name);
    url.searchParams.append('fields', config.fields);
    return url.toString();
  };

  // 計算裝備的階層件數
  const countTierPieces = (items: Record<string, any> | undefined): TierPieces => {
    if (!items) return {};

    return config.tierSlots.reduce<TierPieces>((acc, slot) => {
      if (items[slot] && items[slot].tier && items[slot].tier !== 999) {
        const tier = items[slot].tier;
        acc[tier] = (acc[tier] || 0) + 1;
      }
      return acc;
    }, {});
  };

  // 轉換UTC時間到台灣時區
  const convertToTaiwanTime = (utcDateString: string | undefined): string => {
    if (!utcDateString) return 'n/a';

    const date = new Date(utcDateString);
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: config.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 格式化階層件數為顯示文字
  const formatTierPieces = (tierPieces: TierPieces): string => {
    return (
      Object.entries(tierPieces)
        .map(([tier, count]) => `${tier} × ${count}`)
        .join(', ') || 'n/a'
    );
  };

  // 獲取職業顏色 (支援英文名稱，返回 CSS 變數)
  const getClassColor = (className: string): string => {
    return wowClassCssVars[className] || 'var(--class-unknown, #CCCCCC)';
  };

  // 獲取職業名稱
  const getClassName = (classId: string): string => {
    return wowClassNames[classId] || '未知';
  };

  // 獲取裝等顏色 (使用 CSS 變數)
  const getIlvlColor = (ilvl: number | string): string => {
    if (ilvl === 'n/a') return 'var(--ilvl-poor)'; // 預設灰色

    const numIlvl = Number(ilvl);
    for (const tier in ilvlTiers) {
      const { min, max, color } = ilvlTiers[tier];
      if (numIlvl >= min && numIlvl <= max) {
        return color;
      }
    }
    return 'var(--ilvl-common)'; // 預設白色
  };

  // 檢查缺少的附魔和寶石
  const checkMissingEnchantsAndGems = (items: ItemSlots) => {
    const missingEnchants: string[] = [];
    const missingGems: string[] = [];

    for (const slotName of enchantableSlots) {
      const slot = slotName as keyof ItemSlots;
      const item = items[slot];

      if (item && !item.enchants?.length) {
        missingEnchants.push(translateSlotNameMap[slot]);
      }
    }

    for (const slotName of socketableSlots) {
      const slot = slotName as keyof ItemSlots;
      const item = items[slot];

      if (item && !item.gems?.length) {
        missingGems.push(translateSlotNameMap[slot]);
      }
    }

    return { missingEnchants, missingGems };
  };

  // 從API回應轉換為所需的玩家資料結構
  const transformPlayerData = (json: PlayerProfile, playerName: string, realm: string): Player => {
    const currentRuns = json.mythic_plus_weekly_highest_level_runs || [];
    const previousRuns = json.mythic_plus_previous_weekly_highest_level_runs || [];
    const highestCurrentRun = currentRuns[0] || null;
    const gear: PlayerProfile['gear'] = json.gear;
    const tierPieces = countTierPieces(gear?.items);
    const formattedTierPieces = formatTierPieces(tierPieces);

    // 從 API 獲取職業信息 (英文字串)
    const className = json.class || '';
    const classColor = getClassColor(className);
    const localizedClassName = getClassName(className);

    const ilvlValue = gear?.item_level_equipped ? Math.round(gear?.item_level_equipped ?? 0) : 'n/a';
    const ilvlColor = getIlvlColor(ilvlValue);

    const encodeName = encodeURIComponent(playerName.trim());
    const encodeRealm = encodeURIComponent(realm.trim());

    const wclUrl = `https://${config.region}.warcraftlogs.com/character/${config.region}/${encodeRealm}/${encodeName}`;
    const raiderIoUrl = `https://raider.io/characters/${config.region}/${encodeRealm}/${encodeName}`;

    // 檢查缺少的附魔和寶石
    const { missingEnchants, missingGems } = checkMissingEnchantsAndGems(gear?.items || {});

    // 構建提示文本
    let enhancementWarning = '';
    if (missingEnchants.length > 0) {
      enhancementWarning += `缺少附魔: ${missingEnchants.join(', ')}`;
    }

    // 如果同時缺少附魔和寶石，添加換行
    if (missingEnchants.length > 0 && missingGems.length > 0) {
      enhancementWarning += '\n';
    }

    if (missingGems.length > 0) {
      enhancementWarning += `缺少寶石: ${missingGems.join(', ')}`;
    }

    return {
      name: playerName,
      realm,
      ilvl: gear?.item_level_equipped ? Math.round(gear?.item_level_equipped ?? 0) : null,
      ilvlColor,
      key: highestCurrentRun ? highestCurrentRun.mythic_level : 'n/a',
      currentRunsCount: currentRuns.length >= 10 ? '10+' : currentRuns.length,
      previousRunsCount: previousRuns.length >= 10 ? '10+' : previousRuns.length,
      time: highestCurrentRun ? convertToTaiwanTime(highestCurrentRun.completed_at) : 'n/a',
      tierPieces: formattedTierPieces,
      classColor,
      localizedClassName,
      className,
      wclUrl,
      raiderIoUrl,
      enhancementWarning,
    };
  };

  // 依照裝等排序玩家資料
  const sortPlayersByItemLevel = (players: Player[]): Player[] => {
    return [...players].sort((a, b) => {
      const aIlvl = a.ilvl !== null ? a.ilvl : Infinity;
      const bIlvl = b.ilvl !== null ? b.ilvl : Infinity;
      return aIlvl - bIlvl;
    });
  };

  // 獲取玩家資料
  const fetchPlayerData = async (player: PlayerInfo): Promise<Player | null> => {
    try {
      const { name, realm } = player;
      const url = buildApiUrl(player);
      const response = await fetch(url);
      const json = (await response.json()) as PlayerProfile;
      return transformPlayerData(json, name, realm);
    } catch (error) {
      console.error(`Error fetching data for player: ${player.name}`, error);
      return null;
    }
  };

  // 獲取所有玩家資料
  const fetchAllPlayersData = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      // 1. 從文件取得玩家列表
      const response = await fetch(config.playersFile);

      if (!response.ok) {
        throw new Error(`無法獲取玩家列表: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();

      // 2. 轉換為玩家物件
      const playersList = parsePlayersList(text).map(extractPlayerInfo);

      // 3. 獲取每個玩家的資料
      const playersData = await Promise.all(playersList.map(fetchPlayerData));

      // 4. 過濾無效資料
      const validPlayersData = playersData.filter((player): player is Player => player !== null);

      // 5. 依裝等排序
      const sortedPlayers = sortPlayersByItemLevel(validPlayersData);

      // 6. 更新狀態
      players.value = sortedPlayers;
    } catch (err: any) {
      console.error('獲取資料過程中發生錯誤:', err);
      error.value = `資料載入失敗: ${err.message}`;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchAllPlayersData);

  // 提供手動重新整理的方法
  const refreshData = (): void => {
    fetchAllPlayersData();
  };

  return {
    loading,
    players,
    error,
    refreshData,
  };
};

export default usePlayerData;
