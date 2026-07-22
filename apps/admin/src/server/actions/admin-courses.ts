"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";

export async function createCourse(data: {
  title: string;
  description: string;
  categoryId: string;
  price: number;
}) {
  const firstInstructor = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });
  if (!firstInstructor) throw new Error("No instructor found");

  const course = await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      price: data.price,
      slug: data.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(),
      instructorId: firstInstructor.id,
    }
  });
  revalidatePath("/admin/courses");
  return course.id;
}

export async function updateCourse(id: string, data: any) {
  await prisma.course.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      price: data.price,
      thumbnail: data.thumbnail,
    }
  });
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteCourse(id: string) {
  await prisma.course.update({
    where: { id },
    data: { deletedAt: new Date() } // Soft delete
  });
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function createLesson(data: {
  courseId: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  order: number;
}) {
  await prisma.lesson.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      videoId: data.youtubeId,
      // parsing duration naive string like "12:30" to seconds
      duration: data.duration ? (parseInt(data.duration.split(":")[0] || "0") * 60 + parseInt(data.duration.split(":")[1] || "0")) : 0,
      order: data.order,
    }
  });
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateLesson(id: string, data: any) {
  await prisma.lesson.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      videoId: data.youtubeId,
    }
  });
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteLesson(id: string) {
  await prisma.lesson.delete({
    where: { id }
  });
  revalidatePath("/admin/courses");
  return { success: true };
}
