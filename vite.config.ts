import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    cacheDir: process.env.VITE_CACHE_DIR ?? "node_modules/.vite",
    server: {
      host: "0.0.0.0",
      port: 8080,
      allowedHosts: ["property-management.zynotechnologies.com"],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // ── Vendor chunks (long-cached, rarely change) ──────────────────
            if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
              return "vendor-recharts";
            }
            if (id.includes("node_modules/@react-pdf") || id.includes("node_modules/pdf-lib")) {
              return "vendor-pdf";
            }
            if (id.includes("node_modules/@react-google-maps")) {
              return "vendor-google-maps";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-lucide";
            }
            if (id.includes("node_modules/@radix-ui")) {
              return "vendor-radix";
            }
            if (id.includes("node_modules/@supabase") || id.includes("node_modules/supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("node_modules/@tanstack")) {
              return "vendor-tanstack";
            }
            if (
              id.includes("node_modules/react-hook-form") ||
              id.includes("node_modules/zod") ||
              id.includes("node_modules/@hookform")
            ) {
              return "vendor-forms";
            }
            if (
              id.includes("node_modules/react-day-picker") ||
              id.includes("node_modules/date-fns")
            ) {
              return "vendor-date";
            }
            if (id.includes("node_modules/")) {
              return "vendor-misc";
            }

            // ── App module chunks (lazy-loaded per route) ───────────────────
            if (id.includes("src/components/finance-module")) return "module-finance";
            if (id.includes("src/components/hrms-module")) return "module-hrms";
            if (id.includes("src/components/maintenance-module")) return "module-maintenance";
            if (id.includes("src/components/procurement-module")) return "module-procurement";
            if (id.includes("src/components/assets-module")) return "module-assets";
            if (id.includes("src/components/vendor-module")) return "module-vendor";
            if (id.includes("src/components/leasing-module")) return "module-leasing";
            if (id.includes("src/components/units-module")) return "module-units";
            if (id.includes("src/components/properties-module")) return "module-properties";
            if (id.includes("src/components/masters-module")) return "module-masters";
            if (id.includes("src/components/leases-module")) return "module-leases";
            if (id.includes("src/components/users-module")) return "module-users";
          },
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
