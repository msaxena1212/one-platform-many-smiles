import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

/**
 * prop-mgr.leasing.tsx — thin route wrapper
 *
 * The full LeasingPage component (7000+ lines, ~408KB) lives in
 * `src/components/leasing-module.tsx` and is loaded lazily — it is only
 * downloaded when the user actually navigates to this route.
 */
const LeasingPage = lazy(() => import("@/components/leasing-module"));

export const Route = createFileRoute("/prop-mgr/leasing")({
  component: LazyLeasingPage,
});

function LazyLeasingPage() {
  return (
    <ModuleSuspense>
      <LeasingPage />
    </ModuleSuspense>
  );
}
