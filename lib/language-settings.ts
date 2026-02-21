import { z } from "zod";

export const defaultLanguage = "ko";

export const allowedLanguages = z.enum([
  defaultLanguage,
  "en",
  "zh-CN",
  "zh-TW",
  "vi",
  "ru",
  "th",
  "lo"
]);

export const foreignLanguages = allowedLanguages.options.filter(
  (lang) => lang !== defaultLanguage,
);

export function getLanguageData(language: z.infer<typeof allowedLanguages>): {
  targetLanguage: string;
} {
  switch (language) {
    case "zh-TW":
      return { targetLanguage: "Traditional Chinese" };
    case "zh-CN":
      return { targetLanguage: "Simplified Chinese" };
    case "vi":
      return { targetLanguage: "Vietnamese" };
    case "ru":
      return { targetLanguage: "Russian" };
    case "th":
      return { targetLanguage: "Thai" };
    case "en":
      return { targetLanguage: "English" };
    case "lo":
      return { targetLanguage: "Lao" };
    default:
      return { targetLanguage: "Korean" };
  }
}
