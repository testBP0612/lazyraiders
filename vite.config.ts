import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '/lazyraiders/', // 必須 GitHub 倉庫名稱一致
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});