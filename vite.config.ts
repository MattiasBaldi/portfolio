import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      plugins: [
        visualizer({
          filename: "./dist/stats.html", // the report file
          open: true, // automatically open in browser
          gzipSize: true, // show gzip size
          brotliSize: true, // show brotli size
        }),
      ],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["src/tests/setup.ts"],
  },
});
