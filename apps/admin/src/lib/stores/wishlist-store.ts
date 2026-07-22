"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";

/**
 * Per-user course wishlist.
 *
 * Architecture: UI → Store → api.* → /wishlist mock → driver → localStorage.
 * Reads use the sync driver cache (subscribed for invalidation) so callers
 * don't need to await. Post-migration → Prisma `Wishlist { userId, courseId, createdAt }`.
 */
export interface WishlistItem {
  userId: string;
  courseId: string;
  createdAt: string;
}

const RES = "wishlist";
const cache = (): WishlistItem[] => driver.list<WishlistItem>(RES);

export const wishlistStore = {
  list(userId: string): WishlistItem[] {
    return cache()
      .filter((w) => w.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  has(userId: string, courseId: string): boolean {
    return cache().some((w) => w.userId === userId && w.courseId === courseId);
  },
  /** Sync toggle. Returns the new active state; persistence happens through api. */
  toggle(userId: string, courseId: string): boolean {
    const exists = wishlistStore.has(userId, courseId);
    if (exists) {
      void api.del("/wishlist", { userId, courseId }).catch(() => {});
      return false;
    }
    void api.post("/wishlist", { userId, courseId }).catch(() => {});
    return true;
  },
  remove(userId: string, courseId: string) {
    void api.del("/wishlist", { userId, courseId }).catch(() => {});
  },
};

export function useWishlist(userId: string | undefined, courseId: string) {
  const [active, setActive] = useState<boolean>(() =>
    userId ? wishlistStore.has(userId, courseId) : false,
  );
  useEffect(() => {
    const refresh = () => setActive(userId ? wishlistStore.has(userId, courseId) : false);
    refresh();
    return driver.subscribe(RES, refresh);
  }, [userId, courseId]);
  return active;
}

export function useUserWishlist(userId: string | undefined) {
  const [items, setItems] = useState<WishlistItem[]>(() =>
    userId ? wishlistStore.list(userId) : [],
  );
  useEffect(() => {
    const refresh = () => setItems(userId ? wishlistStore.list(userId) : []);
    refresh();
    return driver.subscribe(RES, refresh);
  }, [userId]);
  return items;
}
