import { i as __toESM } from "../_runtime.mjs";
import { n as createApprovalRequest, p as fetchApprovalRequests, z as processApproval } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, A as ShieldCheck, G as Plus, Gt as Clock, Yt as CircleX, ct as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prop-mgr.approvals-DeU8Ecnu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TARGET_TABLES = [
	"deposit_deductions",
	"discount_overrides",
	"maintenance_escalations",
	"lease_terminations",
	"rent_waivers"
];
var statusColors = {
	pending: "bg-amber-100 text-amber-700",
	approved: "bg-green-100 text-green-700",
	rejected: "bg-red-100 text-red-700"
};
var SEED_APPROVALS = [
	{
		target_record_id: "00000000-0000-4000-8000-000000000011",
		target_table: "deposit_deductions",
		requested_by: "Property Manager",
		amount: 1500,
		status: "pending",
		notes: "Damage deduction from security deposit for unit A-1201 — broken AC remote, repainted walls"
	},
	{
		target_record_id: "00000000-0000-4000-8000-000000000012",
		target_table: "discount_overrides",
		requested_by: "Leasing Agent",
		amount: 500,
		status: "pending",
		notes: "Monthly rent discount for tenant Sara Al-Qahtani — unit V-07. Requesting 3-month discount of $500/mo to retain long-term tenant"
	},
	{
		target_record_id: "00000000-0000-4000-8000-000000000013",
		target_table: "maintenance_escalations",
		requested_by: "Facilities Manager",
		amount: 4500,
		status: "pending",
		notes: "Emergency elevator repair — OTIS parts replacement required. Exceeds $2,000 pre-approval threshold."
	},
	{
		target_record_id: "00000000-0000-4000-8000-000000000014",
		target_table: "rent_waivers",
		requested_by: "Property Manager",
		amount: 4500,
		status: "approved",
		notes: "Waiver of June rent for Khalid Al-Mutairi — unit uninhabitable due to water damage. Insurance claim pending."
	},
	{
		target_record_id: "00000000-0000-4000-8000-000000000015",
		target_table: "lease_terminations",
		requested_by: "Legal",
		amount: 0,
		status: "rejected",
		notes: "Early termination request for Omar Industries LLC (C-2210). Rejected — contract penalty clause not met."
	}
];
function ApprovalsPage() {
	const [requests, setRequests] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [activeTab, setActiveTab] = (0, import_react.useState)("pending");
	const [showNew, setShowNew] = (0, import_react.useState)(false);
	const [reviewItem, setReviewItem] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [seeding, setSeeding] = (0, import_react.useState)(false);
	const [reviewNotes, setReviewNotes] = (0, import_react.useState)("");
	const [form, setForm] = (0, import_react.useState)({
		target_table: "deposit_deductions",
		requested_by: "",
		amount: "",
		notes: ""
	});
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			setRequests(await fetchApprovalRequests());
		} catch (e) {
			console.error(e.message);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	(0, import_react.useEffect)(() => {
		if (!loading && requests.length === 0) seedApprovals();
	}, [loading]);
	async function seedApprovals() {
		setSeeding(true);
		try {
			for (const a of SEED_APPROVALS) await createApprovalRequest(a);
			await load();
		} catch (e) {
			console.error(e.message);
		} finally {
			setSeeding(false);
		}
	}
	async function handleCreate(e) {
		e.preventDefault();
		setSaving(true);
		try {
			await createApprovalRequest({
				target_record_id: crypto.randomUUID(),
				target_table: form.target_table,
				requested_by: form.requested_by,
				amount: Number(form.amount) || void 0,
				status: "pending",
				notes: form.notes
			});
			setShowNew(false);
			setForm({
				target_table: "deposit_deductions",
				requested_by: "",
				amount: "",
				notes: ""
			});
			await load();
		} catch (e) {
			console.error(e.message);
		} finally {
			setSaving(false);
		}
	}
	async function handleDecision(id, decision) {
		setSaving(true);
		try {
			await processApproval(id, decision, reviewNotes);
			setReviewItem(null);
			setReviewNotes("");
			await load();
		} catch (e) {
			console.error(e.message);
		} finally {
			setSaving(false);
		}
	}
	const filtered = requests.filter((r) => {
		if (activeTab === "all") return true;
		return r.status === activeTab;
	});
	const pendingCount = requests.filter((r) => r.status === "pending").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: "Approval Workflows"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Manage hierarchical approvals — deposits, discounts, escalations, waivers"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setShowNew(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }), " New Request"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-amber-200 bg-amber-50/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-medium text-amber-700 uppercase tracking-wider",
									children: "Pending Approval"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5 text-amber-500" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-bold text-amber-700",
							children: pendingCount
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-amber-600 mt-1",
							children: "Awaiting manager action"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-green-200 bg-green-50/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-medium text-green-700 uppercase tracking-wider",
									children: "Approved"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-green-500" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-bold text-green-700",
							children: requests.filter((r) => r.status === "approved").length
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-red-200 bg-red-50/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-medium text-red-700 uppercase tracking-wider",
									children: "Rejected"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-5 w-5 text-red-500" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-bold text-red-700",
							children: requests.filter((r) => r.status === "rejected").length
						}) })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: activeTab,
				onValueChange: setActiveTab,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "pending",
						children: ["Pending ", pendingCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1.5 inline-flex items-center rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold text-white",
							children: pendingCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "approved",
						children: "Approved"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "rejected",
						children: "Rejected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "all",
						children: "All"
					})
				] })
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-12 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-12 text-center text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No requests in this category. Click \"Seed Sample Data\" to get started." })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border",
					children: filtered.map((req) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-6 hover:bg-muted/10 transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 mb-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[req.status]}`,
												children: req.status
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground bg-muted rounded px-2 py-0.5",
												children: req.target_table.replace(/_/g, " ")
											}),
											req.amount && req.amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs font-semibold text-slate-700",
												children: ["$", Number(req.amount).toLocaleString()]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-foreground mt-1",
										children: req.notes || "No details provided"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3 mt-2 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Requested by: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground",
												children: req.requested_by
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(req.created_at).toLocaleDateString() })
										]
									})
								]
							}), req.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-8 text-xs text-green-600 border-green-200 hover:bg-green-50",
									onClick: () => {
										setReviewItem(req);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 mr-1" }), " Review"]
								})
							})]
						})
					}, req.id))
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!reviewItem,
				onOpenChange: () => {
					setReviewItem(null);
					setReviewNotes("");
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Review Approval Request" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							reviewItem?.target_table?.replace(/_/g, " "),
							" — Requested by ",
							reviewItem?.requested_by
						] })] }),
						reviewItem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-muted/50 p-4 text-sm",
								children: [reviewItem.amount && reviewItem.amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-lg font-bold mb-2",
									children: ["$", Number(reviewItem.amount).toLocaleString()]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: reviewItem.notes })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Decision Notes (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: reviewNotes,
									onChange: (e) => setReviewNotes(e.target.value),
									placeholder: "Add your reasoning for approval or rejection...",
									rows: 3
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => {
										setReviewItem(null);
										setReviewNotes("");
									},
									children: "Cancel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: "border-red-200 text-red-600 hover:bg-red-50",
									disabled: saving,
									onClick: () => reviewItem && handleDecision(reviewItem.id, "rejected"),
									children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 mr-1" }), "Reject"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "bg-green-600 hover:bg-green-700",
									disabled: saving,
									onClick: () => reviewItem && handleDecision(reviewItem.id, "approved"),
									children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 mr-1" }), "Approve"]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNew,
				onOpenChange: setShowNew,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Submit Approval Request" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Route a decision to the appropriate manager" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreate,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Request Type *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.target_table,
									onValueChange: (v) => setForm((p) => ({
										...p,
										target_table: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TARGET_TABLES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: t,
										children: t.replace(/_/g, " ")
									}, t)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Requested By *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										required: true,
										value: form.requested_by,
										onChange: (e) => setForm((p) => ({
											...p,
											requested_by: e.target.value
										})),
										placeholder: "Your name / role"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amount ($)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.amount,
										onChange: (e) => setForm((p) => ({
											...p,
											amount: e.target.value
										})),
										placeholder: "0"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Details / Justification *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									required: true,
									value: form.notes,
									onChange: (e) => setForm((p) => ({
										...p,
										notes: e.target.value
									})),
									placeholder: "Describe the request and reason in full...",
									rows: 4
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								type: "button",
								onClick: () => setShowNew(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: saving,
								children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }), "Submit Request"]
							})] })
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { ApprovalsPage as component };
