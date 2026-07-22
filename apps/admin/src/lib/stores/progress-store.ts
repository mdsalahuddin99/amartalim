"use client";
import { useEffect, useState } from "react";
import type { QuizAttemptRecord } from "@/types/order";
import { api } from "@/lib/api-client";
import { driver, driverEvent } from "@/lib/data-driver";

/**
 * Per-user course progress + quiz attempts — backend-ready.
 *
 * Reads return synchronously from the shared `driver` cache.
 * Mutations go through `api.*` → `/progress` and `/quiz-attempts` mocks.
 * Post-migration → Prisma `Enrollment.completedLessons[]` + `QuizAttempt`.
 */
const PROGRESS_RES = "progress";
const ATTEMPTS_RES = "quiz-attempts";
const PROGRESS_EVT = driverEvent(PROGRESS_RES);
const ATTEMPTS_EVT = driverEvent(ATTEMPTS_RES);

interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  updatedAt: string;
}

const readProgress = () => driver.list<CourseProgress>(PROGRESS_RES);
const readAttempts = () => driver.list<QuizAttemptRecord>(ATTEMPTS_RES);

export const progressStore = {
  forCourse(userId: string, courseId: string): CourseProgress | undefined {
    return readProgress().find((p) => p.userId === userId && p.courseId === courseId);
  },
  forUser(userId: string): CourseProgress[] {
    return readProgress().filter((p) => p.userId === userId);
  },
  isComplete(userId: string, courseId: string, lessonId: string): boolean {
    return !!progressStore.forCourse(userId, courseId)?.completedLessons.includes(lessonId);
  },
  /** Sync legacy toggle — fires API call in background, optimistic state is reflected on next driver event. */
  toggleLesson(userId: string, courseId: string, lessonId: string): boolean {
    const cur = progressStore.forCourse(userId, courseId);
    const willBeComplete = !cur?.completedLessons.includes(lessonId);
    void api.post("/progress/toggle", { userId, courseId, lessonId }).catch(() => {});
    return willBeComplete;
  },
};

export const attemptsStore = {
  forUser(userId: string): QuizAttemptRecord[] {
    return readAttempts()
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());
  },
  /** Sync legacy record — returns a provisional record while api persists in background. */
  record(input: Omit<QuizAttemptRecord, "id" | "attemptedAt">): QuizAttemptRecord {
    const rec: QuizAttemptRecord = {
      ...input,
      id: `qa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      attemptedAt: new Date().toISOString(),
    };
    void api.post("/quiz-attempts", rec).catch(() => {});
    return rec;
  },
};

export function useCourseProgress(userId: string | undefined, courseId: string) {
  const [list, setList] = useState<string[]>(
    () => (userId ? progressStore.forCourse(userId, courseId)?.completedLessons ?? [] : []),
  );
  useEffect(() => {
    const refresh = () =>
      setList(userId ? progressStore.forCourse(userId, courseId)?.completedLessons ?? [] : []);
    refresh();
    return driver.subscribe(PROGRESS_RES, refresh);
  }, [userId, courseId]);
  void PROGRESS_EVT;
  return list;
}

export function useUserProgress(userId: string | undefined) {
  const [rows, setRows] = useState<CourseProgress[]>(
    () => (userId ? progressStore.forUser(userId) : []),
  );
  useEffect(() => {
    const refresh = () => setRows(userId ? progressStore.forUser(userId) : []);
    refresh();
    return driver.subscribe(PROGRESS_RES, refresh);
  }, [userId]);
  return rows;
}

export function useUserQuizAttempts(userId: string | undefined) {
  const [rows, setRows] = useState<QuizAttemptRecord[]>(
    () => (userId ? attemptsStore.forUser(userId) : []),
  );
  useEffect(() => {
    const refresh = () => setRows(userId ? attemptsStore.forUser(userId) : []);
    refresh();
    return driver.subscribe(ATTEMPTS_RES, refresh);
  }, [userId]);
  void ATTEMPTS_EVT;
  return rows;
}
