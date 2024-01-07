import {
  SermonScaffold,
  SermonScaffoldLoading,
  generateSermonMetadata,
} from "@/components/sermon-scaffold";
import { allowedLanguages, foreignLanguages } from "@/lib/language-settings";
import { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 60;

export const generateStaticParams = () => {
  return foreignLanguages.map((language) => ({
    locale: language,
  }));
};

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Record<string, string | string[]>;
}): Promise<Metadata> {
  const language = allowedLanguages.parse(params.locale);

  return await generateSermonMetadata(language);
}

export default async function TranslatedPage({
  params,
}: Readonly<{
  params: Record<string, string | string[]>;
}>) {
  const language = allowedLanguages.parse(params.locale);

  return (
    <Suspense fallback={<SermonScaffoldLoading />}>
      <SermonScaffold language={language} />
    </Suspense>
  );
}
