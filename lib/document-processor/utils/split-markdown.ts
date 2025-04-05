/**
 * 將長文本的 Markdown 分割為較小的片段
 * @param mdString Markdown 文本字串
 * @param maxLength 每個片段的最大長度 (預設: 3500)
 * @returns 分割後的 Markdown 片段陣列
 */
export function splitMarkdown(mdString: string, maxLength = 3500): string[] {
	const paragraphs = mdString.split(/\n{2,}/);
	const result: string[] = [];
	let current = "";

	for (const paragraph of paragraphs) {
		// 如果當前片段加上新段落會超出長度限制，則開始新的片段
		if (current.length + paragraph.length > maxLength) {
			result.push(current.trim());
			current = paragraph;
		} else {
			// 如果是第一個段落，不加換行符
			if (current.length === 0) {
				current = paragraph;
			} else {
				current += `\n\n${paragraph}`;
			}
		}
	}

	// 加入最後一個片段（如果有）
	if (current) {
		result.push(current.trim());
	}

	return result;
}
