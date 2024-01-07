"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allowedLanguages, defaultLanguage } from "@/lib/language-settings";
import { Globe } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";

const languageOptions = [
  { value: "ko", display: "한국어" },
  { value: "en", display: "English" },
  { value: "zh-TW", display: "正體中文" },
  { value: "vi", display: "tiếng Việt" },
  { value: "ru", display: "Русский Язык" },
] satisfies { value: z.infer<typeof allowedLanguages>; display: string }[];

export function LanguageSwitch() {
  const params = useParams<Record<string, string | string[]>>();
  const router = useRouter();
  const language = allowedLanguages.safeParse(params.locale ?? defaultLanguage);

  function handleLanguageChange(value: string) {
    const parsedValue = allowedLanguages.parse(value);

    router.push(
      parsedValue === defaultLanguage ? "/" : `/translations/${parsedValue}`,
    );
  }

  return (
    <Select
      defaultValue={language.success ? language.data : "ko"}
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger className="w-max">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languageOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.display}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
