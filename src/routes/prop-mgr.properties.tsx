import { createFileRoute } from "@tanstack/react-router";
import { PropertiesModule } from "@/components/properties-module";

export const Route = createFileRoute("/prop-mgr/properties")({
  head: () => ({ meta: [{ title: "Properties - Property Manager" }] }),
  component: PropMgrProperties,
});

function PropMgrProperties() {
  return <PropertiesModule role="prop-mgr" />;
}
