export const dynamic = "force-dynamic";

import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { buildHomeJsonLd } from "@/components/marketing/home";
import { getPublishedBlogs, getBlogCategories } from "@/server/queries/blog.queries";
import { getHomepageContent } from "@/server/queries/homepage.queries";
import { getQaPosts } from "@/server/actions/qa.actions";
import { prisma } from "@/server/db/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "আমার তালিম — বাংলা ব্লগ ও জ্ঞানভাণ্ডার",
    description: "আরবী ভাষা শিক্ষা, কুরআন, AI, ফ্রিল্যান্সিং, ক্যারিয়ার ও ডিজিটাল মার্কেটিং নিয়ে বাংলা ভাষায় গভীর গবেষণাভিত্তিক ব্লগ ও আর্টিকেল।",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "আমার তালিম — বাংলা ব্লগ ও জ্ঞানভাণ্ডার",
      description: "আরবী ভাষা শিক্ষা, কুরআন, AI, ফ্রিল্যান্সিং, ক্যারিয়ার ও ডিজিটাল মার্কেটিং নিয়ে বাংলা ভাষায় গভীর গবেষণাভিত্তিক ব্লগ ও আর্টিকেল।",
      url: SITE_URL,
      siteName: "Amar Talim",
      images: [
        {
          url: `${SITE_URL}/logo.png`,
          width: 800,
          height: 600,
        },
      ],
      locale: "bn_BD",
      type: "website",
    },
  };
}

export default async function MarketingHomePage() {
  const [posts, categories, homepageContent, qaResult, courseCategories, libraryBooks, totalLibraryBooks] = await Promise.all([
    getPublishedBlogs(),
    getBlogCategories(),
    getHomepageContent(),
    getQaPosts({ status: "PUBLISHED" }),
    prisma.courseCategory.findMany({ include: { _count: { select: { courses: true } } } }),
    prisma.book.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, title: true, cover: true, slug: true } }),
    prisma.book.count({ where: { status: "published" } })
  ]);
  const jsonLd = buildHomeJsonLd(SITE_URL, posts);
  
  // get 3-4 recent qa posts
  const qaPosts = qaResult.ok && qaResult.data ? qaResult.data.slice(0, 4) : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient 
        posts={posts} 
        categories={categories} 
        homepageContent={homepageContent}
        qaPosts={qaPosts}
        courseCategories={courseCategories}
        libraryBooks={libraryBooks}
        totalLibraryBooks={totalLibraryBooks}
      />
    </>
  );
}
