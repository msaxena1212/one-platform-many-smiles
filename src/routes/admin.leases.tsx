import { createFileRoute } from "@tanstack/react-router";
import { LeasesModule } from "@/components/leases-module";

export const Route = createFileRoute("/admin/leases")({
  head: () => ({ meta: [{ title: "Leases - Admin" }] }),
  component: AdminLeases,
});

function AdminLeases() {
  return <LeasesModule role="admin" />;
}
