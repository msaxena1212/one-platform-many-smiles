import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { Lease } from "@/lib/supabase";
import { useAppData } from "@/lib/app-data-context";
import { Loader2, Search, Filter, RotateCcw } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export interface LeasesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

export function LeasesModule({ role }: LeasesModuleProps) {
  const { leases: contextLeases } = useAppData();
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Filter States
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async (showLoading = true) => {
    if (showLoading && leases.length === 0) setLoading(true);
    try {
      let dbLeases: any[] = [];
      try {
        const { data, error } = await supabase.from('leases').select('*, properties(title, property_code)').order('created_at', { ascending: false });
        if (!error && data) dbLeases = data;
      } catch (e) {
        console.error(e);
      }

      // Map context leases to match table structure
      const mappedContext = (contextLeases || []).map(cl => ({
        id: cl.id,
        lease_number: cl.id.toUpperCase().startsWith('L') ? cl.id.toUpperCase() : `LES-${cl.id}`,
        properties: { title: cl.property },
        property_name: cl.property,
        unit: cl.unit,
        tenant_name: cl.tenantName,
        commencement_date: cl.startDate,
        expiry_date: cl.endDate,
        rental_amount: cl.monthlyRent ? cl.monthlyRent * 12 : 60000,
        lease_status: cl.status === 'closed' ? 'CLOSED' : (cl.status === 'active' || cl.status === 'fully_signed' || cl.status === 'collection_completed') ? 'ACTIVE' : cl.status === 'renewal_due' ? 'EXPIRING' : 'DRAFT',
      }));

      // Combine both sources
      const allLeases = [...dbLeases];
      for (const mc of mappedContext) {
        if (!allLeases.some(l => l.id === mc.id || l.lease_number === mc.lease_number)) {
          allLeases.push(mc);
        }
      }

      setLeases(allLeases);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load(true);
  }, [load]);

  // Distinct filter options
  const propertyOptions = useMemo(() => {
    const set = new Set<string>();
    leases.forEach(l => {
      const p = (l as any).properties?.title || l.property_name;
      if (p) set.add(p);
    });
    return Array.from(set).sort();
  }, [leases]);

  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    leases.forEach(l => {
      if (l.unit) set.add(l.unit);
    });
    return Array.from(set).sort();
  }, [leases]);

  const customerOptions = useMemo(() => {
    const set = new Set<string>();
    leases.forEach(l => {
      if (l.tenant_name) set.add(l.tenant_name);
    });
    return Array.from(set).sort();
  }, [leases]);

  // Filtered leases
  const filteredLeases = useMemo(() => {
    return leases.filter(l => {
      const propTitle = ((l as any).properties?.title || l.property_name || "").toLowerCase();
      const unit = (l.unit || "").toLowerCase();
      const tenant = (l.tenant_name || "").toLowerCase();
      const status = (l.lease_status || "").toUpperCase();
      const ref = (l.lease_number || l.id || "").toLowerCase();

      if (propertyFilter !== "all" && ((l as any).properties?.title || l.property_name) !== propertyFilter) return false;
      if (unitFilter !== "all" && l.unit !== unitFilter) return false;
      if (customerFilter !== "all" && l.tenant_name !== customerFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter.toUpperCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = ref.includes(q) || propTitle.includes(q) || unit.includes(q) || tenant.includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [leases, propertyFilter, unitFilter, customerFilter, statusFilter, searchQuery]);

  const activeCount = leases.filter(l => l.lease_status?.toUpperCase() === 'ACTIVE').length;
  const draftCount = leases.filter(l => l.lease_status?.toUpperCase() === 'DRAFT').length;
  const expiringCount = leases.filter(l => l.lease_status?.toUpperCase() === 'EXPIRING').length;
  const closedCount = leases.filter(l => l.lease_status?.toUpperCase() === 'CLOSED').length;

  const basePath = role === 'admin' ? '/admin' : role === 'owner' ? '/owner' : '/prop-mgr';

  const totalPages = Math.max(1, Math.ceil(filteredLeases.length / ITEMS_PER_PAGE));
  const paginatedLeases = filteredLeases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [propertyFilter, unitFilter, customerFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-emerald-600">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiring {'<'} 90D</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-amber-600">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : expiringCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drafts</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-slate-600">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : draftCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Closed / Vacated</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-rose-600">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : closedCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Leases</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-primary">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leases.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Lease Contracts Registry</CardTitle>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground gap-1" onClick={() => { setPropertyFilter("all"); setUnitFilter("all"); setCustomerFilter("all"); setStatusFilter("all"); setSearchQuery(""); }}>
              <RotateCcw className="h-3 w-3" /> Reset Filters
            </Button>
          </div>

          {/* Multi-Dimensional Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            <div>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Properties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties ({propertyOptions.length})</SelectItem>
                  {propertyOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Units" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units ({unitOptions.length})</SelectItem>
                  {unitOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Customers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers ({customerOptions.length})</SelectItem>
                  {customerOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRING">Expiring {'<'} 90D</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="CLOSED">Closed / Vacated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 text-xs pl-8 bg-background"
                placeholder="Search ref, property, unit, tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/20">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Ref #</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Property &amp; Unit</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Customer / Tenant</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Start Date</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">End Date</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Annual Rent</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   <tr>
                     <td colSpan={7} className="text-center py-8 text-muted-foreground">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                       Loading leases...
                     </td>
                   </tr>
                ) : filteredLeases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                      No matching leases found.
                    </td>
                  </tr>
                ) : (
                  paginatedLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-muted/10 transition-colors text-xs">
                      <td className="px-4 py-3 font-mono font-medium text-primary">{lease.lease_number || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{(lease as any).properties?.title || lease.property_name || 'Unknown Property'}</div>
                        {lease.unit && <div className="text-[11px] text-muted-foreground font-mono">Unit: {lease.unit}</div>}
                      </td>
                      <td className="px-4 py-3 font-medium">{lease.tenant_name || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lease.commencement_date ? new Date(lease.commencement_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lease.expiry_date ? new Date(lease.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-right">QAR {lease.rental_amount?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          lease.lease_status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          lease.lease_status?.toUpperCase() === 'EXPIRING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          lease.lease_status?.toUpperCase() === 'CLOSED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {lease.lease_status || 'DRAFT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {paginatedLeases.length} of {filteredLeases.length} leases</span>
              <Pagination className="justify-end w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }} isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
