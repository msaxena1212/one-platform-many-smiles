import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/app-data-context";
import { Loader2, PenLine, CheckSquare, Download, Search, Filter, X, Edit, FileEdit, CheckCircle2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
    return `${dd}-${mm}-${yyyy}`;
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    lease_number: '',
    tenant_name: '',
    property_name: '',
    unit_name: '',
    commencement_date: '',
    expiry_date: '',
    monthlyRent: '',
    rental_amount: '',
    lease_status: '',
    has_rent_free: false,
    rent_free_days: 30,
    rent_free_position: 'FIRST_MONTH',
    pdc_count: 12,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const ITEMS_PER_PAGE = 20;

  function openEditModal(lease: any) {
    setSelectedLease(lease);
    const storedOverrides = (() => {
      try {
        return JSON.parse(localStorage.getItem('pms_custom_lease_overrides') || '{}');
      } catch {
        return {};
      }
    })();
    const uName = getUnitName(lease)?.toUpperCase()?.trim();
    const o = storedOverrides[lease.id] || (lease.lease_number ? storedOverrides[lease.lease_number] : null) || (uName ? storedOverrides[uName] : null);

    const monthly = o?.monthlyRent ?? (lease.monthlyRent || (lease.rental_amount ? Math.round(lease.rental_amount / 12) : 0));
    const annual = o?.rental_amount ?? (lease.rental_amount || (monthly * 12));

    setEditForm({
      id: lease.id,
      lease_number: lease.lease_number || lease.id,
      tenant_name: o?.tenant_name || getTenantName(lease),
      property_name: getPropertyName(lease),
      unit_name: getUnitName(lease),
      commencement_date: o?.commencement_date || toRawDate(lease.commencement_date),
      expiry_date: o?.expiry_date || toRawDate(lease.expiry_date),
      monthlyRent: String(monthly),
      rental_amount: String(annual),
      lease_status: o?.lease_status || lease.lease_status || 'DRAFT',
      has_rent_free: o?.has_rent_free ?? Boolean(lease.has_rent_free || lease.rent_free_period_days),
      rent_free_days: o?.rent_free_days || lease.rent_free_period_days || 30,
      rent_free_position: o?.rent_free_position || lease.rent_free_position || 'FIRST_MONTH',
      pdc_count: o?.pdc_count || lease.pdc_count || lease.number_of_pdc || 12,
    });
    setEditModalOpen(true);
  }

  async function handleSaveEditContract() {
    if (!editForm.id) return;
    const mRent = parseFloat(editForm.monthlyRent) || 0;
    const annRent = parseFloat(editForm.rental_amount) || (mRent * 12);
    const pdcCount = parseInt(String(editForm.pdc_count), 10) || 12;

    const updatedData = {
      commencement_date: editForm.commencement_date,
      expiry_date: editForm.expiry_date,
      monthlyRent: mRent,
      rental_amount: annRent,
      lease_status: editForm.lease_status,
      tenant_name: editForm.tenant_name,
      has_rent_free: editForm.has_rent_free,
      rent_free_days: editForm.has_rent_free ? (parseInt(String(editForm.rent_free_days), 10) || 30) : 0,
      rent_free_position: editForm.rent_free_position,
      pdc_count: pdcCount,
      updated_at: new Date().toISOString(),
    };

    // 1. Persistent localStorage overrides (survives page refresh & context reloads)
    try {
      const stored = JSON.parse(localStorage.getItem('pms_custom_lease_overrides') || '{}');
      stored[editForm.id] = updatedData;
      if (editForm.lease_number) {
        stored[editForm.lease_number] = updatedData;
      }
      if (editForm.unit_name && editForm.unit_name !== '—') {
        stored[editForm.unit_name.toUpperCase().trim()] = updatedData;
      }
      localStorage.setItem('pms_custom_lease_overrides', JSON.stringify(stored));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    // 2. Persist to Supabase leases table
    try {
      await supabase
        .from('leases')
        .update({
          commencement_date: editForm.commencement_date,
          expiry_date: editForm.expiry_date,
          rental_amount: annRent,
          lease_status: editForm.lease_status.toLowerCase(),
          number_of_pdc: pdcCount,
        })
        .or(`id.eq.${editForm.id},lease_number.eq.${editForm.lease_number}`);
    } catch (e) {
      console.warn("Supabase lease update note:", e);
    }

    // 3. Persist to Supabase units table if unit exists
    if (editForm.unit_name && editForm.unit_name !== '—') {
      try {
        await supabase
          .from('units')
          .update({
            contract_start_date: editForm.commencement_date,
            contract_end_date: editForm.expiry_date,
            current_rent: mRent,
            current_tenant: editForm.tenant_name,
          })
          .or(`unit_number.eq.${editForm.unit_name},unit_ref.eq.${editForm.unit_name},unit_code.eq.${editForm.unit_name}`);
      } catch (e) {
        console.warn("Supabase unit update note:", e);
      }
    }

    // 4. Update React state immediately
    setLeases(prev => prev.map(l => {
      const uName = getUnitName(l)?.toUpperCase()?.trim();
      const isMatch = l.id === editForm.id || l.lease_number === editForm.lease_number || (editForm.unit_name && uName === editForm.unit_name.toUpperCase().trim());
      if (isMatch) {
        return {
          ...l,
          commencement_date: editForm.commencement_date,
          expiry_date: editForm.expiry_date,
          monthlyRent: mRent,
          rental_amount: annRent,
          lease_status: editForm.lease_status,
          has_rent_free: editForm.has_rent_free,
          rent_free_days: editForm.has_rent_free ? (parseInt(String(editForm.rent_free_days), 10) || 30) : 0,
          rent_free_position: editForm.rent_free_position,
          pdc_count: pdcCount,
          tenant_name: editForm.tenant_name,
          customers: { ...l.customers, full_name: editForm.tenant_name, name: editForm.tenant_name },
        };
      }
      return l;
    }));

    toast.success(`Contract ${editForm.lease_number} saved permanently.`);
    setEditModalOpen(false);
  }

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
          has_rent_free: (cl as any).hasRentFree,
          rent_free_days: (cl as any).rentFreeDays,
          rent_free_position: (cl as any).rentFreePosition,
          pdc_count: (cl as any).pdcCount,
        };
      });

      const allLeases = [...dbLeases];
      for (const mc of mappedContext) {
        if (!allLeases.some(l => l.id === mc.id || l.lease_number === mc.lease_number)) {
          allLeases.push(mc);
        }
      }

      // Apply persistent localStorage overrides so refreshed page never reverts
      const storedOverrides = (() => {
        try {
          return JSON.parse(localStorage.getItem('pms_custom_lease_overrides') || '{}');
        } catch {
          return {};
        }
      })();

      const finalLeases = allLeases.map((leaseItem) => {
        const u = getUnitName(leaseItem)?.toUpperCase()?.trim();
        const o = storedOverrides[leaseItem.id] || (leaseItem.lease_number ? storedOverrides[leaseItem.lease_number] : null) || (u ? storedOverrides[u] : null);
        if (!o) return leaseItem;
        return {
          ...leaseItem,
          commencement_date: o.commencement_date || leaseItem.commencement_date,
          expiry_date: o.expiry_date || leaseItem.expiry_date,
          monthlyRent: o.monthlyRent ?? leaseItem.monthlyRent,
          rental_amount: o.rental_amount ?? leaseItem.rental_amount,
          lease_status: o.lease_status || leaseItem.lease_status,
          tenant_name: o.tenant_name || leaseItem.tenant_name,
          has_rent_free: o.has_rent_free ?? leaseItem.has_rent_free,
          rent_free_days: o.rent_free_days ?? leaseItem.rent_free_days,
          rent_free_position: o.rent_free_position || leaseItem.rent_free_position,
          pdc_count: o.pdc_count ?? leaseItem.pdc_count,
          customers: o.tenant_name ? { ...leaseItem.customers, full_name: o.tenant_name, name: o.tenant_name } : leaseItem.customers,
        };
      });

      setLeases(finalLeases);
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
                <Link to={`${basePath}/leases/new` as any}>+ New Lease</Link>
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Monthly Rent</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Annual Rent</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground uppercase text-xs tracking-wider">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading leases…
                    </td>
                  </tr>
                ) : filteredLeases.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-muted-foreground">
                      {isFiltered ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">No leases match the current filters.</p>
                          <button onClick={clearFilters} className="text-xs text-primary underline underline-offset-2">Clear all filters</button>
                        </div>
                      ) : 'No leases found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedLeases.map((lease) => {
                    const monthlyRent = lease.monthlyRent || (lease.rental_amount ? Math.round(lease.rental_amount / 12) : 0);
                    return (
                    <tr key={lease.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{lease.lease_number || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium">{getPropertyName(lease)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{getUnitName(lease)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{getTenantName(lease)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatQatarDate(lease.commencement_date)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatQatarDate(lease.expiry_date)}</td>
                      <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">QR {monthlyRent?.toLocaleString('en-QA') || '0'}</td>
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
                            variant="outline" size="sm" className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/5"
                            onClick={() => openEditModal(lease)}
                            title="Edit contract details until data updation is finalized"
                          >
                            <FileEdit className="h-3 w-3" /> Edit
                          </Button>
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
                    );
                  })
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
      {/* ── Edit Contract Modal (Active until data updation finalized) ──── */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-primary" /> Edit Contract Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Modify contract terms, dates, rents, and status until final data updation is frozen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Contract / Lease #</Label>
                <Input value={editForm.lease_number} disabled className="h-8 font-mono bg-muted/50" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Tenant Name</Label>
                <Input 
                  value={editForm.tenant_name} 
                  onChange={e => setEditForm({ ...editForm, tenant_name: e.target.value })}
                  className="h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Property</Label>
                <Input value={editForm.property_name} disabled className="h-8 bg-muted/50" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Unit Number</Label>
                <Input value={editForm.unit_name} disabled className="h-8 font-mono bg-muted/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Commencement Date</Label>
                <Input 
                  type="date" 
                  value={editForm.commencement_date} 
                  onChange={e => setEditForm({ ...editForm, commencement_date: e.target.value })}
                  className="h-8 font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Expiry Date</Label>
                <Input 
                  type="date" 
                  value={editForm.expiry_date} 
                  onChange={e => setEditForm({ ...editForm, expiry_date: e.target.value })}
                  className="h-8 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Monthly Rent (QAR)</Label>
                <Input 
                  type="number" 
                  value={editForm.monthlyRent} 
                  onChange={e => {
                    const m = e.target.value;
                    const parsed = parseFloat(m) || 0;
                    setEditForm({ ...editForm, monthlyRent: m, rental_amount: String(parsed * 12) });
                  }}
                  className="h-8 font-mono font-semibold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Annual Rent (QAR)</Label>
                <Input 
                  type="number" 
                  value={editForm.rental_amount} 
                  onChange={e => setEditForm({ ...editForm, rental_amount: e.target.value })}
                  className="h-8 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Contract Status</Label>
              <select
                className="w-full h-8 text-xs border rounded-md px-2 bg-background"
                value={editForm.lease_status}
                onChange={e => setEditForm({ ...editForm, lease_status: e.target.value })}
              >
                <option value="DRAFT">DRAFT (Data Entry & Updation)</option>
                <option value="ACTIVE">ACTIVE (Finalized & Enforced)</option>
                <option value="EXPIRING">EXPIRING (Pending Renewal)</option>
                <option value="EXPIRED">EXPIRED (Archived)</option>
              </select>
            </div>

            {/* Rent-Free Concession Period */}
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[11px] font-semibold text-primary flex items-center gap-1.5">
                    Rent-Free Period Concession (e.g. 13-Month Contract)
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Extend tenancy beyond 12 months with 1 or more free concession months
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.has_rent_free}
                  onChange={e => setEditForm({ ...editForm, has_rent_free: e.target.checked })}
                  className="h-4 w-4 rounded border-primary text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              {editForm.has_rent_free && (
                <div className="grid grid-cols-3 gap-2.5 pt-1.5 border-t border-primary/10">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-muted-foreground">Free Days</Label>
                    <Input
                      type="number"
                      value={editForm.rent_free_days}
                      onChange={e => setEditForm({ ...editForm, rent_free_days: parseInt(e.target.value, 10) || 0 })}
                      className="h-7 text-xs font-mono"
                      min={1}
                      max={90}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-muted-foreground">Free Month Timing</Label>
                    <select
                      className="w-full h-7 text-xs border rounded-md px-1.5 bg-background font-medium"
                      value={editForm.rent_free_position}
                      onChange={e => setEditForm({ ...editForm, rent_free_position: e.target.value })}
                    >
                      <option value="FIRST_MONTH">Month 1 Free (Initial)</option>
                      <option value="LAST_MONTH">Month 13 Free (Completion)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-muted-foreground">PDC Count</Label>
                    <Input
                      type="number"
                      value={editForm.pdc_count}
                      onChange={e => setEditForm({ ...editForm, pdc_count: parseInt(e.target.value, 10) || 12 })}
                      className="h-7 text-xs font-mono"
                      min={1}
                      max={24}
                    />
                  </div>
                  <div className="col-span-3 text-[10px] text-primary/80 bg-background/80 p-1.5 rounded border border-primary/10">
                    ℹ️ <strong>13-Month Term Schedule:</strong> 12 Cheques collected covering 12 paid months. {editForm.rent_free_position === 'FIRST_MONTH' ? 'Month 1 is logged as "Rent Free Concession" (Cheques start Month 2).' : 'Month 13 is logged as "Rent Free Concession" (Cheques cover Months 1-12).'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-primary text-primary-foreground gap-1.5" onClick={handleSaveEditContract}>
              <CheckCircle2 className="h-4 w-4" /> Save &amp; Update Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
