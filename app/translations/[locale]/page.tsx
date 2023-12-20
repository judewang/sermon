import { Article } from "@/components/article";
import { kv } from "@vercel/kv";
import { notFound } from "next/navigation";

// TODO:
// 1. generateStaticParams
// 2. dynamicParams false
// 3. revalidate 1 day

export default async function TranslatedPage({
  params,
}: Readonly<{
  params: { slug: string };
}>) {
  // TODO:
  // 1. Get translated markdown from KV
  // 2. If not found, get the original markdown from KV
  // 3. Split the markdown into chunks and send to PAPAGO API with Promise.all
  // 4. Join the translated chunks and save to KV with the slug suffixed with the language code
  // 5. Use the translated markdown to render the article

  // NOTE:
  // KV 相關用法 https://vercel.com/docs/storage/vercel-kv/redis-compatibility#generic

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
