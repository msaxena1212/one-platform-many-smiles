import { Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { Lease } from "@/lib/supabase";
import { useAppData } from "@/lib/app-data-context";
import { Loader2, Search, Filter, RotateCcw, FileText, Download, CheckCircle2 } from "lucide-react";
import { exportToExcel } from "@/lib/excel-export";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { toast } from "sonner";

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
        const { data, error } = await supabase.from('leases').select('*, properties(title, property_code, area_zone, street_building_name)').order('created_at', { ascending: false });
        if (!error && data) dbLeases = data;
      } catch (e) {
        console.error(e);
      }

      // Map context leases to match table structure
      const today90 = new Date();
      today90.setDate(today90.getDate() + 90);

      const mappedContext = (contextLeases || []).map(cl => {
        const rawStatus = (cl.status || '').toLowerCase();
        let status = 'DRAFT';
        if (rawStatus === 'closed' || rawStatus === 'checkout' || rawStatus === 'terminated' || rawStatus === 'vacated') {
          status = 'CLOSED';
        } else if (rawStatus === 'active' || rawStatus === 'fully_signed' || rawStatus === 'collection_completed' || rawStatus === 'leased') {
          if (cl.endDate) {
            const expDate = new Date(cl.endDate);
            if (!isNaN(expDate.getTime()) && expDate <= today90) {
              status = 'EXPIRING';
            } else {
              status = 'ACTIVE';
            }
          } else {
            status = 'ACTIVE';
          }
        } else if (rawStatus === 'renewal_due' || rawStatus === 'expiring') {
          status = 'EXPIRING';
        } else if (rawStatus === 'draft' || rawStatus === 'pending' || rawStatus === 'in_progress') {
          status = 'DRAFT';
        } else if (rawStatus) {
          status = rawStatus.toUpperCase();
        }
        return {
          id: cl.id,
          lease_number: cl.id.toUpperCase().startsWith('L') ? cl.id.toUpperCase() : `LES-${cl.id}`,
          properties: { title: cl.property },
          property_name: cl.property,
          unit: cl.unit,
          tenant_name: cl.tenantName,
          commencement_date: cl.startDate,
          expiry_date: cl.endDate,
          rental_amount: cl.monthlyRent ? cl.monthlyRent * 12 : 60000,
          lease_status: status,
          signedDocument: cl.signedDocument,
          signedDocumentUrl: (cl as any).signedDocumentUrl || (cl as any).signedContractUrl || (cl as any).signed_contract_url,
          contract_file: (cl as any).contract_file,
          monthlyRent: cl.monthlyRent,
          securityDeposit: cl.securityDeposit,
          tenant_qid: (cl as any).tenantQid || (cl as any).qid || (cl as any).qatarId,
          tenant_mobile: (cl as any).tenantMobile || (cl as any).mobile || (cl as any).phone,
          tenant_email: (cl as any).tenantEmail || (cl as any).email,
          tenant_address: (cl as any).tenantAddress || (cl as any).address,
          bedrooms: (cl as any).bedrooms,
          furnishing: (cl as any).furnishing,
        };
      });

      // Normalize DB lease statuses to match the same ACTIVE/DRAFT/EXPIRING/CLOSED scheme
      const normalizedDbLeases = dbLeases.map((l: any) => {
        const rawStatus = (l.lease_status || l.status || "").toLowerCase();
        let normalized: string;
        if (rawStatus === "closed" || rawStatus === "terminated" || rawStatus === "vacated") {
          normalized = "CLOSED";
        } else if (rawStatus === "active" || rawStatus === "fully_signed" || rawStatus === "collection_completed" || rawStatus === "leased") {
          const expiry = l.expiry_date || l.contract_end_date;
          if (expiry) {
            const expDate = new Date(expiry);
            if (!isNaN(expDate.getTime()) && expDate <= today90) {
              normalized = "EXPIRING";
            } else {
              normalized = "ACTIVE";
            }
          } else {
            normalized = "ACTIVE";
          }
        } else if (rawStatus === "renewal_due" || rawStatus === "expiring") {
          normalized = "EXPIRING";
        } else if (rawStatus === "draft" || rawStatus === "pending" || rawStatus === "in_progress") {
          normalized = "DRAFT";
        } else if (rawStatus) {
          normalized = rawStatus.toUpperCase();
        } else {
          normalized = "DRAFT";
        }
        return {
          ...l,
          lease_status: normalized,
          signedDocument: l.signed_document || l.signedDocument || l.contract_file,
          signedDocumentUrl: l.signed_contract_url || l.signed_document_url || l.signedDocumentUrl,
          contract_file: l.contract_file || l.signed_contract_file,
        };
      });

      // Combine both sources
      const allLeases = [...normalizedDbLeases];
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

  const totalPages = Math.max(1, Math.ceil(filteredLeases.length / ITEMS_PER_PAGE));
  const paginatedLeases = filteredLeases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [propertyFilter, unitFilter, customerFilter, statusFilter, searchQuery]);

  const getVisiblePageNumbers = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "ellipsis", total];
    }
    if (current >= total - 2) {
      return [1, "ellipsis", total - 3, total - 2, total - 1, total];
    }
    return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
  };

  const handleDownloadContract = async (lease: any) => {
    // Check if the lease has an uploaded signed contract
    const signedUrl = lease.signedDocumentUrl || lease.signed_contract_url || lease.signed_doc_url;
    const signedFileName = lease.signedDocument || lease.contract_file || lease.signed_document;

    if (signedUrl && (signedUrl.startsWith("http") || signedUrl.startsWith("blob:") || signedUrl.startsWith("data:"))) {
      const a = document.createElement("a");
      a.href = signedUrl;
      a.download = signedFileName || `Signed_Lease_Contract_${lease.lease_number || lease.id}.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading signed lease contract for ${lease.tenant_name || lease.lease_number}`);
      return;
    }

    // Otherwise, generate & download the standard bilingual lease contract (same as the download CTA)
    toast.info(`Generating official bilingual lease contract for ${lease.tenant_name || lease.lease_number}...`);
    try {
      const { printBilingualLeaseContract } = await import('@/lib/qatar-lease-contract');
      printBilingualLeaseContract({
        contractNumber: lease.lease_number || `LC-${lease.id}`,
        agreementDate: lease.commencement_date ? new Date(lease.commencement_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        landlord: {
          companyNameEn: "AL AMEEN REAL ESTATE",
          companyNameAr: "الأمين للعقارات",
          representedByEn: "MR. MOHAMED AMEEN",
          representedByAr: "السيد / محمد أمين",
          poBox: "20722",
          cityEn: "DOHA - QATAR",
          cityAr: "الدوحة - قطر",
          phone: "+974 4444 1234",
        },
        tenant: {
          nameEn: lease.tenant_name || "VALUED TENANT",
          nameAr: lease.tenant_name || "المستأجر المحترم",
          qid: lease.tenant_qid || lease.customer_qid || "28463401234",
          mobile: lease.tenant_mobile || lease.customer_mobile || "+974 5555 1234",
          poBox: lease.tenant_pobox || "Doha, Qatar",
          addressEn: lease.tenant_address || "Doha, State of Qatar",
          addressAr: lease.tenant_address || "الدوحة، دولة قطر",
        },
        property: {
          propertyNameEn: (lease as any).properties?.title || lease.property_name || "Al Ameen Residence",
          propertyNameAr: (lease as any).properties?.title || lease.property_name || "مبنى الأمين السكني",
          unitNumber: lease.unit || "Flat No. 04",
          zone: (lease as any).properties?.area_zone || "90",
          street: (lease as any).properties?.street_building_name || "Al Wukair Street",
          building: (lease as any).properties?.property_code || "Building 12",
          electricityMeterNo: lease.electricity_meter_no || "E-984210",
          waterMeterNo: lease.water_meter_no || "W-541298",
          unitTypeEn: lease.bedrooms ? `${lease.bedrooms} Bedroom Apartment` : "Residential Flat",
          unitTypeAr: lease.bedrooms ? `شقة سكنية ${lease.bedrooms} غرف نوم` : "شقة سكنية",
          furnishingEn: lease.furnishing || "Fully Furnished",
          furnishingAr: lease.furnishing === 'unfurnished' ? "غير مفروشة" : lease.furnishing === 'semi_furnished' ? "نصف مفروشة" : "مفروشة بالكامل",
        },
        financial: {
          monthlyRent: Number(lease.rental_amount) ? Math.round(Number(lease.rental_amount) / 12) : 5000,
          securityDeposit: Math.round(Number(lease.rental_amount || 60000) / 12),
          numberOfCheques: 12,
          startDate: lease.commencement_date ? new Date(lease.commencement_date).toISOString().split('T')[0] : "2026-09-01",
          endDate: lease.expiry_date ? new Date(lease.expiry_date).toISOString().split('T')[0] : "2027-08-31",
          pdcCount: 12,
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate lease contract document.");
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
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
      <Card className="border-border w-full overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base font-semibold">Lease Contracts Registry</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                onClick={() => {
                  exportToExcel(
                    filteredLeases.map((l) => ({
                      "Lease Number": l.lease_number || l.id,
                      "Customer / Tenant": l.tenant_name || "—",
                      "Property": l.properties?.title || l.property_name || "—",
                      "Unit": l.unit || "—",
                      "Commencement Date": l.commencement_date || "—",
                      "Expiry Date": l.expiry_date || "—",
                      "Annual Rent (QAR)": l.rental_amount || 0,
                      "Monthly Rent (QAR)": l.rental_amount ? Math.round(l.rental_amount / 12) : 0,
                      "Status": l.lease_status || "ACTIVE",
                    })),
                    `All_Leases_Export_${new Date().toISOString().split("T")[0]}`
                  );
                }}
              >
                <Download className="h-3.5 w-3.5" /> Export to Excel
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground gap-1" onClick={() => { setPropertyFilter("all"); setUnitFilter("all"); setCustomerFilter("all"); setStatusFilter("all"); setSearchQuery(""); }}>
                <RotateCcw className="h-3 w-3" /> Reset Filters
              </Button>
            </div>
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
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/20">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider whitespace-nowrap">Ref #</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider whitespace-nowrap">Property &amp; Unit</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider whitespace-nowrap">Customer / Tenant</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider whitespace-nowrap">Start Date</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider whitespace-nowrap">End Date</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground uppercase text-[11px] tracking-wider whitespace-nowrap">Annual Rent</th>
                  <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[11px] tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground uppercase text-[11px] tracking-wider whitespace-nowrap">Agreement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                   <tr>
                     <td colSpan={8} className="text-center py-8 text-muted-foreground">
                       <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                       Loading leases...
                     </td>
                   </tr>
                ) : filteredLeases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                      No matching leases found.
                    </td>
                  </tr>
                ) : (
                  paginatedLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-muted/10 transition-colors text-xs">
                      <td className="px-4 py-3 font-mono font-medium text-primary whitespace-nowrap">{lease.lease_number || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{(lease as any).properties?.title || lease.property_name || 'Unknown Property'}</div>
                        {lease.unit && <div className="text-[11px] text-muted-foreground font-mono">Unit: {lease.unit}</div>}
                      </td>
                      <td className="px-4 py-3 font-medium">{lease.tenant_name || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{lease.commencement_date ? new Date(lease.commencement_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{lease.expiry_date ? new Date(lease.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-right whitespace-nowrap">QAR {lease.rental_amount?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                          lease.lease_status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          lease.lease_status?.toUpperCase() === 'EXPIRING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          lease.lease_status?.toUpperCase() === 'CLOSED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {lease.lease_status || 'DRAFT'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs hover:text-primary hover:bg-primary/10 gap-1 border-border"
                          title={lease.signedDocument ? `Download Uploaded Signed Contract (${lease.signedDocument})` : "Download / Print Official Lease Contract"}
                          onClick={() => handleDownloadContract(lease)}
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span>Contract</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-3.5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground bg-muted/10">
              <div>
                Showing <span className="font-semibold text-foreground">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span>–<span className="font-semibold text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLeases.length)}</span> of <span className="font-semibold text-foreground">{filteredLeases.length}</span> leases
              </div>
              <Pagination className="justify-center sm:justify-end w-auto mx-0">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                      className={`h-8 px-2.5 text-xs ${currentPage === 1 ? "pointer-events-none opacity-40" : "hover:bg-muted cursor-pointer"}`}
                    />
                  </PaginationItem>
                  {getVisiblePageNumbers(currentPage, totalPages).map((pNum, idx) => (
                    pNum === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis className="h-8 w-8" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={pNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(Number(pNum)); }}
                          isActive={currentPage === pNum}
                          className="h-8 w-8 text-xs cursor-pointer"
                        >
                          {pNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                      className={`h-8 px-2.5 text-xs ${currentPage === totalPages ? "pointer-events-none opacity-40" : "hover:bg-muted cursor-pointer"}`}
                    />
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
