'use server';

import { env } from '@/lib/env';
import type { allowedLanguages as AllowedLanguagesType } from '@/lib/language-settings';
import { createXai } from '@ai-sdk/xai';
import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import type { z } from 'zod';

const xai = createXai({
	apiKey: env.API_KEY,
});

function getLanguageData(language: z.infer<typeof AllowedLanguagesType>): {
	targetLanguage: string;
} {
	switch (language) {
		case 'zh-TW':
			return {
				targetLanguage: 'Traditional Chinese',
			};
		case 'zh-CN':
			return {
				targetLanguage: 'Simplified Chinese',
			};
		case 'vi':
			return {
				targetLanguage: 'Vietnamese',
			};
		case 'ru':
			return {
				targetLanguage: 'Russian',
			};
		case 'th':
			return {
				targetLanguage: 'Thai',
			};
		case 'en':
			return {
				targetLanguage: 'English',
			};
		default:
			return {
				targetLanguage: 'Korean',
			};
	}
}

export async function translateText(text: string, language: z.infer<typeof AllowedLanguagesType>) {
	// 若為原始語言（韓文），直接返回原文
	if (language === 'ko') {
		const stream = createStreamableValue(text);
		stream.done();
		return { output: stream.value };
	}

	const { targetLanguage } = getLanguageData(language);
	const stream = createStreamableValue('');

	(async () => {
		// 構建翻譯提示訊息
		const { textStream } = streamText({
			model: xai('grok-2'),
			prompt: `Translate the following text, which is a part of a Korean sermon, into ${targetLanguage}. Follow these instructions:

- This is a portion of a sermon, not the complete sermon.
- Translate the entire content without summarizing or omitting any parts. Provide a complete and faithful translation of the given text.
- Maintain the original structure, paragraphs, and formatting of the source text in the translation.
- Do not include any introductory phrases like "Here's the translation" or "The translated content is as follows". Start directly with the translated content.
- Do not add any concluding remarks or notes at the end of the translation.
- Don't include any greeting or system-related messages.
- Ensure clear distinction between Traditional Chinese (zh-TW) and Simplified Chinese (zh-CN). Do not confuse or mix these two Chinese variants.
- Ensure correct usage of traditional characters and simplified characters.
- Pay attention to different vocabulary usage in the two Chinese variants.
- When translating Bible verses, refer to the official Bible translations in the respective language to ensure accuracy and consistency.
- Pay attention to the specific characters and terms that differ between Traditional and Simplified Chinese, and use them appropriately.
- Please be careful to preserve the Markdown syntax, including spaces.
- Source language code: ko

Source text:
${text}`,
		});

		// 處理流式回應
		for await (const delta of textStream) {
			stream.update(delta);
		}

		// 完成流式傳輸
		stream.done();
	})();

	return { output: stream.value };
}
