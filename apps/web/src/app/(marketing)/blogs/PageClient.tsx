"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/navigation";
import { Calendar, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import SharedNavbar from "@/components/shared/navbar";
import NewsletterCTA from "@/components/blog/NewsletterCTA";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatBlogDate } from "@/lib/seed/blog-data";
import { type ManagedBlogPost, type ManagedBlogCategory } from "@/types/blog";
import { AdSlot } from "@/components/ads/AdSlot";
import { BlogListSkeleton } from "@/components/blog/BlogSkeletons";
import { cn } from "@/lib/utils";

import SmartImage from "@/components/shared/SmartImage";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const PAGE_SIZE = 8;

type SortKey = "newest" | "oldest" | "shortest" | "longest";

const Blogs = ({
  initialBlogs,
  initialCategories,
}: {
  initialBlogs: ManagedBlogPost[];
  initialCategories: ManagedBlogCategory[];
}) => {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat") || "all";
  const [activeCat, setActiveCat] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const blogPosts = initialBlogs;
  const managedCategories = initialCategories;
  const blogCategories = useMemo(
    () => [{ id: "all", name: "সব" } as { id: string; name: string; parentId?: string | null }, ...managedCategories],
    [managedCategories],
  );
  const descendantIds = useMemo(() => {
    if (activeCat === "all") return null;
    const ids = new Set<string>([activeCat]);
    let added = true;
    while (added) {
      added = false;
      for (const c of managedCategories) {
        if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
          ids.add(c.id); added = true;
        }
      }
    }
    return ids;
  }, [activeCat, managedCategories]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const c = params.get("cat") || "all";
    setActiveCat(c);
    setPage(1);
  }, [params]);

  const filtered = useMemo(() => {
    let list = blogPosts.filter((p) => {
      const matchCat = !descendantIds || descendantIds.has(p.categoryId);
      const matchSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
    list = [...list].sort((a, b) => {
      if (sort === "newest") return +new Date(b.date) - +new Date(a.date);
      if (sort === "oldest") return +new Date(a.date) - +new Date(b.date);
      if (sort === "shortest") return a.readTime - b.readTime;
      return b.readTime - a.readTime;
    });
    // Featured posts float to the top (preserves chosen sort order within groups)
    const featured = list.filter((p) => p.featured);
    const rest = list.filter((p) => !p.featured);
    return [...featured, ...rest];
  }, [descendantIds, search, sort, blogPosts]);

  const lead = filtered[0];
  const sub = filtered.slice(1, 4);
  const rest = filtered.slice(4);

  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = rest.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCatChange = (id: string) => {
    if (id === "all") setParams({});
    else setParams({ cat: id });
  };

  const activeCatName = blogCategories.find((c) => c.id === activeCat)?.name || "সব";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Amar Talim ব্লগ",
    itemListElement: blogPosts.slice(0, 20).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/blogs/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      
      <SharedNavbar showAuth />

      {/* Masthead title */}
      <section className="border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-14 text-center">
          <p className="eyebrow mb-2 sm:mb-3 text-[10px] sm:text-xs">আর্কাইভ</p>
          <h1 className="font-serif-bn font-black text-3xl sm:text-6xl tracking-tight leading-[1.05] break-words">
            {activeCat === "all" ? "সব আর্টিকেল" : activeCatName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 max-w-xl mx-auto px-2 leading-relaxed">
            শেখা, ক্যারিয়ার, AI ও ইসলামিক বিষয় নিয়ে আমাদের লেখকদের গভীর গবেষণাভিত্তিক আর্টিকেল।
          </p>

          {/* Article count */}
          <div className="rule-thin mt-5 sm:mt-8 pt-3 sm:pt-4">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {filtered.length} আর্টিকেল
            </p>


          </div>
        </div>
      </section>

      <AdSlot slot="blog-archive-top" className="max-w-5xl mx-auto px-4 sm:px-6 mt-6" />

      {/* Toolbar */}
      <section className="border-b border-foreground/10 bg-background md:sticky md:top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="আর্টিকেল খুঁজুন..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9 rounded-none border-foreground/30"
            />
          </div>
          <div className="ml-auto">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-[160px] rounded-none border-foreground/30 text-xs uppercase tracking-wider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">নতুন থেকে পুরাতন</SelectItem>
                <SelectItem value="oldest">পুরাতন থেকে নতুন</SelectItem>
                <SelectItem value="shortest">ছোট পড়া আগে</SelectItem>
                <SelectItem value="longest">বড় পড়া আগে</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {loading ? (
        <BlogListSkeleton />
      ) : filtered.length === 0 ? (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <p className="font-serif-bn text-2xl">কোনো আর্টিকেল পাওয়া যায়নি।</p>
          <p className="text-sm text-muted-foreground mt-2">অন্য বিভাগ বা কীওয়ার্ড চেষ্টা করুন।</p>
        </div>
      ) : (
        <>
          {/* Top stories — ncmaz-style: large lead + 3 horizontal sub */}
          <section className="border-b border-foreground/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {lead && (
                  <article>
                    <Link to={`/blogs/${lead.slug}`} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:rounded-3xl mb-6 bg-muted">
                        <SmartImage src={lead.cover} alt={lead.title} loading="eager"
                          className="absolute inset-0 w-full h-full object-cover md:group-hover:scale-[1.03] md:transition-transform md:duration-700" />
                      </div>
                      <h2 className="font-serif-bn font-black text-2xl sm:text-3xl md:text-4xl leading-[1.15] tracking-tight group-hover:text-primary transition-colors">
                        {lead.title}
                      </h2>
                      <p className="mt-4 text-base text-muted-foreground leading-relaxed line-clamp-3">
                        {lead.excerpt}
                      </p>
                      <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="h-8 w-8 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                          {lead.author.slice(0, 1)}
                        </div>
                        <span className="font-semibold text-foreground">{lead.author}</span>
                        <span>·</span>
                        <span>{formatBlogDate(lead.date)}</span>
                      </div>
                    </Link>
                  </article>
                )}

                <div className="flex flex-col gap-6">
                  {sub.map((p) => (
                    <article key={p.id}>
                      <Link to={`/blogs/${p.slug}`} className="group grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_160px] gap-4 sm:gap-6 items-start">
                        <div className="min-w-0">
                          <h3 className="font-serif-bn font-bold text-lg sm:text-xl leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {p.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {p.excerpt}
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-6 w-6 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                              {p.author.slice(0, 1)}
                            </div>
                            <span className="font-semibold text-foreground">{p.author}</span>
                            <span>·</span>
                            <span>{formatBlogDate(p.date)}</span>
                          </div>
                        </div>
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                          <SmartImage src={p.cover} alt={p.title} loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover md:group-hover:scale-[1.05] md:transition-transform md:duration-500" />
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* Archive list */}
          {rest.length > 0 && (
            <section className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-end justify-between mb-8 pb-3 border-b-2 border-foreground">
                  <h2 className="font-serif-bn font-black text-2xl sm:text-3xl">আরও আর্টিকেল</h2>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {rest.length} টি
                  </span>
                </div>

                <div className="divide-y divide-foreground/10">
                  {paginated.map((p) => (
                    <article key={p.id} className="py-6 sm:py-8">
                      <Link to={`/blogs/${p.slug}`} className="group grid grid-cols-[100px_1fr] sm:grid-cols-[220px_1fr] gap-4 sm:gap-8 items-start">
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted rounded-xl sm:rounded-2xl">
                          <SmartImage src={p.cover} alt={p.title} loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover md:group-hover:scale-[1.03] md:transition-transform md:duration-500" />
                        </div>
                        <div>
                          <p className="eyebrow mb-1.5">{p.categoryName}</p>
                          <h3 className="font-serif-bn font-bold text-lg sm:text-2xl leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {p.title}
                          </h3>
                          <p className="hidden sm:block mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                          <p className="mt-2 sm:mt-3 text-[11px] uppercase tracking-wider text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>{p.author}</span><span>·</span>
                            <span>{formatBlogDate(p.date)}</span><span>·</span>
                            <span>{p.readTime} মিনিট</span>
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-between pt-6 border-t border-foreground/10">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      পৃষ্ঠা {currentPage} / {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-foreground/30"
                        disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Button key={i}
                          variant={currentPage === i + 1 ? "default" : "outline"} size="sm"
                          className="h-9 w-9 p-0 rounded-none border-foreground/30"
                          onClick={() => setPage(i + 1)}>{i + 1}</Button>
                      ))}
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-foreground/30"
                        disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* Newsletter */}
      <section className="border-t border-foreground/10 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <NewsletterCTA />
        </div>
      </section>
    </div>
  );
};

export default Blogs;
