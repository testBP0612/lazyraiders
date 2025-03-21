<template>
  <div class="header">
    <h1>Lazyraiders</h1>
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
          <th>最後完成時間</th>
          <th>連結</th>
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
          <td :class="{ 'zero': player.currentRunsCount === 0, 'runs-cell': true }">
            {{ player.currentRunsCount }}
            {{ player.currentRunsCount === 0 ? '🤡' : '' }}
          </td>
          <td :class="{ 'zero': player.previousRunsCount === 0, 'runs-cell': true }">
            {{ player.previousRunsCount }}
            {{ player.previousRunsCount === 0 ? '🤡' : '' }}
          </td>
          <td>{{ player.time }}</td>
          <td class="links-cell">
            <a :href="player.wclUrl" target="_blank" class="wcl-link" title="WarcraftLogs">
              <i class="fas fa-chart-line"></i>
            </a>
            <a :href="player.raiderIoUrl" target="_blank" class="rio-link" title="Raider.io">
              <i class="fas fa-trophy"></i>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import usePlayerData from './composables/usePlayerData';

export default defineComponent({
  name: 'App',
  setup() {
    const { players, loading, error, refreshData } = usePlayerData();

    return {
      players,
      loading,
      error,
      refreshData,
    }
  }
});
</script>

<style src="./style.css"></style>