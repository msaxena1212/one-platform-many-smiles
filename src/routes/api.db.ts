import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { handleDbApi } from "@/lib/db-api-server";

/** Write API: every insert/update/upsert/delete from the app goes through here (see db-api-server.ts). */
export const Route = createFileRoute("/api/db")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { status, body } = await handleDbApi(request);
        return new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
