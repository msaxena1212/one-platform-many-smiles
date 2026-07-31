import { createFileRoute } from "@tanstack/react-router";
import { AssetManager } from "@/components/assets-module";

export const Route = createFileRoute("/prop-mgr/assets")({
  component: PropMgrAssetsPage,
});

function PropMgrAssetsPage() {
  return <AssetManager role="prop-mgr" />;
}
