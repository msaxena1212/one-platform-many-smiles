import { createFileRoute } from "@tanstack/react-router";
import { LeasesModule } from "@/components/leases-module";

export const Route = createFileRoute("/prop-mgr/leases")({
  head: () => ({ meta: [{ title: "Leases - Property Manager" }] }),
  component: HostLeases,
});

function HostLeases() {
  return <LeasesModule role="prop-mgr" />;
}
