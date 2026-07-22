import { prisma } from "@/server/db/prisma";

export async function getDashboardStats() {
  const [
    totalRevenueAgg,
    paidOrders,
    pendingOrders,
    activeStudents,
    totalCourses,
    totalCategories,
    totalLessons,
    totalQuizzes,
    avgRatingAgg
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.payment.count({ where: { status: "SUCCESS" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count(),
    prisma.courseCategory.count(),
    prisma.lesson.count(),
    prisma.quizQuestion.count(),
    prisma.course.aggregate({
      _avg: { rating: true },
    })
  ]);

  return {
    totalRevenue: totalRevenueAgg._sum.amount || 0,
    paidOrders,
    pendingOrders,
    activeStudents,
    totalCourses,
    totalCategories,
    totalLessons,
    totalQuizzes,
    avgRating: avgRatingAgg._avg.rating ? avgRatingAgg._avg.rating.toFixed(1) : "0.0",
  };
}

export async function getRecentActivity() {
  const [recentOrders, recentStudents, topCourses, recentCourses] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: true,
        enrollments: {
          include: { course: true }
        }
      }
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        enrollments: true
      }
    }),
    prisma.course.findMany({
      orderBy: { studentCount: "desc" },
      take: 5,
    }),
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, lessons: true }
    })
  ]);

  return {
    recentOrders,
    recentStudents,
    topCourses,
    recentCourses,
  };
}
