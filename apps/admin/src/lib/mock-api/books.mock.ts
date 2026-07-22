import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { BookRecord } from "@/types/book";

const RES = "books";
const read = () => driver.list<BookRecord>(RES);
const write = (xs: BookRecord[]) => driver.save(RES, xs);

export const registerBooksMocks = () => {
  registerMock("GET", /^\/books$/, () => ok(read()));

  registerMock("GET", /^\/books\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    return ok(read().find((b) => b.id === id) ?? null);
  });

  registerMock("POST", /^\/books$/, (req) => {
    const b = req.body as BookRecord;
    write([b, ...read().filter((x) => x.id !== b.id)]);
    return ok(b);
  });

  registerMock("PATCH", /^\/books\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    const patch = (req.body ?? {}) as Partial<BookRecord>;
    let out: BookRecord | null = null;
    write(read().map((b) => {
      if (b.id !== id) return b;
      out = { ...b, ...patch, updatedAt: new Date().toISOString() };
      return out;
    }));
    return ok(out);
  });

  registerMock("DELETE", /^\/books\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    write(read().filter((b) => b.id !== id));
    return ok(null);
  });
};
