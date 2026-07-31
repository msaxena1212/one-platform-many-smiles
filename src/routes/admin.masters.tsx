import { createFileRoute } from "@tanstack/react-router";
import { MastersModule } from "@/components/masters-module";

export const Route = createFileRoute("/admin/masters")({
  head: () => ({ meta: [{ title: "Masters - Admin" }] }),
  component: AdminMasters,
});

function AdminMasters() {
  return <MastersModule role="admin" />;
}
