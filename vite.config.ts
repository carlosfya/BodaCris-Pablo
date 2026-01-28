import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  build: {
    outDir: "public/ui",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/main.tsx",
      output: {
        entryFileNames: "timeline.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "timeline.css";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
