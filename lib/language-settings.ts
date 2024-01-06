import { z } from "zod";

export const defaultLanguage = "ko";

export const allowedLanguages = z.enum([defaultLanguage, "en", "zh-TW"]);

export const foreignLanguages = allowedLanguages.options.filter(
  (lang) => lang !== defaultLanguage,
);
