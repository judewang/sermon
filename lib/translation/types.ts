export interface TranslationChunk {
	index: number;
	content: string;
}

export interface GlossaryEntry {
	korean: string;
	translation: string;
	category: "person" | "place" | "bible-book" | "term";
}

export interface TranslationPipelineOptions {
	sourceText: string;
	targetLanguage: string;
	languageCode: string;
	/** Redis sermon key for glossary cache lookup */
	sermonKey?: string;
}
