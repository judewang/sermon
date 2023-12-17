"use server";

import { convertToHtml } from "mammoth";
import { kv } from "@vercel/kv";
import { redirect } from "next/navigation";

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
  const today = new Date();
  const key = `sermon-${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  await kv.set(key, html);

  redirect(`/articles/${key}`);
}
