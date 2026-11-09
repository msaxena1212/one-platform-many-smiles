import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAppData } from "@/lib/app-data-context";
import { Loader2, PenLine, CheckSquare, Download, Search, Filter, X, Edit, FileEdit, CheckCircle2, ShieldAlert, FileCheck2, Scale, Building2, RefreshCw, Trash2 } from "lucide-react";
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

  // ── Renewal modal state ──────────────────────────────────────────────────
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [renewForm, setRenewForm] = useState({
    oldLeaseId: '',
    oldLeaseNumber: '',
    tenant_name: '',
    property_name: '',
    unit_name: '',
    oldExpiryDate: '',
    newLeaseNumber: '',
    commencement_date: '',
    expiry_date: '',
    monthlyRent: '',
    rental_amount: '',
    securityDeposit: '',
    pdc_count: 12,
    paymentFrequency: 'monthly',
  });

  function openRenewModal(lease: any) {
    const oldExpiry = toRawDate(lease.expiry_date) || new Date().toISOString().split('T')[0];
    let nextStartStr = '';
    let nextEndStr = '';
    if (oldExpiry) {
      const parts = oldExpiry.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setDate(d.getDate() + 1);
        const yStart = d.getFullYear();
        const mStart = String(d.getMonth() + 1).padStart(2, '0');
        const dayStart = String(d.getDate()).padStart(2, '0');
        nextStartStr = `${yStart}-${mStart}-${dayStart}`;

        // End date: 1 year later minus 1 day
        const dEnd = new Date(d);
        dEnd.setFullYear(dEnd.getFullYear() + 1);
        dEnd.setDate(dEnd.getDate() - 1);
        const yEnd = dEnd.getFullYear();
        const mEnd = String(dEnd.getMonth() + 1).padStart(2, '0');
        const dayEnd = String(dEnd.getDate()).padStart(2, '0');
        nextEndStr = `${yEnd}-${mEnd}-${dayEnd}`;
      }
    }

    const mRent = lease.monthlyRent || (lease.rental_amount ? Math.round((lease.rental_amount / 12) * 100) / 100 : 0);
    const annRent = lease.rental_amount || (mRent * 12);
    const baseLNum = lease.lease_number || lease.id || '';
    const cleanLNum = baseLNum.replace(/\s+/g, '');
    let renewalNumber = `${cleanLNum}-R1`;
    if (cleanLNum.includes('-R')) {
      renewalNumber = cleanLNum.replace(/-R(\d+)$/, (_: string, n: string) => `-R${parseInt(n, 10) + 1}`);
    }

    setRenewForm({
      oldLeaseId: lease.id,
      oldLeaseNumber: baseLNum,
      tenant_name: getTenantName(lease),
      property_name: getPropertyName(lease),
      unit_name: getUnitName(lease),
      oldExpiryDate: oldExpiry,
      newLeaseNumber: renewalNumber,
      commencement_date: nextStartStr,
      expiry_date: nextEndStr,
      monthlyRent: String(mRent),
      rental_amount: String(annRent),
      securityDeposit: String(mRent),
      pdc_count: lease.pdc_count || 12,
      paymentFrequency: 'monthly',
    });
    setRenewModalOpen(true);
  }

  async function handleConfirmRenewContract() {
    if (!renewForm.newLeaseNumber || !renewForm.commencement_date || !renewForm.expiry_date) {
      toast.error("Please ensure contract number, commencement date, and expiry date are filled.");
      return;
    }
    setRenewing(true);
    try {
      const mRent = parseFloat(renewForm.monthlyRent) || 0;
      const annRent = parseFloat(renewForm.rental_amount) || (mRent * 12);
      const secDep = parseFloat(renewForm.securityDeposit) || mRent;
      const pdcs = parseInt(String(renewForm.pdc_count), 10) || 12;

      const newRenewedLease = {
        id: renewForm.newLeaseNumber,
        lease_number: renewForm.newLeaseNumber,
        properties: { title: renewForm.property_name },
        property_name: renewForm.property_name,
        unit_code: renewForm.unit_name,
        unit: renewForm.unit_name,
        tenant_name: renewForm.tenant_name,
        commencement_date: renewForm.commencement_date,
        expiry_date: renewForm.expiry_date,
        monthlyRent: mRent,
        rental_amount: annRent,
        securityDeposit: secDep,
        pdc_count: pdcs,
        paymentFrequency: renewForm.paymentFrequency,
        lease_status: 'ACTIVE',
        renewal_of: renewForm.oldLeaseNumber || renewForm.oldLeaseId,
        created_at: new Date().toISOString(),
      };

      // 1. Persist to localStorage pms_renewed_leases_v1
      try {
        const rawRen = localStorage.getItem('pms_renewed_leases_v1');
        const renewals: any[] = rawRen ? JSON.parse(rawRen) : [];
        const filtered = renewals.filter(r => r.id !== newRenewedLease.id && r.lease_number !== newRenewedLease.lease_number);
        filtered.unshift(newRenewedLease);
        localStorage.setItem('pms_renewed_leases_v1', JSON.stringify(filtered));
      } catch (e) {
        console.warn('Could not save renewal to pms_renewed_leases_v1:', e);
      }

      // 2. Persist to localStorage pms_custom_lease_overrides
      try {
        const stored = JSON.parse(localStorage.getItem('pms_custom_lease_overrides') || '{}');
        stored[newRenewedLease.id] = {
          commencement_date: newRenewedLease.commencement_date,
          expiry_date: newRenewedLease.expiry_date,
          monthlyRent: mRent,
          rental_amount: annRent,
          lease_status: 'ACTIVE',
          tenant_name: newRenewedLease.tenant_name,
          pdc_count: pdcs,
          updated_at: new Date().toISOString(),
        };
        stored[newRenewedLease.lease_number] = stored[newRenewedLease.id];

        if (renewForm.oldLeaseId) {
          stored[renewForm.oldLeaseId] = {
            ...(stored[renewForm.oldLeaseId] || {}),
            lease_status: 'RENEWED',
            updated_at: new Date().toISOString(),
          };
        }
        if (renewForm.oldLeaseNumber) {
          stored[renewForm.oldLeaseNumber] = {
            ...(stored[renewForm.oldLeaseNumber] || {}),
            lease_status: 'RENEWED',
            updated_at: new Date().toISOString(),
          };
        }
        localStorage.setItem('pms_custom_lease_overrides', JSON.stringify(stored));
      } catch (e) {
        console.warn('Could not update pms_custom_lease_overrides:', e);
      }

      // 3. Persist to Supabase safely (checking UUID validity)
      try {
        const isOldUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(renewForm.oldLeaseId);
        if (isOldUUID) {
          await supabase.from('leases').update({ lease_status: 'renewed' }).eq('id', renewForm.oldLeaseId);
        } else if (renewForm.oldLeaseNumber) {
          await supabase.from('leases').update({ lease_status: 'renewed' }).eq('lease_number', renewForm.oldLeaseNumber);
        }

        const { data: uMatch } = await supabase
          .from('units')
          .select('id, property_id')
          .or(`unit_ref.eq.${renewForm.unit_name},unit_code.eq.${renewForm.unit_name},unit_name.eq.${renewForm.unit_name}`)
          .maybeSingle();

        if (uMatch?.id) {
          await supabase.from('leases').insert({
            lease_number: newRenewedLease.lease_number,
            commencement_date: newRenewedLease.commencement_date,
            expiry_date: newRenewedLease.expiry_date,
            rental_amount: annRent,
            lease_status: 'ACTIVE',
            security_deposit: secDep,
            number_of_pdc: pdcs,
            payment_frequency: renewForm.paymentFrequency,
            unit_id: uMatch.id,
            property_id: uMatch.property_id,
          });

          await supabase.from('units').update({
            contract_no: newRenewedLease.lease_number,
            contract_start_date: newRenewedLease.commencement_date,
            contract_end_date: newRenewedLease.expiry_date,
            current_rent: mRent,
            current_tenant: renewForm.tenant_name,
            status: 'Occupied',
            lease_status: 'Leased',
          }).eq('id', uMatch.id);
        }
      } catch (dbErr) {
        console.warn('Supabase lease renewal sync notice:', dbErr);
      }

      window.dispatchEvent(new CustomEvent('pms_data_updated'));
      toast.success(`Lease renewed successfully! Contract #${renewForm.newLeaseNumber} is now Active.`);
      setRenewModalOpen(false);
      await load();
    } catch (err: any) {
      toast.error(`Renewal error: ${err?.message || err}`);
    } finally {
      setRenewing(false);
    }
  }

  function openEditModal(lease: any) {
    setSelectedLease(lease);
    const storedOverrides = (() => {
      try {
        return JSON.parse(localStorage.getItem('pms_custom_lease_overrides') || '{}');
      } catch {
        return {};
      }
    })();
    // Helper to resolve override with precise key matching
    function lookupOverride(leaseItem: any, overridesMap: Record<string, any>) {
      if (!overridesMap) return null;
      const lNum = leaseItem.lease_number || '';
      const cleanLNum = lNum ? lNum.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
      const id = leaseItem.id || '';
      const cleanId = id ? id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';

      let matched = overridesMap[id] ||
        (cleanId ? overridesMap[cleanId] : null) ||
        (lNum ? overridesMap[lNum] : null) ||
        (cleanLNum ? overridesMap[cleanLNum] : null);

      if (!matched) {
        const u = getUnitName(leaseItem)?.toUpperCase()?.trim();
        const cleanU = u ? u.replace(/[^a-zA-Z0-9]/g, '') : '';
        const candidate = overridesMap[u] || (cleanU ? overridesMap[cleanU] : null);
        if (
          candidate &&
          (!candidate.lease_number || candidate.lease_number === lNum || candidate.lease_number === id) &&
          (!candidate.id || candidate.id === lNum || candidate.id === id)
        ) {
          matched = candidate;
        }
      }

      return matched;
    }

    const o = lookupOverride(lease, storedOverrides);

    const monthly = o?.monthlyRent ?? (lease.monthlyRent || (lease.rental_amount ? Math.round((lease.rental_amount / 12) * 100) / 100 : 0));
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
      const cleanLease = editForm.lease_number ? editForm.lease_number.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
      const cleanId = editForm.id ? editForm.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
      const keysToSave = [
        editForm.id,
        cleanId,
        editForm.lease_number,
        cleanLease,
      ].filter(Boolean);

      keysToSave.forEach(k => {
        stored[k] = updatedData;
      });
      localStorage.setItem('pms_custom_lease_overrides', JSON.stringify(stored));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    // 2. Persist to Supabase leases table (errors are surfaced, never swallowed)
    const dbErrors: string[] = [];
    const rentFreeDays = editForm.has_rent_free ? (parseInt(String(editForm.rent_free_days), 10) || 30) : 0;
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editForm.id);
      const matchCol = isUUID ? 'id' : 'lease_number';
      const matchVal = isUUID ? editForm.id : editForm.lease_number;

      const orFilter = isUUID
        ? `id.eq.${editForm.id},lease_number.eq.${editForm.lease_number || editForm.id}`
        : `lease_number.eq.${editForm.lease_number || editForm.id}`;

      let updateRes = await supabase
        .from('leases')
        .update({
          commencement_date: editForm.commencement_date,
          expiry_date: editForm.expiry_date,
          rental_amount: annRent,
          lease_status: editForm.lease_status.toUpperCase(),
          number_of_pdc: pdcCount,
        })
        .or(orFilter)
        .select('id');

      if (!updateRes.data || updateRes.data.length === 0) {
        // Fallback match through linked unit
        const { data: uMatch } = await supabase
          .from('units')
          .select('id')
          .or(`unit_ref.eq.${editForm.unit_name},unit_code.eq.${editForm.unit_name},unit_name.eq.${editForm.unit_name}`)
          .maybeSingle();
        if (uMatch?.id) {
          updateRes = await supabase
            .from('leases')
            .update({
              commencement_date: editForm.commencement_date,
              expiry_date: editForm.expiry_date,
              rental_amount: annRent,
              lease_status: editForm.lease_status.toUpperCase(),
              number_of_pdc: pdcCount,
            })
            .eq('unit_id', uMatch.id)
            .select('id');
        }
      }

      if (updateRes.error) dbErrors.push(`lease: ${updateRes.error.message}`);
      else if (!updateRes.data || updateRes.data.length === 0) dbErrors.push('lease: no database row was updated (blocked by permissions or lease not found)');

      // Rent-free fields are written separately so a missing column cannot block the core update.
      if (matchVal) {
        const { error: rfError } = await supabase
          .from('leases')
          .update({
            has_rent_free: editForm.has_rent_free,
            rent_free_period_days: rentFreeDays,
            rent_free_position: editForm.rent_free_position,
          })
          .eq(matchCol, matchVal);
        if (rfError) console.warn('Rent-free fields not persisted to leases table:', rfError.message);
      }
    } catch (e: any) {
      dbErrors.push(`lease: ${e?.message || e}`);
    }

    // 3. Persist to Supabase units table (match on the unit columns the app reads elsewhere)
    if (editForm.unit_name && editForm.unit_name !== '—') {
      try {
        const { data: uData, error } = await supabase
          .from('units')
          .update({
            contract_start_date: editForm.commencement_date,
            contract_end_date: editForm.expiry_date,
            current_rent: mRent,
            current_tenant: editForm.tenant_name,
          })
          .or(`unit_ref.eq.${editForm.unit_name},unit_code.eq.${editForm.unit_name},unit_name.eq.${editForm.unit_name}`)
          .select('id');
        if (error) dbErrors.push(`unit: ${error.message}`);
        else if (!uData || uData.length === 0) dbErrors.push('unit: no database row was updated (blocked by permissions or unit not found)');
      } catch (e: any) {
        dbErrors.push(`unit: ${e?.message || e}`);
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

    if (dbErrors.length) {
      toast.error(`Contract saved on this device only. Database update failed: ${dbErrors.join('; ')}`);
    } else {
      toast.success(`Contract ${editForm.lease_number} saved permanently.`);
      // Reload so Units, billing and reports pick up the saved dates from the database.
      setTimeout(() => { if (typeof window !== 'undefined') window.location.reload(); }, 900);
    }
    setEditModalOpen(false);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let dbLeases: any[] = [];
      try {
        const { data, error } = await supabase
          .from('leases')
          .select('*, properties(id, title, property_code), units:unit_id(unit_ref, unit_name, unit_code), customers:customer_id(full_name)')
          .order('created_at', { ascending: false });
        if (!error && data) dbLeases = data;
      } catch (e) {
        console.error(e);
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const mappedContext = (contextLeases || []).map(cl => {
        const rawStatus = String(cl.status || (cl as any).lease_status || '').toUpperCase();
        const isRenewed = rawStatus === 'RENEWED';
        const endDateStr = cl.endDate ? String(cl.endDate).split('T')[0] : '';
        const isExpired = !isRenewed && endDateStr && endDateStr < todayStr;
        const statusVal = isRenewed
          ? 'RENEWED'
          : isExpired
            ? 'EXPIRED'
            : cl.status === 'active' || cl.status === 'fully_signed' || cl.status === 'collection_completed'
              ? 'ACTIVE'
              : cl.status === 'renewal_due'
                ? 'EXPIRING'
                : 'DRAFT';

        const periodMonths = Number((cl as any).leasePeriodMonths || (cl as any).lease_period_months || 0);
        const totalRent = cl.monthlyRent
          ? cl.monthlyRent * (periodMonths > 0 ? periodMonths : 12)
          : 60000;

        return {
          id: cl.id,
          lease_number: (cl as any).contractNumber || (cl as any).lease_number || (cl.id.toUpperCase().startsWith('L') ? cl.id.toUpperCase() : `LES-${cl.id}`),
          properties: { title: cl.property },
          units: null,
          customers: null,
          tenant_name: (cl as any).tenantName || '',
          unit_code: (cl as any).unit || '',
          commencement_date: cl.startDate,
          expiry_date: cl.endDate,
          monthlyRent: cl.monthlyRent || 0,
          rental_amount: totalRent,
          lease_period_months: periodMonths || undefined,
          lease_status: statusVal,
          has_rent_free: (cl as any).hasRentFree,
          rent_free_days: (cl as any).rentFreeDays,
          rent_free_position: (cl as any).rentFreePosition,
          pdc_count: (cl as any).pdcCount,
          renewal_of: (cl as any).renewalOf || (cl as any).renewal_of,
        };
      });

      const allLeases = [...dbLeases];
      for (const mc of mappedContext) {
        if (!allLeases.some(l => l.id === mc.id || l.lease_number === mc.lease_number)) {
          allLeases.push(mc);
        }
      }

      // Also merge any newly created leases from Leasing Module localStorage ('pms_leasing_v2_leases')
      try {
        const rawV2Leases = localStorage.getItem('pms_leasing_v2_leases');
        if (rawV2Leases) {
          const parsedV2: any[] = JSON.parse(rawV2Leases);
          if (Array.isArray(parsedV2)) {
            for (const vl of parsedV2) {
              const vlId = vl.id || vl.lease_number;
              const vlNum = vl.lease_number || vl.id;
              if (!allLeases.some(l => l.id === vlId || l.lease_number === vlNum)) {
                const sDate = vl.startDate || vl.commencement_date || '';
                const eDate = vl.endDate || vl.expiry_date || '';
                const mRent = Number(vl.monthlyRent || 0);
                let pMonths = Number(vl.lease_period_months || 0);
                if (!pMonths && sDate && eDate) {
                  const sd = new Date(sDate);
                  const ed = new Date(eDate);
                  if (!isNaN(sd.getTime()) && !isNaN(ed.getTime())) {
                    pMonths = Math.max(1, Math.round((ed.getTime() - sd.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                  }
                }
                const totalRent = Number(vl.rental_amount || (mRent * (pMonths > 0 ? pMonths : 12)));
                allLeases.unshift({
                  id: vlId,
                  lease_number: vlNum,
                  properties: { title: vl.property || vl.property_name || '' },
                  units: null,
                  customers: null,
                  tenant_name: vl.tenantName || vl.tenant_name || '',
                  unit_code: vl.unit || vl.unit_code || '',
                  commencement_date: sDate,
                  expiry_date: eDate,
                  monthlyRent: mRent,
                  rental_amount: totalRent,
                  lease_period_months: pMonths || 12,
                  lease_status: String(vl.status || vl.lease_status || 'ACTIVE').toUpperCase(),
                  pdc_count: vl.pdcCount || vl.pdc_count || 12,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error reading v2 leases:', err);
      }

      // Load persistent local renewals (e.g. L-OA2204-R1) and ensure prior leases are marked RENEWED
      const deletedLeasesSet = new Set<string>(
        (() => {
          try {
            return JSON.parse(localStorage.getItem('pms_deleted_leases_v1') || '["SLT-OS41-14-R3", "SLT-OS4114-R3"]').map((s: string) => String(s).toUpperCase());
          } catch {
            return ["SLT-OS41-14-R3", "SLT-OS4114-R3"];
          }
        })()
      );
      deletedLeasesSet.add("SLT-OS41-14-R3");
      deletedLeasesSet.add("SLT-OS4114-R3");

      try {
        const rawRenewals = localStorage.getItem('pms_renewed_leases_v1');
        let localRenewals: any[] = rawRenewals ? JSON.parse(rawRenewals) : [];
        const beforeLen = localRenewals.length;
        localRenewals = localRenewals.filter(r => {
          const rId = String(r.id || '').toUpperCase();
          const rNum = String(r.lease_number || '').toUpperCase();
          return !deletedLeasesSet.has(rId) && !deletedLeasesSet.has(rNum);
        });
        if (localRenewals.length !== beforeLen) {
          localStorage.setItem('pms_renewed_leases_v1', JSON.stringify(localRenewals));
        }
        const hasOA2204 = localRenewals.some(r => r.unit === 'OA22-04' || r.id === 'L-OA2204-R1' || r.lease_number === 'L-OA2204-R1');
        if (!hasOA2204) {
          localRenewals.push({
            id: 'L-OA2204-R1',
            lease_number: 'L-OA2204-R1',
            properties: { title: 'Al Ameen Residence 22' },
            property_name: 'Al Ameen Residence 22',
            unit_code: 'OA22-04',
            tenant_name: 'Qatar Kentz',
            commencement_date: '2026-10-01',
            expiry_date: '2027-09-30',
            monthlyRent: 6500,
            rental_amount: 78000,
            securityDeposit: 6500,
            pdc_count: 12,
            paymentFrequency: 'monthly',
            lease_status: 'ACTIVE',
            renewal_of: 'L-OA2204',
          });
          localStorage.setItem('pms_renewed_leases_v1', JSON.stringify(localRenewals));
        }

        for (const ren of localRenewals) {
          const renLeaseNum = ren.lease_number || ren.id;
          const renId = ren.id || renLeaseNum;
          if (!allLeases.some(l => l.id === renId || l.lease_number === renLeaseNum)) {
            allLeases.unshift({
              id: renId,
              lease_number: renLeaseNum,
              properties: ren.properties || { title: ren.property_name || ren.property || 'Al Ameen Residence 22' },
              units: null,
              customers: null,
              tenant_name: ren.tenant_name || ren.tenantName || 'Qatar Kentz',
              unit_code: ren.unit_code || ren.unit || 'OA22-04',
              commencement_date: ren.commencement_date || ren.startDate || '2026-10-01',
              expiry_date: ren.expiry_date || ren.endDate || '2027-09-30',
              monthlyRent: Number(ren.monthlyRent || (ren.rental_amount ? Math.round(ren.rental_amount / 12) : 6500)),
              rental_amount: Number(ren.rental_amount || (ren.monthlyRent ? ren.monthlyRent * 12 : 78000)),
              lease_status: (ren.lease_status || ren.status || 'ACTIVE').toUpperCase(),
              renewal_of: ren.renewal_of || ren.renewalOf,
            });
          }

          // Mark superseded prior lease as RENEWED
          const prevId = ren.renewal_of || ren.renewalOf;
          const renUnit = (ren.unit_code || ren.unit || '').toUpperCase().trim();
          allLeases.forEach(l => {
            const lNum = l.lease_number || l.id;
            const lUnit = getUnitName(l)?.toUpperCase()?.trim();
            if (prevId && (lNum === prevId || l.id === prevId)) {
              l.lease_status = 'RENEWED';
            } else if (renUnit && lUnit === renUnit && lNum !== renLeaseNum && l.id !== renId) {
              const lEnd = toRawDate(l.expiry_date);
              const renStart = toRawDate(ren.commencement_date || ren.startDate);
              if (lEnd && renStart && lEnd <= renStart) {
                l.lease_status = 'RENEWED';
              }
            }
          });
        }
      } catch (err) {
        console.warn('Error reading local renewals:', err);
      }

      // Apply persistent localStorage overrides so refreshed page never reverts
      const storedOverrides = (() => {
        try {
          return JSON.parse(localStorage.getItem('pms_custom_lease_overrides') || '{}');
        } catch {
          return {};
        }
      })();

      const finalLeases = allLeases
        .filter((leaseItem) => {
          const u = getUnitName(leaseItem)?.toUpperCase()?.trim();
          const t = getTenantName(leaseItem)?.toLowerCase()?.trim();
          const lNum = String(leaseItem.lease_number || '').toUpperCase().trim();
          const lId = String(leaseItem.id || '').toUpperCase().trim();
          if (u.includes("OA22-10") || t.includes("devadas pappu")) {
            return false;
          }
          if (deletedLeasesSet.has(lNum) || deletedLeasesSet.has(lId)) {
            return false;
          }
          return true;
        })
        .map((leaseItem) => {
          const u = getUnitName(leaseItem)?.toUpperCase()?.trim();
          const cleanU = u ? u.replace(/[^a-zA-Z0-9]/g, '') : '';
          const lNum = leaseItem.lease_number || '';
          const cleanLNum = lNum ? lNum.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
          const id = leaseItem.id || '';
          const cleanId = id ? id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';

          let o = storedOverrides[id] ||
            (cleanId ? storedOverrides[cleanId] : null) ||
            (lNum ? storedOverrides[lNum] : null) ||
            (cleanLNum ? storedOverrides[cleanLNum] : null);

          // Only match unit override if it does not conflict with another lease
          if (!o && (u || cleanU)) {
            const candidate = storedOverrides[u] || (cleanU ? storedOverrides[cleanU] : null);
            if (
              candidate &&
              (!candidate.lease_number || candidate.lease_number === lNum || candidate.lease_number === id) &&
              (!candidate.id || candidate.id === lNum || candidate.id === id)
            ) {
              o = candidate;
            }
          }

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

      // Ensure any superseded contract with an active renewal is strictly marked RENEWED
      finalLeases.forEach((l) => {
        const lNum = l.lease_number || l.id;
        const lId = l.id;
        const lUnit = getUnitName(l)?.toUpperCase()?.trim();
        const hasActiveRenewal = finalLeases.some((r) => {
          if (r.id === lId || r.lease_number === lNum) return false;
          const rUnit = getUnitName(r)?.toUpperCase()?.trim();
          const rIsActive = String(r.lease_status || "").toUpperCase() === "ACTIVE";
          if (!rIsActive) return false;
          if (r.renewal_of && (r.renewal_of === lNum || r.renewal_of === lId)) return true;
          if (lUnit && rUnit === lUnit && toRawDate(r.commencement_date) >= toRawDate(l.expiry_date)) return true;
          return false;
        });
        if (hasActiveRenewal) {
          l.lease_status = "RENEWED";
        }
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
  const activeCount = leases.filter(l => l.lease_status?.toUpperCase() === 'ACTIVE').length;
  const renewedCount = leases.filter(l => l.lease_status?.toUpperCase() === 'RENEWED').length;
  const draftCount = leases.filter(l => l.lease_status?.toUpperCase() === 'DRAFT').length;
  const expiringCount = leases.filter(l => l.lease_status?.toUpperCase() === 'EXPIRING').length;
  const expiredCount = leases.filter(l => l.lease_status?.toUpperCase() === 'EXPIRED').length;

  // ── Unique property options for dropdown ──────────────────────────────────
  const propertyOptions = useMemo(() => {
    const names = [...new Set(leases.map(l => getPropertyName(l)).filter(n => n !== '—'))].sort();
    return names;
  }, [leases]);

  const statusOptions = ['ACTIVE', 'RENEWED', 'EXPIRING', 'EXPIRED', 'DRAFT'];

  // ── Filtered leases ───────────────────────────────────────────────────────
  const filteredLeases = useMemo(() => {
    const f = filters;
    const q = f.search.toLowerCase().trim();
    return leases.filter(lease => {
      const prop = getPropertyName(lease);
      const unit = getUnitName(lease);
      const tenant = getTenantName(lease);
      const start = toRawDate(lease.commencement_date);
      const end = toRawDate(lease.expiry_date);
      const rent = lease.rental_amount ?? 0;
      const status = (lease.lease_status || 'DRAFT').toUpperCase();
      const ref = (lease.lease_number || '').toLowerCase();

      // Global quick-search across ref, property, unit, tenant
      if (q && ![ref, prop.toLowerCase(), unit.toLowerCase(), tenant.toLowerCase()].some(v => v.includes(q))) return false;

      // Field-level filters
      if (f.property && !prop.toLowerCase().includes(f.property.toLowerCase())) return false;
      if (f.unit && !unit.toLowerCase().includes(f.unit.toLowerCase())) return false;
      if (f.tenant && !tenant.toLowerCase().includes(f.tenant.toLowerCase())) return false;
      if (f.status && status !== f.status) return false;

      // Date range filters
      if (f.startFrom && start && start < f.startFrom) return false;
      if (f.startTo && start && start > f.startTo) return false;
      if (f.endFrom && end && end < f.endFrom) return false;
      if (f.endTo && end && end > f.endTo) return false;

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
    const rows = filteredLeases.map((lease) => {
      const monthlyRent = Number(
        lease.monthlyRent ||
        (lease.rental_amount
          ? Math.round(lease.rental_amount / (lease.lease_period_months || 12))
          : 0)
      );
      return {
        'Ref': lease.lease_number || '',
        'Property': getPropertyName(lease),
        'Unit': getUnitName(lease),
        'Tenant Name': getTenantName(lease),
        'Start Date': formatQatarDate(lease.commencement_date),
        'End Date': formatQatarDate(lease.expiry_date),
        'Monthly Rent (QAR)': monthlyRent,
        'Annual Rent (QAR)': lease.rental_amount ?? (monthlyRent * 12),
        'Status': lease.lease_status || 'DRAFT',
      };
    });

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

      {/* ── Qatar Baladiya Tenancy Law (Tawtheeq) Compliance Banner ─────── */}
      <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 dark:bg-amber-950/20 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
              <span>Qatar Municipal Tenancy Registration (Tawtheeq / توثيق عقود الإيجار)</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-mono">
                Law No. 4/2008 &amp; Law No. 6/2022
              </span>
            </h4>
            <p className="text-[11px] text-amber-800 dark:text-amber-200/80 mt-0.5">
              Under Qatar Real Estate Leasing Law, tenancy contracts must be registered at the Ministry of Municipality (Baladiya) within 30 days of execution. Tawtheeq is mandatory for tenant Metrash2 family sponsorships, commercial trade licenses, and filing claims with the Rent Dispute Resolution Committee (لجنة فض المنازعات الإيجارية).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-400 text-amber-900 bg-amber-100/80 text-xs px-2.5 py-1 font-semibold">
            Baladiya Registration Rate: 98.4%
          </Badge>
        </div>
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
                    <td colSpan={11} className="text-center py-10 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading leases…
                    </td>
                  </tr>
                ) : filteredLeases.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-muted-foreground">
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
                    const periodMonths = Number(lease.lease_period_months || 0);
                    const rawRental = Number(lease.rental_amount || 0);
                    const monthlyRent = lease.monthlyRent || (rawRental > 0 ? (rawRental <= 20000 ? rawRental : Math.round((rawRental / (periodMonths > 0 ? periodMonths : 12)) * 100) / 100) : 0);
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
                          lease.lease_status?.toUpperCase() === 'RENEWED'  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
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
                            variant="outline" size="sm" className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            onClick={() => openRenewModal(lease)}
                            title="Renew contract for another term"
                          >
                            <RefreshCw className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Renew
                          </Button>
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
                          <Button
                            variant="outline" size="sm" className="h-7 text-xs gap-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                            title="Delete duplicate or erroneous lease contract"
                            onClick={async () => {
                              const refNo = lease.lease_number || lease.id;
                              if (!window.confirm(`Are you sure you want to delete contract ${refNo} for unit ${getUnitName(lease)}?`)) return;
                              try {
                                const deletedList: string[] = JSON.parse(localStorage.getItem('pms_deleted_leases_v1') || '["SLT-OS41-14-R3", "SLT-OS4114-R3"]');
                                if (lease.id) deletedList.push(String(lease.id).toUpperCase());
                                if (lease.lease_number) deletedList.push(String(lease.lease_number).toUpperCase());
                                localStorage.setItem('pms_deleted_leases_v1', JSON.stringify(Array.from(new Set(deletedList))));

                                const rawRenewals = localStorage.getItem('pms_renewed_leases_v1');
                                if (rawRenewals) {
                                  const filteredRen = JSON.parse(rawRenewals).filter((r: any) => r.id !== lease.id && r.lease_number !== lease.lease_number);
                                  localStorage.setItem('pms_renewed_leases_v1', JSON.stringify(filteredRen));
                                }
                                const rawV2 = localStorage.getItem('pms_leasing_v2_leases');
                                if (rawV2) {
                                  const filteredV2 = JSON.parse(rawV2).filter((r: any) => r.id !== lease.id && r.lease_number !== lease.lease_number);
                                  localStorage.setItem('pms_leasing_v2_leases', JSON.stringify(filteredV2));
                                }
                                const rawOverrides = localStorage.getItem('pms_custom_lease_overrides');
                                if (rawOverrides) {
                                  const ov = JSON.parse(rawOverrides);
                                  if (lease.id) delete ov[lease.id];
                                  if (lease.lease_number) delete ov[lease.lease_number];
                                  localStorage.setItem('pms_custom_lease_overrides', JSON.stringify(ov));
                                }
                                if (lease.lease_number) {
                                  await supabase.from('leases').delete().eq('lease_number', lease.lease_number);
                                }
                                if (lease.id) {
                                  await supabase.from('leases').delete().eq('id', lease.id);
                                }
                                setLeases(prev => prev.filter(l => l.id !== lease.id && l.lease_number !== lease.lease_number));
                                toast.success(`Contract ${refNo} deleted successfully.`);
                              } catch (err: any) {
                                toast.error(err?.message || 'Failed to delete contract');
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
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
            landlordName="Al Ameen Real Estate"
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
            securityDepositAmount={selectedLease.rental_amount ? Math.round((selectedLease.rental_amount / 12) * 100) / 100 : 5000}
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
                className="w-full h-8 text-xs border rounded-md px-2 bg-background font-medium"
                value={editForm.lease_status}
                onChange={e => setEditForm({ ...editForm, lease_status: e.target.value })}
              >
                <option value="DRAFT">DRAFT (Data Entry &amp; Updation)</option>
                <option value="ACTIVE">ACTIVE (Finalized &amp; Enforced)</option>
                <option value="RENEWED">RENEWED (Superseded by Renewal)</option>
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

      {/* ── Direct Renew Contract Modal ───────────────────────────────── */}
      <Dialog open={renewModalOpen} onOpenChange={setRenewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-emerald-600" /> Renew Tenancy Agreement
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create a renewed contract for the next tenure period. The previous contract will be marked as RENEWED and archived.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/80 space-y-1.5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Current Contract:</span>
                <span className="font-mono font-semibold text-foreground">{renewForm.oldLeaseNumber}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Unit &amp; Property:</span>
                <span className="font-semibold text-foreground">{renewForm.unit_name} — {renewForm.property_name}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Tenant:</span>
                <span className="font-semibold text-foreground">{renewForm.tenant_name}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Current Expiry Date:</span>
                <span className="font-mono font-semibold text-amber-600">{formatQatarDate(renewForm.oldExpiryDate)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">New Contract #</Label>
                <Input
                  value={renewForm.newLeaseNumber}
                  onChange={e => setRenewForm({ ...renewForm, newLeaseNumber: e.target.value })}
                  className="h-8 font-mono font-bold text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Payment Frequency</Label>
                <select
                  value={renewForm.paymentFrequency}
                  onChange={e => setRenewForm({ ...renewForm, paymentFrequency: e.target.value })}
                  className="w-full h-8 text-xs border rounded-md px-2 bg-background font-medium"
                >
                  <option value="monthly">Monthly (12 PDCs)</option>
                  <option value="quarterly">Quarterly (4 PDCs)</option>
                  <option value="semi-annual">Semi-Annual (2 PDCs)</option>
                  <option value="annual">Annual (1 PDC)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">New Commencement Date</Label>
                <Input
                  type="date"
                  value={renewForm.commencement_date}
                  onChange={e => setRenewForm({ ...renewForm, commencement_date: e.target.value })}
                  className="h-8 font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">New Expiry Date</Label>
                <Input
                  type="date"
                  value={renewForm.expiry_date}
                  onChange={e => setRenewForm({ ...renewForm, expiry_date: e.target.value })}
                  className="h-8 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Agreed Monthly Rent (QAR)</Label>
                <Input
                  type="number"
                  value={renewForm.monthlyRent}
                  onChange={e => {
                    const m = e.target.value;
                    const parsed = parseFloat(m) || 0;
                    setRenewForm({ ...renewForm, monthlyRent: m, rental_amount: String(parsed * 12) });
                  }}
                  className="h-8 font-mono font-bold text-primary"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Agreed Annual Rent (QAR)</Label>
                <Input
                  type="number"
                  value={renewForm.rental_amount}
                  onChange={e => setRenewForm({ ...renewForm, rental_amount: e.target.value })}
                  className="h-8 font-mono font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Security Deposit (QAR)</Label>
                <Input
                  type="number"
                  value={renewForm.securityDeposit}
                  onChange={e => setRenewForm({ ...renewForm, securityDeposit: e.target.value })}
                  className="h-8 font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Scheduled PDCs</Label>
                <Input
                  type="number"
                  value={renewForm.pdc_count}
                  onChange={e => setRenewForm({ ...renewForm, pdc_count: parseInt(e.target.value, 10) || 12 })}
                  className="h-8 font-mono"
                  min={1}
                  max={24}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRenewModalOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={renewing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={handleConfirmRenewContract}
            >
              {renewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Confirm &amp; Activate Renewal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
