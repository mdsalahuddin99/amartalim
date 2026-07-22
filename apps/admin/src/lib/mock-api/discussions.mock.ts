import { ok, fail, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type {
  DiscussionThread,
  DiscussionReply,
} from "@/lib/stores/discussions-store";

const RES = "discussions";
const read = () => driver.list<DiscussionThread>(RES);
const write = (xs: DiscussionThread[]) => driver.save(RES, xs);

const newId = (p: string) =>
  `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const registerDiscussionsMocks = () => {
  // List threads (optionally scoped to lesson)
  registerMock("GET", /^\/discussions$/, (req) => {
    const { courseId, lessonId } = req.query;
    let xs = read();
    if (courseId) xs = xs.filter((t) => t.courseId === courseId);
    if (lessonId) xs = xs.filter((t) => t.lessonId === lessonId);
    xs = [...xs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return ok(xs);
  });

  // Create thread
  registerMock("POST", /^\/discussions$/, (req) => {
    const b = req.body as Omit<
      DiscussionThread,
      "id" | "createdAt" | "upvotes" | "resolved" | "replies"
    >;
    const item: DiscussionThread = {
      ...b,
      id: newId("th"),
      createdAt: new Date().toISOString(),
      upvotes: [],
      resolved: false,
      replies: [],
    };
    write([item, ...read()]);
    return ok(item);
  });

  // Delete thread
  registerMock("DELETE", /^\/discussions\/[^/]+$/, (req) => {
    const id = decodeURIComponent(req.path.split("/").pop()!);
    write(read().filter((t) => t.id !== id));
    return ok(null);
  });

  // Toggle resolved
  registerMock("PATCH", /^\/discussions\/[^/]+\/resolved$/, (req) => {
    const id = decodeURIComponent(req.path.split("/")[2]);
    write(read().map((t) => (t.id === id ? { ...t, resolved: !t.resolved } : t)));
    return ok(null);
  });

  // Toggle thread upvote
  registerMock("PATCH", /^\/discussions\/[^/]+\/upvote$/, (req) => {
    const id = decodeURIComponent(req.path.split("/")[2]);
    const { userId } = req.body as { userId: string };
    write(
      read().map((t) => {
        if (t.id !== id) return t;
        const has = t.upvotes.includes(userId);
        return {
          ...t,
          upvotes: has ? t.upvotes.filter((u) => u !== userId) : [...t.upvotes, userId],
        };
      }),
    );
    return ok(null);
  });

  // Add reply
  registerMock("POST", /^\/discussions\/[^/]+\/replies$/, (req) => {
    const threadId = decodeURIComponent(req.path.split("/")[2]);
    const b = req.body as Omit<
      DiscussionReply,
      "id" | "createdAt" | "upvotes" | "threadId"
    >;
    const reply: DiscussionReply = {
      ...b,
      id: newId("rp"),
      threadId,
      createdAt: new Date().toISOString(),
      upvotes: [],
    };
    const all = read();
    if (!all.some((t) => t.id === threadId)) return fail("NOT_FOUND", "Thread not found");
    write(
      all.map((t) =>
        t.id === threadId ? { ...t, replies: [...t.replies, reply] } : t,
      ),
    );
    return ok(reply);
  });

  // Delete reply
  registerMock("DELETE", /^\/discussions\/[^/]+\/replies\/[^/]+$/, (req) => {
    const parts = req.path.split("/");
    const threadId = decodeURIComponent(parts[2]);
    const replyId = decodeURIComponent(parts[4]);
    write(
      read().map((t) =>
        t.id === threadId
          ? { ...t, replies: t.replies.filter((r) => r.id !== replyId) }
          : t,
      ),
    );
    return ok(null);
  });

  // Toggle reply upvote
  registerMock("PATCH", /^\/discussions\/[^/]+\/replies\/[^/]+\/upvote$/, (req) => {
    const parts = req.path.split("/");
    const threadId = decodeURIComponent(parts[2]);
    const replyId = decodeURIComponent(parts[4]);
    const { userId } = req.body as { userId: string };
    write(
      read().map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          replies: t.replies.map((r) => {
            if (r.id !== replyId) return r;
            const has = r.upvotes.includes(userId);
            return {
              ...r,
              upvotes: has
                ? r.upvotes.filter((u) => u !== userId)
                : [...r.upvotes, userId],
            };
          }),
        };
      }),
    );
    return ok(null);
  });
};
