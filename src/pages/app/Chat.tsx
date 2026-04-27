import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessagesSquare, Users2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Room = {
  id: string;
  type: "dm" | "group";
  name: string | null;
  last_message_at: string;
  display_name: string;
  member_count: number;
};

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");

  const load = async () => {
    if (!user) return;
    const { data: memberships } = await supabase.from("room_members").select("room_id").eq("user_id", user.id);
    const ids = (memberships ?? []).map((m) => m.room_id);
    if (!ids.length) { setRooms([]); return; }
    const { data: rs } = await supabase.from("chat_rooms").select("*").in("id", ids).order("last_message_at", { ascending: false });
    const { data: members } = await supabase.from("room_members").select("room_id, user_id").in("room_id", ids);
    const byRoom = new Map<string, string[]>();
    (members ?? []).forEach((m) => {
      const a = byRoom.get(m.room_id) ?? [];
      a.push(m.user_id);
      byRoom.set(m.room_id, a);
    });
    const otherIds = [...new Set((members ?? []).map((m) => m.user_id).filter((id) => id !== user.id))];
    const { data: profs } = otherIds.length
      ? await supabase.from("profiles").select("id, full_name").in("id", otherIds)
      : { data: [] as any };
    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));

    setRooms((rs ?? []).map((r) => {
      const memberIds = byRoom.get(r.id) ?? [];
      let display: string = r.name ?? "Group chat";
      if (r.type === "dm") {
        const otherId = memberIds.find((m) => m !== user.id);
        const name = otherId ? (profMap.get(otherId) as string | undefined) : undefined;
        display = name ?? "Direct message";
      }
      return { ...r, display_name: display, member_count: memberIds.length } as Room;
    }));
  };

  useEffect(() => { load(); }, [user?.id]);

  useEffect(() => {
    const ch = supabase.channel("rooms-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_rooms" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "room_members" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const createGroup = async () => {
    if (!groupName.trim() || !user) return;
    const { data: room, error } = await supabase.from("chat_rooms")
      .insert({ type: "group", name: groupName.trim(), created_by: user.id }).select().single();
    if (error || !room) return toast.error(error?.message ?? "Failed");
    await supabase.from("room_members").insert({ room_id: room.id, user_id: user.id });
    toast.success("Group created");
    setGroupName(""); setOpen(false);
    navigate(`/app/chat/${room.id}`);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold">Chat</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero"><Plus className="size-4" /> New group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create group chat</DialogTitle></DialogHeader>
              <Input placeholder="Group name (e.g. Hackathon Team)" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              <Button variant="hero" onClick={createGroup}>Create</Button>
              <p className="text-xs text-muted-foreground">Invite members from inside the chat after creating.</p>
            </DialogContent>
          </Dialog>
        </div>

        {rooms.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <MessagesSquare className="size-8 text-accent mx-auto mb-2" />
            <p className="text-muted-foreground">No chats yet. Connect with someone or start a group.</p>
          </div>
        )}

        <div className="space-y-2">
          {rooms.map((r) => (
            <Link key={r.id} to={`/app/chat/${r.id}`} className="glass-card rounded-xl p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <div className="size-11 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground">
                {r.type === "dm" ? r.display_name.charAt(0).toUpperCase() : <Users2 className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{r.display_name}</div>
                <div className="text-xs text-muted-foreground">
                  {r.member_count} member{r.member_count === 1 ? "" : "s"} · active {formatDistanceToNow(new Date(r.last_message_at), { addSuffix: true })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Chat;