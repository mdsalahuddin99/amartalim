"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

const isAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
};

export async function getAdminOverviewStats() {
  await isAdmin();

  // Orders and Revenue
  const allPayments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    }
  });

  const paidPayments = allPayments.filter(p => p.status === "SUCCESS");
  const pendingPayments = allPayments.filter(p => p.status === "PENDING");
  
  const totalRevenue = paidPayments.reduce((acc, p) => acc + p.amount, 0);

  // Users
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  
  // active students
  const activeStudents = await prisma.user.count({
    where: { 
      role: "STUDENT",
      enrollments: { some: {} }
    }
  });

  const recentStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      enrollments: { select: { id: true } }
    }
  });

  // Courses and Ratings
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      studentCount: true,
      rating: true,
      category: { select: { name: true } },
      _count: { select: { lessons: true } }
    },
    orderBy: { studentCount: "desc" }
  });

  const topCourses = courses.slice(0, 5).map(c => ({
    id: c.id,
    title: c.title,
    studentsCount: c.studentCount,
    categoryName: c.category?.name || "Uncategorized",
    lessonsCount: c._count.lessons,
  }));

  const coursesWithRating = courses.filter(c => c.rating !== null);
  const avgRating = coursesWithRating.length > 0 
    ? (coursesWithRating.reduce((acc, c) => acc + (c.rating || 0), 0) / coursesWithRating.length).toFixed(1)
    : "0";

  // Recent Orders formatted for UI
  const recentOrders = allPayments.slice(0, 5).map(p => {
    const meta = p.meta as any;
    return {
      id: p.id,
      courseTitle: meta?.courseTitle || "Unknown Course",
      provider: p.provider,
      createdAt: p.createdAt.toISOString(),
      total: p.amount,
      status: p.status,
    };
  });

  const mappedRecentStudents = recentStudents.map(s => ({
    id: s.id,
    name: s.name || "Student",
    email: s.email,
    joinedAt: s.createdAt.toLocaleDateString("bn-BD"),
    enrolledCourses: s.enrollments,
  }));

  return {
    totalRevenue,
    paidOrders: paidPayments.length,
    pendingOrders: pendingPayments.length,
    totalStudents,
    activeStudents,
    avgRating,
    recentOrders,
    recentStudents: mappedRecentStudents,
    topCourses,
  };
}

const BN_MONTHS = ["জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ", "অক্টো", "নভে", "ডিসে"];

export async function getAdminReportsData() {
  await isAdmin();

  // Aggregate monthly revenue for the current year
  const currentYear = new Date().getFullYear();
  
  const payments = await prisma.payment.findMany({
    where: {
      status: { in: ["SUCCESS"] },
      createdAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1)
      }
    },
    select: { amount: true, createdAt: true, provider: true }
  });

  const enrollments = await prisma.enrollment.findMany({
    where: {
      enrolledAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1)
      }
    },
    select: { enrolledAt: true }
  });

  const monthly = Array.from({ length: 12 }).map((_, i) => ({
    month: BN_MONTHS[i],
    revenue: 0,
    enrollments: 0,
    students: 0 // placeholder
  }));

  let totalRevenue = 0;
  let bkashCount = 0;
  let nagadCount = 0;

  payments.forEach(p => {
    const m = p.createdAt.getMonth();
    monthly[m].revenue += p.amount;
    totalRevenue += p.amount;
    
    if (p.provider === "BKASH") bkashCount++;
    else if (p.provider === "NAGAD") nagadCount++;
  });

  enrollments.forEach(e => {
    const m = e.enrolledAt.getMonth();
    monthly[m].enrollments += 1;
  });

  const totalEnrollments = enrollments.length;

  const categories = await prisma.courseCategory.findMany({
    include: { _count: { select: { courses: true } } }
  });

  const categoryDist = categories
    .filter(c => c._count.courses > 0)
    .map(c => ({
      name: c.name,
      value: c._count.courses,
    }));

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, studentCount: true, price: true, rating: true }
  });

  const topCourses = courses
    .sort((a, b) => (b.studentCount * b.price) - (a.studentCount * a.price))
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: c.title.length > 24 ? c.title.slice(0, 24) + "…" : c.title,
      revenue: c.studentCount * c.price,
      students: c.studentCount,
      rating: c.rating ? c.rating.toFixed(1) : "—",
    }));

  const coursesWithRating = await prisma.course.findMany({
    where: { rating: { not: null } },
    select: { rating: true }
  });

  const avgRating = coursesWithRating.length > 0 
    ? (coursesWithRating.reduce((acc, c) => acc + (c.rating || 0), 0) / coursesWithRating.length).toFixed(1)
    : "0";

  const totalProviders = bkashCount + nagadCount || 1;
  const providers = [
    { name: "bKash", value: Math.round((bkashCount / totalProviders) * 100) },
    { name: "Nagad", value: Math.round((nagadCount / totalProviders) * 100) },
  ];

  return {
    monthly,
    categoryDist,
    topCourses,
    totalRevenue,
    totalEnrollments,
    avgRating,
    providers
  };
}
