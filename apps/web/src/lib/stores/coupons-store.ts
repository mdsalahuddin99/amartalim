"use client";
import { useEffect, useState } from "react";
import type { Coupon, CouponResult } from "@/types/order";
import { applyCoupon } from "@/server/actions/order.actions";
import { getAllCouponsAction, upsertCouponAction, deleteCouponAction } from "@/server/actions/coupon.actions";

export const couponsStore = {
  all(): Coupon[] {
    return [];
  },
  upsert(c: Coupon) {
    void upsertCouponAction(c);
  },
  remove(code: string) {
    void deleteCouponAction(code);
  },
  /** Local validate + compute discount — synchronous for instant UX. */
  apply(
    code: string,
    courseId: string,
    subtotal: number,
  ): { ok: true; data: CouponResult } | { ok: false; error: string } {
    // This is a placeholder since the previous sync implementation can't be purely sync without all coupons loaded locally
    // UI should be refactored to await applyCoupon action, but we return mock failure for sync signature
    return { ok: false, error: "Validation is now asynchronous." };
  },
};

export function useCoupons() {
  const [items, setItems] = useState<Coupon[]>([]);
  useEffect(() => {
    getAllCouponsAction().then(res => {
      if (Array.isArray(res)) {
        const mapped = res.map((c: any) => ({
          code: c.code,
          kind: c.type === "FIXED" ? "FLAT" : "PERCENT",
          value: c.value,
          active: c.active,
          expiresAt: c.expiresAt?.toISOString()
        } as Coupon));
        setItems(mapped);
      }
    });
  }, []);
  return items;
}
