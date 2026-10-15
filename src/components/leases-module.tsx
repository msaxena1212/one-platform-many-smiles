import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/app-data-context";
import { Loader2, PenLine, CheckSquare, Download, Search, Filter, X } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ESignatureModal } from "@/components/e-signature-modal";
import { SnaggingHandoverModal } from "@/components/snagging-handover-modal";
import * as XLSX from "xlsx";

export interface LeasesModuleProps {
  role: "admin" | "prop-mgr" | "owner";
}

/**
 * Always format date as DD/MM/YYYY — locale-independent, Qatar standard.
 * Parses the raw ISO string directly so timezone offsets never shift the day.
 */
function formatQatarDate(value?: string | null): string {
  if (!value) return 'N/A';
  const raw = String(value).split('T')[0]; // 'YYYY-MM-DD'
  const parts = raw.split('-');
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  }
  return 'N/A';
}

/** Compare a lease date string against a filter date string (both YYYY-MM-DD) */
function toRawDate(value?: string | null): string {
  if (!value) return '';
  return String(value).split('T')[0];
}

interface Filters {
  search: string;       // global quick-search
  property: string;
  unit: string;
  tenant: string;
  startFrom: string;    // YYYY-MM-DD
  startTo: string;
  endFrom: string;
  endTo: string;
  rentMin: string;
  rentMax: string;
  status: string;       // 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'DRAFT' | ''
}

const EMPTY_FILTERS: Filters = {
  search: '', property: '', unit: '', tenant: '',
  startFrom: '', startTo: '', endFrom: '', endTo: '',
  rentMin: '', rentMax: '', status: '',
};

export function LeasesModule({ role }: LeasesModuleProps) {
  const { leases: contextLeases } = useAppData();
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [snagModalOpen, setSnagModalOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
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

      const todayStr = new Date().toISOString().split('T')[0];
      const mappedContext = (contextLeases || []).map(cl => {
        const endDateStr = cl.endDate ? String(cl.endDate).split('T')[0] : '';
        const isExpired = endDateStr && endDateStr < todayStr;
        const statusVal = isExpired
          ? 'EXPIRED'
          : cl.status === 'active' || cl.status === 'fully_signed' || cl.status === 'collection_completed'
          ? 'ACTIVE'
          : cl.status === 'renewal_due'
          ? 'EXPIRING'
          : 'DRAFT';

        return {
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
          lease_status: statusVal,
        };
      });

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

  useEffect(() => { load(); }, [load]);

  // ── Resolver helpers ──────────────────────────────────────────────────────
  function getPropertyName(lease: any): string {
    return lease.properties?.title || lease.property_name || lease.property || '—';
  }
  function getUnitName(lease: any): string {
    return lease.units?.unit_number || lease.units?.unit_ref || lease.unit_code || lease.unit_name || lease.unit || '—';
  }
  function getTenantName(lease: any): string {
    return lease.customers?.full_name || lease.customers?.name || lease.tenant_name || lease.tenantName || '—';
  }

  // ── Derived counts (based on ALL leases, not filtered) ────────────────────
  const activeCount   = leases.filter(l => l.lease_status?.toUpperCase() === 'ACTIVE').length;
  const draftCount    = leases.filter(l => l.lease_status?.toUpperCase() === 'DRAFT').length;
  const expiringCount = leases.filter(l => l.lease_status?.toUpperCase() === 'EXPIRING').length;
  const expiredCount  = leases.filter(l => l.lease_status?.toUpperCase() === 'EXPIRED').length;

  // ── Unique property options for dropdown ──────────────────────────────────
  const propertyOptions = useMemo(() => {
    const names = [...new Set(leases.map(l => getPropertyName(l)).filter(n => n !== '—'))].sort();
    return names;
  }, [leases]);

  const statusOptions = ['ACTIVE', 'EXPIRING', 'EXPIRED', 'DRAFT'];

  // ── Filtered leases ───────────────────────────────────────────────────────
  const filteredLeases = useMemo(() => {
    const f = filters;
    const q = f.search.toLowerCase().trim();
    return leases.filter(lease => {
      const prop   = getPropertyName(lease);
      const unit   = getUnitName(lease);
      const tenant = getTenantName(lease);
      const start  = toRawDate(lease.commencement_date);
      const end    = toRawDate(lease.expiry_date);
      const rent   = lease.rental_amount ?? 0;
      const status = (lease.lease_status || 'DRAFT').toUpperCase();
      const ref    = (lease.lease_number || '').toLowerCase();

      // Global quick-search across ref, property, unit, tenant
      if (q && ![ref, prop.toLowerCase(), unit.toLowerCase(), tenant.toLowerCase()].some(v => v.includes(q))) return false;

      // Field-level filters
      if (f.property && !prop.toLowerCase().includes(f.property.toLowerCase())) return false;
      if (f.unit     && !unit.toLowerCase().includes(f.unit.toLowerCase())) return false;
      if (f.tenant   && !tenant.toLowerCase().includes(f.tenant.toLowerCase())) return false;
      if (f.status   && status !== f.status) return false;

      // Date range filters
      if (f.startFrom && start && start < f.startFrom) return false;
      if (f.startTo   && start && start > f.startTo)   return false;
      if (f.endFrom   && end   && end   < f.endFrom)   return false;
      if (f.endTo     && end   && end   > f.endTo)     return false;

      // Rent range filters
      if (f.rentMin && rent < Number(f.rentMin)) return false;
      if (f.rentMax && rent > Number(f.rentMax)) return false;

      return true;
    });
  }, [leases, filters]);

  const basePath = role === 'admin' ? '/admin' : role === 'owner' ? '/owner' : '/prop-mgr';

  const totalPages = Math.ceil(filteredLeases.length / ITEMS_PER_PAGE);
  const paginatedLeases = filteredLeases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [filters]);

  const isFiltered = Object.values(filters).some(v => v !== '');
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }
  function clearFilters() { setFilters(EMPTY_FILTERS); }

  // ── Excel export (uses filteredLeases so export = what you see) ───────────
  function exportToExcel() {
    const rows = filteredLeases.map((lease) => ({
      'Ref':               lease.lease_number || '',
      'Property':          getPropertyName(lease),
      'Unit':              getUnitName(lease),
      'Tenant Name':       getTenantName(lease),
      'Start Date':        formatQatarDate(lease.commencement_date),
      'End Date':          formatQatarDate(lease.expiry_date),
      'Annual Rent (QAR)': lease.rental_amount ?? 0,
      'Status':            lease.lease_status || 'DRAFT',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0] || {}).map((k) => ({
      wch: Math.max(k.length, ...rows.map((r: any) => String(r[k] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Leases');
    XLSX.writeFile(wb, `All_Leases_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  return (
    <div className="space-y-6">
      {/* ── Summary cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : activeCount}</div>
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
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : expiredCount}</div>
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

      {/* ── Main table card ──────────────────────────────────────────────── */}
      <Card className="border-border">
        {/* Header row */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 gap-4 flex-wrap">
          <CardTitle className="text-lg shrink-0">Leases &amp; Tenancy Agreements</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Global search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search ref, property, unit, tenant…"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                className="pl-8 h-8 text-xs w-56"
              />
              {filters.search && (
                <button onClick={() => setFilter('search', '')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs h-8 relative"
              onClick={() => setShowFilters(p => !p)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Clear all */}
            {isFiltered && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={exportToExcel}
              disabled={loading || filteredLeases.length === 0}
            >
              <Download className="h-3.5 w-3.5" /> Export Excel
            </Button>

            {/* New lease */}
            {role !== 'owner' && (
              <Button asChild size="sm" className="gap-1 text-xs h-8">
                <Link to={`${basePath}/leases/new`}>+ New Lease</Link>
              </Button>
            )}
          </div>
        </div>

        {/* ── Filter panel ──────────────────────────────────────────────── */}
        {showFilters && (
          <div className="mx-6 mb-4 p-4 rounded-lg border border-border bg-muted/10 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Advanced Filters</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Property */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Property Name</label>
                <select
                  value={filters.property}
                  onChange={e => setFilter('property', e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">All Properties</option>
                  {propertyOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Unit */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Unit</label>
                <Input
                  placeholder="e.g. Flat 101"
                  value={filters.unit}
                  onChange={e => setFilter('unit', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Tenant */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Tenant Name</label>
                <Input
                  placeholder="Tenant name…"
                  value={filters.tenant}
                  onChange={e => setFilter('tenant', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={filters.status}
                  onChange={e => setFilter('status', e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Start Date From */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Start Date — From</label>
                <Input
                  type="date"
                  value={filters.startFrom}
                  onChange={e => setFilter('startFrom', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Start Date To */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Start Date — To</label>
                <Input
                  type="date"
                  value={filters.startTo}
                  onChange={e => setFilter('startTo', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* End Date From */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">End Date — From</label>
                <Input
                  type="date"
                  value={filters.endFrom}
                  onChange={e => setFilter('endFrom', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* End Date To */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">End Date — To</label>
                <Input
                  type="date"
                  value={filters.endTo}
                  onChange={e => setFilter('endTo', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Annual Rent Min */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Annual Rent — Min (QAR)</label>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  value={filters.rentMin}
                  onChange={e => setFilter('rentMin', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Annual Rent Max */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Annual Rent — Max (QAR)</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  min={0}
                  value={filters.rentMax}
                  onChange={e => setFilter('rentMax', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground pt-1">
              Showing <span className="font-semibold text-foreground">{filteredLeases.length}</span> of{' '}
              <span className="font-semibold text-foreground">{leases.length}</span> leases
            </p>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
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
                    <td colSpan={9} className="text-center py-10 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading leases…
                    </td>
                  </tr>
                ) : filteredLeases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-muted-foreground">
                      {isFiltered ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">No leases match the current filters.</p>
                          <button onClick={clearFilters} className="text-xs text-primary underline underline-offset-2">Clear all filters</button>
                        </div>
                      ) : 'No leases found.'}
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
                          lease.lease_status?.toUpperCase() === 'ACTIVE'   ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                          lease.lease_status?.toUpperCase() === 'EXPIRING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          lease.lease_status?.toUpperCase() === 'EXPIRED'  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {lease.lease_status || 'DRAFT'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline" size="sm" className="h-7 text-xs gap-1"
                            onClick={() => { setSelectedLease(lease); setSignModalOpen(true); }}
                          >
                            <PenLine className="h-3 w-3 text-emerald-600" /> Sign
                          </Button>
                          <Button
                            variant="outline" size="sm" className="h-7 text-xs gap-1"
                            onClick={() => { setSelectedLease(lease); setSnagModalOpen(true); }}
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

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredLeases.length)}</span>{' '}
                of <span className="font-medium text-foreground">{filteredLeases.length}</span> records
              </p>
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

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {selectedLease && (
        <>
          <ESignatureModal
            open={signModalOpen}
            onOpenChange={setSignModalOpen}
            documentTitle="Residential Tenancy Agreement"
            documentRef={selectedLease.lease_number || selectedLease.id}
            tenantName={getTenantName(selectedLease)}
            landlordName="ZYNO Real Estate Asset Management"
            onSigningComplete={() => {
              setLeases(prev => prev.map(l => l.id === selectedLease.id ? { ...l, lease_status: 'ACTIVE' } : l));
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
