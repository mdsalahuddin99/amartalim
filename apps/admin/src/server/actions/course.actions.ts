"use server";

import type { CourseCreateInput, LessonCreateInput } from "@/lib/validators/course";
import { courseCreateSchema, lessonCreateSchema } from "@/lib/validators/course";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export const createCourse = async (input: CourseCreateInput): Promise<ActionResult<{ id: string }>> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = courseCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const d = parsed.data;
    const course = await prisma.course.create({
      data: {
        title: d.title,
        slug: d.slug,
        description: d.description,
        thumbnail: d.thumbnail,
        price: d.price,
        categoryId: d.categoryId,
        published: d.published,
        instructorId: session.user.id,
      },
    });
    return { ok: true, data: { id: course.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create course" };
  }
};

export const createLesson = async (input: LessonCreateInput): Promise<ActionResult<{ id: string }>> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = lessonCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const d = parsed.data;
    
    // Check if user owns the course (or is admin)
    const course = await prisma.course.findUnique({ where: { id: d.courseId } });
    if (!course) return { ok: false, error: "Course not found" };
    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return { ok: false, error: "Unauthorized" };
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId: d.courseId,
        title: d.title,
        description: d.description,
        videoId: d.videoId,
        duration: d.duration,
        order: d.order,
        isFreePreview: d.isFreePreview,
      },
    });
    return { ok: true, data: { id: lesson.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create lesson" };
  }
};
