import { createFileRoute } from "@tanstack/react-router";
import { UsersModule } from "@/components/users-module";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users - Admin" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  return <UsersModule role="admin" />;
}
