import { createFileRoute } from "@tanstack/react-router";

import { ManagePropertyPage } from "./prop-mgr.manage.$id";

export const Route = createFileRoute("/owner/manage/$id")({
  component: OwnerManageProperty,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode as string) === 'edit' ? 'edit' : 'view',
  }),
});

function OwnerManageProperty() {
  const { id } = Route.useParams();
  const { mode } = Route.useSearch();
  return <ManagePropertyPage basePath="/owner" id={id} mode={mode} />;
}
