import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, User, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  fullName: z.string().trim().min(2, "Enter your name").max(100).optional(),
});

type AccountType = "personal" | "college_student";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signin" ? "signin" : "signup";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName: mode === "signup" ? fullName : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!accountType) { toast.error("Choose an account type"); return; }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName, account_type: accountType },
          },
        });
        if (error) throw error;
        toast.success("Account created! Let's set up your profile.");
        navigate("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: account type picker (signup only)
  if (mode === "signup" && !accountType) {
    return (
      <Shell>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Choose your account</h1>
        <p className="mt-2 text-muted-foreground">You can switch later as your journey evolves.</p>
        <div className="mt-8 grid gap-4">
          <button onClick={() => setAccountType("college_student")}
            className="glass-card rounded-2xl p-6 text-left hover:-translate-y-1 hover:shadow-glow transition-all group">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-gradient-primary grid place-items-center shrink-0">
                <GraduationCap className="size-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">College Student</h3>
                  <span className="text-[10px] uppercase tracking-wider bg-accent/20 text-accent rounded px-2 py-0.5">Verified</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">For currently enrolled students. Auto-transitions to Alumni after graduation.</p>
              </div>
            </div>
          </button>
          <button onClick={() => setAccountType("personal")}
            className="glass-card rounded-2xl p-6 text-left hover:-translate-y-1 hover:shadow-glow transition-all">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-gradient-accent grid place-items-center shrink-0">
                <User className="size-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Personal / Professional</h3>
                <p className="text-sm text-muted-foreground mt-1">For alumni, mentors, recruiters, and anyone outside college.</p>
              </div>
            </div>
          </button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <button className="text-accent hover:underline" onClick={() => setMode("signin")}>Sign in</button>
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      {mode === "signup" && accountType && (
        <button onClick={() => setAccountType(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" /> Change account type
        </button>
      )}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {mode === "signup"
          ? accountType === "college_student" ? "Join as a college student." : "Join as a personal/professional user."
          : "Sign in to continue your journey."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Aarav Sharma" required />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        {mode === "signup" ? "Already have an account? " : "New here? "}
        <button className="text-accent hover:underline"
          onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setAccountType(null); }}>
          {mode === "signup" ? "Sign in" : "Create account"}
        </button>
      </p>
    </Shell>
  );
};

const Shell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-screen grid place-items-center px-4 py-16 relative overflow-hidden">
    <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] bg-primary/30 rounded-full blur-3xl -z-10" />
    <div className="absolute bottom-0 right-0 size-96 bg-accent/20 rounded-full blur-3xl -z-10" />
    <div className="w-full max-w-md">
      <Link to="/" className="flex items-center justify-center gap-2 mb-8">
        <span className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
          <GraduationCap className="size-5 text-primary-foreground" />
        </span>
        <span className="text-lg font-semibold tracking-tight">InterConnect<span className="text-gradient"> Campus</span></span>
      </Link>
      <div className="glass-card rounded-3xl p-7 md:p-10">{children}</div>
    </div>
  </main>
);

import type { ReactNode } from "react";
export default Auth;
