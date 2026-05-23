/**
 * Thin OpenAI wrapper with a deterministic fallback when no key is configured.
 * Server-side only — never import from a client component.
 */

import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

let client: OpenAI | null = null;

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

function getClient(): OpenAI {
  if (!isAiConfigured()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export interface JsonChatOptions {
  system: string;
  user: string;
  /** Optional schema description. Models will return raw JSON. */
  schemaHint?: string;
  temperature?: number;
}

/**
 * Calls the model in JSON-output mode.
 * Caller is responsible for shape validation (Zod or similar).
 */
export async function chatJson<T = unknown>(opts: JsonChatOptions): Promise<T> {
  const openai = getClient();

  const userContent = opts.schemaHint
    ? `${opts.user}\n\nReturn ONLY valid JSON in this shape:\n${opts.schemaHint}`
    : opts.user;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: opts.temperature ?? 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("AI returned invalid JSON");
  }
}

export async function chatText(opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<string> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: opts.temperature ?? 0.7,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export const AI_MODEL = MODEL;
