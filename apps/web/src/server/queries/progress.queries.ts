import { prisma } from "../db/prisma";

export const getUserProgress = async (userId: string | undefined, courseId?: string) => {
  if (!userId) return [];
  
  if (courseId) {
    const enroll = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (!enroll) return [];

    const progress = await prisma.progress.findMany({
      where: {
        userId,
        lesson: { courseId },
        completed: true
      },
      select: { lessonId: true }
    });
    return progress.map(p => p.lessonId);
  } else {
    // If no courseId, return all completed lesson IDs for the user
    const progress = await prisma.progress.findMany({
      where: {
        userId,
        completed: true
      },
      select: { lessonId: true }
    });
    return progress.map(p => p.lessonId);
  }
};

export const getUserQuizAttempts = async (userId: string | undefined) => {
  if (!userId) return [];
  return await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" }
  });
};
