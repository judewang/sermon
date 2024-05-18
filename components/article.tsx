"use client";

import { allowedLanguages, defaultLanguage } from "@/lib/language-settings";
import { useChat } from "ai/react";
import { useEffect, useId, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { ArticleLoading } from "./article-loading";

interface ArticleProps {
  language: z.infer<typeof allowedLanguages>;
  raw: string;
}

export function Article({ language, raw }: ArticleProps) {
  const id = useId();
  const { messages, isLoading, input, handleSubmit } = useChat({
    api: "/api/translate",
    initialMessages: [
      { id, role: "system", content: "你是一個精通聖經的神學家" },
    ],
    initialInput: `請幫我將這段用韓語寫成的牧師講道內容用 ${language} 的語言翻譯，回覆時請回覆翻譯後的講道內容即可，不要包含任何問候或者是系統相關資訊 ${raw}`,
  });
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isLoading || language === defaultLanguage) return;

    submitButtonRef.current?.click();
  }, [isLoading, language]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input hidden value={input} />
        <button
          disabled={isLoading}
          type="submit"
          className="hidden"
          ref={submitButtonRef}
        >
          Translate
        </button>
      </form>
      <article className="container prose prose-xl prose-zinc bg-white py-6 md:prose-2xl prose-headings:mt-0 prose-h1:mb-3">
        {language !== defaultLanguage && !messages.length ? (
          <ArticleLoading />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {language === defaultLanguage
              ? raw
              : messages
                  .filter(({ role }) => role === "assistant")
                  .map((message) => message.content)
                  .join("\n")}
          </ReactMarkdown>
        )}
      </article>
    </>
  );
}
