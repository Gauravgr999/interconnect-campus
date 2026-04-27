import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  { tag: "Hackathon", title: "Smart India Hackathon 2026", college: "IIT Bombay", date: "Mar 15-17", attendees: "5.2K" },
  { tag: "Workshop", title: "AI/ML Bootcamp", college: "BITS Pilani", date: "Apr 02", attendees: "1.1K" },
  { tag: "Fest", title: "TechFest Spectra", college: "NIT Trichy", date: "Apr 22-25", attendees: "12K" },
  { tag: "Meetup", title: "Startup Founders Meet", college: "IIM Ahmedabad", date: "May 08", attendees: "800" },
];

export const Events = () => (
  <section id="events" className="py-24 px-4 relative">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent">Opportunities Hub</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Live <span className="text-gradient">events</span>
          </h2>
        </div>
        <Button variant="glass">Browse all events</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {events.map((e, i) => (
          <div key={e.title}
            className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-all animate-fade-up group"
            style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="aspect-video rounded-xl bg-gradient-primary mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
              <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider glass rounded-full px-2.5 py-1">{e.tag}</span>
            </div>
            <h3 className="font-semibold leading-snug group-hover:text-gradient transition-all">{e.title}</h3>
            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin className="size-3" />{e.college}</div>
              <div className="flex items-center gap-1.5"><Calendar className="size-3" />{e.date}</div>
              <div className="flex items-center gap-1.5"><Users className="size-3" />{e.attendees} interested</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
