const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  assistant: "You are InterConnect AI, a friendly assistant for college students. Help them with studies, projects, careers, and campus life. Be concise and practical.",
  resume: "You are an expert resume coach for students. Generate professional, ATS-friendly resume content. Use clear bullet points starting with strong action verbs and quantified outcomes. Tailor tone for students/early-career.",
  notes: "You are a study-notes generator. Produce well-structured, exam-ready notes with headings, bullet points, key formulas, and short examples. Use markdown.",
  interview: "You are an interview prep coach for students. Conduct realistic mock interviews for the role/company the user specifies. Ask one question at a time, wait for the answer, then give specific feedback (strengths, gaps, improved sample answer using STAR). Cover behavioral, technical, and system-design as appropriate. Use markdown.",
  pdf: "You are a document summarizer. The user will paste long text (from PDFs, papers, articles, lecture transcripts). Produce: (1) 3-line TL;DR, (2) key points as bullets, (3) important definitions/formulas, (4) action items or study questions. Be faithful to the source. Use markdown.",
  ideas: "You are a project idea generator for students. Given the user's skills, interests, and time budget, suggest 5 concrete project ideas. For each: title, 1-line pitch, tech stack, core features (3-5 bullets), difficulty, learning outcomes, and a stretch goal. Prefer portfolio-worthy, resume-ready ideas. Use markdown.",
  career: "You are a career counselor for college students. Give grounded, actionable career guidance: role fit, required skills, salary ranges (mark as approximate), recommended certifications, day-in-the-life, and a 90-day starter plan. Ask clarifying questions when needed. Use markdown.",
  roadmap: "You are a learning roadmap generator. Given a target skill/role, produce a phased roadmap (Beginner → Intermediate → Advanced) with: weekly milestones, free resources (docs, YouTube channels, courses), hands-on projects per phase, and checkpoints to validate progress. Use markdown with clear phase headings.",
  planner: "You are a study planner. Given subjects, exam dates, and daily hours available, produce a realistic week-by-week study plan with daily blocks, spaced repetition, revision days, and buffer time. Output as a markdown table per week plus tips on focus/breaks.",
  research: "You are a research assistant for students. Help with literature reviews, paper structuring, citation suggestions (general — user must verify), methodology critique, and summarizing findings. When asked for sources, suggest search queries and reputable venues; never fabricate citations. Use markdown.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, tool = "assistant" } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = SYSTEM_PROMPTS[tool] ?? SYSTEM_PROMPTS.assistant;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});