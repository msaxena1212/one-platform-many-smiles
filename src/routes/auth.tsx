import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Successfully signed in");
      
      // Route based on role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profile?.role === 'SUPER_ADMIN') {
        navigate({ to: "/super-admin" });
      } else if (profile?.role === 'HOST') {
        navigate({ to: "/host" });
      } else if (profile?.role === 'ADMIN') {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/guest" });
      }
    } catch (error: any) {
      toast.error(error.message);
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
      // Automatically switch to sign-in tab after successful sign-up
      document.getElementById('tab-login')?.click();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockSignIn = (mockRole: "SUPER_ADMIN" | "ADMIN" | "HOST" | "GUEST" | "SALES" | "OWNER") => {
    toast.success(`Signed in as mock ${mockRole}`);
    switch (mockRole) {
      case "SUPER_ADMIN": navigate({ to: "/super-admin" }); break;
      case "ADMIN": navigate({ to: "/admin" }); break;
      case "HOST": navigate({ to: "/host" }); break;
      case "GUEST": navigate({ to: "/guest" }); break;
      case "SALES": navigate({ to: "/sales" }); break;
      case "OWNER": navigate({ to: "/owner" }); break;
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
              ZYNO is the complete end-to-end property management system for landlords, agents, and tenants.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">For Tenants</h3>
                <p className="text-sm text-muted-foreground">Book properties, pay rent, and track maintenance.</p>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium">For Hosts</h3>
                <p className="text-sm text-muted-foreground">Manage leases, track PDCs, and handle operations.</p>
              </div>
            </div>
          </div>

          <Card className="w-full max-w-md mx-auto shadow-xl border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger id="tab-login" value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
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
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signup-name" 
                          placeholder="John Doe" 
                          className="pl-9"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signup-email" 
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
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signup-password" 
                          type={showPassword ? "text" : "password"} 
                          className="pl-9 pr-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
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
                    
                    <div className="space-y-3 pt-2">
                      <Label>I want to use ZYNO as a:</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={role === "GUEST" ? "default" : "outline"}
                          className={`h-auto py-3 justify-start ${role === "GUEST" ? "ring-2 ring-primary ring-offset-1" : ""}`}
                          onClick={() => setRole("GUEST")}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold text-sm">Tenant</span>
                            <span className="text-xs font-normal opacity-80">Book & manage</span>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={role === "HOST" ? "default" : "outline"}
                          className={`h-auto py-3 justify-start ${role === "HOST" ? "ring-2 ring-primary ring-offset-1" : ""}`}
                          onClick={() => setRole("HOST")}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold text-sm">Host</span>
                            <span className="text-xs font-normal opacity-80">List properties</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-11 mt-4" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("GUEST")} className="text-xs">
                    Tenant Portal
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("HOST")} className="text-xs">
                    Property Mgr
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("SUPER_ADMIN")} className="text-xs font-semibold bg-primary/10 border-primary">
                    Super Admin
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("ADMIN")} className="text-xs">
                    Tenant Admin
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("SALES")} className="text-xs">
                    Sales Agent
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMockSignIn("OWNER")} className="text-xs">
                    Landlord
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
