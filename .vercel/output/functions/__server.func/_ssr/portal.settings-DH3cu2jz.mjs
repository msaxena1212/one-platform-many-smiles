import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as User, st as Lock, yn as Bell } from "../_libs/lucide-react.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal.settings-DH3cu2jz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomerSettings() {
	const [email, setEmail] = (0, import_react.useState)("customer@example.com");
	const [phone, setPhone] = (0, import_react.useState)("+966501234567");
	const [notifications, setNotifications] = (0, import_react.useState)({
		email: true,
		sms: true,
		push: false,
		whatsapp: true
	});
	const handleSave = () => {
		toast.success("Settings saved successfully");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-bold tracking-tight",
			children: "Settings"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1",
			children: "Manage your profile and preferences"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "profile",
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid w-full grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "profile",
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }), "Profile"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "notifications",
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), "Notifications"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "security",
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }), "Security"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "profile",
					className: "space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Personal Information" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Update your contact details" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "email",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "your@email.com"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone",
								children: "Phone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone",
								type: "tel",
								value: phone,
								onChange: (e) => setPhone(e.target.value),
								placeholder: "+966..."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: handleSave,
								children: "Save Changes"
							})
						]
					})] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "notifications",
					className: "space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Notification Preferences" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose how you want to receive updates" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [Object.entries(notifications).map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 border rounded",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "capitalize font-medium cursor-pointer",
								children: key
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: value,
								onChange: (e) => setNotifications({
									...notifications,
									[key]: e.target.checked
								}),
								className: "h-5 w-5"
							})]
						}, key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleSave,
							children: "Save Preferences"
						})]
					})] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "security",
					className: "space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Password & Security" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Manage your account security" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "w-full",
								children: "Change Password"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "w-full",
								children: "Enable Two-Factor Authentication"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900",
								children: "Two-factor authentication is not yet enabled. Enable it to secure your account."
							})
						]
					})] })
				})
			]
		})]
	});
}
//#endregion
export { CustomerSettings as component };
