import { Link } from "@tanstack/react-router";

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      K
    </span>
  );
}

export function BrandLogo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="text-2xl font-black bg-gradient-to-r from-blue-500 to-sky-300 bg-clip-text text-transparent">
        ZYNO
      </span>
      <span className="flex flex-col leading-none ml-1">
        <span className="text-xs font-semibold text-foreground">Property Management</span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
          Real Estate
        </span>
      </span>
    </Link>
  );
}
