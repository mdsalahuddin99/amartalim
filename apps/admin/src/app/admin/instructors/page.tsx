import { Metadata } from "next";
import PageClient from "./PageClient";
import { prisma } from "@/server/db/prisma";

export const metadata: Metadata = {
  title: "Instructors | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const dbInstructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR", deletedAt: null },
    include: {
      courses: {
        where: { deletedAt: null },
        select: { price: true, studentCount: true, rating: true }
      },
      roleApplications: {
        where: { role: "INSTRUCTOR", status: "APPROVED" },
        take: 1
      }
    }
  });

  const instructors = dbInstructors.map(user => {
    const totalCourses = user.courses.length;
    const totalStudents = user.courses.reduce((sum, c) => sum + c.studentCount, 0);
    const totalEarnings = user.courses.reduce((sum, c) => sum + ((c.price || 0) * c.studentCount), 0);
    const app = user.roleApplications[0];

    const validRatings = user.courses.map(c => c.rating).filter((r): r is number => r !== null);
    const averageRating = validRatings.length > 0
      ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1)
      : "—";

    return {
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      bio: app?.bio || "No bio available",
      totalStudents,
      totalCourses,
      totalEarnings,
      status: "active" as const,
      joinedAt: new Date(user.createdAt).toLocaleDateString("bn-BD"),
      specialization: app?.expertise?.[0] || "General",
      rating: averageRating,
    };
  });

  return <PageClient initialInstructors={instructors} />;
}
