import { ArticleLoading } from "@/components/article-loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-between gap-6 px-6 py-10 md:gap-8">
      <div className="self-start">
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="container prose prose-xl">
        <ArticleLoading />
      </div>
    </div>
  );
}
