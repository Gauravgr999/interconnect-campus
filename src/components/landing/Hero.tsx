import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-20 px-4">
      <div className="absolute inset-0 -z-10">
        <img src={heroBg} alt="" width={1920} height={1080} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>
      <div className="absolute top-32 -left-20 size-72 rounded-full bg-primary/30 blur-3xl animate-glow-pulse -z-10" />
      <div className="absolute bottom-20 -right-20 size-96 rounded-full bg-accent/20 blur-3xl animate-glow-pulse -z-10" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8 animate-fade-in">
          <Sparkles className="size-3.5 text-accent" />
          <span>The future of student networking is here</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] animate-fade-up">
          Where students <br />
          <span className="text-gradient">build their future</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.15s" }}>
          Connect with students across colleges, find mentors, discover internships,
          collaborate on startups, and grow your career — all in one professional platform.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button variant="hero" size="xl" className="group" asChild>
            <Link to="/auth">
              Join the network
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="glass" size="xl" asChild><Link to="/auth?mode=signin">Sign in</Link></Button>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.45s" }}>
          {[
            { icon: Users, value: "120K+", label: "Students" },
            { icon: Zap, value: "850+", label: "Colleges" },
            { icon: Sparkles, value: "10+", label: "AI Tools" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass-card rounded-2xl p-5 md:p-6">
              <Icon className="size-5 text-accent mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold tracking-tight">{value}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
