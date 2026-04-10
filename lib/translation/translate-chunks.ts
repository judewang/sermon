import type { LanguageModel } from "ai";
import { streamText } from "ai";
import { extractGlossary, formatGlossaryPrompt } from "./glossary";
import { splitSermon } from "./split-sermon";
import type { TranslationPipelineOptions } from "./types";

const SLIDING_CONTEXT_CHARS = 500;
const MAX_RETRIES = 2;

/**
 * Build the base translation system prompt.
 */
function buildSystemPrompt(
	targetLanguage: string,
	glossaryPrompt: string,
): string {
	return `You are a professional Korean sermon translator. Translate the given Korean text into ${targetLanguage}. Follow these instructions:

- Translate the entire content without summarizing or omitting any parts.
- Maintain the original structure, paragraphs, and formatting.
- Do not include any introductory or concluding remarks.
- Ensure clear distinction between Traditional Chinese (zh-TW) and Simplified Chinese (zh-CN) if applicable.
- When translating Bible verses, refer to official Bible translations in ${targetLanguage}.
- Preserve Markdown syntax including spaces.
- Source language code: ko${glossaryPrompt}`;
}

/**
 * Translate a single chunk with retry logic.
 */
async function translateChunkWithRetry(
	model: LanguageModel,
	systemPrompt: string,
	chunkContent: string,
	slidingContext: string,
): Promise<string> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			const userPrompt = slidingContext
				? `[Context from previous section for continuity — do not re-translate this part]\n${slidingContext}\n\n---\n\n[Translate the following]\n${chunkContent}`
				: chunkContent;

			const result = streamText({
				model,
				system: systemPrompt,
				prompt: userPrompt,
			});

			// Collect the full text
			let text = "";
			for await (const chunk of result.textStream) {
				text += chunk;
			}
			return text;
		} catch (err) {
			lastError = err as Error;
			if (attempt < MAX_RETRIES) {
				// Brief pause before retry
				await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
			}
		}
	}

	throw lastError ?? new Error("Translation failed after retries");
}

/**
 * Run the full translation pipeline: split → glossary → translate chunks → join.
 *
 * Returns a ReadableStream that streams translated text as each chunk completes.
 */
export function createTranslationPipelineStream(
	model: LanguageModel,
	options: TranslationPipelineOptions,
): ReadableStream<string> {
	const { sourceText, targetLanguage } = options;

	return new ReadableStream<string>({
		async start(controller) {
			try {
				// Split sermon into chunks
				const chunks = splitSermon(sourceText);

				// Extract glossary
				const glossaryEntries = await extractGlossary(
					sourceText,
					targetLanguage,
					model,
				);
				const glossaryPrompt = formatGlossaryPrompt(glossaryEntries);
				const systemPrompt = buildSystemPrompt(targetLanguage, glossaryPrompt);

				let previousTranslation = "";

				// Translate chunks sequentially with sliding context
				for (let i = 0; i < chunks.length; i++) {
					const chunk = chunks[i];

					// Sliding context: tail of previous translation
					const slidingContext =
						i > 0 && previousTranslation.length > 0
							? previousTranslation.slice(-SLIDING_CONTEXT_CHARS)
							: "";

					const translated = await translateChunkWithRetry(
						model,
						systemPrompt,
						chunk.content,
						slidingContext,
					);

					previousTranslation = translated;

					// Stream the translated chunk (add separator between chunks)
					if (i > 0) {
						controller.enqueue("\n\n");
					}
					controller.enqueue(translated);
				}

				controller.close();
			} catch (err) {
				controller.error(err);
			}
		},
	});
}

/**
 * Create a streaming translation pipeline that streams token-by-token.
 * Each chunk is streamed as it's being translated, providing real-time feedback.
 */
export function createStreamingTranslationPipeline(
	model: LanguageModel,
	options: TranslationPipelineOptions,
): ReadableStream<string> {
	const { sourceText, targetLanguage } = options;

	return new ReadableStream<string>({
		async start(controller) {
			try {
				const chunks = splitSermon(sourceText);

				const glossaryEntries = await extractGlossary(
					sourceText,
					targetLanguage,
					model,
				);
				const glossaryPrompt = formatGlossaryPrompt(glossaryEntries);
				const systemPrompt = buildSystemPrompt(targetLanguage, glossaryPrompt);

				let previousTranslation = "";

				for (let i = 0; i < chunks.length; i++) {
					const chunk = chunks[i];

					const slidingContext =
						i > 0 && previousTranslation.length > 0
							? previousTranslation.slice(-SLIDING_CONTEXT_CHARS)
							: "";

					if (i > 0) {
						controller.enqueue("\n\n");
					}

					const userPrompt = slidingContext
						? `[Context from previous section for continuity — do not re-translate this part]\n${slidingContext}\n\n---\n\n[Translate the following]\n${chunk.content}`
						: chunk.content;

					let chunkTranslation = "";
					let lastError: Error | null = null;

					for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
						try {
							const result = streamText({
								model,
								system: systemPrompt,
								prompt: userPrompt,
							});

							for await (const token of result.textStream) {
								chunkTranslation += token;
								controller.enqueue(token);
							}

							lastError = null;
							break;
						} catch (err) {
							lastError = err as Error;
							if (attempt < MAX_RETRIES) {
								await new Promise((r) =>
									setTimeout(r, 1000 * (attempt + 1)),
								);
							}
						}
					}

					if (lastError) {
						controller.error(lastError);
						return;
					}

					previousTranslation = chunkTranslation;
				}

				controller.close();
			} catch (err) {
				controller.error(err);
			}
		},
	});
}
