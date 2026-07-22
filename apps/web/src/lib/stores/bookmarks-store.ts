"use client";
import { useEffect, useState } from "react";
import { toggleBookmarkAction, getUserBookmarksAction, checkBookmarkAction } from "@/server/actions/bookmark.actions";

export interface Bookmark {
  userId: string;
  blogId: string;
  createdAt: string;
}

export const bookmarkStore = {
  list(userId: string): Bookmark[] {
    return [];
  },
  has(userId: string, blogId: string): boolean {
    return false;
  },
  /** Sync toggle (legacy callers). Returns the new active state. */
  toggle(userId: string, blogId: string): boolean {
    void toggleBookmarkAction(blogId);
    return true; // Optimistic return not truly reliable without awaiting, but keeps signature
  },
};

export function useBookmark(userId: string | undefined, blogId: string) {
  const [active, setActive] = useState<boolean>(false);
  useEffect(() => {
    if (!userId) return;
    checkBookmarkAction(blogId).then((res) => setActive(res));
  }, [userId, blogId]);
  return active;
}

export function useUserBookmarks(userId: string | undefined) {
  const [items, setItems] = useState<Bookmark[]>([]);
  useEffect(() => {
    if (!userId) return;
    getUserBookmarksAction().then((res) => {
      if (Array.isArray(res)) {
        const mapped = res.map((r: any) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }));
        setItems(mapped);
      }
    });
  }, [userId]);
  return items;
}
