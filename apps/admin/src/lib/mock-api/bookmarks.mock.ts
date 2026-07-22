import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { Bookmark } from "@/lib/stores/bookmarks-store";

const RES = "bookmarks";
const read = () => driver.list<Bookmark>(RES);
const write = (xs: Bookmark[]) => driver.save(RES, xs);

export const registerBookmarksMocks = () => {
  registerMock("GET", /^\/bookmarks$/, (req) => {
    const userId = req.query.userId ?? "";
    return ok(read().filter((b) => !userId || b.userId === userId));
  });
  registerMock("POST", /^\/bookmarks$/, (req) => {
    const { userId, blogId } = req.body as { userId: string; blogId: string };
    const list = read();
    if (list.some((b) => b.userId === userId && b.blogId === blogId)) return ok(null);
    const b: Bookmark = { userId, blogId, createdAt: new Date().toISOString() };
    write([...list, b]);
    return ok(b);
  });
  registerMock("DELETE", /^\/bookmarks$/, (req) => {
    const { userId, blogId } = (req.body ?? req.query) as { userId: string; blogId: string };
    write(read().filter((b) => !(b.userId === userId && b.blogId === blogId)));
    return ok(null);
  });
};
