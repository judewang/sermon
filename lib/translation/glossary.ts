import type { LanguageModel } from "ai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { redis } from "@/lib/redis";
import { foreignLanguages, getLanguageData } from "@/lib/language-settings";
import type { GlossaryEntry } from "./types";

const glossarySchema = z.object({
	entries: z.array(
		z.object({
			korean: z.string(),
			translation: z.string(),
			category: z.enum(["person", "place", "bible-book", "term"]),
		}),
	),
});

const MAX_EXTRACT_CHARS = 8000;

/**
 * Extract a glossary of proper nouns and key terms from sermon text.
 * Uses AI to identify person names, place names, Bible book names, and important terms.
 */
export async function extractGlossary(
	text: string,
	targetLanguage: string,
	model: LanguageModel,
): Promise<GlossaryEntry[]> {
	const sample = text.length > MAX_EXTRACT_CHARS ? text.slice(0, MAX_EXTRACT_CHARS) : text;

	try {
		const { output } = await generateText({
			model,
			output: Output.object({ schema: glossarySchema }),
			prompt: `You are a Korean sermon translator. Extract all proper nouns and important terms from this Korean sermon text that need consistent translation into ${targetLanguage}.

Categories:
- person: Names of people (biblical or contemporary)
- place: Geographic locations
- bible-book: Names of Bible books
- term: Important theological or recurring terms

For each entry, provide the Korean original and the correct ${targetLanguage} translation.

Text:
${sample}`,
		});

		return output?.entries ?? [];
	} catch {
		// Fallback: try generateText with JSON parsing
		try {
			const { text: rawJson } = await generateText({
				model,
				prompt: `You are a Korean sermon translator. Extract all proper nouns and important terms from this Korean sermon text that need consistent translation into ${targetLanguage}.

Return a JSON object with this exact structure:
{"entries": [{"korean": "...", "translation": "...", "category": "person|place|bible-book|term"}]}

Categories:
- person: Names of people (biblical or contemporary)
- place: Geographic locations
- bible-book: Names of Bible books
- term: Important theological or recurring terms

Text:
${sample}`,
			});

			const parsed = JSON.parse(rawJson.replace(/```json\n?|\n?```/g, "").trim());
			const result = glossarySchema.safeParse(parsed);
			return result.success ? result.data.entries : [];
		} catch {
			return [];
		}
	}
}

/**
 * Build the Redis key for a cached glossary.
 */
function glossaryRedisKey(sermonKey: string, lang: string): string {
	return `glossary:${sermonKey}:${lang}`;
}

/**
 * Retrieve a cached glossary from Redis.
 */
export async function getCachedGlossary(
	sermonKey: string,
	lang: string,
): Promise<GlossaryEntry[] | null> {
	return redis.get<GlossaryEntry[]>(glossaryRedisKey(sermonKey, lang));
}

/**
 * Store a glossary in Redis.
 */
export async function cacheGlossary(
	sermonKey: string,
	lang: string,
	entries: GlossaryEntry[],
): Promise<void> {
	// Cache for 30 days
	await redis.set(glossaryRedisKey(sermonKey, lang), entries, { ex: 60 * 60 * 24 * 30 });
}

/**
 * Generate glossaries for all non-Korean languages and cache them in Redis.
 * Intended to run in the background after document upload.
 */
export async function generateAndCacheAllGlossaries(
	sermonKey: string,
	text: string,
	model: LanguageModel,
): Promise<void> {
	await Promise.all(
		foreignLanguages.map(async (lang) => {
			const { targetLanguage } = getLanguageData(lang);
			const entries = await extractGlossary(text, targetLanguage, model);
			await cacheGlossary(sermonKey, lang, entries);
		}),
	);
}

/**
 * Format glossary entries into a system prompt section.
 */
export function formatGlossaryPrompt(entries: GlossaryEntry[]): string {
	if (entries.length === 0) return "";

	const lines = entries.map(
		(e) => `- ${e.korean} → ${e.translation} (${e.category})`,
	);

	return `\n\nGlossary — use these translations consistently:\n${lines.join("\n")}`;
}
