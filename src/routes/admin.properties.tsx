import { createFileRoute } from "@tanstack/react-router";
import { PropertiesModule } from "@/components/properties-module";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({ meta: [{ title: "Properties - Admin" }] }),
  component: AdminProperties,
});

function AdminProperties() {
  return <PropertiesModule role="admin" />;
}
