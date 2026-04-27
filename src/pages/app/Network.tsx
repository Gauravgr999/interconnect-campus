import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Check, X, Search, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Profile = {
  id: string;
  full_name: string;
  headline: string | null;
  college_name: string | null;
  account_type: string;
};

type Conn = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined";
};

const Network = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [people, setPeople] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Conn[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, headline, college_name, account_type").neq("id", user.id).limit(50),
      supabase.from("connections").select("*").or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
    ]);
    setPeople((p ?? []) as Profile[]);
    setConnections((c ?? []) as Conn[]);
  };
  useEffect(() => { load(); }, [user?.id]);

  const statusFor = (otherId: string): { state: "none" | "outgoing" | "incoming" | "accepted"; conn?: Conn } => {
    const conn = connections.find(
      (c) => (c.requester_id === user?.id && c.addressee_id === otherId)
        || (c.addressee_id === user?.id && c.requester_id === otherId)
    );
    if (!conn) return { state: "none" };
    if (conn.status === "accepted") return { state: "accepted", conn };
    if (conn.requester_id === user?.id) return { state: "outgoing", conn };
    return { state: "incoming", conn };
  };

  const connect = async (otherId: string) => {
    const { error } = await supabase.from("connections").insert({ requester_id: user!.id, addressee_id: otherId });
    if (error) toast.error(error.message); else { toast.success("Request sent"); load(); }
  };
  const respond = async (conn: Conn, status: "accepted" | "declined") => {
    await supabase.from("connections").update({ status }).eq("id", conn.id);
    toast.success(status === "accepted" ? "Connected" : "Declined");
    load();
  };

  const startDM = async (otherId: string) => {
    if (!user) return;
    // Find existing dm where both are members
    const { data: myRooms } = await supabase
      .from("room_members").select("room_id").eq("user_id", user.id);
    const myRoomIds = (myRooms ?? []).map((r) => r.room_id);
    let roomId: string | null = null;
    if (myRoomIds.length) {
      const { data: shared } = await supabase
        .from("room_members").select("room_id").eq("user_id", otherId).in("room_id", myRoomIds);
      if (shared && shared.length) {
        const { data: dms } = await supabase
          .from("chat_rooms").select("id").eq("type", "dm").in("id", shared.map((s) => s.room_id));
        roomId = dms?.[0]?.id ?? null;
      }
    }
    if (!roomId) {
      const { data: room, error } = await supabase.from("chat_rooms")
        .insert({ type: "dm", created_by: user.id }).select().single();
      if (error || !room) return toast.error(error?.message ?? "Failed");
      roomId = room.id;
      await supabase.from("room_members").insert([
        { room_id: roomId, user_id: user.id },
        { room_id: roomId, user_id: otherId },
      ]);
    }
    navigate(`/app/chat/${roomId}`);
  };

  const incoming = connections.filter((c) => c.addressee_id === user?.id && c.status === "pending");
  const accepted = connections.filter((c) => c.status === "accepted");

  const filtered = people.filter((p) =>
    !q || p.full_name.toLowerCase().includes(q.toLowerCase()) || p.college_name?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Network</h1>
        <p className="text-sm text-muted-foreground mb-5">Connect with students from every college.</p>

        <Tabs defaultValue="discover">
          <TabsList className="glass">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="requests">Requests {incoming.length > 0 && <span className="ml-1.5 size-5 rounded-full bg-accent text-accent-foreground text-[10px] grid place-items-center">{incoming.length}</span>}</TabsTrigger>
            <TabsTrigger value="connections">My Network ({accepted.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-3 mt-4">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or college…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-background/40" />
            </div>
            {filtered.map((p) => {
              const s = statusFor(p.id);
              return (
                <div key={p.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                  <div className="size-11 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold text-primary-foreground">
                    {p.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.headline ?? p.college_name ?? p.account_type.replace("_", " ")}</div>
                  </div>
                  {s.state === "none" && <Button size="sm" variant="glass" onClick={() => connect(p.id)}><UserPlus className="size-4" /> Connect</Button>}
                  {s.state === "outgoing" && <span className="text-xs text-muted-foreground">Pending</span>}
                  {s.state === "incoming" && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="hero" onClick={() => respond(s.conn!, "accepted")}><Check className="size-4" /></Button>
                      <Button size="icon" variant="glass" onClick={() => respond(s.conn!, "declined")}><X className="size-4" /></Button>
                    </div>
                  )}
                  {s.state === "accepted" && <Button size="sm" variant="glass" onClick={() => startDM(p.id)}><MessagesSquare className="size-4" /> Message</Button>}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3 mt-4">
            {incoming.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No pending requests.</p>}
            {incoming.map((c) => {
              const p = people.find((x) => x.id === c.requester_id);
              if (!p) return null;
              return (
                <div key={c.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                  <div className="size-11 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold text-primary-foreground">
                    {p.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.college_name}</div>
                  </div>
                  <Button size="icon" variant="hero" onClick={() => respond(c, "accepted")}><Check className="size-4" /></Button>
                  <Button size="icon" variant="glass" onClick={() => respond(c, "declined")}><X className="size-4" /></Button>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="connections" className="space-y-3 mt-4">
            {accepted.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No connections yet.</p>}
            {accepted.map((c) => {
              const otherId = c.requester_id === user?.id ? c.addressee_id : c.requester_id;
              const p = people.find((x) => x.id === otherId);
              if (!p) return null;
              return (
                <div key={c.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                  <div className="size-11 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold text-primary-foreground">
                    {p.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.headline ?? p.college_name}</div>
                  </div>
                  <Button size="sm" variant="glass" onClick={() => startDM(p.id)}><MessagesSquare className="size-4" /> Message</Button>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default Network;