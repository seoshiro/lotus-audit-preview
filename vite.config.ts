import { defineConfig } from "vite";
import { resolve } from "node:path";
import { allPages } from './scripts/page-manifest.ts';
export default defineConfig(({ mode }) => ({
  base: "./",
  build: {
    outDir: mode === 'soft-preview' ? 'dist-soft' : 'dist',
    target: "es2022",
    rollupOptions: {
      input: Object.fromEntries([...allPages, ...(mode === 'soft-preview' ? ['soft-lotus.html'] : [])].map(file => [file.replace(/[/.]/g, '_'), resolve(file)])),
    },
  },
}));
