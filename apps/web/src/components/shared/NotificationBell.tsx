"use client";

import { Link } from "@/lib/navigation";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/server/auth/session";
import { notificationsStore, useNotifications } from "@/lib/stores/notifications-store";
import type { NotificationKind } from "@/types/notification";

const kindEmoji: Record<NotificationKind, string> = {
  order_paid: "💳",
  course_enrolled: "🎓",
  lesson_completed: "✅",
  quiz_passed: "🏆",
  quiz_failed: "📝",
  certificate_ready: "📜",
  system: "🔔",
};

const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} সেকেন্ড আগে`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  return `${d} দিন আগে`;
};

export function NotificationBell() {
  const { user } = useSession();
  const { items, unread } = useNotifications(user?.id);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="বিজ্ঞপ্তি"
          className="relative p-2 text-foreground/60 hover:text-primary hover:bg-foreground/5 rounded-full transition-all"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(var(--accent))] text-[10px] font-bold text-foreground flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">বিজ্ঞপ্তি</span>
            {unread > 0 && <Badge variant="secondary">{unread} নতুন</Badge>}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => notificationsStore.markAllRead(user.id)}
              >
                <Check className="h-3.5 w-3.5 mr-1" /> সব পঠিত
              </Button>
            )}
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => notificationsStore.clear(user.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-[420px]">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              কোনো বিজ্ঞপ্তি নেই
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const body = (
                  <div
                    className={`flex gap-3 px-3 py-3 hover:bg-muted/50 transition-colors ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="text-xl leading-none mt-0.5">{kindEmoji[n.kind]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id} onClick={() => notificationsStore.markRead(n.id)}>
                    {n.href ? <Link to={n.href}>{body}</Link> : body}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
