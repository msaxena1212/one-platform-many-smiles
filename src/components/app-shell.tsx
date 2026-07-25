import { Link, useNavigate, useRouterState, type LinkProps } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { type ReactNode } from "react";
import { clearDemoSession } from "@/lib/demo-auth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand";

export interface NavItem {
  to: LinkProps["to"];
  label: string;
  icon: ReactNode;
  badge?: string | number;
  indent?: boolean;
}

export function AppShell({
  variant,
  title,
  consoleLabel,
  nav,
  children,
  user,
}: {
  variant: "portal" | "admin" | "host";
  title: string;
  consoleLabel?: string;
  nav: NavItem[];
  children: ReactNode;
  user?: {
    initials: string;
    name: string;
    meta: string;
  };
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();

  const profile = user ?? {
    initials: variant === "admin" ? "AD" : variant === "host" ? "PM" : "TP",
    name: variant === "admin" ? "Admin User" : variant === "host" ? "Property Manager" : "Tenant User",
    meta: consoleLabel ?? (variant === "admin" ? "Staff Console" : variant === "host" ? "Host Console" : "Tenant Portal"),
  };

  async function handleSignOut() {
    clearDemoSession();
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link to="/auth" className="flex items-center gap-2.5 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">
              K
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm text-sidebar-foreground">ZYNO Property Management</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
                {consoleLabel ?? (variant === "admin" ? "Staff Console" : variant === "host" ? "Host Console" : "Tenant Portal")}
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 p-3 text-sm">
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to as string));

            return (
              <Link
                key={item.to as string}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                  item.indent && "pl-9 text-sidebar-foreground/65",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <span className="text-sidebar-primary">{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge != null && (
                  <span className="rounded-full bg-sidebar-primary px-2 py-0.5 text-[10px] font-semibold text-sidebar-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4 text-sidebar-primary" />
            <span className="flex-1 text-left">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <BrandLogo />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              {consoleLabel && <p className="text-xs text-muted-foreground">{consoleLabel}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline">
              Switch account
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {profile.initials}
              </span>
              <span className="text-xs">
                <span className="block font-medium text-foreground">{profile.name}</span>
                <span className="block text-muted-foreground">{profile.meta}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="border-b border-border bg-background px-4 py-2 md:hidden sm:px-6">
          <div className="mb-2">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {consoleLabel && <p className="text-xs text-muted-foreground">{consoleLabel}</p>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to as string));

              return (
                <Link
                  key={`mobile-${item.to as string}`}
                  to={item.to}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
