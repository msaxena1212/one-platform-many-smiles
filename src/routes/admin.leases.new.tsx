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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      // 2. Create the lease attached to the customer
      const { error: leaseError } = await supabase
        .from('leases')
        .insert({
          customer_id: customerData.id,
          property_id: formData.propertyId,
          unit_id: formData.unitId,
          lease_number: formData.leaseNumber,
          commencement_date: formData.startDate,
          expiry_date: formData.endDate,
          lease_period_months: 12, // simplified
          rental_amount: Number(formData.rentalAmount),
          security_deposit: Number(formData.securityDeposit),
          lease_status: 'DRAFT',
          payment_frequency: 'Monthly',
        });

      if (leaseError) throw leaseError;

      toast.success("Lease draft created successfully!");
      navigate({ to: "/admin/leases" });
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
                  <Label htmlFor="securityDeposit">Security Deposit (SAR)</Label>
                  <Input id="securityDeposit" name="securityDeposit" type="number" value={formData.securityDeposit} onChange={handleChange} />
                </div>
              </div>
            </div>

          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border pt-6">
          <Button variant="outline" onClick={() => navigate({ to: "/admin/leases" })} disabled={loading}>
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
