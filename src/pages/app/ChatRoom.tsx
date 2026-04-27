import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Send, UserPlus, Users2 } from "lucide-react";
import { toast } from "sonner";

type Msg = { id: string; sender_id: string; content: string; created_at: string };
type Member = { user_id: string; full_name: string };

const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<{ id: string; type: string; name: string | null; created_by: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [candidates, setCandidates] = useState<{ id: string; full_name: string }[]>([]);

  const loadAll = async () => {
    if (!roomId) return;
    const { data: r } = await supabase.from("chat_rooms").select("id, type, name, created_by").eq("id", roomId).maybeSingle();
    setRoom(r);
    const { data: m } = await supabase.from("room_members").select("user_id").eq("room_id", roomId);
    const ids = (m ?? []).map((x) => x.user_id);
    const { data: profs } = ids.length ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] as any };
    const profMap = new Map<string, string>((profs ?? []).map((p: any) => [p.id, p.full_name]));
    setMembers(ids.map((id) => ({ user_id: id, full_name: profMap.get(id) ?? "Member" })));
    const { data: msgs } = await supabase.from("messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true }).limit(200);
    setMessages((msgs ?? []) as Msg[]);
  };

  useEffect(() => { loadAll(); }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const ch = supabase.channel(`room-${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Msg]))
      .on("postgres_changes", { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
        () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!text.trim() || !user || !roomId) return;
    const content = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({ room_id: roomId, sender_id: user.id, content });
    if (error) toast.error(error.message);
  };

  const openInvite = async () => {
    const memberIds = new Set(members.map((m) => m.user_id));
    const { data: profs } = await supabase.from("profiles").select("id, full_name").limit(50);
    setCandidates((profs ?? []).filter((p: any) => !memberIds.has(p.id)) as any);
    setInviteOpen(true);
  };
  const invite = async (uid: string) => {
    const { error } = await supabase.from("room_members").insert({ room_id: roomId!, user_id: uid });
    if (error) toast.error(error.message); else { toast.success("Added"); loadAll(); }
  };

  const title = room?.type === "dm"
    ? members.find((m) => m.user_id !== user?.id)?.full_name ?? "Direct message"
    : room?.name ?? "Group chat";
  const isCreator = room?.created_by === user?.id;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50 backdrop-blur-xl bg-background/60">
          <Button size="icon" variant="ghost" onClick={() => navigate("/app/chat")}><ArrowLeft className="size-4" /></Button>
          <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-sm font-semibold">
            {room?.type === "dm" ? title.charAt(0).toUpperCase() : <Users2 className="size-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{title}</div>
            <div className="text-xs text-muted-foreground">{members.length} member{members.length === 1 ? "" : "s"}</div>
          </div>
          {room?.type === "group" && isCreator && (
            <Dialog open={inviteOpen} onOpenChange={(o) => o ? openInvite() : setInviteOpen(false)}>
              <DialogTrigger asChild>
                <Button size="sm" variant="glass"><UserPlus className="size-4" /> Invite</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add members</DialogTitle></DialogHeader>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {candidates.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Everyone's already here.</p>}
                  {candidates.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                      <div className="size-8 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-xs">{c.full_name.charAt(0).toUpperCase()}</div>
                      <span className="flex-1 text-sm">{c.full_name}</span>
                      <Button size="sm" variant="glass" onClick={() => invite(c.id)}>Add</Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">No messages yet — say hi 👋</div>
          )}
          {messages.map((m) => {
            const me = m.sender_id === user?.id;
            const sender = members.find((x) => x.user_id === m.sender_id);
            return (
              <div key={m.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${me ? "bg-gradient-primary text-primary-foreground" : "glass"}`}>
                  {!me && room?.type === "group" && <div className="text-[10px] uppercase tracking-wide text-accent mb-0.5">{sender?.full_name}</div>}
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="px-4 py-3 border-t border-border/50 backdrop-blur-xl bg-background/60 flex gap-2"
        >
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="bg-background/40" />
          <Button type="submit" variant="hero" disabled={!text.trim()}><Send className="size-4" /></Button>
        </form>
      </div>
    </AppShell>
  );
};

export default ChatRoom;