import { createFileRoute } from "@tanstack/react-router";
import { AdminExcelImportPage } from "./admin.imports";

export const Route = createFileRoute("/prop-mgr/imports")({
  validateSearch: (search: Record<string, unknown>) => ({
    module: (search.module as string) || "property",
    op: (search.op as string) || "CREATE",
  }),
  component: PropMgrExcelImportPage,
});

function PropMgrExcelImportPage() {
  return <AdminExcelImportPage />;
}
