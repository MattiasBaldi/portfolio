import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath } from "node:url";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "cloudflared-tunnel",
      apply: "serve",
      configureServer(server) {
        const tunnel: ChildProcessWithoutNullStreams = spawn(
          "cloudflared",
          ["tunnel", "--url", "http://localhost:5173"],
          { stdio: "inherit" }
        );

        tunnel.on("error", (error) => {
          console.warn("[cloudflared] failed to start:", error.message);
        });

        const stopTunnel = () => {
          if (tunnel.killed) return;
          tunnel.kill("SIGTERM");
        };

        server.httpServer?.once("close", stopTunnel);
        process.once("SIGINT", stopTunnel);
        process.once("SIGTERM", stopTunnel);
      },
    },
  ],
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
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
