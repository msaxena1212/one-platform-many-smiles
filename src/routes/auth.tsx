import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { getLandingRouteForRole } from "@/lib/console-config";
import { clearDemoSession, setDemoSession, findDemoUserByEmail, getDemoSession } from "@/lib/demo-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    // Check if user already has an active Supabase session
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

    // Check demo session
    const demo = getDemoSession();
    if (demo?.role) {
      const landing = getLandingRouteForRole(demo.role);
      throw redirect({ to: landing as any });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"GUEST" | "HOST">("GUEST");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Check if user is logging in with one of the configured demo accounts
    const demoUser = findDemoUserByEmail(trimmedEmail);
    if (demoUser) {
      if (demoUser.password === trimmedPassword) {
        setDemoSession(demoUser.role);
        toast.success(`Signed in as ${demoUser.fullName}`);
        const landing = getLandingRouteForRole(demoUser.role);
        navigate({ to: landing as any });
        return;
      } else {
        toast.error("Invalid login credentials");
        setLoading(false);
        return;
      }
    }

    try {
      clearDemoSession();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) throw error;

      toast.success("Successfully signed in");
      
      // Route based on role
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      clearDemoSession();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setOtpSent(true);
      toast.success("Magic sign-in link has been sent to your email!");
    } catch (error: any) {
      toast.error(`OTP Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (error) throw error;
      
      toast.success("Successfully signed up! You can now log in.");
      document.getElementById('tab-login')?.click();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockSignIn = (
    mockRole: "SUPER_ADMIN" | "ADMIN" | "PROP_MGR" | "LEASING" | "FINANCE" | "CASHIER" | "MAINTENANCE" | "GUEST" | "SALES" | "OWNER" | "TENANT"
  ) => {
    setLoading(true);
    try {
      setDemoSession(mockRole);
      const targetRoute = getLandingRouteForRole(mockRole);
      toast.success(`Signed in as demo ${mockRole}`);
      navigate({ to: targetRoute as any });
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to open demo account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-8 items-center">
          
          <div className="hidden md:flex flex-col justify-center space-y-6 pl-4">
            <h1 className="text-4xl font-semibold tracking-tight">
              Manage your properties with ease
            </h1>
            <p className="text-lg text-muted-foreground">
              ZYNO is the complete enterprise property management and ERP system for landlords, agents, and tenants.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h3 className="font-medium text-sm">Leasing & Contracts</h3>
                <p className="text-xs text-muted-foreground">Complete lifecycle from reservation to check-out.</p>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h3 className="font-medium text-sm">Finance & PDCs</h3>
                <p className="text-xs text-muted-foreground">Double-entry accounting, PDC clearing & receipts.</p>
              </div>
            </div>
          </div>

          <Card className="w-full shadow-lg border-border/60">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome to ZYNO</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/auth" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      className="pl-9 pr-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Demo Testing Accounts</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("TENANT")} className="text-xs">
                    Tenant Portal
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("PROP_MGR")} className="text-xs">
                    Property Mgr
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("ADMIN")} className="text-xs">
                    Admin
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("SUPER_ADMIN")} className="text-xs font-semibold bg-primary/10 border-primary">
                    Super Admin
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("LEASING")} className="text-xs">
                    Leasing
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("FINANCE")} className="text-xs">
                    Finance
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("CASHIER")} className="text-xs">
                    Cashier
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("MAINTENANCE")} className="text-xs">
                    Maintenance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
