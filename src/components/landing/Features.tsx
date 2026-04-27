import { Briefcase, Calendar, GraduationCap, MessageSquare, Network, Rocket, ShieldCheck, Trophy, UserCheck } from "lucide-react";

const features = [
  { icon: UserCheck, title: "Verified Profiles", desc: "College-verified student accounts that auto-transition to alumni after graduation." },
  { icon: Network, title: "Inter-College Networking", desc: "Connect with peers, seniors, and mentors across hundreds of campuses." },
  { icon: Briefcase, title: "Internship Portal", desc: "Discover internships, placements, and startup roles tailored to your skills." },
  { icon: MessageSquare, title: "Real-Time Chat", desc: "1:1, group, and college-wise communities with voice notes and file sharing." },
  { icon: Calendar, title: "Events & Hackathons", desc: "Host or join hackathons, workshops, fests, and competitions across India." },
  { icon: Rocket, title: "Co-founder Finder", desc: "Find collaborators for your startup ideas and build something legendary." },
  { icon: Trophy, title: "Growth Dashboard", desc: "Track your profile strength, skills, and networking score in real time." },
  { icon: GraduationCap, title: "Alumni Network", desc: "Stay connected with your batch and tap into a powerful alumni community." },
  { icon: ShieldCheck, title: "Trust & Safety", desc: "Moderation, verification, and secure auth keep the platform clean and pro." },
];

export const Features = () => (
  <section id="features" className="py-24 px-4 relative">
    <div className="absolute inset-0 bg-gradient-radial -z-10" />
    <div className="max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest text-accent">Built for students</span>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
          Everything you need to <span className="text-gradient">grow</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          A LinkedIn-grade professional platform, reimagined for the unique journey of college life.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <div key={title}
            className="glass-card rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300 hover:shadow-glow animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="size-11 rounded-xl bg-gradient-primary grid place-items-center mb-4 group-hover:scale-110 transition-transform">
              <Icon className="size-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
