import { createFileRoute } from "@tanstack/react-router";
import { ProcurementModule } from "@/components/procurement-module";
export const Route = createFileRoute("/prop-mgr/procurement")({ component: () => <ProcurementModule role="prop-mgr" /> });
