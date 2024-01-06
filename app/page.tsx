import {
  SermonScaffold,
  generateSermonMetadata,
} from "@/components/sermon-scaffold";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return await generateSermonMetadata();
}

export default function HomePage() {
  return <SermonScaffold />;
}
