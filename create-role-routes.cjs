const fs = require('fs');
const path = require('path');

const roles = [
  { name: 'leasing', title: 'Leasing Dashboard', icon: 'Briefcase' },
  { name: 'finance', title: 'Finance Dashboard', icon: 'DollarSign' },
  { name: 'cashier', title: 'Cashier Dashboard', icon: 'CreditCard' },
  { name: 'maintenance', title: 'Maintenance Dashboard', icon: 'Wrench' }
];

const dir = './src/routes';

for (const role of roles) {
  const layoutPath = path.join(dir, `${role.name}.tsx`);
  const layoutContent = `import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, LogOut, ${role.icon} } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/${role.name}")({
  component: ${role.name.charAt(0).toUpperCase() + role.name.slice(1)}Layout,
});

function ${role.name.charAt(0).toUpperCase() + role.name.slice(1)}Layout() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background border-r border-border hidden md:flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <${role.icon} className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight">${role.title}</span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            to="/${role.name}"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"
          >
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
`;
  fs.writeFileSync(layoutPath, layoutContent);

  const indexPath = path.join(dir, `${role.name}.index.tsx`);
  const indexContent = `import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/${role.name}/")({
  component: ${role.name.charAt(0).toUpperCase() + role.name.slice(1)}Index,
});

function ${role.name.charAt(0).toUpperCase() + role.name.slice(1)}Index() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">${role.title}</h1>
      <p className="text-muted-foreground">Welcome to the ${role.title}.</p>
    </div>
  );
}
`;
  fs.writeFileSync(indexPath, indexContent);
}
console.log('Created basic layouts and index routes for Leasing, Finance, Cashier, Maintenance.');
