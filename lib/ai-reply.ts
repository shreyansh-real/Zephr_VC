/**
 * AI Reply Generator — client-side fallback chain: Gemini → Groq → OpenRouter
 *
 * Because societydesk uses `output: "export"` (static hosting), there are no
 * server-side API routes. Keys are NEXT_PUBLIC_ so they reach the browser.
 *
 * Provider order:
 *  1. Gemini (Google AI Studio)
 *  2. Groq
 *  3. OpenRouter
 * Falls through to the next provider on error or missing key.
 */

export interface AIReplyContext {
  complaintTitle: string;
  complaintDescription: string;
  complaintCategory: string;
  complaintPriority: string;
  complaintStatus: string;
  previousUpdates?: string[];
  staffRole: string;
  societyName?: string;
}

const SYSTEM_PROMPT = `You are a helpful housing society management assistant. 
You help admins and volunteers draft professional, empathetic, and actionable replies to resident complaints.
Keep replies concise (2–4 sentences), professional, and resident-friendly.
Do NOT include greetings like "Dear Resident" or sign-offs — just the reply body.
Do NOT use markdown formatting, just plain text.`;

function buildUserPrompt(ctx: AIReplyContext): string {
  const updates = ctx.previousUpdates?.length
    ? `\nPrevious updates:\n${ctx.previousUpdates.map((u, i) => `${i + 1}. ${u}`).join("\n")}`
    : "";

  return `Complaint title: "${ctx.complaintTitle}"
Category: ${ctx.complaintCategory}
Priority: ${ctx.complaintPriority}
Current status: ${ctx.complaintStatus}
Description: ${ctx.complaintDescription}${updates}

You are a ${ctx.staffRole} at ${ctx.societyName || "the housing society"}.
Draft a short, professional update/reply to this resident complaint. Be empathetic and specific about next steps or resolution.`;
}

// ── 1. Gemini ─────────────────────────────────────────────────────────────────
async function tryGemini(prompt: string): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.0-flash";
  if (!key) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || null;
  } catch {
    return null;
  }
}

// ── 2. Groq ───────────────────────────────────────────────────────────────────
async function tryGroq(prompt: string): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const model = process.env.NEXT_PUBLIC_GROQ_MODEL || "llama3-8b-8192";
  if (!key) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text?.trim() || null;
  } catch {
    return null;
  }
}

// ── 3. OpenRouter ─────────────────────────────────────────────────────────────
async function tryOpenRouter(prompt: string): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const model =
    process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "mistralai/mistral-7b-instruct:free";
  if (!key) return null;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://societydesk.app",
        "X-Title": "SocietyDesk",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text?.trim() || null;
  } catch {
    return null;
  }
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function generateAIReply(ctx: AIReplyContext): Promise<string> {
  const prompt = buildUserPrompt(ctx);

  const result =
    (await tryGemini(prompt)) ??
    (await tryGroq(prompt)) ??
    (await tryOpenRouter(prompt));

  if (!result) {
    throw new Error(
      "All AI providers failed or are unavailable. Please type your reply manually."
    );
  }

  return result;
}
