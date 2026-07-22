import { prisma } from "../db/prisma";

export const getDashboardData = async (userId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          category: true,
          lessons: { orderBy: { order: "asc" } }
        }
      }
    }
  });

  const progress = await prisma.progress.findMany({
    where: { userId, completed: true }
  });

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        include: { lesson: { include: { course: true } } }
      }
    },
    orderBy: { startedAt: "desc" },
    take: 10
  });

  const applications = await prisma.roleApplication.findMany({
    where: { userId }
  });

  return { enrollments, progress, attempts, applications };
};

const POINTS_PER_LESSON = 10;
const POINTS_PER_ENROLLMENT = 5;

export const getLeaderboard = async (limit: number = 100) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      progress: { where: { completed: true }, select: { lessonId: true } },
      enrollments: { select: { courseId: true } },
      quizAttempts: { select: { lessonId: true, score: true, maxScore: true } }
    }
  });

  const rows = users.map(user => {
    let points = 0;
    
    // Lessons
    const lessons = user.progress.length;
    points += lessons * POINTS_PER_LESSON;

    // Enrollments
    const enrolled = user.enrollments.length;
    points += enrolled * POINTS_PER_ENROLLMENT;

    // Quizzes (best score per lesson)
    let quizzes = 0;
    const bestByQuiz = new Map<string, number>();
    user.quizAttempts.forEach(a => {
      const pct = a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0;
      bestByQuiz.set(a.lessonId, Math.max(bestByQuiz.get(a.lessonId) ?? 0, pct));
    });
    bestByQuiz.forEach(pct => {
      quizzes += 1;
      points += Math.round(pct / 2);
    });

    return {
      userId: user.id,
      name: user.name || "শিক্ষার্থী",
      avatar: user.image,
      points,
      enrolledCount: enrolled,
      completedLessons: lessons,
      quizCount: quizzes,
    };
  }).filter(r => r.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return rows;
};
