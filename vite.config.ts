import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    cacheDir: process.env.VITE_CACHE_DIR ?? "node_modules/.vite",
    server: {
      host: "0.0.0.0",
    },
  },
  // Use Nitro Netlify preset for Netlify deployment
  nitro: { preset: "netlify" },
});
