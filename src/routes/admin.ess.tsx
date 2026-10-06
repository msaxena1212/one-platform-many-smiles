import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const HrmsEssPortal = lazy(() =>
  import("@/components/hrms-ess-portal").then((m) => ({ default: m.HrmsEssPortal }))
);

export const Route = createFileRoute("/admin/ess")({
  head: () => ({ meta: [{ title: "My HR Self-Service (ESS)" }] }),
  component: AdminEssPage,
});

function AdminEssPage() {
  return (
    <ModuleSuspense>
      <HrmsEssPortal />
    </ModuleSuspense>
  );
}
