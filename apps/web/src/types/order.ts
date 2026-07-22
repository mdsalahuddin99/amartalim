/**
 * Commerce types — mirror future Prisma models.
 *
 * Order  → checkout outcome (one course = one order line for now)
 * Coupon → admin-managed discount codes (percent or flat)
 * Note   → per-user, per-lesson rich-text notes
 * QuizAttempt → graded submissions (already in mock-data; re-declared here
 *   with the migration-ready field names so the new store can be swapped 1:1)
 */
import type { PaymentProvider, PaymentStatus } from "@/server/payments";

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Order {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  provider: PaymentProvider;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trxId?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export type CouponKind = "PERCENT" | "FLAT";

export interface Coupon {
  code: string;
  kind: CouponKind;
  /** % when kind = PERCENT, taka when kind = FLAT */
  value: number;
  /** Optional cap on the discount amount (taka). */
  maxDiscount?: number;
  /** Optional minimum subtotal required. */
  minSubtotal?: number;
  /** Restrict to specific courses (empty = all). */
  courseIds?: string[];
  /** ISO date — coupon stops being valid after this. */
  expiresAt?: string;
  active: boolean;
}

export interface CouponResult {
  code: string;
  kind: CouponKind;
  value: number;
  /** Computed discount amount in taka, already capped. */
  discount: number;
}

export interface LessonNote {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  body: string;
  updatedAt: string;
}

export interface QuizAttemptRecord {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  score: number;
  total: number;
  passed: boolean;
  attemptedAt: string;
}
