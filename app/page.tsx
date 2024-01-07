import {
  SermonScaffold,
  SermonScaffoldLoading,
  generateSermonMetadata,
} from "@/components/sermon-scaffold";
import { defaultLanguage } from "@/lib/language-settings";
import { Metadata } from "next";
import { Suspense } from "react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await generateSermonMetadata(defaultLanguage);
}

export default function HomePage() {
  return (
    <Suspense fallback={<SermonScaffoldLoading />}>
      <SermonScaffold language={defaultLanguage} />
    </Suspense>
  );
}
