export function splitMarkdown(mdString: string, maxLength = 5000): string[] {
	const paragraphs = mdString.split(/\n{2,}/);
	const result: string[] = [];
	let current = "";

	for (const paragraph of paragraphs) {
		if (current.length + paragraph.length > maxLength) {
			result.push(current);
			current = paragraph;
		} else {
			current += `\n\n${paragraph}`;
		}
	}

	if (current) {
		result.push(current);
	}

	return result;
}
