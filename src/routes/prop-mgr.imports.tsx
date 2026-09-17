import { createFileRoute } from "@tanstack/react-router";
import { AdminExcelImportPage } from "./admin.imports";

export const Route = createFileRoute("/prop-mgr/imports")({
  component: PropMgrExcelImportPage,
});

function PropMgrExcelImportPage() {
  return <AdminExcelImportPage />;
}
