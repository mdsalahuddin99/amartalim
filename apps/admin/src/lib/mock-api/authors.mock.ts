import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { Author } from "@/types/author";
import { slugify } from "@/lib/slugify";

const RES = "authors";
const read = () => driver.list<Author>(RES);
const write = (xs: Author[]) => driver.save(RES, xs);

const uniqueSlug = (base: string, existing: Author[]): string => {
  let s = base || `author-${Date.now()}`;
  let i = 2;
  while (existing.some((a) => a.slug === s)) s = `${base}-${i++}`;
  return s;
};

export const registerAuthorsMocks = () => {
  registerMock("GET", /^\/authors$/, () => ok(read()));

  registerMock("POST", /^\/authors$/, (req) => {
    const input = req.body as Omit<Author, "id" | "slug" | "status" | "createdAt" | "updatedAt">;
    const list = read();
    const now = new Date().toISOString();
    const author: Author = {
      ...input,
      id: `auth_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      slug: uniqueSlug(slugify(input.name), list),
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };
    write([author, ...list]);
    return ok(author);
  });

  registerMock("PATCH", /^\/authors\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    const patch = (req.body ?? {}) as Partial<Author>;
    let out: Author | null = null;
    write(
      read().map((a) => {
        if (a.id !== id) return a;
        out = { ...a, ...patch, updatedAt: new Date().toISOString() };
        return out;
      }),
    );
    return ok(out);
  });

  registerMock("DELETE", /^\/authors\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    write(read().filter((a) => a.id !== id));
    return ok(null);
  });
};
