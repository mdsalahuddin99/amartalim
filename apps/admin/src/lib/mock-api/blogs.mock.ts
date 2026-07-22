import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { ManagedBlogPost } from "@/types/blog";

const RES = "blogs";
const read = () => driver.list<ManagedBlogPost>(RES);
const write = (xs: ManagedBlogPost[]) => driver.save(RES, xs);

export const registerBlogsMocks = () => {
  registerMock("GET", /^\/blogs$/, () => ok(read()));

  registerMock("GET", /^\/blogs\/[^/]+$/, (req) => {
    const idOrSlug = req.path.split("/").pop()!;
    return ok(read().find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null);
  });

  registerMock("POST", /^\/blogs$/, (req) => {
    const post = req.body as ManagedBlogPost;
    write([post, ...read().filter((p) => p.id !== post.id)]);
    return ok(post);
  });

  registerMock("PATCH", /^\/blogs\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    const patch = (req.body ?? {}) as Partial<ManagedBlogPost>;
    let out: ManagedBlogPost | null = null;
    write(
      read().map((p) => {
        if (p.id !== id) return p;
        out = { ...p, ...patch, updatedAt: new Date().toISOString() };
        return out;
      }),
    );
    return ok(out);
  });

  registerMock("DELETE", /^\/blogs\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    write(read().filter((p) => p.id !== id));
    return ok(null);
  });
};
