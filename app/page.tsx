import { SermonScaffold } from "@/components/sermon-scaffold";
import { getLatestArticle } from "@/lib/get-latest-article";
import { allowedLanguages, defaultLanguage } from "@/lib/language-settings";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getLatestArticle();

  return { title, description };
}

export default async function HomePage({
  searchParams,
}: Readonly<{ searchParams: Record<string, string[]> }>) {
  const language = allowedLanguages.safeParse(
    searchParams.lang ?? defaultLanguage,
  );

  if (!language.success) notFound();

  const { markdownChunks } = await getLatestArticle();

  if (!markdownChunks) return <div>Nothing to share this week</div>;

  return (
    <SermonScaffold markdownChunks={markdownChunks} language={language.data} />
  );
}
