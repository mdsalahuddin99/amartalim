"use client";

import { Calendar, Clock, Globe } from "lucide-react";
import { Facebook, Twitter } from "@/components/shared/BrandIcons";
import PageShell from "@/components/shared/page-shell";
import SharedNavbar from "@/components/shared/navbar";
import NotFound from "@/app/not-found";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatBlogDate } from "@/lib/seed/blog-data";
import type { ManagedBlogPost } from "@/types/blog";
import { Link } from "@/lib/navigation";

import SmartImage from "@/components/shared/SmartImage";
const PAGE_SIZE = 9;

export interface AuthorPageClientProps {
  author: any;
  posts: ManagedBlogPost[];
}

const AuthorPublicProfilePage = ({ author, posts }: AuthorPageClientProps) => {
  if (!author) return <NotFound />;

  const initials = author.name.split(/\s+/).map((p: string) => p[0]).slice(0, 2).join("");

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar showAuth />
      

      <PageShell>
        {/* Header */}
        <header className="flex flex-col md:flex-row gap-6 pb-10 border-b">
          <Avatar className="h-28 w-28 mx-auto md:mx-0">
            {author.avatar ? <AvatarImage src={author.avatar} alt={author.name} /> : null}
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{author.name}</h1>
            {author.shortBio && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{author.shortBio}</p>
            )}

            {author.expertise?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {author.expertise.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-4 justify-center md:justify-start text-sm">
              {author.facebook && (
                <a href={author.facebook} target="_blank" rel="noreferrer"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              )}
              {author.twitter && (
                <a href={author.twitter} target="_blank" rel="noreferrer"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                  <Twitter className="h-4 w-4" /> Twitter
                </a>
              )}
              {author.website && (
                <a href={author.website} target="_blank" rel="noreferrer"
                  className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> Website
                </a>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              মোট প্রকাশিত: <span className="font-semibold text-foreground">{posts.length}টি লেখা</span>
            </p>
          </div>
        </header>

        {/* Detailed bio */}
        {author.bio && (
          <section className="mt-10 max-w-3xl">
            <h2 className="text-xl font-semibold mb-3">পরিচয়</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {author.bio}
            </p>
          </section>
        )}

        {/* Posts */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-5">প্রকাশিত লেখাসমূহ</h2>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">এখনো কোনো লেখা প্রকাশিত হয়নি।</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, PAGE_SIZE).map((p) => (
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
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">
                      {p.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatBlogDate(p.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.readTime} মিনিট</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {posts.length > PAGE_SIZE && (
            <p className="text-xs text-muted-foreground mt-6 text-center">
              {/* TODO[next]: server-side pagination */}
              আরও লেখা শীঘ্রই যোগ হবে।
            </p>
          )}
        </section>
      </PageShell>
    </div>
  );
};

export default AuthorPublicProfilePage;
