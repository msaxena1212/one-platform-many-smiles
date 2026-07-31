import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Lease } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export interface LeasesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

export function LeasesModule({ role }: LeasesModuleProps) {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      let query = supabase.from('leases').select('*, properties(title, property_code)');
      
      if (role === 'prop-mgr' && userId) {
        // Property manager sees leases for properties they are assigned to or via employees link
        // For simplicity, just fetch all in demo mode or add specific logic
      } else if (role === 'owner' && userId) {
         // Assuming host_id filtering would happen on properties
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setLeases(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = leases.filter(l => l.lease_status === 'Active').length;
  const draftCount = leases.filter(l => l.lease_status === 'Draft').length;
  const expiringCount = leases.filter(l => l.lease_status === 'Expiring').length;

  const basePath = role === 'admin' ? '/admin' : role === 'owner' ? '/owner' : '/prop-mgr';

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
          {role !== 'owner' && (
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link to={`${basePath}/leases/new` as any}>New lease</Link>
            </Button>
          )}
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
                  leases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{lease.lease_number || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">{(lease as any).properties?.title || 'Unknown Property'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{lease.commencement_date ? new Date(lease.commencement_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{lease.expiry_date ? new Date(lease.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">${lease.rental_amount?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          lease.lease_status === 'Active' ? 'bg-green-100 text-green-700' :
                          lease.lease_status === 'Expiring' ? 'bg-amber-100 text-amber-700' :
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
        </CardContent>
      </Card>
    </div>
  );
}
