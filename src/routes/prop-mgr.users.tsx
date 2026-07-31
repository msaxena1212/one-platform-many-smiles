import { createFileRoute } from "@tanstack/react-router";
import { UsersModule } from "@/components/users-module";

export const Route = createFileRoute("/prop-mgr/users")({
  head: () => ({ meta: [{ title: "Users - Property Manager" }] }),
  component: HostUsers,
});

function HostUsers() {
  return <UsersModule role="prop-mgr" />;
}
