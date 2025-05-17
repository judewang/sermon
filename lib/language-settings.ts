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
