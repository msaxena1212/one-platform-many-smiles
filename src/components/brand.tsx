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
    <Link to={to} className="flex items-center gap-2.5 font-semibold tracking-tight">
      <BrandMark />
      <span className="flex flex-col leading-none">
        <span className="text-base text-foreground">Kinan</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Real Estate
        </span>
      </span>
    </Link>
  );
}
