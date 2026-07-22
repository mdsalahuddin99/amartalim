import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { ManagedBlogCategory } from "@/types/blog";

const RES = "blog-categories";
const VERSION = "v2";
const read = () => driver.list<ManagedBlogCategory>(RES, { version: VERSION });
const write = (xs: ManagedBlogCategory[]) => driver.save(RES, xs, { version: VERSION });

export const registerBlogCategoriesMocks = () => {
  registerMock("GET", /^\/blog-categories$/, () => ok(read()));

  registerMock("POST", /^\/blog-categories$/, (req) => {
    const c = req.body as ManagedBlogCategory;
    write([...read(), c]);
    return ok(c);
  });

  registerMock("PATCH", /^\/blog-categories\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    const patch = (req.body ?? {}) as Partial<ManagedBlogCategory>;
    let out: ManagedBlogCategory | null = null;
    write(
      read().map((c) => {
        if (c.id !== id) return c;
        out = { ...c, ...patch };
        return out;
      }),
    );
    return ok(out);
  });

  registerMock("DELETE", /^\/blog-categories\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    // also remove children recursively
    const all = read();
    const toRemove = new Set([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const c of all) {
        if (c.parentId && toRemove.has(c.parentId) && !toRemove.has(c.id)) {
          toRemove.add(c.id);
          grew = true;
        }
      }
    }
    write(all.filter((c) => !toRemove.has(c.id)));
    return ok(null);
  });
};
