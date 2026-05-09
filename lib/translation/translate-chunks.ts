import type { LanguageModel } from "ai";
import { streamText } from "ai";
import { extractGlossary, formatGlossaryPrompt, getCachedGlossary } from "./glossary";
import { splitSermon } from "./split-sermon";
import type { TranslationPipelineOptions } from "./types";

const SLIDING_CONTEXT_CHARS = 500;
const MAX_RETRIES = 2;
const STREAM_VALIDATION_MIN_LETTERS = 120;
const STREAM_VALIDATION_MAX_CHARS = 500;
const KOREAN_LEAK_MIN_HANGUL = 6;
const KOREAN_LEAK_RATIO = 0.2;
// Marker sent between chunks so the frontend can show a loading indicator
export const CHUNK_BOUNDARY_MARKER = "\n\n<!-- CHUNK_LOADING -->\n\n";

type ValidatedTextStreamOptions = {
	model: LanguageModel;
	fallbackModel?: LanguageModel;
	system?: string;
	prompt: string;
	targetLanguage: string;
};

class KoreanLeakError extends Error {
	constructor(targetLanguage: string) {
		super(`Model returned Korean text while translating to ${targetLanguage}`);
		this.name = "KoreanLeakError";
	}
}

function countMatches(text: string, pattern: RegExp): number {
	return text.match(pattern)?.length ?? 0;
}

function countLetters(text: string): number {
	return countMatches(text, /\p{L}/gu);
}

function isLikelyUntranslatedKorean(text: string): boolean {
	const sample = text
		.replaceAll(CHUNK_BOUNDARY_MARKER.trim(), "")
		.replace(/<!--[\s\S]*?-->/g, "")
		.trim();

	if (!sample) return false;

	const hangulCount = countMatches(
		sample,
		/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/gu,
	);
	const letterCount = countLetters(sample);

	return (
		hangulCount >= KOREAN_LEAK_MIN_HANGUL &&
		hangulCount / Math.max(letterCount, 1) >= KOREAN_LEAK_RATIO
	);
}

function hasEnoughValidationText(text: string): boolean {
	return (
		countLetters(text) >= STREAM_VALIDATION_MIN_LETTERS ||
		text.length >= STREAM_VALIDATION_MAX_CHARS
	);
}

async function streamSingleAttempt(
	options: Omit<ValidatedTextStreamOptions, "fallbackModel">,
	controller: ReadableStreamDefaultController<string>,
): Promise<string> {
	const abortController = new AbortController();
	const result = streamText({
		model: options.model,
		system: options.system,
		prompt: options.prompt,
		abortSignal: abortController.signal,
	});

	let fullText = "";
	let validationBuffer = "";
	let hasFlushed = false;

	for await (const token of result.textStream) {
		fullText += token;

		if (!hasFlushed) {
			validationBuffer += token;

			if (isLikelyUntranslatedKorean(validationBuffer)) {
				abortController.abort();
				throw new KoreanLeakError(options.targetLanguage);
			}

			if (hasEnoughValidationText(validationBuffer)) {
				controller.enqueue(validationBuffer);
				hasFlushed = true;
			}

			continue;
		}

		controller.enqueue(token);
	}

	if (!hasFlushed) {
		if (isLikelyUntranslatedKorean(fullText)) {
			throw new KoreanLeakError(options.targetLanguage);
		}

		controller.enqueue(validationBuffer);
	}

	return fullText;
}

async function streamTextWithValidation(
	options: ValidatedTextStreamOptions,
	controller: ReadableStreamDefaultController<string>,
): Promise<string> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		const attemptModel =
			attempt === 0 ? options.model : options.fallbackModel ?? options.model;

		try {
			return await streamSingleAttempt(
				{
					model: attemptModel,
					system: options.system,
					prompt: options.prompt,
					targetLanguage: options.targetLanguage,
				},
				controller,
			);
		} catch (err) {
			lastError = err as Error;

			if (attempt < MAX_RETRIES) {
				await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
			}
		}
	}

	throw lastError ?? new Error("Translation failed after retries");
}

export function createValidatedTextStream(
	options: ValidatedTextStreamOptions,
): ReadableStream<string> {
	return new ReadableStream<string>({
		async start(controller) {
			try {
				await streamTextWithValidation(options, controller);
				controller.close();
			} catch (err) {
				controller.error(err);
			}
		},
	});
}

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
- Translate every heading, Bible reference, section title, and paragraph. Do not copy any Korean heading or body text into the output.
- The output must be entirely in ${targetLanguage}. If a Korean word appears in the source, translate it instead of preserving it.
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
				? `<previous_translation_context>\n${slidingContext}\n</previous_translation_context>\n\nIMPORTANT: The above is for continuity only. Do NOT include it in your output. Translate ONLY the Korean text below. Your output MUST be entirely in the target language, never Korean.\n\n<translate_this>\n${chunkContent}\n</translate_this>`
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
	const { sourceText, targetLanguage, sermonKey, languageCode } = options;

	return new ReadableStream<string>({
		async start(controller) {
			try {
				// Split sermon into chunks
				const chunks = splitSermon(sourceText);

				// Try cached glossary first, fallback to live extraction
				let glossaryEntries = sermonKey && languageCode
					? await getCachedGlossary(sermonKey, languageCode)
					: null;
				if (!glossaryEntries) {
					glossaryEntries = await extractGlossary(
						sourceText,
						targetLanguage,
						model,
					);
				}
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
	fallbackModel?: LanguageModel,
): ReadableStream<string> {
	const { sourceText, targetLanguage, sermonKey, languageCode } = options;

	return new ReadableStream<string>({
		async start(controller) {
			try {
				const chunks = splitSermon(sourceText);

				// Try cached glossary first, fallback to live extraction
				let glossaryEntries = sermonKey && languageCode
					? await getCachedGlossary(sermonKey, languageCode)
					: null;
				if (!glossaryEntries) {
					glossaryEntries = await extractGlossary(
						sourceText,
						targetLanguage,
						model,
					);
				}
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
						controller.enqueue(CHUNK_BOUNDARY_MARKER);
					}

					const userPrompt = slidingContext
						? `<previous_translation_context>\n${slidingContext}\n</previous_translation_context>\n\nIMPORTANT: The above is for continuity only. Do NOT include it in your output. Translate ONLY the Korean text below. Your output MUST be entirely in the target language, never Korean.\n\n<translate_this>\n${chunk.content}\n</translate_this>`
						: `Translate the following Korean text. Your output MUST be entirely in the target language, never Korean.\n\n${chunk.content}`;

					const chunkTranslation = await streamTextWithValidation(
						{
							model,
							fallbackModel,
							system: systemPrompt,
							prompt: userPrompt,
							targetLanguage,
						},
						controller,
					);

					previousTranslation = chunkTranslation;
				}

				controller.close();
			} catch (err) {
				controller.error(err);
			}
		},
	});
}
