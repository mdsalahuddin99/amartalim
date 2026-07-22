"use client";
import { useEffect, useState } from "react";
import type { BlogPost } from "@/lib/seed/blog-data";
import { createBlog, updateBlog, deleteBlog, getAllBlogsAction } from "@/server/actions/blog.actions";

export type BlogStatus = "draft" | "scheduled" | "published";

export interface ManagedBlogPost extends BlogPost {
  status: BlogStatus;
  publishAt?: string;
  updatedAt: string;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\u0980-\u09FF\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || `post-${Date.now()}`;

export const blogStore = {
  getAll(): ManagedBlogPost[] {
    return [];
  },
  getPublished(): ManagedBlogPost[] {
    return [];
  },
  get(id: string): ManagedBlogPost | undefined {
    return undefined;
  },
  getBySlug(slug: string): ManagedBlogPost | undefined {
    return undefined;
  },
  create(input: Partial<ManagedBlogPost> & { title: string }): ManagedBlogPost {
    const now = new Date().toISOString();
    const post: ManagedBlogPost = {
      id: `b_${Date.now()}`,
      slug: input.slug || slugify(input.title),
      title: input.title,
      excerpt: input.excerpt || "",
      content: input.content || "",
      cover: input.cover || "/placeholder.svg",
      categoryId: input.categoryId || "arabic",
      categoryName: input.categoryName || "আরবী ভাষা শিক্ষা",
      author: input.author || "Amar Talim",
      authorBio: input.authorBio,
      date: input.date || now,
      readTime: input.readTime ?? Math.max(2, Math.ceil((input.content?.length || 0) / 1200)),
      featured: input.featured ?? false,
      tags: input.tags || [],
      faq: input.faq || [],
      status: input.status || "draft",
      publishAt: input.publishAt,
      updatedAt: now,
    };
    void createBlog({
      title: post.title,
      slug: post.slug,
      content: post.content,
      published: post.status === "published",
      excerpt: post.excerpt,
      cover: post.cover,
      categoryId: post.categoryId,
      categoryName: post.categoryName,
      tags: post.tags,
      featured: post.featured,
      faq: post.faq as any,
    });
    return post;
  },
  update(id: string, patch: Partial<ManagedBlogPost>) {
    void updateBlog(id, {
      title: patch.title,
      slug: patch.slug,
      content: patch.content,
      published: patch.status ? patch.status === "published" : undefined,
      excerpt: patch.excerpt,
      cover: patch.cover,
      categoryId: patch.categoryId,
      categoryName: patch.categoryName,
      tags: patch.tags,
      featured: patch.featured,
      faq: patch.faq as any,
    });
  },
  remove(id: string) {
    void deleteBlog(id);
  },
  publish(id: string) {
    blogStore.update(id, { status: "published", date: new Date().toISOString(), publishAt: undefined });
  },
  schedule(id: string, isoDate: string) {
    blogStore.update(id, { status: "scheduled", publishAt: isoDate });
  },
  unpublish(id: string) {
    blogStore.update(id, { status: "draft", publishAt: undefined });
  },
};

export function useBlogStore() {
  const [posts, setPosts] = useState<ManagedBlogPost[]>([]);
  useEffect(() => {
    getAllBlogsAction().then(res => setPosts(res as ManagedBlogPost[]));
  }, []);
  return posts;
}

export function usePublishedBlogPosts() {
  const all = useBlogStore();
  return all.filter((p) => p.status === "published");
}

export { slugify };
