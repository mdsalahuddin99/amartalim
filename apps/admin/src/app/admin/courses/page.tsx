import { Metadata } from "next";
import PageClient from "./PageClient";
import { prisma } from "@/server/db/prisma";

export const metadata: Metadata = {
  title: "Courses | Amar Talim",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const dbCourses = await prisma.course.findMany({
    include: {
      category: true,
      instructor: true,
      lessons: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const dbCategories = await prisma.courseCategory.findMany();

  const courses = dbCourses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description || "",
    categoryId: c.categoryId,
    categoryName: c.category?.name || "Uncategorized",
    price: c.price,
    duration: "0",
    level: "শিক্ষানবিস" as const,
    instructor: c.instructor.name || "Unknown",
    instructorBio: "",
    thumbnail: c.thumbnail || "",
    whatYouLearn: [],
    whoIsFor: [],
    benefits: [],
    problems: [],
    lessonsCount: c.lessons.length,
    studentsCount: 0,
    rating: 0,
    lessons: c.lessons.map(l => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      description: l.description || "",
      youtubeId: l.videoId || "",
      duration: l.duration ? `${Math.floor(l.duration / 60)}:${l.duration % 60}` : "0:00",
      order: l.order,
    }))
  }));

  const categories = dbCategories.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon || "📁",
    courseCount: 0
  }));

  return <PageClient initialCourses={courses} initialCategories={categories} />;
}
