"use client";

import { useMemo } from "react";
import { Link } from "@/lib/navigation";
import { BookmarkX, BookOpen } from "lucide-react";
import SharedNavbar from "@/components/shared/navbar";
import { type ManagedBlogPost } from "@/types/blog";
import { useReadingListStore } from "@/lib/stores/reading-list-store";
import { useUserBookmarks, bookmarkStore } from "@/lib/stores/bookmarks-store";
import { formatBlogDate } from "@/lib/seed/blog-data";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useSession } from "@/server/auth/session";

const ReadingListPage = ({ initialBlogs }: { initialBlogs: ManagedBlogPost[] }) => {
  const { user, isAuthenticated } = useSession();
  const bookmarks = useUserBookmarks(user?.id);
  const posts = initialBlogs;

  const items = useMemo(() => {
    const byId = new Map(posts.map((p) => [p.id, p]));
    return bookmarks
      .map((b) => ({ bookmark: b, post: byId.get(b.blogId) }))
      .filter((x): x is { bookmark: typeof x.bookmark; post: NonNullable<typeof x.post> } => !!x.post);
  }, [bookmarks, posts]);

  return (
    <div className="min-h-screen bg-background">
      
      <SharedNavbar showAuth />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-10 pb-4 border-b-2 border-foreground">
          <p className="eyebrow mb-2">আপনার সংগ্রহ</p>
          <h1 className="font-serif-bn font-black text-3xl sm:text-5xl flex items-center gap-3">
            <BookOpen className="w-8 h-8" /> রিডিং লিস্ট
          </h1>
          <p className="mt-3 text-muted-foreground">
            যেসব আর্টিকেল আপনি পরে পড়ার জন্য সংরক্ষণ করেছেন।
          </p>
        </header>

        {!isAuthenticated ? (
          <div className="text-center py-16 border border-dashed border-foreground/20">
            <p className="font-serif-bn text-lg mb-4">
              আপনার রিডিং লিস্ট দেখতে দয়া করে লগইন করুন।
            </p>
            <Link to="/login?from=/reading-list">
              <Button className="rounded-none">লগইন</Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-foreground/20">
            <BookmarkX className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-serif-bn text-lg mb-4">এখনো কোনো আর্টিকেল সংরক্ষণ করা হয়নি।</p>
            <Link to="/blogs">
              <Button variant="outline" className="rounded-none">
                ব্লগ দেখুন
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-foreground/10">
            {items.map(({ post, bookmark }) => (
              <li key={post.id} className="py-6 flex gap-5 items-start">
                <Link to={`/blogs/${post.slug}`} className="shrink-0 w-32 sm:w-44 aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={post.cover}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow mb-1">{post.categoryName}</p>
                  <Link to={`/blogs/${post.slug}`}>
                    <h2 className="font-serif-bn font-bold text-xl sm:text-2xl hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground uppercase tracking-wider">
                    <span>{formatBlogDate(post.date)}</span>
                    <span>· {post.readTime} মিনিট</span>
                    <span>· সংরক্ষিত {formatBlogDate(bookmark.createdAt)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    bookmarkStore.toggle(user!.id, post.id);
                    toast({ title: "সরানো হয়েছে" });
                  }}
                  aria-label="সরান"
                >
                  <BookmarkX className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default ReadingListPage;
