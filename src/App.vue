<template>
  <div class="header">
    <h1>Lazyraiders - v1.1.1</h1>
    <button @click="refreshData" class="refresh-btn" title="重新整理資料">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none"
        stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 6.39 2.61L21 9"></path>
        <path d="M21 4v5h-5"></path>
      </svg>
      <span v-if="loading">載入中...</span>
      <span v-else>重新整理</span>
    </button>
  </div>

  <div v-if="error" class="error-message">
    <p>{{ error }}</p>
    <button @click="refreshData" class="retry-btn">重試</button>
  </div>

  <div class="table-container" v-else>
    <table>
      <thead>
        <tr>
          <th>角色名稱</th>
          <th>裝等</th>
          <th>T裝</th>
          <th>本周最高M+</th>
          <th>本周場次</th>
          <th>上周場次</th>
          <th>完成時間</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading" class="loading-row">
          <td colspan="7" class="loading-cell">
            <div class="loading-spinner"></div>
            <div>正在擷取資料中...</div>
          </td>
        </tr>
        <tr v-else v-for="player in players" :key="player.name" class="player-row">
          <td class="name-cell" :style="{ color: player.classColor }" :title="player.localizedClassName">{{ player.name
            }}</td>
          <td class="ilvl-cell" :style="{ color: player.ilvlColor }">{{ player.ilvl }}</td>
          <td>{{ player.tierPieces }}</td>
          <td class="key-cell">{{ player.key }}</td>
          <td :class="{ 'zero': player.currentRunsCount === 0, 'runs-cell': true }">{{ player.currentRunsCount }}</td>
          <td :class="{ 'zero': player.previousRunsCount === 0, 'runs-cell': true }">{{ player.previousRunsCount }}</td>
          <td>{{ player.time }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type {
  Player,
  PlayerInfo,
  TierPieces,
  WowClassCssVars,
  WowClassNames,
  IlvlTiers,
  ApiResponse
} from './types';

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
  Warrior: 'var(--class-warrior)',
  Paladin: 'var(--class-paladin)',
  Hunter: 'var(--class-hunter)',
  Rogue: 'var(--class-rogue)',
  Priest: 'var(--class-priest)',
  'Death Knight': 'var(--class-death-knight)',
  DeathKnight: 'var(--class-death-knight)',
  Shaman: 'var(--class-shaman)',
  Mage: 'var(--class-mage)',
  Warlock: 'var(--class-warlock)',
  Monk: 'var(--class-monk)',
  Druid: 'var(--class-druid)',
  'Demon Hunter': 'var(--class-demon-hunter)',
  DemonHunter: 'var(--class-demon-hunter)',
  Evoker: 'var(--class-evoker)',
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
  poor: { min: 0, max: 599, color: 'var(--ilvl-poor)' },
  common: { min: 600, max: 619, color: 'var(--ilvl-common)' },
  uncommon: { min: 620, max: 629, color: 'var(--ilvl-uncommon)' },
  rare: { min: 630, max: 639, color: 'var(--ilvl-rare)' },
  epic: { min: 640, max: Infinity, color: 'var(--ilvl-epic)' },
};

export default defineComponent({
  name: 'App',
  setup() {
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

    // 從API回應轉換為所需的玩家資料結構
    const transformPlayerData = (json: ApiResponse, playerName: string): Player => {
      const currentRuns = json.mythic_plus_weekly_highest_level_runs || [];
      const previousRuns = json.mythic_plus_previous_weekly_highest_level_runs || [];
      const highestCurrentRun = currentRuns[0] || null;
      const gear: ApiResponse['gear'] = json.gear;
      const tierPieces = countTierPieces(gear?.items);
      const formattedTierPieces = formatTierPieces(tierPieces);

      // 從 API 獲取職業信息 (英文字串)
      const className = json.class || '';
      const classColor = getClassColor(className);
      const localizedClassName = getClassName(className);

      const ilvlValue = gear?.item_level_equipped ? Math.round(gear?.item_level_equipped ?? 0) : 'n/a';
      const ilvlColor = getIlvlColor(ilvlValue);

      return {
        name: playerName,
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
        const { name } = player;
        const url = buildApiUrl(player);
        const response = await fetch(url);
        const json = await response.json() as ApiResponse;
        return transformPlayerData(json, name);
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
  },
});
</script>

<style src="./style.css"></style>