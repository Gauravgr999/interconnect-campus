import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => (
  <section className="py-24 px-4">
    <div className="max-w-5xl mx-auto relative">
      <div className="absolute -inset-8 bg-gradient-hero opacity-30 blur-3xl -z-10" />
      <div className="glass-card rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/30 rounded-full blur-3xl -z-10" />
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
          Your career starts <br />with a <span className="text-gradient">connection</span>
        </h2>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          Join thousands of students already building their future on InterConnect Campus. Free forever for students.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="hero" size="xl" className="group" asChild>
            <Link to="/auth">
              Create your profile
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="glass" size="xl" asChild><Link to="/auth?mode=signin">Sign in</Link></Button>
        </div>
      </div>
    </div>
  </section>
);
