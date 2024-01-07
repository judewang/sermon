import {
  SermonScaffold,
  SermonScaffoldLoading,
  generateSermonMetadata,
} from "@/components/sermon-scaffold";
import { allowedLanguages, defaultLanguage } from "@/lib/language-settings";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string[]>;
}): Promise<Metadata> {
  const language = allowedLanguages.safeParse(
    searchParams.lang ?? defaultLanguage,
  );

  return await generateSermonMetadata(
    language.success ? language.data : defaultLanguage,
  );
}

export default function HomePage({
  searchParams,
}: Readonly<{ searchParams: Record<string, string[]> }>) {
  const language = allowedLanguages.safeParse(
    searchParams.lang ?? defaultLanguage,
  );

  if (!language.success) notFound();

  return (
    <Suspense fallback={<SermonScaffoldLoading />}>
      <SermonScaffold language={language.data} />
    </Suspense>
  );
}
