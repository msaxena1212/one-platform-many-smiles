import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const LeasingPage = lazy(() => import("@/components/leasing-module"));

export const Route = createFileRoute("/leasing/create")({
  component: LazyLeasingCreatePage,
});

function LazyLeasingCreatePage() {
  return (
    <ModuleSuspense>
      <LeasingPage />
    </ModuleSuspense>
  );
}
