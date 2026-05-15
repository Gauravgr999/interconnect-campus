import { Link } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { Bot, Brain, FileText, GitBranch, Lightbulb, MapPin, NotebookPen, ScrollText, Sparkles, Target } from "lucide-react";

const tools = [
  { to: "/app/ai/assistant", icon: Bot, name: "AI Assistant", desc: "Ask anything", color: "from-violet-500 to-fuchsia-500", live: true },
  { to: "/app/ai/resume", icon: ScrollText, name: "Resume Builder", desc: "ATS-ready resumes", color: "from-cyan-500 to-blue-500", live: true },
  { to: "/app/ai/notes", icon: NotebookPen, name: "Notes Generator", desc: "Exam-ready notes", color: "from-amber-500 to-pink-500", live: true },
  { to: "/app/ai/interview", icon: Brain, name: "Interview Prep", desc: "Mock interviews + feedback", color: "from-indigo-500 to-violet-500", live: true },
  { to: "/app/ai/pdf", icon: FileText, name: "PDF Summarizer", desc: "Summarize long docs", color: "from-emerald-500 to-teal-500", live: true },
  { to: "/app/ai/ideas", icon: Lightbulb, name: "Project Ideas", desc: "Portfolio-worthy ideas", color: "from-yellow-500 to-orange-500", live: true },
  { to: "/app/ai/career", icon: Target, name: "Career Guide", desc: "Personal career guidance", color: "from-rose-500 to-red-500", live: true },
  { to: "/app/ai/roadmap", icon: MapPin, name: "Roadmap Generator", desc: "Phased learning paths", color: "from-blue-500 to-cyan-500", live: true },
  { to: "/app/ai/planner", icon: Sparkles, name: "Study Planner", desc: "Weekly study plans", color: "from-purple-500 to-pink-500", live: true },
  { to: "/app/ai/research", icon: GitBranch, name: "Research Assistant", desc: "Lit review & structure", color: "from-green-500 to-emerald-500", live: true },
];

const AIHub = () => (
  <AppShell>
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">AI Tools Hub</h1>
      <p className="text-sm text-muted-foreground mb-6">Free AI-powered tools to accelerate your studies and career.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tools.map(({ to, icon: Icon, name, desc, color }) => (
          <Link key={name} to={to}>
            <div className="glass-card rounded-2xl p-5 group transition-all hover:-translate-y-1 cursor-pointer">
              <div className={`size-12 rounded-xl bg-gradient-to-br ${color} grid place-items-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="size-5 text-white" />
              </div>
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </AppShell>
);

export default AIHub;