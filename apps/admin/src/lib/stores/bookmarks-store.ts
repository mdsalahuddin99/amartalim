"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { driver, driverEvent } from "@/lib/data-driver";

/**
 * Per-user bookmark store (reading list) — backend-ready.
 *
 * Reads go through the shared `driver` cache (sync, for UI simplicity).
 * Mutations are routed through `api.*` which, in preview, hits the
 * `/bookmarks` mock that persists via the same `driver`.
 * Post-migration → Prisma `Bookmark { userId, blogId, createdAt }`.
 */
export interface Bookmark {
  userId: string;
  blogId: string;
  createdAt: string;
}

const RES = "bookmarks";
const EVT = driverEvent(RES);

const cache = (): Bookmark[] => driver.list<Bookmark>(RES);

export const bookmarkStore = {
  list(userId: string): Bookmark[] {
    return cache()
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  has(userId: string, blogId: string): boolean {
    return cache().some((b) => b.userId === userId && b.blogId === blogId);
  },
  /** Sync toggle (legacy callers). Returns the new active state. */
  toggle(userId: string, blogId: string): boolean {
    const list = cache();
    const exists = list.some((b) => b.userId === userId && b.blogId === blogId);
    if (exists) {
      void api.del("/bookmarks", { userId, blogId }).catch(() => {});
      return false;
    }
    void api.post("/bookmarks", { userId, blogId }).catch(() => {});
    return true;
  },
};

export function useBookmark(userId: string | undefined, blogId: string) {
  const [active, setActive] = useState<boolean>(() =>
    userId ? bookmarkStore.has(userId, blogId) : false,
  );
  useEffect(() => {
    const refresh = () => setActive(userId ? bookmarkStore.has(userId, blogId) : false);
    refresh();
    return driver.subscribe(RES, refresh);
  }, [userId, blogId]);
  useEffect(() => {
    void window.addEventListener; // noop
  }, []);
  // satisfy lint
  void EVT;
  return active;
}

export function useUserBookmarks(userId: string | undefined) {
  const [items, setItems] = useState<Bookmark[]>(() => (userId ? bookmarkStore.list(userId) : []));
  useEffect(() => {
    const refresh = () => setItems(userId ? bookmarkStore.list(userId) : []);
    refresh();
    return driver.subscribe(RES, refresh);
  }, [userId]);
  return items;
}
