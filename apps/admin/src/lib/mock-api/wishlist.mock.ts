import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { WishlistItem } from "@/lib/stores/wishlist-store";

const RES = "wishlist";
const read = () => driver.list<WishlistItem>(RES);
const write = (xs: WishlistItem[]) => driver.save(RES, xs);

export const registerWishlistMocks = () => {
  registerMock("GET", /^\/wishlist$/, (req) => {
    const userId = req.query.userId ?? "";
    return ok(read().filter((w) => !userId || w.userId === userId));
  });
  registerMock("POST", /^\/wishlist$/, (req) => {
    const { userId, courseId } = req.body as { userId: string; courseId: string };
    const list = read();
    if (list.some((w) => w.userId === userId && w.courseId === courseId)) return ok(null);
    const item: WishlistItem = { userId, courseId, createdAt: new Date().toISOString() };
    write([...list, item]);
    return ok(item);
  });
  registerMock("DELETE", /^\/wishlist$/, (req) => {
    const { userId, courseId } = (req.body ?? req.query) as { userId: string; courseId: string };
    write(read().filter((w) => !(w.userId === userId && w.courseId === courseId)));
    return ok(null);
  });
};
