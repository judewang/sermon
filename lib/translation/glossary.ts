import type { LanguageModel } from "ai";
import { generateText, Output } from "ai";
import { z } from "zod";
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
 * Format glossary entries into a system prompt section.
 */
export function formatGlossaryPrompt(entries: GlossaryEntry[]): string {
	if (entries.length === 0) return "";

	const lines = entries.map(
		(e) => `- ${e.korean} → ${e.translation} (${e.category})`,
	);

	return `\n\nGlossary — use these translations consistently:\n${lines.join("\n")}`;
}
