"use client";
import { useEffect, useState } from "react";
import type { QuizAttemptRecord } from "@/types/order";
import { toggleLessonComplete, recordQuizAttempt, getUserProgressAction, getUserQuizAttemptsAction } from "@/server/actions/progress.actions";

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  updatedAt: string;
}

export const progressStore = {
  // Legacy toggle used in some places (now async)
  toggleLesson(userId: string, courseId: string, lessonId: string): boolean {
    void toggleLessonComplete(userId, courseId, lessonId);
    return true; // Optimistic return not truly reliable without awaiting, but keeps signature
  },
};

export const attemptsStore = {
  // Legacy record used in some places (now async)
  record(input: any): any {
    void recordQuizAttempt(null, input);
    return input;
  },
};

/**
 * @deprecated This store is obsolete and replaced by Prisma Server Actions in Batch 2.
 * Kept temporarily for reference.
 */
export function useCourseProgress(userId: string | undefined, courseId: string) {
  return [];
}

/**
 * @deprecated This store is obsolete and replaced by Prisma Server Actions in Batch 2.
 * Kept temporarily for reference.
 */
export function useUserProgress(userId: string | undefined) {
  return [];
}

/**
 * @deprecated This store is obsolete and replaced by Prisma Server Actions in Batch 2.
 * Kept temporarily for reference.
 */
export function useUserQuizAttempts(userId: string | undefined) {
  return [];
}
