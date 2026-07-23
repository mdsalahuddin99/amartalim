"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

const isAdminOrInstructor = async () => {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    throw new Error("Unauthorized");
  }
  return session.user;
};

// ==========================================
// COURSES
// ==========================================
export async function getAdminCourses() {
  const user = await isAdminOrInstructor();
  const where = user.role === "ADMIN" ? {} : { instructorId: user.id };
  return prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminAllData() {
  const user = await isAdminOrInstructor();
  const where = user.role === "ADMIN" ? {} : { instructorId: user.id };
  const courses = await prisma.course.findMany({ where, orderBy: { createdAt: "desc" } });
  const courseIds = courses.map(c => c.id);
  const topics = await prisma.topic.findMany({ where: { courseId: { in: courseIds } } });
  const lessons = await prisma.lesson.findMany({ where: { courseId: { in: courseIds } } });
  const quizzes = await prisma.quiz.findMany({ where: { courseId: { in: courseIds } } });
  const assignments = await prisma.assignment.findMany({ where: { courseId: { in: courseIds } } });
  const quizQuestions = await prisma.quizQuestion.findMany({ where: { quizId: { in: quizzes.map(q => q.id) } } });
  const categories = await prisma.courseCategory.findMany();
  
  return { courses, topics, lessons, quizzes, assignments, quizQuestions, categories };
}

export async function createAdminCourse(data: any) {
  const user = await isAdminOrInstructor();
  
  const createData: any = {
    title: data.title || "নতুন কোর্স",
    slug: data.slug || `course-${Date.now()}`,
    description: data.description || "",
    instructorId: user.id,
  };

  if (data.thumbnail !== undefined) createData.thumbnail = data.thumbnail;
  if (data.price !== undefined) createData.price = data.price;
  if (data.currency !== undefined) createData.currency = data.currency;
  if (data.published !== undefined) createData.published = data.published;
  if (data.categoryId !== undefined) createData.categoryId = data.categoryId;

  return prisma.course.create({ data: createData });
}

export async function updateAdminCourse(id: string, data: any) {
  await isAdminOrInstructor();
  
  const updateData: any = {};
  const fields = [
    "title", "slug", "description", "thumbnail", "price", "currency", 
    "published", "studentCount", "rating", "reviewCount", "organizationId", 
    "categoryId"
  ];
  
  for (const field of fields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  return prisma.course.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteAdminCourse(id: string) {
  await isAdminOrInstructor();
  return prisma.course.delete({ where: { id } });
}

// ==========================================
// TOPICS
// ==========================================
export async function getCourseTopics(courseId: string) {
  return prisma.topic.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
}

export async function createTopic(data: { courseId: string; title: string; summary?: string; order: number }) {
  await isAdminOrInstructor();
  return prisma.topic.create({ data });
}

export async function updateTopic(id: string, data: any) {
  await isAdminOrInstructor();
  return prisma.topic.update({ where: { id }, data });
}

export async function deleteTopic(id: string) {
  await isAdminOrInstructor();
  return prisma.topic.delete({ where: { id } });
}

export async function reorderTopics(courseId: string, orderedIds: string[]) {
  await isAdminOrInstructor();
  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.topic.update({
      where: { id: orderedIds[i] },
      data: { order: i + 1 },
    });
  }
  return { ok: true };
}

// ==========================================
// LESSONS
// ==========================================
export async function getCourseLessons(courseId: string) {
  return prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
}

export async function createLesson(data: { courseId: string; topicId: string; title: string; description?: string; youtubeId?: string; duration?: string; order: number; contentType?: string; body?: string; isPreview?: boolean; dripDays?: number }) {
  await isAdminOrInstructor();
  return prisma.lesson.create({ data: {
    courseId: data.courseId,
    topicId: data.topicId,
    title: data.title,
    description: data.description,
    videoId: data.youtubeId,
    duration: data.duration ? parseInt(data.duration) : null,
    order: data.order,
    isFreePreview: data.isPreview,
  }});
}

export async function updateLesson(id: string, data: any) {
  await isAdminOrInstructor();
  return prisma.lesson.update({ where: { id }, data });
}

export async function deleteLesson(id: string) {
  await isAdminOrInstructor();
  return prisma.lesson.delete({ where: { id } });
}

// ==========================================
// QUIZZES
// ==========================================
export async function getCourseQuizzes(courseId: string) {
  return prisma.quiz.findMany({
    where: { courseId },
  });
}

export async function createQuiz(data: { courseId: string; topicId: string; title: string; timeLimit?: number; passingScore?: number; attempts?: number; order: number }) {
  await isAdminOrInstructor();
  return prisma.quiz.create({
    data: {
      courseId: data.courseId,
      topicId: data.topicId,
      title: data.title,
      timeLimit: data.timeLimit,
      passScore: data.passingScore || 70,
      maxAttempts: data.attempts,
    }
  });
}

export async function updateQuiz(id: string, data: any) {
  await isAdminOrInstructor();
  return prisma.quiz.update({ where: { id }, data });
}

export async function deleteQuiz(id: string) {
  await isAdminOrInstructor();
  return prisma.quiz.delete({ where: { id } });
}

// ==========================================
// ASSIGNMENTS
// ==========================================
export async function getCourseAssignments(courseId: string) {
  return prisma.assignment.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
}

export async function createAssignment(data: { courseId: string; topicId: string; title: string; instructions?: string; maxPoints?: number; dueDays?: number; order: number }) {
  await isAdminOrInstructor();
  return prisma.assignment.create({ data });
}

export async function updateAssignment(id: string, data: any) {
  await isAdminOrInstructor();
  return prisma.assignment.update({ where: { id }, data });
}

export async function deleteAssignment(id: string) {
  await isAdminOrInstructor();
  return prisma.assignment.delete({ where: { id } });
}

// ==========================================
// REORDER & MOVE ITEMS (Lessons, Quizzes, Assignments)
// ==========================================
export async function reorderTopicItemsAction(topicId: string, items: { id: string; kind: "lesson" | "quiz" | "assignment" }[]) {
  await isAdminOrInstructor();
  for (let i = 0; i < items.length; i++) {
    const order = i + 1;
    const it = items[i];
    if (it.kind === "lesson") {
      await prisma.lesson.update({ where: { id: it.id }, data: { order, topicId } });
    } else if (it.kind === "quiz") {
      await prisma.quiz.update({ where: { id: it.id }, data: { topicId } });
    } else if (it.kind === "assignment") {
      await prisma.assignment.update({ where: { id: it.id }, data: { order, topicId } });
    }
  }
  return { ok: true };
}

// ==========================================
// QUIZ QUESTIONS
// ==========================================
export async function getQuizQuestions(quizId: string) {
  return prisma.quizQuestion.findMany({
    where: { quizId },
    orderBy: { order: "asc" },
  });
}

export async function createQuizQuestion(data: any) {
  await isAdminOrInstructor();
  return prisma.quizQuestion.create({ data });
}

export async function updateQuizQuestion(id: string, data: any) {
  await isAdminOrInstructor();
  return prisma.quizQuestion.update({ where: { id }, data });
}

export async function deleteQuizQuestion(id: string) {
  await isAdminOrInstructor();
  return prisma.quizQuestion.delete({ where: { id } });
}
