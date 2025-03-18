import { ref, onMounted } from 'vue';

// 配置
const config = {
  playersFile: 'players.txt',
  apiBaseUrl: 'https://raider.io/api/v1/characters/profile',
  region: 'tw',
  fields: 'mythic_plus_weekly_highest_level_runs,mythic_plus_previous_weekly_highest_level_runs,gear',
  tierSlots: ['chest', 'hands', 'head', 'legs', 'shoulder'],
  timezone: 'Asia/Taipei', // 台灣時區
};

export default {
  setup() {
    const players = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // 解析玩家文本
    const parsePlayersList = (text) => text.trim().split('\n');

    // 從玩家字串中提取名稱和伺服器
    const extractPlayerInfo = (playerString) => {
      const [name, realm] = playerString.split('-');
      return { name, realm };
    };

    // 建立API請求URL
    const buildApiUrl = ({ name, realm }) => {
      const url = new URL(config.apiBaseUrl);
      url.searchParams.append('region', config.region);
      url.searchParams.append('realm', realm);
      url.searchParams.append('name', name);
      url.searchParams.append('fields', config.fields);
      return url.toString();
    };

    // 計算裝備的階層件數
    const countTierPieces = (items) => {
      if (!items) return {};

      return config.tierSlots.reduce((acc, slot) => {
        if (items[slot] && items[slot].tier && items[slot].tier !== 999) {
          const tier = items[slot].tier;
          acc[tier] = (acc[tier] || 0) + 1;
        }
        return acc;
      }, {});
    };

    // 轉換UTC時間到台灣時區
    const convertToTaiwanTime = (utcDateString) => {
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
    const formatTierPieces = (tierPieces) => {
      return (
        Object.entries(tierPieces)
          .map(([tier, count]) => `${tier} × ${count}`)
          .join(', ') || 'n/a'
      );
    };

    // 從API回應轉換為所需的玩家資料結構
    const transformPlayerData = (json, playerName) => {
      const currentRuns = json.mythic_plus_weekly_highest_level_runs || [];
      const previousRuns = json.mythic_plus_previous_weekly_highest_level_runs || [];
      const highestCurrentRun = currentRuns[0] || null;
      const gear = json.gear || {};
      const tierPieces = countTierPieces(gear.items || {});
      const formattedTierPieces = formatTierPieces(tierPieces);

      return {
        name: playerName,
        ilvl: gear.item_level_equipped ? Math.round(gear.item_level_equipped) : null,
        key: highestCurrentRun ? highestCurrentRun.mythic_level : 'n/a',
        currentRunsCount: currentRuns.length >= 10 ? '10+' : currentRuns.length,
        previousRunsCount: previousRuns.length >= 10 ? '10+' : previousRuns.length,
        time: highestCurrentRun ? convertToTaiwanTime(highestCurrentRun.completed_at) : 'n/a',
        tierPieces: formattedTierPieces,
      };
    };

    // 依照裝等排序玩家資料
    const sortPlayersByItemLevel = (players) => {
      return [...players].sort((a, b) => {
        const aIlvl = a.ilvl !== null ? a.ilvl : Infinity;
        const bIlvl = b.ilvl !== null ? b.ilvl : Infinity;
        return aIlvl - bIlvl;
      });
    };

    // 獲取玩家資料
    const fetchPlayerData = async (player) => {
      try {
        const { name } = player;
        const url = buildApiUrl(player);
        const response = await fetch(url);
        const json = await response.json();
        return transformPlayerData(json, name);
      } catch (error) {
        console.error(`Error fetching data for player: ${player.name}`, error);
        return null;
      }
    };

    // 獲取所有玩家資料
    const fetchAllPlayersData = async () => {
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
        const validPlayersData = playersData.filter((player) => player !== null);

        // 5. 依裝等排序
        const sortedPlayers = sortPlayersByItemLevel(validPlayersData);

        // 6. 更新狀態
        players.value = sortedPlayers;
      } catch (err) {
        console.error('獲取資料過程中發生錯誤:', err);
        error.value = `資料載入失敗: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchAllPlayersData);

    // 提供手動重新整理的方法
    const refreshData = () => {
      fetchAllPlayersData();
    };

    return {
      loading,
      players,
			error,
      refreshData,
    };
  },
};
