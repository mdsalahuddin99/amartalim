import { prisma } from "../db/prisma";
import { unstable_cache } from "next/cache";

export const getPublishedCourses = unstable_cache(
  async () => {
    return await prisma.course.findMany({
      where: { published: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        instructor: {
          select: { id: true, name: true, image: true } // User model has these
        }
      }
    });
  },
  ["published-courses"],
  { revalidate: 3600, tags: ["courses"] }
);

export const getCourseCategories = unstable_cache(
  async () => {
    return await prisma.courseCategory.findMany({
      orderBy: { name: "asc" }
    });
  },
  ["course-categories"],
  { revalidate: 3600, tags: ["course-categories"] }
);

export const getCourseWithLessons = unstable_cache(
  async (courseId: string) => {
    return await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: "asc" }
        },
        category: true,
        instructor: {
          select: { id: true, name: true, image: true }
        }
      }
    });
  },
  ["course-with-lessons"],
  { revalidate: 3600, tags: ["courses"] }
);
