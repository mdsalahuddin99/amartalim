import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "@/lib/navigation";
import SmartImage from "@/components/shared/SmartImage";
import { formatBlogDate } from "@/lib/seed/blog-data";
import type { ManagedBlogPost as Posts } from "@/types/blog";

export interface EditorsPickProps {
  posts: Posts[];
}

/** Featured 4-card grid; renders nothing when no featured posts exist. */
export const EditorsPick = ({ posts }: EditorsPickProps) => {
  const picks = posts.filter((p) => p.featured).slice(0, 4);
  if (!picks.length) return null;
  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6 border-b-2 border-primary pb-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> এডিটরের নির্বাচন
          </h2>
          <Link to="/blogs" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            সব দেখুন <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {picks.map((p) => (
            <div key={p.id}>
              <Link to={`/blogs/${p.slug}`} className="group block">
                <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                  <SmartImage src={p.cover} alt={p.title} className="absolute inset-0 w-full h-full object-cover md:group-hover:scale-105 md:transition-transform md:duration-500" loading="lazy" />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded">{p.categoryName}</div>
                </div>
                <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-3">
                  {p.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-2">{formatBlogDate(p.date)}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditorsPick;
