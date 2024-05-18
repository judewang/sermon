import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ArticleLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      {Array(15)
        .fill(undefined)
        .map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-6", (index + 1) % 5 ? "w-full" : "mb-6 w-2/3")}
          />
        ))}
    </div>
  );
}
