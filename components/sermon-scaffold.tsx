import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Article } from "./article";
import { LanguageSwitch } from "./language-switch";
import { Skeleton } from "./ui/skeleton";

interface SermonScaffoldProps {
  markdown: string | null;
}

export function SermonScaffold({ markdown }: Readonly<SermonScaffoldProps>) {
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
        <div>Nothing to share this week</div>
      )}
    </main>
  );
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
