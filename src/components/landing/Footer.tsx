import { GraduationCap } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/50 py-12 px-4">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="size-8 rounded-lg bg-gradient-primary grid place-items-center">
          <GraduationCap className="size-4 text-primary-foreground" />
        </span>
        <span className="font-semibold">InterConnect Campus</span>
      </div>
      <p className="text-sm text-muted-foreground">© 2026 InterConnect Campus. Built for students, by students.</p>
    </div>
  </footer>
);
