import { createFileRoute } from "@tanstack/react-router";

import { ManagePropertyPage } from "./prop-mgr.manage.$id";

export const Route = createFileRoute("/admin/manage/$id")({
  component: AdminManageProperty,
});

function AdminManageProperty() {
  const { id } = Route.useParams();
  return <ManagePropertyPage basePath="/admin" id={id} />;
}
