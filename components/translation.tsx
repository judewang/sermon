"use client";

import { cacheTranslation } from "@/actions/cache-translation";
import { env } from "@/lib/env";
import { allowedLanguages } from "@/lib/language-settings";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
import { ArticleLoading } from "./article-loading";
import { MarkdownContent } from "./markdown-content";

interface ArticleProps {
  language: z.infer<typeof allowedLanguages>;
  raw: string;
}

export function Translation({ language, raw }: ArticleProps) {
  const id = useId();
  const key = `${language}-${raw}`;
  const [isThinking, setIsThinking] = useState(true);
  const { messages, isLoading, input, handleSubmit } = useChat({
    api: "/api/translate",
    initialMessages: [
      { id, role: "system", content: "You are a Bible-savvy pastor." },
    ],
    streamMode: "text",
    body: {
      key,
    },
    initialInput: `Translate the following Korean sermon article into ${language === "zh-TW" ? "Traditional Chinese" : "target language"} in its entirety, without omitting or adding any content. Provide a complete and faithful translation.

Don't include any greeting or system related messages.
Please be careful to preserve the Markdown syntax, including spaces.
Source language code: ko
Target language code: ${language}

Source text:
${raw}

Example output (for reference only, do not include in translation):
${language === "zh-TW" ? "生命戰勝死亡" : ""}
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
          className={cn({ hidden: !env.NEXT_PUBLIC_DEV_MODE })}
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
