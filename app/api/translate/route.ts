import { env } from "@/lib/env";
import { createOpenAI } from "@ai-sdk/openai";
import { kv } from "@vercel/kv";
import { StreamingTextResponse, streamText } from "ai";

const perplexity = createOpenAI({
  apiKey: env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai/",
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const key = JSON.stringify(messages);
  const cached = await kv.get<string>(key);

  if (cached) {
    return new Response(cached);
  }

  const result = await streamText({
    model: perplexity("llama-3-sonar-small-32k-online"),
    messages,
  });

  const stream = result.toAIStream({
    async onFinal(completion) {
      await kv.set<string>(key, completion);
    },
  });

  return new StreamingTextResponse(stream);
}
