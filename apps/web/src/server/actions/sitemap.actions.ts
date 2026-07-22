"use server";

import { prisma } from "../db/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const buildXml = (entries: Entry[]) => {
  const urls = entries
    .map((e) =>
      [
        "  <url>",
        `    <loc>${escape(BASE_URL + e.loc)}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : "",
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
        e.priority ? `    <priority>${e.priority}</priority>` : "",
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

export async function generateSitemapXml(): Promise<string> {
  const staticEntries: Entry[] = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/blogs", changefreq: "daily", priority: "0.9" },
    { loc: "/library", changefreq: "weekly", priority: "0.7" },
    { loc: "/qa", changefreq: "daily", priority: "0.8" },
  ];

  const categories = await prisma.blogCategory.findMany();
  const categoryEntries: Entry[] = categories.map((c) => ({
    loc: `/blogs?category=${c.id}`,
    changefreq: "weekly",
    priority: "0.6",
  }));

  const posts = await prisma.blog.findMany({
    where: { published: true, deletedAt: null },
    select: { slug: true, updatedAt: true, featured: true }
  });
  
  const postEntries: Entry[] = posts.map((p) => ({
    loc: `/blogs/${p.slug}`,
    lastmod: p.updatedAt.toISOString().slice(0, 10),
    changefreq: "monthly",
    priority: p.featured ? "0.9" : "0.8",
  }));

  return buildXml([...staticEntries, ...categoryEntries, ...postEntries]);
}
