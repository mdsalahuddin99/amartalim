import { useMemo } from "react";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { Link } from "@/lib/navigation";
import SmartImage from "@/components/shared/SmartImage";
import { blogCategories, formatBlogDate } from "@/lib/seed/blog-data";
import type { ManagedBlogPost as Posts } from "@/types/blog";

const categoryIcons: Record<string, string> = {
  arabic: "📖", quran: "🕋", ai: "🤖", career: "🎯", marketing: "📈", freelancing: "💼",
};

export interface CategoryBlocksProps {
  posts: Posts[];
}

/** Per-category section blocks (main + 2 list items each). */
export const CategoryBlocks = ({ posts }: CategoryBlocksProps) => {
  const byCat = useMemo(() => {
    const map: Record<string, Posts[]> = {};
    posts.forEach((p) => {
      map[p.categoryId] = map[p.categoryId] || [];
      map[p.categoryId].push(p);
    });
    return map;
  }, [posts]);

  const cats = blogCategories.filter((c) => c.id !== "all" && byCat[c.id]?.length);

  return (
    <section className="py-10 sm:py-14 bg-card/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {cats.map((cat) => {
          const items = byCat[cat.id].slice(0, 3);
          const main = items[0];
          const rest = items.slice(1);
          return (
            <div key={cat.id}>
              <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
                <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
                  <span className="text-2xl">{categoryIcons[cat.id]}</span> {cat.name}
                </h2>
                <Link to={`/blogs?cat=${cat.id}`} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  আরও <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {main && (
                  <Link to={`/blogs/${main.slug}`} className="group block">
                    <div className="aspect-[16/10] rounded-lg overflow-hidden mb-3">
                      <SmartImage src={main.cover} alt={main.title} className="w-full h-full object-cover md:group-hover:scale-105 md:transition-transform md:duration-500" loading="lazy" />
                    </div>
                    <h3 className="text-xl font-extrabold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {main.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{main.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatBlogDate(main.date)} · {main.readTime} মিনিট</p>
                  </Link>
                )}
                <div className="space-y-5">
                  {rest.map((p) => (
                    <Link key={p.id} to={`/blogs/${p.slug}`} className="group grid grid-cols-[110px_1fr] gap-4 items-start">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden">
                        <SmartImage src={p.cover} alt={p.title} className="w-full h-full object-cover md:group-hover:scale-105 md:transition-transform md:duration-500" loading="lazy" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {p.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />{formatBlogDate(p.date)}
                          <Clock className="h-3 w-3 ml-1" />{p.readTime} মিনিট
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBlocks;
