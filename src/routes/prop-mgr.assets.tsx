import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const AssetManager = lazy(() =>
  import("@/components/assets-module").then((m) => ({ default: m.AssetManager }))
);

export const Route = createFileRoute("/prop-mgr/assets")({
  head: () => ({ meta: [{ title: "Assets - Property Manager" }] }),
  component: PropMgrAssetsPage,
});

function PropMgrAssetsPage() {
  return (
    <ModuleSuspense>
      <AssetManager role="prop-mgr" />
    </ModuleSuspense>
  );
}
