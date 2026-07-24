"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@/lib/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import SharedNavbar from "@/components/shared/navbar";
import SharedFooter from "@/components/shared/footer";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import ShareButtons from "@/components/blog/ShareButtons";
import NewsletterCTA from "@/components/blog/NewsletterCTA";
import { BlogDetailSkeleton } from "@/components/blog/BlogSkeletons";
import { Button } from "@/components/ui/button";
import { formatBlogDate } from "@/lib/seed/blog-data";
import { type ManagedBlogPost } from "@/types/blog";
import AuthorProfileCard from "@/components/blog/AuthorProfileCard";
import MoreFromAuthor from "@/components/blog/MoreFromAuthor";
import CommentThread from "@/components/blog/CommentThread";
import RelatedPosts from "@/components/blog/RelatedPosts";
import BookmarkButton from "@/components/blog/BookmarkButton";

import SmartImage from "@/components/shared/SmartImage";
import { sanitizeHtml } from "@/lib/sanitize";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^\u0980-\u09FF\u0600-\u06FFa-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

const BlogDetail = ({
  initialBlog,
  authorProfile,
  moreByAuthor,
  relatedPosts,
  sidebarRelated,
  relatedCategories,
  currentCategory,
}: {
  initialBlog: any;
  authorProfile?: any;
  moreByAuthor: ManagedBlogPost[];
  relatedPosts: ManagedBlogPost[];
  sidebarRelated: ManagedBlogPost[];
  relatedCategories: any[];
  currentCategory?: any;
}) => {
  const { slug } = useParams();
  const post = initialBlog;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(t);
  }, [slug]);

  const sections = useMemo(() => {
    if (!post) return [] as { id: string; text: string }[];
    const items: { id: string; text: string }[] = [];
    const isHtml = /^\s*<[a-zA-Z!]/.test(post.content);
    if (isHtml) {
      // Parse <h2> (and <h3>) from HTML content
      if (typeof document !== "undefined") {
        const tmp = document.createElement("div");
        tmp.innerHTML = post.content;
        tmp.querySelectorAll("h2").forEach((h) => {
          const text = (h.textContent || "").trim();
          if (text) items.push({ id: slugify(text) || `s-${items.length}`, text });
        });
      }
    } else {
      post.content.split("\n\n").map((b: string) => b.trim())
        .filter((b: string) => b.startsWith("## "))
        .forEach((b: string) => {
          const text = b.replace(/^##\s+/, "").trim();
          items.push({ id: slugify(text) || `s-${items.length}`, text });
        });
    }
    return items;
  }, [post]);

  // The related props are passed from server directly!
  const related = relatedPosts;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SharedNavbar showAuth />
        <BlogDetailSkeleton />
      </div>
    );
  }


  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <SharedNavbar showAuth />
        
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="font-serif-bn text-3xl font-bold mb-3">ব্লগ পাওয়া যায়নি</h1>
          <Link to="/blogs">
            <Button variant="outline" className="rounded-none">
              <ArrowLeft className="w-4 h-4 mr-2" /> সব আর্টিকেলে ফিরে যান
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const url = `${SITE_URL}/blogs/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: post.title, description: post.excerpt,
    image: [post.cover.startsWith("http") ? post.cover : `${SITE_URL}${post.cover}`],
    datePublished: post.date, dateModified: post.date,
    author: { "@type": "Person", name: post.author, description: post.authorBio },
    publisher: { "@type": "Organization", name: "Amar Talim", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags?.join(", "), inLanguage: "bn",
    articleSection: post.categoryName, wordCount: post.content.split(/\s+/).length,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "হোম", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ব্লগ", item: `${SITE_URL}/blogs` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
  const faqSchema = post.faq && post.faq.length > 0 ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;

  const blocks = post.content.split("\n\n");
  const renderBlock = (block: string, i: number, firstParaIdx: number) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      const text = trimmed.replace(/^##\s+/, "");
      const id = slugify(text) || `s-${i}`;
      return (
        <h2 id={id} key={i} className="font-serif-bn text-2xl sm:text-3xl font-black mt-10 mb-4 scroll-mt-24 leading-tight text-primary flex items-center gap-4">
          <span>{text}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--accent))] to-transparent" />
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return <h3 key={i} className="font-serif-bn text-lg sm:text-xl font-bold mt-6 mb-2">{trimmed.replace(/^###\s+/, "")}</h3>;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <ol key={i} className="list-decimal pl-6 space-y-1.5 my-4 marker:text-primary marker:font-bold marker:font-serif-bn">
          {trimmed.split("\n").map((line, j) => (
            <li key={j} className="leading-[1.85] text-[17px]">{line.replace(/^\d+\.\s/, "")}</li>
          ))}
        </ol>
      );
    }
    if (trimmed.split("\n").every((l) => l.trim().startsWith("* "))) {
      return (
        <ul key={i} className="list-disc pl-6 space-y-1.5 my-4 marker:text-primary">
          {trimmed.split("\n").map((line, j) => (
            <li key={j} className="leading-[1.85] text-[17px]">{line.replace(/^\*\s+/, "")}</li>
          ))}
        </ul>
      );
    }
    const html = sanitizeHtml(trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"));
    const isFirstPara = i === firstParaIdx;
    return (
      <p key={i}
        className={`leading-[1.8] text-[17px] sm:text-[18px] mb-4 text-foreground/90 ${isFirstPara ? "first-para" : ""}`}
        dangerouslySetInnerHTML={{ __html: html }} />
    );
  };

  // Find first paragraph for drop cap
  const firstParaIdx = blocks.findIndex((b) => {
    const t = b.trim();
    return t && !t.startsWith("#") && !/^\d+\.\s/.test(t) && !t.split("\n").every((l) => l.trim().startsWith("* "));
  });

  return (
    <div className="min-h-screen bg-background">
      
      <ReadingProgress />
      <SharedNavbar showAuth />

      <div className="pt-8 pb-6 border-b border-foreground/10 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link to="/blogs">
            <Button variant="outline" className="rounded-none mb-6 text-sm py-1.5 h-auto">
              <ArrowLeft className="w-4 h-4 mr-2" /> সব আর্টিকেলে ফিরে যান
            </Button>
          </Link>
          
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
              <span>/</span>
              <Link to="/blogs" className="hover:text-primary transition-colors">ব্লগ</Link>
              <span>/</span>
              <Link to={`/blogs?cat=${post.categoryId}`} className="text-primary font-medium hover:underline">{post.categoryName}</Link>
            </div>
          </div>
          
          <h1 className="font-serif-bn font-black text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-foreground leading-[1.1] mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8 max-w-[90%] font-medium">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-foreground/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">লিখেছেন:</span>
                <span className="font-serif-bn font-bold text-lg text-primary">{post.author}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><time dateTime={post.date}>{formatBlogDate(post.date)}</time></span>
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                <span className="text-sm font-medium text-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime} মিনিট পড়া</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-8 lg:gap-12">

          {/* Article */}
          <article className="max-w-none w-full">
            {post.cover && (
              <div className="mb-6 rounded-xl overflow-hidden aspect-[16/9] relative shadow-sm border border-foreground/5">
                <SmartImage src={post.cover} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-foreground/5">
              <ShareButtons url={url} title={post.title} />
              <BookmarkButton blogId={post.id} variant="outline" />
            </div>

            {/^\s*<[a-zA-Z!]/.test(post.content) ? (
              <div
                className="prose prose-lg max-w-none dark:prose-invert font-serif-bn prose-headings:font-serif-bn prose-headings:font-black prose-headings:text-primary prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:scroll-mt-24 prose-h2:pb-3 prose-h2:border-b prose-h2:border-[hsl(var(--accent)/0.35)] prose-h3:text-lg sm:prose-h3:text-xl prose-p:leading-[1.8] prose-p:text-[17px] sm:prose-p:text-[18px] prose-p:mb-4 prose-img:rounded-lg prose-a:text-primary prose-blockquote:border-l-4 prose-blockquote:border-[hsl(var(--accent))] prose-blockquote:bg-[hsl(var(--accent)/0.05)] prose-blockquote:py-2 prose-blockquote:not-italic prose-strong:text-primary"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    post.content.replace(
                      /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
                      (_m, attrs = "", inner) => {
                        const txt = String(inner).replace(/<[^>]*>/g, "").trim();
                        const id = slugify(txt);
                        return `<h2${attrs || ""} id="${id}">${inner}</h2>`;
                      }
                    )
                  ),
                }}
              />
            ) : (
              <div className="drop-cap">
                {blocks.map((b, i) => renderBlock(b, i, firstParaIdx))}
              </div>
            )}


            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-[hsl(var(--accent)/0.25)] flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-primary/60 mr-2">Tags</span>
                {post.tags.map((t) => (
                  <Link key={t} to={`/tags/${encodeURIComponent(t)}`} className="text-xs px-4 py-1.5 rounded-full bg-background border border-[hsl(var(--accent)/0.3)] text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Section A — Curated Author profile (rich) takes precedence */}
            {authorProfile ? (
              <div className="mt-8">
                <AuthorProfileCard author={authorProfile} />
              </div>
            ) : post.authorBio ? (
              <section className="mt-10 p-6 bg-card rounded-lg border-t-4 border-primary shadow-[0_20px_40px_-20px_hsl(var(--primary)/0.2)] flex gap-6 items-start">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif-bn font-black text-3xl shrink-0 ring-4 ring-[hsl(var(--accent)/0.3)] ring-offset-2 ring-offset-card">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.22em] text-[hsl(var(--accent))] mb-1.5">লেখক পরিচিতি</p>
                  <Link to={`/authors/${slugify(post.author)}`} className="font-serif-bn font-bold text-2xl text-primary hover:underline transition-colors">
                    {post.author}
                  </Link>
                  <p className="text-sm text-foreground/70 mt-2.5 leading-relaxed">{post.authorBio}</p>
                </div>
              </section>
            ) : null}

            {/* Section B — More from this author (only when profile exists) */}
            {authorProfile && (
              <MoreFromAuthor
                authorName={authorProfile.name}
                authorSlug={authorProfile.slug}
                posts={moreByAuthor}
              />
            )}

            <div className="mt-10 pt-6 border-t border-[hsl(var(--accent)/0.25)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-[0.22em] text-primary/60 mb-3">এই আর্টিকেল শেয়ার করুন</p>
                <ShareButtons url={url} title={post.title} />
              </div>
            </div>

            {post.faq && post.faq.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-serif-bn text-2xl sm:text-3xl font-black text-primary">প্রায়শই জিজ্ঞাসা</h2>
                  <span className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--accent))] to-transparent" />
                </div>
                <div className="space-y-3">
                  {post.faq.map((f, i) => (
                    <details key={i} className="group rounded-lg bg-card border border-[hsl(var(--accent)/0.25)] hover:border-[hsl(var(--accent)/0.6)] transition-colors overflow-hidden">
                      <summary className="flex justify-between items-center cursor-pointer font-serif-bn font-bold text-lg p-5 list-none">
                        <span className="text-foreground pr-4">{f.q}</span>
                        <span className="shrink-0 w-7 h-7 rounded-full bg-[hsl(var(--accent)/0.15)] text-primary flex items-center justify-center transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                      </summary>
                      <p className="px-5 pb-5 text-[15px] text-foreground/75 leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-16" id="inline-newsletter">
              <NewsletterCTA />
            </div>

            {/* Comments — nested thread with login gate */}
            <CommentThread blogId={post.id} />
          </article>

          {/* Right: Magazine-style sidebar — TOC + related-in-category + category card + newsletter */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-8 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1 -mr-1 [scrollbar-width:thin]">
              {post.showToc !== false && sections.length > 0 && (
                <TableOfContents items={sections} />
              )}

              {/* Related in same category */}
              {sidebarRelated.length > 0 && (
                <section className="bg-card border border-[hsl(var(--accent)/0.25)] rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[hsl(var(--accent)/0.25)]">
                    <h3 className="font-serif-bn font-bold text-sm text-primary uppercase tracking-wider">
                      এই বিভাগের আরো
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {sidebarRelated.map((p, idx) => (
                      <li key={p.id}>
                        <Link to={`/blogs/${p.slug}`} className="group flex gap-3 items-start">
                          <span className="font-serif-bn font-black text-2xl text-[hsl(var(--accent))] leading-none w-6 shrink-0 tabular-nums">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <h4 className="font-serif-bn font-bold text-[17px] leading-[1.35] group-hover:text-primary transition-colors text-foreground/90">
                            {p.title}
                          </h4>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {currentCategory && (
                <section className="bg-muted rounded-lg p-6">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                    বিভাগ
                  </p>
                  <h3 className="font-serif-bn font-bold text-xl mb-3">
                    {currentCategory.name}
                  </h3>
                  {currentCategory.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentCategory.description}
                    </p>
                  )}
                  <Link
                    to={`/blogs?cat=${currentCategory.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    সব আর্টিকেল <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </Link>
                </section>
              )}
            </div>
          </aside>
        </div>
      </div>
      
      <div className="border-t border-foreground/5 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {/* <CommentThread blogId={post.id} /> */}
        </div>
      </div>

      {relatedCategories && relatedCategories.length > 0 && (
        <section className="border-t border-foreground/5 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-serif-bn font-black text-3xl text-foreground">
                  সম্পর্কিত বিভাগসমূহ
                </h2>
              </div>
              <Link to="/blogs" className="text-sm font-medium text-primary hover:underline">
                সব বিভাগ →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedCategories.map((c) => (
                <Link
                  key={c.id}
                  to={`/blogs?cat=${c.id}`}
                  className="bg-muted/50 border border-foreground/5 rounded-lg p-5 transition-all hover:bg-muted"
                >
                  <h3 className="font-serif-bn font-bold text-lg text-foreground mb-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {c.count} আর্টিকেল
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <RelatedPosts posts={related} />
      <SharedFooter />
    </div>
  );
};

export default BlogDetail;
