import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Lease } from "@/lib/supabase";
import { useAppData } from "@/lib/app-data-context";
import { Loader2, PenLine, CheckSquare } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ESignatureModal } from "@/components/e-signature-modal";
import { SnaggingHandoverModal } from "@/components/snagging-handover-modal";

export interface LeasesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

/** Always format date as DD/MM/YYYY — locale-independent, Qatar standard */
function formatQatarDate(value?: string | null): string {
  if (!value) return 'N/A';
  // Parse the raw date string directly to avoid timezone shifts
  const parts = String(value).split('T')[0].split('-');
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  }
  return 'N/A';
}

export function LeasesModule({ role }: LeasesModuleProps) {
  const { leases: contextLeases } = useAppData();
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [snagModalOpen, setSnagModalOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any | null>(null);
  const ITEMS_PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let dbLeases: any[] = [];
      try {
        const { data, error } = await supabase
          .from('leases')
          .select('*, properties(title, property_code), units(unit_number, unit_ref), customers(full_name, name)')
          .order('created_at', { ascending: false });
        if (!error && data) dbLeases = data;
      } catch (e) {
        console.error(e);
      }

      // Map context leases to match table structure
      const mappedContext = (contextLeases || []).map(cl => ({
        id: cl.id,
        lease_number: cl.id.toUpperCase().startsWith('L') ? cl.id.toUpperCase() : `LES-${cl.id}`,
        properties: { title: cl.property },
        units: null,
        customers: null,
        tenant_name: (cl as any).tenantName || '',
        unit_code: (cl as any).unit || '',
        commencement_date: cl.startDate,
        expiry_date: cl.endDate,
        rental_amount: cl.monthlyRent ? cl.monthlyRent * 12 : 60000,
        lease_status: cl.status === 'active' || cl.status === 'fully_signed' || cl.status === 'collection_completed' ? 'ACTIVE' : cl.status === 'renewal_due' ? 'EXPIRING' : 'DRAFT',
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
  }, [contextLeases]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = leases.filter(l => l.lease_status?.toUpperCase() === 'ACTIVE').length;
  const draftCount = leases.filter(l => l.lease_status?.toUpperCase() === 'DRAFT').length;
  const expiringCount = leases.filter(l => l.lease_status?.toUpperCase() === 'EXPIRING').length;

  const basePath = role === 'admin' ? '/admin' : role === 'owner' ? '/owner' : '/prop-mgr';

  const totalPages = Math.ceil(leases.length / ITEMS_PER_PAGE);
  const paginatedLeases = leases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [leases]);

  /** Resolve property name from lease row */
  function getPropertyName(lease: any): string {
    return lease.properties?.title || lease.property_name || lease.property || '—';
  }

  /** Resolve unit name/ref from lease row */
  function getUnitName(lease: any): string {
    return lease.units?.unit_number || lease.units?.unit_ref || lease.unit_code || lease.unit_name || lease.unit || '—';
  }

  /** Resolve tenant name from lease row */
  function getTenantName(lease: any): string {
    return (
      lease.customers?.full_name ||
      lease.customers?.name ||
      lease.tenant_name ||
      lease.tenantName ||
      '—'
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiring {'<'} 90D</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : expiringCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : draftCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leases.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <div className="flex items-center justify-between p-6 pb-4">
          <CardTitle className="text-lg">Leases &amp; Tenancy Agreements</CardTitle>
          <div className="flex items-center gap-2">
            {role !== 'owner' && (
              <Button asChild size="sm" className="gap-1 text-xs">
                <Link to={`${basePath}/leases/new`}>+ New Lease</Link>
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/10">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Ref</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Property Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Unit</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Tenant Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Start Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">End Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Annual Rent</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground uppercase text-xs tracking-wider">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   <tr>
                     <td colSpan={9} className="text-center py-8 text-muted-foreground">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                       Loading leases...
                     </td>
                   </tr>
                ) : leases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      No leases found.
                    </td>
                  </tr>
                ) : (
                  paginatedLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{lease.lease_number || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium">{getPropertyName(lease)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{getUnitName(lease)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{getTenantName(lease)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatQatarDate(lease.commencement_date)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatQatarDate(lease.expiry_date)}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">QR {lease.rental_amount?.toLocaleString('en-QA') || '0'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          lease.lease_status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                          lease.lease_status?.toUpperCase() === 'EXPIRING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {lease.lease_status || 'DRAFT'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              setSelectedLease(lease);
                              setSignModalOpen(true);
                            }}
                          >
                            <PenLine className="h-3 w-3 text-emerald-600" /> Sign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              setSelectedLease(lease);
                              setSnagModalOpen(true);
                            }}
                          >
                            <CheckSquare className="h-3 w-3 text-indigo-600" /> Snagging
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                  </PaginationItem>
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }} isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
                    </PaginationItem>
                  ))}
                  {totalPages > 7 && <PaginationItem><span className="px-2 text-muted-foreground text-sm">…{totalPages}</span></PaginationItem>}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLease && (
        <>
          <ESignatureModal
            open={signModalOpen}
            onOpenChange={setSignModalOpen}
            documentTitle={`Residential Tenancy Agreement`}
            documentRef={selectedLease.lease_number || selectedLease.id}
            tenantName={getTenantName(selectedLease)}
            landlordName="ZYNO Real Estate Asset Management"
            onSigningComplete={() => {
              setLeases((prev) =>
                prev.map((l) =>
                  l.id === selectedLease.id ? { ...l, lease_status: 'ACTIVE' } : l
                )
              );
            }}
          />

          <SnaggingHandoverModal
            open={snagModalOpen}
            onOpenChange={setSnagModalOpen}
            unitCode={getUnitName(selectedLease)}
            propertyName={getPropertyName(selectedLease)}
            tenantName={getTenantName(selectedLease)}
            leaseNo={selectedLease.lease_number || selectedLease.id}
            securityDepositAmount={selectedLease.rental_amount ? Math.round(selectedLease.rental_amount / 12) : 5000}
            defaultType={selectedLease.lease_status === 'ACTIVE' ? 'MOVE_OUT' : 'MOVE_IN'}
          />
        </>
      )}
    </div>
  );
}
