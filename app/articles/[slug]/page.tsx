import { Article } from "@/components/article";
import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: Readonly<{
  params: { slug: string };
}>) {
  const markdown = await kv.get<string>(params.slug);

  if (!markdown) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 items-center justify-center font-mono text-sm lg:flex">
        <Article>{markdown}</Article>
      </div>
    </main>
  );
}
