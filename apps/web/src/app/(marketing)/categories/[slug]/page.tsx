import { Metadata } from "next";
import PageClient from "./PageClient";
import { getBlogCategories, getPublishedBlogs } from "@/server/queries/blog.queries";
import type { ManagedBlogPost, ManagedBlogCategory } from "@/types/blog";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const categories = await getBlogCategories();
  const cat = categories.find((c) => c.slug === params.slug);
  return {
    title: cat ? `${cat.name} | Amar Talim` : "ক্যাটাগরি | Amar Talim",
    description: cat ? `আরবি ভাষা ও সাহিত্য বিষয়ক "${cat.name}" ক্যাটাগরির সব লেখা পড়ুন।` : "",
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const [categories, allPosts] = await Promise.all([
    getBlogCategories(),
    getPublishedBlogs(),
  ]);
  const category = categories.find((c) => c.slug === params.slug) || null;
  const posts = category ? allPosts.filter((p) => p.categoryId === category.id || p.categoryId === category.slug) : [];
  return <PageClient category={category} posts={posts} />;
}
