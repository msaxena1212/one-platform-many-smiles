import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Shield,
  MapPin,
  CreditCard,
  HeartHandshake,
  Eye,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);

  // Masters
  const [masters, setMasters] = useState<{
    companies: MasterItem[];
    branches: MasterItem[];
    entities: MasterItem[];
    businessUnits: MasterItem[];
    departments: MasterItem[];
    subDepartments: MasterItem[];
    designations: MasterItem[];
    grades: MasterItem[];
    employmentTypes: MasterItem[];
    contractTypes: MasterItem[];
    countries: MasterItem[];
    states: MasterItem[];
    cities: MasterItem[];
    banks: MasterItem[];
    genders: MasterItem[];
    employeeStatuses: MasterItem[];
  }>({
    companies: [],
    branches: [],
    entities: [],
    businessUnits: [],
    departments: [],
    subDepartments: [],
    designations: [],
    grades: [],
    employmentTypes: [],
    contractTypes: [],
    countries: [],
    states: [],
    cities: [],
    banks: [],
    genders: [],
    employeeStatuses: [],
  });

  // Step 1: Basic Information
  const [basic, setBasic] = useState({
    title: "Mr",
    employee_id_code: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    entity: "MGT-IN-GUR (PRIMARY)",
    gender: "Male",
    date_of_birth: "1995-01-01",
    work_country: "Qatar",
    work_state: "Doha",
    work_city: "Doha Downtown",
    personal_email: "",
    personal_contact: "",
    reporting_manager: "Admin Director",
    approval_manager: "HR Operations Lead",
    secondary_reporting_manager: "General Manager",
    branches: "Doha Downtown Branch",
    primary_branch: "Doha Downtown Branch",
    department_id: "",
    sub_department_id: "",
    grade: "G3",
    employment_type: "Full-time Permanent",
    date_of_joining: new Date().toISOString().split("T")[0],
    probation_period_months: 6,
    confirmation_date: "",
    esic_applicable: false,
    pension_applicable: true,
    official_email: "",
    official_mobile: "",
    official_extension: "1024",
    designation_id: "",
    business_unit: "Bay View Residences (BVR)",
    employee_status: "Active",
    is_handicapped: false,
    avatar_url: ""
  });

  // Step 2: Personal Details
  const [personal, setPersonal] = useState({
    present_address_line1: "",
    present_address_line2: "",
    present_country: "Qatar",
    present_state: "Doha",
    present_city: "Doha",
    present_pincode: "00000",
    same_as_present: true,
    permanent_address_line1: "",
    permanent_address_line2: "",
    permanent_country: "Qatar",
    permanent_state: "Doha",
    permanent_city: "Doha",
    permanent_pincode: "00000",
    nationality: "Qatari",
    blood_group: "O+",
    passport_number: "",
    passport_expiry: "",
    qid_pan_aadhaar: "",
    driving_license_number: "",
    driving_license_expiry: "",
    visa_number: "",
    visa_expiry: "",
    labour_card_number: "",
    labour_card_expiry: "",
    marital_status: "Single",
    spouse_name: "",
    marriage_anniversary: ""
  });

  const [familyMembers, setFamilyMembers] = useState<
    Array<{
      name: string;
      relationship: string;
      dob: string;
      contact: string;
      is_emergency_contact: boolean;
    }>
  >([
    { name: "", relationship: "Spouse/Parent", dob: "", contact: "", is_emergency_contact: true }
  ]);

  const [pastExperience, setPastExperience] = useState<
    Array<{
      company: string;
      designation: string;
      from_date: string;
      to_date: string;
      last_ctc: string;
      reason_for_leaving: string;
    }>
  >([]);

  // Step 3: Payment Details
  const [payment, setPayment] = useState({
    payroll_attachment: "Main Payroll",
    primary_bank_name: "Qatar National Bank",
    primary_account_no: "",
    primary_account_no_reenter: "",
    primary_ifsc_swift: "QNBAQAQA",
    primary_iban: "",
    primary_account_holder: "",
    secondary_bank_name: "Commercial Bank of Qatar",
    secondary_account_no: "",
    secondary_ifsc_swift: "CBQAQAQA",
    secondary_iban: "",
    basic_salary: 5000,
    hra: 1500,
    tra: 500,
    other_allowances: 0,
    benefit_telephone: "Provided By Company",
    benefit_accommodation: "Provided By Company",
    benefit_vehicle: "Provided By Company",
    air_ticket: "Yearly",
    air_ticket_fare_cap: 2500,
    remarks: ""
  });

  // Step 4: Document Details
  const [documents, setDocuments] = useState<
    Array<{
      id: string;
      doc_type: string;
      doc_number: string;
      file_name: string;
      upload_date: string;
      status: string;
    }>
  >([
    {
      id: "1",
      doc_type: "QID / National ID",
      doc_number: "QID-987654321",
      file_name: "qid_copy_signed.pdf",
      upload_date: new Date().toISOString().split("T")[0],
      status: "Verified"
    },
    {
      id: "2",
      doc_type: "Passport Copy",
      doc_number: "N8765432",
      file_name: "passport_bio.pdf",
      upload_date: new Date().toISOString().split("T")[0],
      status: "Verified"
    }
  ]);

  const [newDoc, setNewDoc] = useState({
    doc_type: "Educational Certificate",
    doc_number: "",
    file_name: ""
  });

  // Step 5: Contract Details
  const [contracts, setContracts] = useState<
    Array<{
      id: string;
      contract_type: string;
      start_date: string;
      end_date: string;
      notice_period_days: number;
      terms_summary: string;
      status: string;
    }>
  >([
    {
      id: "c1",
      contract_type: "Full-time Permanent",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "2028-12-31",
      notice_period_days: 60,
      terms_summary: "Standard Enterprise Employment Contract with Grade G3 Entitlements",
      status: "Active"
    }
  ]);

  const [newContract, setNewContract] = useState({
    contract_type: "Full-time Permanent",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "2028-12-31",
    notice_period_days: 60,
    terms_summary: ""
  });

  // Load master data on mount
  useEffect(() => {
    async function initMasters() {
      const data = await HrmsMastersApi.getEmployeeCreationMasters();
      setMasters(data);
      if (data.departments.length > 0 && !basic.department_id) {
        setBasic((prev) => ({ ...prev, department_id: data.departments[0].id }));
      }
      if (data.designations.length > 0 && !basic.designation_id) {
        setBasic((prev) => ({ ...prev, designation_id: data.designations[0].id }));
      }
    }
    if (open) {
      initMasters();
      if (!employeeToEdit) {
        HrmsMastersApi.generateNextEmployeeId("EMP").then((generatedCode) => {
          setBasic((prev) => ({ ...prev, employee_id_code: generatedCode }));
        });
      }
    }
  }, [open, employeeToEdit]);

  // Handle edit mode hydration
  useEffect(() => {
    if (employeeToEdit && open) {
      setBasic((prev) => ({
        ...prev,
        first_name: employeeToEdit.first_name || "",
        last_name: employeeToEdit.last_name || "",
        employee_id_code: employeeToEdit.employee_id_code || "",
        official_email: employeeToEdit.email || "",
        personal_email: employeeToEdit.email || "",
        official_mobile: employeeToEdit.mobile_number || "",
        department_id: employeeToEdit.department_id || "",
        designation_id: employeeToEdit.designation_id || "",
        gender: employeeToEdit.gender || "Male",
        employee_status: employeeToEdit.employee_status || "Active"
      }));
      setPayment((prev) => ({
        ...prev,
        primary_bank_name: employeeToEdit.bank_name || "Qatar National Bank",
        primary_iban: employeeToEdit.iban || "",
        basic_salary: Number(employeeToEdit.basic_salary || 5000),
        hra: Number(employeeToEdit.hra || 1500),
        tra: Number(employeeToEdit.tra || 500)
      }));
    }
  }, [employeeToEdit, open]);

  const handleAddFamilyMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      { name: "", relationship: "Child", dob: "", contact: "", is_emergency_contact: false }
    ]);
  };

  const handleRemoveFamilyMember = (index: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPastExp = () => {
    setPastExperience((prev) => [
      ...prev,
      {
        company: "",
        designation: "",
        from_date: "",
        to_date: "",
        last_ctc: "",
        reason_for_leaving: ""
      }
    ]);
  };

  const handleRemovePastExp = (index: number) => {
    setPastExperience((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDocument = () => {
    if (!newDoc.doc_number) {
      toast.error("Please enter document number");
      return;
    }
    const docItem = {
      id: String(Date.now()),
      doc_type: newDoc.doc_type,
      doc_number: newDoc.doc_number,
      file_name: newDoc.file_name || `${newDoc.doc_type.toLowerCase().replace(/\s+/g, "_")}_verified.pdf`,
      upload_date: new Date().toISOString().split("T")[0],
      status: "Uploaded"
    };
    setDocuments((prev) => [...prev, docItem]);
    setNewDoc({ doc_type: "Educational Certificate", doc_number: "", file_name: "" });
    toast.success("Document entry added");
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddContract = () => {
    if (!newContract.start_date || !newContract.end_date) {
      toast.error("Please specify start and end dates");
      return;
    }
    const contractItem = {
      id: "c_" + Date.now(),
      contract_type: newContract.contract_type,
      start_date: newContract.start_date,
      end_date: newContract.end_date,
      notice_period_days: newContract.notice_period_days,
      terms_summary: newContract.terms_summary || "Standard Employment Contract",
      status: "Active"
    };
    setContracts((prev) => [...prev, contractItem]);
    setNewContract({
      contract_type: "Full-time Permanent",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "2028-12-31",
      notice_period_days: 60,
      terms_summary: ""
    });
    toast.success("Contract added to profile");
  };

  const handleRemoveContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!basic.first_name || !basic.last_name) {
        toast.error("First Name and Last Name are required");
        return false;
      }
      if (!basic.official_email && !basic.personal_email) {
        toast.error("Please enter at least an Official or Personal email");
        return false;
      }
    }
    if (step === 3) {
      if (
        payment.primary_account_no &&
        payment.primary_account_no_reenter &&
        payment.primary_account_no !== payment.primary_account_no_reenter
      ) {
        toast.error("Primary Account Number re-entry does not match!");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee_id_code: basic.employee_id_code || "EMP-" + Math.floor(1000 + Math.random() * 9000),
        first_name: basic.first_name,
        last_name: basic.last_name,
        email: basic.official_email || basic.personal_email,
        mobile_number: basic.official_mobile || basic.personal_contact,
        gender: basic.gender,
        nationality: personal.nationality,
        department_id: basic.department_id || null,
        designation_id: basic.designation_id || null,
        date_of_joining: basic.date_of_joining,
        employee_status: basic.employee_status,
        basic_salary: payment.basic_salary,
        hra: payment.hra,
        tra: payment.tra,
        bank_name: payment.primary_bank_name,
        iban: payment.primary_iban || payment.primary_account_no,
        notes: JSON.stringify({
          basic_extra: {
            title: basic.title,
            middle_name: basic.middle_name,
            entity: basic.entity,
            work_city: basic.work_city,
            reporting_manager: basic.reporting_manager,
            approval_manager: basic.approval_manager,
            primary_branch: basic.primary_branch,
            grade: basic.grade,
            employment_type: basic.employment_type,
            probation_months: basic.probation_period_months,
            business_unit: basic.business_unit,
            is_handicapped: basic.is_handicapped
          },
          personal_extra: {
            ...personal,
            family: familyMembers.filter((f) => f.name.trim() !== ""),
            pastExperience: pastExperience.filter((p) => p.company.trim() !== "")
          },
          payment_extra: {
            ...payment
          },
          documents: documents,
          contracts: contracts
        })
      };

      if (employeeToEdit?.id) {
        const { error } = await HrmsApi.updateEmployee(employeeToEdit.id, payload);
        if (error) throw error;
        toast.success("Employee record updated successfully!");
      } else {
        const { error } = await HrmsApi.createEmployee(payload);
        if (error) throw error;
        toast.success("Employee onboarded successfully with all 5 profile sections!");
      }

      onSuccess();
      onOpenChange(false);
      setCurrentStep(1);
    } catch (err: any) {
      console.error("Save employee error:", err);
      toast.error("Failed to save employee: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const stepLabels = [
    { num: 1, title: "Basic Information", icon: User },
    { num: 2, title: "Personal Details", icon: MapPin },
    { num: 3, title: "Payment Details", icon: CreditCard },
    { num: 4, title: "Document Details", icon: FileText },
    { num: 5, title: "Contract Details", icon: Shield }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 flex flex-col">
        {/* Wizard Header */}
        <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {employeeToEdit ? "Edit Employee Profile" : "Employee Onboarding Wizard"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Complete enterprise onboarding across all statutory, organizational and contractual layers
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono px-2.5 py-1">
              Step {currentStep} of 5
            </Badge>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-5 gap-2 mt-5">
            {stepLabels.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (isPast || validateStep(currentStep)) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : isPast
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-muted bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : isPast
                        ? "bg-emerald-500 text-white"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                  </div>
                  <div className="hidden sm:block truncate">
                    <p className="text-xs font-semibold leading-tight truncate">{s.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Body */}
        <div className="p-6 flex-1 space-y-6">
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Title *</Label>
                  <Select value={basic.title} onValueChange={(val) => setBasic({ ...basic, title: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Eng">Eng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Employee ID *</Label>
                  <Input
                    placeholder="Auto or EMP-101"
                    value={basic.employee_id_code}
                    onChange={(e) => setBasic({ ...basic, employee_id_code: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">First Name *</Label>
                  <Input
                    required
                    placeholder="First Name"
                    value={basic.first_name}
                    onChange={(e) => setBasic({ ...basic, first_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Middle Name</Label>
                  <Input
                    placeholder="Middle Name"
                    value={basic.middle_name}
                    onChange={(e) => setBasic({ ...basic, middle_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Last Name *</Label>
                  <Input
                    required
                    placeholder="Last Name"
                    value={basic.last_name}
                    onChange={(e) => setBasic({ ...basic, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Entity Master *</Label>
                  <Select value={basic.entity} onValueChange={(val) => setBasic({ ...basic, entity: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.entities.map((ent) => (
                        <SelectItem key={ent.id} value={ent.name}>
                          {ent.name}
                        </SelectItem>
                      ))}
                      {masters.entities.length === 0 && (
                        <SelectItem value="MGT-IN-GUR (PRIMARY)">MGT-IN-GUR (PRIMARY)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Gender</Label>
                  <Select value={basic.gender} onValueChange={(val) => setBasic({ ...basic, gender: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.genders.length > 0 ? (
                        masters.genders.map((g) => (
                          <SelectItem key={g.id} value={g.name}>
                            {g.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Date of Birth</Label>
                  <Input
                    type="date"
                    value={basic.date_of_birth}
                    onChange={(e) => setBasic({ ...basic, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Work Country</Label>
                  <Select
                    value={basic.work_country}
                    onValueChange={(val) => setBasic({ ...basic, work_country: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.countries.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                      {masters.countries.length === 0 && <SelectItem value="Qatar">Qatar</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Work State / City</Label>
                  <Input
                    placeholder="Doha"
                    value={basic.work_city}
                    onChange={(e) => setBasic({ ...basic, work_city: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Personal Email</Label>
                  <Input
                    type="email"
                    placeholder="name@personal.com"
                    value={basic.personal_email}
                    onChange={(e) => setBasic({ ...basic, personal_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Personal Contact</Label>
                  <Input
                    placeholder="+974 5555 1234"
                    value={basic.personal_contact}
                    onChange={(e) => setBasic({ ...basic, personal_contact: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Reporting Manager</Label>
                  <Input
                    placeholder="e.g. Property Ops Director"
                    value={basic.reporting_manager}
                    onChange={(e) => setBasic({ ...basic, reporting_manager: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Approval Manager</Label>
                  <Input
                    placeholder="e.g. HR Lead"
                    value={basic.approval_manager}
                    onChange={(e) => setBasic({ ...basic, approval_manager: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Primary Branch *</Label>
                  <Select
                    value={basic.primary_branch}
                    onValueChange={(val) => setBasic({ ...basic, primary_branch: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.branches.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                      {masters.branches.length === 0 && (
                        <SelectItem value="Doha Downtown Branch">Doha Downtown Branch</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Department *</Label>
                  <Select
                    value={basic.department_id}
                    onValueChange={(val) => setBasic({ ...basic, department_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Designation *</Label>
                  <Select
                    value={basic.designation_id}
                    onValueChange={(val) => setBasic({ ...basic, designation_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.designations.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Grade Master</Label>
                  <Select value={basic.grade} onValueChange={(val) => setBasic({ ...basic, grade: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.grades.map((g) => (
                        <SelectItem key={g.id} value={g.name}>
                          {g.name}
                        </SelectItem>
                      ))}
                      {masters.grades.length === 0 && <SelectItem value="G3">G3</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Employee Type</Label>
                  <Select
                    value={basic.employment_type}
                    onValueChange={(val) => setBasic({ ...basic, employment_type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.employmentTypes.map((et) => (
                        <SelectItem key={et.id} value={et.name}>
                          {et.name}
                        </SelectItem>
                      ))}
                      {masters.employmentTypes.length === 0 && (
                        <SelectItem value="Full-time Permanent">Full-time Permanent</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Date of Joining *</Label>
                  <Input
                    type="date"
                    value={basic.date_of_joining}
                    onChange={(e) => setBasic({ ...basic, date_of_joining: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Probation (Months)</Label>
                  <Input
                    type="number"
                    value={basic.probation_period_months}
                    onChange={(e) =>
                      setBasic({ ...basic, probation_period_months: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select
                    value={basic.employee_status}
                    onValueChange={(val) => setBasic({ ...basic, employee_status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.employeeStatuses.length > 0 ? (
                        masters.employeeStatuses.map((st) => (
                          <SelectItem key={st.id} value={st.name}>
                            {st.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Probation">Probation</SelectItem>
                          <SelectItem value="On Notice">On Notice</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Official Email</Label>
                  <Input
                    type="email"
                    placeholder="emp@propertygroup.com"
                    value={basic.official_email}
                    onChange={(e) => setBasic({ ...basic, official_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Official Contact</Label>
                  <Input
                    placeholder="+974 4400 1234"
                    value={basic.official_mobile}
                    onChange={(e) => setBasic({ ...basic, official_mobile: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Business Unit (BU)</Label>
                  <Select
                    value={basic.business_unit}
                    onValueChange={(val) => setBasic({ ...basic, business_unit: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.businessUnits.map((bu) => (
                        <SelectItem key={bu.id} value={bu.name}>
                          {bu.name}
                        </SelectItem>
                      ))}
                      {masters.businessUnits.length === 0 && (
                        <SelectItem value="Bay View Residences (BVR)">Bay View Residences (BVR)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2 border-t text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary"
                    checked={basic.esic_applicable}
                    onChange={(e) => setBasic({ ...basic, esic_applicable: e.target.checked })}
                  />
                  <span>ESIC / Medical Insurance Applicable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary"
                    checked={basic.pension_applicable}
                    onChange={(e) => setBasic({ ...basic, pension_applicable: e.target.checked })}
                  />
                  <span>Pension / End of Service Fund (EOSG)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary"
                    checked={basic.is_handicapped}
                    onChange={(e) => setBasic({ ...basic, is_handicapped: e.target.checked })}
                  />
                  <span>Handicapped / Specially Abled</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Addresses */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Present & Permanent Addresses
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Present Address Line 1</Label>
                    <Input
                      placeholder="Building / Flat / Street"
                      value={personal.present_address_line1}
                      onChange={(e) => setPersonal({ ...personal, present_address_line1: e.target.value })}
                    />
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <Input
                        placeholder="City"
                        value={personal.present_city}
                        onChange={(e) => setPersonal({ ...personal, present_city: e.target.value })}
                      />
                      <Input
                        placeholder="State"
                        value={personal.present_state}
                        onChange={(e) => setPersonal({ ...personal, present_state: e.target.value })}
                      />
                      <Input
                        placeholder="Country"
                        value={personal.present_country}
                        onChange={(e) => setPersonal({ ...personal, present_country: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Permanent Address</Label>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={personal.same_as_present}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setPersonal((prev) => ({
                              ...prev,
                              same_as_present: val,
                              permanent_address_line1: val
                                ? prev.present_address_line1
                                : prev.permanent_address_line1,
                              permanent_city: val ? prev.present_city : prev.permanent_city,
                              permanent_state: val ? prev.present_state : prev.permanent_state,
                              permanent_country: val ? prev.present_country : prev.permanent_country
                            }));
                          }}
                        />
                        <span>Same as Present</span>
                      </label>
                    </div>
                    <Input
                      disabled={personal.same_as_present}
                      placeholder="Permanent Address Line 1"
                      value={
                        personal.same_as_present
                          ? personal.present_address_line1
                          : personal.permanent_address_line1
                      }
                      onChange={(e) =>
                        setPersonal({ ...personal, permanent_address_line1: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <Input
                        disabled={personal.same_as_present}
                        placeholder="City"
                        value={
                          personal.same_as_present
                            ? personal.present_city
                            : personal.permanent_city
                        }
                        onChange={(e) =>
                          setPersonal({ ...personal, permanent_city: e.target.value })
                        }
                      />
                      <Input
                        disabled={personal.same_as_present}
                        placeholder="State"
                        value={
                          personal.same_as_present
                            ? personal.present_state
                            : personal.permanent_state
                        }
                        onChange={(e) =>
                          setPersonal({ ...personal, permanent_state: e.target.value })
                        }
                      />
                      <Input
                        disabled={personal.same_as_present}
                        placeholder="Country"
                        value={
                          personal.same_as_present
                            ? personal.present_country
                            : personal.permanent_country
                        }
                        onChange={(e) =>
                          setPersonal({ ...personal, permanent_country: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC & Identity */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Identification & Civil IDs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Nationality</Label>
                    <Input
                      value={personal.nationality}
                      onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Blood Group</Label>
                    <Select
                      value={personal.blood_group}
                      onValueChange={(val) => setPersonal({ ...personal, blood_group: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">QID / Civil ID / Aadhaar</Label>
                    <Input
                      placeholder="29432100000"
                      value={personal.qid_pan_aadhaar}
                      onChange={(e) => setPersonal({ ...personal, qid_pan_aadhaar: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Passport Number</Label>
                    <Input
                      placeholder="N1234567"
                      value={personal.passport_number}
                      onChange={(e) => setPersonal({ ...personal, passport_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Driving License No</Label>
                    <Input
                      value={personal.driving_license_number}
                      onChange={(e) =>
                        setPersonal({ ...personal, driving_license_number: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Visa Number</Label>
                    <Input
                      value={personal.visa_number}
                      onChange={(e) => setPersonal({ ...personal, visa_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Labour Card Number</Label>
                    <Input
                      value={personal.labour_card_number}
                      onChange={(e) =>
                        setPersonal({ ...personal, labour_card_number: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Marital Status</Label>
                    <Select
                      value={personal.marital_status}
                      onValueChange={(val) => setPersonal({ ...personal, marital_status: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Family Details Table */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-primary" /> Family & Emergency Contacts
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddFamilyMember}
                    className="h-8 text-xs gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Family Member
                  </Button>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-xs">Member Name</TableHead>
                        <TableHead className="text-xs">Relationship</TableHead>
                        <TableHead className="text-xs">Contact</TableHead>
                        <TableHead className="text-xs">Emergency Contact</TableHead>
                        <TableHead className="text-xs text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {familyMembers.map((fam, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Full Name"
                              className="h-8 text-xs"
                              value={fam.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFamilyMembers((prev) =>
                                  prev.map((f, i) => (i === idx ? { ...f, name: val } : f))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Spouse/Child/Parent"
                              className="h-8 text-xs"
                              value={fam.relationship}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFamilyMembers((prev) =>
                                  prev.map((f, i) => (i === idx ? { ...f, relationship: val } : f))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              placeholder="Mobile Number"
                              className="h-8 text-xs"
                              value={fam.contact}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFamilyMembers((prev) =>
                                  prev.map((f, i) => (i === idx ? { ...f, contact: val } : f))
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <input
                              type="checkbox"
                              checked={fam.is_emergency_contact}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setFamilyMembers((prev) =>
                                  prev.map((f, i) =>
                                    i === idx ? { ...f, is_emergency_contact: val } : f
                                  )
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500"
                              onClick={() => handleRemoveFamilyMember(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Payroll Attachment Mode */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-3">
                <Label className="text-xs font-semibold">Payroll Cycle Attachment</Label>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="payroll_attachment"
                      checked={payment.payroll_attachment === "Main Payroll"}
                      onChange={() =>
                        setPayment({ ...payment, payroll_attachment: "Main Payroll" })
                      }
                    />
                    <span>Main Corporate Payroll</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="payroll_attachment"
                      checked={payment.payroll_attachment === "Alternate Payroll"}
                      onChange={() =>
                        setPayment({ ...payment, payroll_attachment: "Alternate Payroll" })
                      }
                    />
                    <span>Alternate / Contractor Run</span>
                  </label>
                </div>
              </div>

              {/* Primary Bank Details */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Primary Disbursement Bank Account
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Bank Name *</Label>
                    <Select
                      value={payment.primary_bank_name}
                      onValueChange={(val) => setPayment({ ...payment, primary_bank_name: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {masters.banks.map((b) => (
                          <SelectItem key={b.id} value={b.name}>
                            {b.name}
                          </SelectItem>
                        ))}
                        {masters.banks.length === 0 && (
                          <SelectItem value="Qatar National Bank">Qatar National Bank</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Account Number *</Label>
                    <Input
                      placeholder="0012-3456-7890"
                      value={payment.primary_account_no}
                      onChange={(e) =>
                        setPayment({ ...payment, primary_account_no: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Re-enter Account Number *</Label>
                    <Input
                      placeholder="Re-enter for verification"
                      value={payment.primary_account_no_reenter}
                      onChange={(e) =>
                        setPayment({ ...payment, primary_account_no_reenter: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">IFSC / SWIFT Code</Label>
                    <Input
                      placeholder="QNBAQAQA"
                      value={payment.primary_ifsc_swift}
                      onChange={(e) =>
                        setPayment({ ...payment, primary_ifsc_swift: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">IBAN Number</Label>
                    <Input
                      placeholder="QA55QNBA0000000012345678"
                      value={payment.primary_iban}
                      onChange={(e) => setPayment({ ...payment, primary_iban: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Salary Structure Baseline */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" /> Monthly Compensation Structure (QAR)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Basic Pay (Monthly)</Label>
                    <Input
                      type="number"
                      value={payment.basic_salary}
                      onChange={(e) =>
                        setPayment({ ...payment, basic_salary: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">House Rent Allowance (HRA)</Label>
                    <Input
                      type="number"
                      value={payment.hra}
                      onChange={(e) => setPayment({ ...payment, hra: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Transport Allowance (TRA)</Label>
                    <Input
                      type="number"
                      value={payment.tra}
                      onChange={(e) => setPayment({ ...payment, tra: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Other Allowances</Label>
                    <Input
                      type="number"
                      value={payment.other_allowances}
                      onChange={(e) => setPayment({ ...payment, other_allowances: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <span>Gross Estimated Monthly CTC (Total Salary)</span>
                  <span className="text-base font-bold">
                    {(payment.basic_salary + payment.hra + payment.tra + (payment.other_allowances || 0)).toLocaleString()} QAR
                  </span>
                </div>
              </div>

              {/* Perquisites, Corporate Benefits & Travel */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Corporate Benefits, Travel & Perquisites
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Other Benefit (Telephone / Allowance)</Label>
                    <Input
                      value={payment.benefit_telephone}
                      onChange={(e) => setPayment({ ...payment, benefit_telephone: e.target.value })}
                      placeholder="e.g. Provided By Company"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Other Benefit (Accommodation)</Label>
                    <Input
                      value={payment.benefit_accommodation}
                      onChange={(e) => setPayment({ ...payment, benefit_accommodation: e.target.value })}
                      placeholder="e.g. Company Accommodation / Allowance"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Other Benefit (Vehicle)</Label>
                    <Input
                      value={payment.benefit_vehicle}
                      onChange={(e) => setPayment({ ...payment, benefit_vehicle: e.target.value })}
                      placeholder="e.g. Company Provided / Allowance"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label className="text-xs font-semibold">Air Ticket Entitlement</Label>
                    <Input
                      value={payment.air_ticket}
                      onChange={(e) => setPayment({ ...payment, air_ticket: e.target.value })}
                      placeholder="e.g. Yearly, Bi-Annual"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Air Ticket Fare CAP (QAR)</Label>
                    <Input
                      type="number"
                      value={payment.air_ticket_fare_cap}
                      onChange={(e) => setPayment({ ...payment, air_ticket_fare_cap: Number(e.target.value) })}
                      placeholder="2500"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <Label className="text-xs font-semibold">Remarks & Compensation Notes</Label>
                  <Input
                    value={payment.remarks}
                    onChange={(e) => setPayment({ ...payment, remarks: e.target.value })}
                    placeholder="Special terms, sign-on bonuses, relocation support..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DOCUMENT DETAILS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Add New Document Widget */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Attach Employee Verification Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Document Category</Label>
                    <Select
                      value={newDoc.doc_type}
                      onValueChange={(val) => setNewDoc({ ...newDoc, doc_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QID / National ID">QID / National ID</SelectItem>
                        <SelectItem value="Passport Copy">Passport Copy</SelectItem>
                        <SelectItem value="Driving License">Driving License</SelectItem>
                        <SelectItem value="Educational Certificate">Educational Certificate</SelectItem>
                        <SelectItem value="Previous Experience Letter">Previous Experience Letter</SelectItem>
                        <SelectItem value="Police Clearance Certificate">Police Clearance Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Document Number / Reference</Label>
                    <Input
                      placeholder="e.g. DOC-987654"
                      value={newDoc.doc_number}
                      onChange={(e) => setNewDoc({ ...newDoc, doc_number: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-xs font-semibold">File Name</Label>
                      <Input
                        placeholder="certificate_scan.pdf"
                        value={newDoc.file_name}
                        onChange={(e) => setNewDoc({ ...newDoc, file_name: e.target.value })}
                      />
                    </div>
                    <Button type="button" onClick={handleAddDocument} className="h-9 gap-1 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Document Type</TableHead>
                      <TableHead className="text-xs">Doc Number</TableHead>
                      <TableHead className="text-xs">File Attachment</TableHead>
                      <TableHead className="text-xs">Uploaded Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium text-xs">{doc.doc_type}</TableCell>
                        <TableCell className="font-mono text-xs">{doc.doc_number}</TableCell>
                        <TableCell className="text-xs text-primary flex items-center gap-1 py-3">
                          <FileText className="h-3.5 w-3.5" /> {doc.file_name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{doc.upload_date}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-emerald-600 border-emerald-500/30 text-[10px]"
                          >
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500"
                            onClick={() => handleRemoveDocument(doc.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {documents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                          No documents uploaded yet. Add required certificates above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* STEP 5: CONTRACT DETAILS */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Add Contract Widget */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Legal Contract Terms & Tenancy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Contract Type</Label>
                    <Select
                      value={newContract.contract_type}
                      onValueChange={(val) => setNewContract({ ...newContract, contract_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {masters.contractTypes.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                        {masters.contractTypes.length === 0 && (
                          <SelectItem value="Full-time Permanent">Full-time Permanent</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Start Date</Label>
                    <Input
                      type="date"
                      value={newContract.start_date}
                      onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">End Date</Label>
                    <Input
                      type="date"
                      value={newContract.end_date}
                      onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Notice Period (Days)</Label>
                    <Input
                      type="number"
                      value={newContract.notice_period_days}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          notice_period_days: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Special stipulations or terms summary"
                    value={newContract.terms_summary}
                    onChange={(e) => setNewContract({ ...newContract, terms_summary: e.target.value })}
                  />
                  <Button type="button" onClick={handleAddContract} className="shrink-0 h-9 text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Contract Layer
                  </Button>
                </div>
              </div>

              {/* Active Contracts Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Contract Type</TableHead>
                      <TableHead className="text-xs">Duration</TableHead>
                      <TableHead className="text-xs">Notice Period</TableHead>
                      <TableHead className="text-xs">Summary</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold text-xs">{c.contract_type}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {c.start_date} to {c.end_date}
                        </TableCell>
                        <TableCell className="text-xs">{c.notice_period_days} Days</TableCell>
                        <TableCell className="text-xs max-w-xs truncate">{c.terms_summary}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-emerald-600 border-emerald-500/30 text-[10px]"
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500"
                            onClick={() => handleRemoveContract(c.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 border-t bg-card/60 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="gap-2 text-xs"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Step
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            {currentStep < 5 ? (
              <Button type="button" onClick={handleNext} className="gap-2 text-xs">
                Next Step <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={saving}
                className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                {saving
                  ? "Finalizing Profile..."
                  : employeeToEdit
                  ? "Update Employee Profile"
                  : "Save & Onboard Employee"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}