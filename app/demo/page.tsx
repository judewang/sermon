import { convertToHtml } from "mammoth";
import fs from "fs";
import path from "path";

export default async function DemoPage() {
  const docxPath = path.resolve(process.cwd(), "public/talk-file.docx");
  const buffer = fs.readFileSync(docxPath);
  const result = await convertToHtml({ buffer: buffer });
  const html = result.value;
  const messages = result.messages;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {messages.map(({ message }) => (
          <p key={message}>{message}</p>
        ))}
        <article dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
