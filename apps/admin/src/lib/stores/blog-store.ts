"use client";
import { useEffect, useState } from "react";
import { blogPosts as seedPosts, type BlogPost } from "@/lib/seed/blog-data";
import { driver, driverEvent } from "@/lib/data-driver";
import { api } from "@/lib/api-client";

/**
 * Blog store — backend-ready.
 * Reads sync via `driver` cache; mutations through `api.*` → `/blogs` mock.
 * Post-migration: queries move to `src/server/queries/blog.queries.ts`.
 */
export type BlogStatus = "draft" | "scheduled" | "published";

export interface ManagedBlogPost extends BlogPost {
  status: BlogStatus;
  publishAt?: string;
  updatedAt: string;
}

const RES = "blogs";
const EVT = driverEvent(RES);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\u0980-\u09FF\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || `post-${Date.now()}`;

const seedAsManaged = (): ManagedBlogPost[] =>
  seedPosts.map((p) => ({ ...p, status: "published" as BlogStatus, updatedAt: p.date }));

const cache = (): ManagedBlogPost[] => {
  const list = driver.list<ManagedBlogPost>(RES);
  if (list.length === 0 && typeof window !== "undefined") {
    const init = seedAsManaged();
    driver.save(RES, init);
    return init;
  }
  return list;
};

/** Auto-promote scheduled posts whose publishAt has passed. */
const promoteScheduled = (list: ManagedBlogPost[]): ManagedBlogPost[] => {
  const now = Date.now();
  let changed = false;
  const next = list.map((p) => {
    if (p.status === "scheduled" && p.publishAt && new Date(p.publishAt).getTime() <= now) {
      changed = true;
      return { ...p, status: "published" as BlogStatus, date: p.publishAt, updatedAt: new Date().toISOString() };
    }
    return p;
  });
  if (changed) driver.save(RES, next);
  return next;
};

export const blogStore = {
  getAll(): ManagedBlogPost[] {
    return promoteScheduled(cache());
  },
  getPublished(): ManagedBlogPost[] {
    return blogStore.getAll().filter((p) => p.status === "published");
  },
  get(id: string): ManagedBlogPost | undefined {
    return blogStore.getAll().find((p) => p.id === id);
  },
  getBySlug(slug: string): ManagedBlogPost | undefined {
    return blogStore.getAll().find((p) => p.slug === slug);
  },
  /** Sync legacy create — returns provisional record; mock persists in background. */
  create(input: Partial<ManagedBlogPost> & { title: string }): ManagedBlogPost {
    const now = new Date().toISOString();
    const post: ManagedBlogPost = {
      id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      slug: input.slug || slugify(input.title),
      title: input.title,
      excerpt: input.excerpt || "",
      content: input.content || "",
      cover: input.cover || "/placeholder.svg",
      categoryId: input.categoryId || "arabic",
      categoryName: input.categoryName || "আরবী ভাষা শিক্ষা",
      author: input.author || "Amar Talim",
      authorBio: input.authorBio,
      date: input.date || now,
      readTime: input.readTime ?? Math.max(2, Math.ceil((input.content?.length || 0) / 1200)),
      featured: input.featured ?? false,
      tags: input.tags || [],
      faq: input.faq || [],
      status: input.status || "draft",
      publishAt: input.publishAt,
      updatedAt: now,
    };
    void api.post("/blogs", post).catch(() => {});
    return post;
  },
  update(id: string, patch: Partial<ManagedBlogPost>) {
    void api.patch(`/blogs/${id}`, patch).catch(() => {});
  },
  remove(id: string) {
    void api.del(`/blogs/${id}`).catch(() => {});
  },
  publish(id: string) {
    blogStore.update(id, { status: "published", date: new Date().toISOString(), publishAt: undefined });
  },
  schedule(id: string, isoDate: string) {
    blogStore.update(id, { status: "scheduled", publishAt: isoDate });
  },
  unpublish(id: string) {
    blogStore.update(id, { status: "draft", publishAt: undefined });
  },
};

/**
 * Singleton 30s interval shared across every `useBlogStore` consumer.
 * Each hook only subscribes to a callback set — no per-component timer.
 */
const tickListeners = new Set<() => void>();
let tickHandle: number | null = null;
const ensureTicker = () => {
  if (typeof window === "undefined" || tickHandle !== null) return;
  tickHandle = window.setInterval(() => {
    tickListeners.forEach((cb) => cb());
  }, 30_000);
};
const subscribeTicker = (cb: () => void) => {
  tickListeners.add(cb);
  ensureTicker();
  return () => {
    tickListeners.delete(cb);
    if (tickListeners.size === 0 && tickHandle !== null) {
      window.clearInterval(tickHandle);
      tickHandle = null;
    }
  };
};

export function useBlogStore() {
  const [posts, setPosts] = useState<ManagedBlogPost[]>(() =>
    typeof window === "undefined" ? seedAsManaged() : blogStore.getAll(),
  );
  useEffect(() => {
    const refresh = () => setPosts(blogStore.getAll());
    refresh();
    const unsub = driver.subscribe(RES, refresh);
    const unsubTick = subscribeTicker(refresh);
    return () => {
      unsub();
      unsubTick();
    };
  }, []);
  void EVT;
  return posts;
}

export function usePublishedBlogPosts() {
  const all = useBlogStore();
  return all.filter((p) => p.status === "published");
}

export { slugify };
