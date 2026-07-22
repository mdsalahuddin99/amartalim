import { ok, registerMock, type MockRequest } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { Order } from "@/types/order";

const RES = "orders";
const read = () => driver.list<Order>(RES);
const write = (xs: Order[]) => driver.save(RES, xs);

export const registerOrdersMocks = () => {
  // GET /orders?userId=...
  registerMock("GET", /^\/orders$/, (req: MockRequest) => {
    const userId = req.query.userId ?? "";
    const list = read()
      .filter((o) => !userId || o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return ok(list);
  });

  // GET /orders/:id
  registerMock("GET", /^\/orders\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    return ok(read().find((o) => o.id === id) ?? null);
  });

  // POST /orders
  registerMock("POST", /^\/orders$/, (req) => {
    const body = req.body as Omit<Order, "id" | "createdAt">;
    const order: Order = {
      ...body,
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    write([...read(), order]);
    return ok(order);
  });

  // PATCH /orders/:id
  registerMock("PATCH", /^\/orders\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    const patch = (req.body ?? {}) as Partial<Order>;
    let updated: Order | null = null;
    write(
      read().map((o) => {
        if (o.id !== id) return o;
        updated = { ...o, ...patch };
        return updated;
      }),
    );
    return ok(updated);
  });
};
