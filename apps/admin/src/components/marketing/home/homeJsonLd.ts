import type { ManagedBlogPost as Posts } from "@/types/blog";

/**
 * Pure JSON-LD builder for the marketing homepage. Framework-agnostic so it
 * can be called from a Next.js Server Component (or `generateMetadata`) after
 * migration without changes.
 */
export const buildHomeJsonLd = (siteUrl: string, posts: Posts) => [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Amar Talim",
    alternateName: "আমার তা'লীম",
    url: siteUrl,
    inLanguage: "bn",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/blogs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Amar Talim",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "বাংলা ভাষায় আরবী, কুরআন, AI ও স্কিল বিষয়ক গভীর গবেষণাভিত্তিক ব্লগ ও ই-লার্নিং প্ল্যাটফর্ম।",
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "সর্বশেষ আর্টিকেল",
    itemListElement: posts.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/blogs/${p.slug}`,
      name: p.title,
    })),
  },
];
