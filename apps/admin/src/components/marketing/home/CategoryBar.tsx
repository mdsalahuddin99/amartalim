import { Tag } from "lucide-react";
import { Link } from "@/lib/navigation";
import type { ManagedBlogCategory } from "@/types/blog";

export interface CategoryBarProps {
  activeCount: Record<string, number>;
  categories?: ManagedBlogCategory[];
}

/** Sticky horizontal category nav. Hidden by default (toggle via className). */
export const CategoryBar = ({ activeCount, categories = [] }: CategoryBarProps) => (
  <section className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-foreground/10 hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-2 hidden sm:flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" /> বিভাগ:
        </span>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={c.id === "all" ? "/blogs" : `/blogs?cat=${c.id}`}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1.5"
          >
            <span>{c.name}</span>
            {c.id !== "all" && activeCount[c.id] ? (
              <span className="text-[10px] opacity-60">({activeCount[c.id]})</span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryBar;

