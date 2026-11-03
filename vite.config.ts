import { defineConfig } from "vite";
import { resolve } from "node:path";
import { allPages } from './scripts/page-manifest.ts';
export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    rollupOptions: {
      input: Object.fromEntries(allPages.map(file => [file.replace(/[/.]/g, '_'), resolve(file)])),
    },
  },
});
