import { createClient } from "@supabase/supabase-js";

interface GenerateDocRequest {
  documentType: "lease_agreement" | "payment_receipt" | "handover_certificate" | "tax_invoice";
  id: string; // lease_id, receipt_id, or voucher_id
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rnebpqnzignwjeukgztz.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { documentType, id } = (req.method === "POST" ? req.body : req.query) as GenerateDocRequest;

  if (!documentType || !id) {
    return res.status(400).json({ error: "Missing documentType or id parameter" });
  }

  try {
    let documentData: any = null;

    if (documentType === "lease_agreement") {
      const { data: lease, error } = await supabase
        .from("leases")
        .select(`
          *,
          properties:property_id(title, address, city, country, cost_center_code),
          units:unit_id(unit_number, floor, unit_type, rent_amount),
          customers:customer_id(full_name, mobile_number, email_address, qatar_id, passport_number)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error || !lease) {
        return res.status(404).json({ error: "Lease document record not found", details: error?.message });
      }

      documentData = {
        title: `Standard Residential Tenancy Agreement - ${lease.lease_number || lease.id}`,
        leaseNumber: lease.lease_number || lease.id,
        tenant: lease.customers?.full_name || lease.tenant_name || "Tenant",
        tenantId: lease.customers?.qatar_id || lease.customers?.passport_number || "N/A",
        phone: lease.customers?.mobile_number || "N/A",
        property: lease.properties?.title || "Property",
        unit: lease.units?.unit_number || lease.unit_ref || "Unit",
        address: `${lease.properties?.address || ""}, ${lease.properties?.city || "Doha"}, Qatar`,
        commencementDate: lease.commencement_date,
        expiryDate: lease.expiry_date,
        monthlyRent: Number(lease.rental_amount || 0),
        securityDeposit: Number(lease.security_deposit || 0),
        paymentFrequency: lease.payment_frequency || "Monthly",
        gracePeriodDays: lease.grace_period_days || 7,
        status: lease.lease_status || "Active",
        createdAt: lease.created_at,
        terms: [
          "The Tenant shall pay the rent on or before the due date specified in each payment schedule.",
          "The security deposit shall be held by the Landlord and refunded upon vacant possession minus any verified damage deductions.",
          "Subletting the premises without prior written consent from the Landlord is strictly prohibited.",
          "The Tenant shall comply with all Qatar Civil & Real Estate Laws and municipal regulations.",
        ],
      };
    } else if (documentType === "payment_receipt") {
      const { data: receipt, error } = await supabase
        .from("collection_receipts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !receipt) {
        return res.status(404).json({ error: "Receipt document record not found" });
      }

      documentData = {
        title: `Official Payment Receipt - ${receipt.receipt_number}`,
        receiptNumber: receipt.receipt_number,
        receiptDate: receipt.receipt_date,
        amount: Number(receipt.amount),
        currency: "QAR",
        paymentMode: receipt.payment_mode,
        referenceNumber: receipt.reference_number || "N/A",
        status: receipt.status,
        notes: receipt.notes,
        createdAt: receipt.created_at,
      };
    } else {
      documentData = {
        title: `${documentType.replace(/_/g, " ").toUpperCase()} - ${id}`,
        id,
        generatedAt: new Date().toISOString(),
      };
    }

    return res.status(200).json({
      success: true,
      documentType,
      data: documentData,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Document Generation Error", message: error.message });
  }
}
