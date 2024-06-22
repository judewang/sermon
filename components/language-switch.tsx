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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

export const languageOptions = [
  { value: "ko", display: "한국어" },
  { value: "en", display: "English" },
  { value: "zh-TW", display: "正體中文" },
  { value: "zh-CN", display: "简体中文" },
  { value: "vi", display: "tiếng Việt" },
  { value: "ru", display: "Русский Язык" },
] satisfies { value: z.infer<typeof allowedLanguages>; display: string }[];

export function LanguageSwitch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const language = allowedLanguages.safeParse(
    searchParams.get("lang") ?? defaultLanguage,
  );

  function handleLanguageChange(value: string) {
    const newSearchParams = new URLSearchParams(searchParams);

    value === defaultLanguage
      ? newSearchParams.delete("lang")
      : newSearchParams.set("lang", value);

    router.push(`${pathname}?${newSearchParams}`);
  }

  return (
    <Select
      defaultValue={language.success ? language.data : defaultLanguage}
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
