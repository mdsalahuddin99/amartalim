import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { Comment } from "@/types/comment";

const RES = "comments";
const read = () => driver.list<Comment>(RES);
const write = (xs: Comment[]) => driver.save(RES, xs);

export const registerCommentsMocks = () => {
  registerMock("GET", /^\/comments$/, (req) => {
    const blogId = req.query.blogId ?? "";
    const all = req.query.all === "1";
    let list = read();
    if (!all) list = list.filter((c) => !c.deletedAt);
    return ok(list.filter((c) => !blogId || c.blogId === blogId));
  });
  registerMock("POST", /^\/comments$/, (req) => {
    const input = req.body as Omit<Comment, "id" | "createdAt" | "updatedAt" | "deletedAt">;
    const now = new Date().toISOString();
    const c: Comment = {
      ...input,
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    write([...read(), c]);
    return ok(c);
  });
  registerMock("DELETE", /^\/comments\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    const { requesterId, admin } = (req.body ?? req.query) as { requesterId?: string; admin?: string };
    if (admin === "1") {
      // Hard delete by admin
      write(read().filter((c) => c.id !== id));
      return ok(null);
    }
    write(
      read().map((c) =>
        c.id === id && c.authorId === requesterId
          ? { ...c, deletedAt: new Date().toISOString(), body: "" }
          : c,
      ),
    );
    return ok(null);
  });
  registerMock("POST", /^\/comments\/[^/]+\/restore$/, (req) => {
    const id = req.path.split("/")[2];
    write(read().map((c) => c.id === id ? { ...c, deletedAt: null } : c));
    return ok(null);
  });
};
