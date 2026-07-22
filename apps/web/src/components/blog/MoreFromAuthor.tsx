import { Link } from "@/lib/navigation";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBlogDate, type BlogPost } from "@/lib/seed/blog-data";

import SmartImage from "@/components/shared/SmartImage";
interface Props {
  authorName: string;
  authorSlug: string;
  posts: BlogPost[]; // already filtered & limited (max 3) by parent
}

/**
 * Section B from spec: "[লেখকের নাম]-এর আরও লেখা".
 * Hidden by parent when posts.length === 0.
 */
const MoreFromAuthor = ({ authorName, authorSlug, posts }: Props) => {
  if (posts.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-foreground">
        <h2 className="font-serif-bn font-black text-2xl">
          {authorName}-এর আরও লেখা
        </h2>
        <Link to={`/author/${authorSlug}`}
          className="text-xs uppercase tracking-wider font-semibold hover:text-primary inline-flex items-center gap-1">
          আরও দেখুন <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Card key={p.id} className="overflow-hidden flex flex-col">
            <Link to={`/blogs/${p.slug}`}>
              <SmartImage src={p.cover} alt={p.title} loading="lazy"
                className="aspect-video object-cover w-full" />
            </Link>
            <div className="p-4 flex-1 flex flex-col">
              <Badge variant="secondary" className="self-start mb-2">
                {p.categoryName}
              </Badge>
              <Link to={`/blogs/${p.slug}`}>
                <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                  {p.title}
                </h3>
              </Link>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatBlogDate(p.date)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.readTime} মিনিট</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default MoreFromAuthor;
