import { env } from "@/lib/env";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const perplexity = createOpenAI({
	apiKey: env.PERPLEXITY_API_KEY,
	baseURL: "https://api.perplexity.ai/",
});

export const runtime = "edge";

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = await streamText({
		model: perplexity("llama-3.1-sonar-large-128k-chat"),
		messages,
	});

	return result.toTextStreamResponse();
}
