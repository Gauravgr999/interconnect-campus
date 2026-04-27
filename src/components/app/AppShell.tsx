import { ReactNode, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Home, Users, Calendar, MessagesSquare, Sparkles, User as UserIcon, LogOut, BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app/feed", icon: Home, label: "Feed" },
  { to: "/app/network", icon: Users, label: "Network" },
  { to: "/app/events", icon: Calendar, label: "Events" },
  { to: "/app/chat", icon: MessagesSquare, label: "Chat" },
  { to: "/app/ai", icon: Sparkles, label: "AI Tools" },
  { to: "/app/profile", icon: UserIcon, label: "Profile" },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/auth?mode=signin", { replace: true });
    else if (profile && !profile.onboarding_completed) navigate("/onboarding", { replace: true });
  }, [user, profile, loading, navigate]);

  if (loading || !user || !profile) {
    return <main className="min-h-screen grid place-items-center text-muted-foreground">Loading…</main>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 backdrop-blur-xl bg-background/60 sticky top-0 h-screen">
        <Link to="/app/feed" className="flex items-center gap-2 px-5 py-5">
          <span className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <GraduationCap className="size-5 text-primary-foreground" />
          </span>
          <span className="font-semibold tracking-tight">InterConnect</span>
        </Link>
        <nav className="flex-1 px-3 space-y-1">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                  isActive ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold text-primary-foreground">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate flex items-center gap-1">
                {profile.full_name}
                {profile.is_verified && <BadgeCheck className="size-3.5 text-accent" />}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {profile.account_type.replace("_", " ")}
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <Link to="/app/feed" className="flex items-center gap-2">
          <span className="size-7 rounded-lg bg-gradient-primary grid place-items-center">
            <GraduationCap className="size-4 text-primary-foreground" />
          </span>
          <span className="font-semibold text-sm">InterConnect</span>
        </Link>
        <Button size="icon" variant="ghost" onClick={async () => { await signOut(); navigate("/"); }}>
          <LogOut className="size-4" />
        </Button>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-background/80 border-t border-border/50 grid grid-cols-6 px-1 py-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px]",
                isActive ? "text-foreground" : "text-muted-foreground"
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};