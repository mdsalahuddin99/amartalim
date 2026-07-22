import { prisma } from "@/server/db/prisma";

const BN_MONTHS = ["জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ", "অক্টো", "নভে", "ডিসে"];

export async function getReportStats() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [
    payments,
    enrollments,
    categories,
    courses,
    avgRatingAgg
  ] = await Promise.all([
    prisma.payment.findMany({
      where: {
        createdAt: { gte: oneYearAgo },
        status: "SUCCESS",
      },
      select: {
        amount: true,
        createdAt: true,
        provider: true,
      }
    }),
    prisma.enrollment.findMany({
      where: {
        enrolledAt: { gte: oneYearAgo },
      },
      select: {
        enrolledAt: true,
      }
    }),
    prisma.courseCategory.findMany({
      include: {
        _count: { select: { courses: true } }
      }
    }),
    prisma.course.findMany({
      orderBy: { studentCount: "desc" },
      take: 8,
      select: {
        title: true,
        studentCount: true,
        price: true,
      }
    }),
    prisma.course.aggregate({
      _avg: { rating: true }
    })
  ]);

  // Aggregate monthly data
  const monthlyMap: Record<string, { month: string; revenue: number; enrollments: number; sortIndex: number }> = {};
  
  // Initialize last 12 months
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const label = `${BN_MONTHS[m]} '${d.getFullYear().toString().slice(2)}`;
    monthlyMap[label] = { month: label, revenue: 0, enrollments: 0, sortIndex: 11 - i };
  }

  payments.forEach(p => {
    const d = new Date(p.createdAt);
    const label = `${BN_MONTHS[d.getMonth()]} '${d.getFullYear().toString().slice(2)}`;
    if (monthlyMap[label]) {
      monthlyMap[label].revenue += p.amount;
    }
  });

  enrollments.forEach(e => {
    const d = new Date(e.enrolledAt);
    const label = `${BN_MONTHS[d.getMonth()]} '${d.getFullYear().toString().slice(2)}`;
    if (monthlyMap[label]) {
      monthlyMap[label].enrollments += 1;
    }
  });

  const monthly = Object.values(monthlyMap).sort((a, b) => a.sortIndex - b.sortIndex).map(({ month, revenue, enrollments }) => ({
    month, revenue, enrollments
  }));

  const categoryDist = categories
    .map(c => ({ name: c.name, value: c._count.courses }))
    .filter(c => c.value > 0);

  const topCourses = courses.map(c => ({
    name: c.title.length > 24 ? c.title.slice(0, 24) + "…" : c.title,
    revenue: c.studentCount * c.price,
    students: c.studentCount
  }));

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalEnrollments = enrollments.length;
  const avgRating = avgRatingAgg._avg.rating ? avgRatingAgg._avg.rating.toFixed(1) : "0.0";

  // Provider distribution
  const providerMap: Record<string, number> = {};
  payments.forEach(p => {
    providerMap[p.provider] = (providerMap[p.provider] || 0) + 1;
  });
  
  const providers = Object.entries(providerMap).map(([name, count]) => ({
    name: name === "BKASH" ? "bKash" : name === "NAGAD" ? "Nagad" : name,
    value: Math.round((count / payments.length) * 100) || 0
  }));

  // If no payments, mock the providers so pie chart isn't empty, or return empty
  if (providers.length === 0) {
    providers.push({ name: "bKash", value: 100 });
  }

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
