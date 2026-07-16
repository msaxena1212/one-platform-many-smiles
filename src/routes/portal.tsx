import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Wrench, CreditCard, CalendarCheck2, FileText, MessageSquare, Settings, Calendar, Star } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";
import { tickets } from "@/lib/mock-data";

const nav: NavItem[] = [
  { to: "/portal", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/portal/tickets", label: "Tickets", icon: <Wrench className="h-4 w-4" />, badge: tickets.filter(t => t.status !== "resolved" && t.status !== "closed").length },
  { to: "/portal/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { to: "/portal/bookings", label: "Facility booking", icon: <CalendarCheck2 className="h-4 w-4" /> },
  { to: "/portal/documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
  { to: "/portal/community", label: "Community", icon: <MessageSquare className="h-4 w-4" /> },
  { to: "/portal/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

const titles: Record<string, string> = {
  "/portal": "Welcome back",
  "/portal/tickets": "My tickets",
  "/portal/payments": "Payments",
  "/portal/bookings": "Facility booking",
  "/portal/documents": "Documents",
  "/portal/community": "Community",
  "/portal/settings": "Account settings",
  "/portal/community/events": "Events",
  "/portal/community/reviews": "Reviews",
};

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  const path = useRouterState({ select: s => s.location.pathname });
  const title = titles[path] ?? "Customer Portal";
  return (
    <AppShell variant="portal" title={title} nav={nav}>
      <Outlet />
    </AppShell>
  );
}
