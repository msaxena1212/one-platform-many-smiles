import { createFileRoute } from "@tanstack/react-router";
import { UnitsModule } from "@/components/units-module";

export const Route = createFileRoute("/admin/units")({
  head: () => ({ meta: [{ title: "Units - Admin" }] }),
  component: AdminUnits,
});

function AdminUnits() {
  return <UnitsModule role="admin" />;
}
