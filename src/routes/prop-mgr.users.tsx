import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const UsersModule = lazy(() =>
  import("@/components/users-module").then((m) => ({ default: m.UsersModule }))
);

export const Route = createFileRoute("/prop-mgr/users")({
  head: () => ({ meta: [{ title: "Users - Property Manager" }] }),
  component: HostUsers,
});

function HostUsers() {
  return (
    <ModuleSuspense>
      <UsersModule role="prop-mgr" />
    </ModuleSuspense>
  );
}
