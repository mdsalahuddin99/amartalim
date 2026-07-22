import { z } from "zod";

export const paymentInitSchema = z.object({
  provider: z.enum(["BKASH", "NAGAD"]),
  courseId: z.string(),
  amount: z.number().int().positive(),
});

export type PaymentInitInput = z.infer<typeof paymentInitSchema>;
