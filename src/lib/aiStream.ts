const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

export type AIMsg = { role: "user" | "assistant"; content: string };

export async function streamAI({
  messages, tool = "assistant", onDelta, onDone, onError,
}: {
  messages: AIMsg[];
  tool?: "assistant" | "resume" | "notes" | "interview" | "pdf" | "ideas" | "career" | "roadmap" | "planner" | "research";
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError?: (msg: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, tool }),
    });
    if (!resp.ok || !resp.body) {
      const data = await resp.json().catch(() => ({}));
      onError?.(data.error ?? `Request failed (${resp.status})`);
      onDone();
      return;
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let done = false;
    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) !== -1) {
        let line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { done = true; break; }
        try {
          const parsed = JSON.parse(json);
          const c = parsed.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch {
          buf = line + "\n" + buf;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    onError?.(e instanceof Error ? e.message : "Stream error");
    onDone();
  }
}