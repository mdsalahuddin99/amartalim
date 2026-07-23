import { Metadata } from "next";
import PageClient from "./PageClient";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Course Builder | Amar Talim",
};

export default async function Page({ params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      topics: {
        include: {
          lessons: true,
          quizzes: { include: { questions: true } },
          assignments: true,
        },
      },
    },
  });

  const categories = await prisma.courseCategory.findMany();

  if (!course) {
    redirect("/admin/courses");
  }

  return <PageClient initialCourse={course} categories={categories} />;
}
