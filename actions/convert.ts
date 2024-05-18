"use server";

import { env } from "@/lib/env";
import { splitMarkdown } from "@/lib/split-markdown";
import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { convertToHtml } from "mammoth";
import { redirect } from "next/navigation";
import { NodeHtmlMarkdown } from "node-html-markdown";

dayjs.extend(isoWeek);

let index = 0;

function unwrapStrong(child: any) {
  return { ...child, isBold: false };
}

function transformElement(element: any) {
  if (element.children) {
    const children = element.children.map(transformElement);
    element = { ...element, children: children };
  }

  if (element.type === "paragraph") {
    element = transformParagraph(element, index === 0);
  }

  return element;
}

function transformParagraph(element: any, isTitle?: boolean) {
  index++;
  if (element.alignment === "center" && !element.styleId) {
    return {
      ...element,
      styleId: isTitle ? "Heading1" : "Heading2",
      children: element.children.map(unwrapStrong),
    };
  } else if (
    [
      element.children.length === 1 && element.children[0].isBold,
      element.children.length > 0 &&
        element.children.filter(({ isBold }: { isBold: boolean }) => isBold)
          .length === element.children.length,
    ].some(Boolean)
  ) {
    return {
      ...element,
      styleId: "Heading3",
      children: element.children.map(unwrapStrong),
    };
  } else {
    return element;
  }
}

export async function convertDocxToHtml(_prev: unknown, formData: FormData) {
  const file: File | null = formData.get("file") as unknown as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 使用 mammoth 將 .docx 檔案轉換為 HTML
  const result = await convertToHtml(
    { buffer },
    {
      transformDocument: transformElement,
    },
  );
  const html = result.value;

  const markdown = NodeHtmlMarkdown.translate(html);
  const markdownChunks = splitMarkdown(markdown);

  const today = new Date();

  // 使用 Day.js 計算最接近的下一個星期日的日期
  const nextSunday = dayjs(today).isoWeekday(7);
  const key =
    env.NODE_ENV === "development"
      ? `test`
      : `sermon-${nextSunday.format("YYYY-MM-DD")}`;

  await kv.set<string[]>(key, markdownChunks);

  redirect(`/articles/${key}`);
}
