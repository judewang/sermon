/**
 * Heuristic token estimation for mixed Korean/English text.
 *
 * Korean characters ≈ 2.5 tokens each
 * English/digits ≈ 1.3 tokens each
 * Whitespace/punctuation ≈ 1 token each
 */
export function estimateTokens(text: string): number {
	let tokens = 0;

	for (const char of text) {
		const code = char.codePointAt(0)!;

		if (
			// Korean syllables, Jamo, compatibility Jamo
			(code >= 0xac00 && code <= 0xd7af) ||
			(code >= 0x1100 && code <= 0x11ff) ||
			(code >= 0x3130 && code <= 0x318f) ||
			// CJK unified ideographs
			(code >= 0x4e00 && code <= 0x9fff)
		) {
			tokens += 2.5;
		} else if (
			(code >= 0x41 && code <= 0x5a) || // A-Z
			(code >= 0x61 && code <= 0x7a) || // a-z
			(code >= 0x30 && code <= 0x39) // 0-9
		) {
			tokens += 1.3;
		} else {
			tokens += 1;
		}
	}

	return Math.ceil(tokens);
}

/**
 * Check if the text is long enough to warrant splitting.
 */
export function shouldSplit(text: string, maxTokens: number = 20000): boolean {
	return estimateTokens(text) > maxTokens;
}
