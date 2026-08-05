import { createFileRoute } from "@tanstack/react-router";

import { ManagePropertyPage } from "./prop-mgr.manage.$id";

export const Route = createFileRoute("/admin/manage/$id")({
  component: AdminManageProperty,
});

function AdminManageProperty() {
  return <ManagePropertyPage basePath="/admin" />;
}
