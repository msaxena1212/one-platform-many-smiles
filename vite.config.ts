import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    cacheDir: process.env.VITE_CACHE_DIR ?? "node_modules/.vite",
    server: {
      host: "0.0.0.0",
    },
  },
  // Vercel preset for Lovable/Vercel deployments (default)
  // Netlify uses plain vite build which outputs to dist/client
  nitro: { preset: "vercel" },
});
