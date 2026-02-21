"use client";

import type { allowedLanguages as AllowedLanguagesType } from "@/lib/language-settings";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import type { z } from "zod";
import { MarkdownContent } from "./markdown-content";
import { TranslationThinking } from "./translation-thinking";

interface ArticleProps {
	language: z.infer<typeof AllowedLanguagesType>;
	raw: string;
}

export function Translation({ language, raw }: ArticleProps) {
	const hasStarted = useRef(false);

	const { completion, complete } = useCompletion({
		api: "/api/translate",
		body: { language },
	});

	useEffect(() => {
		if (language === "ko") return;
		if (hasStarted.current) return;
		hasStarted.current = true;
		complete(raw);
	}, [language, raw, complete]);

	if (language === "ko") {
		return <MarkdownContent>{raw}</MarkdownContent>;
	}

	if (completion.length === 0) {
		return <TranslationThinking language={language} />;
	}

	return <MarkdownContent>{completion}</MarkdownContent>;
}
