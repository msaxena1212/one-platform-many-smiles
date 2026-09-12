import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const AssetManager = lazy(() =>
  import("@/components/assets-module").then((m) => ({ default: m.AssetManager }))
);

export const Route = createFileRoute("/admin/assets")({
  head: () => ({ meta: [{ title: "Assets - Admin" }] }),
  component: AdminAssetsPage,
});

function AdminAssetsPage() {
  return (
    <ModuleSuspense>
      <AssetManager role="admin" />
    </ModuleSuspense>
  );
}
