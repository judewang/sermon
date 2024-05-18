import { allowedLanguages } from "@/lib/language-settings";
import { Suspense } from "react";
import { z } from "zod";
import { Article } from "./article";
import { LanguageSwitch } from "./language-switch";
import { Skeleton } from "./ui/skeleton";

interface SermonScaffoldProps {
  markdownChunks: string[] | string;
  language: z.infer<typeof allowedLanguages>;
}

export function SermonScaffold({
  markdownChunks,
  language,
}: Readonly<SermonScaffoldProps>) {
  return (
    <main className="flex flex-col items-center justify-between gap-6 px-6 py-10 md:gap-8">
      <div className="self-start">
        <Suspense fallback={<Skeleton className="h-10 w-40" />}>
          <LanguageSwitch />
        </Suspense>
      </div>
      {(Array.isArray(markdownChunks) ? markdownChunks : [markdownChunks]).map(
        (chunk) => (
          <Article key={chunk} language={language} raw={chunk} />
        ),
      )}
    </main>
  );
}
