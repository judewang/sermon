import { getLatestArticle } from "@/lib/get-latest-article";
import { allowedLanguages } from "@/lib/language-settings";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { z } from "zod";
import { Article } from "./article";
import { LanguageSwitch } from "./language-switch";
import { Skeleton } from "./ui/skeleton";

interface SermonScaffoldProps {
  language: z.infer<typeof allowedLanguages>;
}

export async function SermonScaffold({
  language,
}: Readonly<SermonScaffoldProps>) {
  const { markdown, lastSunday } = await getLatestArticle(language);

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

export async function generateSermonMetadata(
  language: SermonScaffoldProps["language"],
) {
  const { title, description } = await getLatestArticle(language);

  return {
    title,
    description,
  };
}

export function SermonScaffoldLoading() {
  return (
    <div className="flex flex-col items-center justify-between gap-6 px-6 py-10 md:gap-8">
      <div className="self-start">
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="prose prose-xl flex w-full flex-col gap-6">
        {Array(15)
          .fill(undefined)
          .map((_, index) => (
            <Skeleton
              key={index}
              className={cn("h-6", (index + 1) % 5 ? "w-full" : "mb-6 w-2/3")}
            />
          ))}
      </div>
    </div>
  );
}
