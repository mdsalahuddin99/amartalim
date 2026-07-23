/**
 * Instructor public-profile queries.
 *
 * UI today reads from `src/lib/mock-data.ts`. After the Next.js + Prisma
 * migration these become real DB calls — same shape, so pages don't change.
 *
 *   getInstructorBySlug → prisma.user.findFirst({ where: { role: 'INSTRUCTOR', slug } })
 *   getInstructorCourses → prisma.course.findMany({ where: { instructorId, published: true } })
 */
import { courses, type Course } from "@/lib/seed/mock-data";
import { slugify } from "@/lib/slugify";

export interface InstructorPublic {
  slug: string;
  name: string;
  bio: string;
  avatar?: string | null;
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
}

/** Aggregate distinct instructors from the course list (mock-mode only). */
const buildInstructorIndex = (): Map<string, InstructorPublic> => {
  const index = new Map<string, { name: string; bio: string; courses: Course[] }>();
  for (const c of courses) {
    const slug = slugify(c.instructor);
    const existing = index.get(slug);
    if (existing) {
      existing.courses.push(c);
    } else {
      index.set(slug, { name: c.instructor, bio: c.instructorBio ?? "", courses: [c] });
    }
  }
  const out = new Map<string, InstructorPublic>();
  index.forEach(({ name, bio, courses: list }, slug) => {
    const totalStudents = list.reduce((s, c) => s + c.studentsCount, 0);
    const averageRating =
      list.reduce((s, c) => s + c.rating, 0) / Math.max(list.length, 1);
    out.set(slug, {
      slug,
      name,
      bio,
      avatar: null,
      totalCourses: list.length,
      totalStudents,
      averageRating: Number(averageRating.toFixed(2)),
    });
  });
  return out;
};

export const getInstructorBySlug = (slug: string): InstructorPublic | null =>
  buildInstructorIndex().get(slug) ?? null;

export const getInstructorCourses = (slug: string): Course[] =>
  courses.filter((c) => slugify(c.instructor) === slug);

export const listInstructors = (): InstructorPublic[] =>
  Array.from(buildInstructorIndex().values());
