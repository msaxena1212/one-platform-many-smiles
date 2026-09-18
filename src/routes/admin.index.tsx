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
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [expiringLeases, setExpiringLeases] = useState<any[]>([]);
  const [propertyOccupancies, setPropertyOccupancies] = useState<Record<string, { total: number; occupied: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          props, 
          unitsRes,
          leasesRes,
          { data: ticketsData, count: ticketCount },
          { data: paymentsData },
          { data: expiringData }
        ] = await Promise.all([
          fetchAllProperties().catch(() => []),
          supabase.from("units").select("id, unit_ref, unit_name, status, lease_status, current_tenant, contract_no, contract_start_date, contract_end_date, current_rent, price, property_id"),
          supabase.from("leases").select("*, properties(title), units(unit_number), customers:customer_id(full_name)"),
          supabase.from("maintenance_tickets").select("*", { count: "exact" }).in("status", ["OPEN", "IN_PROGRESS", "ASSIGNED", "new", "assigned", "in_progress"]).order("created_at", { ascending: false }).limit(5),
          supabase.from("payments").select("amount, paid_at, created_at").limit(100),
          supabase.from("leases").select("*, properties(title)").in("lease_status", ["ACTIVE", "active"]).order("end_date", { ascending: true }).limit(5),
        ]);

        const allUnits = unitsRes.data || [];
        const allLeases = leasesRes.data || [];

        // Count total and occupied units
        const unitCount = allUnits.length;
        const occupiedUnits = allUnits.filter(
          (u: any) =>
            u.status?.toLowerCase() === "occupied" ||
            (u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available") ||
            (u.current_tenant && u.current_tenant.trim().length > 0)
        );
        const leaseCount = Math.max(
          occupiedUnits.length,
          allLeases.filter((l: any) => (l.lease_status || "").toUpperCase() === "ACTIVE").length
        );

        // Calculate property-wise occupancy
        const propOccMap: Record<string, { total: number; occupied: number }> = {};
        props.forEach((prop) => {
          const pUnits = allUnits.filter((u: any) => {
            if (u.property_id === prop.id) return true;
            const uProp = (u.property_id || "").trim().toLowerCase();
            const pId = (prop.id || "").trim().toLowerCase();
            const pCode = (prop.property_code || "").trim().toLowerCase();
            const pTitle = (prop.title || "").trim().toLowerCase();
            return uProp === pId || (pCode && uProp === pCode) || (pTitle && uProp === pTitle);
          });
          const pOcc = pUnits.filter(
            (u: any) =>
              u.status?.toLowerCase() === "occupied" ||
              (u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available") ||
              (u.current_tenant && u.current_tenant.trim().length > 0)
          ).length;
          propOccMap[prop.id] = { total: pUnits.length, occupied: pOcc };
        });
        setPropertyOccupancies(propOccMap);

        // Aggregate upcoming lease expirations (from both leases table and units with contract_end_date)
        const combinedExpirations: any[] = [];
        const seenKeys = new Set<string>();

        (expiringData || []).forEach((l: any) => {
          const key = `${l.tenant_name || ""}-${l.end_date || ""}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            combinedExpirations.push({
              id: l.id || l.lease_number,
              tenant_name: l.tenant_name || l.customers?.full_name || "Active Tenant",
              end_date: l.end_date || l.expiry_date || "2026-12-31",
              rent_amount: l.rent_amount || l.rental_amount || l.monthly_rent || 6500,
            });
          }
        });

        // Add occupied units with contract_end_date
        const todayStr = new Date().toISOString().split("T")[0];
        const unitsWithExpiry = occupiedUnits
          .filter((u: any) => u.contract_end_date)
          .sort((a: any, b: any) => (a.contract_end_date > b.contract_end_date ? 1 : -1));

        unitsWithExpiry.forEach((u: any) => {
          const key = `${u.current_tenant}-${u.contract_end_date}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            combinedExpirations.push({
              id: u.id || u.unit_ref,
              tenant_name: u.current_tenant ? `${u.current_tenant} (${u.unit_ref || u.unit_name})` : (u.unit_ref || "Unit Tenant"),
              end_date: u.contract_end_date,
              rent_amount: u.current_rent || u.price || 6500,
            });
          }
        });

        // Calculate MTD collections
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        let mtdTotal = 0;
        if (paymentsData && paymentsData.length > 0) {
          mtdTotal = paymentsData.reduce((sum, p) => {
            const pTime = new Date(p.paid_at || p.created_at).getTime();
            return pTime >= startOfMonth ? sum + Number(p.amount || 0) : sum;
          }, 0);
        }

        setProperties(props);
        setRecentTickets(ticketsData || []);
        setExpiringLeases(combinedExpirations.slice(0, 5));
        setStats({
          unitsCount: unitCount || 0,
          activeLeases: leaseCount || 0,
          openTickets: ticketCount || 0,
          collected: mtdTotal,
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
                {properties.slice(0, 5).map(p => {
                  const occ = propertyOccupancies[p.id] || { total: 0, occupied: 0 };
                  const occPercent = occ.total > 0 ? Math.round((occ.occupied / occ.total) * 100) : (p.is_active ? 100 : 0);
                  return (
                    <div key={p.id} className="grid grid-cols-12 items-center gap-3">
                      <div className="col-span-5 min-w-0">
                        <p className="truncate font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.city} · {occ.total > 0 ? `${occ.occupied}/${occ.total} Occupied` : (p.property_type || "Residential")}</p>
                      </div>
                      <div className="col-span-5">
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${occPercent}%` }} />
                        </div>
                      </div>
                      <p className="col-span-2 text-right text-sm font-medium">{occ.total > 0 ? `${occPercent}%` : (p.is_active ? "Active" : "Unlisted")}</p>
                    </div>
                  );
                })}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Active Service Tickets</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/maintenance">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            {recentTickets.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">
                <Wrench className="mx-auto h-8 w-8 mb-2 opacity-30" />
                No open maintenance tickets in queue.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">{t.title || t.subject || "Maintenance Request"}</p>
                      <p className="text-[11px] text-muted-foreground">{t.category || "General"} &bull; Unit: {t.unit_ref || "Main"}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 border border-amber-500/20">
                      {t.status || "OPEN"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Upcoming Lease Expirations</h3>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/leases">All leases <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            {expiringLeases.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">
                <FileSignature className="mx-auto h-8 w-8 mb-2 opacity-30" />
                No leases pending renewal or review.
              </div>
            ) : (
              <div className="space-y-2.5">
                {expiringLeases.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">{l.tenant_name || "Tenant Contract"}</p>
                      <p className="text-[11px] text-muted-foreground">Expires: {l.end_date || "Within 90 Days"}</p>
                    </div>
                    <span className="font-mono font-bold text-primary text-xs">
                      QAR {Number(l.rent_amount || l.monthly_rent || 6500).toLocaleString()}/mo
                    </span>
                  </div>
                ))}
              </div>
            )}
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
