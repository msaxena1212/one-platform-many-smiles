import { createFileRoute } from "@tanstack/react-router";
import { UnitsModule } from "@/components/units-module";

export const Route = createFileRoute("/prop-mgr/units")({
  head: () => ({ meta: [{ title: "Units - Property Manager" }] }),
  component: PropMgrUnits,
});

function PropMgrUnits() {
  return <UnitsModule role="prop-mgr" />;
}
