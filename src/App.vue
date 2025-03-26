<template>
  <div class="max-w-6xl mx-auto p-3 sm:p-4 md:p-5 relative z-10">
    <!-- 頁頭 -->
    <div
      class="flex justify-between py-3 md:py-4 mb-3 md:mb-5 border-b border-wow-gold-dark flex-col items-start md:flex-row md:items-center gap-3 md:gap-4">
      <h1
        class="font-wow-title text-3xl sm:text-4xl font-bold text-wow-gold tracking-wide md:tracking-wider mb-3 md:mb-0 text-center md:text-left">
        Lazyraiders
      </h1>
      <button @click="refreshData"
        class="bg-wow-red-button text-wow-gold-light border-2 border-wow-gold-dark rounded px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-200 font-wow-title font-bold hover:bg-wow-red-button-hover hover:border-wow-gold hover:shadow-wow-btn-hover text-sm sm:text-base"
        title="重新整理資料">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" sm:width="18" sm:height="18"
          fill="none" stroke="currentColor" stroke-width="2" class="stroke-wow-gold-light">
          <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 6.39 2.61L21 9"></path>
          <path d="M21 4v5h-5"></path>
        </svg>
        <span v-if="loading">載入中...</span>
        <span v-else>重新整理</span>
      </button>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error"
      class="bg-gradient-to-b from-[rgba(75,17,6,0.8)] to-[rgba(50,10,5,0.8)] border border-wow-horde p-3 sm:p-4 md:p-5 rounded my-3 sm:my-4 md:my-5 text-center shadow-wow-box">
      <p class="mb-3 sm:mb-4 text-base sm:text-lg md:text-xl text-wow-text-light">{{ error }}</p>
      <button @click="refreshData"
        class="bg-wow-red-button text-wow-gold-light border border-wow-gold-dark px-3 sm:px-4 py-1.5 sm:py-2 rounded cursor-pointer font-wow-title font-bold transition-all duration-200 hover:bg-wow-red-button-hover hover:border-wow-gold hover:shadow-wow-btn-hover text-sm sm:text-base">
        重試
      </button>
    </div>

    <!-- 資料表格 -->
    <div v-else
      class="overflow-auto rounded bg-wow-bg-panel border border-wow-gold-dark shadow-wow-box md:overflow-visible">
      <table class="w-full border-collapse text-left text-sm sm:text-base md:text-lg">
        <thead>
          <tr>
            <th
              class="bg-gradient-to-b from-[#3d2f1b] to-[#211909] text-wow-gold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 font-wow-title border-b-2 border-wow-gold-dark font-bold tracking-wide md:tracking-wider whitespace-nowrap">
              角色名稱
            </th>
            <th
              class="bg-gradient-to-b from-[#3d2f1b] to-[#211909] text-wow-gold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 font-wow-title border-b-2 border-wow-gold-dark font-bold tracking-wide md:tracking-wider whitespace-nowrap">
              裝等
            </th>
            <th
              class="bg-gradient-to-b from-[#3d2f1b] to-[#211909] text-wow-gold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 font-wow-title border-b-2 border-wow-gold-dark font-bold tracking-wide md:tracking-wider whitespace-nowrap">
              T裝
            </th>
            <th
              class="bg-gradient-to-b from-[#3d2f1b] to-[#211909] text-wow-gold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 font-wow-title border-b-2 border-wow-gold-dark font-bold tracking-wide md:tracking-wider whitespace-nowrap">
              本周最高M+
            </th>
            <th
              class="bg-gradient-to-b from-[#3d2f1b] to-[#211909] text-wow-gold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 font-wow-title border-b-2 border-wow-gold-dark font-bold tracking-wide md:tracking-wider whitespace-nowrap">
              本周場次
            </th>
            <th
              class="bg-gradient-to-b from-[#3d2f1b] to-[#211909] text-wow-gold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 font-wow-title border-b-2 border-wow-gold-dark font-bold tracking-wide md:tracking-wider whitespace-nowrap">
              上周場次
            </th>
            <th
              class="bg-gradient-to-b from-[#3d2f1b] to-[#211909] text-wow-gold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 font-wow-title border-b-2 border-wow-gold-dark font-bold tracking-wide md:tracking-wider whitespace-nowrap">
              缺少附魔或寶石
            </th>
            <th
              class="bg-gradient-to-b from-[#3d2f1b] to-[#211909] text-wow-gold py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 font-wow-title border-b-2 border-wow-gold-dark font-bold tracking-wide md:tracking-wider whitespace-nowrap">
              連結
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- 載入中狀態 -->
          <tr v-if="loading" class="loading-row">
            <td colspan="8" class="text-center py-8 sm:py-9 md:py-10">
              <div
                class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-3 sm:border-4 border-wow-gold border-t-transparent rounded-full mx-auto mb-3 md:mb-4 animate-spin">
              </div>
              <div class="text-sm sm:text-base">正在擷取資料中...</div>
            </td>
          </tr>

          <!-- 玩家資料列 -->
          <tr v-else v-for="player in players" :key="player.name"
            class="transition-colors duration-200 hover:bg-gradient-to-b hover:from-[rgba(61,47,27,0.5)] hover:to-[rgba(33,25,9,0.5)] even:bg-[rgba(40,30,20,0.5)] odd:bg-[rgba(30,25,15,0.5)]">
            <td
              class="py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-b border-wow-border-dark font-bold text-shadow-wow-dark"
              :style="{ color: player.classColor }" :title="player.localizedClassName">
              <span class="text-xs sm:text-sm md:text-base">{{ player.name }}</span>
            </td>
            <td
              class="py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-b border-wow-border-dark font-bold text-shadow-wow-dark"
              :style="{ color: player.ilvlColor }">
              <span class="text-xs sm:text-sm md:text-base">{{ player.ilvl }}</span>
            </td>
            <td
              class="py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-b border-wow-border-dark text-wow-text-medium">
              <span class="text-xs sm:text-sm md:text-base">{{ player.tierPieces }}</span>
            </td>
            <td
              class="py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-b border-wow-border-dark text-wow-highlight text-center font-bold">
              <span class="text-xs sm:text-sm md:text-base">{{ player.key }}</span>
            </td>
            <td class="py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-b border-wow-border-dark text-center"
              :class="{ 'text-wow-horde bg-[rgba(179,0,0,0.2)]': player.currentRunsCount === 0 }">
              <span class="text-xs sm:text-sm md:text-base">
                {{ player.currentRunsCount }}
                {{ player.currentRunsCount === 0 ? '🤡' : '' }}
              </span>
            </td>
            <td class="py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-b border-wow-border-dark text-center"
              :class="{ 'text-wow-horde bg-[rgba(179,0,0,0.2)]': player.previousRunsCount === 0 }">
              <span class="text-xs sm:text-sm md:text-base">
                {{ player.previousRunsCount }}
                {{ player.previousRunsCount === 0 ? '🤡' : '' }}
              </span>
            </td>
            <td
              class="py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-b border-wow-border-dark text-center text-wow-horde">
              <div v-if="player.enhancementWarning" class="relative inline-block cursor-help">
                <i class="fas fa-exclamation-triangle peer text-xs sm:text-sm md:text-base"></i>
                <span
                  class="invisible absolute -left-60 w-48 sm:w-52 md:w-56 bg-wow-bg-panel text-wow-text-light text-left rounded border border-wow-gold-dark p-2 sm:p-2.5 z-50 opacity-0 transition-opacity duration-300 whitespace-pre-wrap leading-relaxed peer-hover:visible peer-hover:opacity-100 text-xs sm:text-sm">
                  {{ player.enhancementWarning }}
                </span>
              </div>
            </td>
            <td class="py-1.5 sm:py-2 md:py-2.5 px-2 sm:px-3 md:px-4 border-b border-wow-border-dark">
              <div class="flex justify-center gap-2 sm:gap-2.5">
                <a :href="player.wclUrl" target="_blank"
                  class="inline-flex items-center justify-center w-6 h-6 sm:w-6.5 md:w-7 sm:h-6.5 md:h-7 rounded-full text-wow-text-light transition-all duration-200 hover:scale-110 hover:shadow-wow-light hover:bg-wow-red-button-hover"
                  title="WarcraftLogs">
                  <img src="/images/wcl-icon.png" alt="WCL" class="w-full h-full">
                </a>
                <a :href="player.raiderIoUrl" target="_blank"
                  class="inline-flex items-center justify-center w-6 h-6 sm:w-6.5 md:w-7 sm:h-6.5 md:h-7 rounded-full text-wow-text-light transition-all duration-200 hover:scale-110 hover:shadow-wow-light hover:bg-wow-alliance"
                  title="Raider.io">
                  <img src="/images/io-icon.webp" alt="RIO" class="w-full h-full">
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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