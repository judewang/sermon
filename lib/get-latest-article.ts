import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { env } from "./env";

interface Return {
  markdownChunks: string[] | null;
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

  const markdownChunks = await kv.get<string[]>(
    env.NODE_ENV === "development" ? "test" : sermonKey,
  );

  return generateArticleData(markdownChunks, lastSunday);
}

function generateArticleData(
  markdownChunks: string[] | null,
  lastSunday: string,
) {
  const paragraphs = markdownChunks?.[0]?.split(/\n{2,}/);

  return {
    markdownChunks,
    lastSunday,
    title: paragraphs?.[0]?.replace(/#\s/, "") ?? "",
    description: paragraphs?.[1]?.replace(/##\s/, "") ?? "",
  };
}
