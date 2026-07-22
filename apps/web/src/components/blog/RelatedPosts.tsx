import { Link } from "@/lib/navigation";
import { ArrowRight } from "lucide-react";
import { formatBlogDate } from "@/lib/seed/blog-data";
import type { BlogPost } from "@/lib/seed/blog-data";

interface Props {
  posts: BlogPost[];
  heading?: string;
  viewAllHref?: string;
}

const RelatedPosts = ({ posts, heading = "পড়তে পারেন", viewAllHref = "/blogs" }: Props) => {
  if (posts.length === 0) return null;
  return (
    <section className="border-t border-foreground/15 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-foreground">
          <h2 className="font-serif-bn font-black text-2xl sm:text-3xl">{heading}</h2>
          <Link
            to={viewAllHref}
            className="text-xs uppercase tracking-wider font-semibold hover:text-primary flex items-center gap-1"
          >
            সব আর্টিকেল <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((p) => (
            <Link key={p.id} to={`/blogs/${p.slug}`} className="group block">
              <div className="aspect-[16/10] overflow-hidden bg-muted mb-4">
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <p className="eyebrow mb-2">{p.categoryName}</p>
              <h3 className="font-serif-bn font-bold text-xl leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {p.title}
              </h3>
              <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                {formatBlogDate(p.date)} · {p.readTime} মিনিট
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedPosts;
