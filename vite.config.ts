import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  build: {
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
});
