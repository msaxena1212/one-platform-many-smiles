import { createFileRoute } from "@tanstack/react-router";

import { ManagePropertyPage } from "./prop-mgr.manage.$id";

export const Route = createFileRoute("/owner/manage/$id")({
  component: OwnerManageProperty,
});

function OwnerManageProperty() {
  const { id } = Route.useParams();
  return <ManagePropertyPage basePath="/owner" id={id} />;
}
