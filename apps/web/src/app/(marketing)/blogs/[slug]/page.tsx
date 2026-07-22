import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageClient from "./PageClient";
import { getBlogBySlug, getPublishedBlogs, getBlogCategories } from "@/server/queries/blog.queries";
import { prisma } from "@/server/db/prisma";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  if (!blog) return { title: "Not Found | Amar Talim" };
  
  const title = `${blog.title} | Amar Talim`;
  const description = blog.excerpt || blog.title;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/blogs/${blog.slug}`;
  const imageUrl = blog.cover || `${siteUrl}/og-image.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: blog.date,
      authors: [blog.author],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    notFound();
  }

  // Fetch author profile
  let authorProfile = null;
  if (blog.author) {
    authorProfile = await prisma.author.findFirst({
      where: { 
        status: "APPROVED",
        name: { equals: blog.author, mode: "insensitive" }
      }
    });
  }

  // Fetch more by author
  const moreByAuthorDb = authorProfile ? await prisma.blog.findMany({
    where: { 
      published: true, 
      id: { not: blog.id },
      authorProfileId: authorProfile.id 
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { authorProfile: true, category: true }
  }) : [];

  // Fetch related by category
  const sameCategoryDb = await prisma.blog.findMany({
    where: { 
      published: true, 
      id: { not: blog.id },
      categoryId: blog.categoryId
    },
    orderBy: { publishedAt: "desc" },
    take: 6,
    include: { authorProfile: true, category: true }
  });

  const allCategories = await getBlogCategories();
  const currentCategory = allCategories.find((c) => c.id === blog.categoryId);
  let relatedCategories = [];
  
  if (currentCategory) {
    const others = allCategories.filter((c) => c.id !== currentCategory.id);
    const siblings = currentCategory.parentId
      ? others.filter((c) => c.parentId === currentCategory.parentId)
      : others.filter((c) => !c.parentId);
    
    // We don't have all blog posts in memory to count them, so we just take up to 6 siblings
    relatedCategories = siblings.length > 0 ? siblings : others;
    relatedCategories = relatedCategories.slice(0, 6).map(c => ({...c, count: 0}));
  }

  // Map to ManagedBlogPost (using getPublishedBlogs logic roughly)
  const mapBlog = (b: any) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt || "",
    content: b.content,
    cover: b.coverImage || "",
    categoryId: b.categoryId || "all",
    categoryName: b.category?.name || "Uncategorized",
    author: b.authorProfile?.name || "Unknown Author",
    authorBio: b.authorProfile?.shortBio || b.authorProfile?.bio || "",
    date: b.publishedAt?.toISOString() || b.createdAt.toISOString(),
    readTime: b.readingTime || 5,
    featured: false,
    tags: b.tags,
    status: "published" as any,
    updatedAt: b.updatedAt.toISOString(),
  });

  const sameCategoryMapped = sameCategoryDb.map(mapBlog);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt || blog.title,
    "image": blog.cover ? [blog.cover] : [],
    "datePublished": blog.date,
    "dateModified": blog.updatedAt,
    "author": [{
      "@type": "Person",
      "name": authorProfile?.name || blog.author || "Amar Talim",
      "url": `${SITE_URL}/authors/${authorProfile?.slug || "amartalim"}`
    }]
  };

  const jsonLdArray = [jsonLd];
  if (blog.faq && Array.isArray(blog.faq) && blog.faq.length > 0) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": blog.faq.map((item: any) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };
    jsonLdArray.push(faqSchema as any);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArray) }}
      />
      <Suspense>
        <PageClient 
          initialBlog={blog as any} // we'll rely on the client for full typing 
          authorProfile={authorProfile}
          moreByAuthor={moreByAuthorDb.map(mapBlog)}
          relatedPosts={sameCategoryMapped.slice(0, 3)}
          sidebarRelated={sameCategoryMapped.slice(0, 6)}
          relatedCategories={relatedCategories}
          currentCategory={currentCategory}
        />
      </Suspense>
    </>
  );
}
