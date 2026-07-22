/**
 * Instructor public-profile queries.
 *
 * UI today reads from `src/lib/mock-data.ts`. After the Next.js + Prisma
 * migration these become real DB calls — same shape, so pages don't change.
 *
 *   getInstructorBySlug → prisma.user.findFirst({ where: { role: 'INSTRUCTOR', slug } })
 *   getInstructorCourses → prisma.course.findMany({ where: { instructorId, published: true } })
 */
import { prisma } from "../db/prisma";
import { slugify } from "@/lib/slugify";
import { unstable_cache } from "next/cache";

export interface InstructorPublic {
  id: string;
  slug: string;
  name: string;
  bio: string;
  avatar?: string | null;
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
}

export const listInstructors = unstable_cache(
  async (): Promise<InstructorPublic[]> => {
    const instructors = await prisma.user.findMany({
      where: { role: "INSTRUCTOR", deletedAt: null },
      include: {
        courses: {
          where: { published: true, deletedAt: null },
        }
      }
    });

    return instructors.map((user) => {
      const courses = user.courses;
      const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
      const totalRating = courses.reduce((sum, c) => sum + (c.rating || 0), 0);
      const averageRating = courses.length > 0 ? Number((totalRating / courses.length).toFixed(2)) : 0;
      
      return {
        id: user.id,
        slug: slugify(user.name || "instructor"),
        name: user.name || "Instructor",
        bio: "", // Users don't have bio field directly in this schema
        avatar: user.image,
        totalCourses: courses.length,
        totalStudents,
        averageRating,
      };
    });
  },
  ["instructors"],
  { revalidate: 3600, tags: ["instructors"] }
);

export const getInstructorBySlug = async (slug: string): Promise<InstructorPublic | null> => {
  const all = await listInstructors();
  return all.find((i) => i.slug === slug) ?? null;
};

export const getInstructorCourses = async (instructorId: string) => {
  return await prisma.course.findMany({
    where: { instructorId, published: true, deletedAt: null },
    include: { category: true }
  });
};
