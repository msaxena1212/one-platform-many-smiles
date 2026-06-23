import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({ meta: [{ title: "Finance — Kinan Staff" }] }),
  component: FinanceLayout,
});

function FinanceLayout() {
  const pathname = useLocation({ select: (s) => s.pathname });

  const tabs = [
    { name: "Dashboard", path: "/admin/finance" },
    { name: "General Ledger", path: "/admin/finance/ledger" },
    { name: "Receipts & Invoices", path: "/admin/finance/receipts" },
    { name: "Chart of Accounts", path: "/admin/finance/coa" },
    { name: "Owner Payables", path: "/admin/finance/payables" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => {
            // Precise exact match for Dashboard, prefix match for others.
            // A bit of a hack for simple routing.
            const isActive = tab.path === "/admin/finance" 
              ? pathname === "/admin/finance" || pathname === "/admin/finance/"
              : pathname.startsWith(tab.path);
            
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
