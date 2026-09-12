import { createFileRoute } from "@tanstack/react-router";
import { HrmsEssPortal } from "@/components/hrms-ess-portal";

export const Route = createFileRoute("/employee/portal")({
  head: () => ({ meta: [{ title: "Employee Self-Service (ESS) Portal" }] }),
  component: EmployeePortalPage,
});

function EmployeePortalPage() {
  return <HrmsEssPortal />;
}
