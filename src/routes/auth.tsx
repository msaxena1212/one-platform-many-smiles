import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"GUEST" | "HOST">("GUEST");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast.success("Welcome back!");
      // Route based on user role stored in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "HOST") {
        navigate({ to: "/host" });
      } else {
        navigate({ to: "/guest" });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to log in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });
      if (error) throw error;

      if (data.user) {
        // Insert into public.profiles
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          role,
        });
      }

      setRegSuccess(true);
      toast.success("Account created! Please check your email to confirm.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-muted/30"
      style={{
        background: "radial-gradient(ellipse at top, oklch(0.35 0.06 195 / 0.08) 0%, transparent 70%)",
      }}
    >
      <PublicHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-4">
              S
            </div>
            <h1 className="text-2xl font-bold tracking-tight">StayHub</h1>
            <p className="text-sm text-muted-foreground mt-1">Your home away from home</p>
          </div>

          <Card className="shadow-xl border-border">
            <Tabs defaultValue="login" className="w-full">
              <CardHeader className="space-y-1 text-center pb-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-6">

                {/* -------- LOGIN -------- */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button type="button" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          className="pl-9 pr-9"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                      disabled={loading}
                    >
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or continue as</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => { setEmail("guest@example.com"); setPassword("password123"); }}
                      >
                        👤 Demo Guest
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => { setEmail("host@example.com"); setPassword("password123"); }}
                      >
                        🏠 Demo Host
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* -------- REGISTER -------- */}
                <TabsContent value="register">
                  {regSuccess ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <Mail className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Check your email</h3>
                      <p className="text-sm text-muted-foreground">
                        We've sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
                      </p>
                      <Button variant="outline" onClick={() => setRegSuccess(false)}>Back to Login</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-name"
                            type="text"
                            placeholder="John Smith"
                            className="pl-9"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-9"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 6 characters"
                            className="pl-9 pr-9"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Role selection */}
                      <div className="space-y-2">
                        <Label>I want to…</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setRole("GUEST")}
                            className={`rounded-lg border p-3 text-left transition-colors ${
                              role === "GUEST" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <div className="text-lg mb-1">🏖️</div>
                            <div className="text-sm font-medium">Book stays</div>
                            <div className="text-xs text-muted-foreground">as a Guest</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole("HOST")}
                            className={`rounded-lg border p-3 text-left transition-colors ${
                              role === "HOST" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <div className="text-lg mb-1">🏠</div>
                            <div className="text-sm font-medium">List property</div>
                            <div className="text-xs text-muted-foreground">as a Host</div>
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                        disabled={loading}
                      >
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</> : "Create Account"}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        By creating an account you agree to our{" "}
                        <span className="underline cursor-pointer">Terms of Service</span> and{" "}
                        <span className="underline cursor-pointer">Privacy Policy</span>.
                      </p>
                    </form>
                  )}
                </TabsContent>

              </CardContent>
            </Tabs>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
