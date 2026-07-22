"use client";

import { Link } from "@/lib/navigation";
import { Calendar, Clock } from "lucide-react";
import PageShell from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatBlogDate } from "@/lib/seed/blog-data";
import type { AuthorPublic, ManagedBlogPost } from "@/types/blog";

interface PageClientProps {
  author: AuthorPublic;
  posts: ManagedBlogPost[];
}

const AuthorProfilePage = ({ author, posts }: PageClientProps) => {
  const initials = author.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("");

  return (
    <PageShell>
      

      <header className="flex flex-col sm:flex-row gap-6 sm:items-center pb-8 border-b">
        <Avatar className="h-24 w-24">
          {author.avatar ? <AvatarImage src={author.avatar} alt={author.name} /> : null}
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{author.name}</h1>
          {author.bio && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{author.bio}</p>
          )}
          <p className="text-sm text-muted-foreground mt-3">
            মোট প্রকাশিত: <span className="font-semibold">{author.totalPosts}টি লেখা</span>
          </p>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">প্রকাশিত লেখাসমূহ</h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">কোনো লেখা পাওয়া যায়নি।</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((p) => (
              <Card key={p.id} className="overflow-hidden flex flex-col">
                <Link to={`/blogs/${p.slug}`} className="block">
                  <img
                    src={p.cover}
                    alt={p.title}
                    loading="lazy"
                    className="aspect-video object-cover w-full"
                  />
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
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">
                    {p.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatBlogDate(p.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {p.readTime} মিনিট
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default AuthorProfilePage;
