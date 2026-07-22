import { prisma } from "@/server/db/prisma";
import type { ManagedBlogPost } from "@/types/blog";
import { getPublishedBlogs, getBlogsByTag } from "./blog.queries";

export interface SearchResults {
  query: string;
  courses: any[];
  posts: ManagedBlogPost[];
  total: number;
}

const norm = (s: string) => s.toLowerCase();

export const searchAll = async (rawQuery: string): Promise<SearchResults> => {
  const q = norm(rawQuery.trim());
  if (!q) return { query: rawQuery, courses: [], posts: [], total: 0 };

  const allPosts = await getPublishedBlogs();
  
  const matchedPosts = allPosts.filter((p) =>
    [p.title, p.excerpt, p.categoryName, p.author, ...(p.tags ?? [])].some((f) =>
      norm(String(f)).includes(q),
    ),
  );

  return {
    query: rawQuery,
    courses: [], // Courses are hidden for now
    posts: matchedPosts,
    total: matchedPosts.length,
  };
};

export const getPostsByTag = async (tag: string): Promise<ManagedBlogPost[]> => {
  return getBlogsByTag(tag);
};

export const getPostsByCategory = async (categoryId: string): Promise<ManagedBlogPost[]> => {
  const allPosts = await getPublishedBlogs();
  return allPosts.filter((p) => p.categoryId === categoryId);
};
