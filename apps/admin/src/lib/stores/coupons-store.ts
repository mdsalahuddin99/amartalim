"use client";
import { useEffect, useState } from "react";
import type { Coupon, CouponResult } from "@/types/order";
import { driver, driverEvent } from "@/lib/data-driver";
import { api } from "@/lib/api-client";

/**
 * Coupon catalog — backend-ready.
 * Reads sync via `driver`; admin mutations through `api.*` → `/coupons` mock.
 * Validation (`apply`) stays local for instant checkout UX; on Next.js it
 * becomes a `POST /coupons/apply` round-trip.
 */
const RES = "coupons";
const EVT = driverEvent(RES);

const SEED: Coupon[] = [
  { code: "WELCOME10", kind: "PERCENT", value: 10, maxDiscount: 500, active: true },
  { code: "RAMADAN25", kind: "PERCENT", value: 25, minSubtotal: 1000, active: true },
  { code: "FLAT200", kind: "FLAT", value: 200, minSubtotal: 1500, active: true },
];

const cache = (): Coupon[] => {
  const list = driver.list<Coupon>(RES);
  if (list.length === 0 && typeof window !== "undefined") {
    driver.save(RES, SEED);
    return SEED;
  }
  return list;
};

export const couponsStore = {
  all(): Coupon[] {
    return cache();
  },
  upsert(c: Coupon) {
    void api.post("/coupons", c).catch(() => {});
  },
  remove(code: string) {
    void api.del(`/coupons/${code}`).catch(() => {});
  },
  /** Local validate + compute discount — synchronous for instant UX. */
  apply(
    code: string,
    courseId: string,
    subtotal: number,
  ): { ok: true; data: CouponResult } | { ok: false; error: string } {
    const c = cache().find((x) => x.code === code.toUpperCase());
    if (!c) return { ok: false, error: "এই কুপন কোডটি বৈধ নয়।" };
    if (!c.active) return { ok: false, error: "এই কুপনটি এখন সক্রিয় নেই।" };
    if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) {
      return { ok: false, error: "এই কুপনের মেয়াদ শেষ হয়েছে।" };
    }
    if (c.courseIds && c.courseIds.length > 0 && !c.courseIds.includes(courseId)) {
      return { ok: false, error: "এই কুপন এই কোর্সে প্রযোজ্য নয়।" };
    }
    if (c.minSubtotal && subtotal < c.minSubtotal) {
      return {
        ok: false,
        error: `সর্বনিম্ন ৳${c.minSubtotal.toLocaleString("bn-BD")} এর অর্ডারে প্রযোজ্য।`,
      };
    }
    let discount = c.kind === "PERCENT" ? Math.round((subtotal * c.value) / 100) : c.value;
    if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
    discount = Math.min(discount, subtotal);
    return { ok: true, data: { code: c.code, kind: c.kind, value: c.value, discount } };
  },
};

export function useCoupons() {
  const [items, setItems] = useState<Coupon[]>(() => cache());
  useEffect(() => {
    const refresh = () => setItems(cache());
    refresh();
    return driver.subscribe(RES, refresh);
  }, []);
  void EVT;
  return items;
}
