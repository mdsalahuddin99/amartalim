"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function toggleLessonComplete(
  // @ts-ignore - keeping signature compatible with existing frontend calls
  _user: any,
  courseId: string,
  lessonId: string,
  lessonTitle?: string,
): Promise<ActionResult<{ completed: boolean }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "লগইন প্রয়োজন।" };
  
  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } }
  });

  if (progress) {
    const updated = await prisma.progress.update({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      data: { completed: !progress.completed }
    });
    return { ok: true, data: { completed: updated.completed } };
  }

  const created = await prisma.progress.create({
    data: { userId: session.user.id, lessonId, completed: true }
  });
  return { ok: true, data: { completed: created.completed } };
}

export async function recordQuizAttempt(
  // @ts-ignore
  _user: any,
  payload: any,
): Promise<ActionResult<any>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "লগইন প্রয়োজন।" };
  
  try {
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId: payload.quizId,
        score: payload.score,
        maxScore: payload.maxScore ?? 100,
        percentage: payload.percentage ?? payload.score,
        passed: payload.passed,
        attemptNo: payload.attemptNo ?? 1,
        status: "SUBMITTED",
        submittedAt: new Date(),
        answers: payload.answers ?? {},
      }
    });
    return { ok: true, data: attempt };
  } catch (err) {
    return { ok: false, error: "Failed to record quiz attempt." };
  }
}
