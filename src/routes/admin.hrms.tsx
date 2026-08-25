import { createFileRoute } from "@tanstack/react-router";
import { HrmsModule } from "@/components/hrms-module";

export const Route = createFileRoute("/admin/hrms")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "dashboard",
  }),
  head: () => ({ meta: [{ title: "Enterprise HRMS & Workforce - Admin" }] }),
  component: AdminHRMSPage,
});

function AdminHRMSPage() {
  return <HrmsModule role="admin" />;
}
