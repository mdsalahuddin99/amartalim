import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { buildHomeJsonLd } from "@/components/marketing/home";
import { getPublishedBlogs, getBlogCategories } from "@/server/queries/blog.queries";

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
  const [posts, categories] = await Promise.all([
    getPublishedBlogs(),
    getBlogCategories(),
  ]);
  const jsonLd = buildHomeJsonLd(SITE_URL, posts);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient posts={posts} categories={categories} />
    </>
  );
}
