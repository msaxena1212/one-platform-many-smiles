import { Link, useNavigate, useRouterState, type LinkProps } from "@tanstack/react-router";
import { LogOut, ChevronRight } from "lucide-react";

import { type ReactNode, useState, useEffect } from "react";

import { clearDemoSession } from "@/lib/demo-auth";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  to: LinkProps["to"];
  search?: Record<string, any>;
  label: string;        // Sub-sub-module name (Layer 3)
  icon: ReactNode;
  badge?: string | number;
  /** @deprecated use NavModule instead */
  indent?: boolean;
}

export interface NavSubGroup {
  group: string;        // Sub-module name (Layer 2)
  icon: ReactNode;
  color?: string;
  bg?: string;
  items: NavItem[];     // Sub-sub-module items (Layer 3)
}

export interface NavModule {
  module: string;       // Key Module name (Layer 1)
  icon: ReactNode;
  color: string;
  bg: string;
  activeBg: string;
  groups: NavSubGroup[];
}

/** @deprecated — use NavModule for 3-layer nav */
export interface NavGroup {
  group: string;
  icon: ReactNode;
  color: string;
  bg: string;
  activeBg: string;
  items: NavItem[];
}

// ─── Sidebar colours ──────────────────────────────────────────────────────────
const SIDEBAR_BG       = "bg-[#161b22]";         // deepest panel bg
const SIDEBAR_HEADER   = "bg-[#1c2128]";          // header strip
const SIDEBAR_ITEM_ACT = "bg-[#1f6feb22]";        // active-item ghost
const ACCENT           = "text-teal-400";          // highlight text
const ACCENT_BORDER    = "border-l-2 border-teal-400";
const DIVIDER          = "border-[#30363d]";

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({
  variant,
  title,
  consoleLabel,
  nav,
  navGroups,
  navModules,
  children,
  user,
}: {
  variant: "portal" | "admin" | "host";
  title: string;
  consoleLabel?: string;
  /** Legacy flat nav */
  nav?: NavItem[];
  /** @deprecated 2-layer nav */
  navGroups?: NavGroup[];
  /** 3-layer nav: Module → Sub-module → Items */
  navModules?: NavModule[];
  children: ReactNode;
  user?: {
    initials: string;
    name: string;
    meta: string;
  };
}) {
  const pathname  = useRouterState({ select: (s) => s.location.pathname });
  const searchParams = useRouterState({ select: (s) => s.location.search }) as Record<string, any>;
  const navigate  = useNavigate();

  const profile = user ?? {
    initials: variant === "admin" ? "AD" : variant === "host" ? "PM" : "TP",
    name:     variant === "admin" ? "Admin User" : variant === "host" ? "Property Manager" : "Tenant User",
    meta:     consoleLabel ?? (variant === "admin" ? "Staff Console" : variant === "host" ? "Host Console" : "Tenant Portal"),
  };

  async function handleSignOut() {
    clearDemoSession();
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  // ── Active-state helpers ────────────────────────────────────────────────────
  function isItemActive(item: NavItem): boolean {
    const pathOk = item.to !== "/" && (pathname === item.to || pathname.startsWith(item.to as string));
    if (item.search?.tab) return pathOk && searchParams?.tab === item.search.tab;
    return pathOk;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 3-Layer nav (navModules) – single-column accordion
  // ════════════════════════════════════════════════════════════════════════════
  if (navModules) {
    return (
      <div className="flex h-screen overflow-hidden">
        <NavModulesSidebar
          navModules={navModules}
          consoleLabel={consoleLabel}
          profile={profile}
          isItemActive={isItemActive}
          pathname={pathname}
          searchParams={searchParams}
          onSignOut={handleSignOut}
        />
        {/* ── Main content ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
          {/* Top bar */}
          <header className="h-12 border-b flex items-center px-6 shrink-0 bg-background/95 backdrop-blur-sm gap-3">
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Legacy 2-layer nav (navGroups)
  // ════════════════════════════════════════════════════════════════════════════
  if (navGroups) {
    return (
      <LegacyNavGroupsLayout
        navGroups={navGroups}
        consoleLabel={consoleLabel}
        profile={profile}
        title={title}
        isItemActive={isItemActive}
        onSignOut={handleSignOut}
      >
        {children}
      </LegacyNavGroupsLayout>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Flat nav
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen overflow-hidden">
      <nav className={cn("hidden md:flex w-56 shrink-0 flex-col border-r h-screen overflow-hidden", DIVIDER, SIDEBAR_BG)}>
        <div className={cn("flex items-center gap-3 px-5 py-4 border-b", DIVIDER, SIDEBAR_HEADER)}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-500 text-white font-bold text-xs shrink-0">Z</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">ZYNO PMS</p>
            <p className="text-[10px] text-white/40 truncate">{consoleLabel}</p>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="py-3 px-3 space-y-0.5">
            {nav?.map((item) => (
              <Link key={item.to as string} to={item.to} search={item.search as any} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-colors",
                isItemActive(item) ? cn("text-teal-400", SIDEBAR_ITEM_ACT) : "text-white/60 hover:text-white hover:bg-white/5"
              )}>
                <span className="h-3.5 w-3.5 shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </ScrollArea>
        <div className={cn("border-t p-3", DIVIDER)}>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </nav>
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        <header className="h-12 border-b flex items-center px-6 shrink-0 bg-background/95 backdrop-blur-sm">
          <h1 className="text-sm font-semibold truncate">{title}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

// ─── 3-layer sidebar component ───────────────────────────────────────────────

function NavModulesSidebar({
  navModules,
  consoleLabel,
  profile,
  isItemActive,
  pathname,
  searchParams,
  onSignOut,
}: {
  navModules: NavModule[];
  consoleLabel?: string;
  profile: { initials: string; name: string; meta: string };
  isItemActive: (item: NavItem) => boolean;
  pathname: string;
  searchParams: Record<string, any>;
  onSignOut: () => void;
}) {
  // ── Detect active state: pick ONLY the single most-specific matching item ──
  // This prevents "/prop-mgr" (Dashboard) from also matching when on "/prop-mgr/leases"
  function detectExpanded() {
    let bestScore = -1;
    let bestMi = -1;
    let bestGi = -1;

    for (let mi = 0; mi < navModules.length; mi++) {
      for (let gi = 0; gi < navModules[mi].groups.length; gi++) {
        for (const item of navModules[mi].groups[gi].items) {
          if (!isItemActive(item)) continue;
          // Score = path length + big bonus for tab-param match (most specific wins)
          const score = (item.to as string).length + (item.search?.tab ? 1000 : 0);
          if (score > bestScore) {
            bestScore = score;
            bestMi = mi;
            bestGi = gi;
          }
        }
      }
    }

    const openMods = new Set<number>();
    const openGrps: Record<number, Set<number>> = {};
    if (bestMi !== -1) {
      openMods.add(bestMi);
      openGrps[bestMi] = new Set([bestGi]);
    }
    return { openMods, openGrps };
  }

  const initial = detectExpanded();
  const [openMods, setOpenMods] = useState<Set<number>>(initial.openMods);
  const [openGrps, setOpenGrps] = useState<Record<number, Set<number>>>(initial.openGrps);

  // Keep expanded state in sync with URL (e.g. direct navigation)
  useEffect(() => {
    const { openMods: om, openGrps: og } = detectExpanded();
    // Replace entirely — use the URL as ground truth
    setOpenMods(om);
    setOpenGrps(og);
  }, [pathname, searchParams]);

  // ── Exclusive accordion toggles ─────────────────────────────────────────

  function toggleModule(mi: number) {
    const isAlreadyOpen = openMods.has(mi);
    if (isAlreadyOpen) {
      // Collapse this module
      setOpenMods(new Set());
    } else {
      // Open this module ONLY, collapse all others
      setOpenMods(new Set([mi]));
      // Auto-expand first sub-group if none previously open
      setOpenGrps((prev) => ({
        ...prev,
        [mi]: prev[mi]?.size ? prev[mi] : new Set([0]),
      }));
    }
  }

  function toggleGroup(mi: number, gi: number) {
    setOpenGrps((prev) => {
      const isAlreadyOpen = prev[mi]?.has(gi);
      // Exclusive: only one sub-group open at a time per module
      return { ...prev, [mi]: isAlreadyOpen ? new Set() : new Set([gi]) };
    });
  }

  return (
    <nav className={cn("hidden md:flex w-60 shrink-0 flex-col border-r", DIVIDER, SIDEBAR_BG, "overflow-hidden")}>

      {/* ── Header: logo + console name ──────────────────────────────────── */}
      <div className={cn("flex items-center gap-3 px-5 py-4 border-b shrink-0", DIVIDER, SIDEBAR_HEADER)}>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-500 text-white font-bold text-xs shrink-0">
          Z
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">ZYNO PMS</p>
          <p className="text-[10px] text-white/40 truncate">{consoleLabel}</p>
        </div>
      </div>

      {/* ── 3-level tree accordion ───────────────────────────────────────── */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {navModules.map((mod, mi) => {
            const isModOpen = openMods.has(mi);
            const modHasActive = mod.groups.some((g) => g.items.some(isItemActive));

            return (
              <div key={mod.module}>
                {/* ── L1: Key Module ─────────────────────────────────── */}
                <button
                  onClick={() => toggleModule(mi)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors",
                    modHasActive
                      ? cn(ACCENT, "font-semibold")
                      : isModOpen
                        ? "text-white/80"
                        : "text-white/55 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "shrink-0 h-4 w-4",
                    modHasActive ? ACCENT : isModOpen ? "text-white/60" : "text-white/35"
                  )}>
                    {mod.icon}
                  </span>
                  <span className="flex-1 truncate">{mod.module}</span>
                  <ChevronRight className={cn(
                    "h-3 w-3 shrink-0 transition-transform",
                    modHasActive ? "text-teal-400/60" : "text-white/25",
                    isModOpen && "rotate-90"
                  )} />
                </button>

                {/* ── L2 + L3: Sub-modules and Items (cascading) ─────── */}
                {isModOpen && (
                  <div className="ml-2 relative">
                    {/* L1 → L2 connector line */}
                    <div className="absolute left-3 top-0 bottom-2 w-px bg-white/8" />

                    {mod.groups.map((grp, gi) => {
                      const isGrpOpen = openGrps[mi]?.has(gi) ?? false;
                      const grpHasActive = grp.items.some(isItemActive);

                      return (
                        <div key={grp.group}>
                          {/* ── L2: Sub-module ─────────────────────── */}
                          <button
                            onClick={() => toggleGroup(mi, gi)}
                            className={cn(
                              "w-full flex items-center gap-2 pl-6 pr-4 py-2 text-left text-[11px] transition-colors",
                              grpHasActive
                                ? "text-white font-semibold"
                                : "text-white/50 hover:text-white/85 hover:bg-white/4"
                            )}
                          >
                            <span className={cn(
                              "shrink-0 h-3 w-3",
                              grpHasActive ? ACCENT : "text-white/30"
                            )}>
                              {grp.icon}
                            </span>
                            <span className="flex-1 truncate">{grp.group}</span>
                            <ChevronRight className={cn(
                              "h-2.5 w-2.5 shrink-0 transition-transform",
                              grpHasActive ? "text-teal-400/50" : "text-white/20",
                              isGrpOpen && "rotate-90"
                            )} />
                          </button>

                          {/* ── L3: Items ──────────────────────────── */}
                          {isGrpOpen && (
                            <div className="ml-3 relative">
                              {/* L2 → L3 teal connector */}
                              <div className="absolute left-3 top-0 bottom-1 w-px bg-teal-500/25" />
                              {grp.items.map((item) => {
                                const active = isItemActive(item);
                                return (
                                  <Link
                                    key={`${item.to as string}${item.search?.tab ?? ""}`}
                                    to={item.to}
                                    search={item.search as any}
                                    className={cn(
                                      "relative flex items-center gap-2 pl-7 pr-3 py-1.5 text-[10.5px] transition-colors",
                                      active
                                        ? cn("text-teal-400 font-semibold", SIDEBAR_ITEM_ACT)
                                        : "text-white/40 hover:text-white/80 hover:bg-white/4"
                                    )}
                                  >
                                    {active && (
                                      <span className="absolute left-2.5 h-1.5 w-1.5 rounded-full bg-teal-400" />
                                    )}
                                    <span className={cn("h-2.5 w-2.5 shrink-0", active ? "text-teal-400" : "text-white/25")}>
                                      {item.icon}
                                    </span>
                                    <span className="truncate">{item.label}</span>
                                    {item.badge && (
                                      <span className="ml-auto text-[8px] font-bold bg-teal-500 text-white rounded-full px-1 py-0.5 shrink-0">
                                        {item.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* ── Bottom: Settings + User profile ──────────────────────────────── */}
      <div className={cn("border-t shrink-0", DIVIDER)}>
        <div className="px-3 pt-2 pb-1">
          <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/25">Settings</p>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-2 py-2 rounded-md text-[11px] text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
        <div className={cn("flex items-center gap-3 px-4 py-3 border-t", DIVIDER, SIDEBAR_HEADER)}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-[11px] font-bold shrink-0">
            {profile.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-white truncate">{profile.name}</p>
            <p className="text-[9px] text-white/40 truncate">{profile.meta}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}


// ─── Legacy 2-layer nav (navGroups) ──────────────────────────────────────────

function LegacyNavGroupsLayout({
  navGroups,
  consoleLabel,
  profile,
  title,
  isItemActive,
  onSignOut,
  children,
}: {
  navGroups: NavGroup[];
  consoleLabel?: string;
  profile: { initials: string; name: string; meta: string };
  title: string;
  isItemActive: (item: NavItem) => boolean;
  onSignOut: () => void;
  children?: React.ReactNode;
}) {
  function findActiveGroup(): number {
    const idx = navGroups.findIndex((g) => g.items.some(isItemActive));
    return idx >= 0 ? idx : 0;
  }
  const [openGroups, setOpenGroups] = useState<Set<number>>(() => {
    const s = new Set<number>();
    s.add(findActiveGroup());
    return s;
  });

  function toggle(gi: number) {
    setOpenGroups((prev) => {
      const n = new Set(prev);
      if (n.has(gi)) n.delete(gi); else n.add(gi);
      return n;
    });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <nav className={cn("hidden md:flex w-60 shrink-0 flex-col border-r h-screen overflow-hidden", DIVIDER, SIDEBAR_BG)}>
        {/* Logo */}
        <div className={cn("flex items-center gap-3 px-5 py-4 border-b shrink-0", DIVIDER, SIDEBAR_HEADER)}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-500 text-white font-bold text-xs shrink-0">Z</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">ZYNO PMS</p>
            <p className="text-[10px] text-white/40 truncate">{consoleLabel}</p>
          </div>
        </div>

        {/* Groups accordion */}
        <ScrollArea className="flex-1">
          <div className="py-2">
            {navGroups.map((grp, gi) => {
              const isOpen = openGroups.has(gi);
              const hasActive = grp.items.some(isItemActive);
              return (
                <div key={grp.group} className="mb-0.5">
                  <button
                    onClick={() => toggle(gi)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors",
                      hasActive ? "text-white font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className={cn("shrink-0 h-3.5 w-3.5", hasActive ? ACCENT : "text-white/40")}>{grp.icon}</span>
                    <span className="flex-1 truncate">{grp.group}</span>
                    <ChevronRight className={cn("h-3 w-3 shrink-0 transition-transform text-white/30", isOpen && "rotate-90")} />
                  </button>
                  {isOpen && (
                    <div className="ml-4 relative">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-teal-500/30" />
                      {grp.items.map((item) => {
                        const active = isItemActive(item);
                        return (
                          <Link
                            key={`${item.to as string}${item.search?.tab ?? ""}`}
                            to={item.to}
                            search={item.search as any}
                            className={cn(
                              "relative flex items-center gap-2.5 pl-7 pr-4 py-2 text-[11px] transition-colors",
                              active ? cn("text-teal-400 font-semibold", SIDEBAR_ITEM_ACT) : "text-white/50 hover:text-white/90 hover:bg-white/4"
                            )}
                          >
                            {active && <span className="absolute left-2.5 h-2 w-2 rounded-full bg-teal-400 -translate-x-px" />}
                            <span className={cn("h-3 w-3 shrink-0", active ? "text-teal-400" : "text-white/30")}>{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                            {item.badge && <span className="ml-auto text-[9px] font-bold bg-teal-500 text-white rounded-full px-1.5 py-0.5 shrink-0">{item.badge}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Bottom */}
        <div className={cn("border-t shrink-0", DIVIDER)}>
          <div className="px-3 pt-2 pb-1">
            <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/25">Settings</p>
            <button onClick={onSignOut} className="flex items-center gap-2 px-2 py-2 rounded-md text-[11px] text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full">
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
          <div className={cn("flex items-center gap-3 px-4 py-3 border-t", DIVIDER, SIDEBAR_HEADER)}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-[11px] font-bold shrink-0">
              {profile.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-white truncate">{profile.name}</p>
              <p className="text-[9px] text-white/40 truncate">{profile.meta}</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        <header className="h-12 border-b flex items-center px-6 shrink-0 bg-background/95 backdrop-blur-sm">
          <h1 className="text-sm font-semibold truncate">{title}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
