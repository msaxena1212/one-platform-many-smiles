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

import { getImpersonationSession } from "@/lib/impersonation";

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  // During SSR (server-side rendering), window is not available
  if (typeof window === "undefined") {
    return null;
  }

  // 0. High-Priority: Super Admin Support Impersonation Session
  const imp = getImpersonationSession();
  if (imp && imp.isImpersonating) {
    return {
      id: "impersonated-admin-session",
      role: "PROP_MGR",
      full_name: `${imp.adminName} (Impersonated by Super Admin)`,
      tenant_id: imp.tenantId,
      tenant_key: imp.tenantKey,
      tenantContextId: imp.tenantId,
    };
  }

  // 1. Secondary/Testing: Active Demo Session in localStorage
  const demoSession = getDemoSession();
  if (demoSession) {
    return {
      ...demoSession,
      full_name: demoSession.full_name,
      tenantContextId: demoSession.tenant_id ?? demoSession.tenant_key ?? null,
    } as CurrentProfile;
  }

  // 2. Primary: Real Supabase Auth Session
  try {
    const { data: authData } = await supabase.auth.getSession();
    const session = authData?.session;

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role) {
        const currentProfile = profile as CurrentProfile;
        currentProfile.tenantContextId = resolveTenantContextId(currentProfile, session.user);
        return currentProfile;
      }

      // If user exists in auth but no profile row yet, construct fallback from metadata
      const userMeta = session.user.user_metadata || {};
      const userRole = (userMeta.role as AppRole) || "GUEST";
      return {
        id: session.user.id,
        role: userRole,
        full_name: userMeta.full_name || session.user.email?.split("@")[0] || "User",
        tenantContextId: userMeta.tenant_id || null,
      };
    }
  } catch (err: any) {
    if (err && (err instanceof Response || err.isRedirect || err.to || err.statusCode)) {
      throw err;
    }
  }

  throw redirect({ to: "/auth" });
}

/** Checks role access with static fast-path to prevent UI lag */
async function checkAccessWithTimeout(
  consoleKey: ConsoleKey,
  role: AppRole,
  tenantId: string | null,
  timeoutMs = 800
): Promise<boolean> {
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
  if (typeof window === "undefined") {
    return null;
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    throw redirect({ to: "/auth" });
  }

  const tenantId = profile.tenantContextId ?? null;
  const isAllowed = await checkAccessWithTimeout(consoleKey, profile.role, tenantId);

  if (!isAllowed) {
    const fallbackLanding = getLandingRouteForRole(profile.role);
    throw redirect({ to: fallbackLanding as any });
  }

  return profile;
}
