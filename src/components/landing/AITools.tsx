import { Bot, Brain, FileText, GitBranch, Lightbulb, MapPin, NotebookPen, ScrollText, Sparkles, Target } from "lucide-react";

const tools = [
  { icon: ScrollText, name: "Resume Builder", color: "from-violet-500 to-fuchsia-500" },
  { icon: Brain, name: "Interview Prep", color: "from-cyan-500 to-blue-500" },
  { icon: NotebookPen, name: "Notes Generator", color: "from-amber-500 to-pink-500" },
  { icon: FileText, name: "PDF Summarizer", color: "from-emerald-500 to-teal-500" },
  { icon: Bot, name: "Coding Assistant", color: "from-indigo-500 to-violet-500" },
  { icon: Lightbulb, name: "Project Ideas", color: "from-yellow-500 to-orange-500" },
  { icon: Target, name: "Career Guide", color: "from-rose-500 to-red-500" },
  { icon: MapPin, name: "Roadmap Generator", color: "from-blue-500 to-cyan-500" },
  { icon: Sparkles, name: "Study Planner", color: "from-purple-500 to-pink-500" },
  { icon: GitBranch, name: "Research Assistant", color: "from-green-500 to-emerald-500" },
];

export const AITools = () => (
  <section id="ai-tools" className="py-24 px-4 relative overflow-hidden">
    <div className="max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest text-accent">Free for every student</span>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
          AI Tools <span className="text-gradient">Hub</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          10+ AI-powered tools to accelerate your studies, projects, and career.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tools.map(({ icon: Icon, name, color }, i) => (
          <div key={name}
            className="glass-card rounded-2xl p-5 text-center group hover:-translate-y-1 transition-all cursor-pointer animate-fade-up"
            style={{ animationDelay: `${i * 0.04}s` }}>
            <div className={`size-12 mx-auto rounded-xl bg-gradient-to-br ${color} grid place-items-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
              <Icon className="size-5 text-white" />
            </div>
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-muted-foreground mt-1">Free</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
