"use client";

import type { allowedLanguages as AllowedLanguagesType } from "@/lib/language-settings";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useMemo, useRef } from "react";
import type { z } from "zod";
import { MarkdownContent } from "./markdown-content";
import { TranslationThinking } from "./translation-thinking";

const CHUNK_LOADING_MARKER = "<!-- CHUNK_LOADING -->";

interface ArticleProps {
	language: z.infer<typeof AllowedLanguagesType>;
	raw: string;
}

export function Translation({ language, raw }: ArticleProps) {
	const hasStarted = useRef(false);

	const { completion, complete, error, isLoading } = useCompletion({
		api: "/api/translate",
		body: { language },
		streamProtocol: "text",
	});

	useEffect(() => {
		if (language === "ko") return;
		if (hasStarted.current) return;
		hasStarted.current = true;
		complete(raw);
	}, [language, raw, complete]);

	// Check if the stream is currently between chunks (waiting for next chunk)
	const isWaitingForNextChunk = useMemo(() => {
		return isLoading && completion.trimEnd().endsWith(CHUNK_LOADING_MARKER);
	}, [completion, isLoading]);

	// Strip chunk loading markers from displayed content
	const displayContent = useMemo(() => {
		return completion.replaceAll(CHUNK_LOADING_MARKER, "").trim();
	}, [completion]);

	if (language === "ko") {
		return <MarkdownContent>{raw}</MarkdownContent>;
	}

	if (completion.length === 0 && !error) {
		return <TranslationThinking language={language} />;
	}

	return (
		<>
			{displayContent.length > 0 && (
				<MarkdownContent>{displayContent}</MarkdownContent>
			)}
			{isWaitingForNextChunk && (
				<TranslationThinking language={language} />
			)}
			{error && (
				<div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
					Translation error: {error.message}. Partial content above may be
					incomplete.
				</div>
			)}
		</>
	);
}
