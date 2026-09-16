import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { G as Plus, I as Search, J as Pencil, N as Settings2, Z as Package, ct as LoaderCircle, s as Users, v as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as ScrollArea } from "./scroll-area-BlnbM3_c.mjs";
import { y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { $ as updateGender, A as fetchAssetConditions, B as fetchPaymentModes, C as deleteEmploymentType, D as deleteTicketCategory, E as deletePaymentMode, F as fetchDesignations, G as updateAssetOwnershipType, H as fetchWorkLocations, I as fetchEmployeeStatuses, J as updateDepartment, K as updateAssetStatus, L as fetchEmploymentTypes, M as fetchAssetStatuses, N as fetchAssetSubcategories, O as deleteWorkLocation, P as fetchDepartments, Q as updateFacilityMaster, R as fetchFacilityMasters, S as deleteEmployeeStatus, T as deleteGender, U as updateAssetCategory, V as fetchTicketCategories, W as updateAssetCondition, X as updateEmployeeStatus, Y as updateDesignation, Z as updateEmploymentType, _ as deleteAssetOwnershipType, a as createAssetSubcategory, b as deleteDepartment, c as createEmployeeStatus, d as createGender, et as updatePaymentMode, f as createPaymentMode, g as deleteAssetCondition, h as deleteAssetCategory, i as createAssetStatus, j as fetchAssetOwnershipTypes, k as fetchAssetCategories, l as createEmploymentType, m as createWorkLocation, n as createAssetCondition, nt as updateWorkLocation, o as createDepartment, p as createTicketCategory, q as updateAssetSubcategory, r as createAssetOwnershipType, s as createDesignation, t as createAssetCategory, tt as updateTicketCategory, u as createFacilityMaster, v as deleteAssetStatus, w as deleteFacilityMaster, x as deleteDesignation, y as deleteAssetSubcategory, z as fetchGenders } from "./supabase-masters-ssPWjMMY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/masters-module-CcZEhBtW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV_GROUPS = [
	{
		label: "HR Masters",
		icon: Users,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		items: [
			{
				key: "gender",
				label: "Gender"
			},
			{
				key: "department",
				label: "Department"
			},
			{
				key: "designation",
				label: "Designation"
			},
			{
				key: "employment_type",
				label: "Employment Type"
			},
			{
				key: "work_location",
				label: "Work Location"
			},
			{
				key: "employee_status",
				label: "Employee Status"
			}
		]
	},
	{
		label: "Asset Masters",
		icon: Package,
		color: "text-emerald-500",
		bg: "bg-emerald-500/10",
		items: [
			{
				key: "asset_category",
				label: "Asset Category"
			},
			{
				key: "asset_subcategory",
				label: "Asset Subcategory"
			},
			{
				key: "asset_ownership_type",
				label: "Ownership Type"
			},
			{
				key: "asset_condition",
				label: "Asset Condition"
			},
			{
				key: "asset_status",
				label: "Asset Status"
			}
		]
	},
	{
		label: "System Masters",
		icon: Settings2,
		color: "text-orange-500",
		bg: "bg-orange-500/10",
		items: [
			{
				key: "ticket_categories",
				label: "Ticket Categories"
			},
			{
				key: "facilities",
				label: "Facilities"
			},
			{
				key: "payment_modes",
				label: "Payment Modes"
			}
		]
	}
];
function SimpleMasterPanel({ title, items, loading, fieldLabel = "Name", onAdd, onEdit, onDelete }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const [showDialog, setShowDialog] = (0, import_react.useState)(false);
	const [editItem, setEditItem] = (0, import_react.useState)(null);
	const [value, setValue] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
	function openAdd() {
		setEditItem(null);
		setValue("");
		setShowDialog(true);
	}
	function openEdit(item) {
		setEditItem(item);
		setValue(item.name);
		setShowDialog(true);
	}
	async function handleSave() {
		if (!value.trim()) return;
		setSaving(true);
		try {
			if (editItem) {
				await onEdit(editItem.id, value.trim());
				toast.success("Updated successfully");
			} else {
				await onAdd(value.trim());
				toast.success("Added successfully");
			}
			setShowDialog(false);
		} catch (err) {
			toast.error(err.message || "Operation failed");
		} finally {
			setSaving(false);
		}
	}
	async function handleDelete(id) {
		if (!confirm("Delete this item?")) return;
		try {
			await onDelete(id);
			toast.success("Deleted");
		} catch (err) {
			toast.error(err.message || "Delete failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: `Search ${title}...`,
					className: "pl-9",
					value: search,
					onChange: (e) => setSearch(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2 ml-3",
				onClick: openAdd,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add"]
			})]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center h-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
		}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground text-center py-8",
			children: search ? "No results found." : "No items configured yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5",
			children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7",
						onClick: () => openEdit(item),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7 text-destructive hover:text-destructive",
						onClick: () => handleDelete(item.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})]
				})]
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: showDialog,
			onOpenChange: setShowDialog,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editItem ? `Edit ${title}` : `Add ${title}` }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3 py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: fieldLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: `Enter ${fieldLabel.toLowerCase()}...`,
								value,
								onChange: (e) => setValue(e.target.value),
								onKeyDown: (e) => e.key === "Enter" && handleSave(),
								autoFocus: true
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setShowDialog(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleSave,
						disabled: saving || !value.trim(),
						children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null, editItem ? "Update" : "Add"]
					})] })
				]
			})
		})
	] });
}
function TicketCategoryPanel({ items, loading, onAdd, onEdit, onDelete }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const [showDialog, setShowDialog] = (0, import_react.useState)(false);
	const [editItem, setEditItem] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		sla_hours: "24",
		priority: "medium"
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
	function openAdd() {
		setEditItem(null);
		setForm({
			name: "",
			sla_hours: "24",
			priority: "medium"
		});
		setShowDialog(true);
	}
	function openEdit(item) {
		setEditItem(item);
		setForm({
			name: item.name,
			sla_hours: String(item.sla_hours),
			priority: item.priority
		});
		setShowDialog(true);
	}
	async function handleSave() {
		if (!form.name.trim()) return;
		setSaving(true);
		try {
			const payload = {
				name: form.name.trim(),
				sla_hours: parseInt(form.sla_hours) || 24,
				priority: form.priority
			};
			if (editItem) {
				await onEdit(editItem.id, payload);
				toast.success("Updated successfully");
			} else {
				await onAdd(payload);
				toast.success("Added successfully");
			}
			setShowDialog(false);
		} catch (err) {
			toast.error(err.message || "Operation failed");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search ticket categories...",
					className: "pl-9",
					value: search,
					onChange: (e) => setSearch(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2 ml-3",
				onClick: openAdd,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Category"]
			})]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center h-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
		}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground text-center py-8",
			children: "No ticket categories found."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5",
			children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"SLA: ",
						item.sla_hours,
						" hours"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: item.priority === "high" || item.priority === "urgent" ? "destructive" : "secondary",
						children: item.priority
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "h-7 w-7",
							onClick: () => openEdit(item),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "h-7 w-7 text-destructive hover:text-destructive",
							onClick: () => onDelete(item.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})]
					})]
				})]
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: showDialog,
			onOpenChange: setShowDialog,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editItem ? "Edit Ticket Category" : "Add Ticket Category" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Plumbing",
									value: form.name,
									onChange: (e) => setForm({
										...form,
										name: e.target.value
									}),
									autoFocus: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "SLA (Hours)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									placeholder: "24",
									value: form.sla_hours,
									onChange: (e) => setForm({
										...form,
										sla_hours: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Priority" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.priority,
									onValueChange: (v) => setForm({
										...form,
										priority: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "low",
											children: "Low"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "medium",
											children: "Medium"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "high",
											children: "High"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "urgent",
											children: "Urgent"
										})
									] })]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setShowDialog(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleSave,
						disabled: saving || !form.name.trim(),
						children: editItem ? "Update" : "Save"
					})] })
				]
			})
		})
	] });
}
function FacilityPanel({ items, loading, onAdd, onEdit, onDelete }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const [showDialog, setShowDialog] = (0, import_react.useState)(false);
	const [editItem, setEditItem] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		capacity: "1",
		paid: "false"
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
	function openAdd() {
		setEditItem(null);
		setForm({
			name: "",
			capacity: "1",
			paid: "false"
		});
		setShowDialog(true);
	}
	function openEdit(item) {
		setEditItem(item);
		setForm({
			name: item.name,
			capacity: String(item.capacity),
			paid: item.paid ? "true" : "false"
		});
		setShowDialog(true);
	}
	async function handleSave() {
		if (!form.name.trim()) return;
		setSaving(true);
		try {
			const payload = {
				name: form.name.trim(),
				capacity: parseInt(form.capacity) || 1,
				paid: form.paid === "true"
			};
			if (editItem) {
				await onEdit(editItem.id, payload);
				toast.success("Updated successfully");
			} else {
				await onAdd(payload);
				toast.success("Added successfully");
			}
			setShowDialog(false);
		} catch (err) {
			toast.error(err.message || "Operation failed");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search facilities...",
					className: "pl-9",
					value: search,
					onChange: (e) => setSearch(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2 ml-3",
				onClick: openAdd,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Facility"]
			})]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center h-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
		}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground text-center py-8",
			children: "No facilities found."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5",
			children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: ["Capacity: ", item.capacity]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: item.paid ? "default" : "outline",
						children: item.paid ? "Paid Service" : "Free"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "h-7 w-7",
							onClick: () => openEdit(item),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "h-7 w-7 text-destructive hover:text-destructive",
							onClick: () => onDelete(item.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})]
					})]
				})]
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: showDialog,
			onOpenChange: setShowDialog,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editItem ? "Edit Facility" : "Add Facility" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Facility Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Swimming Pool",
									value: form.name,
									onChange: (e) => setForm({
										...form,
										name: e.target.value
									}),
									autoFocus: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Capacity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									placeholder: "50",
									value: form.capacity,
									onChange: (e) => setForm({
										...form,
										capacity: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Service Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.paid,
									onValueChange: (v) => setForm({
										...form,
										paid: v
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "false",
										children: "Free Service"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "true",
										children: "Paid Service"
									})] })]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setShowDialog(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleSave,
						disabled: saving || !form.name.trim(),
						children: editItem ? "Update" : "Save"
					})] })
				]
			})
		})
	] });
}
function PaymentModePanel({ items, loading, onAdd, onEdit, onDelete }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const [showDialog, setShowDialog] = (0, import_react.useState)(false);
	const [editItem, setEditItem] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		code: "",
		name: ""
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));
	function openAdd() {
		setEditItem(null);
		setForm({
			code: "",
			name: ""
		});
		setShowDialog(true);
	}
	function openEdit(item) {
		setEditItem(item);
		setForm({
			code: item.code,
			name: item.name
		});
		setShowDialog(true);
	}
	async function handleSave() {
		if (!form.code.trim() || !form.name.trim()) return;
		setSaving(true);
		try {
			const payload = {
				code: form.code.trim().toUpperCase(),
				name: form.name.trim()
			};
			if (editItem) {
				await onEdit(editItem.id, payload);
				toast.success("Updated successfully");
			} else {
				await onAdd(payload);
				toast.success("Added successfully");
			}
			setShowDialog(false);
		} catch (err) {
			toast.error(err.message || "Operation failed");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1 max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search payment modes...",
					className: "pl-9",
					value: search,
					onChange: (e) => setSearch(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2 ml-3",
				onClick: openAdd,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Payment Mode"]
			})]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center h-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
		}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground text-center py-8",
			children: "No payment modes found."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5",
			children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: item.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground font-mono",
					children: item.code
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7",
						onClick: () => openEdit(item),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7 text-destructive hover:text-destructive",
						onClick: () => onDelete(item.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})]
				})]
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: showDialog,
			onOpenChange: setShowDialog,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editItem ? "Edit Payment Mode" : "Add Payment Mode" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Code (Unique)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "e.g. CARD",
								value: form.code,
								onChange: (e) => setForm({
									...form,
									code: e.target.value.toUpperCase()
								}),
								autoFocus: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "e.g. Credit / Debit Card",
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setShowDialog(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleSave,
						disabled: saving || !form.code.trim() || !form.name.trim(),
						children: editItem ? "Update" : "Save"
					})] })
				]
			})
		})
	] });
}
function SubcategoryPanel({ categories, subcategories, allSubcategories, loading, onAdd, onEdit, onDelete, onCategoryFilter }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const [filterCatId, setFilterCatId] = (0, import_react.useState)("all");
	const [showDialog, setShowDialog] = (0, import_react.useState)(false);
	const [editItem, setEditItem] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [catId, setCatId] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const filtered = subcategories.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
	function getCategoryName(id) {
		if (!id) return "Uncategorized";
		return categories.find((c) => c.id === id)?.name ?? "Unknown";
	}
	function openAdd() {
		setEditItem(null);
		setName("");
		setCatId("");
		setShowDialog(true);
	}
	function openEdit(item) {
		setEditItem(item);
		setName(item.name);
		setCatId(item.category_id?.toString() ?? "");
		setShowDialog(true);
	}
	async function handleSave() {
		if (!name.trim()) return;
		setSaving(true);
		try {
			const categoryId = catId ? parseInt(catId) : null;
			if (editItem) {
				await onEdit(editItem.id, name.trim(), categoryId);
				toast.success("Updated successfully");
			} else {
				await onAdd(name.trim(), categoryId);
				toast.success("Added successfully");
			}
			setShowDialog(false);
		} catch (err) {
			toast.error(err.message || "Operation failed");
		} finally {
			setSaving(false);
		}
	}
	async function handleDelete(id) {
		if (!confirm("Delete this subcategory?")) return;
		try {
			await onDelete(id);
			toast.success("Deleted");
		} catch (err) {
			toast.error(err.message || "Delete failed");
		}
	}
	function handleCatFilter(val) {
		setFilterCatId(val);
		onCategoryFilter(val === "all" ? void 0 : parseInt(val));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3 mb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 min-w-[160px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search subcategories...",
						className: "pl-9",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: filterCatId,
					onValueChange: handleCatFilter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-[200px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Filter by category" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All Categories"
					}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: c.id.toString(),
						children: c.name
					}, c.id))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-2",
					onClick: openAdd,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add"]
				})
			]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center h-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
		}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground text-center py-8",
			children: search ? "No results found." : "No subcategories configured yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5",
			children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: item.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-xs font-normal",
						children: getCategoryName(item.category_id)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7",
						onClick: () => openEdit(item),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-7 w-7 text-destructive hover:text-destructive",
						onClick: () => handleDelete(item.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})]
				})]
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: showDialog,
			onOpenChange: setShowDialog,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editItem ? "Edit Subcategory" : "Add Subcategory" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Subcategory Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Enter subcategory name...",
								value: name,
								onChange: (e) => setName(e.target.value),
								autoFocus: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Asset Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: catId,
								onValueChange: setCatId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select category..." }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c.id.toString(),
									children: c.name
								}, c.id)) })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setShowDialog(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: handleSave,
						disabled: saving || !name.trim(),
						children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null, editItem ? "Update" : "Add"]
					})] })
				]
			})
		})
	] });
}
function MastersModule({ role }) {
	const activeKey = useSearch({ strict: false }).tab || "gender";
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [genders, setGenders] = (0, import_react.useState)([]);
	const [departments, setDepartments] = (0, import_react.useState)([]);
	const [designations, setDesignations] = (0, import_react.useState)([]);
	const [employmentTypes, setEmploymentTypes] = (0, import_react.useState)([]);
	const [workLocations, setWorkLocations] = (0, import_react.useState)([]);
	const [employeeStatuses, setEmployeeStatuses] = (0, import_react.useState)([]);
	const [assetCategories, setAssetCategories] = (0, import_react.useState)([]);
	const [allSubcategories, setAllSubcategories] = (0, import_react.useState)([]);
	const [filteredSubcategories, setFilteredSubcategories] = (0, import_react.useState)([]);
	const [assetOwnershipTypes, setAssetOwnershipTypes] = (0, import_react.useState)([]);
	const [assetConditions, setAssetConditions] = (0, import_react.useState)([]);
	const [assetStatuses, setAssetStatuses] = (0, import_react.useState)([]);
	const [ticketCategories, setTicketCategories] = (0, import_react.useState)([]);
	const [facilities, setFacilities] = (0, import_react.useState)([]);
	const [paymentModes, setPaymentModes] = (0, import_react.useState)([]);
	const [loadingMap, setLoadingMap] = (0, import_react.useState)({});
	const setLoadingKey = (key, val) => setLoadingMap((prev) => ({
		...prev,
		[key]: val
	}));
	const isLoading = (key) => !!loadingMap[key];
	const loadMaster = (0, import_react.useCallback)(async (key) => {
		setLoadingKey(key, true);
		try {
			switch (key) {
				case "gender":
					setGenders(await fetchGenders());
					break;
				case "department":
					setDepartments(await fetchDepartments());
					break;
				case "designation":
					setDesignations(await fetchDesignations());
					break;
				case "employment_type":
					setEmploymentTypes(await fetchEmploymentTypes());
					break;
				case "work_location":
					setWorkLocations(await fetchWorkLocations());
					break;
				case "employee_status":
					setEmployeeStatuses(await fetchEmployeeStatuses());
					break;
				case "asset_category":
					setAssetCategories(await fetchAssetCategories());
					break;
				case "asset_subcategory": {
					const subs = await fetchAssetSubcategories();
					setAllSubcategories(subs);
					setFilteredSubcategories(subs);
					break;
				}
				case "asset_ownership_type":
					setAssetOwnershipTypes(await fetchAssetOwnershipTypes());
					break;
				case "asset_condition":
					setAssetConditions(await fetchAssetConditions());
					break;
				case "asset_status":
					setAssetStatuses(await fetchAssetStatuses());
					break;
				case "ticket_categories":
					setTicketCategories(await fetchTicketCategories());
					break;
				case "facilities":
					setFacilities(await fetchFacilityMasters());
					break;
				case "payment_modes":
					setPaymentModes(await fetchPaymentModes());
					break;
			}
		} catch (err) {
			toast.error(err.message || `Failed to load ${key}`);
		} finally {
			setLoadingKey(key, false);
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (activeKey === "asset_subcategory" && assetCategories.length === 0) loadMaster("asset_category");
		loadMaster(activeKey);
	}, [activeKey]);
	function renderActivePanel() {
		switch (activeKey) {
			case "gender": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Gender",
				items: genders,
				loading: isLoading("gender"),
				onAdd: async (n) => {
					await createGender(n);
					await loadMaster("gender");
				},
				onEdit: async (id, n) => {
					await updateGender(id, n);
					await loadMaster("gender");
				},
				onDelete: async (id) => {
					await deleteGender(id);
					await loadMaster("gender");
				}
			});
			case "department": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Department",
				items: departments,
				loading: isLoading("department"),
				onAdd: async (n) => {
					await createDepartment(n);
					await loadMaster("department");
				},
				onEdit: async (id, n) => {
					await updateDepartment(id, n);
					await loadMaster("department");
				},
				onDelete: async (id) => {
					await deleteDepartment(id);
					await loadMaster("department");
				}
			});
			case "designation": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Designation",
				items: designations,
				loading: isLoading("designation"),
				onAdd: async (n) => {
					await createDesignation(n);
					await loadMaster("designation");
				},
				onEdit: async (id, n) => {
					await updateDesignation(id, n);
					await loadMaster("designation");
				},
				onDelete: async (id) => {
					await deleteDesignation(id);
					await loadMaster("designation");
				}
			});
			case "employment_type": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Employment Type",
				items: employmentTypes,
				loading: isLoading("employment_type"),
				onAdd: async (n) => {
					await createEmploymentType(n);
					await loadMaster("employment_type");
				},
				onEdit: async (id, n) => {
					await updateEmploymentType(id, n);
					await loadMaster("employment_type");
				},
				onDelete: async (id) => {
					await deleteEmploymentType(id);
					await loadMaster("employment_type");
				}
			});
			case "work_location": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Work Location",
				items: workLocations,
				loading: isLoading("work_location"),
				onAdd: async (n) => {
					await createWorkLocation(n);
					await loadMaster("work_location");
				},
				onEdit: async (id, n) => {
					await updateWorkLocation(id, n);
					await loadMaster("work_location");
				},
				onDelete: async (id) => {
					await deleteWorkLocation(id);
					await loadMaster("work_location");
				}
			});
			case "employee_status": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Employee Status",
				items: employeeStatuses,
				loading: isLoading("employee_status"),
				onAdd: async (n) => {
					await createEmployeeStatus(n);
					await loadMaster("employee_status");
				},
				onEdit: async (id, n) => {
					await updateEmployeeStatus(id, n);
					await loadMaster("employee_status");
				},
				onDelete: async (id) => {
					await deleteEmployeeStatus(id);
					await loadMaster("employee_status");
				}
			});
			case "asset_category": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Asset Category",
				items: assetCategories,
				loading: isLoading("asset_category"),
				onAdd: async (n) => {
					await createAssetCategory(n);
					await loadMaster("asset_category");
				},
				onEdit: async (id, n) => {
					await updateAssetCategory(id, n);
					await loadMaster("asset_category");
				},
				onDelete: async (id) => {
					await deleteAssetCategory(id);
					await loadMaster("asset_category");
				}
			});
			case "asset_subcategory": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubcategoryPanel, {
				categories: assetCategories,
				subcategories: filteredSubcategories,
				allSubcategories,
				loading: isLoading("asset_subcategory"),
				onAdd: async (n, cid) => {
					await createAssetSubcategory(n, cid);
					await loadMaster("asset_subcategory");
				},
				onEdit: async (id, n, cid) => {
					await updateAssetSubcategory(id, n, cid);
					await loadMaster("asset_subcategory");
				},
				onDelete: async (id) => {
					await deleteAssetSubcategory(id);
					await loadMaster("asset_subcategory");
				},
				onCategoryFilter: (catId) => {
					setFilteredSubcategories(catId ? allSubcategories.filter((s) => s.category_id === catId) : allSubcategories);
				}
			});
			case "asset_ownership_type": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Ownership Type",
				items: assetOwnershipTypes,
				loading: isLoading("asset_ownership_type"),
				onAdd: async (n) => {
					await createAssetOwnershipType(n);
					await loadMaster("asset_ownership_type");
				},
				onEdit: async (id, n) => {
					await updateAssetOwnershipType(id, n);
					await loadMaster("asset_ownership_type");
				},
				onDelete: async (id) => {
					await deleteAssetOwnershipType(id);
					await loadMaster("asset_ownership_type");
				}
			});
			case "asset_condition": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Asset Condition",
				items: assetConditions,
				loading: isLoading("asset_condition"),
				onAdd: async (n) => {
					await createAssetCondition(n);
					await loadMaster("asset_condition");
				},
				onEdit: async (id, n) => {
					await updateAssetCondition(id, n);
					await loadMaster("asset_condition");
				},
				onDelete: async (id) => {
					await deleteAssetCondition(id);
					await loadMaster("asset_condition");
				}
			});
			case "asset_status": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleMasterPanel, {
				title: "Asset Status",
				items: assetStatuses,
				loading: isLoading("asset_status"),
				onAdd: async (n) => {
					await createAssetStatus(n);
					await loadMaster("asset_status");
				},
				onEdit: async (id, n) => {
					await updateAssetStatus(id, n);
					await loadMaster("asset_status");
				},
				onDelete: async (id) => {
					await deleteAssetStatus(id);
					await loadMaster("asset_status");
				}
			});
			case "ticket_categories": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketCategoryPanel, {
				items: ticketCategories,
				loading: isLoading("ticket_categories"),
				onAdd: async (data) => {
					await createTicketCategory(data);
					await loadMaster("ticket_categories");
				},
				onEdit: async (id, data) => {
					await updateTicketCategory(id, data);
					await loadMaster("ticket_categories");
				},
				onDelete: async (id) => {
					await deleteTicketCategory(id);
					await loadMaster("ticket_categories");
				}
			});
			case "facilities": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FacilityPanel, {
				items: facilities,
				loading: isLoading("facilities"),
				onAdd: async (data) => {
					await createFacilityMaster(data);
					await loadMaster("facilities");
				},
				onEdit: async (id, data) => {
					await updateFacilityMaster(id, data);
					await loadMaster("facilities");
				},
				onDelete: async (id) => {
					await deleteFacilityMaster(id);
					await loadMaster("facilities");
				}
			});
			case "payment_modes": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentModePanel, {
				items: paymentModes,
				loading: isLoading("payment_modes"),
				onAdd: async (data) => {
					await createPaymentMode(data);
					await loadMaster("payment_modes");
				},
				onEdit: async (id, data) => {
					await updatePaymentMode(id, data);
					await loadMaster("payment_modes");
				},
				onDelete: async (id) => {
					await deletePaymentMode(id);
					await loadMaster("payment_modes");
				}
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground p-4",
				children: "Panel coming soon."
			});
		}
	}
	const activeLabel = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.key === activeKey)?.label ?? "";
	const activeGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.key === activeKey));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-bold tracking-tight",
			children: "Masters & Configuration"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1",
			children: "Manage system reference data — HR, Asset, System, and more."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-6 min-h-[600px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "h-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3 border-b",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [activeGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `p-1.5 rounded-md ${activeGroup.bg}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(activeGroup.icon, { className: `h-4 w-4 ${activeGroup.color}` })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: activeLabel
							}), activeGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: activeGroup.label
							})] })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							className: "h-[500px] pr-2",
							children: renderActivePanel()
						})
					})]
				})
			})
		})]
	});
}
//#endregion
export { MastersModule };
