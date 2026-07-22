"use server";

import { prisma } from "@/server/db/prisma";
import { PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAdminOrders() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      enrollments: {
        include: {
          course: {
            select: { title: true },
          }
        }
      }
    }
  });

  return payments.map(p => {
    // Determine course title (if they bought multiple, join them or pick first)
    const courseTitle = p.enrollments.length > 0 
      ? p.enrollments.map(e => e.course.title).join(", ") 
      : "অজানা কোর্স";
      
    // In our simplified mock, we had subtotal, discount etc. 
    // For real data, we might extract them from `meta` JSON if present, otherwise just use amount.
    const meta = typeof p.meta === 'object' && p.meta !== null ? p.meta as any : {};
    
    return {
      id: p.id,
      courseTitle,
      provider: p.provider,
      total: Number(p.amount) || 0,
      subtotal: Number(meta.subtotal) || Number(p.amount) || 0,
      discount: Number(meta.discount) || 0,
      couponCode: meta.couponCode || null,
      createdAt: p.createdAt.toISOString(),
      status: p.status === "SUCCESS" ? "PAID" : p.status,
      trxId: p.trxId || "",
      userId: p.user ? `${p.user.name || 'Student'} (${p.user.email})` : p.userId,
      paidAt: p.status === "SUCCESS" ? p.updatedAt.toISOString() : null, // Approx paidAt
    };
  });
}

export async function updateOrderStatus(id: string, status: string) {
  const dbStatus = status === "PAID" ? "SUCCESS" : (status as PaymentStatus);
  await prisma.payment.update({
    where: { id },
    data: { status: dbStatus }
  });
  revalidatePath("/admin/orders");
  return { success: true };
}
