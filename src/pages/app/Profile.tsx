import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BadgeCheck, Save } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    location: profile?.location ?? "",
    current_position: profile?.current_position ?? "",
    company: profile?.company ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", profile.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated"); refreshProfile(); }
  };

  if (!profile) return null;
  const isStudent = profile.account_type === "college_student";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="glass-card rounded-3xl p-6 mb-5">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-primary grid place-items-center text-2xl font-bold text-primary-foreground">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.full_name}</h1>
                {profile.is_verified && <BadgeCheck className="size-5 text-accent" />}
              </div>
              <span className="text-[10px] uppercase tracking-wider glass rounded-full px-2.5 py-1 inline-block mt-1">
                {profile.account_type.replace("_", " ")}
              </span>
              {isStudent && profile.college_name && (
                <p className="text-xs text-muted-foreground mt-2">
                  {profile.degree} · {profile.department} · {profile.college_name} · Class of {profile.graduation_year}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="font-semibold">Edit profile</h2>
          <div>
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <Label>Headline</Label>
            <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. CS Junior · Building AI tools" />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Current role</Label>
              <Input value={form.current_position} onChange={(e) => setForm({ ...form, current_position: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Company / org</Label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <Button variant="hero" onClick={save} disabled={saving}><Save className="size-4" /> Save</Button>
        </div>
      </div>
    </AppShell>
  );
};

export default Profile;