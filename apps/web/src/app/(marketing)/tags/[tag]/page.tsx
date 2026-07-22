import { Metadata } from "next";
import PageClient from "./PageClient";
import { getBlogsByTag } from "@/server/queries/blog.queries";
import type { ManagedBlogPost } from "@/types/blog";

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const decoded = decodeURIComponent(params.tag);
  return {
    title: `#${decoded} | Amar Talim`,
    description: `আরবি ভাষা ও সাহিত্য বিষয়ক "${decoded}" ট্যাগের সব লেখা পড়ুন।`,
  };
}

export default async function Page({ params }: { params: { tag: string } }) {
  const decoded = decodeURIComponent(params.tag);
  const posts: ManagedBlogPost[] = await getBlogsByTag(decoded);
  return <PageClient tag={decoded} posts={posts} />;
}
