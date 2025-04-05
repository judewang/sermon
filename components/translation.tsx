"use client";

import { translateText } from "@/app/actions";
import type { allowedLanguages as AllowedLanguagesType } from "@/lib/language-settings";
import { readStreamableValue } from "ai/rsc";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { MarkdownContent } from "./markdown-content";

interface ArticleProps {
	language: z.infer<typeof AllowedLanguagesType>;
	raw: string;
}

export function Translation({ language, raw }: ArticleProps) {
	const [translatedContent, setTranslatedContent] = useState<string>("");

	useEffect(() => {
		// 若為原始語言（韓文），直接顯示原文
		if (language === "ko") {
			setTranslatedContent(raw);
			return;
		}

		async function fetchTranslation() {
			// 調用 server action 獲取翻譯流
			const { output } = await translateText(raw, language);

			// 讀取流式數據
			for await (const delta of readStreamableValue(output)) {
				// 清理輸出並更新狀態
				setTranslatedContent((currentContent) => `${currentContent}${delta}`);
			}
		}

		fetchTranslation();
	}, [language, raw]);

	return <MarkdownContent>{translatedContent}</MarkdownContent>;
}
