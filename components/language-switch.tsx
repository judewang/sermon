"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type allowedLanguages,
	defaultLanguage,
} from "@/lib/language-settings";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import type { z } from "zod";

export const languageOptions = [
  { value: "ko", display: "한국어" },
  { value: "en", display: "English" },
  { value: "zh-TW", display: "正體中文" },
  { value: "zh-CN", display: "简体中文" },
  { value: "vi", display: "tiếng Việt" },
  { value: "ru", display: "Русский Язык" },
  { value: "th", display: "ไทย" },
  { value: "lo", display: "ພາສາລາ" }
] satisfies { value: z.infer<typeof allowedLanguages>; display: string }[];

interface LanguageSwitchProps {
	currentLanguage: z.infer<typeof allowedLanguages>;
}

export function LanguageSwitch({ currentLanguage }: LanguageSwitchProps) {
	const router = useRouter();

	function handleLanguageChange(value: string) {
		// 直接導航到語言路徑
		if (value === defaultLanguage) {
			router.push(`/${defaultLanguage}`);
		} else {
			router.push(`/${value}`);
		}
	}

	return (
		<Select defaultValue={currentLanguage} onValueChange={handleLanguageChange}>
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
