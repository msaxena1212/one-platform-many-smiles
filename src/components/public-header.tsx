import { Link, useNavigate } from "@tanstack/react-router";
import { BrandLogo } from "./brand";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { toast } from "sonner";

export function PublicHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role: string; full_name: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        supabase.from("profiles").select("role, full_name").eq("id", data.user.id).single()
          .then(({ data: p }) => setProfile(p));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from("profiles").select("role, full_name").eq("id", session.user.id).single()
          .then(({ data: p }) => setProfile(p));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  const dashboardRoute = profile?.role === "HOST" ? "/host" : "/guest";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/properties" className="hover:text-foreground transition-colors">Properties</Link>
          <Link to="/book-visit" className="hover:text-foreground transition-colors">Book a visit</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>

        {/* Desktop Auth CTA */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground max-w-[120px] truncate">
                  {profile?.full_name || user.email}
                </span>
                {profile?.role && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{profile.role}</span>
                )}
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to={dashboardRoute}>Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/host">Host Portal</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-2">
          {[["Properties", "/properties"], ["Book a visit", "/book-visit"], ["About", "/about"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link key={href} to={href} className="block py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex gap-2">
            {user ? (
              <>
                <Button asChild variant="outline" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Link to={dashboardRoute}>Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <Button asChild size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setMobileOpen(false)}>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Kinan International Real Estate Development Co. — Building places people are proud to live and work in.
          </p>
        </div>
        <FooterCol title="Explore" links={[["Properties", "/properties"], ["Book a visit", "/book-visit"], ["Community", "/about"]]} />
        <FooterCol title="Customers" links={[["Portal", "/portal"], ["Pay rent", "/portal/payments"], ["Report an issue", "/portal/tickets"]]} />
        <FooterCol title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Staff console", "/admin"]]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Kinan International Real Estate Development Co. All rights reserved.</p>
          <p>Riyadh · Jeddah · Dammam · Madinah</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link to={href} className="hover:text-foreground transition-colors">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
