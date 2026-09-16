import { i as __toESM } from "../_runtime.mjs";
import { O as fetchProfiles, o as createProfile } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as PaginationNext, i as PaginationLink, n as PaginationContent, o as PaginationPrevious, r as PaginationItem, t as Pagination } from "./pagination-Mm0k59kY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-module-BP2ZYHzd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var staffUsers = [
	{
		name: "Ahmad Al-Rashid",
		email: "ahmad@ZYNO Property Management.example",
		role: "Finance Officer",
		status: "ACTIVE",
		mfa: "ENABLED"
	},
	{
		name: "Noura Al-Saud",
		email: "noura@ZYNO Property Management.example",
		role: "Real Estate Officer",
		status: "ACTIVE",
		mfa: "ENABLED"
	},
	{
		name: "Yousef Bin Hamad",
		email: "yousef@ZYNO Property Management.example",
		role: "Maintenance Coordinator",
		status: "ACTIVE",
		mfa: "ENABLED"
	},
	{
		name: "Hala Al-Otaibi",
		email: "hala@ZYNO Property Management.example",
		role: "Management",
		status: "ACTIVE",
		mfa: "ENABLED"
	},
	{
		name: "Faisal T.",
		email: "faisal@ZYNO Property Management.example",
		role: "Technician",
		status: "ACTIVE",
		mfa: "OFF"
	},
	{
		name: "Mahmoud K.",
		email: "mahmoud@ZYNO Property Management.example",
		role: "Technician",
		status: "INVITED",
		mfa: "OFF"
	}
];
var roles = [
	{
		name: "Admin",
		desc: "Full platform",
		users: 2
	},
	{
		name: "Finance Officer",
		desc: "Finance, PDC, ledger, reports",
		users: 3
	},
	{
		name: "Real Estate Officer",
		desc: "Leases, units, tenants",
		users: 4
	},
	{
		name: "Maintenance Coordinator",
		desc: "Tickets, vendors, POs",
		users: 2
	},
	{
		name: "Management",
		desc: "Dashboards, approvals (no posting)",
		users: 3
	},
	{
		name: "Technician / Vendor",
		desc: "Assigned tickets only",
		users: 12
	},
	{
		name: "Owner (3rd-party)",
		desc: "Owner statements only",
		users: 8
	}
];
function UsersModule({ role }) {
	const [profiles, setProfiles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		full_name: "",
		email: "",
		role: "Technician"
	});
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const ITEMS_PER_PAGE = 20;
	const totalPages = Math.ceil(profiles.length / ITEMS_PER_PAGE);
	const paginatedProfiles = profiles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
	async function load() {
		setLoading(true);
		try {
			setProfiles(await fetchProfiles() || []);
		} catch (e) {
			console.error(e);
			setProfiles([]);
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!loading && profiles.length === 0) (async () => {
			try {
				for (const s of staffUsers) await createProfile(s);
			} catch (e) {
				console.error(e);
			}
			await load();
		})();
	}, [loading]);
	async function handleInvite(e) {
		e.preventDefault();
		try {
			await createProfile({
				full_name: form.full_name,
				email: form.email,
				role: form.role
			});
			setOpen(false);
			setForm({
				full_name: "",
				email: "",
				role: "Technician"
			});
			await load();
		} catch (err) {
			console.error(err);
			alert("Failed to invite user");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-start justify-between pb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Staff users" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [profiles.length, " accounts · MFA enforced for admin roles"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => setOpen(true),
							className: "bg-primary hover:bg-primary/90",
							children: "Invite user"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "border-y border-border bg-muted/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
											children: "Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
											children: "Role"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
											children: "MFA"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border",
									children: paginatedProfiles.map((user, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-muted/10 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-6 py-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium text-foreground",
													children: user.full_name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground",
													children: user.email
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-6 py-4 text-muted-foreground",
												children: user.role
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-6 py-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-green-100 text-green-700`,
													children: "ACTIVE"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-6 py-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-primary`,
													children: "ENABLED"
												})
											})
										]
									}, user.id || i))
								})]
							})
						}), totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 border-t border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaginationContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationPrevious, {
									href: "#",
									onClick: (e) => {
										e.preventDefault();
										setCurrentPage((p) => Math.max(1, p - 1));
									},
									className: currentPage === 1 ? "pointer-events-none opacity-50" : ""
								}) }),
								[...Array(totalPages)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationLink, {
									href: "#",
									onClick: (e) => {
										e.preventDefault();
										setCurrentPage(i + 1);
									},
									isActive: currentPage === i + 1,
									children: i + 1
								}) }, i)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationNext, {
									href: "#",
									onClick: (e) => {
										e.preventDefault();
										setCurrentPage((p) => Math.min(totalPages, p + 1));
									},
									className: currentPage === totalPages ? "pointer-events-none opacity-50" : ""
								}) })
							] }) })
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Roles" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Row-level policies enforce these scopes server-side." })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y divide-border",
							children: roles.map((role, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-6 py-4 flex justify-between items-center hover:bg-muted/10 transition-colors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-sm text-foreground",
									children: role.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: role.desc
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [role.users, " users"]
								})]
							}, i))
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Invite user" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleInvite,
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: form.full_name,
							onChange: (e) => setForm((f) => ({
								...f,
								full_name: e.target.value
							}))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							required: true,
							value: form.email,
							onChange: (e) => setForm((f) => ({
								...f,
								email: e.target.value
							}))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.role,
							onChange: (e) => setForm((f) => ({
								...f,
								role: e.target.value
							}))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "bg-primary hover:bg-primary/90",
							children: "Invite"
						})] })
					]
				})] })
			})
		]
	});
}
//#endregion
export { UsersModule };
