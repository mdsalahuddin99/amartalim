import { Metadata } from "next";
import PageClient from "./PageClient";

import { prisma } from "@/server/db/prisma";

export const metadata: Metadata = {
  title: "Quizzes | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const dbCourses = await prisma.course.findMany({
    where: { deletedAt: null },
    select: { id: true, title: true }
  });

  const dbLessons = await prisma.lesson.findMany({
    select: { id: true, courseId: true, title: true }
  });

  const dbQuestions = await prisma.quizQuestion.findMany({
    include: {
      quiz: {
        include: {
          lesson: true
        }
      }
    }
  });

  const quizQuestions = dbQuestions.map(q => ({
    id: q.id,
    lessonId: q.quiz.lessonId || "",
    question: q.question,
    options: q.options,
    correctAnswer: q.answers[0] ?? 0,
  }));

  return <PageClient initialCourses={dbCourses} initialLessons={dbLessons} initialQuestions={quizQuestions} />;
}
