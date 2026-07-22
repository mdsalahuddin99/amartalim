/**
 * Generates public/llms.txt (index) and public/llms-full.txt (full text)
 * from src/lib/seed/blog-data.ts — used by AI engines (ChatGPT, Claude,
 * Perplexity) for ingestion per llmstxt.org spec.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://amaracademy.lovable.app";
const SITE_NAME = "Amar Talim";
const TAGLINE =
  "বাংলা ভাষায় আরবী ভাষা শিক্ষা, কুরআন-তাজবীদ, AI ও আধুনিক স্কিল বিষয়ক গভীর গবেষণাভিত্তিক ব্লগ ও ই-লার্নিং প্ল্যাটফর্ম।";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
}

function parsePosts(): Post[] {
  const src = readFileSync(resolve("src/lib/seed/blog-data.ts"), "utf-8");
  const re =
    /slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*excerpt:\s*"([^"]+)",\s*content:\s*([^,]+),[\s\S]*?categoryName:\s*"([^"]+)",\s*author:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"/g;
  const posts: Post[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    posts.push({
      slug: m[1],
      title: m[2],
      excerpt: m[3],
      content: m[4].trim(),
      category: m[5],
      author: m[6],
      date: m[7].slice(0, 10),
    });
  }
  return posts;
}

function buildIndex(posts: Post[]) {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME}`, "");
  lines.push(`> ${TAGLINE}`, "");
  lines.push(
    `${SITE_NAME} (আমার তা'লীম) is a Bengali-language educational publication focused on Arabic language learning, Quranic studies, tajweed, AI tools, and modern career skills. All content is original, expert-authored, and written for Bengali (Bangla) speakers.`,
    ""
  );
  lines.push(
    `Primary topics: Arabic alphabet for Bengali speakers, tajweed rules, Quranic vocabulary, Arabic grammar (nahw & sarf), Arabic conversation, Quran study apps, AI tools, prompt engineering, digital marketing, freelancing.`,
    ""
  );
  lines.push(`Language: Bengali (bn). Publisher: ${SITE_NAME}. Site: ${BASE_URL}`, "");

  lines.push("## Blog", "");
  for (const p of posts) {
    lines.push(`- [${p.title}](${BASE_URL}/blogs/${p.slug}): ${p.excerpt}`);
  }
  lines.push("");

  lines.push("## Pages", "");
  lines.push(`- [হোমপেজ](${BASE_URL}/): সাইটের ভূমিকা ও সর্বশেষ ব্লগ।`);
  lines.push(`- [সব ব্লগ](${BASE_URL}/blogs): সম্পূর্ণ ব্লগ সংগ্রহ, ক্যাটাগরি ও সার্চ সহ।`);
  lines.push(`- [ডিজিটাল লাইব্রেরি](${BASE_URL}/library): ই-বুক ও জীবনী।`);
  lines.push(`- [কোর্সসমূহ](${BASE_URL}/courses): ই-লার্নিং কোর্স তালিকা।`);
  lines.push("");

  lines.push("## Optional", "");
  lines.push(`- [Full content (llms-full.txt)](${BASE_URL}/llms-full.txt): সব আর্টিকেলের সম্পূর্ণ টেক্সট AI ingestion-এর জন্য।`);
  lines.push(`- [Sitemap](${BASE_URL}/sitemap.xml): সম্পূর্ণ URL তালিকা।`);
  lines.push(`- [RSS Feed](${BASE_URL}/rss.xml): সর্বশেষ ব্লগ সাবস্ক্রিপশন।`);
  lines.push("");

  return lines.join("\n");
}

function buildFull(posts: Post[]) {
  const out: string[] = [];
  out.push(`# ${SITE_NAME} — Full Content`, "");
  out.push(`> ${TAGLINE}`, "");
  out.push(`Source: ${BASE_URL}  |  Language: bn  |  Articles: ${posts.length}`, "");
  out.push("---", "");

  for (const p of posts) {
    out.push(`# ${p.title}`, "");
    out.push(
      `URL: ${BASE_URL}/blogs/${p.slug}`,
      `Author: ${p.author}  |  Category: ${p.category}  |  Published: ${p.date}`,
      ""
    );
    out.push(`> ${p.excerpt}`, "");
    out.push(p.excerpt, "");
    out.push("---", "");
  }

  return out.join("\n");
}

const posts = parsePosts();
writeFileSync(resolve("public/llms.txt"), buildIndex(posts));
writeFileSync(resolve("public/llms-full.txt"), buildFull(posts));
console.log(`✓ llms.txt + llms-full.txt written (${posts.length} articles)`);
