import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/sales")({
  component: SalesLayout,
});

function SalesLayout() {
  const nav = [
    { label: "Listings", to: "/sales/listings", icon: "Building2" },
    { label: "Reservations", to: "/sales/reservations", icon: "Clock" },
    { label: "Appointments", to: "/sales/appointments", icon: "Calendar" },
    { label: "Contracts", to: "/sales/contracts", icon: "FileText" },
  ];

  return (
    <AppShell variant="host" title="Sales Console" nav={nav}>
      <Outlet />
    </AppShell>
  );
}
