import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Nt as Eye, Pt as EyeOff, S as Sparkles, c as User, it as Mail, ot as Lock, st as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as getLandingRouteForRole } from "./console-config-DMUXAYqc.mjs";
import { i as setDemoSession, n as findDemoUserByEmail, t as clearDemoSession } from "./demo-auth-Dw5zdnz8.mjs";
import { g as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-d5Rdcinu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("GUEST");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [otpSent, setOtpSent] = (0, import_react.useState)(false);
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const handleSignIn = async (e) => {
		e.preventDefault();
		setLoading(true);
		const trimmedEmail = email.trim();
		const trimmedPassword = password.trim();
		const demoUser = findDemoUserByEmail(trimmedEmail);
		if (demoUser) if (demoUser.password === trimmedPassword) {
			setDemoSession(demoUser.role);
			toast.success(`Signed in as ${demoUser.fullName}`);
			navigate({ to: getLandingRouteForRole(demoUser.role) });
			return;
		} else {
			toast.error("Invalid login credentials");
			setLoading(false);
			return;
		}
		try {
			clearDemoSession();
			const { data, error } = await supabase.auth.signInWithPassword({
				email: trimmedEmail,
				password: trimmedPassword
			});
			if (error) throw error;
			toast.success("Successfully signed in");
			const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
			navigate({ to: getLandingRouteForRole(profile?.role || data.user.user_metadata?.role || "GUEST") });
		} catch (error) {
			toast.error(`Auth Error: ${error.message || JSON.stringify(error)}`);
		} finally {
			setLoading(false);
		}
	};
	const handleSendOtp = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			clearDemoSession();
			const { error } = await supabase.auth.signInWithOtp({
				email: email.trim(),
				options: { emailRedirectTo: window.location.origin }
			});
			if (error) throw error;
			setOtpSent(true);
			toast.success("Magic sign-in link has been sent to your email!");
		} catch (error) {
			toast.error(`OTP Error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};
	const handleSignUp = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: { data: {
					full_name: fullName,
					role
				} }
			});
			if (error) throw error;
			toast.success("Successfully signed up! You can now log in.");
			document.getElementById("tab-login")?.click();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};
	const handleMockSignIn = (mockRole) => {
		setLoading(true);
		try {
			setDemoSession(mockRole);
			const targetRoute = getLandingRouteForRole(mockRole);
			toast.success(`Signed in as demo ${mockRole}`);
			navigate({ to: targetRoute });
		} catch (error) {
			toast.error(error?.message ?? "Unable to open demo account");
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-background flex flex-col selection:bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 flex items-center justify-center p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-[1000px] grid md:grid-cols-2 gap-8 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden md:flex flex-col justify-center space-y-6 pl-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-4xl font-semibold tracking-tight",
							children: "Manage your properties with ease"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg text-muted-foreground",
							children: "ZYNO is the complete enterprise property management and ERP system for landlords, agents, and tenants."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4 pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-primary",
											children: "1"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-medium text-sm",
										children: "Leasing & Contracts"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Complete lifecycle from reservation to check-out."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-primary",
											children: "2"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-medium text-sm",
										children: "Finance & PDCs"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Double-entry accounting, PDC clearing & receipts."
									})
								]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "w-full shadow-lg border-border/60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-2xl font-bold tracking-tight",
							children: "Welcome to ZYNO"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Sign in with your enterprise account, OTP magic link, or register" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "login",
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid w-full grid-cols-3 mb-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										id: "tab-login",
										value: "login",
										children: "Password"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "otp",
										children: "Magic Link"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "register",
										children: "Register"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "login",
								className: "space-y-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: handleSignIn,
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "email",
												children: "Email"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "email",
													type: "email",
													placeholder: "name@example.com",
													className: "pl-9",
													value: email,
													onChange: (e) => setEmail(e.target.value),
													required: true
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "password",
													children: "Password"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/auth",
													className: "text-xs font-medium text-primary hover:underline",
													children: "Forgot password?"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														id: "password",
														type: showPassword ? "text" : "password",
														className: "pl-9 pr-9",
														value: password,
														onChange: (e) => setPassword(e.target.value),
														required: true
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => setShowPassword(!showPassword),
														className: "absolute right-3 top-3 text-muted-foreground hover:text-foreground",
														children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											className: "w-full h-11",
											disabled: loading,
											children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : "Sign in"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "otp",
								className: "space-y-4",
								children: otpSent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center py-6 space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-10 w-10 text-primary mx-auto" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-semibold text-lg",
											children: "Check your email"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted-foreground",
											children: [
												"We sent a magic sign-in link to ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-foreground",
													children: email
												}),
												". Click the link in your email to log in instantly."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											size: "sm",
											onClick: () => setOtpSent(false),
											className: "mt-2",
											children: "Use different email"
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: handleSendOtp,
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "otp-email",
											children: "Email Address"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "otp-email",
												type: "email",
												placeholder: "name@example.com",
												className: "pl-9",
												value: email,
												onChange: (e) => setEmail(e.target.value),
												required: true
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full h-11",
										disabled: loading,
										children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : "Send Magic Sign-in Link"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "register",
								className: "space-y-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: handleSignUp,
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "signup-name",
												children: "Full Name"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "signup-name",
													placeholder: "John Doe",
													className: "pl-9",
													value: fullName,
													onChange: (e) => setFullName(e.target.value),
													required: true
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "signup-email",
												children: "Email"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "signup-email",
													type: "email",
													placeholder: "name@example.com",
													className: "pl-9",
													value: email,
													onChange: (e) => setEmail(e.target.value),
													required: true
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "signup-password",
												children: "Password"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														id: "signup-password",
														type: showPassword ? "text" : "password",
														className: "pl-9 pr-9",
														value: password,
														onChange: (e) => setPassword(e.target.value),
														required: true,
														minLength: 6
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => setShowPassword(!showPassword),
														className: "absolute right-3 top-3 text-muted-foreground hover:text-foreground",
														children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3 pt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "I want to use ZYNO as a:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: role === "GUEST" ? "default" : "outline",
													className: `h-auto py-3 justify-start ${role === "GUEST" ? "ring-2 ring-primary ring-offset-1" : ""}`,
													onClick: () => setRole("GUEST"),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-col items-start gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold text-sm",
															children: "Tenant"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-xs font-normal opacity-80",
															children: "Book & manage"
														})]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: role === "HOST" ? "default" : "outline",
													className: `h-auto py-3 justify-start ${role === "HOST" ? "ring-2 ring-primary ring-offset-1" : ""}`,
													onClick: () => setRole("HOST"),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-col items-start gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold text-sm",
															children: "Host"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-xs font-normal opacity-80",
															children: "List properties"
														})]
													})
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											className: "w-full h-11 mt-4",
											disabled: loading,
											children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : "Create account"
										})
									]
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 pt-6 border-t border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mb-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 flex items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-full border-t border-border" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative flex justify-center text-xs uppercase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bg-card px-2 text-muted-foreground",
									children: "Demo Testing Accounts"
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 sm:grid-cols-4 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleMockSignIn("TENANT"),
									className: "text-xs",
									children: "Tenant Portal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleMockSignIn("PROP_MGR"),
									className: "text-xs",
									children: "Property Mgr"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleMockSignIn("ADMIN"),
									className: "text-xs",
									children: "Admin"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleMockSignIn("SUPER_ADMIN"),
									className: "text-xs font-semibold bg-primary/10 border-primary",
									children: "Super Admin"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleMockSignIn("LEASING"),
									className: "text-xs",
									children: "Leasing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleMockSignIn("FINANCE"),
									className: "text-xs",
									children: "Finance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleMockSignIn("CASHIER"),
									className: "text-xs",
									children: "Cashier"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleMockSignIn("MAINTENANCE"),
									className: "text-xs",
									children: "Maintenance"
								})
							]
						})]
					})] })]
				})]
			})
		})
	});
}
//#endregion
export { AuthPage as component };
