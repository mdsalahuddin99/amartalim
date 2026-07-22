"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export async function getAllCouponsAction() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return [];
  
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { courses: true }
  });
}

export async function upsertCouponAction(data: any) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    const { code, type, value, minOrderAmount, maxRedemptions, expiresAt, active } = data;
    const existing = await prisma.coupon.findUnique({ where: { code } });
    
    if (existing) {
      await prisma.coupon.update({
        where: { code },
        data: {
          type,
          value,
          minOrderAmount,
          maxRedemptions,
          expiresAt,
          active
        }
      });
    } else {
      await prisma.coupon.create({
        data: {
          code,
          type,
          value,
          minOrderAmount,
          maxRedemptions,
          expiresAt,
          active,
          scope: "ALL_COURSES"
        }
      });
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Failed to save coupon" };
  }
}

export async function deleteCouponAction(code: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };
  
  try {
    await prisma.coupon.delete({ where: { code } });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Failed to delete coupon" };
  }
}
