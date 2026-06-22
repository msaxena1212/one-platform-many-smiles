import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "destructive";
}) {
  const toneClass = {
    default: "text-muted-foreground",
    success: "text-[oklch(0.55_0.13_155)]",
    warning: "text-[oklch(0.65_0.15_75)]",
    destructive: "text-destructive",
  }[tone];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {(delta || hint) && (
              <p className={cn("mt-1 text-xs", toneClass)}>
                {delta && <span className="font-medium">{delta}</span>}
                {delta && hint && <span> · </span>}
                {hint}
              </p>
            )}
          </div>
          {icon && (
            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
