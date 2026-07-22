import { ok, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { AppNotification } from "@/types/notification";

const RES = "notifications";
const read = () => driver.list<AppNotification>(RES);
const write = (xs: AppNotification[]) => driver.save(RES, xs);

export const registerNotificationsMocks = () => {
  // GET /notifications?userId=...
  registerMock("GET", /^\/notifications$/, (req) => {
    const userId = req.query.userId ?? "";
    const list = read()
      .filter((n) => !userId || n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return ok(list);
  });

  // POST /notifications
  registerMock("POST", /^\/notifications$/, (req) => {
    const input = req.body as Omit<AppNotification, "id" | "createdAt" | "read"> & {
      href?: string | null;
    };
    const n: AppNotification = {
      id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
      href: input.href ?? null,
      ...input,
    };
    write([n, ...read()].slice(0, 200));
    return ok(n);
  });

  // PATCH /notifications/:id  { read: true }
  registerMock("PATCH", /^\/notifications\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    const patch = (req.body ?? {}) as Partial<AppNotification>;
    write(read().map((n) => (n.id === id ? { ...n, ...patch } : n)));
    return ok(true);
  });

  // POST /notifications/mark-all-read  { userId }
  registerMock("POST", /^\/notifications\/mark-all-read$/, (req) => {
    const { userId } = (req.body ?? {}) as { userId?: string };
    if (!userId) return ok(0);
    write(read().map((n) => (n.userId === userId ? { ...n, read: true } : n)));
    return ok(1);
  });

  // DELETE /notifications  { userId }
  registerMock("DELETE", /^\/notifications$/, (req) => {
    const { userId } = (req.body ?? {}) as { userId?: string };
    if (!userId) return ok(0);
    write(read().filter((n) => n.userId !== userId));
    return ok(1);
  });
};
