import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { z } from "zod";
import { allowedLanguages, defaultLanguage } from "./language-settings";
import { splitMarkdown } from "./split-markdown";
import { translateWithPapago } from "./translate-with-papago";

interface Return {
  markdownChunks: string[] | string | null;
  lastSunday: string;
  title: string;
  description: string;
}

dayjs.extend(isoWeek);

export async function getLatestArticle(): Promise<Return> {
  const today = new Date();
  const lastSunday = dayjs().startOf("week").format("YYYY-MM-DD");
  const nextSunday = dayjs(today).isoWeekday(7).format("YYYY-MM-DD");
  const latest = await kv.exists(`sermon-${nextSunday}`);
  const sermonKey = latest ? `sermon-${nextSunday}` : `sermon-${lastSunday}`;

  const markdownChunks = await kv.get<string[] | string>(sermonKey);

  return generateArticleData(markdownChunks, lastSunday);
}

function generateArticleData(markdownChunks: string[] | string | null, lastSunday: string) {
  const paragraphs = Array.isArray(markdownChunks) ? markdownChunks[0]?.split(/\n{2,}/) : markdownChunks?.split(/\n{2,}/);

  return {
    markdownChunks,
    lastSunday,
    title: paragraphs?.[0]?.replace(/#\s/, "") ?? "",
    description: paragraphs?.[1]?.replace(/##\s/, "") ?? "",
  };
}
