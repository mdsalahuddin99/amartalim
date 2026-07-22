"use client";

import { useMemo } from "react";
import { Link } from "@/lib/navigation";
import SharedNavbar from "@/components/shared/navbar";
import NewsletterCTA from "@/components/blog/NewsletterCTA";
import { Button } from "@/components/ui/button";

import {
  HeroMagazine,
  CategoryBar,
  LatestWithSidebar,
  CategoryBlocks,
  EditorsPick,
  EditorialFooter,
} from "@/components/marketing/home";

import type { ManagedBlogPost, ManagedBlogCategory } from "@/types/blog";

export interface HomeClientProps {
  posts: ManagedBlogPost[];
  categories?: ManagedBlogCategory[];
}

const Index = ({ posts, categories = [] }: HomeClientProps) => {
  const catCount = useMemo(() => {
    const c: Record<string, number> = {};
    posts.forEach((p) => { c[p.categoryId] = (c[p.categoryId] || 0) + 1; });
    return c;
  }, [posts]);
  if (!posts.length) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SharedNavbar />
        <div className="flex-1 pt-32 text-center px-4 pb-20">
          <h1 className="text-2xl font-bold">এখনও কোন পোস্ট প্রকাশিত হয়নি</h1>
          <p className="text-muted-foreground mt-2">শীঘ্রই নতুন আর্টিকেল আসছে।</p>
        </div>
        <EditorialFooter categories={categories} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedNavbar />
      <HeroMagazine posts={posts} />
      <CategoryBar activeCount={catCount} categories={categories} />
      <LatestWithSidebar posts={posts} />
      <CategoryBlocks posts={posts} />
      <EditorsPick posts={posts} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <NewsletterCTA />
      </div>
      <EditorialFooter categories={categories} />
    </div>
  );
};

export default Index;
