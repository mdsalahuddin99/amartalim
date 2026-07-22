"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export const enrollUserInCourse = async (
  userId: string,
  courseId: string,
  paymentId?: string
) => {
  const session = await auth();
  if (!session?.user) throw new Error("লগইন প্রয়োজন।");
  // Security check: usually you'd only allow enrolling oneself or if Admin.
  if (session.user.id !== userId && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Prevent duplicate enrollment
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });
  if (existing) return existing;

  return prisma.enrollment.create({ 
    data: { userId, courseId, paymentId }
  });
};

export const markLessonComplete = async (userId: string, courseId: string, lessonId: string) => {
  const session = await auth();
  if (!session?.user) throw new Error("লগইন প্রয়োজন।");
  if (session.user.id !== userId) throw new Error("Unauthorized");

  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId } }
  });

  if (progress) {
    return prisma.progress.update({
      where: { userId_lessonId: { userId, lessonId } },
      data: { completed: !progress.completed }
    });
  }

  return prisma.progress.create({
    data: { userId, lessonId, completed: true }
  });
};
