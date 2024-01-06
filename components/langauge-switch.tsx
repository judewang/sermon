"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

const defaultLanguage = "ko";
const languages = [defaultLanguage, "en", "zh-tw"] as const;

export function LanguageSwitch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const allowedLanguages = z.enum(languages);
  const language = allowedLanguages.safeParse(
    searchParams.get("lang") ?? defaultLanguage,
  );

  function handleLanguageChange(value: string) {
    const parsedValue = allowedLanguages.parse(value);
    const newSearchParams = new URLSearchParams(searchParams);

    parsedValue === defaultLanguage
      ? newSearchParams.delete("lang")
      : newSearchParams.set("lang", parsedValue);

    router.push(`?${newSearchParams}`);
  }

  return (
    <Select
      defaultValue={language.success ? language.data : "ko"}
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger className="w-max">
        <span className="mr-2 text-slate-400">Language:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ko">한국어</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="zh-tw">正體中文</SelectItem>
      </SelectContent>
    </Select>
  );
}
