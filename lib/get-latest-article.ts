import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { z } from "zod";
import { allowedLanguages, defaultLanguage } from "./language-settings";

interface Return {
  markdown: string | null;
  lastSunday: string;
  title: string;
  description: string;
}

dayjs.extend(isoWeek);

export async function getLatestArticle(
  language?: z.infer<typeof allowedLanguages>,
): Promise<Return> {
  const lastSunday = dayjs().startOf("week").format("YYYY-MM-DD");
  const latest = await kv.get<string>("latest");
  const sermonKey = latest ?? `sermon-${lastSunday}`;
  const markdown = await kv.get<string>(
    language === defaultLanguage ? sermonKey : `${sermonKey}-${language}`,
  );
  const paragraphs = markdown?.split(/\n{2,}/);

  return {
    markdown,
    lastSunday,
    title: paragraphs?.[0]?.replace(/#\s/, "") ?? "",
    description: paragraphs?.[1]?.replace(/##\s/, "") ?? "",
  };
}
