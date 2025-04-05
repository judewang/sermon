import { env } from "@/lib/env";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

// const perplexity = createOpenAI({
// 	name: "perplexity",
// 	apiKey: env.PERPLEXITY_API_KEY,
// 	baseURL: "https://api.perplexity.ai/",
// });
const xai = createOpenAI({
	name: "xai",
	apiKey: env.XAI_API_KEY,
	baseURL: "https://api.x.ai/v1",
});

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = await streamText({
		model: xai("grok-beta"),
		messages,
	});

	return result.toTextStreamResponse();
}
