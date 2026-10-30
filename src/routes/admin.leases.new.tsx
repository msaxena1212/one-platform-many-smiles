import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/leases/new")({
  head: () => ({ meta: [{ title: "New Lease — ZYNO Property Management" }] }),
  component: NewLeaseForm,
});

function NewLeaseForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerMobile: "",
    customerEmail: "",
    propertyId: "00000000-0000-4000-8000-000000000000", // Fallback / mock default for now
    unitId: "00000000-0000-4000-8000-000000000001", // Fallback / mock default for now
    leaseNumber: `L-${Date.now().toString().slice(-6)}`,
    startDate: "",
    endDate: "",
    rentalAmount: "",
    securityDeposit: "",
    hasRentFree: false,
    rentFreeDays: 30,
    rentFreePosition: "FIRST_MONTH",
    pdcCount: 12,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the customer first
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          full_name: formData.customerName,
          mobile_number: formData.customerMobile,
          email_address: formData.customerEmail,
          customer_type: 'Individual'
        })
        .select()
        .single();

      if (customerError) throw customerError;

      const annRent = Number(formData.rentalAmount) || 0;
      const mRent = Math.round(annRent / 12);
      const termMonths = formData.hasRentFree ? 13 : 12;

      // 2. Create the lease attached to the customer
      const { data: leaseData, error: leaseError } = await supabase
        .from('leases')
        .insert({
          customer_id: customerData.id,
          property_id: formData.propertyId,
          unit_id: formData.unitId,
          lease_number: formData.leaseNumber,
          commencement_date: formData.startDate,
          expiry_date: formData.endDate,
          lease_period_months: termMonths,
          rental_amount: annRent,
          security_deposit: Number(formData.securityDeposit) || mRent,
          lease_status: 'DRAFT',
          payment_frequency: 'Monthly',
          number_of_pdc: Number(formData.pdcCount) || 12,
        })
        .select()
        .single();

      if (leaseError) throw leaseError;

      // 3. Persist overrides to browser storage for instant reload hydration
      try {
        const stored = JSON.parse(localStorage.getItem('pms_custom_lease_overrides') || '{}');
        const overridePayload = {
          commencement_date: formData.startDate,
          expiry_date: formData.endDate,
          monthlyRent: mRent,
          rental_amount: annRent,
          lease_status: 'DRAFT',
          tenant_name: formData.customerName,
          has_rent_free: formData.hasRentFree,
          rent_free_days: formData.hasRentFree ? Number(formData.rentFreeDays) : 0,
          rent_free_position: formData.rentFreePosition,
          pdc_count: Number(formData.pdcCount) || 12,
          updated_at: new Date().toISOString(),
        };
        stored[formData.leaseNumber] = overridePayload;
        if (leaseData?.id) {
          stored[leaseData.id] = overridePayload;
        }
        localStorage.setItem('pms_custom_lease_overrides', JSON.stringify(stored));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }

      toast.success(formData.hasRentFree ? "13-Month Concession Lease Draft created successfully!" : "Lease draft created successfully!");
      navigate({ to: "/admin/leases", search: { tab: "agreement" } });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create lease.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Lease Draft</CardTitle>
          <CardDescription>Enter the tenant and lease terms to generate a new draft lease.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="new-lease-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-medium">1. Tenant Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input id="customerName" name="customerName" required value={formData.customerName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerMobile">Mobile Number *</Label>
                  <Input id="customerMobile" name="customerMobile" required value={formData.customerMobile} onChange={handleChange} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input id="customerEmail" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">2. Lease Terms</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaseNumber">Lease Reference *</Label>
                  <Input id="leaseNumber" name="leaseNumber" required value={formData.leaseNumber} onChange={handleChange} />
                </div>
                <div className="col-span-1" />
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Commencement Date *</Label>
                  <Input id="startDate" name="startDate" type="date" required value={formData.startDate} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Expiry Date *</Label>
                  <Input id="endDate" name="endDate" type="date" required value={formData.endDate} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentalAmount">Annual Rent Amount (SAR) *</Label>
                  <Input id="rentalAmount" name="rentalAmount" type="number" required value={formData.rentalAmount} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit">Security Deposit (QAR)</Label>
                  <Input id="securityDeposit" name="securityDeposit" type="number" value={formData.securityDeposit} onChange={handleChange} />
                </div>
              </div>

              {/* 13-Month Rent-Free Concession Section */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-primary">
                      Rent-Free Concession Period (13-Month Contract)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Extend standard 12-month tenure with 1 free concession month (13 months total)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="hasRentFree"
                    checked={formData.hasRentFree}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-primary text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                {formData.hasRentFree && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-primary/10">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Free Concession Days</Label>
                      <Input
                        name="rentFreeDays"
                        type="number"
                        min={1}
                        max={90}
                        value={formData.rentFreeDays}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Free Month Timing</Label>
                      <select
                        name="rentFreePosition"
                        value={formData.rentFreePosition}
                        onChange={handleChange}
                        className="w-full h-9 text-xs border rounded-md px-2 bg-background font-medium"
                      >
                        <option value="FIRST_MONTH">Month 1 Free (Initial Move-in)</option>
                        <option value="LAST_MONTH">Month 13 Free (Completion Incentive)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Number of PDCs</Label>
                      <Input
                        name="pdcCount"
                        type="number"
                        min={1}
                        max={24}
                        value={formData.pdcCount}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-3 text-xs text-primary/90 bg-background/80 p-2 rounded border border-primary/10">
                      ℹ️ <strong>13-Month Term Schedule:</strong> 12 Cheques collected covering 12 paid months. {formData.rentFreePosition === 'FIRST_MONTH' ? 'Month 1 is logged as a Rent-Free Concession (Cheque #1 starts Month 2).' : 'Month 13 is logged as a Rent-Free Concession (Cheques #1-#12 cover Months 1-12).'}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border pt-6">
          <Button variant="outline" onClick={() => navigate({ to: "/admin/leases", search: { tab: "agreement" } })} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="new-lease-form" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Draft Lease
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
