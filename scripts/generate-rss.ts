/**
 * Generates public/rss.xml from src/lib/seed/blog-data.ts.
 * Runs via predev / prebuild hooks. Admin CMS localStorage posts are NOT
 * visible here — after Next.js + DB migration, replace with a /rss.xml
 * server route querying Prisma directly.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://amaracademy.lovable.app";
const SITE_TITLE = "আমার তালীম — ব্লগ";
const SITE_DESC = "আরবী ভাষা, ইসলামিক শিক্ষা এবং শিক্ষা সহায়ক আর্টিকেল।";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  categoryName: string;
}

const escapeXml = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cdata = (s: string) => `<![CDATA[${String(s ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

function parsePosts(): Post[] {
  const src = readFileSync(resolve("src/lib/seed/blog-data.ts"), "utf-8");
  // Extract each object between `{ ... }` items in blogPosts array — cheap regex per field.
  const posts: Post[] = [];
  const re =
    /id:\s*"[^"]+"[\s\S]*?slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?excerpt:\s*"([^"]+)"[\s\S]*?categoryName:\s*"([^"]+)"[\s\S]*?author:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    posts.push({
      slug: m[1],
      title: m[2],
      excerpt: m[3],
      categoryName: m[4],
      author: m[5],
      date: m[6],
    });
  }
  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

function build(posts: Post[]) {
  const now = new Date().toUTCString();
  const items = posts
    .map((p) => {
      const link = `${BASE_URL}/blogs/${p.slug}`;
      const pubDate = new Date(p.date).toUTCString();
      return [
        "    <item>",
        `      <title>${cdata(p.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <dc:creator>${cdata(p.author)}</dc:creator>`,
        `      <category>${cdata(p.categoryName)}</category>`,
        `      <description>${cdata(p.excerpt)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}/blogs</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESC)}</description>
    <language>bn</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

const posts = parsePosts();
writeFileSync(resolve("public/rss.xml"), build(posts));
console.log(`✓ rss.xml written (${posts.length} items)`);
