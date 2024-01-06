import {
  SermonScaffold,
  generateSermonMetadata,
} from "@/components/sermon-scaffold";
import { defaultLanguage } from "@/lib/language-settings";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await generateSermonMetadata(defaultLanguage);
}

export default function HomePage() {
  return <SermonScaffold language={defaultLanguage} />;
}
