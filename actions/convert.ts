"use server";

import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { convertToHtml } from "mammoth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NodeHtmlMarkdown } from "node-html-markdown";

dayjs.extend(isoWeek);

export async function convertDocxToHtml(_prev: unknown, formData: FormData) {
  const file: File | null = formData.get("file") as unknown as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 使用 mammoth 將 .docx 檔案轉換為 HTML
  const result = await convertToHtml({ buffer });
  const html = result.value;

  const markdown = NodeHtmlMarkdown.translate(html);

  const today = new Date();

  // 使用 Day.js 計算最接近的下一個星期日的日期
  const nextSunday = dayjs(today).isoWeekday(7);
  const key = `sermon-${nextSunday.format("YYYY-MM-DD")}`;

  await kv.set("latest", key);
  await kv.set(key, markdown);

  revalidatePath("/");
  revalidatePath(`/articles/${key}`);
  redirect(`/articles/${key}`);
}
