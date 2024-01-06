import { z } from "zod";

export const defaultLanguage = "ko";

const languages = [defaultLanguage, "en", "zh-tw"] as const;

export const allowedLanguages = z.enum(languages);
