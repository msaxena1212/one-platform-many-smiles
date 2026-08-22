import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Lease } from "@/lib/supabase";
import { useAppData } from "@/lib/app-data-context";
import { Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export interface LeasesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

export function LeasesModule({ role }: LeasesModuleProps) {
  const { leases: contextLeases } = useAppData();
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
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
          <CardTitle className="text-lg">Leases</CardTitle>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/10">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Ref</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Start</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">End</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Annual Rent</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   <tr>
                     <td colSpan={6} className="text-center py-8 text-muted-foreground">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                       Loading leases...
                     </td>
                   </tr>
                ) : leases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No leases found.
                    </td>
                  </tr>
                ) : (
                  paginatedLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{lease.lease_number || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">{(lease as any).properties?.title || 'Unknown Property'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{lease.commencement_date ? new Date(lease.commencement_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{lease.expiry_date ? new Date(lease.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">${lease.rental_amount?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          lease.lease_status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          lease.lease_status?.toUpperCase() === 'EXPIRING' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
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
            <div className="p-4 border-t border-border">
              <Pagination>
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
