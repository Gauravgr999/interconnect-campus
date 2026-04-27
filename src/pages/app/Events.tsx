import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, Plus, Globe } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  college: string | null;
  location: string | null;
  is_online: boolean;
  starts_at: string;
  organizer_id: string;
  rsvp_count: number;
  rsvped: boolean;
};

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "hackathon",
    college: "", location: "", is_online: false,
    starts_at: "", url: "",
  });

  const load = async () => {
    const { data: evs } = await supabase.from("events").select("*").order("starts_at", { ascending: true });
    if (!evs) return;
    const ids = evs.map((e) => e.id);
    const { data: rsvps } = ids.length
      ? await supabase.from("event_rsvps").select("event_id, user_id").in("event_id", ids)
      : { data: [] as any };
    const counts = new Map<string, number>();
    const mine = new Set<string>();
    (rsvps ?? []).forEach((r: any) => {
      counts.set(r.event_id, (counts.get(r.event_id) ?? 0) + 1);
      if (r.user_id === user?.id) mine.add(r.event_id);
    });
    setEvents(evs.map((e) => ({
      ...e,
      rsvp_count: counts.get(e.id) ?? 0,
      rsvped: mine.has(e.id),
    })));
  };
  useEffect(() => { load(); }, [user?.id]);

  const create = async () => {
    if (!form.title || !form.starts_at) return toast.error("Title and start date required");
    const { error } = await supabase.from("events").insert({
      organizer_id: user!.id,
      title: form.title,
      description: form.description || null,
      category: form.category as any,
      college: form.college || null,
      location: form.location || null,
      is_online: form.is_online,
      starts_at: new Date(form.starts_at).toISOString(),
      url: form.url || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Event created");
    setOpen(false);
    setForm({ title: "", description: "", category: "hackathon", college: "", location: "", is_online: false, starts_at: "", url: "" });
    load();
  };

  const toggleRsvp = async (e: EventRow) => {
    if (!user) return;
    if (e.rsvped) {
      await supabase.from("event_rsvps").delete().eq("event_id", e.id).eq("user_id", user.id);
    } else {
      await supabase.from("event_rsvps").insert({ event_id: e.id, user_id: user.id });
    }
    load();
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-sm text-muted-foreground">Hackathons, workshops, fests across colleges.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero"><Plus className="size-4" /> Create</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create event</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="fest">Fest</SelectItem>
                        <SelectItem value="meetup">Meetup</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Starts at</Label>
                    <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>College</Label>
                    <Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
                  </div>
                  <div>
                    <Label>Location / Link</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={form.is_online ? "Zoom URL" : "City"} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_online} onChange={(e) => setForm({ ...form, is_online: e.target.checked })} />
                  Online event
                </label>
                <Button variant="hero" className="w-full" onClick={create}>Publish event</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No events yet — be the first to create one.</p>}
          {events.map((e) => (
            <article key={e.id} className="glass-card rounded-2xl p-5 flex flex-col">
              <div className="aspect-video rounded-xl bg-gradient-primary mb-3 relative overflow-hidden">
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider glass rounded-full px-2.5 py-1">{e.category}</span>
              </div>
              <h3 className="font-semibold leading-snug">{e.title}</h3>
              {e.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground flex-1">
                <div className="flex items-center gap-1.5"><Calendar className="size-3" />{format(new Date(e.starts_at), "MMM d, p")}</div>
                {e.is_online ? (
                  <div className="flex items-center gap-1.5"><Globe className="size-3" />Online</div>
                ) : e.location && (
                  <div className="flex items-center gap-1.5"><MapPin className="size-3" />{e.location}{e.college ? ` · ${e.college}` : ""}</div>
                )}
                <div className="flex items-center gap-1.5"><Users className="size-3" />{e.rsvp_count} attending</div>
              </div>
              <Button className="mt-4" variant={e.rsvped ? "glass" : "hero"} onClick={() => toggleRsvp(e)}>
                {e.rsvped ? "Attending ✓" : "RSVP"}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Events;