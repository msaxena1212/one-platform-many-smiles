import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  CreditCard,
  HeartHandshake,
  Shield,
  Save,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { HrmsMastersApi, MasterItem } from "@/lib/hrmsMastersService";
import { HrmsApi } from "@/lib/hrmsService";

export interface EmployeeOnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  employeeToEdit?: any | null;
}

export function EmployeeOnboardingWizard({
  open,
  onOpenChange,
  onSuccess,
  employeeToEdit
}: EmployeeOnboardingWizardProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [saving, setSaving] = useState<boolean>(false);

  // Master lists
  const [departments, setDepartments] = useState<MasterItem[]>([]);
  const [designations, setDesignations] = useState<MasterItem[]>([]);

  // Form State strictly mirroring the 31 columns of Excel Master
  const [form, setForm] = useState({
    // Section 1: Identification & Personal Info
    employee_id_code: "",
    employee_name: "",
    gender: "Male",
    nationality: "India",
    date_of_birth: "",
    mobile_number: "",
    email: "",

    // Section 2: Employment & Department
    department: "",
    department_id: "",
    designation: "",
    designation_id: "",
    reporting_manager: "",
    date_of_joining: new Date().toISOString().split("T")[0],
    employment_type: "Full-Time",
    employee_status: "Active",

    // Section 3: Identity Documents
    qid_passport_no: "",
    id_expiry_date: "",

    // Section 4: Compensation & Banking
    basic_salary: 0,
    hra: 0,
    tra: 0,
    other_allowances: 0,
    bank_name: "Commercial Bank",
    iban: "",

    // Section 5: Benefits & Allowances
    benefit_telephone: "Provided By Company",
    benefit_accommodation: "Provided By Company",
    benefit_vehicle: "Provided By Company",
    air_ticket: "Yearly",
    air_ticket_fare_cap: 0,

    // Section 6: Emergency & Remarks
    emergency_contact_name: "",
    relation_with_employee: "",
    emergency_contact_no: "",
    remarks: ""
  });

  // Load master departments and designations
  useEffect(() => {
    async function loadMasters() {
      try {
        const masters = await HrmsMastersApi.getEmployeeCreationMasters();
        setDepartments(masters.departments || []);
        setDesignations(masters.designations || []);
      } catch (e) {
        console.error("Error loading masters for employee form:", e);
      }
    }
    if (open) {
      loadMasters();
      if (!employeeToEdit) {
        HrmsMastersApi.generateNextEmployeeId("EMP").then((code) => {
          setForm((prev) => ({ ...prev, employee_id_code: code }));
        });
      }
    }
  }, [open, employeeToEdit]);

  // Populate form if editing
  useEffect(() => {
    if (employeeToEdit && open) {
      const fullName = employeeToEdit.first_name 
        ? `${employeeToEdit.first_name} ${employeeToEdit.last_name || ""}`.trim()
        : (employeeToEdit.employee_name || "");

      let extra: Record<string, any> = {};
      try {
        if (employeeToEdit.notes) {
          extra = typeof employeeToEdit.notes === "string" ? JSON.parse(employeeToEdit.notes) : employeeToEdit.notes;
        }
      } catch {}

      setForm({
        employee_id_code: employeeToEdit.employee_id_code || "",
        employee_name: fullName,
        gender: employeeToEdit.gender || "Male",
        nationality: employeeToEdit.nationality || "India",
        date_of_birth: employeeToEdit.date_of_birth ? String(employeeToEdit.date_of_birth).slice(0, 10) : "",
        mobile_number: employeeToEdit.mobile_number || "",
        email: employeeToEdit.email || "",

        department: employeeToEdit.departments?.name || "",
        department_id: employeeToEdit.department_id || "",
        designation: employeeToEdit.designations?.title || "",
        designation_id: employeeToEdit.designation_id || "",
        reporting_manager: employeeToEdit.reporting_manager || extra.reporting_manager || extra.basic_extra?.reporting_manager || "",
        date_of_joining: employeeToEdit.date_of_joining ? String(employeeToEdit.date_of_joining).slice(0, 10) : new Date().toISOString().split("T")[0],
        employment_type: employeeToEdit.employment_type || extra.employment_type || "Full-Time",
        employee_status: employeeToEdit.employee_status || "Active",

        qid_passport_no: employeeToEdit.qid_passport_no || extra.qid_passport_no || extra.personal_extra?.passport_number || "",
        id_expiry_date: employeeToEdit.id_expiry_date ? String(employeeToEdit.id_expiry_date).slice(0, 10) : (extra.id_expiry_date || ""),

        basic_salary: Number(employeeToEdit.basic_salary || 0),
        hra: Number(employeeToEdit.hra || 0),
        tra: Number(employeeToEdit.tra || 0),
        other_allowances: Number(employeeToEdit.other_allowances || extra.other_allowances || 0),
        bank_name: employeeToEdit.bank_name || "Commercial Bank",
        iban: employeeToEdit.iban || "",

        benefit_telephone: employeeToEdit.benefit_telephone || extra.benefit_telephone || "Provided By Company",
        benefit_accommodation: employeeToEdit.benefit_accommodation || extra.benefit_accommodation || "Provided By Company",
        benefit_vehicle: employeeToEdit.benefit_vehicle || extra.benefit_vehicle || "Provided By Company",
        air_ticket: employeeToEdit.air_ticket || extra.air_ticket || "Yearly",
        air_ticket_fare_cap: Number(employeeToEdit.air_ticket_fare_cap || extra.air_ticket_fare_cap || 0),

        emergency_contact_name: employeeToEdit.emergency_contact_name || extra.emergency_contact_name || "",
        relation_with_employee: employeeToEdit.emergency_contact_relation || extra.relation_with_employee || "",
        emergency_contact_no: employeeToEdit.emergency_contact_number || extra.emergency_contact_no || "",
        remarks: employeeToEdit.remarks || extra.remarks || ""
      });
    } else if (!employeeToEdit && open) {
      setForm({
        employee_id_code: "",
        employee_name: "",
        gender: "Male",
        nationality: "India",
        date_of_birth: "",
        mobile_number: "",
        email: "",
        department: "",
        department_id: "",
        designation: "",
        designation_id: "",
        reporting_manager: "",
        date_of_joining: new Date().toISOString().split("T")[0],
        employment_type: "Full-Time",
        employee_status: "Active",
        qid_passport_no: "",
        id_expiry_date: "",
        basic_salary: 0,
        hra: 0,
        tra: 0,
        other_allowances: 0,
        bank_name: "Commercial Bank",
        iban: "",
        benefit_telephone: "Provided By Company",
        benefit_accommodation: "Provided By Company",
        benefit_vehicle: "Provided By Company",
        air_ticket: "Yearly",
        air_ticket_fare_cap: 0,
        emergency_contact_name: "",
        relation_with_employee: "",
        emergency_contact_no: "",
        remarks: ""
      });
    }
  }, [employeeToEdit, open]);

  // Computed Total Salary
  const totalSalary = Number(form.basic_salary || 0) + Number(form.hra || 0) + Number(form.tra || 0) + Number(form.other_allowances || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_name.trim()) {
      toast.error("Employee Name is required");
      return;
    }

    setSaving(true);
    try {
      const parts = form.employee_name.trim().split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");

      const payload = {
        employee_id_code: form.employee_id_code.trim() || `EMP-${Date.now().toString().slice(-4)}`,
        first_name: firstName,
        last_name: lastName,
        gender: form.gender,
        nationality: form.nationality,
        date_of_birth: form.date_of_birth || null,
        mobile_number: form.mobile_number,
        email: form.email,
        department_id: form.department_id || null,
        designation_id: form.designation_id || null,
        date_of_joining: form.date_of_joining || new Date().toISOString().split("T")[0],
        employment_type: form.employment_type,
        employee_status: form.employee_status,
        qid_passport_no: form.qid_passport_no,
        id_expiry_date: form.id_expiry_date || null,
        basic_salary: Number(form.basic_salary || 0),
        hra: Number(form.hra || 0),
        tra: Number(form.tra || 0),
        other_allowances: Number(form.other_allowances || 0),
        bank_name: form.bank_name,
        iban: form.iban,
        air_ticket: form.air_ticket,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_relation: form.relation_with_employee,
        emergency_contact_number: form.emergency_contact_no,
        remarks: form.remarks,
        notes: JSON.stringify({
          reporting_manager: form.reporting_manager,
          benefit_telephone: form.benefit_telephone,
          benefit_accommodation: form.benefit_accommodation,
          benefit_vehicle: form.benefit_vehicle,
          air_ticket: form.air_ticket,
          air_ticket_fare_cap: form.air_ticket_fare_cap,
          total_salary: totalSalary
        })
      };

      if (employeeToEdit?.id) {
        const { error } = await HrmsApi.updateEmployee(employeeToEdit.id, payload);
        if (error) throw error;
        toast.success("Employee record updated successfully!");
      } else {
        const { error } = await HrmsApi.createEmployee(payload);
        if (error) throw error;
        toast.success("Employee registered successfully!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Save employee error:", err);
      toast.error("Failed to save employee: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {employeeToEdit ? "Edit Employee Profile" : "Add New Employee"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Standard Employee Master (31 columns matching the master Excel template)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="personal" className="text-xs">
                <User className="h-3.5 w-3.5 mr-1.5" /> Personal & Role
              </TabsTrigger>
              <TabsTrigger value="compensation" className="text-xs">
                <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Salary & Benefits
              </TabsTrigger>
              <TabsTrigger value="emergency" className="text-xs">
                <HeartHandshake className="h-3.5 w-3.5 mr-1.5" /> Emergency & ID
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Personal & Employment */}
            <TabsContent value="personal" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Employee ID</Label>
                  <Input
                    placeholder="EMP-001"
                    className="mt-1 text-xs font-mono font-bold"
                    value={form.employee_id_code}
                    onChange={(e) => setForm({ ...form, employee_id_code: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold">Employee Name *</Label>
                  <Input
                    placeholder="Full Name (e.g. Jithin Abdul Latheef)"
                    required
                    className="mt-1 text-xs"
                    value={form.employee_name}
                    onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Gender</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(val) => setForm({ ...form, gender: val })}
                  >
                    <SelectTrigger className="mt-1 text-xs">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Nationality</Label>
                  <Input
                    placeholder="India, Qatar, Sri Lanka, etc."
                    className="mt-1 text-xs"
                    value={form.nationality}
                    onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Date of Birth</Label>
                  <Input
                    type="date"
                    className="mt-1 text-xs"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Mobile Number</Label>
                  <Input
                    placeholder="e.g. 74053716"
                    className="mt-1 text-xs"
                    value={form.mobile_number}
                    onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Email</Label>
                  <Input
                    type="email"
                    placeholder="employee@company.qa"
                    className="mt-1 text-xs"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Department</Label>
                    <Select
                      value={form.department_id}
                      onValueChange={(val) => {
                        const d = departments.find((x) => x.id === val);
                        setForm({
                          ...form,
                          department_id: val,
                          department: d ? d.name : form.department
                        });
                      }}
                    >
                      <SelectTrigger className="mt-1 text-xs bg-background">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Designation</Label>
                    <Select
                      value={form.designation_id}
                      onValueChange={(val) => {
                        const dg = designations.find((x) => x.id === val);
                        setForm({
                          ...form,
                          designation_id: val,
                          designation: dg ? dg.name : form.designation
                        });
                      }}
                    >
                      <SelectTrigger className="mt-1 text-xs bg-background">
                        <SelectValue placeholder="Select Designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((dg) => (
                          <SelectItem key={dg.id} value={dg.id}>
                            {dg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Reporting Manager</Label>
                    <Input
                      placeholder="e.g. General Manager / Director"
                      className="mt-1 text-xs bg-background"
                      value={form.reporting_manager}
                      onChange={(e) => setForm({ ...form, reporting_manager: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Date of Joining</Label>
                    <Input
                      type="date"
                      className="mt-1 text-xs bg-background"
                      value={form.date_of_joining}
                      onChange={(e) => setForm({ ...form, date_of_joining: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Employment Type</Label>
                    <Select
                      value={form.employment_type}
                      onValueChange={(val) => setForm({ ...form, employment_type: val })}
                    >
                      <SelectTrigger className="mt-1 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Probation">Probation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Employee Status</Label>
                  <Select
                    value={form.employee_status}
                    onValueChange={(val) => setForm({ ...form, employee_status: val })}
                  >
                    <SelectTrigger className="mt-1 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="On Notice">On Notice</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                      <SelectItem value="Resigned">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Compensation & Benefits */}
            <TabsContent value="compensation" className="space-y-4 pt-3">
              <div className="p-3 bg-muted/40 rounded-xl border space-y-3">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Salary Structure (QAR)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Basic Salary</Label>
                    <Input
                      type="number"
                      className="mt-1 text-xs bg-background"
                      value={form.basic_salary}
                      onChange={(e) => setForm({ ...form, basic_salary: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">HRA</Label>
                    <Input
                      type="number"
                      className="mt-1 text-xs bg-background"
                      value={form.hra}
                      onChange={(e) => setForm({ ...form, hra: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">TRA</Label>
                    <Input
                      type="number"
                      className="mt-1 text-xs bg-background"
                      value={form.tra}
                      onChange={(e) => setForm({ ...form, tra: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Other Allowances</Label>
                    <Input
                      type="number"
                      className="mt-1 text-xs bg-background"
                      value={form.other_allowances}
                      onChange={(e) => setForm({ ...form, other_allowances: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Total Monthly Salary (Auto-Calculated):</span>
                  <span className="font-bold text-base font-mono text-emerald-600 dark:text-emerald-400">
                    {totalSalary.toLocaleString()} QAR
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Other Benefit (Telephone)</Label>
                  <Input
                    placeholder="Provided By Company / None"
                    className="mt-1 text-xs"
                    value={form.benefit_telephone}
                    onChange={(e) => setForm({ ...form, benefit_telephone: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Other Benefit (Accommodation)</Label>
                  <Input
                    placeholder="Provided By Company / None"
                    className="mt-1 text-xs"
                    value={form.benefit_accommodation}
                    onChange={(e) => setForm({ ...form, benefit_accommodation: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Other Benefit (Vehicle)</Label>
                  <Input
                    placeholder="Provided By Company / None"
                    className="mt-1 text-xs"
                    value={form.benefit_vehicle}
                    onChange={(e) => setForm({ ...form, benefit_vehicle: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Air Ticket Frequency</Label>
                  <Select
                    value={form.air_ticket}
                    onValueChange={(val) => setForm({ ...form, air_ticket: val })}
                  >
                    <SelectTrigger className="mt-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                      <SelectItem value="2 Years">2 Years</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Air Ticket Fare CAP (QAR)</Label>
                  <Input
                    type="number"
                    placeholder="2500"
                    className="mt-1 text-xs"
                    value={form.air_ticket_fare_cap}
                    onChange={(e) => setForm({ ...form, air_ticket_fare_cap: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Bank Name</Label>
                  <Input
                    placeholder="Commercial Bank / QNB"
                    className="mt-1 text-xs"
                    value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">IBAN</Label>
                  <Input
                    placeholder="QA00CBQA000000000000000000000"
                    className="mt-1 text-xs font-mono"
                    value={form.iban}
                    onChange={(e) => setForm({ ...form, iban: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Emergency & Identity Documents */}
            <TabsContent value="emergency" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
                <div>
                  <Label className="text-xs font-semibold">QID / Passport No.</Label>
                  <Input
                    placeholder="28835629905"
                    className="mt-1 text-xs font-mono bg-background"
                    value={form.qid_passport_no}
                    onChange={(e) => setForm({ ...form, qid_passport_no: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">ID Expiry Date</Label>
                  <Input
                    type="date"
                    className="mt-1 text-xs bg-background"
                    value={form.id_expiry_date}
                    onChange={(e) => setForm({ ...form, id_expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border space-y-3">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Emergency Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Emergency Contact Name</Label>
                    <Input
                      placeholder="Contact person name"
                      className="mt-1 text-xs bg-background"
                      value={form.emergency_contact_name}
                      onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Relation with Employee</Label>
                    <Input
                      placeholder="Spouse, Father, Brother, etc."
                      className="mt-1 text-xs bg-background"
                      value={form.relation_with_employee}
                      onChange={(e) => setForm({ ...form, relation_with_employee: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Emergency Contact No.</Label>
                    <Input
                      placeholder="Phone number"
                      className="mt-1 text-xs bg-background"
                      value={form.emergency_contact_no}
                      onChange={(e) => setForm({ ...form, emergency_contact_no: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Remarks</Label>
                <Textarea
                  rows={3}
                  placeholder="Additional notes, probation comments or special benefits..."
                  className="mt-1 text-xs"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="gap-1.5 bg-primary text-primary-foreground"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {employeeToEdit ? "Update Employee" : "Save Employee"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}