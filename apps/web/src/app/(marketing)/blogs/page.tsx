import { Metadata } from "next";
import { Suspense } from "react";
import PageClient from "./PageClient";
import { getPublishedBlogs, getBlogCategories } from "@/server/queries/blog.queries";

export const metadata: Metadata = {
  title: "Blogs | Amar Talim",
  description: "Read the latest blogs and articles on Arabic language learning, Quran, AI, freelancing, and digital marketing on Amar Talim.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Blogs | Amar Talim",
    description: "Read the latest blogs and articles on Arabic language learning, Quran, AI, freelancing, and digital marketing on Amar Talim.",
    url: "/blogs",
    type: "website",
  },
};

export const revalidate = 60; // Revalidate every minute

export default async function Page() {
  const [initialBlogs, initialCategories] = await Promise.all([
    getPublishedBlogs(),
    getBlogCategories(),
  ]);

  return (
    <Suspense fallback={<div />}>
      <PageClient initialBlogs={initialBlogs} initialCategories={initialCategories} />
    </Suspense>
  );
}
