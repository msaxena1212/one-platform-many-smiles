import { createFileRoute } from "@tanstack/react-router";

import { ManagePropertyPage } from "./prop-mgr.manage.$id";

export const Route = createFileRoute("/admin/manage/$id")({
  component: AdminManageProperty,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode as string) === 'edit' ? 'edit' : 'view',
  }),
});

function AdminManageProperty() {
  const { id } = Route.useParams();
  const { mode } = Route.useSearch();
  return <ManagePropertyPage basePath="/admin" id={id} mode={mode} />;
}
