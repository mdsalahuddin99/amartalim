"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";

// ─── TOPICS ──────────────────────────────────────────────────────────────

export async function createTopic(courseId: string, title: string) {
  // Get max order
  const last = await prisma.courseTopic.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });
  const order = last ? last.order + 1 : 1;

  const topic = await prisma.courseTopic.create({
    data: {
      courseId,
      title,
      order,
    },
  });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/course-builder/${courseId}`);
  return { success: true, topic };
}

export async function updateTopic(id: string, title: string) {
  const topic = await prisma.courseTopic.update({
    where: { id },
    data: { title },
  });
  revalidatePath(`/admin/course-builder/${topic.courseId}`);
  return { success: true, topic };
}

export async function deleteTopic(id: string, courseId: string) {
  await prisma.courseTopic.delete({
    where: { id },
  });
  revalidatePath(`/admin/course-builder/${courseId}`);
  return { success: true };
}

export async function reorderTopics(courseId: string, topicIds: string[]) {
  // Assuming topicIds are in the correct new order
  await prisma.$transaction(
    topicIds.map((id, index) =>
      prisma.courseTopic.update({
        where: { id },
        data: { order: index + 1 },
      })
    )
  );
  revalidatePath(`/admin/course-builder/${courseId}`);
  return { success: true };
}

// ─── LESSONS ─────────────────────────────────────────────────────────────

export async function createLesson(data: {
  courseId: string;
  topicId: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  order: number;
}) {
  const durationSecs = data.duration
    ? parseInt(data.duration.split(":")[0] || "0") * 60 + parseInt(data.duration.split(":")[1] || "0")
    : 0;

  const lesson = await prisma.lesson.create({
    data: {
      courseId: data.courseId,
      topicId: data.topicId,
      title: data.title,
      description: data.description,
      videoId: data.youtubeId,
      duration: durationSecs,
      order: data.order,
    },
  });
  revalidatePath(`/admin/course-builder/${data.courseId}`);
  return { success: true, lesson };
}

export async function updateLesson(id: string, data: any) {
  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      videoId: data.youtubeId,
    },
  });
  revalidatePath(`/admin/course-builder/${lesson.courseId}`);
  return { success: true, lesson };
}

export async function deleteLesson(id: string, courseId: string) {
  await prisma.lesson.delete({
    where: { id },
  });
  revalidatePath(`/admin/course-builder/${courseId}`);
  return { success: true };
}

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────

export async function createAssignment(data: {
  courseId: string;
  topicId: string;
  title: string;
  description?: string;
  instructions?: string;
  totalMarks?: number;
  maxPoints?: number;
  passMarks?: number;
  dueDays?: number;
  order: number;
}) {
  const assignment = await prisma.assignment.create({
    data: {
      courseId: data.courseId,
      topicId: data.topicId,
      title: data.title,
      description: data.instructions || data.description || "",
      totalMarks: data.maxPoints || data.totalMarks || 100,
      passMarks: data.passMarks || 33,
      order: data.order,
    },
  });
  revalidatePath(`/admin/course-builder/${data.courseId}`);
  return { success: true, assignment };
}

export async function updateAssignment(id: string, data: any) {
  const assignment = await prisma.assignment.update({
    where: { id },
    data: {
      title: data.title,
      description: data.instructions || data.description,
      totalMarks: data.maxPoints || data.totalMarks,
      passMarks: data.passMarks,
    },
  });
  revalidatePath(`/admin/course-builder/${assignment.courseId}`);
  return { success: true, assignment };
}

export async function deleteAssignment(id: string, courseId: string) {
  await prisma.assignment.delete({
    where: { id },
  });
  revalidatePath(`/admin/course-builder/${courseId}`);
  return { success: true };
}

// ─── QUIZZES ─────────────────────────────────────────────────────────────

export async function createQuiz(data: {
  topicId: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
}) {
  const quiz = await prisma.quiz.create({
    data: {
      topicId: data.topicId,
      title: data.title,
      description: data.description,
      order: data.order,
      courseId: data.courseId,
    },
  });
  revalidatePath(`/admin/course-builder/${data.courseId}`);
  return { success: true, quiz };
}

export async function updateQuiz(id: string, data: any, courseId: string) {
  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
    },
  });
  revalidatePath(`/admin/course-builder/${courseId}`);
  return { success: true, quiz };
}

export async function deleteQuiz(id: string, courseId: string) {
  await prisma.quiz.delete({
    where: { id },
  });
  revalidatePath(`/admin/course-builder/${courseId}`);
  return { success: true };
}

// ─── GENERAL REORDER ─────────────────────────────────────────────────────

export async function reorderTopicItems(courseId: string, items: { id: string; type: "lesson" | "quiz" | "assignment"; order: number }[]) {
  // Execute updates for all items in parallel within a transaction
  await prisma.$transaction(
    items.map((item) => {
      if (item.type === "lesson") {
        return prisma.lesson.update({ where: { id: item.id }, data: { order: item.order } });
      } else if (item.type === "quiz") {
        return prisma.quiz.update({ where: { id: item.id }, data: { order: item.order } });
      } else if (item.type === "assignment") {
        return prisma.assignment.update({ where: { id: item.id }, data: { order: item.order } });
      }
      return prisma.lesson.findUnique({ where: { id: "" } }); // Dummy query for unknown type
    })
  );
  revalidatePath(`/admin/course-builder/${courseId}`);
  return { success: true };
}
