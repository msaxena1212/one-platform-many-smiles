import { Suspense, type ReactNode } from "react";

/**
 * ModuleSuspense
 * ──────────────
 * Wraps any lazily-loaded route component with a full-page skeleton shimmer.
 * Import this in every route that uses React.lazy() so the user sees a
 * smooth loading state instead of a blank screen.
 */
function ModuleSkeletonFallback() {
  return (
    <div className="flex flex-col gap-4 p-6 w-full animate-pulse">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-muted" />
          <div className="h-9 w-24 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-2 border-b pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 rounded-md bg-muted" />
        ))}
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-8 w-1/2 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-5 w-36 rounded bg-muted" />
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 w-4 rounded bg-muted shrink-0" />
              <div className="h-4 flex-1 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ModuleSuspenseProps {
  children: ReactNode;
}

export function ModuleSuspense({ children }: ModuleSuspenseProps) {
  return <Suspense fallback={<ModuleSkeletonFallback />}>{children}</Suspense>;
}
