import { createFileRoute } from "@tanstack/react-router";

import { ManagePropertyPage } from "./prop-mgr.manage.$id";

export const Route = createFileRoute("/owner/manage/$id")({
  component: OwnerManageProperty,
});

function OwnerManageProperty() {
  return <ManagePropertyPage basePath="/owner" />;
}
