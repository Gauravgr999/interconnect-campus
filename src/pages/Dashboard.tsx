import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, User, LogOut, Sparkles, BadgeCheck } from "lucide-react";
import { useEffect } from "react";

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth?mode=signin", { replace: true });
    if (!loading && profile && !profile.onboarding_completed) navigate("/onboarding", { replace: true });
  }, [user, profile, loading, navigate]);

  if (loading || !profile) return <main className="min-h-screen grid place-items-center text-muted-foreground">Loading…</main>;

  const isStudent = profile.account_type === "college_student";
  const isAlumni = profile.account_type === "alumni";

  return (
    <main className="min-h-screen px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-32 right-0 size-[500px] bg-primary/25 rounded-full blur-3xl -z-10" />
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <GraduationCap className="size-5 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-tight">InterConnect<span className="text-gradient"> Campus</span></span>
          </div>
          <Button variant="glass" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </header>

        <div className="glass-card rounded-3xl p-8 mb-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className={`size-20 rounded-2xl grid place-items-center text-3xl font-bold text-primary-foreground ${isStudent ? "bg-gradient-primary" : "bg-gradient-accent"}`}>
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{profile.full_name}</h1>
                {profile.is_verified && <BadgeCheck className="size-5 text-accent" />}
                <span className="text-[10px] uppercase tracking-wider glass rounded-full px-2.5 py-1">
                  {isStudent ? "College Student" : isAlumni ? "Alumni" : "Personal"}
                </span>
              </div>
              {profile.headline && <p className="text-muted-foreground mt-1">{profile.headline}</p>}
              {isStudent && profile.college_name && (
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.degree} · {profile.department} · <span className="text-foreground/80">{profile.college_name}</span> · Class of {profile.graduation_year}
                </p>
              )}
              {!isStudent && (profile.current_position || profile.company) && (
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.current_position}{profile.current_position && profile.company && " · "}{profile.company}
                </p>
              )}
            </div>
          </div>
          {profile.bio && <p className="mt-5 text-foreground/80 leading-relaxed">{profile.bio}</p>}
        </div>

        <div className="glass-card rounded-3xl p-8 text-center">
          <Sparkles className="size-8 text-accent mx-auto mb-3" />
          <h2 className="text-xl font-semibold">Your dashboard is coming alive</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Profiles are live. Next we'll wire up connections, feed, chat, AI tools, and events.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
