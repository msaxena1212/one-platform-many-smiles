import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentProfile } from "@/lib/auth-guards";
import { getLandingRouteForRole } from "@/lib/console-config";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const profile = await getCurrentProfile();
      if (profile?.role) {
        const landing = getLandingRouteForRole(profile.role);
        throw redirect({ to: landing as any });
      }
    } catch (err: any) {
      if (err && (err instanceof Response || err.isRedirect || err.to || err.statusCode)) throw err;
    }
    throw redirect({ to: "/auth" });
  },
  component: () => null,
});

