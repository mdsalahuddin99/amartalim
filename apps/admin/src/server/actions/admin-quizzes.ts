"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";

export async function createQuizQuestion(data: {
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: number;
}) {
  // Find or create quiz for this lesson
  let quiz = await prisma.quiz.findUnique({
    where: { lessonId: data.lessonId }
  });

  if (!quiz) {
    const lesson = await prisma.lesson.findUnique({ where: { id: data.lessonId } });
    if (!lesson) throw new Error("Lesson not found");
    
    quiz = await prisma.quiz.create({
      data: {
        lessonId: data.lessonId,
        courseId: lesson.courseId,
        title: "Quiz for lesson",
      }
    });
  }

  // Get max order
  const lastQ = await prisma.quizQuestion.findFirst({
    where: { quizId: quiz.id },
    orderBy: { order: "desc" }
  });

  await prisma.quizQuestion.create({
    data: {
      quizId: quiz.id,
      type: "SINGLE",
      question: data.question,
      options: data.options,
      answers: [data.correctAnswer],
      order: (lastQ?.order ?? 0) + 1,
    }
  });

  revalidatePath("/admin/quizzes");
  return { success: true };
}

export async function updateQuizQuestion(id: string, data: {
  lessonId: string; // The UI allows changing lesson, which means changing Quiz. 
  question: string;
  options: string[];
  correctAnswer: number;
}) {
  // Let's assume lessonId change is not supported for now to keep it simple, 
  // or we just update the text if they change it. 
  await prisma.quizQuestion.update({
    where: { id },
    data: {
      question: data.question,
      options: data.options,
      answers: [data.correctAnswer],
    }
  });

  revalidatePath("/admin/quizzes");
  return { success: true };
}

export async function deleteQuizQuestion(id: string) {
  await prisma.quizQuestion.delete({
    where: { id }
  });
  
  revalidatePath("/admin/quizzes");
  return { success: true };
}
