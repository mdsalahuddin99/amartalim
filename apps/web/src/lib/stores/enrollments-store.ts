"use client";
import { useEffect, useState } from "react";
import type { EnrollmentRecord } from "@/types/enrollment";
import { enrollUserInCourse, getUserEnrollmentAction, getUserEnrollmentsAction } from "@/server/actions/enrollment.actions";

export const enrollmentsStore = {
  async create(input: any): Promise<EnrollmentRecord> {
    const res = await enrollUserInCourse(input.userId, input.courseId, input.paymentId);
    return res as unknown as EnrollmentRecord;
  },
  async remove(id: string): Promise<void> {
    // In Prisma, we usually don't delete enrollments, but you can implement this if needed.
  },
};

/**
 * @deprecated This store is obsolete and replaced by Prisma Server Actions in Batch 2.
 * Kept temporarily for reference.
 */
export function useUserEnrollments(userId: string | undefined) {
  return [];
}

/**
 * @deprecated This store is obsolete and replaced by Prisma Server Actions in Batch 2.
 * Kept temporarily for reference.
 */
export function useEnrollment(userId: string | undefined, courseId: string | undefined) {
  return null;
}
