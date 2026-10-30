import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const VendorModule = lazy(() =>
  import("@/components/vendor-module").then((m) => ({ default: m.VendorModule }))
);

export const Route = createFileRoute("/admin/vendors")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "master",
  }),
  head: () => ({ meta: [{ title: "Vendors - Admin" }] }),
  component: AdminVendors,
});

function AdminVendors() {
  return (
    <ModuleSuspense>
      <VendorModule role="admin" />
    </ModuleSuspense>
  );
}
