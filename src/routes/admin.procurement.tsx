import { createFileRoute } from "@tanstack/react-router";
import { ProcurementModule } from "@/components/procurement-module";
export const Route = createFileRoute("/admin/procurement")({ component: () => <ProcurementModule role="admin" /> });
