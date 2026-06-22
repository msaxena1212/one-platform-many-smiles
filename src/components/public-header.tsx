import { Link } from "@tanstack/react-router";
import { BrandLogo } from "./brand";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/properties" className="hover:text-foreground transition-colors">Properties</Link>
          <Link to="/book-visit" className="hover:text-foreground transition-colors">Book a visit</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/portal">Customer Portal</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin">Staff Console</Link>
          </Button>
        </div>
      </div>
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
