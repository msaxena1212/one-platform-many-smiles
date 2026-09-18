import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    cacheDir: process.env.VITE_CACHE_DIR ?? "node_modules/.vite",
    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: ["property-management.zynotechnologies.com"],
    },
  },
  // Use Nitro's Vercel preset so the deployment exposes the SSR handler
  // instead of generating a Cloudflare worker that Vercel cannot route to.
  nitro: { preset: "vercel" },
});
