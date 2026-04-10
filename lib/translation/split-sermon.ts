import type { TranslationChunk } from "./types";

const DEFAULT_MAX_CHARS = 4000;

/**
 * Split sermon markdown into translation-friendly chunks.
 *
 * Rules:
 * - Split on double newlines (paragraph boundaries)
 * - Headings (#, ##, ###) are always bound to the next paragraph
 * - Blockquotes (> lines) are never split from their block
 * - Target ~maxChars Korean characters per chunk
 * - Single paragraphs exceeding maxChars are NOT forcibly split
 */
export function splitSermon(
	text: string,
	maxChars: number = DEFAULT_MAX_CHARS,
): TranslationChunk[] {
	const rawBlocks = text.split(/\n\n+/);

	// Merge headings with the following paragraph
	const blocks: string[] = [];
	for (let i = 0; i < rawBlocks.length; i++) {
		const block = rawBlocks[i].trim();
		if (!block) continue;

		if (/^#{1,3}\s/.test(block) && i + 1 < rawBlocks.length) {
			// Bind heading to next block
			blocks.push(`${block}\n\n${rawBlocks[i + 1].trim()}`);
			i++; // skip next
		} else {
			blocks.push(block);
		}
	}

	// Group blocks into chunks respecting maxChars
	const chunks: TranslationChunk[] = [];
	let currentParts: string[] = [];
	let currentLen = 0;

	for (const block of blocks) {
		const blockLen = block.length;

		if (currentParts.length > 0 && currentLen + blockLen > maxChars) {
			// Flush current chunk
			chunks.push({
				index: chunks.length,
				content: currentParts.join("\n\n"),
			});
			currentParts = [];
			currentLen = 0;
		}

		currentParts.push(block);
		currentLen += blockLen;
	}

	// Flush remaining
	if (currentParts.length > 0) {
		chunks.push({
			index: chunks.length,
			content: currentParts.join("\n\n"),
		});
	}

	return chunks;
}
