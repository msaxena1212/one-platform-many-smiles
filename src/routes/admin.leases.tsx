import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/leases")({
  component: AdminLeasesLayout,
});

function AdminLeasesLayout() {
  return <Outlet />;
}
