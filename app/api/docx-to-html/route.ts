import { NextRequest, NextResponse } from "next/server";
import { convertToHtml } from "mammoth";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 使用 mammoth 將 .docx 檔案轉換為 HTML
  const result = await convertToHtml({ buffer });
  const html = result.value;

  // 將轉換後的 HTML 作為響應返回
  return NextResponse.json({ html: html });
}
