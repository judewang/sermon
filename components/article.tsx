"use client";

import { cacheTranslation } from "@/actions/cache-translation";
import { allowedLanguages, defaultLanguage } from "@/lib/language-settings";
import { useChat } from "ai/react";
import { useEffect, useId, useRef, useState } from "react";
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
  const key = raw;
  const [isThinking, setIsThinking] = useState(true);
  const { messages, isLoading, input, handleSubmit } = useChat({
    api: "/api/translate",
    initialMessages: [
      { id, role: "system", content: "你是一個精通聖經的神學家" },
    ],
    streamMode: "text",
    body: {
      key,
    },
    initialInput: `
      Translate the following Korean sermon article into target language.
      Don't include any greeting or system related messages.
      Please be careful to preserve the Markdown syntax, including spaces.
      Source language code: ko
      Target language code: ${language}
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
    if (isLoading || language === defaultLanguage || !input) return;

    submitButtonRef.current?.click();
  }, [isLoading, language, input]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input hidden readOnly value={input} />
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
        {language !== defaultLanguage && isThinking ? (
          <ArticleLoading />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {language === defaultLanguage
              ? raw
              : messages.find(({ role }) => role === "assistant")?.content ||
                ""}
          </ReactMarkdown>
        )}
      </article>
    </>
  );
}
