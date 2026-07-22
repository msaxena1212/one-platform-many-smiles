import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, LogOut, DollarSign, BookOpen, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/finance")({
  component: FinanceLayout,
});

function FinanceLayout() {
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
            <DollarSign className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Finance Dashboard</span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            to="/finance"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"
          >
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
          <Link to="/finance/ledger" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><BookOpen className="h-4 w-4" /> General Ledger</Link>
          <Link to="/finance/journal" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><FileText className="h-4 w-4" /> Journal Entries</Link>
          <Link to="/finance/receivables" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-muted [&.active]:bg-primary/10 [&.active]:text-primary"><Wallet className="h-4 w-4" /> Receivables</Link>
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
