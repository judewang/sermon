import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";

export default async function ArticlePage({
  params,
}: Readonly<{
  params: { slug: string };
}>) {
  const html = await kv.get<string>(params.slug);

  if (!html) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <article dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
