import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Building2, Clock, Calendar, FileText } from "lucide-react";

export const Route = createFileRoute("/sales")({
  component: SalesLayout,
});

function SalesLayout() {
  const nav: NavItem[] = [
    { label: "Listings", to: "/sales/listings", icon: <Building2 className="h-4 w-4" /> },
    { label: "Reservations", to: "/sales/reservations", icon: <Clock className="h-4 w-4" /> },
    { label: "Appointments", to: "/sales/appointments", icon: <Calendar className="h-4 w-4" /> },
    { label: "Contracts", to: "/sales/contracts", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <AppShell variant="host" title="Sales Console" nav={nav}>
      <Outlet />
    </AppShell>
  );
}
