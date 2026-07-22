import { prisma } from "@/server/db/prisma";

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

export async function buildLiveSitemap(): Promise<string> {
  const staticEntries: Entry[] = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/blogs", changefreq: "daily", priority: "0.9" },
    { loc: "/library", changefreq: "weekly", priority: "0.7" },
    { loc: "/qa", changefreq: "daily", priority: "0.8" },
  ];

  // Fetch categories from DB
  const categories = await prisma.blogCategory.findMany();
  const categoryEntries: Entry[] = categories.map((c) => ({
    loc: `/blogs?cat=${c.slug}`,
    changefreq: "weekly",
    priority: "0.6",
  }));

  // Fetch published posts from DB
  const posts = await prisma.blog.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });

  const postEntries: Entry[] = posts.map((p) => ({
    loc: `/blogs/${p.slug}`,
    lastmod: (p.updatedAt || p.createdAt).toISOString().slice(0, 10),
    changefreq: "monthly",
    priority: "0.8",
  }));

  return buildXml([...staticEntries, ...categoryEntries, ...postEntries]);
}

export function downloadSitemap() {
  buildLiveSitemap().then((xml) => {
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
