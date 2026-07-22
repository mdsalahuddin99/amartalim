"use server";

import { prisma } from "@/server/db/prisma";

export const getPublishedCourses = async () => {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        category: true,
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      categoryId: course.categoryId,
      categoryName: course.category?.name ?? "Uncategorized",
      lessonsCount: course._count.lessons,
      // map other fields as necessary
    }));
  } catch (error) {
    console.error("Failed to fetch published courses", error);
    return [];
  }
};

export const getPublishedCourse = async (courseId: string) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId, published: true },
      include: {
        category: true,
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      categoryId: course.categoryId,
      categoryName: course.category?.name ?? "Uncategorized",
      lessonsCount: course._count.lessons,
    };
  } catch (error) {
    console.error("Failed to fetch course", error);
    return null;
  }
};

export const getPublishedLessons = async () => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { course: { published: true } },
      orderBy: { order: "asc" },
      select: { id: true, courseId: true, title: true }
    });
    return lessons;
  } catch (error) {
    console.error("Failed to fetch published lessons", error);
    return [];
  }
};

export const getCourseLessons = async (courseId: string) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        quiz: true,
      },
    });
    
    return lessons.map(lesson => ({
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      videoId: lesson.videoId,
      youtubeId: lesson.videoId, // map videoId to youtubeId to match old store
      duration: lesson.duration?.toString() || "0", // store uses string
      order: lesson.order,
      hasQuiz: !!lesson.quiz,
    }));
  } catch (error) {
    console.error("Failed to fetch course lessons", error);
    return [];
  }
};

export const getLessonDetails = async (lessonId: string) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) return null;
    
    return {
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      videoId: lesson.videoId,
      youtubeId: lesson.videoId, // map for backward compatibility
      duration: lesson.duration?.toString() || "0",
      order: lesson.order,
    };
  } catch (error) {
    console.error("Failed to fetch lesson details", error);
    return null;
  }
};

export const getLessonQuiz = async (lessonId: string) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });
    
    if (!quiz) return null;
    
    return {
      id: quiz.id,
      lessonId: quiz.lessonId,
      title: quiz.title,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passScore,
      questions: quiz.questions.map(q => ({
        id: q.id,
        lessonId: quiz.lessonId,
        question: q.question,
        options: q.options,
        correctAnswer: q.answers[0] || 0, // Mock data uses singular correctAnswer for MCQ
        type: q.type,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch quiz details", error);
    return null;
  }
};
