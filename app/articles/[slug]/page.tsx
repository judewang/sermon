import { Article } from "@/components/article";
import { MarkdownContent } from "@/components/markdown-content";
import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: Readonly<{
  params: { slug: string };
}>) {
  const markdownChunks = await kv.get<string[]>(params.slug);

  if (!markdownChunks) notFound();

  return (
    <main className="flex flex-col items-center justify-between gap-6 px-6 py-10 md:gap-8">
      <Article>
        {markdownChunks.map((chunk) => (
          <MarkdownContent key={chunk}>{chunk}</MarkdownContent>
        ))}
      </Article>
    </main>
  );
}
