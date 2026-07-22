"use client";
import { useEffect, useState } from "react";
import type { AppNotification, NotificationKind } from "@/types/notification";

export const notificationsStore = {
  forUser(userId: string): AppNotification[] {
    return [];
  },
  unreadCount(userId: string): number {
    return 0;
  },
  async push(input: {
    userId: string;
    kind: NotificationKind;
    title: string;
    message: string;
    href?: string | null;
  }): Promise<AppNotification | null> {
    return null;
  },
  async markRead(id: string) {
    // No-op
  },
  async markAllRead(userId: string) {
    // No-op
  },
  async clear(userId: string) {
    // No-op
  },
};

export function useNotifications(userId: string | undefined) {
  const [items, setItems] = useState<AppNotification[]>([]);
  useEffect(() => {
    // Return empty for now as notifications aren't implemented in Prisma
    setItems([]);
  }, [userId]);
  return { items, unread: 0 };
}
