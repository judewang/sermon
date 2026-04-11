import { env } from "@/lib/env";
import { allowedLanguages, getLanguageData } from "@/lib/language-settings";
import {
	createStreamingTranslationPipeline,
	shouldSplit,
} from "@/lib/translation";
import { createXai } from "@ai-sdk/xai";
import { streamText } from "ai";

export const maxDuration = 300;

const xai = createXai({
	apiKey: env.XAI_API_KEY,
});

const model = xai("grok-4-1-fast-reasoning");

const BASE_PROMPT = `Translate the following text, which is a part of a Korean sermon, into {TARGET_LANGUAGE}. Follow these instructions:

- This is a portion of a sermon, not the complete sermon.
- Translate the entire content without summarizing or omitting any parts. Provide a complete and faithful translation of the given text.
- Maintain the original structure, paragraphs, and formatting of the source text in the translation.
- Do not include any introductory phrases like "Here's the translation" or "The translated content is as follows". Start directly with the translated content.
- Do not add any concluding remarks or notes at the end of the translation.
- Don't include any greeting or system-related messages.
- Ensure clear distinction between Traditional Chinese (zh-TW) and Simplified Chinese (zh-CN). Do not confuse or mix these two Chinese variants.
- Ensure correct usage of traditional characters and simplified characters.
- Pay attention to different vocabulary usage in the two Chinese variants.
- When translating Bible verses, refer to the official Bible translations in the respective language to ensure accuracy and consistency.
- Pay attention to the specific characters and terms that differ between Traditional and Simplified Chinese, and use them appropriately.
- Please be careful to preserve the Markdown syntax, including spaces.
- Source language code: ko

Source text:
`;

export async function POST(req: Request) {
	const { prompt, language, sermonKey } = await req.json();

	const parsed = allowedLanguages.safeParse(language);
	if (!parsed.success) {
		return new Response("Invalid language", { status: 400 });
	}

	const { targetLanguage } = getLanguageData(parsed.data);

	// Short text: direct single-pass translation (existing behavior)
	if (!shouldSplit(prompt)) {
		const result = streamText({
			model,
			prompt: BASE_PROMPT.replace("{TARGET_LANGUAGE}", targetLanguage) + prompt,
		});

		return result.toTextStreamResponse();
	}

	// Long text: multi-chunk pipeline with token-by-token streaming
	const stream = createStreamingTranslationPipeline(model, {
		sourceText: prompt,
		targetLanguage,
		languageCode: parsed.data,
		sermonKey: typeof sermonKey === "string" ? sermonKey : undefined,
	});

	// Convert the string ReadableStream to a byte stream for Response
	const encoder = new TextEncoder();
	const responseStream = stream.pipeThrough(
		new TransformStream<string, Uint8Array>({
			transform(chunk, controller) {
				controller.enqueue(encoder.encode(chunk));
			},
		}),
	);

	return new Response(responseStream, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
