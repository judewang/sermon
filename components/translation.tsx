"use client";

import { cacheTranslation } from "@/actions/cache-translation";
import { env } from "@/lib/env";
import type { allowedLanguages } from "@/lib/language-settings";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { useEffect, useId, useRef, useState } from "react";
import type { z } from "zod";
import { ArticleLoading } from "./article-loading";
import { MarkdownContent } from "./markdown-content";

interface ArticleProps {
	language: z.infer<typeof allowedLanguages>;
	raw: string;
}

function getLanguageData(language: z.infer<typeof allowedLanguages>): {
	targetLanguage: string;
} {
	switch (language) {
		case "zh-TW":
			return {
				targetLanguage: "Traditional Chinese",
			};
		case "zh-CN":
			return {
				targetLanguage: "Simplified Chinese",
			};
		default:
			return {
				targetLanguage: "target language",
			};
	}
}

export function Translation({ language, raw }: ArticleProps) {
	const id = useId();
	const key = `${language}-${raw}`;
	const [isThinking, setIsThinking] = useState(true);
	const { targetLanguage } = getLanguageData(language);

	const { messages, isLoading, input, handleSubmit } = useChat({
		api: "/api/translate",
		initialMessages: [
			{ id, role: "system", content: "You are a Bible-savvy pastor." },
		],
		streamMode: "text",
		body: {
			key,
		},
		initialInput: `Translate the following text, which is a part of a Korean sermon, into ${targetLanguage}. Follow these instructions:

- This is a portion of a sermon, not the complete sermon.
- Translate the entire content without summarizing or omitting any parts. Provide a complete and faithful translation of the given text.
- Maintain the original structure, paragraphs, and formatting of the source text in the translation.
- Do not include any introductory phrases like "Here's the translation" or "The translated content is as follows". Start directly with the translated content.
- Do not add any concluding remarks or notes at the end of the translation.
- Don't include any greeting or system-related messages.
- Ensure clear distinction between Traditional Chinese (zh-TW) and Simplified Chinese (zh-CN). Do not confuse or mix these two Chinese variants.
- Here are examples of Traditional Chinese and Simplified Chinese to illustrate the differences:
  Traditional Chinese: 「耶和華是我的牧者，我必不致缺乏。」詩篇 23:1
  Simplified Chinese: 「耶和华是我的牧者，我必不致缺乏。」诗篇 23:1
- Ensure correct usage of traditional characters (e.g., 「為」, 「與」, 「個」) and simplified characters (e.g., 「为」, 「与」, 「个」).
- Pay attention to different vocabulary usage in the two Chinese variants, for example:
  Traditional Chinese: 「聖經」, 「教會」, 「神蹟」
  Simplified Chinese: 「圣经」, 「教会」, 「神迹」
- When translating Bible verses, refer to the official Bible translations in the respective language to ensure accuracy and consistency.
- Pay attention to the specific characters and terms that differ between Traditional and Simplified Chinese, and use them appropriately.
- Please be careful to preserve the Markdown syntax, including spaces.
- Source language code: ko
- Target language code: ${language}

Source text:
${raw}
`,
		async onFinish(message) {
			await cacheTranslation(key, message.content);
		},
		onResponse() {
			setIsThinking(false);
		},
	});
	const submitButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (env.NEXT_PUBLIC_DEV_MODE) {
			console.log("input", input);
			return;
		}
		if (isLoading || !input) return;

		submitButtonRef.current?.click();
	}, [isLoading, input]);

	return (
		<>
			<form onSubmit={handleSubmit}>
				<input hidden readOnly value={input} />
				<button
					disabled={isLoading}
					type="submit"
					className={cn("rounded-lg border px-4 py-2 text-sm", {
						hidden: !env.NEXT_PUBLIC_DEV_MODE,
					})}
					ref={submitButtonRef}
				>
					Translate
				</button>
			</form>
			{isThinking ? (
				<ArticleLoading />
			) : (
				<MarkdownContent>
					{messages.find(({ role }) => role === "assistant")?.content ?? ""}
				</MarkdownContent>
			)}
		</>
	);
}
