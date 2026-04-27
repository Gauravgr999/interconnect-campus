import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, User, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const collegeSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  headline: z.string().trim().max(160).optional(),
  college_name: z.string().trim().min(2, "College name required").max(150),
  college_email: z.string().trim().email("Invalid college email").max(255).optional().or(z.literal("")),
  department: z.string().trim().min(2, "Department required").max(100),
  degree: z.string().trim().min(2, "Degree required").max(100),
  graduation_year: z.coerce.number().int().min(2000).max(2100),
  graduation_date: z.string().optional().or(z.literal("")),
  student_id: z.string().trim().max(50).optional(),
  bio: z.string().trim().max(500).optional(),
});

const personalSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  headline: z.string().trim().max(160).optional(),
  current_position: z.string().trim().max(100).optional(),
  company: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(500).optional(),
});

const Onboarding = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) navigate("/auth?mode=signin", { replace: true });
    if (profile?.onboarding_completed) navigate("/dashboard", { replace: true });
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        headline: profile.headline || "",
        college_name: profile.college_name || "",
        college_email: profile.college_email || "",
        department: profile.department || "",
        degree: profile.degree || "",
        graduation_year: profile.graduation_year?.toString() || "",
        graduation_date: profile.graduation_date || "",
        student_id: profile.student_id || "",
        current_position: profile.current_position || "",
        company: profile.company || "",
        location: profile.location || "",
        bio: profile.bio || "",
      });
    }
  }, [user, profile, loading, navigate]);

  if (loading || !profile) {
    return <main className="min-h-screen grid place-items-center"><Loader2 className="size-6 animate-spin text-accent" /></main>;
  }

  const isStudent = profile.account_type === "college_student";
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = isStudent ? collegeSchema : personalSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const data: any = { ...parsed.data, onboarding_completed: true };
    if (data.college_email === "") delete data.college_email;
    if (data.graduation_date === "" || data.graduation_date === undefined) data.graduation_date = null;
    const { error } = await supabase.from("profiles").update(data).eq("id", user!.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("Profile complete! Welcome aboard 🎉");
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-32 right-0 size-[500px] bg-primary/25 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 -left-20 size-96 bg-accent/20 rounded-full blur-3xl -z-10" />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className={`size-12 rounded-xl grid place-items-center ${isStudent ? "bg-gradient-primary" : "bg-gradient-accent"}`}>
            {isStudent ? <GraduationCap className="size-6 text-primary-foreground" /> : <User className="size-6 text-accent-foreground" />}
          </span>
          <div>
            <div className="text-xs uppercase tracking-widest text-accent flex items-center gap-1.5">
              <Sparkles className="size-3" /> {isStudent ? "College Student" : "Personal Account"}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Complete your profile</h1>
          </div>
        </div>

        <form onSubmit={submit} className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
          <Field label="Full name" required>
            <Input value={form.full_name || ""} onChange={e => update("full_name", e.target.value)} required />
          </Field>
          <Field label="Headline" hint="One line about you">
            <Input value={form.headline || ""} onChange={e => update("headline", e.target.value)} placeholder={isStudent ? "CS undergrad · Aspiring SDE" : "Senior Engineer · Mentor"} />
          </Field>

          {isStudent ? (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="College / University" required>
                  <Input value={form.college_name || ""} onChange={e => update("college_name", e.target.value)} placeholder="IIT Bombay" required />
                </Field>
                <Field label="College email" hint="Used for verification">
                  <Input type="email" value={form.college_email || ""} onChange={e => update("college_email", e.target.value)} placeholder="you@iitb.ac.in" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Department" required>
                  <Input value={form.department || ""} onChange={e => update("department", e.target.value)} placeholder="Computer Science" required />
                </Field>
                <Field label="Degree" required>
                  <Input value={form.degree || ""} onChange={e => update("degree", e.target.value)} placeholder="B.Tech" required />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Expected graduation year" required>
                  <Input type="number" min={2000} max={2100} value={form.graduation_year || ""} onChange={e => update("graduation_year", e.target.value)} placeholder="2027" required />
                </Field>
                <Field label="Student ID" hint="Optional">
                  <Input value={form.student_id || ""} onChange={e => update("student_id", e.target.value)} />
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Current role">
                  <Input value={form.current_position || ""} onChange={e => update("current_position", e.target.value)} placeholder="Senior Engineer" />
                </Field>
                <Field label="Company">
                  <Input value={form.company || ""} onChange={e => update("company", e.target.value)} placeholder="Acme Corp" />
                </Field>
              </div>
              <Field label="Location">
                <Input value={form.location || ""} onChange={e => update("location", e.target.value)} placeholder="Bengaluru, India" />
              </Field>
            </>
          )}

          <Field label="About you" hint="Max 500 characters">
            <Textarea rows={4} value={form.bio || ""} onChange={e => update("bio", e.target.value)} placeholder="Tell the community a bit about yourself…" maxLength={500} />
          </Field>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Finish setup
          </Button>
        </form>
      </div>
    </main>
  );
};

const Field = ({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="flex items-center justify-between">
      <span>{label} {required && <span className="text-destructive">*</span>}</span>
      {hint && <span className="text-xs text-muted-foreground font-normal">{hint}</span>}
    </Label>
    {children}
  </div>
);

export default Onboarding;
