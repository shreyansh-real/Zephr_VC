/**
 * lib/ai.ts — server-only AI helper
 * Fallback chain: Gemini → Groq → OpenRouter
 * Exposes generateJSON() and generateText() only.
 * No other file in the app imports a provider SDK directly.
 */
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { TriageOutputSchema, type TriageOutput } from "./schemas";
import { inferCategoryFromText, findMatchingCluster, extractWingOrLocation } from "./clustering";

// ─── Provider configuration ──────────────────────────────────────────────────

interface Provider {
  name: string;
  available: boolean;
  generateJSON: (system: string, user: string, schema: GeminiSchema) => Promise<{ text: string; provider: string }>;
  generateText: (system: string, user: string) => Promise<{ text: string; provider: string }>;
}

// Gemini JSON schema shape (subset we need)
interface GeminiSchema {
  type: string;
  properties: Record<string, { type: string; enum?: string[]; description?: string; minimum?: number; maximum?: number }>;
  required: string[];
}

const TIMEOUT_MS = 8_000;
const RETRY_DELAY_MS = 1_500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

function isRetryable(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("timeout")) return true;
    const e = err as Error & { status?: number };
    if (e.status === 429 || e.status === 503 || e.status === 500) return true;
    if (msg.includes("429") || msg.includes("503") || msg.includes("500") || msg.includes("quota")) return true;
  }
  return false;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Gemini provider ─────────────────────────────────────────────────────────

function buildGeminiProvider(): Provider | null {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!apiKey || !model) return null;

  const ai = new GoogleGenAI({ apiKey });

  const call = async (system: string, user: string, jsonConfig?: { schema: GeminiSchema }) => {
    const config = jsonConfig
      ? {
          systemInstruction: system,
          temperature: 0.1,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: Object.fromEntries(
              Object.entries(jsonConfig.schema.properties).map(([k, v]) => [
                k,
                {
                  type: v.type as typeof Type[keyof typeof Type],
                  ...(v.enum ? { enum: v.enum } : {}),
                  ...(v.description ? { description: v.description } : {}),
                  ...(v.minimum !== undefined ? { minimum: v.minimum } : {}),
                  ...(v.maximum !== undefined ? { maximum: v.maximum } : {}),
                },
              ])
            ),
            required: jsonConfig.schema.required,
            nullable: false,
          },
        }
      : {
          systemInstruction: system,
          temperature: 0.5,
          maxOutputTokens: 256,
        };

    const res = await withTimeout(
      ai.models.generateContent({ model, contents: user, config }),
      TIMEOUT_MS
    );
    return res.text ?? "";
  };

  return {
    name: "Gemini",
    available: true,
    generateJSON: async (system, user, schema) => ({
      text: await call(system, user, { schema }),
      provider: "Gemini",
    }),
    generateText: async (system, user) => ({
      text: await call(system, user, undefined),
      provider: "Gemini",
    }),
  };
}

// ─── OpenAI-compatible provider (Groq / OpenRouter) ──────────────────────────

function buildOpenAICompatProvider(
  name: "Groq" | "OpenRouter",
  baseURL: string,
  keyEnv: string,
  modelEnv: string
): Provider | null {
  const apiKey = process.env[keyEnv];
  const model = process.env[modelEnv];
  if (!apiKey || !model) return null;

  const client = new OpenAI({ apiKey, baseURL, timeout: TIMEOUT_MS });

  const callJSON = async (system: string, user: string): Promise<string> => {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.1,
      max_tokens: 512,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${system}\n\nYou MUST return valid JSON matching this exact structure:
{
  "category": "Water" | "Lift" | "Parking" | "Cleaning" | "Security" | "Noise" | "Other",
  "urgency": "Critical" | "High" | "Medium" | "Low",
  "summary": "Short English summary under 12 words",
  "language": "English" | "Hindi" | "Hinglish",
  "confidence": 0.95,
  "reason": "Short reason for urgency",
  "cluster_id": "matching open cluster ID or empty string",
  "new_cluster_title": "Title for new cluster if no match"
}`,
        },
        { role: "user", content: user },
      ],
    });
    return res.choices[0]?.message.content ?? "";
  };

  const callText = async (system: string, user: string): Promise<string> => {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.5,
      max_tokens: 256,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return res.choices[0]?.message.content ?? "";
  };

  return {
    name,
    available: true,
    generateJSON: async (system, user) => ({
      text: await callJSON(system, user),
      provider: name,
    }),
    generateText: async (system, user) => ({
      text: await callText(system, user),
      provider: name,
    }),
  };
}

// ─── Provider registry ────────────────────────────────────────────────────────

function getProviders(): Provider[] {
  return [
    buildGeminiProvider(),
    buildOpenAICompatProvider("Groq", "https://api.groq.com/openai/v1", "GROQ_API_KEY", "GROQ_MODEL"),
    buildOpenAICompatProvider("OpenRouter", "https://openrouter.ai/api/v1", "OPENROUTER_API_KEY", "OPENROUTER_MODEL"),
  ].filter((p): p is Provider => p !== null);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface AIResult {
  text: string;
  provider: string;
}

export async function generateJSON(
  system: string,
  user: string,
  schema: GeminiSchema
): Promise<AIResult> {
  const providers = getProviders();

  for (const provider of providers) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await provider.generateJSON(system, user, schema);
        return result;
      } catch (err) {
        if (attempt === 0 && isRetryable(err)) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        break;
      }
    }
  }

  throw new Error("All AI providers failed");
}

export async function generateText(system: string, user: string): Promise<AIResult> {
  const providers = getProviders();

  for (const provider of providers) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await provider.generateText(system, user);
        return result;
      } catch (err) {
        if (attempt === 0 && isRetryable(err)) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        break;
      }
    }
  }

  throw new Error("All AI providers failed");
}

// ─── Triage schema (Gemini structured output format) ─────────────────────────

export const TRIAGE_SCHEMA: GeminiSchema = {
  type: "OBJECT",
  properties: {
    category: { type: "STRING", enum: ["Water", "Lift", "Parking", "Cleaning", "Security", "Noise", "Other"] },
    urgency: { type: "STRING", enum: ["Critical", "High", "Medium", "Low"] },
    summary: { type: "STRING", description: "Single English sentence, max 12 words" },
    language: { type: "STRING", enum: ["English", "Hindi", "Hinglish"] },
    confidence: { type: "NUMBER", minimum: 0, maximum: 1 },
    reason: { type: "STRING", description: "One short sentence explaining urgency choice" },
    cluster_id: { type: "STRING", description: "Matching open cluster ID or empty string if none" },
    new_cluster_title: { type: "STRING", description: "Short title if no cluster matched, else empty string" },
  },
  required: ["category", "urgency", "summary", "language", "confidence", "reason", "cluster_id", "new_cluster_title"],
};

// ─── Triage helper ───────────────────────────────────────────────────────────

interface OpenCluster {
  id: string;
  title: string;
  category: string;
  urgency: string;
  count: number;
}

interface TriageContext {
  complaint: { flat_no: string; raw_text: string };
  openClusters: OpenCluster[];
}

export function buildFallback(
  flatNo: string,
  rawText: string,
  openClusters: OpenCluster[]
): TriageOutput & { ai_provider: string } {
  const inferredCategory = inferCategoryFromText(rawText);
  const matched = findMatchingCluster(flatNo, rawText, inferredCategory, openClusters);
  const words = rawText.trim().split(/\s+/).slice(0, 10).join(" ");
  const wing = extractWingOrLocation(flatNo, rawText);
  const title = wing ? `${inferredCategory} issue in Wing ${wing}` : `${inferredCategory} issue reported: ${words}`;

  return {
    category: inferredCategory,
    urgency: "Medium",
    summary: words,
    language: /[^\u0000-\u007F]/.test(rawText) ? "Hindi" : /pani|paani|bhai|yaar|dekh|karo|nahi|nhi|hai|ho/.test(rawText.toLowerCase()) ? "Hinglish" : "English",
    confidence: 0.8,
    reason: `Heuristic triage based on category keywords (${inferredCategory}).`,
    cluster_id: matched ? matched.id : null,
    new_cluster_title: matched ? null : title,
    ai_provider: "heuristic-fallback",
  };
}

export async function triageComplaint(ctx: TriageContext): Promise<TriageOutput & { ai_provider: string }> {
  const clusterList =
    ctx.openClusters.length === 0
      ? "No open clusters yet."
      : ctx.openClusters
          .map(
            (c) =>
              `ID: "${c.id}" | Title: "${c.title}" | Category: ${c.category} | Urgency: ${c.urgency} | Count: ${c.count}`
          )
          .join("\n");

  const systemPrompt = `You are a housing society complaint triage assistant for an Indian residential apartment complex. Return a JSON object only — no other text.

CRITICAL HOUSING SOCIETY CLUSTERING RULES:
- Flats starting with a letter (e.g. C-220, C220, C101) belong to that Wing/Block (Wing C).
- You MUST check the "Open clusters" list. If an open cluster already exists for the SAME problem in the SAME Wing/Tower/Area (e.g., "Water supply in C wing" matches "C220 mai pani nhi aa raha" or "No water in C-101"), you MUST assign "cluster_id" to that cluster's exact ID.
- Do NOT create a duplicate cluster if the underlying issue is the same (e.g. water outage in wing C, lift failure in tower B, garbage on floor 2).
- Only set cluster_id to "" and provide new_cluster_title if it is a genuinely NEW issue not covered by any open cluster.

URGENCY RUBRIC:
- Critical: Risk to life/safety, power blackout, lift stuck with passengers, or essential service completely cut off.
- High: Major utility down for multiple flats (e.g. wing water supply down, main lift broken).
- Medium: Single flat issue, recurring nuisance, parking blocking.
- Low: Minor cosmetic issue, noise inquiry.

CATEGORIES: Water, Lift, Parking, Cleaning, Security, Noise, Other`;

  const userMessage = `Flat Number: ${ctx.complaint.flat_no}

Current Open Clusters:
${clusterList}

Resident Complaint:
<complaint>
${ctx.complaint.raw_text}
</complaint>

Return JSON only.`;

  const parseResult = (raw: string, provider: string): (TriageOutput & { ai_provider: string }) | null => {
    try {
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;

      // Normalize category
      const rawCat = String(parsed.category || "").trim().toLowerCase();
      const validCategories: Array<TriageOutput["category"]> = ["Water", "Lift", "Parking", "Cleaning", "Security", "Noise", "Other"];
      let category = validCategories.find((c) => c.toLowerCase() === rawCat) || inferCategoryFromText(ctx.complaint.raw_text);

      // Normalize urgency
      const rawUrg = String(parsed.urgency || "").trim().toLowerCase();
      const validUrgencies: Array<TriageOutput["urgency"]> = ["Critical", "High", "Medium", "Low"];
      const urgency = validUrgencies.find((u) => u.toLowerCase() === rawUrg) || "Medium";

      // Normalize language
      const rawLang = String(parsed.language || "").trim().toLowerCase();
      let language: TriageOutput["language"] = "English";
      if (rawLang.includes("hinglish")) language = "Hinglish";
      else if (rawLang.includes("hindi")) language = "Hindi";
      else if (/pani|paani|bhai|yaar|dekh|karo|nahi|nhi|hai|ho/.test(ctx.complaint.raw_text.toLowerCase())) language = "Hinglish";

      // Normalize summary
      let summary = String(parsed.summary || ctx.complaint.raw_text).trim().slice(0, 120);

      // Normalize confidence
      let confidence = Number(parsed.confidence);
      if (isNaN(confidence) || confidence < 0 || confidence > 1) confidence = 0.9;

      // Normalize reason
      let reason = String(parsed.reason || `Categorized as ${category} with ${urgency} urgency.`);

      // Normalize cluster_id
      let clusterId: string | null = null;
      if (parsed.cluster_id && typeof parsed.cluster_id === "string") {
        const cId = parsed.cluster_id.trim();
        if (cId && cId !== "null" && cId !== "none" && cId !== '""' && cId !== "N/A") {
          const match = ctx.openClusters.find((c) => c.id === cId || c.id === cId.replace(/["']/g, ""));
          if (match) clusterId = match.id;
        }
      }

      // If AI didn't find a cluster_id, run the semantic/location cluster safety net
      if (!clusterId) {
        const matched = findMatchingCluster(ctx.complaint.flat_no, ctx.complaint.raw_text, category, ctx.openClusters);
        if (matched) {
          clusterId = matched.id;
        }
      }

      // Normalize new_cluster_title
      let newClusterTitle: string | null = null;
      if (!clusterId) {
        newClusterTitle = String(parsed.new_cluster_title || summary || `${category} issue in ${ctx.complaint.flat_no}`).trim();
      }

      return {
        category,
        urgency,
        summary,
        language,
        confidence,
        reason,
        cluster_id: clusterId,
        new_cluster_title: newClusterTitle,
        ai_provider: provider,
      };
    } catch {
      return null;
    }
  };

  const providers = getProviders();

  for (const provider of providers) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await provider.generateJSON(systemPrompt, userMessage, TRIAGE_SCHEMA);
        const parsed = parseResult(res.text, res.provider);
        if (parsed) return parsed;
        if (attempt === 0) continue;
        break;
      } catch (err) {
        if (attempt === 0 && isRetryable(err)) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        break;
      }
    }
  }

  return buildFallback(ctx.complaint.flat_no, ctx.complaint.raw_text, ctx.openClusters);
}

// ─── Reply draft helper ───────────────────────────────────────────────────────

export async function draftReply(params: {
  clusterTitle: string;
  category: string;
  status: string;
  language: string;
  residentNames: string[];
}): Promise<{ draft: string; ai_provider: string }> {
  const names = params.residentNames.slice(0, 5).join(", ");

  const system = `You write polite, direct replies to housing society residents about complaints. Plain text only, no markdown. 2-3 sentences.`;
  const user = `Write a reply about this complaint.

Issue: ${params.clusterTitle}
Category: ${params.category}
Current status: ${params.status}
Reply language: ${params.language} (use Devanagari script for Hindi)
Residents: ${names}

Rules:
- 2 to 3 sentences only
- Polite and direct
- Reference the specific issue and current status
- No promises about exact times
- Plain text only`;

  try {
    const res = await generateText(system, user);
    return { draft: res.text.trim(), ai_provider: res.provider };
  } catch {
    return {
      draft: `Dear residents, we have received your complaint regarding "${params.clusterTitle}" and the society maintenance team is actively working on resolving it. We will keep you updated. Thank you for your cooperation.`,
      ai_provider: "fallback",
    };
  }
}
