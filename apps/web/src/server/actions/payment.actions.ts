"use server";

import type { PaymentInitInput } from "@/lib/validators/payment";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export const initPayment = async (input: PaymentInitInput) => {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  // Placeholder for real gateway initialization
  return { ok: true, url: `/payment/mock?amount=${input.amount}&provider=${input.provider}` };
};

export const confirmPayment = async (paymentId: string) => {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return { ok: false, error: "Payment not found" };

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "SUCCESS" }
    });

    // In a real webhook, we would find the course ID associated with this payment 
    // from a stored reference or metadata, and then create the enrollment.

    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Failed to confirm payment" };
  }
};
