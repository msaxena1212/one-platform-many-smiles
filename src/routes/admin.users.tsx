import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const UsersModule = lazy(() =>
  import("@/components/users-module").then((m) => ({ default: m.UsersModule }))
);

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users - Admin" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  return (
    <ModuleSuspense>
      <UsersModule role="admin" />
    </ModuleSuspense>
  );
}
