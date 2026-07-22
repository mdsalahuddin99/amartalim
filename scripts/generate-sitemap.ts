/**
 * Generates public/sitemap.xml from blog-data.ts (slugs, dates, categories).
 * Runs via predev / prebuild hooks. Parses TSX source via regex to avoid
 * pulling image assets at build time.
 *
 * NOTE: Admin CMS-created posts live in browser localStorage and are NOT
 * visible to this script. Use the admin "Export sitemap" button for those,
 * or wait for the Next.js + DB migration where /sitemap.xml becomes a
 * server route querying Prisma directly.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://amaracademy.lovable.app";

interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
}

const staticEntries: Entry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/blogs", changefreq: "daily", priority: "0.9" },
  { loc: "/library", changefreq: "weekly", priority: "0.7" },
  { loc: "/courses", changefreq: "weekly", priority: "0.8" },
];

function parseSource() {
  return readFileSync(resolve("src/lib/seed/blog-data.ts"), "utf-8");
}

function parseBlogs(src: string): Entry[] {
  const re = /slug:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"/g;
  const entries: Entry[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    entries.push({
      loc: `/blogs/${m[1]}`,
      lastmod: m[2].slice(0, 10),
      changefreq: "monthly",
      priority: "0.8",
    });
  }
  return entries;
}

function parseCategories(src: string): Entry[] {
  // blogCategories: [ { id: "...", name: "..." }, ... ]
  const block = src.match(/blogCategories[\s\S]*?\[([\s\S]*?)\];/);
  if (!block) return [];
  const idRe = /id:\s*"([^"]+)"/g;
  const entries: Entry[] = [];
  let m: RegExpExecArray | null;
  while ((m = idRe.exec(block[1])) !== null) {
    if (m[1] === "all") continue;
    entries.push({
      loc: `/blogs?category=${m[1]}`,
      changefreq: "weekly",
      priority: "0.6",
    });
  }
  return entries;
}

function build(entries: Entry[]) {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const src = parseSource();
const all = [...staticEntries, ...parseCategories(src), ...parseBlogs(src)];
writeFileSync(resolve("public/sitemap.xml"), build(all));
console.log(`✓ sitemap.xml written (${all.length} entries)`);
