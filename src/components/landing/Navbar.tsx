import { Button } from "@/components/ui/button";
import { GraduationCap, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Features", href: "#features" },
  { label: "AI Tools", href: "#ai-tools" },
  { label: "Community", href: "#community" },
  { label: "Events", href: "#events" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <nav className="glass max-w-6xl mx-auto rounded-2xl px-5 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-semibold">
          <span className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <GraduationCap className="size-5 text-primary-foreground" />
          </span>
          <span className="text-lg tracking-tight">InterConnect<span className="text-gradient"> Campus</span></span>
        </a>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          {links.map(l => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button variant="hero" size="sm">Get started</Button>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          <Menu className="size-5" />
        </button>
      </nav>
      {open && (
        <div className="md:hidden glass max-w-6xl mx-auto mt-2 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
          {links.map(l => <a key={l.href} href={l.href} className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>{l.label}</a>)}
          <Button variant="hero" size="sm" className="mt-1">Get started</Button>
        </div>
      )}
    </header>
  );
};
