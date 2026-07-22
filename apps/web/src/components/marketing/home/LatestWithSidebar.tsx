import { useMemo } from "react";
import { ChevronRight, Clock, Mail, Sparkles, Tag, TrendingUp } from "lucide-react";
import { Link } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SmartImage from "@/components/shared/SmartImage";
import { formatBlogDate } from "@/lib/seed/blog-data";
import type { ManagedBlogPost as Posts } from "@/types/blog";

export interface LatestWithSidebarProps {
  posts: Posts[];
}

/** Latest article grid + trending/newsletter/tags sidebar. */
export const LatestWithSidebar = ({ posts }: LatestWithSidebarProps) => {
  const latest = posts.slice(0, 6);
  const trending = useMemo(
    () => [...posts].sort((a, b) => b.readTime - a.readTime).slice(0, 5),
    [posts],
  );

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-6 border-b-2 border-primary pb-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> সর্বশেষ আর্টিকেল
              </h2>
              <Link to="/blogs" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                সব দেখুন <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {latest.map((p) => (
                <article key={p.id}>
                  <Link to={`/blogs/${p.slug}`} className="group block">
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
                      <SmartImage src={p.cover} alt={p.title} className="absolute inset-0 w-full h-full object-cover md:group-hover:scale-105 md:transition-transform md:duration-500" loading="lazy" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mb-2">
                      {p.categoryName}
                    </Badge>
                    <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                      <span>{p.author}</span>
                      <span>·</span>
                      <span>{formatBlogDate(p.date)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.readTime} মিনিট</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2 pb-3 border-b border-border">
                <TrendingUp className="h-5 w-5 text-primary" /> জনপ্রিয় পোস্ট
              </h3>
              <ol className="space-y-4">
                {trending.map((p, i) => (
                  <li key={p.id}>
                    <Link to={`/blogs/${p.slug}`} className="group flex gap-3 items-start">
                      <span className="text-3xl font-extrabold text-primary/30 leading-none w-8 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {p.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{p.categoryName}</span>
                          <span>·</span>
                          <span>{p.readTime} মিনিট</span>
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-accent/5 border-primary/20">
              <Mail className="h-7 w-7 text-primary mb-3" />
              <h3 className="text-lg font-extrabold mb-1">নিউজলেটার সাবস্ক্রাইব</h3>
              <p className="text-xs text-muted-foreground mb-4">নতুন আর্টিকেল সরাসরি ইনবক্সে পান।</p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                <Input type="email" placeholder="আপনার ইমেইল" required className="h-10" />
                <Button type="submit" className="w-full">সাবস্ক্রাইব করুন</Button>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2 pb-3 border-b border-border">
                <Tag className="h-5 w-5 text-primary" /> জনপ্রিয় ট্যাগ
              </h3>
              <div className="flex flex-wrap gap-2">
                {["আরবী", "কুরআন", "তাজভীদ", "AI", "ChatGPT", "ফ্রিল্যান্সিং", "মার্কেটিং", "ক্যারিয়ার", "ইসলামিক", "প্রযুক্তি"].map((t) => (
                  <Link key={t} to="/blogs" className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                    #{t}
                  </Link>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default LatestWithSidebar;
