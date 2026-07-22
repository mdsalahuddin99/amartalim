"use server";

import {
  couponApplySchema,
  checkoutCreateSchema,
  type CouponApplyInput,
  type CheckoutCreateInput,
} from "@/lib/validators/checkout";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import type { CouponResult } from "@/types/order";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function applyCoupon(
  input: CouponApplyInput,
): Promise<ActionResult<CouponResult>> {
  const parsed = couponApplySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "অবৈধ ইনপুট।" };
  }
  
  const coupon = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
    include: { courses: true }
  });

  if (!coupon || !coupon.active) return { ok: false, error: "কুপনটি সঠিক নয়।" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, error: "কুপনটির মেয়াদ শেষ।" };
  if (coupon.maxRedemptions && coupon.redeemedCount >= coupon.maxRedemptions) return { ok: false, error: "কুপনটি আর ব্যবহারযোগ্য নয়।" };
  if (coupon.minOrderAmount && parsed.data.subtotal < coupon.minOrderAmount) return { ok: false, error: `ন্যূনতম ৳${coupon.minOrderAmount} টাকার অর্ডার প্রয়োজন।` };
  
  if (coupon.scope === "SPECIFIC_COURSES") {
    if (!coupon.courses.some(c => c.id === parsed.data.courseId)) {
      return { ok: false, error: "এই কুপনটি এই কোর্সের জন্য প্রযোজ্য নয়।" };
    }
  }

  const discount = coupon.type === "FIXED" 
    ? Math.min(coupon.value, parsed.data.subtotal) 
    : Math.floor((parsed.data.subtotal * coupon.value) / 100);

  return { 
    ok: true, 
    data: { 
      code: coupon.code, 
      kind: coupon.type === "FIXED" ? "FLAT" : "PERCENT",
      value: coupon.value,
      discount 
    } 
  };
}

interface CreateOrderCourse {
  id: string;
  title: string;
  thumbnail?: string | null;
  price: number;
}

export async function createCheckoutOrder(
  // @ts-ignore
  _user: any,
  course: CreateOrderCourse,
  input: CheckoutCreateInput,
): Promise<ActionResult<any>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "চেকআউট করতে লগইন করুন।" };

  const parsed = checkoutCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "অবৈধ ইনপুট।" };
  }

  const subtotal = course.price;
  let discount = 0;
  let couponId: string | undefined;

  if (parsed.data.couponCode) {
    const cRes = await applyCoupon({ code: parsed.data.couponCode, courseId: course.id, subtotal });
    if (!cRes.ok) return cRes;
    discount = cRes.data.discount;
    const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data.couponCode } });
    if (coupon) couponId = coupon.id;
  }

  const total = Math.max(0, subtotal - discount);

  try {
    // Determine provider enum
    const providerMap: Record<string, any> = {
      bkash: "BKASH",
      nagad: "NAGAD"
    };

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: total,
        provider: providerMap[parsed.data.provider] || "BKASH",
        status: total === 0 ? "SUCCESS" : "PENDING",
        meta: { courseId: course.id, courseTitle: course.title, courseThumbnail: course.thumbnail },
      }
    });

    if (couponId) {
      await prisma.couponRedemption.create({
        data: {
          couponId,
          userId: session.user.id,
          paymentId: payment.id,
          discount
        }
      });
      await prisma.coupon.update({
        where: { id: couponId },
        data: { redeemedCount: { increment: 1 } }
      });
    }

    if (total === 0) {
      await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          courseId: course.id,
          paymentId: payment.id,
        }
      });
    }

    return { ok: true, data: payment };
  } catch (err) {
    return { ok: false, error: "Failed to create order." };
  }
}

export async function getUserOrders() {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  try {
    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: {
          include: {
            course: {
              select: { id: true, title: true, thumbnail: true }
            }
          }
        }
      }
    });

    const couponRedemptions = await prisma.couponRedemption.findMany({
      where: { paymentId: { in: payments.map(p => p.id) } },
      include: { coupon: { select: { code: true } } }
    });

    const orders = payments.map(payment => {
      const enrollment = payment.enrollments[0];
      const redemption = couponRedemptions.find(r => r.paymentId === payment.id);
      
      return {
        id: payment.id,
        status: payment.status,
        total: payment.amount,
        createdAt: payment.createdAt.toISOString(),
        provider: payment.provider,
        courseId: enrollment?.course?.id || (payment.meta as any)?.courseId || "",
        courseTitle: enrollment?.course?.title || (payment.meta as any)?.courseTitle || "Unknown Course",
        courseThumbnail: enrollment?.course?.thumbnail || (payment.meta as any)?.courseThumbnail || "",
        couponCode: redemption?.coupon?.code,
        discount: redemption?.discount || 0
      };
    });

    return { ok: true, data: orders };
  } catch (err) {
    return { ok: false, error: "Failed to fetch orders." };
  }
}

export async function getAdminOrders() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return [];

  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: {
          include: {
            course: {
              select: { id: true, title: true, thumbnail: true }
            }
          }
        }
      }
    });

    const couponRedemptions = await prisma.couponRedemption.findMany({
      where: { paymentId: { in: payments.map(p => p.id) } },
      include: { coupon: { select: { code: true } } }
    });

    const orders = payments.map(payment => {
      const enrollment = payment.enrollments[0];
      const redemption = couponRedemptions.find(r => r.paymentId === payment.id);
      
      return {
        id: payment.id,
        userId: payment.userId,
        status: payment.status,
        total: payment.amount,
        createdAt: payment.createdAt.toISOString(),
        provider: payment.provider,
        courseId: enrollment?.course?.id || (payment.meta as any)?.courseId || "",
        courseTitle: enrollment?.course?.title || (payment.meta as any)?.courseTitle || "Unknown Course",
        couponCode: redemption?.coupon?.code,
        discount: redemption?.discount || 0,
        subtotal: payment.amount + (redemption?.discount || 0),
        trxId: payment.trxId
      };
    });

    return orders;
  } catch (err) {
    return [];
  }
}

export async function updateOrderStatus(id: string, patch: any) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    const payment = await prisma.payment.update({
      where: { id },
      data: patch
    });

    if (patch.status === "PAID" || patch.status === "SUCCESS") {
      const meta = payment.meta as any;
      if (meta && meta.courseId) {
        const existing = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: payment.userId, courseId: meta.courseId } }
        });
        if (!existing) {
          await prisma.enrollment.create({
            data: { userId: payment.userId, courseId: meta.courseId, paymentId: payment.id }
          });
        }
      }
    } else if (patch.status === "REFUNDED" || patch.status === "FAILED") {
      const meta = payment.meta as any;
      if (meta && meta.courseId) {
        await prisma.enrollment.deleteMany({
          where: { userId: payment.userId, courseId: meta.courseId }
        });
      }
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Failed to update order status." };
  }
}
