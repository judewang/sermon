import { z } from "zod";

export const defaultLanguage = "ko";

export const allowedLanguages = z.enum([
  defaultLanguage,
  "en",
  "zh-Hant",
  "vi",
  "ru",
]);

export const foreignLanguages = allowedLanguages.options.filter(
  (lang) => lang !== defaultLanguage,
);
