"use client";
import { useEffect, useState } from "react";
import type { Order } from "@/types/order";
import { api } from "@/lib/api-client";
import { driver, driverEvent } from "@/lib/data-driver";

/**
 * Orders store — backend-ready.
 *
 * All persistence flows through `api.*` (`/orders` REST endpoints).
 * In the Vite preview those calls hit the mock handler in
 * `src/lib/mock-api/orders.mock.ts`, which uses `localStorage` via the
 * shared `driver`. After Next.js migration, just remove the mock — the
 * store and every component using it keep working.
 *
 * We keep a synchronous `forUser` / `get` API (reading from the local cache)
 * so existing components don't need to be turned into async. Mutations
 * round-trip through `api.*` and then fire a change event for hooks.
 */
const RES = "orders";
const EVT = driverEvent(RES);

const cache = () =>
  driver
    .list<Order>(RES)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const ordersStore = {
  forUser(userId: string): Order[] {
    return cache().filter((o) => o.userId === userId);
  },
  get(id: string): Order | undefined {
    return cache().find((o) => o.id === id);
  },
  async create(o: Omit<Order, "id" | "createdAt">): Promise<Order> {
    return api.post<Order>("/orders", o);
  },
  async update(id: string, patch: Partial<Order>): Promise<void> {
    await api.patch(`/orders/${id}`, patch);
  },
};

export function useUserOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>(() => (userId ? ordersStore.forUser(userId) : []));
  useEffect(() => {
    const refresh = () => setOrders(userId ? ordersStore.forUser(userId) : []);
    refresh();
    // Hydrate from API on mount (no-op when only mocks).
    if (userId) {
      void api.get<Order[]>("/orders", { userId }).then(refresh).catch(() => {});
    }
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [userId]);
  return orders;
}
