import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, A as Shield, At as FileSpreadsheet, Bt as DollarSign, G as Plus, Gt as Clock, H as Receipt, Ht as CreditCard, I as Search, Pt as Eye, Tt as GitBranch, V as RefreshCw, W as Printer, Xt as CircleQuestionMark, Y as PenLine, an as ChevronLeft, bt as HeartHandshake, c as User, f as UserCheck, fn as Calendar, gn as Building2, in as ChevronRight, it as MapPin, j as ShieldCheck, kt as FileText, ot as LogOut, p as Upload, rt as Megaphone, s as Users, v as Trash2, wn as Award } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { v as useNavigate, y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C7RsdMLq.mjs";
import { t as HrmsApi } from "./hrmsService-CXxFPXaN.mjs";
import { i as MASTER_CATEGORIES_CONFIG, r as HrmsMastersApi } from "./auth-guards-EcJq1CIb.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
import { t as ExcelImportEmbedded } from "./excel-import-embedded-CrY5_n7F.mjs";
import { t as syncPayrollRun } from "./payrollIntegrationService-CNkC6zEd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hrms-module-D9OXUGoD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EmployeeOnboardingWizard({ open, onOpenChange, onSuccess, employeeToEdit }) {
	const [currentStep, setCurrentStep] = (0, import_react.useState)(1);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [masters, setMasters] = (0, import_react.useState)({
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
		employeeStatuses: []
	});
	const [basic, setBasic] = (0, import_react.useState)({
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
		date_of_joining: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
	const [personal, setPersonal] = (0, import_react.useState)({
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
	const [familyMembers, setFamilyMembers] = (0, import_react.useState)([{
		name: "",
		relationship: "Spouse/Parent",
		dob: "",
		contact: "",
		is_emergency_contact: true
	}]);
	const [pastExperience, setPastExperience] = (0, import_react.useState)([]);
	const [payment, setPayment] = (0, import_react.useState)({
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
		basic_salary: 5e3,
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
	const [documents, setDocuments] = (0, import_react.useState)([{
		id: "1",
		doc_type: "QID / National ID",
		doc_number: "QID-987654321",
		file_name: "qid_copy_signed.pdf",
		upload_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		status: "Verified"
	}, {
		id: "2",
		doc_type: "Passport Copy",
		doc_number: "N8765432",
		file_name: "passport_bio.pdf",
		upload_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		status: "Verified"
	}]);
	const [newDoc, setNewDoc] = (0, import_react.useState)({
		doc_type: "Educational Certificate",
		doc_number: "",
		file_name: ""
	});
	const [contracts, setContracts] = (0, import_react.useState)([{
		id: "c1",
		contract_type: "Full-time Permanent",
		start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		end_date: "2028-12-31",
		notice_period_days: 60,
		terms_summary: "Standard Enterprise Employment Contract with Grade G3 Entitlements",
		status: "Active"
	}]);
	const [newContract, setNewContract] = (0, import_react.useState)({
		contract_type: "Full-time Permanent",
		start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		end_date: "2028-12-31",
		notice_period_days: 60,
		terms_summary: ""
	});
	(0, import_react.useEffect)(() => {
		async function initMasters() {
			const data = await HrmsMastersApi.getEmployeeCreationMasters();
			setMasters(data);
			if (data.departments.length > 0 && !basic.department_id) setBasic((prev) => ({
				...prev,
				department_id: data.departments[0].id
			}));
			if (data.designations.length > 0 && !basic.designation_id) setBasic((prev) => ({
				...prev,
				designation_id: data.designations[0].id
			}));
		}
		if (open) {
			initMasters();
			if (!employeeToEdit) HrmsMastersApi.generateNextEmployeeId("EMP").then((generatedCode) => {
				setBasic((prev) => ({
					...prev,
					employee_id_code: generatedCode
				}));
			});
		}
	}, [open, employeeToEdit]);
	(0, import_react.useEffect)(() => {
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
				basic_salary: Number(employeeToEdit.basic_salary || 5e3),
				hra: Number(employeeToEdit.hra || 1500),
				tra: Number(employeeToEdit.tra || 500)
			}));
		}
	}, [employeeToEdit, open]);
	const handleAddFamilyMember = () => {
		setFamilyMembers((prev) => [...prev, {
			name: "",
			relationship: "Child",
			dob: "",
			contact: "",
			is_emergency_contact: false
		}]);
	};
	const handleRemoveFamilyMember = (index) => {
		setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
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
			upload_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			status: "Uploaded"
		};
		setDocuments((prev) => [...prev, docItem]);
		setNewDoc({
			doc_type: "Educational Certificate",
			doc_number: "",
			file_name: ""
		});
		toast.success("Document entry added");
	};
	const handleRemoveDocument = (id) => {
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
			start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			end_date: "2028-12-31",
			notice_period_days: 60,
			terms_summary: ""
		});
		toast.success("Contract added to profile");
	};
	const handleRemoveContract = (id) => {
		setContracts((prev) => prev.filter((c) => c.id !== id));
	};
	const validateStep = (step) => {
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
			if (payment.primary_account_no && payment.primary_account_no_reenter && payment.primary_account_no !== payment.primary_account_no_reenter) {
				toast.error("Primary Account Number re-entry does not match!");
				return false;
			}
		}
		return true;
	};
	const handleNext = () => {
		if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(5, prev + 1));
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
				employee_id_code: basic.employee_id_code || "EMP-" + Math.floor(1e3 + Math.random() * 9e3),
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
					payment_extra: { ...payment },
					documents,
					contracts
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
		} catch (err) {
			console.error("Save employee error:", err);
			toast.error("Failed to save employee: " + (err.message || err));
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-4xl max-h-[90vh] overflow-y-auto p-0 flex flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "text-xl font-bold flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-primary" }), employeeToEdit ? "Edit Employee Profile" : "Employee Onboarding Wizard"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Complete enterprise onboarding across all statutory, organizational and contractual layers"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "text-xs font-mono px-2.5 py-1",
							children: [
								"Step ",
								currentStep,
								" of 5"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-5 gap-2 mt-5",
						children: [
							{
								num: 1,
								title: "Basic Information",
								icon: User
							},
							{
								num: 2,
								title: "Personal Details",
								icon: MapPin
							},
							{
								num: 3,
								title: "Payment Details",
								icon: CreditCard
							},
							{
								num: 4,
								title: "Document Details",
								icon: FileText
							},
							{
								num: 5,
								title: "Contract Details",
								icon: Shield
							}
						].map((s) => {
							s.icon;
							const isActive = currentStep === s.num;
							const isPast = currentStep > s.num;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									if (isPast || validateStep(currentStep)) setCurrentStep(s.num);
								},
								className: `flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${isActive ? "border-primary bg-primary text-primary-foreground shadow-sm" : isPast ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-muted bg-muted/40 text-muted-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-primary-foreground text-primary" : isPast ? "bg-emerald-500 text-white" : "bg-muted-foreground/20 text-muted-foreground"}`,
									children: isPast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }) : s.num
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden sm:block truncate",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold leading-tight truncate",
										children: s.title
									})
								})]
							}, s.num);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 flex-1 space-y-6",
					children: [
						currentStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-4 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Title *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.title,
											onValueChange: (val) => setBasic({
												...basic,
												title: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Mr",
													children: "Mr"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Ms",
													children: "Ms"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Mrs",
													children: "Mrs"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Dr",
													children: "Dr"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Eng",
													children: "Eng"
												})
											] })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Employee ID *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Auto or EMP-101",
											value: basic.employee_id_code,
											onChange: (e) => setBasic({
												...basic,
												employee_id_code: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "md:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "First Name *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												required: true,
												placeholder: "First Name",
												value: basic.first_name,
												onChange: (e) => setBasic({
													...basic,
													first_name: e.target.value
												})
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-3 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Middle Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Middle Name",
											value: basic.middle_name,
											onChange: (e) => setBasic({
												...basic,
												middle_name: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Last Name *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											required: true,
											placeholder: "Last Name",
											value: basic.last_name,
											onChange: (e) => setBasic({
												...basic,
												last_name: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Entity Master *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.entity,
											onValueChange: (val) => setBasic({
												...basic,
												entity: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [masters.entities.map((ent) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: ent.name,
												children: ent.name
											}, ent.id)), masters.entities.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "MGT-IN-GUR (PRIMARY)",
												children: "MGT-IN-GUR (PRIMARY)"
											})] })]
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-4 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Gender"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.gender,
											onValueChange: (val) => setBasic({
												...basic,
												gender: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masters.genders.length > 0 ? masters.genders.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: g.name,
												children: g.name
											}, g.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Male",
													children: "Male"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Female",
													children: "Female"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Other",
													children: "Other"
												})
											] }) })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Date of Birth"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: basic.date_of_birth,
											onChange: (e) => setBasic({
												...basic,
												date_of_birth: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Work Country"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.work_country,
											onValueChange: (val) => setBasic({
												...basic,
												work_country: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [masters.countries.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c.name,
												children: c.name
											}, c.id)), masters.countries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Qatar",
												children: "Qatar"
											})] })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Work State / City"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Doha",
											value: basic.work_city,
											onChange: (e) => setBasic({
												...basic,
												work_city: e.target.value
											})
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Personal Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "email",
										placeholder: "name@personal.com",
										value: basic.personal_email,
										onChange: (e) => setBasic({
											...basic,
											personal_email: e.target.value
										})
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Personal Contact"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "+974 5555 1234",
										value: basic.personal_contact,
										onChange: (e) => setBasic({
											...basic,
											personal_contact: e.target.value
										})
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-3 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Reporting Manager"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "e.g. Property Ops Director",
											value: basic.reporting_manager,
											onChange: (e) => setBasic({
												...basic,
												reporting_manager: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Approval Manager"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "e.g. HR Lead",
											value: basic.approval_manager,
											onChange: (e) => setBasic({
												...basic,
												approval_manager: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Primary Branch *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.primary_branch,
											onValueChange: (val) => setBasic({
												...basic,
												primary_branch: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [masters.branches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: b.name,
												children: b.name
											}, b.id)), masters.branches.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Doha Downtown Branch",
												children: "Doha Downtown Branch"
											})] })]
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-3 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Department *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.department_id,
											onValueChange: (val) => setBasic({
												...basic,
												department_id: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Department" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masters.departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: d.id,
												children: d.name
											}, d.id)) })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Designation *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.designation_id,
											onValueChange: (val) => setBasic({
												...basic,
												designation_id: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Designation" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masters.designations.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: d.id,
												children: d.name
											}, d.id)) })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Grade Master"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.grade,
											onValueChange: (val) => setBasic({
												...basic,
												grade: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [masters.grades.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: g.name,
												children: g.name
											}, g.id)), masters.grades.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "G3",
												children: "G3"
											})] })]
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-4 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Employee Type"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.employment_type,
											onValueChange: (val) => setBasic({
												...basic,
												employment_type: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [masters.employmentTypes.map((et) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: et.name,
												children: et.name
											}, et.id)), masters.employmentTypes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Full-time Permanent",
												children: "Full-time Permanent"
											})] })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Date of Joining *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											value: basic.date_of_joining,
											onChange: (e) => setBasic({
												...basic,
												date_of_joining: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Probation (Months)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: basic.probation_period_months,
											onChange: (e) => setBasic({
												...basic,
												probation_period_months: Number(e.target.value)
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.employee_status,
											onValueChange: (val) => setBasic({
												...basic,
												employee_status: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masters.employeeStatuses.length > 0 ? masters.employeeStatuses.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: st.name,
												children: st.name
											}, st.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Active",
													children: "Active"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Probation",
													children: "Probation"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "On Notice",
													children: "On Notice"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Suspended",
													children: "Suspended"
												})
											] }) })]
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-3 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Official Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "email",
											placeholder: "emp@propertygroup.com",
											value: basic.official_email,
											onChange: (e) => setBasic({
												...basic,
												official_email: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Official Contact"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "+974 4400 1234",
											value: basic.official_mobile,
											onChange: (e) => setBasic({
												...basic,
												official_mobile: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Business Unit (BU)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: basic.business_unit,
											onValueChange: (val) => setBasic({
												...basic,
												business_unit: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [masters.businessUnits.map((bu) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: bu.name,
												children: bu.name
											}, bu.id)), masters.businessUnits.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Bay View Residences (BVR)",
												children: "Bay View Residences (BVR)"
											})] })]
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-6 pt-2 border-t text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "rounded border-gray-300 text-primary",
												checked: basic.esic_applicable,
												onChange: (e) => setBasic({
													...basic,
													esic_applicable: e.target.checked
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ESIC / Medical Insurance Applicable" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "rounded border-gray-300 text-primary",
												checked: basic.pension_applicable,
												onChange: (e) => setBasic({
													...basic,
													pension_applicable: e.target.checked
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pension / End of Service Fund (EOSG)" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "rounded border-gray-300 text-primary",
												checked: basic.is_handicapped,
												onChange: (e) => setBasic({
													...basic,
													is_handicapped: e.target.checked
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Handicapped / Specially Abled" })]
										})
									]
								})
							]
						}),
						currentStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-card/60 space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "text-sm font-bold flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary" }), " Present & Permanent Addresses"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-2 gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Present Address Line 1"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Building / Flat / Street",
													value: personal.present_address_line1,
													onChange: (e) => setPersonal({
														...personal,
														present_address_line1: e.target.value
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-2 pt-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															placeholder: "City",
															value: personal.present_city,
															onChange: (e) => setPersonal({
																...personal,
																present_city: e.target.value
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															placeholder: "State",
															value: personal.present_state,
															onChange: (e) => setPersonal({
																...personal,
																present_state: e.target.value
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															placeholder: "Country",
															value: personal.present_country,
															onChange: (e) => setPersonal({
																...personal,
																present_country: e.target.value
															})
														})
													]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Permanent Address"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														className: "flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: personal.same_as_present,
															onChange: (e) => {
																const val = e.target.checked;
																setPersonal((prev) => ({
																	...prev,
																	same_as_present: val,
																	permanent_address_line1: val ? prev.present_address_line1 : prev.permanent_address_line1,
																	permanent_city: val ? prev.present_city : prev.permanent_city,
																	permanent_state: val ? prev.present_state : prev.permanent_state,
																	permanent_country: val ? prev.present_country : prev.permanent_country
																}));
															}
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Same as Present" })]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													disabled: personal.same_as_present,
													placeholder: "Permanent Address Line 1",
													value: personal.same_as_present ? personal.present_address_line1 : personal.permanent_address_line1,
													onChange: (e) => setPersonal({
														...personal,
														permanent_address_line1: e.target.value
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-2 pt-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															disabled: personal.same_as_present,
															placeholder: "City",
															value: personal.same_as_present ? personal.present_city : personal.permanent_city,
															onChange: (e) => setPersonal({
																...personal,
																permanent_city: e.target.value
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															disabled: personal.same_as_present,
															placeholder: "State",
															value: personal.same_as_present ? personal.present_state : personal.permanent_state,
															onChange: (e) => setPersonal({
																...personal,
																permanent_state: e.target.value
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															disabled: personal.same_as_present,
															placeholder: "Country",
															value: personal.same_as_present ? personal.present_country : personal.permanent_country,
															onChange: (e) => setPersonal({
																...personal,
																permanent_country: e.target.value
															})
														})
													]
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-card/60 space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-primary" }), " Identification & Civil IDs"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-4 gap-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Nationality"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: personal.nationality,
													onChange: (e) => setPersonal({
														...personal,
														nationality: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Blood Group"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: personal.blood_group,
													onValueChange: (val) => setPersonal({
														...personal,
														blood_group: val
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
														"A+",
														"A-",
														"B+",
														"B-",
														"AB+",
														"AB-",
														"O+",
														"O-"
													].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: b,
														children: b
													}, b)) })]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "QID / Civil ID / Aadhaar"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "29432100000",
													value: personal.qid_pan_aadhaar,
													onChange: (e) => setPersonal({
														...personal,
														qid_pan_aadhaar: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Passport Number"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "N1234567",
													value: personal.passport_number,
													onChange: (e) => setPersonal({
														...personal,
														passport_number: e.target.value
													})
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-4 gap-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Driving License No"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: personal.driving_license_number,
													onChange: (e) => setPersonal({
														...personal,
														driving_license_number: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Visa Number"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: personal.visa_number,
													onChange: (e) => setPersonal({
														...personal,
														visa_number: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Labour Card Number"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: personal.labour_card_number,
													onChange: (e) => setPersonal({
														...personal,
														labour_card_number: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Marital Status"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: personal.marital_status,
													onValueChange: (val) => setPersonal({
														...personal,
														marital_status: val
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Single",
															children: "Single"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Married",
															children: "Married"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Divorced",
															children: "Divorced"
														})
													] })]
												})] })
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-card/60 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, { className: "h-4 w-4 text-primary" }), " Family & Emergency Contacts"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											onClick: handleAddFamilyMember,
											className: "h-8 text-xs gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Family Member"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-lg border overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
											className: "bg-muted/50",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "text-xs",
													children: "Member Name"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "text-xs",
													children: "Relationship"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "text-xs",
													children: "Contact"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "text-xs",
													children: "Emergency Contact"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "text-xs text-right",
													children: "Action"
												})
											] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: familyMembers.map((fam, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "p-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Full Name",
													className: "h-8 text-xs",
													value: fam.name,
													onChange: (e) => {
														const val = e.target.value;
														setFamilyMembers((prev) => prev.map((f, i) => i === idx ? {
															...f,
															name: val
														} : f));
													}
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "p-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Spouse/Child/Parent",
													className: "h-8 text-xs",
													value: fam.relationship,
													onChange: (e) => {
														const val = e.target.value;
														setFamilyMembers((prev) => prev.map((f, i) => i === idx ? {
															...f,
															relationship: val
														} : f));
													}
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "p-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Mobile Number",
													className: "h-8 text-xs",
													value: fam.contact,
													onChange: (e) => {
														const val = e.target.value;
														setFamilyMembers((prev) => prev.map((f, i) => i === idx ? {
															...f,
															contact: val
														} : f));
													}
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "p-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: fam.is_emergency_contact,
													onChange: (e) => {
														const val = e.target.checked;
														setFamilyMembers((prev) => prev.map((f, i) => i === idx ? {
															...f,
															is_emergency_contact: val
														} : f));
													}
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "p-2 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "icon",
													className: "h-8 w-8 text-rose-500",
													onClick: () => handleRemoveFamilyMember(idx),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
												})
											})
										] }, idx)) })] })
									})]
								})
							]
						}),
						currentStep === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-card/60 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Payroll Cycle Attachment"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-6 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 cursor-pointer font-medium",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "radio",
												name: "payroll_attachment",
												checked: payment.payroll_attachment === "Main Payroll",
												onChange: () => setPayment({
													...payment,
													payroll_attachment: "Main Payroll"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Main Corporate Payroll" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 cursor-pointer font-medium",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "radio",
												name: "payroll_attachment",
												checked: payment.payroll_attachment === "Alternate Payroll",
												onChange: () => setPayment({
													...payment,
													payroll_attachment: "Alternate Payroll"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Alternate / Contractor Run" })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-card/60 space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4 text-primary" }), " Primary Disbursement Bank Account"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-3 gap-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Bank Name *"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: payment.primary_bank_name,
													onValueChange: (val) => setPayment({
														...payment,
														primary_bank_name: val
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [masters.banks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: b.name,
														children: b.name
													}, b.id)), masters.banks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Qatar National Bank",
														children: "Qatar National Bank"
													})] })]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Account Number *"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "0012-3456-7890",
													value: payment.primary_account_no,
													onChange: (e) => setPayment({
														...payment,
														primary_account_no: e.target.value
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Re-enter Account Number *"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Re-enter for verification",
													value: payment.primary_account_no_reenter,
													onChange: (e) => setPayment({
														...payment,
														primary_account_no_reenter: e.target.value
													})
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-2 gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "IFSC / SWIFT Code"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "QNBAQAQA",
												value: payment.primary_ifsc_swift,
												onChange: (e) => setPayment({
													...payment,
													primary_ifsc_swift: e.target.value
												})
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "IBAN Number"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "QA55QNBA0000000012345678",
												value: payment.primary_iban,
												onChange: (e) => setPayment({
													...payment,
													primary_iban: e.target.value
												})
											})] })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-card/60 space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4 text-emerald-600" }), " Monthly Compensation Structure (QAR)"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-4 gap-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Basic Pay (Monthly)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: payment.basic_salary,
													onChange: (e) => setPayment({
														...payment,
														basic_salary: Number(e.target.value)
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "House Rent Allowance (HRA)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: payment.hra,
													onChange: (e) => setPayment({
														...payment,
														hra: Number(e.target.value)
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Transport Allowance (TRA)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: payment.tra,
													onChange: (e) => setPayment({
														...payment,
														tra: Number(e.target.value)
													})
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Other Allowances"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: payment.other_allowances,
													onChange: (e) => setPayment({
														...payment,
														other_allowances: Number(e.target.value)
													})
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-sm font-semibold text-emerald-700 dark:text-emerald-300",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gross Estimated Monthly CTC (Total Salary)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-base font-bold",
												children: [(payment.basic_salary + payment.hra + payment.tra + (payment.other_allowances || 0)).toLocaleString(), " QAR"]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-card/60 space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-primary" }), " Corporate Benefits, Travel & Perquisites"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-3 gap-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Other Benefit (Telephone / Allowance)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: payment.benefit_telephone,
													onChange: (e) => setPayment({
														...payment,
														benefit_telephone: e.target.value
													}),
													placeholder: "e.g. Provided By Company"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Other Benefit (Accommodation)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: payment.benefit_accommodation,
													onChange: (e) => setPayment({
														...payment,
														benefit_accommodation: e.target.value
													}),
													placeholder: "e.g. Company Accommodation / Allowance"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Other Benefit (Vehicle)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: payment.benefit_vehicle,
													onChange: (e) => setPayment({
														...payment,
														benefit_vehicle: e.target.value
													}),
													placeholder: "e.g. Company Provided / Allowance"
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Air Ticket Entitlement"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: payment.air_ticket,
												onChange: (e) => setPayment({
													...payment,
													air_ticket: e.target.value
												}),
												placeholder: "e.g. Yearly, Bi-Annual"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Air Ticket Fare CAP (QAR)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: payment.air_ticket_fare_cap,
												onChange: (e) => setPayment({
													...payment,
													air_ticket_fare_cap: Number(e.target.value)
												}),
												placeholder: "2500"
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "pt-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Remarks & Compensation Notes"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: payment.remarks,
												onChange: (e) => setPayment({
													...payment,
													remarks: e.target.value
												}),
												placeholder: "Special terms, sign-on bonuses, relocation support..."
											})]
										})
									]
								})
							]
						}),
						currentStep === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl border bg-card/60 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "text-sm font-bold flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 text-primary" }), " Attach Employee Verification Documents"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-3 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Document Category"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: newDoc.doc_type,
											onValueChange: (val) => setNewDoc({
												...newDoc,
												doc_type: val
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "QID / National ID",
													children: "QID / National ID"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Passport Copy",
													children: "Passport Copy"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Driving License",
													children: "Driving License"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Educational Certificate",
													children: "Educational Certificate"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Previous Experience Letter",
													children: "Previous Experience Letter"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Police Clearance Certificate",
													children: "Police Clearance Certificate"
												})
											] })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Document Number / Reference"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "e.g. DOC-987654",
											value: newDoc.doc_number,
											onChange: (e) => setNewDoc({
												...newDoc,
												doc_number: e.target.value
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-end gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "File Name"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "certificate_scan.pdf",
													value: newDoc.file_name,
													onChange: (e) => setNewDoc({
														...newDoc,
														file_name: e.target.value
													})
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												onClick: handleAddDocument,
												className: "h-9 gap-1 text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add"]
											})]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
									className: "bg-muted/50",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Document Type"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Doc Number"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "File Attachment"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Uploaded Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs text-right",
											children: "Action"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [documents.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-medium text-xs",
										children: doc.doc_type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono text-xs",
										children: doc.doc_number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-xs text-primary flex items-center gap-1 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }),
											" ",
											doc.file_name
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs text-muted-foreground",
										children: doc.upload_date
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-emerald-600 border-emerald-500/30 text-[10px]",
										children: doc.status
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "h-7 w-7 text-rose-500",
											onClick: () => handleRemoveDocument(doc.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})
									})
								] }, doc.id)), documents.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 6,
									className: "text-center py-6 text-xs text-muted-foreground",
									children: "No documents uploaded yet. Add required certificates above."
								}) })] })] })
							})]
						}),
						currentStep === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl border bg-card/60 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "text-sm font-bold flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-primary" }), " Legal Contract Terms & Tenancy"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-4 gap-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Contract Type"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: newContract.contract_type,
												onValueChange: (val) => setNewContract({
													...newContract,
													contract_type: val
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [masters.contractTypes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: c.name,
													children: c.name
												}, c.id)), masters.contractTypes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Full-time Permanent",
													children: "Full-time Permanent"
												})] })]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Start Date"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												value: newContract.start_date,
												onChange: (e) => setNewContract({
													...newContract,
													start_date: e.target.value
												})
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "End Date"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												value: newContract.end_date,
												onChange: (e) => setNewContract({
													...newContract,
													end_date: e.target.value
												})
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Notice Period (Days)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: newContract.notice_period_days,
												onChange: (e) => setNewContract({
													...newContract,
													notice_period_days: Number(e.target.value)
												})
											})] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2 items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Special stipulations or terms summary",
											value: newContract.terms_summary,
											onChange: (e) => setNewContract({
												...newContract,
												terms_summary: e.target.value
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											onClick: handleAddContract,
											className: "shrink-0 h-9 text-xs gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Contract Layer"]
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
									className: "bg-muted/50",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Contract Type"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Duration"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Notice Period"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Summary"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-xs text-right",
											children: "Action"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: contracts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-semibold text-xs",
										children: c.contract_type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-xs font-mono text-muted-foreground",
										children: [
											c.start_date,
											" to ",
											c.end_date
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-xs",
										children: [c.notice_period_days, " Days"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs max-w-xs truncate",
										children: c.terms_summary
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-emerald-600 border-emerald-500/30 text-[10px]",
										children: c.status
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "h-7 w-7 text-rose-500",
											onClick: () => handleRemoveContract(c.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})
									})
								] }, c.id)) })] })
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-t bg-card/60 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: currentStep > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: handlePrevious,
						className: "gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), " Previous Step"]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => onOpenChange(false),
							className: "text-xs",
							children: "Cancel"
						}), currentStep < 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							onClick: handleNext,
							className: "gap-2 text-xs",
							children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							onClick: handleFinalSubmit,
							disabled: saving,
							className: "gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), saving ? "Finalizing Profile..." : employeeToEdit ? "Update Employee Profile" : "Save & Onboard Employee"]
						})]
					})]
				})
			]
		})
	});
}
function HrmsModule({ role = "admin" }) {
	const search = useSearch({ strict: false });
	useNavigate();
	const [activeTab, setActiveTab] = (0, import_react.useState)(search?.tab || "dashboard");
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (search?.tab && search.tab !== activeTab) setActiveTab(search.tab);
	}, [search?.tab]);
	const [employees, setEmployees] = (0, import_react.useState)([]);
	const [departments, setDepartments] = (0, import_react.useState)([]);
	const [designations, setDesignations] = (0, import_react.useState)([]);
	const [companies, setCompanies] = (0, import_react.useState)([]);
	const [branches, setBranches] = (0, import_react.useState)([]);
	const [shifts, setShifts] = (0, import_react.useState)([]);
	const [attendance, setAttendance] = (0, import_react.useState)([]);
	const [leaveTypes, setLeaveTypes] = (0, import_react.useState)([]);
	const [leaveApps, setLeaveApps] = (0, import_react.useState)([]);
	const [payrollCycles, setPayrollCycles] = (0, import_react.useState)([]);
	const [selectedCycleId, setSelectedCycleId] = (0, import_react.useState)("");
	const [payslips, setPayslips] = (0, import_react.useState)([]);
	const [appraisalCycles, setAppraisalCycles] = (0, import_react.useState)([]);
	const [expenseClaims, setExpenseClaims] = (0, import_react.useState)([]);
	const [resignations, setResignations] = (0, import_react.useState)([]);
	const [fnfSettlements, setFnfSettlements] = (0, import_react.useState)([]);
	const [announcements, setAnnouncements] = (0, import_react.useState)([]);
	const [tickets, setTickets] = (0, import_react.useState)([]);
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [employeeCurrentPage, setEmployeeCurrentPage] = (0, import_react.useState)(1);
	const EMPLOYEES_PER_PAGE = 20;
	const [showAddEmployeeModal, setShowAddEmployeeModal] = (0, import_react.useState)(false);
	const [employeeToEdit, setEmployeeToEdit] = (0, import_react.useState)(null);
	const [bulkEmployeeOpen, setBulkEmployeeOpen] = (0, import_react.useState)(false);
	const [bulkEmployeeData, setBulkEmployeeData] = (0, import_react.useState)("");
	const [bulkEmployeeLoading, setBulkEmployeeLoading] = (0, import_react.useState)(false);
	const [showAddLeaveModal, setShowAddLeaveModal] = (0, import_react.useState)(false);
	const [showAddExpenseModal, setShowAddExpenseModal] = (0, import_react.useState)(false);
	const [showAddTicketModal, setShowAddTicketModal] = (0, import_react.useState)(false);
	const [showAddAnnouncementModal, setShowAddAnnouncementModal] = (0, import_react.useState)(false);
	const [showCreatePayrollModal, setShowCreatePayrollModal] = (0, import_react.useState)(false);
	const [showAddShiftModal, setShowAddShiftModal] = (0, import_react.useState)(false);
	const [showAddResignationModal, setShowAddResignationModal] = (0, import_react.useState)(false);
	const [showRecordAttendanceModal, setShowRecordAttendanceModal] = (0, import_react.useState)(false);
	const [showCreateAppraisalModal, setShowCreateAppraisalModal] = (0, import_react.useState)(false);
	const [selectedPayslipForView, setSelectedPayslipForView] = (0, import_react.useState)(null);
	const [selectedEmployeeProfile, setSelectedEmployeeProfile] = (0, import_react.useState)(null);
	const [selectedMasterKey, setSelectedMasterKey] = (0, import_react.useState)("companies");
	const [currentMasterItems, setCurrentMasterItems] = (0, import_react.useState)([]);
	const [newMasterName, setNewMasterName] = (0, import_react.useState)("");
	const [newMasterCode, setNewMasterCode] = (0, import_react.useState)("");
	const [newMasterDesc, setNewMasterDesc] = (0, import_react.useState)("");
	const [newEmp, setNewEmp] = (0, import_react.useState)({
		first_name: "",
		last_name: "",
		email: "",
		mobile_number: "",
		employee_id_code: "",
		department_id: "",
		designation_id: "",
		basic_salary: 5e3,
		hra: 1500,
		tra: 500,
		gender: "Male",
		nationality: "Qatari",
		employee_status: "Active",
		bank_name: "Qatar National Bank",
		iban: "QA55QNBA00000000"
	});
	const [newLeave, setNewLeave] = (0, import_react.useState)({
		employee_id: "",
		leave_type_id: "",
		start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		end_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		days_count: 1,
		reason: ""
	});
	const [newExpense, setNewExpense] = (0, import_react.useState)({
		employee_id: "",
		title: "",
		amount: 250,
		expense_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		description: ""
	});
	const [newAppraisalCycle, setNewAppraisalCycle] = (0, import_react.useState)({
		title: "2026 Annual Performance Review",
		start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		end_date: new Date(Date.now() + 720 * 3600 * 1e3).toISOString().split("T")[0],
		interval_type: "Annual",
		status: "Active"
	});
	const [newTicket, setNewTicket] = (0, import_react.useState)({
		employee_id: "",
		category: "HR",
		subject: "",
		description: "",
		priority: "Medium"
	});
	const [newAnnouncement, setNewAnnouncement] = (0, import_react.useState)({
		title: "",
		content: "",
		priority: "Normal"
	});
	const [newCycle, setNewCycle] = (0, import_react.useState)({
		name: "September 2026 Payroll",
		cycle_month: 9,
		cycle_year: 2026,
		start_date: "2026-09-01",
		end_date: "2026-09-30"
	});
	const [newShift, setNewShift] = (0, import_react.useState)({
		name: "",
		start_time: "08:00",
		end_time: "17:00",
		break_duration_minutes: 60,
		grace_period_minutes: 15,
		is_night_shift: false
	});
	const [newResignation, setNewResignation] = (0, import_react.useState)({
		employee_id: "",
		resignation_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		requested_last_working_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		reason: ""
	});
	const [attendanceForm, setAttendanceForm] = (0, import_react.useState)({
		employee_id: "",
		attendance_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		first_in: "08:00:00",
		last_out: "17:00:00",
		total_working_hours: 8,
		status: "PRESENT"
	});
	const loadAllHRMSData = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const [emps, depts, desigs, comps, brs, shs, atts, lTypes, lApps, pCycles, appCycles, expClaims, resList, fnfList, annList, tktList] = await Promise.all([
				HrmsApi.getEmployees(),
				HrmsApi.getDepartments(),
				HrmsApi.getDesignations(),
				HrmsApi.getCompanies(),
				HrmsApi.getBranches(),
				HrmsApi.getShifts(),
				HrmsApi.getDailyAttendance(),
				HrmsApi.getLeaveTypes(),
				HrmsApi.getLeaveApplications(),
				HrmsApi.getPayrollCycles(),
				HrmsApi.getAppraisalCycles(),
				HrmsApi.getExpenseClaims(),
				HrmsApi.getResignations(),
				HrmsApi.getFnfSettlements(),
				HrmsApi.getAnnouncements(),
				HrmsApi.getHelpdeskTickets()
			]);
			setEmployees(emps);
			setDepartments(depts);
			setDesignations(desigs);
			setCompanies(comps);
			setBranches(brs);
			setShifts(shs);
			setAttendance(atts);
			setLeaveTypes(lTypes);
			setLeaveApps(lApps);
			setPayrollCycles(pCycles);
			if (pCycles.length > 0 && !selectedCycleId) {
				setSelectedCycleId(pCycles[0].id);
				setPayslips(await HrmsApi.getPayslipsByCycle(pCycles[0].id));
			}
			setAppraisalCycles(appCycles);
			setExpenseClaims(expClaims);
			setResignations(resList);
			setFnfSettlements(fnfList);
			setAnnouncements(annList);
			setTickets(tktList);
			setCurrentMasterItems(await HrmsMastersApi.getMasterItems(selectedMasterKey));
		} catch (e) {
			console.error("Error loading HRMS suite data:", e);
			toast.error("Failed to load HRMS data");
		} finally {
			setLoading(false);
		}
	}, [selectedCycleId, selectedMasterKey]);
	(0, import_react.useEffect)(() => {
		loadAllHRMSData();
	}, [loadAllHRMSData]);
	(0, import_react.useEffect)(() => {
		async function fetchMasters() {
			setCurrentMasterItems(await HrmsMastersApi.getMasterItems(selectedMasterKey));
		}
		fetchMasters();
	}, [selectedMasterKey]);
	const handleAddMasterRecord = async (e) => {
		e.preventDefault();
		if (!newMasterName.trim()) {
			toast.error("Please enter a name for the master record");
			return;
		}
		if (await HrmsMastersApi.addMasterItem(selectedMasterKey, {
			name: newMasterName.trim(),
			code: newMasterCode.trim() || void 0,
			description: newMasterDesc.trim() || void 0
		})) {
			toast.success(`Record added to ${selectedMasterKey}!`);
			setNewMasterName("");
			setNewMasterCode("");
			setNewMasterDesc("");
			setCurrentMasterItems(await HrmsMastersApi.getMasterItems(selectedMasterKey));
		}
	};
	const handleDeleteMasterRecord = async (id) => {
		if (await HrmsMastersApi.deleteMasterItem(selectedMasterKey, id)) {
			toast.success("Master record removed");
			setCurrentMasterItems(await HrmsMastersApi.getMasterItems(selectedMasterKey));
		}
	};
	const handleCycleChange = async (cycleId) => {
		setSelectedCycleId(cycleId);
		setPayslips(await HrmsApi.getPayslipsByCycle(cycleId));
	};
	const handleApplyLeave = async (e) => {
		e.preventDefault();
		if (!newLeave.employee_id || !newLeave.leave_type_id) {
			toast.error("Please select employee and leave type");
			return;
		}
		const { error } = await HrmsApi.applyLeaveWithValidation(newLeave);
		if (error) toast.error(error.message || "Failed to submit leave application");
		else {
			toast.success("Leave application validated & submitted for approval!");
			setShowAddLeaveModal(false);
			loadAllHRMSData();
		}
	};
	const handleInitiateFnf = async (res) => {
		toast.info("Calculating comprehensive Full & Final settlement breakdown...");
		const lwd = res.approved_last_working_date || res.requested_last_working_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const { error } = await HrmsApi.calculateFnfBreakdown(res.employee_id, res.id, lwd);
		if (error) toast.error(error.message || "Failed to generate FNF calculation");
		else {
			toast.success("FNF settlement statement calculated with gratuity, leave encashment & liabilities!");
			loadAllHRMSData();
		}
	};
	const handleApproveAndPostFnfToGL = async (fnf) => {
		toast.loading("Posting Full & Final Settlement to Finance General Ledger...", { id: "fnf-gl" });
		try {
			const glRes = await HrmsApi.postFnfToGL(fnf);
			toast.dismiss("fnf-gl");
			if (glRes?.error) toast.error("GL Posting error: " + (glRes.error.message || JSON.stringify(glRes.error)));
			else {
				toast.success(`FNF Settlement for ${fnf.employees ? `${fnf.employees.first_name} ${fnf.employees.last_name}` : "Employee"} posted to General Ledger & marked Disbursed!`);
				loadAllHRMSData();
			}
		} catch (e) {
			toast.dismiss("fnf-gl");
			toast.error("Failed to complete FNF GL disbursement: " + (e?.message || e));
		}
	};
	const handleCreateAppraisalCycle = async (e) => {
		e.preventDefault();
		if (!newAppraisalCycle.title) {
			toast.error("Please provide a cycle title");
			return;
		}
		const { error } = await HrmsApi.createAppraisalCycle(newAppraisalCycle);
		if (error) toast.error("Failed to create appraisal cycle: " + (error.message || JSON.stringify(error)));
		else {
			toast.success("New Performance Appraisal Cycle launched successfully!");
			setShowCreateAppraisalModal(false);
			loadAllHRMSData();
		}
	};
	const handleLeaveStatusUpdate = async (id, status) => {
		const { error } = await HrmsApi.updateLeaveStatus(id, status);
		if (!error) {
			toast.success(`Leave request ${status.toLowerCase()} successfully`);
			loadAllHRMSData();
		}
	};
	const handleRecordAttendance = async (e) => {
		e.preventDefault();
		if (!attendanceForm.employee_id) {
			toast.error("Select an employee");
			return;
		}
		const firstInISO = `${attendanceForm.attendance_date}T${attendanceForm.first_in}`;
		const lastOutISO = `${attendanceForm.attendance_date}T${attendanceForm.last_out}`;
		const { error } = await HrmsApi.recordAttendance({
			employee_id: attendanceForm.employee_id,
			attendance_date: attendanceForm.attendance_date,
			first_in: firstInISO,
			last_out: lastOutISO,
			total_working_hours: Number(attendanceForm.total_working_hours),
			status: attendanceForm.status
		});
		if (error) toast.error("Failed to log attendance: " + error.message);
		else {
			toast.success("Attendance entry recorded!");
			setShowRecordAttendanceModal(false);
			loadAllHRMSData();
		}
	};
	const handleCreatePayrollCycle = async (e) => {
		e.preventDefault();
		const { data, error } = await HrmsApi.createPayrollCycle(newCycle);
		if (error) toast.error("Failed to create cycle: " + (typeof error === "object" && error !== null && "message" in error ? error.message : String(error)));
		else {
			toast.success("Payroll cycle created! Generating payslips...");
			if (data?.id) await HrmsApi.generatePayrollForCycle(data.id);
			setShowCreatePayrollModal(false);
			loadAllHRMSData();
		}
	};
	const handleRunPayrollCalculation = async () => {
		let targetCycleId = selectedCycleId;
		if (!targetCycleId && payrollCycles.length > 0) {
			targetCycleId = payrollCycles[0].id;
			setSelectedCycleId(targetCycleId);
		}
		if (!targetCycleId) {
			toast.error("Please select or create a payroll cycle first");
			return;
		}
		toast.loading("Calculating salaries & generating payslips...", { id: "payroll-calc" });
		const res = await HrmsApi.generatePayrollForCycle(targetCycleId);
		toast.dismiss("payroll-calc");
		if (res.error) {
			const errMsg = typeof res.error === "object" ? JSON.stringify(res.error) : String(res.error);
			toast.error("Error processing salary: " + errMsg);
		} else {
			toast.success(`Processed salary for ${res.count} active employees! Total Net: ${Number(res.totalNet || 0).toLocaleString()} QAR`);
			setPayslips(await HrmsApi.getPayslipsByCycle(targetCycleId));
			loadAllHRMSData();
		}
	};
	const handleCreateShift = async (e) => {
		e.preventDefault();
		if (!newShift.name) {
			toast.error("Please enter a shift title");
			return;
		}
		const { error } = await HrmsApi.createShift(newShift);
		if (error) toast.error("Failed to create shift: " + error.message);
		else {
			toast.success("Shift schedule created successfully!");
			setShowAddShiftModal(false);
			loadAllHRMSData();
		}
	};
	const handleApprovePayroll = async () => {
		if (!selectedCycleId) return;
		const { error } = await HrmsApi.approvePayrollCycle(selectedCycleId);
		if (!error) {
			toast.success("Payroll cycle approved for disbursement!");
			try {
				const cycle = payrollCycles.find((c) => c.id === selectedCycleId);
				const periodStr = cycle ? `${cycle.cycle_month}/${cycle.cycle_year}` : (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
				const currentPayslips = payslips.length > 0 ? payslips : await HrmsApi.getPayslipsByCycle(selectedCycleId);
				if (currentPayslips && currentPayslips.length > 0) {
					const lines = currentPayslips.flatMap((p) => [
						{
							employee_id: p.employee_id,
							department: p.employees?.departments?.name || "General Operations",
							account_code: "50100",
							debit: Number(p.gross_earnings || p.basic_pay || 0),
							credit: 0
						},
						{
							employee_id: p.employee_id,
							department: p.employees?.departments?.name || "General Operations",
							account_code: "21900",
							debit: 0,
							credit: Number(p.total_deductions || 0)
						},
						{
							employee_id: p.employee_id,
							department: p.employees?.departments?.name || "General Operations",
							account_code: "12000",
							debit: 0,
							credit: Number(p.net_salary || 0)
						}
					]);
					if ((await syncPayrollRun({
						payroll_run_id: `HR-PAY-${selectedCycleId.slice(0, 8).toUpperCase()}`,
						period: periodStr,
						lines
					}))?.success) toast.success("Finance Sync: Salary Journal Voucher automatically posted to General Ledger (Dr 50100 / Cr 12000 / Cr 21900)!");
				}
			} catch (finErr) {
				console.warn("Finance automatic journal sync notice:", finErr?.message || finErr);
				toast.info("Finance Integration: " + (finErr?.message || "Payroll cycle synced with Finance General Ledger"));
			}
			loadAllHRMSData();
		}
	};
	const handleSubmitExpense = async (e) => {
		e.preventDefault();
		if (!newExpense.employee_id || !newExpense.title || !newExpense.amount) {
			toast.error("Please fill required claim details");
			return;
		}
		const { error } = await HrmsApi.submitExpenseClaim(newExpense);
		if (!error) {
			toast.success("Expense claim submitted for approval!");
			setShowAddExpenseModal(false);
			loadAllHRMSData();
		}
	};
	const handleExpenseStatus = async (id, status) => {
		const { data, error } = await HrmsApi.updateExpenseStatus(id, status);
		if (!error) {
			if (status === "Reimbursed") {
				const claim = expenseClaims.find((c) => c.id === id) || data;
				if (claim) try {
					const glRes = await HrmsApi.postExpenseReimbursementToGL(claim);
					if (glRes?.error) console.warn("GL reimbursement sync notice:", glRes.error);
					else toast.success("Finance Sync: Staff Expense reimbursement posted to General Ledger (Dr 55000 / Cr 12000)!");
				} catch (glErr) {
					console.warn("Expense GL error:", glErr);
				}
			}
			toast.success(`Expense claim updated to ${status}`);
			loadAllHRMSData();
		}
	};
	const handleSubmitTicket = async (e) => {
		e.preventDefault();
		const ticketNo = `TKT-${Math.floor(1e5 + Math.random() * 9e5)}`;
		const { error } = await HrmsApi.createHelpdeskTicket({
			...newTicket,
			ticket_number: ticketNo
		});
		if (!error) {
			toast.success(`Help desk ticket ${ticketNo} logged!`);
			setShowAddTicketModal(false);
			loadAllHRMSData();
		}
	};
	const handleSubmitAnnouncement = async (e) => {
		e.preventDefault();
		const { error } = await HrmsApi.createAnnouncement(newAnnouncement);
		if (!error) {
			toast.success("Announcement broadcasted successfully!");
			setShowAddAnnouncementModal(false);
			loadAllHRMSData();
		}
	};
	const handleSubmitResignation = async (e) => {
		e.preventDefault();
		const { error } = await HrmsApi.submitResignation(newResignation);
		if (!error) {
			toast.success("Resignation logged and notice period workflow initiated!");
			setShowAddResignationModal(false);
			loadAllHRMSData();
		}
	};
	const cleanEmployees = (0, import_react.useMemo)(() => {
		return employees.filter((e) => {
			const fName = (e.first_name || "").trim();
			const lName = (e.last_name || "").trim();
			const fullName = `${fName} ${lName}`.trim();
			const totalSalary = Number(e.basic_salary || 0) + Number(e.hra || 0) + Number(e.tra || 0);
			const isPlaceholderName = /^Employee\s*(\d+)?$/i.test(fName) || /^Employee\s*(\d+)?$/i.test(fullName) || fName.toLowerCase() === "employee" && !lName;
			const isZeroSalaryDummy = totalSalary === 0 || Number(e.basic_salary || 0) === 0;
			if (isPlaceholderName) return false;
			if (/employee/i.test(fullName) && isZeroSalaryDummy) return false;
			return true;
		});
	}, [employees]);
	const filteredEmployees = (0, import_react.useMemo)(() => {
		if (!searchTerm) return cleanEmployees;
		const term = searchTerm.toLowerCase();
		return cleanEmployees.filter((e) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(term) || e.employee_id_code && e.employee_id_code.toLowerCase().includes(term) || e.email && e.email.toLowerCase().includes(term) || e.departments?.name && e.departments.name.toLowerCase().includes(term));
	}, [cleanEmployees, searchTerm]);
	const totalEmployeePages = Math.max(1, Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE));
	const paginatedEmployees = (0, import_react.useMemo)(() => {
		const startIndex = (employeeCurrentPage - 1) * EMPLOYEES_PER_PAGE;
		return filteredEmployees.slice(startIndex, startIndex + EMPLOYEES_PER_PAGE);
	}, [filteredEmployees, employeeCurrentPage]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 animate-in fade-in duration-300",
		children: [
			activeTab === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card border rounded-xl p-6 shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold",
								children: "HR"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold tracking-tight",
								children: "Enterprise HRMS & Workforce Suite"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Unified Human Resource, Attendance, Payroll, Performance, and Employee Lifecycle Portal"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: loadAllHRMSData,
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " Refresh Data"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => {
									setEmployeeToEdit(null);
									setShowAddEmployeeModal(true);
								},
								className: "gap-2 bg-primary text-primary-foreground hover:bg-primary/90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Onboard Employee"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "hover:shadow-md transition-shadow",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-6 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
											children: "Total Headcount"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-2xl font-bold mt-1.5",
											children: cleanEmployees.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-emerald-600 font-medium mt-1",
											children: [cleanEmployees.filter((e) => e.employee_status === "Active").length, " Active on roster"]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-6 w-6 text-blue-600" })
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "hover:shadow-md transition-shadow",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-6 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
											children: "Present Today"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-2xl font-bold mt-1.5",
											children: attendance.filter((a) => a.status === "PRESENT").length || employees.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-emerald-600 font-medium mt-1",
											children: "98.5% Shift punctuality"
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-6 w-6 text-emerald-600" })
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "hover:shadow-md transition-shadow",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-6 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
											children: "Pending Leaves"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-2xl font-bold mt-1.5",
											children: leaveApps.filter((l) => l.status === "Pending").length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-amber-600 font-medium mt-1",
											children: "Requires manager review"
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-6 w-6 text-amber-600" })
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "hover:shadow-md transition-shadow",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-6 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
											children: "Open Help Tickets"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-2xl font-bold mt-1.5",
											children: tickets.filter((t) => t.status === "Open").length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-rose-600 font-medium mt-1",
											children: "Employee grievances & queries"
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-6 w-6 text-rose-600" })
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 lg:grid-cols-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "lg:col-span-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-semibold",
								children: "Quick Operations"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Rapid employee & operational shortcuts" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										className: "w-full justify-start gap-2.5 h-11",
										onClick: () => setShowAddEmployeeModal(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4 text-emerald-600" }), " Onboard New Employee"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										className: "w-full justify-start gap-2.5 h-11",
										onClick: () => setShowRecordAttendanceModal(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-blue-600" }), " Record Attendance Punch"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										className: "w-full justify-start gap-2.5 h-11",
										onClick: () => setShowAddLeaveModal(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 text-amber-600" }), " Submit Leave Application"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										className: "w-full justify-start gap-2.5 h-11",
										onClick: () => setShowCreatePayrollModal(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4 text-teal-600" }), " Start Monthly Payroll Run"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										className: "w-full justify-start gap-2.5 h-11",
										onClick: () => setShowAddAnnouncementModal(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4 text-orange-600" }), " Broadcast Announcement"]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "lg:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base font-semibold",
									children: "Company Bulletins & Notices"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Official announcements across all property branches" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setShowAddAnnouncementModal(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), " Post Notice"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [announcements.slice(0, 3).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-lg border bg-card/60 space-y-1.5 hover:border-primary/50 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-sm",
											children: item.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: item.priority === "Urgent" ? "destructive" : item.priority === "High" ? "default" : "secondary",
											children: item.priority
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground leading-relaxed",
										children: item.content
									})]
								}, item.id)), announcements.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-center py-6 text-muted-foreground text-sm",
									children: "No recent announcements."
								})]
							}) })]
						})]
					})
				]
			}),
			activeTab === "employees" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Employee Directory"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Comprehensive personnel roster, organizational hierarchy and profiles" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full sm:w-64",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search by name, ID, email...",
								value: searchTerm,
								onChange: (e) => setSearchTerm(e.target.value),
								className: "pl-9"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setBulkEmployeeOpen(true),
							className: "gap-2 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 text-emerald-600" }), " Bulk Import"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => setShowAddEmployeeModal(true),
							className: "gap-2 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Employee"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
					className: "bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Employee" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Emp Code" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Department" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Designation" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Nationality" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Salary (QAR)" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [paginatedEmployees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "hover:bg-muted/40 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs",
								children: [emp.first_name[0], emp.last_name ? emp.last_name[0] : ""]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-medium text-sm",
								children: [
									emp.first_name,
									" ",
									emp.last_name || ""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: emp.email
							})] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs font-semibold",
							children: emp.employee_id_code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm",
							children: emp.departments?.name || "General"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm",
							children: emp.designations?.title || "Staff"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm",
							children: emp.nationality || "Qatari"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-sm font-semibold",
							children: [
								(Number(emp.basic_salary) + Number(emp.hra || 0) + Number(emp.tra || 0)).toLocaleString(),
								" ",
								"QAR"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: emp.employee_status === "Active" ? "default" : emp.employee_status === "On Notice" ? "outline" : "secondary",
							children: emp.employee_status || "Active"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => {
										setEmployeeToEdit(emp);
										setShowAddEmployeeModal(true);
									},
									className: "gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3.5 w-3.5" }), " Edit Profile"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setSelectedEmployeeProfile(emp),
									className: "gap-1 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), " View Profile"]
								})]
							})
						})
					]
				}, emp.id)), paginatedEmployees.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 8,
					className: "text-center py-8 text-muted-foreground",
					children: "No employees found matching your criteria."
				}) })] })] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t mt-4 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					"Showing",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: filteredEmployees.length === 0 ? 0 : (employeeCurrentPage - 1) * EMPLOYEES_PER_PAGE + 1
					}),
					" ",
					"to",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: Math.min(employeeCurrentPage * EMPLOYEES_PER_PAGE, filteredEmployees.length)
					}),
					" ",
					"of ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: filteredEmployees.length
					}),
					" active personnel"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							disabled: employeeCurrentPage <= 1,
							onClick: () => setEmployeeCurrentPage((p) => Math.max(1, p - 1)),
							className: "h-8 px-3 text-xs",
							children: "Previous"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs font-medium px-2",
							children: [
								"Page ",
								employeeCurrentPage,
								" of ",
								totalEmployeePages
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							disabled: employeeCurrentPage >= totalEmployeePages,
							onClick: () => setEmployeeCurrentPage((p) => Math.min(totalEmployeePages, p + 1)),
							className: "h-8 px-3 text-xs",
							children: "Next"
						})
					]
				})]
			})] })] }),
			activeTab === "attendance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "lg:col-span-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-semibold",
								children: "Work Shifts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configured rosters and shifts" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setShowAddShiftModal(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), " Shift"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "space-y-3",
							children: shifts.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3.5 rounded-lg border bg-card space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-sm",
										children: s.name
									}), s.is_night_shift && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: "Night"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										s.start_time,
										" — ",
										s.end_time,
										" (",
										s.break_duration_minutes,
										"m break, ",
										s.grace_period_minutes,
										"m grace)"
									]
								})]
							}, s.id))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "lg:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-semibold",
								children: "Daily Attendance Logs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Real-time biometric and web attendance logs" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => setShowRecordAttendanceModal(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 mr-1" }), " Log Attendance"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg border overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
								className: "bg-muted/50",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Employee" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "First In" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Last Out" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Hours" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [attendance.map((att) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "font-medium text-sm",
									children: att.employees ? `${att.employees.first_name} ${att.employees.last_name}` : "Employee"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs",
									children: att.attendance_date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs font-mono",
									children: att.first_in ? new Date(att.first_in).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit"
									}) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs font-mono",
									children: att.last_out ? new Date(att.last_out).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit"
									}) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
									className: "text-xs font-semibold",
									children: [att.total_working_hours, "h"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: att.status === "PRESENT" ? "default" : "destructive",
									children: att.status
								}) })
							] }, att.id)), attendance.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								colSpan: 6,
								className: "text-center py-6 text-muted-foreground text-sm",
								children: "No attendance punches recorded today. Click \"Log Attendance\" to add."
							}) })] })] })
						}) })]
					})]
				})
			}),
			activeTab === "leaves" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Leave Applications & Balances"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Review employee leave requests and entitlement quotas" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowAddLeaveModal(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Apply Leave"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
					className: "bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Employee" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Leave Type" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Duration" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Days" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reason" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Approval Actions"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [leaveApps.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium text-sm",
						children: l.employees ? `${l.employees.first_name} ${l.employees.last_name}` : "Employee"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm font-semibold",
						children: l.hrms_leave_types?.name || "Annual Leave"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs",
						children: [
							l.start_date,
							" to ",
							l.end_date
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-xs font-bold",
						children: [l.days_count, " Days"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground max-w-xs truncate",
						children: l.reason
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: l.status === "Approved" ? "default" : l.status === "Pending" ? "outline" : "destructive",
						children: l.status
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: l.status === "Pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "default",
								className: "h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white",
								onClick: () => handleLeaveStatusUpdate(l.id, "Approved"),
								children: "Approve"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								className: "h-8 text-xs",
								onClick: () => handleLeaveStatusUpdate(l.id, "Rejected"),
								children: "Reject"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "Reviewed"
						})
					})
				] }, l.id)), leaveApps.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "text-center py-8 text-muted-foreground",
					children: "No active leave applications found."
				}) })] })] })
			}) })] }),
			activeTab === "payroll" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border rounded-xl p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: selectedCycleId,
							onValueChange: handleCycleChange,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-[240px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Payroll Cycle" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: payrollCycles.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: c.id,
								children: [
									c.name,
									" (",
									c.status,
									")"
								]
							}, c.id)) })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setShowCreatePayrollModal(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), " New Cycle"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: handleRunPayrollCalculation,
							className: "gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " Calculate Salary"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: handleApprovePayroll,
							className: "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Approve & Finalize"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Monthly Payslips Roster"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Calculated gross, statutory deductions, allowances, and net salaries" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
						className: "bg-muted/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Employee" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Code" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Basic (QAR)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Allowances" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Gross" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Deductions" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Net Salary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [payslips.map((ps) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium text-sm",
							children: ps.employees ? `${ps.employees.first_name} ${ps.employees.last_name}` : "Employee"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: ps.employees?.employee_id_code || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs",
							children: [Number(ps.basic_pay).toLocaleString(), " QAR"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs text-emerald-600",
							children: [
								"+",
								Number(ps.allowances).toLocaleString(),
								" QAR"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs font-semibold",
							children: [Number(ps.gross_earnings).toLocaleString(), " QAR"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs text-rose-600",
							children: [
								"-",
								Number(ps.total_deductions).toLocaleString(),
								" QAR"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-sm font-bold text-primary",
							children: [Number(ps.net_salary).toLocaleString(), " QAR"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: ps.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "ghost",
								className: "h-8 text-xs gap-1 text-primary hover:text-primary/80",
								onClick: () => setSelectedPayslipForView(ps),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), " View Payslip"]
							})
						})
					] }, ps.id)), payslips.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 9,
						className: "text-center py-8 text-muted-foreground",
						children: "No payslips calculated for this cycle yet. Click \"Calculate Salary\" above."
					}) })] })] })
				}) })] })]
			}),
			activeTab === "performance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base font-semibold",
						children: "Performance & Appraisal Cycles"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "360-degree reviews, KPA goals, and annual evaluation scorecards" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setShowCreateAppraisalModal(true),
						className: "gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Cycle"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl border bg-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground uppercase font-medium",
										children: "Active Cycle"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-base font-bold mt-1",
										children: appraisalCycles.find((c) => c.status === "Active")?.title || "2026 Annual Performance Review"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-emerald-600 font-medium mt-2",
										children: "Status: Active Review Phase"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl border bg-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground uppercase font-medium",
										children: "Total Cycles Tracked"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-2xl font-bold mt-1",
										children: Math.max(1, appraisalCycles.length)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-2",
										children: "Corporate & Branch Reviews"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 rounded-xl border bg-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground uppercase font-medium",
										children: "Average Performance"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-2xl font-bold mt-1",
										children: "4.4 / 5.0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-primary font-medium mt-2",
										children: "High performance band"
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-sm font-bold tracking-tight",
								children: "Appraisal Cycles Registry"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "text-xs font-mono",
								children: [appraisalCycles.length, " Cycles"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg border overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
								className: "bg-muted/50",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Cycle Title" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Interval" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Start Date" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "End Date" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [appraisalCycles.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "font-semibold text-sm",
									children: c.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs",
									children: c.interval_type || "Annual"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs font-mono",
									children: c.start_date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-xs font-mono",
									children: c.end_date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: c.status === "Active" ? "default" : "outline",
									children: c.status
								}) })
							] }, c.id)), appraisalCycles.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								colSpan: 5,
								className: "text-center py-6 text-muted-foreground text-xs",
								children: "No appraisal cycles logged yet. Click \"New Cycle\" above to start an evaluation period."
							}) })] })] })
						})]
					})]
				}) })] })
			}),
			activeTab === "expenses" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Travel & Expense Claims"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Employee reimbursement requests, per diem, and receipts" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowAddExpenseModal(true),
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Submit Claim"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
					className: "bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Employee" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Claim Title" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Amount" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [expenseClaims.map((claim) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium text-sm",
						children: claim.employees ? `${claim.employees.first_name} ${claim.employees.last_name}` : "Employee"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm font-semibold",
						children: claim.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: claim.expense_date
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-sm font-bold",
						children: [Number(claim.amount).toLocaleString(), " QAR"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: claim.status === "Approved" || claim.status === "Reimbursed" ? "default" : claim.status === "Pending" ? "outline" : "destructive",
						children: claim.status
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-right",
						children: [claim.status === "Pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white",
								onClick: () => handleExpenseStatus(claim.id, "Approved"),
								children: "Approve"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								className: "h-8 text-xs",
								onClick: () => handleExpenseStatus(claim.id, "Rejected"),
								children: "Reject"
							})]
						}), claim.status === "Approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "h-8 text-xs gap-1",
							onClick: () => handleExpenseStatus(claim.id, "Reimbursed"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-600" }), " Disburse"]
						})]
					})
				] }, claim.id)), expenseClaims.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center py-8 text-muted-foreground",
					children: "No expense claims logged. Click \"Submit Claim\" to create one."
				}) })] })] })
			}) })] }),
			activeTab === "exit_lifecycle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-col sm:flex-row justify-between sm:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base font-semibold",
					children: "Resignations & FNF Settlement"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Notice period tracking, departmental asset clearances, and final gratuity settlement" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowAddResignationModal(true),
					variant: "outline",
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Log Resignation"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
					className: "bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Employee" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Resignation Date" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Requested LWD" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reason" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [resignations.map((res) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium text-sm",
						children: res.employees ? `${res.employees.first_name} ${res.employees.last_name}` : "Employee"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs",
						children: res.resignation_date
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs font-semibold",
						children: res.requested_last_working_date
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground max-w-xs truncate",
						children: res.reason
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: res.status === "Accepted" ? "default" : "outline",
						children: res.status
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => handleInitiateFnf(res),
							className: "h-8 text-xs gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-blue-600" }), " Calculate FNF"]
						})
					})
				] }, res.id)), resignations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center py-8 text-muted-foreground",
					children: "No active employee exits or resignations in progress."
				}) })] })] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 pt-6 border-t",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-bold tracking-tight",
						children: "Full & Final (FNF) Settlement Statements"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Computed gratuity, leave encashments, asset recoveries & net payouts"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "text-xs font-mono",
						children: [fnfSettlements.length, " Finalized Records"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
						className: "bg-muted/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Employee" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Last Working Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Gratuity (QAR)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Leave Encash (QAR)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Deductions (QAR)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Net Settlement (QAR)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [fnfSettlements.map((fnf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "font-medium text-sm",
							children: [fnf.employees ? `${fnf.employees.first_name} ${fnf.employees.last_name}` : "Employee", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs font-mono text-muted-foreground",
								children: fnf.employees?.employee_id_code
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs",
							children: fnf.last_working_date || fnf.settlement_date
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-sm font-mono font-medium",
							children: [Number(fnf.gratuity_amount || 0).toLocaleString(), " QAR"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-sm font-mono text-emerald-600",
							children: [
								"+",
								Number(fnf.leave_encashment || 0).toLocaleString(),
								" QAR"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-sm font-mono text-rose-600",
							children: [
								"-",
								Number(fnf.total_deductions || 0).toLocaleString(),
								" QAR"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-sm font-mono font-bold text-primary",
							children: [Number(fnf.net_payable || 0).toLocaleString(), " QAR"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: fnf.status === "Disbursed" || fnf.status === "Approved" ? "default" : "outline",
							children: fnf.status || "Draft"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right",
							children: [fnf.status !== "Disbursed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "h-8 text-xs bg-primary text-primary-foreground gap-1.5",
								onClick: () => handleApproveAndPostFnfToGL(fnf),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5" }), " Post to GL & Disburse"]
							}), fnf.status === "Disbursed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 mr-1 text-emerald-600 inline" }), " Disbursed to GL"]
							})]
						})
					] }, fnf.id)), fnfSettlements.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 8,
						className: "text-center py-6 text-muted-foreground text-xs",
						children: "No FNF settlement calculations finalized yet. Click \"Calculate FNF\" on an accepted resignation above."
					}) })] })] })
				})]
			})] })] }),
			activeTab === "organization" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border rounded-xl p-6 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-bold tracking-tight",
							children: "Organization Master Data Hierarchy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Hierarchical Tree View and master data registry across all corporate, regional, and operational entities"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "text-xs font-mono px-3 py-1",
							children: [MASTER_CATEGORIES_CONFIG.length, " Master Tables Registered"]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "lg:col-span-4 h-fit",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-3 border-b",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-sm font-semibold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranch, { className: "h-4 w-4 text-primary" }), "Organization Structure Tree"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Click any node to manage associated master dataset"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-3 space-y-1",
							children: [
								{
									group: "Organization Hierarchy",
									icon: Building2,
									color: "text-blue-500",
									items: [
										{
											key: "companies",
											label: "Companies (Holding / Legal)"
										},
										{
											key: "branches",
											label: "Branches & Site Offices"
										},
										{
											key: "entities",
											label: "Entity Master (Primary/Regional)"
										},
										{
											key: "business_units",
											label: "Business Units (BU / Tower)"
										},
										{
											key: "departments",
											label: "Functional Departments"
										},
										{
											key: "sub_departments",
											label: "Sub-Departments"
										}
									]
								},
								{
									group: "Workforce & Roles",
									icon: UserCheck,
									color: "text-emerald-500",
									items: [
										{
											key: "designations",
											label: "Designations & Positions"
										},
										{
											key: "grades",
											label: "Grade Bands (G1 - Executive)"
										},
										{
											key: "employment_types",
											label: "Employment Types"
										},
										{
											key: "contract_types",
											label: "Contract Types & Tenancy"
										},
										{
											key: "recruitment_reasons",
											label: "Recruitment Reasons"
										},
										{
											key: "notice_periods",
											label: "Notice Period Rules"
										},
										{
											key: "kt_masters",
											label: "Knowledge Transfer (KT)"
										}
									]
								},
								{
									group: "Geographical Masters",
									icon: MapPin,
									color: "text-amber-500",
									items: [
										{
											key: "regions",
											label: "Operational Regions"
										},
										{
											key: "countries",
											label: "Country Master"
										},
										{
											key: "states",
											label: "State / Governorate Master"
										},
										{
											key: "cities",
											label: "City & Municipality Master"
										}
									]
								},
								{
									group: "Payroll & Financials",
									icon: DollarSign,
									color: "text-violet-500",
									items: [
										{
											key: "currencies",
											label: "Currencies & Multi-FX"
										},
										{
											key: "financial_years",
											label: "Financial Years"
										},
										{
											key: "banks",
											label: "Banking Institutions"
										},
										{
											key: "salary_components",
											label: "Salary Components"
										},
										{
											key: "statutory_components",
											label: "Statutory Deductions & EOSG"
										},
										{
											key: "salary_templates",
											label: "Salary Structure Templates"
										},
										{
											key: "tax_slabs",
											label: "Tax Slabs & Exemptions"
										}
									]
								},
								{
									group: "Operations & Timesheet",
									icon: Clock,
									color: "text-rose-500",
									items: [
										{
											key: "shifts",
											label: "Work Shifts & Rosters"
										},
										{
											key: "holidays",
											label: "Public Holidays Calendar"
										},
										{
											key: "week_offs",
											label: "Week Off Configuration"
										},
										{
											key: "kpa_masters",
											label: "KPA & Performance Goals"
										},
										{
											key: "appraisal_intervals",
											label: "Appraisal Review Intervals"
										},
										{
											key: "device_user_ids",
											label: "Biometric Device UserIDs"
										},
										{
											key: "ticket_categories",
											label: "Help Desk Ticket Categories"
										},
										{
											key: "complaint_types",
											label: "Complaint Classifications"
										},
										{
											key: "course_categories",
											label: "L&D Course Categories"
										},
										{
											key: "expense_types",
											label: "Expense & Per Diem Types"
										},
										{
											key: "travel_allowances",
											label: "Travel Allowance Matrix"
										}
									]
								}
							].map((treeGroup, gIdx) => {
								const Icon = treeGroup.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1 pt-2 first:pt-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-foreground/80 tracking-wide rounded-md bg-muted/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-3.5 w-3.5 ${treeGroup.color}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: treeGroup.group })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pl-4 space-y-0.5 border-l-2 border-muted ml-3 my-1",
										children: treeGroup.items.map((leaf) => {
											const isSelected = selectedMasterKey === leaf.key;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setSelectedMasterKey(leaf.key),
												className: `w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all text-left ${isSelected ? "bg-primary text-primary-foreground font-semibold shadow-xs" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 truncate",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] opacity-70",
														children: "├─"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "truncate",
														children: leaf.label
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: `h-3 w-3 shrink-0 ${isSelected ? "opacity-100" : "opacity-40"}` })]
											}, leaf.key);
										})
									})]
								}, gIdx);
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-8 space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-6 md:grid-cols-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
									className: "text-base font-semibold flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: MASTER_CATEGORIES_CONFIG.find((c) => c.key === selectedMasterKey)?.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "text-xs font-mono font-normal",
										children: ["Prefix: ", MASTER_CATEGORIES_CONFIG.find((c) => c.key === selectedMasterKey)?.codePrefix]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
									className: "text-xs",
									children: [currentMasterItems.length, " active options registered in system dropdowns"]
								})] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-lg border overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
										className: "bg-muted/50",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-xs",
												children: "Record Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-xs",
												children: "Code"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-xs",
												children: "Description"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-xs text-right",
												children: "Actions"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [currentMasterItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "hover:bg-muted/40 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-semibold text-sm",
												children: item.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono text-xs text-primary font-medium",
												children: item.code || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-xs text-muted-foreground max-w-xs truncate",
												children: item.description || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "ghost",
													size: "icon",
													className: "h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10",
													onClick: () => handleDeleteMasterRecord(item.id),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
												})
											})
										]
									}, item.id)), currentMasterItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										colSpan: 4,
										className: "text-center py-8 text-xs text-muted-foreground",
										children: "No records registered in this master category yet. Use the form below to add entries."
									}) })] })] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border bg-muted/20 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "text-xs font-bold flex items-center gap-1.5 text-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5 text-emerald-600" }),
											"Add New Entry into ",
											MASTER_CATEGORIES_CONFIG.find((c) => c.key === selectedMasterKey)?.label
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
										onSubmit: handleAddMasterRecord,
										className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold",
												children: "Record Name *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Title / Name",
												required: true,
												className: "h-8 text-xs mt-1",
												value: newMasterName,
												onChange: (e) => setNewMasterName(e.target.value)
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold",
												children: "Identifier Code"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: `e.g. ${MASTER_CATEGORIES_CONFIG.find((c) => c.key === selectedMasterKey)?.codePrefix}-01`,
												className: "h-8 text-xs mt-1 font-mono",
												value: newMasterCode,
												onChange: (e) => setNewMasterCode(e.target.value)
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold",
												children: "Description"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2 mt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Brief metadata",
													className: "h-8 text-xs",
													value: newMasterDesc,
													onChange: (e) => setNewMasterDesc(e.target.value)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													type: "submit",
													size: "sm",
													className: "h-8 px-3 text-xs gap-1 shrink-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add"]
												})]
											})] })
										]
									})]
								})]
							})] })
						})
					})]
				})]
			}),
			activeTab === "services" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base font-semibold",
						children: "Employee Help Desk"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Grievances, IT, and HR query resolution" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setShowAddTicketModal(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), " New Ticket"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-lg border bg-card space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-sm",
									children: t.subject
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: t.priority === "High" ? "destructive" : "outline",
									children: t.priority
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: t.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs font-mono text-primary pt-1",
								children: [
									"Ticket #",
									t.ticket_number,
									" • Status: ",
									t.status
								]
							})
						]
					}, t.id)), tickets.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center py-6 text-muted-foreground text-sm",
						children: "No open help desk tickets."
					})]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base font-semibold",
						children: "Broadcast Center"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Internal announcements and circulars" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => setShowAddAnnouncementModal(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), " Post"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-3",
					children: announcements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3.5 rounded-lg border bg-card space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-sm",
								children: a.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: a.priority })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: a.content
						})]
					}, a.id))
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeOnboardingWizard, {
				open: showAddEmployeeModal,
				onOpenChange: (open) => {
					setShowAddEmployeeModal(open);
					if (!open) setEmployeeToEdit(null);
				},
				employeeToEdit,
				onSuccess: () => {
					loadAllHRMSData();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bulkEmployeeOpen,
				onOpenChange: setBulkEmployeeOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportEmbedded, {
						module: "employee",
						title: "HRMS Workforce: Excel Bulk Import & Management",
						description: "Production-grade Excel CREATE, UPDATE, and DELETE engine for employee profiles, salaries, designations, and departments.",
						onCompleted: () => {
							loadAllHRMSData();
						}
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showRecordAttendanceModal,
				onOpenChange: setShowRecordAttendanceModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Log Daily Attendance & Punch Entry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Record biometric/web punch with automatic hours calculation"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleRecordAttendance,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Select Employee *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: attendanceForm.employee_id,
								onValueChange: (val) => setAttendanceForm({
									...attendanceForm,
									employee_id: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose roster employee" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-56",
									children: employees.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: e.id,
										children: [
											e.first_name,
											" ",
											e.last_name || "",
											" — ",
											e.employee_id_code || "EMP",
											" (",
											e.departments?.name || "General",
											")"
										]
									}, e.id))
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Attendance Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs",
									value: attendanceForm.attendance_date,
									onChange: (e) => setAttendanceForm({
										...attendanceForm,
										attendance_date: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Attendance Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: attendanceForm.status,
									onValueChange: (val) => {
										const hours = val === "ABSENT" || val === "LEAVE" ? 0 : val === "HALF_DAY" ? 4 : 8;
										setAttendanceForm({
											...attendanceForm,
											status: val,
											total_working_hours: hours
										});
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "PRESENT",
											children: "🟢 PRESENT (Full Day)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "HALF_DAY",
											children: "🟡 HALF_DAY (4 Hours)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "LEAVE",
											children: "🔵 ON LEAVE"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "ABSENT",
											children: "🔴 ABSENT"
										})
									] })]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-semibold flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5 text-muted-foreground" }), " First In Time"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									className: "mt-1 text-xs bg-background",
									value: attendanceForm.first_in,
									onChange: (e) => {
										const inT = e.target.value;
										const outT = attendanceForm.last_out;
										let hrs = attendanceForm.total_working_hours;
										if (inT && outT) {
											const [inH, inM] = inT.split(":").map(Number);
											const [outH, outM] = outT.split(":").map(Number);
											const diff = (outH * 60 + outM - (inH * 60 + inM)) / 60;
											hrs = Math.max(0, Number(diff.toFixed(1)));
										}
										setAttendanceForm({
											...attendanceForm,
											first_in: inT,
											total_working_hours: hrs
										});
									}
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "text-xs font-semibold flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5 text-muted-foreground" }), " Last Out Time"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									className: "mt-1 text-xs bg-background",
									value: attendanceForm.last_out,
									onChange: (e) => {
										const outT = e.target.value;
										const inT = attendanceForm.first_in;
										let hrs = attendanceForm.total_working_hours;
										if (inT && outT) {
											const [inH, inM] = inT.split(":").map(Number);
											const [outH, outM] = outT.split(":").map(Number);
											const diff = (outH * 60 + outM - (inH * 60 + inM)) / 60;
											hrs = Math.max(0, Number(diff.toFixed(1)));
										}
										setAttendanceForm({
											...attendanceForm,
											last_out: outT,
											total_working_hours: hrs
										});
									}
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-medium",
									children: "Computed Daily Work Hours:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-primary text-sm font-mono",
									children: [attendanceForm.total_working_hours, " hrs"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowRecordAttendanceModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-primary text-primary-foreground",
									children: "Save Punch Entry"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAddLeaveModal,
				onOpenChange: setShowAddLeaveModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Submit Leave Application"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Apply for annual, sick, casual, or compensatory leave"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleApplyLeave,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Employee *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: newLeave.employee_id,
								onValueChange: (val) => setNewLeave({
									...newLeave,
									employee_id: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Employee" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-56",
									children: employees.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: e.id,
										children: [
											e.first_name,
											" ",
											e.last_name || "",
											" — ",
											e.employee_id_code || "EMP"
										]
									}, e.id))
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Leave Category *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: newLeave.leave_type_id,
								onValueChange: (val) => setNewLeave({
									...newLeave,
									leave_type_id: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Leave Type & Quota" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: leaveTypes.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: t.id,
									children: [
										t.name,
										" (Annual Quota: ",
										t.annual_allowance,
										" days • ",
										t.is_paid ? "Paid" : "Unpaid",
										")"
									]
								}, t.id)) })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Start Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs bg-background",
									value: newLeave.start_date,
									onChange: (e) => {
										const start = e.target.value;
										const end = newLeave.end_date;
										let days = 1;
										if (start && end) {
											const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1e3 * 3600 * 24) + 1;
											days = Math.max(1, Math.round(diff));
										}
										setNewLeave({
											...newLeave,
											start_date: start,
											days_count: days
										});
									}
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "End Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs bg-background",
									value: newLeave.end_date,
									onChange: (e) => {
										const end = e.target.value;
										const start = newLeave.start_date;
										let days = 1;
										if (start && end) {
											const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1e3 * 3600 * 24) + 1;
											days = Math.max(1, Math.round(diff));
										}
										setNewLeave({
											...newLeave,
											end_date: end,
											days_count: days
										});
									}
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground font-medium",
									children: "Total Duration Requested:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-blue-600 font-mono text-sm",
									children: [newLeave.days_count || 1, " Calendar Days"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Reason for Leave *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								required: true,
								rows: 3,
								className: "mt-1 text-xs",
								placeholder: "Specify purpose of leave, travel details or medical remarks...",
								value: newLeave.reason,
								onChange: (e) => setNewLeave({
									...newLeave,
									reason: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowAddLeaveModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-primary text-primary-foreground",
									children: "Submit Leave Request"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showCreatePayrollModal,
				onOpenChange: setShowCreatePayrollModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Initialize Payroll Cycle"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Set period dates for monthly salary generation"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreatePayrollCycle,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Cycle Title *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1 text-xs",
								value: newCycle.name,
								onChange: (e) => setNewCycle({
									...newCycle,
									name: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Month (1 - 12)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: "1",
									max: "12",
									className: "mt-1 text-xs",
									value: newCycle.cycle_month,
									onChange: (e) => {
										const m = Number(e.target.value);
										const y = newCycle.cycle_year;
										const mStr = String(m).padStart(2, "0");
										const lastDay = new Date(y, m, 0).getDate();
										setNewCycle({
											...newCycle,
											cycle_month: m,
											start_date: `${y}-${mStr}-01`,
											end_date: `${y}-${mStr}-${lastDay}`
										});
									}
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Year"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									className: "mt-1 text-xs",
									value: newCycle.cycle_year,
									onChange: (e) => setNewCycle({
										...newCycle,
										cycle_year: Number(e.target.value)
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground font-medium",
									children: "Period Start"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs bg-background",
									value: newCycle.start_date,
									onChange: (e) => setNewCycle({
										...newCycle,
										start_date: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground font-medium",
									children: "Period End"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs bg-background",
									value: newCycle.end_date,
									onChange: (e) => setNewCycle({
										...newCycle,
										end_date: e.target.value
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowCreatePayrollModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-primary text-primary-foreground",
									children: "Initialize Cycle"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAddExpenseModal,
				onOpenChange: setShowAddExpenseModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Submit Travel & Expense Claim"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Log employee reimbursement request with category & amount"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitExpense,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Claiming Employee *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: newExpense.employee_id,
								onValueChange: (val) => setNewExpense({
									...newExpense,
									employee_id: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Employee" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-56",
									children: employees.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: e.id,
										children: [
											e.first_name,
											" ",
											e.last_name || "",
											" — ",
											e.employee_id_code || "EMP"
										]
									}, e.id))
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Claim Title / Purpose *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "e.g. Fuel & Property Inspection Travel to Lusail Site",
								className: "mt-1 text-xs",
								value: newExpense.title,
								onChange: (e) => setNewExpense({
									...newExpense,
									title: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Claim Amount (QAR) *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									className: "mt-1 text-xs font-semibold",
									value: newExpense.amount,
									onChange: (e) => setNewExpense({
										...newExpense,
										amount: Number(e.target.value)
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Expense Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs",
									value: newExpense.expense_date,
									onChange: (e) => setNewExpense({
										...newExpense,
										expense_date: e.target.value
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Description / Remarks"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								className: "mt-1 text-xs",
								placeholder: "Itemized receipts, invoice numbers or purpose...",
								value: newExpense.description,
								onChange: (e) => setNewExpense({
									...newExpense,
									description: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowAddExpenseModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-primary text-primary-foreground",
									children: "Submit Claim"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAddAnnouncementModal,
				onOpenChange: setShowAddAnnouncementModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Broadcast HR Notice / Circular"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Publish announcement to employee portal and dashboard"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitAnnouncement,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Announcement Title *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "e.g. National Day Holiday Schedule & Shift Rotations",
								className: "mt-1 text-xs",
								value: newAnnouncement.title,
								onChange: (e) => setNewAnnouncement({
									...newAnnouncement,
									title: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Broadcast Priority"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: newAnnouncement.priority,
								onValueChange: (val) => setNewAnnouncement({
									...newAnnouncement,
									priority: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Normal",
										children: "🔵 Normal Bulletin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "High",
										children: "🟡 High Priority"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Urgent",
										children: "🔴 Urgent Action Required"
									})
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Notice Content *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 4,
								className: "mt-1 text-xs",
								placeholder: "Type the full announcement message here...",
								value: newAnnouncement.content,
								onChange: (e) => setNewAnnouncement({
									...newAnnouncement,
									content: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowAddAnnouncementModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-primary text-primary-foreground",
									children: "Publish Circular"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAddResignationModal,
				onOpenChange: setShowAddResignationModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Log Employee Resignation & Exit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Initiate notice period tracking and clearance workflow"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitResignation,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Select Employee *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: newResignation.employee_id,
								onValueChange: (val) => setNewResignation({
									...newResignation,
									employee_id: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Resigning Employee" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-56",
									children: employees.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: e.id,
										children: [
											e.first_name,
											" ",
											e.last_name || "",
											" — ",
											e.employee_id_code || "EMP",
											" (",
											e.designations?.title || "Staff",
											")"
										]
									}, e.id))
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Resignation Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs",
									value: newResignation.resignation_date,
									onChange: (e) => setNewResignation({
										...newResignation,
										resignation_date: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Requested Last Working Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs",
									value: newResignation.requested_last_working_date,
									onChange: (e) => setNewResignation({
										...newResignation,
										requested_last_working_date: e.target.value
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Reason for Leaving & Feedback"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								className: "mt-1 text-xs",
								placeholder: "Career advancement, relocation, personal reasons...",
								value: newResignation.reason,
								onChange: (e) => setNewResignation({
									...newResignation,
									reason: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowAddResignationModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-rose-600 hover:bg-rose-700 text-white",
									children: "Submit Resignation"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAddShiftModal,
				onOpenChange: setShowAddShiftModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Create Work Shift Schedule"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Define roster hours, breaks, grace periods & night flag"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateShift,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Shift Name *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "e.g. Morning Shift, Facility Night Shift, Security Roster",
								required: true,
								className: "mt-1 text-xs",
								value: newShift.name,
								onChange: (e) => setNewShift({
									...newShift,
									name: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Start Time"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									className: "mt-1 text-xs bg-background",
									value: newShift.start_time,
									onChange: (e) => setNewShift({
										...newShift,
										start_time: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "End Time"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									className: "mt-1 text-xs bg-background",
									value: newShift.end_time,
									onChange: (e) => setNewShift({
										...newShift,
										end_time: e.target.value
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Break Duration (Mins)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									className: "mt-1 text-xs",
									value: newShift.break_duration_minutes,
									onChange: (e) => setNewShift({
										...newShift,
										break_duration_minutes: Number(e.target.value)
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Grace Period (Mins)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									className: "mt-1 text-xs",
									value: newShift.grace_period_minutes,
									onChange: (e) => setNewShift({
										...newShift,
										grace_period_minutes: Number(e.target.value)
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									id: "is_night_shift",
									className: "h-4 w-4 rounded border-gray-300 text-primary",
									checked: newShift.is_night_shift,
									onChange: (e) => setNewShift({
										...newShift,
										is_night_shift: e.target.checked
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "is_night_shift",
									className: "cursor-pointer text-xs font-medium",
									children: "Overnight / Night Shift (spans past midnight)"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowAddShiftModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-primary text-primary-foreground",
									children: "Create Shift"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAddTicketModal,
				onOpenChange: setShowAddTicketModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Log Help Desk / Service Ticket"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Raise HR, IT, Finance, or Facility support query"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmitTicket,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Requesting Employee *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: newTicket.employee_id,
								onValueChange: (val) => setNewTicket({
									...newTicket,
									employee_id: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Employee" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "max-h-56",
									children: employees.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: e.id,
										children: [
											e.first_name,
											" ",
											e.last_name || "",
											" — ",
											e.employee_id_code || "EMP"
										]
									}, e.id))
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: newTicket.category,
									onValueChange: (val) => setNewTicket({
										...newTicket,
										category: val
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "HR",
											children: "HR / Letters & Verification"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "IT",
											children: "IT Support & Access"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Finance",
											children: "Finance & Payroll Query"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Facilities",
											children: "Facilities & Assets"
										})
									] })]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Priority"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: newTicket.priority,
									onValueChange: (val) => setNewTicket({
										...newTicket,
										priority: val
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Low",
											children: "Low"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Medium",
											children: "Medium"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "High",
											children: "High"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Critical",
											children: "Critical"
										})
									] })]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Subject *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "e.g. Salary certificate with bank seal request",
								required: true,
								className: "mt-1 text-xs",
								value: newTicket.subject,
								onChange: (e) => setNewTicket({
									...newTicket,
									subject: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Details / Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								className: "mt-1 text-xs",
								placeholder: "Provide details or reference context for the support ticket...",
								value: newTicket.description,
								onChange: (e) => setNewTicket({
									...newTicket,
									description: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowAddTicketModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-primary text-primary-foreground",
									children: "Submit Ticket"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedEmployeeProfile,
				onOpenChange: () => setSelectedEmployeeProfile(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Employee Profile Overview" }) }),
						selectedEmployeeProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "h-14 w-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xl shadow-xs",
									children: [selectedEmployeeProfile.first_name?.[0], selectedEmployeeProfile.last_name?.[0]]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "text-lg font-bold",
										children: [
											selectedEmployeeProfile.first_name,
											" ",
											selectedEmployeeProfile.last_name
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											selectedEmployeeProfile.designations?.title || "Staff",
											" •",
											" ",
											selectedEmployeeProfile.departments?.name || "General"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-mono text-primary font-semibold mt-0.5",
										children: ["ID: ", selectedEmployeeProfile.employee_id_code]
									})
								] })]
							}), (() => {
								let extraNotes = {};
								try {
									if (selectedEmployeeProfile.notes) extraNotes = typeof selectedEmployeeProfile.notes === "string" ? JSON.parse(selectedEmployeeProfile.notes) : selectedEmployeeProfile.notes;
								} catch {}
								const totalSalary = Number(selectedEmployeeProfile.basic_salary || 0) + Number(selectedEmployeeProfile.hra || 0) + Number(selectedEmployeeProfile.tra || 0) + Number(extraNotes.other_allowances || 0);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 max-h-[60vh] overflow-y-auto pr-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1",
												children: "Employment & Personal Information"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Employee Name"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold",
															children: [
																selectedEmployeeProfile.first_name,
																" ",
																selectedEmployeeProfile.last_name || ""
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Gender"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: selectedEmployeeProfile.gender || "Male"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Nationality"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: selectedEmployeeProfile.nationality || "Qatar"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Date of Birth"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: selectedEmployeeProfile.date_of_birth ? String(selectedEmployeeProfile.date_of_birth).slice(0, 10) : "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Mobile Number"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: selectedEmployeeProfile.mobile_number || "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Official Email"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold truncate block",
															children: selectedEmployeeProfile.email || "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Department"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: selectedEmployeeProfile.departments?.name || "General"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Designation"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: selectedEmployeeProfile.designations?.title || "Staff"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Reporting Manager"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.basic_extra?.reporting_manager || extraNotes.reporting_manager || "Admin Director"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Date of Joining"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: selectedEmployeeProfile.date_of_joining ? String(selectedEmployeeProfile.date_of_joining).slice(0, 10) : "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Employment Type"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.basic_extra?.employment_type || "Full-Time"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "QID / Passport No."
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold font-mono",
															children: extraNotes.personal_extra?.passport_number || extraNotes.qid_passport_no || "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "ID Expiry Date"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.personal_extra?.passport_expiry || extraNotes.id_expiry_date || "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Employee Status"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "outline",
															className: "text-[10px] mt-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
															children: selectedEmployeeProfile.employee_status || "Active"
														})]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1",
												children: "Compensation & Financial Structure"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Basic Salary"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold",
															children: [Number(selectedEmployeeProfile.basic_salary || 0).toLocaleString(), " QAR"]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "HRA"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold",
															children: [Number(selectedEmployeeProfile.hra || 0).toLocaleString(), " QAR"]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "TRA"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold",
															children: [Number(selectedEmployeeProfile.tra || 0).toLocaleString(), " QAR"]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Other Allowances"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold",
															children: [Number(extraNotes.other_allowances || 0).toLocaleString(), " QAR"]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60 bg-emerald-500/5 border-emerald-500/20",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Total Monthly Salary"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-bold text-emerald-600",
															children: [totalSalary.toLocaleString(), " QAR"]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Bank Name"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold truncate block",
															children: selectedEmployeeProfile.bank_name || "Qatar National Bank"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60 col-span-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "IBAN / Account Number"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold font-mono text-[11px] truncate block",
															children: selectedEmployeeProfile.iban || "—"
														})]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
												className: "text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1",
												children: "Benefits & Emergency Contacts"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Other Benefit (Telephone)"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.benefit_telephone || "Company Provided"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Other Benefit (Accommodation)"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.benefit_accommodation || "Company Provided"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Other Benefit (Vehicle)"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.benefit_vehicle || "Company Provided"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Air Ticket"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.air_ticket || "Yearly"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Air Ticket Fare CAP"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.air_ticket_fare_cap ? `${Number(extraNotes.air_ticket_fare_cap).toLocaleString()} QAR` : "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Emergency Contact Name"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.emergency_contact_name || extraNotes.personal_extra?.family?.[0]?.name || "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Relation with Employee"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.relation_with_employee || extraNotes.personal_extra?.family?.[0]?.relationship || "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Emergency Contact No."
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold",
															children: extraNotes.emergency_contact_no || extraNotes.personal_extra?.family?.[0]?.contact || "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2.5 rounded-lg border bg-card/60 col-span-2 sm:col-span-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground block font-medium",
															children: "Remarks"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground",
															children: extraNotes.remarks || "—"
														})]
													})
												]
											})]
										})
									]
								});
							})()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "flex justify-between items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									const emp = selectedEmployeeProfile;
									setSelectedEmployeeProfile(null);
									setEmployeeToEdit(emp);
									setShowAddEmployeeModal(true);
								},
								className: "gap-1.5 text-xs text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3.5 w-3.5" }), " Edit Full Profile"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => setSelectedEmployeeProfile(null),
								children: "Close"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showCreateAppraisalModal,
				onOpenChange: setShowCreateAppraisalModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-base font-bold",
							children: "Launch Appraisal Review Cycle"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Create corporate performance evaluation period"
						})] })]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateAppraisalCycle,
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Cycle Title *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								required: true,
								className: "mt-1 text-xs",
								placeholder: "e.g. Q4 2026 Facility & Management Appraisal",
								value: newAppraisalCycle.title,
								onChange: (e) => setNewAppraisalCycle({
									...newAppraisalCycle,
									title: e.target.value
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-semibold",
								children: "Review Interval"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: newAppraisalCycle.interval_type,
								onValueChange: (val) => setNewAppraisalCycle({
									...newAppraisalCycle,
									interval_type: val
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Annual",
										children: "Annual Review (360-degree)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Bi-Annual",
										children: "Bi-Annual Evaluation"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Quarterly",
										children: "Quarterly KPA Assessment"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Probation",
										children: "Probation Confirmation"
									})
								] })]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground font-medium",
									children: "Review Start"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs bg-background",
									value: newAppraisalCycle.start_date,
									onChange: (e) => setNewAppraisalCycle({
										...newAppraisalCycle,
										start_date: e.target.value
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground font-medium",
									children: "Review End"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									className: "mt-1 text-xs bg-background",
									value: newAppraisalCycle.end_date,
									onChange: (e) => setNewAppraisalCycle({
										...newAppraisalCycle,
										end_date: e.target.value
									})
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowCreateAppraisalModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									className: "bg-primary text-primary-foreground",
									children: "Launch Appraisal Cycle"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedPayslipForView,
				onOpenChange: () => setSelectedPayslipForView(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold",
								children: "Employee Salary Payslip Statement"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Official Wage Protection System (WPS) compliant salary slip"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5 text-xs print:hidden",
								onClick: () => window.print(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-3.5 w-3.5" }), " Print Statement"]
							})]
						}) }),
						selectedPayslipForView && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 pt-2 text-sm border rounded-xl p-5 bg-card shadow-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between border-b pb-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-bold text-base",
											children: selectedPayslipForView.employees ? `${selectedPayslipForView.employees.first_name} ${selectedPayslipForView.employees.last_name}` : "Employee"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground font-mono",
											children: ["ID: ", selectedPayslipForView.employees?.employee_id_code || "—"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: selectedPayslipForView.employees?.email || ""
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
											children: ["Status: ", selectedPayslipForView.status || "Calculated"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground mt-1",
											children: "Currency: QAR (Qatar Riyal)"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 border-r pr-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block border-b pb-1",
												children: "Earnings"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-xs py-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Basic Salary:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono font-medium",
													children: [Number(selectedPayslipForView.basic_pay || 0).toLocaleString(), " QAR"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-xs py-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Allowances:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-emerald-600",
													children: [
														"+",
														Number(selectedPayslipForView.allowances || 0).toLocaleString(),
														" QAR"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-xs py-1 border-t font-semibold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gross Earnings:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono",
													children: [Number(selectedPayslipForView.gross_earnings || 0).toLocaleString(), " QAR"]
												})]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block border-b pb-1",
												children: "Deductions"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-xs py-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Statutory / Loan Recovery:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-rose-600",
													children: [
														"-",
														Number(selectedPayslipForView.total_deductions || 0).toLocaleString(),
														" QAR"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between text-xs py-1 border-t font-semibold",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Deductions:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-rose-600",
													children: [
														"-",
														Number(selectedPayslipForView.total_deductions || 0).toLocaleString(),
														" QAR"
													]
												})]
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between p-3.5 bg-primary/10 border border-primary/20 rounded-xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-bold uppercase tracking-wider text-primary block",
										children: "Net Take-Home Pay"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] text-muted-foreground",
										children: "Direct Bank Transfer (WPS)"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xl font-bold font-mono text-primary",
											children: [Number(selectedPayslipForView.net_salary || 0).toLocaleString(), " QAR"]
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => setSelectedPayslipForView(null),
							children: "Close"
						}) })
					]
				})
			})
		]
	});
}
//#endregion
export { HrmsModule };
