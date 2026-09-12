import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Wallet, Wrench, FileSignature, ArrowRight, TrendingUp, Loader2, Home } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSAR } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { supabase, fetchAllProperties, type Property } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — ZYNO Property Management Staff" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState({
    unitsCount: 0,
    activeLeases: 0,
    openTickets: 0,
    collected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [props, { count: unitCount }, { count: leaseCount }] = await Promise.all([
          fetchAllProperties().catch(() => []),
          supabase.from("units").select("*", { count: "exact", head: true }),
          supabase.from("leases").select("*", { count: "exact", head: true }).eq("lease_status", "ACTIVE"),
        ]);
        setProperties(props);
        setStats({
          unitsCount: unitCount || 0,
          activeLeases: leaseCount || 0,
          openTickets: 0,
          collected: 0,
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalUnits = stats.unitsCount;
  const activeLeases = stats.activeLeases;
  const occupancyRate = totalUnits > 0 ? Math.round((activeLeases / totalUnits) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Portfolio"
          value={loading ? "Loading..." : `${properties.length} properties`}
          hint={`${totalUnits} units total`}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          label="Occupancy"
          value={loading ? "..." : `${occupancyRate}%`}
          tone={occupancyRate > 0 ? "success" : "default"}
          delta={occupancyRate > 0 ? "▲ Live" : "0 active"}
          hint="Active leases / Units"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Collected (MTD)"
          value={loading ? "..." : formatSAR(stats.collected)}
          tone="default"
          delta="QAR"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Open tickets"
          value={loading ? "..." : String(stats.openTickets)}
          tone="default"
          hint="0 pending resolution"
          icon={<Wrench className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Portfolio at a glance</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/properties">All properties <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Loading portfolio...
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No properties registered yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {properties.slice(0, 5).map(p => (
                  <div key={p.id} className="grid grid-cols-12 items-center gap-3">
                    <div className="col-span-5 min-w-0">
                      <p className="truncate font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.city} · {p.property_type || "Commercial/Res"}</p>
                    </div>
                    <div className="col-span-5">
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: p.is_active ? "100%" : "0%" }} />
                      </div>
                    </div>
                    <p className="col-span-2 text-right text-sm font-medium">{p.is_active ? "Active" : "Unlisted"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Approvals queue</h3>
            <div className="mt-4 text-center py-6 text-muted-foreground text-xs">
              <FileSignature className="mx-auto h-8 w-8 mb-2 opacity-30" />
              All approval queues are clear.
            </div>
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link to="/admin/leases">Open Lease Registry</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Recent Tickets</h3>
            <div className="mt-4 text-center py-6 text-muted-foreground text-xs">
              <Wrench className="mx-auto h-8 w-8 mb-2 opacity-30" />
              No open maintenance tickets.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Leases Needing Attention</h3>
            <p className="mt-1 text-xs text-muted-foreground">0 expiring contracts</p>
            <div className="mt-4 text-center py-6 text-muted-foreground text-xs">
              No leases pending renewal or review.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Approval({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">{icon}</span>
        <div className="min-w-0">
          <p className="truncate font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">Approve</button>
        <button className="rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground hover:bg-secondary/80">Reject</button>
      </div>
    </li>
  );
}
