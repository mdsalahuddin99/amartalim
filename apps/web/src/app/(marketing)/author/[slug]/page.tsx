import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageClient from "./PageClient";
import { getAuthorBySlug, getAuthorPosts } from "@/server/queries/author.queries";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const author = await getAuthorBySlug(params.slug);
  if (!author) return { title: "Not Found | Amar Talim" };
  
  return {
    title: `${author.name} | Amar Talim`,
    description: author.shortBio || author.bio,
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const author = await getAuthorBySlug(params.slug);
  if (!author) notFound();

  const posts = await getAuthorPosts(params.slug);

  return <PageClient author={author as any} posts={posts} />;
}
