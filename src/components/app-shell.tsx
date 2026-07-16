import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { BrandLogo } from "./brand";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: LinkProps["to"];
  label: string;
  icon: ReactNode;
  badge?: string | number;
}

export function AppShell({
  variant,
  title,
  nav,
  children,
}: {
  variant: "portal" | "admin" | "host";
  title: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">K</span>
            <span className="flex flex-col leading-none">
              <span className="text-sm text-sidebar-foreground">ZYNO Property Management</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
                {variant === "admin" ? "Staff Console" : variant === "host" ? "Host Console" : "Customer Portal"}
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
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <BrandLogo />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline"
            >
              ← Back to public site
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {variant === "admin" ? "AD" : variant === "host" ? "HO" : "KM"}
              </span>
              <span className="text-xs">
                <span className="block font-medium text-foreground">
                  {variant === "admin" ? "Ahmad (Admin)" : variant === "host" ? "Host User" : "Khalid Al-Mutairi"}
                </span>
                <span className="block text-muted-foreground">
                  {variant === "admin" ? "Finance Officer" : variant === "host" ? "Property Owner" : "Tenant · A-1201"}
                </span>
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:hidden mb-4">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

