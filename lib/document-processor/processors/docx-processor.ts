import { convertToHtml } from "mammoth";
import { NodeHtmlMarkdown } from "node-html-markdown";
import type { ProcessingResult } from "../types";
import { splitMarkdown } from "../utils/split-markdown";

interface DocxElement {
	type: string;
	children?: DocxElement[];
	alignment?: string;
	styleId?: string;
	isBold?: boolean;
}

/**
 * 將 strong 標籤的內容解包
 */
function unwrapStrong(child: DocxElement): DocxElement {
	return { ...child, isBold: false };
}

/**
 * 轉換段落元素，設定適當的樣式
 */
function transformParagraph(
	element: DocxElement,
	isTitle?: boolean,
): DocxElement {
	// 處理置中對齊的標題
	if (element.alignment === "center" && !element.styleId) {
		return {
			...element,
			styleId: isTitle ? "Heading1" : "Heading2",
			children: element.children?.map((child) => unwrapStrong(child)),
		};
	}

	// 處理全部為粗體的段落作為小標題
	if (element.children && element.children.length > 0) {
		const allChildrenBold = element.children.every(
			(child) => child.isBold === true,
		);
		if (
			allChildrenBold ||
			(element.children.length === 1 && element.children[0].isBold)
		) {
			return {
				...element,
				styleId: "Heading3",
				children: element.children.map((child) => unwrapStrong(child)),
			};
		}
	}

	// 所有其他情況
	return element;
}

/**
 * 轉換 DOCX 文件的元素
 */
function transformElement(element: DocxElement, index: number): DocxElement {
	let newElement = { ...element };

	if (newElement.children) {
		const children = newElement.children.map((child) =>
			transformElement(child, index),
		);
		newElement = { ...newElement, children };
	}

	if (newElement.type === "paragraph") {
		newElement = transformParagraph(newElement, index === 0);
	}

	return newElement;
}

/**
 * 處理 DOCX 格式的文件
 */
export async function processDocx(file: File): Promise<ProcessingResult> {
	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);
	let index = 0;

	// 使用 mammoth 將 .docx 檔案轉換為 HTML
	const result = await convertToHtml(
		{ buffer },
		{
			transformDocument: (element) => transformElement(element, index++),
		},
	);

	const html = result.value;
	const markdown = NodeHtmlMarkdown.translate(html);
	const markdownChunks = splitMarkdown(markdown);

	return {
		markdown: markdownChunks,
		metadata: {
			originalFileName: file.name,
			fileSize: file.size,
			contentType: file.type,
		},
	};
}
