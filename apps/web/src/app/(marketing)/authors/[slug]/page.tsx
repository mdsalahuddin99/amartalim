import { Metadata } from "next";
import PageClient from "./PageClient";
import { getAuthorBySlug, getAuthorPosts } from "@/server/queries/author.queries";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Detail | Amar Talim",
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;
  const author = await getAuthorBySlug(slug);
  const posts = await getAuthorPosts(slug);

  if (!author) {
    notFound();
  }

  return <PageClient author={author} posts={posts} />;
}
