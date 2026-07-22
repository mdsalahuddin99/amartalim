"use client";

import { Link } from "@/lib/navigation";
import { Tag as TagIcon, Calendar } from "lucide-react";
import PageShell from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBlogDate } from "@/lib/seed/blog-data";
import type { ManagedBlogPost } from "@/types/blog";

const TagArchivePage = ({ tag, posts }: { tag: string; posts: ManagedBlogPost[] }) => {
  return (
    <PageShell>
      <header className="pb-6 border-b mb-8">
        <Badge variant="secondary" className="mb-3">
          <TagIcon className="h-3 w-3 mr-1" /> ট্যাগ
        </Badge>
        <h1 className="text-3xl font-bold">#{tag}</h1>
        <p className="text-muted-foreground mt-2">
          {posts.length}টি লেখা পাওয়া গেছে।
        </p>
      </header>

      {posts.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          এই ট্যাগে কোনো লেখা পাওয়া যায়নি।
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <Link to={`/blogs/${p.slug}`}>
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
                  <h2 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                    {p.title}
                  </h2>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">
                  {p.excerpt}
                </p>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-3">
                  <Calendar className="h-3 w-3" />
                  {formatBlogDate(p.date)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default TagArchivePage;
