import { MetadataRoute } from "next";
import { prisma } from "@/server/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://amar-talim.com";

  // Static routes
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blogs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/qa`, changeFrequency: "daily", priority: 0.8 },
  ];

  // Dynamic Blog Posts
  const posts = await prisma.blog.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blogs/${p.slug}`,
    lastModified: p.updatedAt || p.createdAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Dynamic Courses
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE_URL}/courses/${c.id}`,
    lastModified: c.createdAt,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  // Dynamic QA Posts
  const qas = await prisma.qaPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  const qaEntries: MetadataRoute.Sitemap = qas.map((q) => ({
    url: `${BASE_URL}/qa/${q.slug}`,
    lastModified: q.updatedAt || q.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic Books
  const books = await prisma.book.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  const bookEntries: MetadataRoute.Sitemap = books.map((b) => ({
    url: `${BASE_URL}/library/${b.id}`,
    lastModified: b.updatedAt || b.createdAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries, ...courseEntries, ...qaEntries, ...bookEntries];
}
