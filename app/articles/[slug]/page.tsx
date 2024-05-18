import { Article } from "@/components/article";
import { defaultLanguage } from "@/lib/language-settings";
import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: Readonly<{
  params: { slug: string };
}>) {
  const markdownChunks = await kv.get<string[] | string>(params.slug);

  if (!markdownChunks) notFound();

  return (
    <main className="flex flex-col items-center justify-between gap-6 px-6 py-10 md:gap-8">
      {(Array.isArray(markdownChunks) ? markdownChunks : [markdownChunks]).map(
        (chunk) => (
          <Article key={chunk} language={defaultLanguage} raw={chunk} />
        ),
      )}
    </main>
  );
}
