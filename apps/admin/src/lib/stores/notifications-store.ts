"use client";
import { useEffect, useState } from "react";
import type { AppNotification, NotificationKind } from "@/types/notification";
import { api } from "@/lib/api-client";
import { driver, driverEvent } from "@/lib/data-driver";

/**
 * Notifications store — backend-ready (see `orders-store.ts` for the pattern).
 *
 * Mutations go through `api.*` (`/notifications` REST endpoints).
 * Reads return synchronously from the local cache so UI stays simple.
 */
const RES = "notifications";
const EVT = driverEvent(RES);

const cache = () =>
  driver
    .list<AppNotification>(RES)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const notificationsStore = {
  forUser(userId: string): AppNotification[] {
    return cache().filter((n) => n.userId === userId);
  },
  unreadCount(userId: string): number {
    return cache().filter((n) => n.userId === userId && !n.read).length;
  },
  async push(input: {
    userId: string;
    kind: NotificationKind;
    title: string;
    message: string;
    href?: string | null;
  }): Promise<AppNotification> {
    return api.post<AppNotification>("/notifications", input);
  },
  async markRead(id: string) {
    await api.patch(`/notifications/${id}`, { read: true });
  },
  async markAllRead(userId: string) {
    await api.post("/notifications/mark-all-read", { userId });
  },
  async clear(userId: string) {
    await api.del("/notifications", { userId });
  },
};

export function useNotifications(userId: string | undefined) {
  const [items, setItems] = useState<AppNotification[]>(() =>
    userId ? notificationsStore.forUser(userId) : [],
  );
  useEffect(() => {
    const refresh = () => setItems(userId ? notificationsStore.forUser(userId) : []);
    refresh();
    if (userId) {
      void api.get<AppNotification[]>("/notifications", { userId }).then(refresh).catch(() => {});
    }
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [userId]);
  const unread = items.filter((n) => !n.read).length;
  return { items, unread };
}
