import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    cacheDir: process.env.VITE_CACHE_DIR ?? "node_modules/.vite",
    build: {
      chunkSizeWarningLimit: 1500,
    },
    server: {
      host: "0.0.0.0",
      port: 8080,
      allowedHosts: ["property-management.zynotechnologies.com"],
    },
  },
});

