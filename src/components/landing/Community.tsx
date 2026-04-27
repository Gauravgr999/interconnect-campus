import { MessageCircle, Users2, Mic, Paperclip } from "lucide-react";

export const Community = () => (
  <section id="community" className="py-24 px-4">
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div className="animate-fade-up">
        <span className="text-xs uppercase tracking-widest text-accent">Real-time chat</span>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
          Build your <span className="text-gradient">tribe</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          From college-wise communities to hackathon team chats — everything you need to collaborate, learn, and ship together.
        </p>
        <ul className="mt-8 space-y-4">
          {[
            { icon: Users2, text: "College & department-wide communities" },
            { icon: MessageCircle, text: "1:1 mentorship chats with seniors" },
            { icon: Mic, text: "Voice notes & rich media messaging" },
            { icon: Paperclip, text: "Share files, projects, and resources" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="size-9 rounded-lg glass grid place-items-center">
                <Icon className="size-4 text-accent" />
              </span>
              <span className="text-foreground/90">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="absolute -inset-4 bg-gradient-primary opacity-30 blur-3xl -z-10" />
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-primary grid place-items-center font-semibold text-primary-foreground">CS</div>
              <div>
                <div className="font-semibold text-sm">CS Hackathon Team</div>
                <div className="text-xs text-muted-foreground">12 members · 3 online</div>
              </div>
            </div>
            <div className="size-2 rounded-full bg-emerald-400 animate-glow-pulse" />
          </div>
          {[
            { from: "Aarav · IIT Delhi", msg: "Pushed the auth flow 🚀", me: false },
            { from: "You", msg: "Reviewing now — looks clean!", me: true },
            { from: "Priya · BITS Pilani", msg: "I'll handle the dashboard UI tonight.", me: false },
            { from: "You", msg: "Perfect. Demo at 9pm?", me: true },
          ].map((m, i) => (
            <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.me ? "bg-gradient-primary text-primary-foreground" : "glass"}`}>
                {!m.me && <div className="text-[10px] uppercase tracking-wide text-accent mb-0.5">{m.from}</div>}
                {m.msg}
              </div>
            </div>
          ))}
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 mt-3">
            <Paperclip className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">Type a message…</span>
            <Mic className="size-4 text-accent" />
          </div>
        </div>
      </div>
    </div>
  </section>
);
