import { SermonScaffold } from "@/components/sermon-scaffold";
import { getLatestArticle } from "@/lib/get-latest-article";
import { allowedLanguages, defaultLanguage } from "@/lib/language-settings";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string[]>;
}): Promise<Metadata> {
  const language = allowedLanguages.safeParse(
    searchParams.lang ?? defaultLanguage,
  );

  const { title, description } = await getLatestArticle(
    language.success ? language.data : defaultLanguage,
  );

  return { title, description };
}

export default async function HomePage({
  searchParams,
}: Readonly<{ searchParams: Record<string, string[]> }>) {
  const language = allowedLanguages.safeParse(
    searchParams.lang ?? defaultLanguage,
  );

  if (!language.success) notFound();

  const { markdown } = await getLatestArticle(language.data);

  return <SermonScaffold markdown={markdown} />;
}
