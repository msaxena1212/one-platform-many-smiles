import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { ct as LoaderCircle } from "../_libs/lucide-react.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.leases.new-DUxyy-bx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewLeaseForm() {
	const navigate = useNavigate();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [formData, setFormData] = (0, import_react.useState)({
		customerName: "",
		customerMobile: "",
		customerEmail: "",
		propertyId: "00000000-0000-4000-8000-000000000000",
		unitId: "00000000-0000-4000-8000-000000000001",
		leaseNumber: `L-${Date.now().toString().slice(-6)}`,
		startDate: "",
		endDate: "",
		rentalAmount: "",
		securityDeposit: ""
	});
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const { data: customerData, error: customerError } = await supabase.from("customers").insert({
				full_name: formData.customerName,
				mobile_number: formData.customerMobile,
				email_address: formData.customerEmail,
				customer_type: "Individual"
			}).select().single();
			if (customerError) throw customerError;
			const { error: leaseError } = await supabase.from("leases").insert({
				customer_id: customerData.id,
				property_id: formData.propertyId,
				unit_id: formData.unitId,
				lease_number: formData.leaseNumber,
				commencement_date: formData.startDate,
				expiry_date: formData.endDate,
				lease_period_months: 12,
				rental_amount: Number(formData.rentalAmount),
				security_deposit: Number(formData.securityDeposit),
				lease_status: "DRAFT",
				payment_frequency: "Monthly"
			});
			if (leaseError) throw leaseError;
			toast.success("Lease draft created successfully!");
			navigate({ to: "/admin/leases" });
		} catch (err) {
			console.error(err);
			toast.error(err.message || "Failed to create lease.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "max-w-3xl mx-auto py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Create New Lease Draft" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Enter the tenant and lease terms to generate a new draft lease." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				id: "new-lease-form",
				onSubmit: handleSubmit,
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-medium",
						children: "1. Tenant Information"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "customerName",
									children: "Full Name *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "customerName",
									name: "customerName",
									required: true,
									value: formData.customerName,
									onChange: handleChange
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "customerMobile",
									children: "Mobile Number *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "customerMobile",
									name: "customerMobile",
									required: true,
									value: formData.customerMobile,
									onChange: handleChange
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "customerEmail",
									children: "Email Address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "customerEmail",
									name: "customerEmail",
									type: "email",
									value: formData.customerEmail,
									onChange: handleChange
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-medium",
						children: "2. Lease Terms"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "leaseNumber",
									children: "Lease Reference *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "leaseNumber",
									name: "leaseNumber",
									required: true,
									value: formData.leaseNumber,
									onChange: handleChange
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "col-span-1" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "startDate",
									children: "Commencement Date *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "startDate",
									name: "startDate",
									type: "date",
									required: true,
									value: formData.startDate,
									onChange: handleChange
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "endDate",
									children: "Expiry Date *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "endDate",
									name: "endDate",
									type: "date",
									required: true,
									value: formData.endDate,
									onChange: handleChange
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "rentalAmount",
									children: "Annual Rent Amount (SAR) *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "rentalAmount",
									name: "rentalAmount",
									type: "number",
									required: true,
									value: formData.rentalAmount,
									onChange: handleChange
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "securityDeposit",
									children: "Security Deposit (SAR)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "securityDeposit",
									name: "securityDeposit",
									type: "number",
									value: formData.securityDeposit,
									onChange: handleChange
								})]
							})
						]
					})]
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardFooter, {
				className: "flex justify-between border-t border-border pt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => navigate({ to: "/admin/leases" }),
					disabled: loading,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					form: "new-lease-form",
					disabled: loading,
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null, "Create Draft Lease"]
				})]
			})
		] })
	});
}
//#endregion
export { NewLeaseForm as component };
