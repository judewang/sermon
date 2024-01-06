"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allowedLanguages, defaultLanguage } from "@/lib/language-settings";
import { useParams, useRouter } from "next/navigation";

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
