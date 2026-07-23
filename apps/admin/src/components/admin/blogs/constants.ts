import type { ManagedBlogPost, BlogStatus } from "@/types/blog";
import { type BlogCategory } from "@prisma/client";

export const statusMeta: Record<BlogStatus, { label: string; cls: string }> = {
  draft: { label: "ড্রাফট", cls: "bg-muted text-muted-foreground" },
  scheduled: { label: "নির্ধারিত", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  published: { label: "প্রকাশিত", cls: "bg-primary/15 text-primary" },
};

export const emptyDraft = (): Partial<ManagedBlogPost> => ({
  title: "", slug: "", excerpt: "", content: "", cover: "",
  categoryId: "arabic", categoryName: "আরবী ভাষা শিক্ষা",
  authorBio: "", tags: [], status: "draft", featured: false,
  faq: [], showToc: true,
});

export const toDatetimeLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const labelForCategory = (
  cat: { id: string; name: string; parentId?: string | null },
  all: { id: string; name: string; parentId?: string | null }[]
): string => {
  if (!cat.parentId) return cat.name;
  const parent = all.find((c) => c.id === cat.parentId);
  return parent ? `${parent.name} ↳ ${cat.name}` : cat.name;
};

export const plainTextLen = (html: string) => html.replace(/<[^>]*>/g, "").length;
export const estimateReadTime = (html: string) => Math.max(2, Math.ceil(plainTextLen(html) / 1200));
