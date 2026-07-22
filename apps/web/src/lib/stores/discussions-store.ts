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

export const discussionsStore = {
  forLesson(courseId: string, lessonId: string): DiscussionThread[] {
    return [];
  },
  create(t: Omit<DiscussionThread, "id" | "createdAt" | "upvotes" | "resolved" | "replies">) {
  },
  remove(id: string) {
  },
  toggleResolved(id: string) {
  },
  toggleUpvote(id: string, userId: string) {
  },
  addReply(threadId: string, r: Omit<DiscussionReply, "id" | "createdAt" | "upvotes" | "threadId">) {
  },
  removeReply(threadId: string, replyId: string) {
  },
  toggleReplyUpvote(threadId: string, replyId: string, userId: string) {
  },
};

export function useLessonDiscussions(courseId: string, lessonId: string) {
  return [];
}
