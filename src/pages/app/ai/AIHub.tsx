import { Link } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { Bot, Brain, FileText, GitBranch, Lightbulb, MapPin, NotebookPen, ScrollText, Sparkles, Target, Lock } from "lucide-react";

const tools = [
  { to: "/app/ai/assistant", icon: Bot, name: "AI Assistant", desc: "Ask anything", color: "from-violet-500 to-fuchsia-500", live: true },
  { to: "/app/ai/resume", icon: ScrollText, name: "Resume Builder", desc: "ATS-ready resumes", color: "from-cyan-500 to-blue-500", live: true },
  { to: "/app/ai/notes", icon: NotebookPen, name: "Notes Generator", desc: "Exam-ready notes", color: "from-amber-500 to-pink-500", live: true },
  { to: "#", icon: Brain, name: "Interview Prep", desc: "Coming soon", color: "from-indigo-500 to-violet-500", live: false },
  { to: "#", icon: FileText, name: "PDF Summarizer", desc: "Coming soon", color: "from-emerald-500 to-teal-500", live: false },
  { to: "#", icon: Lightbulb, name: "Project Ideas", desc: "Coming soon", color: "from-yellow-500 to-orange-500", live: false },
  { to: "#", icon: Target, name: "Career Guide", desc: "Coming soon", color: "from-rose-500 to-red-500", live: false },
  { to: "#", icon: MapPin, name: "Roadmap Generator", desc: "Coming soon", color: "from-blue-500 to-cyan-500", live: false },
  { to: "#", icon: Sparkles, name: "Study Planner", desc: "Coming soon", color: "from-purple-500 to-pink-500", live: false },
  { to: "#", icon: GitBranch, name: "Research Assistant", desc: "Coming soon", color: "from-green-500 to-emerald-500", live: false },
];

const AIHub = () => (
  <AppShell>
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">AI Tools Hub</h1>
      <p className="text-sm text-muted-foreground mb-6">Free AI-powered tools to accelerate your studies and career.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tools.map(({ to, icon: Icon, name, desc, color, live }) => {
          const Card = (
            <div className={`glass-card rounded-2xl p-5 group transition-all relative ${live ? "hover:-translate-y-1 cursor-pointer" : "opacity-60 cursor-not-allowed"}`}>
              <div className={`size-12 rounded-xl bg-gradient-to-br ${color} grid place-items-center mb-3 ${live ? "group-hover:scale-110 transition-transform" : ""} shadow-lg`}>
                <Icon className="size-5 text-white" />
              </div>
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              {!live && <Lock className="absolute top-3 right-3 size-3.5 text-muted-foreground" />}
            </div>
          );
          return live ? <Link key={name} to={to}>{Card}</Link> : <div key={name}>{Card}</div>;
        })}
      </div>
    </div>
  </AppShell>
);

export default AIHub;