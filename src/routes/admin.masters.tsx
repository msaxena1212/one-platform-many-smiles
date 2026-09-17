import { createFileRoute } from "@tanstack/react-router";
import { MastersModule } from "@/components/masters-module";

export const Route = createFileRoute("/admin/masters")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "gender",
  }),
  head: () => ({ meta: [{ title: "Masters - Admin" }] }),
  component: AdminMasters,
});

function AdminMasters() {
  return <MastersModule role="admin" />;
}
