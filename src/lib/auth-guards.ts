import { redirect } from "@tanstack/react-router";
import type { ConsoleKey } from "@/lib/console-config";
import { getLandingRouteForRole } from "@/lib/console-config";
import { getDemoSession } from "@/lib/demo-auth";
import { canAccessConsole } from "@/lib/rbac";
import type { AppRole } from "@/lib/rbac";
import { supabase } from "@/lib/supabase";
import { resolveTenantContextId } from "@/lib/tenant-context";

type CurrentProfile = {
  id: string;
  role: AppRole;
  full_name?: string | null;
  tenant_id?: string | null;
  tenant_key?: string | null;
  tenantContextId?: string | null;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  // 1. Demo session takes priority — synchronous localStorage read, 0 network latency
  const demoSession = getDemoSession();
  if (demoSession) {
    return {
      ...demoSession,
      full_name: demoSession.full_name,
      tenantContextId: demoSession.tenant_id ?? demoSession.tenant_key ?? null,
    } as CurrentProfile;
  }

  // During SSR (server-side rendering), window and localStorage are not available.
  // Return null without throwing redirect to avoid kicking user to /auth on page refresh.
  if (typeof window === "undefined") {
    return null;
  }

  // 2. Real Supabase session — wrap in try/catch so network errors don't crash
  try {
    const { data: authData } = await supabase.auth.getSession();
    const session = authData.session;

    if (!session?.user) {
      throw redirect({ to: "/auth" });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || !profile?.role) {
      throw redirect({ to: "/auth" });
    }

    const currentProfile = profile as CurrentProfile;
    currentProfile.tenantContextId = resolveTenantContextId(currentProfile, session.user);
    return currentProfile;
  } catch (err: any) {
    // If it's a TanStack redirect, rethrow it
    if (err && (err instanceof Response || err.isRedirect || err.to || err.statusCode)) {
      throw err;
    }
    // Network/unexpected error — redirect to auth
    throw redirect({ to: "/auth" });
  }
}

/** Checks role access with static fast-path to prevent UI lag */
async function checkAccessWithTimeout(
  consoleKey: ConsoleKey,
  role: AppRole,
  tenantId: string | null,
  timeoutMs = 800
): Promise<boolean> {
  // 1. Instant check for known role/console bindings
  const ownLanding = String(getLandingRouteForRole(role));
  const consolePrefix = `/${consoleKey}`;
  if (
    ownLanding === consolePrefix ||
    ownLanding.startsWith(`${consolePrefix}/`) ||
    ownLanding.startsWith(consolePrefix)
  ) {
    return true;
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(true), timeoutMs);
    canAccessConsole(consoleKey, role, tenantId)
      .then((result) => { clearTimeout(timer); resolve(result); })
      .catch(() => { clearTimeout(timer); resolve(true); });
  });
}

export async function requireConsoleAccess(consoleKey: ConsoleKey) {
  // Skip auth redirect during SSR on server so client-side hydration can inspect session
  if (typeof window === "undefined") {
    return null;
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    throw redirect({ to: "/auth" });
  }

  // Fast check: if this role is directly authorized for this console
  let allowed = await checkAccessWithTimeout(
    consoleKey,
    profile.role,
    profile.tenantContextId ?? null
  );

  if (!allowed) {
    const ownLanding = String(getLandingRouteForRole(profile.role));
    const consolePrefix = `/${consoleKey}`;
    if (ownLanding === "/auth" || ownLanding.startsWith(consolePrefix)) {
      return profile;
    }
    throw redirect({ to: ownLanding as any });
  }

  return profile;
}

