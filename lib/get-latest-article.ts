import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { z } from "zod";
import { allowedLanguages, defaultLanguage } from "./language-settings";
import { splitMarkdown } from "./split-markdown";
import { translateWithPapago } from "./translate-with-papago";

interface Return {
  markdown: string | null;
  lastSunday: string;
  title: string;
  description: string;
}

dayjs.extend(isoWeek);

export async function getLatestArticle(
  language: z.infer<typeof allowedLanguages>,
): Promise<Return> {
  const today = new Date();
  const lastSunday = dayjs().startOf("week").format("YYYY-MM-DD");
  const nextSunday = dayjs(today).isoWeekday(7).format("YYYY-MM-DD");
  const latest = await kv.exists(`sermon-${nextSunday}`);
  const sermonKey = latest ? `sermon-${nextSunday}` : `sermon-${lastSunday}`;

  const markdown = await kv.get<string>(
    language === defaultLanguage ? sermonKey : `${sermonKey}-${language}`,
  );

  if (markdown || language === defaultLanguage) {
    return generateArticleData(markdown, lastSunday);
  }

  const source = await kv.get<string>(sermonKey);

  if (!source) {
    return generateArticleData(null, lastSunday);
  }

  const chunks = splitMarkdown(source);
  const translatedMarkdown = await translateWithPapago(chunks, language);

  await kv.set(`${sermonKey}-${language}`, translatedMarkdown);

  return generateArticleData(translatedMarkdown, lastSunday);
}

function generateArticleData(markdown: string | null, lastSunday: string) {
  const paragraphs = markdown?.split(/\n{2,}/);

  return {
    markdown,
    lastSunday,
    title: paragraphs?.[0]?.replace(/#\s/, "") ?? "",
    description: paragraphs?.[1]?.replace(/##\s/, "") ?? "",
  };
}
