import { createFileRoute } from "@tanstack/react-router";
import { PropertiesModule } from "@/components/properties-module";

export const Route = createFileRoute("/owner/properties")({
  head: () => ({ meta: [{ title: "Properties - Owner" }] }),
  component: OwnerProperties,
});

function OwnerProperties() {
  return <PropertiesModule role="owner" />;
}
