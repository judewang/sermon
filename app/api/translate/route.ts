import { env } from "@/lib/env";
import { createOpenAI } from "@ai-sdk/openai";
import { kv } from "@vercel/kv";
import { streamText } from "ai";

const perplexity = createOpenAI({
  apiKey: env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai/",
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, key } = await req.json();
  const cached = await kv.get<string>(key);

  if (cached) {
    return new Response(cached);
  }

  const result = await streamText({
    model: perplexity("llama-3-sonar-large-32k-chat"),
    messages,
  });

  return result.toTextStreamResponse();
}
