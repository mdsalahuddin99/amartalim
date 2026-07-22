import { Metadata } from "next";
import PageClient from "./PageClient";
import { prisma } from "@/server/db/prisma";

export const metadata: Metadata = {
  title: "Students | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const dbUsers = await prisma.user.findMany({
    where: { role: "STUDENT", deletedAt: null },
    include: {
      enrollments: {
        include: { course: true }
      },
      progress: true,
    }
  });

  const students = dbUsers.map(user => {
    // completed courses: naive check if they have progress and score/completed
    const completedCourses = user.progress.filter(p => p.completed).length;

    return {
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      status: "active" as const, // For now, all undeleted are active
      joinedAt: new Date(user.createdAt).toLocaleDateString("bn-BD"),
      enrolledCourses: user.enrollments.map(e => ({
        id: e.courseId,
        title: e.course?.title || "Unknown Course"
      })),
      completedCourses
    };
  });

  return <PageClient initialStudents={students} />;
}
