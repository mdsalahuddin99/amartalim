"use client";
import { useEffect, useState } from "react";
import type { Order } from "@/types/order";
import { getUserOrders } from "@/server/actions/order.actions";

export const ordersStore = {
  forUser(userId: string): Order[] {
    return [];
  },
  get(id: string): Order | undefined {
    return undefined;
  },
  async create(o: Omit<Order, "id" | "createdAt">): Promise<Order | null> {
    // Checkout uses createCheckoutOrder in server actions now
    return null;
  },
  async update(id: string, patch: Partial<Order>): Promise<void> {
    // Update uses payment webhooks
  },
};

export function useUserOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    if (!userId) return;
    getUserOrders().then((res) => {
      if (res.ok && Array.isArray(res.data)) {
        const mapped = res.data.map((o: any) => ({
          ...o,
          userId,
          subtotal: o.total + o.discount,
          paymentStatus: o.status,
        } as Order));
        setOrders(mapped);
      }
    });
  }, [userId]);
  return orders;
}
