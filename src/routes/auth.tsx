import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLandingRouteForRole } from "@/lib/console-config";
import { clearDemoSession } from "@/lib/demo-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  FileCheck2,
  ShieldCheck,
  CreditCard,
  Users2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Briefcase,
  KeyRound,
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();
        if (profile?.role) {
          throw redirect({ to: getLandingRouteForRole(profile.role) as any });
        }
      }
    } catch (err: any) {
      if (err && (err instanceof Response || err.isRedirect || err.to || err.statusCode)) throw err;
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleResetPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success("Password reset instructions have been sent to your email!");
    } catch (error: any) {
      toast.error(`Reset Error: ${error.message || "Unable to send reset link."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      clearDemoSession();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) throw error;

      toast.success("Successfully signed in");
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
        
      const userRole = profile?.role || (data.user.user_metadata?.role as any) || "GUEST";
      navigate({ to: getLandingRouteForRole(userRole) as any });
    } catch (error: any) {
      toast.error(`Auth Error: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const highlightCards = [
    {
      icon: <Building2 className="h-5 w-5 text-emerald-400" />,
      title: "Portfolio & Lease Lifecycle",
      description: "Complete lifecycle governance from unit booking and KYC verification to renewals and move-out inspections.",
      badge: "Real-time",
    },
    {
      icon: <CreditCard className="h-5 w-5 text-teal-400" />,
      title: "Financial Governance & PDCs",
      description: "Double-entry general ledger, automated PDC cheque clearance, auto-reconciliation, and tax compliance.",
      badge: "Automated",
    },
    {
      icon: <FileCheck2 className="h-5 w-5 text-blue-400" />,
      title: "Official Branded Documents",
      description: "Custom corporate headers, digital signatures, and official seals for receipts, agreements, and token receipts.",
      badge: "Compliant",
    },
    {
      icon: <Users2 className="h-5 w-5 text-violet-400" />,
      title: "Workforce & Tenant Portal",
      description: "Self-service maintenance ticketing, mobile work orders, payroll attendance, and real-time vendor dispatch.",
      badge: "Self-Service",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-hidden font-sans">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 backdrop-blur-md bg-slate-950/60 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              Property Management OS
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Unified Real Estate ERP & Portfolio Ecosystem</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-medium">256-bit Enterprise Encryption</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Rich Enterprise Highlights */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Generation Real Estate Infrastructure</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Complete Real Estate & Property Portfolio ERP
              </h1>
              <p className="text-base text-slate-300 max-w-xl leading-relaxed">
                Empower your landlords, property managers, accountants, and tenants with a single integrated system for leasing, finance, maintenance, and asset oversight.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              {highlightCards.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all backdrop-blur-sm group"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-slate-800/90 group-hover:bg-slate-800 transition-colors">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Trust Highlights */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Multi-Tenancy Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Full Audit Traceability</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Granular Role Permissions</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Authentication Box */}
          <div className="lg:col-span-5 flex justify-center">
            <Card className="w-full max-w-md bg-slate-900/90 border-slate-800/90 shadow-2xl backdrop-blur-xl text-slate-100">
              <CardHeader className="space-y-1.5 pb-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {isForgotPassword ? "Reset Password" : "Sign In to Console"}
                  </CardTitle>
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                </div>
                <CardDescription className="text-slate-400 text-xs">
                  {isForgotPassword
                    ? "Enter your registered email address to receive secure reset instructions."
                    : "Enter your enterprise credentials to access your properties and dashboard."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isForgotPassword ? (
                  resetEmailSent ? (
                    <div className="space-y-4 text-center py-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base text-white">Reset Link Dispatched</h3>
                        <p className="text-xs text-slate-400">
                          If an account exists for <strong className="text-slate-200">{email}</strong>, a secure reset link has been dispatched to your inbox.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setResetEmailSent(false);
                        }}
                        className="w-full mt-2 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer"
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPasswordRequest} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email" className="text-xs text-slate-300 font-medium">
                          Registered Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="admin@organisation.com"
                            className="pl-9 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-900/40 cursor-pointer"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                      </Button>
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(false)}
                          className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
                        >
                          ← Back to Sign In
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs text-slate-300 font-medium">
                        Work Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="name@organisation.com" 
                          className="pl-9 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs text-slate-300 font-medium">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setResetEmailSent(false);
                          }}
                          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••••••"
                          className="pl-9 pr-9 bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>Sign In to Console</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="pt-3 border-t border-slate-800/80 text-center">
                      <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                        <Shield className="h-3 w-3 text-emerald-400" />
                        Enterprise Access Protected by Supabase Auth & RBAC
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Property Management OS. All rights reserved. Enterprise Real Estate ERP.</p>
      </footer>
    </div>
  );
}
