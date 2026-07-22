"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";

/**
 * Per-lesson Q&A / Discussion store.
 *
 * Architecture: UI → Store → api.* → /discussions mock → driver → localStorage.
 * Reads use the sync driver cache (subscribed for invalidation).
 */

export interface DiscussionReply {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  role: "student" | "instructor" | "admin";
  body: string;
  createdAt: string;
  upvotes: string[];
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  role: "student" | "instructor" | "admin";
  title: string;
  body: string;
  createdAt: string;
  upvotes: string[];
  resolved: boolean;
  replies: DiscussionReply[];
}

const RES = "discussions";
const all = (): DiscussionThread[] => driver.list<DiscussionThread>(RES);

export const discussionsStore = {
  forLesson(courseId: string, lessonId: string): DiscussionThread[] {
    return all()
      .filter((t) => t.courseId === courseId && t.lessonId === lessonId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  create(t: Omit<DiscussionThread, "id" | "createdAt" | "upvotes" | "resolved" | "replies">) {
    void api.post("/discussions", t).catch(() => {});
  },
  remove(id: string) {
    void api.del(`/discussions/${encodeURIComponent(id)}`).catch(() => {});
  },
  toggleResolved(id: string) {
    void api.patch(`/discussions/${encodeURIComponent(id)}/resolved`).catch(() => {});
  },
  toggleUpvote(id: string, userId: string) {
    void api
      .patch(`/discussions/${encodeURIComponent(id)}/upvote`, { userId })
      .catch(() => {});
  },
  addReply(threadId: string, r: Omit<DiscussionReply, "id" | "createdAt" | "upvotes" | "threadId">) {
    void api
      .post(`/discussions/${encodeURIComponent(threadId)}/replies`, r)
      .catch(() => {});
  },
  removeReply(threadId: string, replyId: string) {
    void api
      .del(
        `/discussions/${encodeURIComponent(threadId)}/replies/${encodeURIComponent(replyId)}`,
      )
      .catch(() => {});
  },
  toggleReplyUpvote(threadId: string, replyId: string, userId: string) {
    void api
      .patch(
        `/discussions/${encodeURIComponent(threadId)}/replies/${encodeURIComponent(replyId)}/upvote`,
        { userId },
      )
      .catch(() => {});
  },
};

export function useLessonDiscussions(courseId: string, lessonId: string) {
  const [threads, setThreads] = useState<DiscussionThread[]>(() =>
    discussionsStore.forLesson(courseId, lessonId),
  );
  useEffect(() => {
    const refresh = () => setThreads(discussionsStore.forLesson(courseId, lessonId));
    refresh();
    void api
      .get("/discussions", { courseId, lessonId })
      .catch(() => {});
    return driver.subscribe(RES, refresh);
  }, [courseId, lessonId]);
  return threads;
}
