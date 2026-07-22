import { z } from "zod";

export const couponApplySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "কোডটি খুব ছোট")
    .max(40, "কোডটি খুব বড়")
    .transform((s) => s.toUpperCase()),
  courseId: z.string().min(1),
  subtotal: z.number().int().nonnegative(),
});

export const checkoutCreateSchema = z.object({
  courseId: z.string().min(1),
  provider: z.enum(["BKASH", "NAGAD"]),
  couponCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
});

export type CouponApplyInput = z.infer<typeof couponApplySchema>;
export type CheckoutCreateInput = z.infer<typeof checkoutCreateSchema>;
