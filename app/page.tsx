import { Article } from "@/components/article";
import { Suspense } from "react";

import { LanguageSwitch } from "@/components/langauge-switch";
import { Skeleton } from "@/components/ui/skeleton";
import { getLatestArticle } from "@/lib/get-latest-article";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getLatestArticle();

  return {
    title,
    description,
  };
}

export default async function HomePage() {
  const { markdown, lastSunday } = await getLatestArticle();

  return (
    <main className="flex flex-col items-center justify-between gap-6 px-6 py-10 md:gap-8">
      <div className="self-start">
        <Suspense fallback={<Skeleton className="h-10 w-40" />}>
          <LanguageSwitch />
        </Suspense>
      </div>
      {markdown ? (
        <Article>{markdown}</Article>
      ) : (
        <div>Nothing to share this week {lastSunday}</div>
      )}
    </main>
  );
}
