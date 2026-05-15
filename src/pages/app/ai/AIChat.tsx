import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { streamAI, AIMsg } from "@/lib/aiStream";
import { toast } from "sonner";

type Props = {
  tool: "assistant" | "resume" | "notes" | "interview" | "pdf" | "ideas" | "career" | "roadmap" | "planner" | "research";
  title: string;
  subtitle: string;
  placeholder: string;
  multiline?: boolean;
  starter?: string;
};

export const AIChat = ({ tool, title, subtitle, placeholder, multiline = false, starter }: Props) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AIMsg[]>([]);
  const [input, setInput] = useState(starter ?? "");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg: AIMsg = { role: "user", content: input.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setBusy(true);
    let acc = "";
    await streamAI({
      messages: [...messages, userMsg],
      tool,
      onDelta: (chunk) => {
        acc += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: acc } : m);
          }
          return [...prev, { role: "assistant", content: acc }];
        });
      },
      onError: (m) => toast.error(m),
      onDone: () => setBusy(false),
    });
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen max-w-3xl mx-auto w-full">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Button size="icon" variant="ghost" onClick={() => navigate("/app/ai")}><ArrowLeft className="size-4" /></Button>
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">{placeholder}</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-gradient-primary text-primary-foreground" : "glass"} whitespace-pre-wrap leading-relaxed`}>
                {m.content || (busy ? "…" : "")}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="px-4 py-3 border-t border-border/50 flex gap-2">
          {multiline ? (
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your prompt…"
              className="min-h-[60px] bg-background/40 resize-none"
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }} />
          ) : (
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message…" className="bg-background/40" />
          )}
          <Button type="submit" variant="hero" disabled={!input.trim() || busy}><Send className="size-4" /></Button>
        </form>
      </div>
    </AppShell>
  );
};

export default AIChat;