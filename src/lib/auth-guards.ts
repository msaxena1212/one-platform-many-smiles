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

export async function getCurrentProfile() {
  const { data: authData } = await supabase.auth.getSession();
  const session = authData.session;
  const demoSession = getDemoSession();

  if (!session?.user && demoSession) {
    return {
      ...demoSession,
      full_name: demoSession.full_name,
      tenantContextId: demoSession.tenant_id ?? demoSession.tenant_key ?? null,
    } as CurrentProfile;
  }

  if (!session?.user) {
    throw redirect({ to: "/auth" });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if ((error || !profile?.role) && demoSession) {
    return {
      ...demoSession,
      full_name: demoSession.full_name,
      tenantContextId: demoSession.tenant_id ?? demoSession.tenant_key ?? null,
    } as CurrentProfile;
  }

  if (error || !profile?.role) {
    throw redirect({ to: "/auth" });
  }

  const currentProfile = profile as CurrentProfile;
  currentProfile.tenantContextId = resolveTenantContextId(currentProfile, session.user);
  return currentProfile;
}

export async function requireConsoleAccess(consoleKey: ConsoleKey) {
  const profile = await getCurrentProfile();
  const allowed = await canAccessConsole(consoleKey, profile.role, profile.tenantContextId ?? null);

  if (!allowed) {
    const fallbackRoute = getLandingRouteForRole(profile.role);
    const currentConsoleRoute = `/${consoleKey}`;

    if (fallbackRoute === currentConsoleRoute) {
      throw redirect({ to: "/auth" });
    }

    throw redirect({ to: fallbackRoute });
  }

  return profile;
}
