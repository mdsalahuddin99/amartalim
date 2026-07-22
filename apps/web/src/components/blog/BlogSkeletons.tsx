import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const BlogListSkeleton = () => (
  <>
    {/* Top stories — lead + 2 sub */}
    <section className="border-b border-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-14">
          {/* Lead */}
          <div className="lg:border-r lg:border-foreground/10 lg:pr-14">
            <Skeleton className="aspect-[16/10] w-full mb-5 rounded-none" />
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-9 sm:h-12 w-full mb-3" />
            <Skeleton className="h-9 sm:h-12 w-4/5 mb-5" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-5" />
            <Skeleton className="h-3 w-48" />
          </div>
          {/* Sub */}
          <div className="space-y-8">
            {[0, 1].map((i) => (
              <div key={i} className={cn(i > 0 && "pt-8 border-t border-foreground/10")}>
                <Skeleton className="aspect-[16/10] w-full mb-3 rounded-none" />
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Archive list */}
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-foreground/30">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="divide-y divide-foreground/10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="py-6 sm:py-8 grid grid-cols-[100px_1fr] sm:grid-cols-[220px_1fr] gap-4 sm:gap-8 items-start">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-5 sm:h-7 w-full mb-2" />
                <Skeleton className="h-5 sm:h-7 w-2/3 mb-3" />
                <Skeleton className="hidden sm:block h-4 w-full mb-1" />
                <Skeleton className="hidden sm:block h-4 w-5/6 mb-3" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export const BlogDetailSkeleton = () => (
  <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
    <Skeleton className="h-3 w-24 mb-4" />
    <Skeleton className="h-10 sm:h-14 w-full mb-3" />
    <Skeleton className="h-10 sm:h-14 w-3/4 mb-6" />
    <div className="flex items-center gap-3 mb-8">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
    <Skeleton className="aspect-[16/9] w-full mb-8 rounded-none" />
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i % 4 === 3 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  </article>
);
