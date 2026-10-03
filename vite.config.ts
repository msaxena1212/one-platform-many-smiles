import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    cacheDir: process.env.VITE_CACHE_DIR ?? "node_modules/.vite",
    server: {
      host: "0.0.0.0",
    },
  },
  // Default: vercel preset for Lovable/Vercel deployments.
  // Override via NITRO_PRESET env var (e.g. NITRO_PRESET=netlify for Netlify).
  nitro: { preset: (process.env.NITRO_PRESET?.toLowerCase() as any) || "vercel" },
});
