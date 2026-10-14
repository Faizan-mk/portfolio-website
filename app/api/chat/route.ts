import { ApiError, GoogleGenAI, type Content } from "@google/genai";
import { assistantPrompt } from "@/lib/assistant-prompt";

// Free tier of the Gemini API (Google AI Studio). The "-latest" aliases always point at the newest Flash models;
// Flash-Lite has the larger free daily quota, Flash is the fallback. Override with GEMINI_MODEL if needed.
const MODELS = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ["gemini-flash-lite-latest", "gemini-flash-latest"];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_MESSAGES = 12;
const MAX_CHARS = 600;
const RATE_LIMIT = 20; // requests per IP per window
const RATE_WINDOW_MS = 10 * 60 * 1000;

// Best-effort per-instance limiter: enough to stop casual abuse of the API key. Use Upstash/Redis for a hard limit.
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function parseMessages(body: unknown): Content[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const messages = raw.slice(-MAX_MESSAGES).map((m) => ({
    role: m?.role === "assistant" ? "model" : "user",
    text: typeof m?.content === "string" ? m.content.slice(0, MAX_CHARS) : "",
  }));
  if (messages[0].role !== "user") messages.shift();
  if (messages.length === 0 || messages.at(-1)!.role !== "user" || !messages.at(-1)!.text.trim()) return null;
  return messages.map(({ role, text }) => ({ role, parts: [{ text }] }));
}

// Opens a stream on the first model that accepts the request, moving on when one is missing, out of free quota,
// or overloaded; the whole list gets one more pass after a short pause, since Gemini's 503s are usually brief.
async function openStream(contents: Content[]) {
  let lastError: unknown;
  for (const [attempt, model] of [...MODELS, ...MODELS].entries()) {
    if (attempt === MODELS.length) await new Promise((r) => setTimeout(r, 800));
    try {
      return await ai.models.generateContentStream({
        model,
        contents,
        config: { systemInstruction: assistantPrompt(), maxOutputTokens: 1024, temperature: 0.2 },
      });
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiError && [404, 429, 503].includes(error.status))) break;
    }
  }
  throw lastError;
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response("The assistant isn't set up yet: GEMINI_API_KEY is missing.", { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(ip)) {
    return new Response("Too many messages. Please try again in a few minutes.", { status: 429 });
  }

  const contents = parseMessages(await req.json().catch(() => null));
  if (!contents) return new Response("Invalid request.", { status: 400 });

  let stream: AsyncGenerator<{ text?: string }>;
  try {
    stream = await openStream(contents);
  } catch (error) {
    console.error("chat error:", error instanceof ApiError ? `${error.status} ${error.message}` : error);
    const busy = error instanceof ApiError && error.status === 429;
    return new Response(
      busy ? "The assistant has hit its free daily limit. Please try again later or email Faizan directly." : "The assistant couldn't answer just now.",
      { status: busy ? 429 : 502 },
    );
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
      } catch (error) {
        console.error("chat stream error:", error);
        controller.enqueue(encoder.encode("\n\nThe answer was cut off. Please try again."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
