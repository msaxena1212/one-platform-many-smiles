import { createFileRoute } from "@tanstack/react-router";
import { AssetManager } from "@/components/assets-module";

export const Route = createFileRoute("/admin/assets")({
  component: AdminAssetsPage,
});

function AdminAssetsPage() {
  return <AssetManager role="admin" />;
}
