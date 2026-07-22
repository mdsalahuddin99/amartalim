"use server";

import { auth } from "../auth/auth";
import { prisma } from "../db/prisma";

export async function getInstructorDashboardData() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // 1. Fetch Instructor
  const instructor = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, bio: true }
  });
  
  if (!instructor) {
    throw new Error("Instructor not found");
  }

  // 2. Fetch Courses with related data
  const coursesData = await prisma.course.findMany({
    where: { instructorId: userId, deletedAt: null },
    include: {
      category: true,
      lessons: {
        select: { id: true, title: true, duration: true, order: true }
      },
      enrollments: {
        select: {
          user: {
            select: { id: true, name: true, email: true, createdAt: true, deletedAt: true }
          },
          courseId: true
        }
      }
    }
  });

  // Calculate stats
  let totalEarnings = 0;
  const studentsMap = new Map<string, any>();
  
  const courses = coursesData.map(c => {
    // calculate earnings (assuming price is in BDT)
    totalEarnings += (c.price * c.enrollments.length);

    // map students
    c.enrollments.forEach(e => {
      const u = e.user;
      if (!studentsMap.has(u.id)) {
        const joinedDate = new Date(u.createdAt).toLocaleDateString("bn-BD", { year: 'numeric', month: 'short', day: 'numeric' });
        studentsMap.set(u.id, {
          id: u.id,
          name: u.name || "অজানা ব্যবহারকারী",
          email: u.email,
          joinedAt: joinedDate,
          status: u.deletedAt ? "inactive" : "active",
          enrolledCourses: [c.id],
          completedCourses: 0 // Progress is calculated in UI for now
        });
      } else {
        studentsMap.get(u.id).enrolledCourses.push(c.id);
      }
    });

    const totalDuration = c.lessons.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const durationStr = totalDuration > 0 
      ? `${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m` 
      : "0h 0m";

    return {
      id: c.id,
      title: c.title,
      thumbnail: c.thumbnail,
      categoryName: c.category?.name || "সাধারণ",
      studentsCount: c.enrollments.length,
      rating: c.rating || 0,
      price: c.price,
      duration: durationStr,
    };
  });

  const students = Array.from(studentsMap.values());
  const lessons = coursesData.flatMap(c => c.lessons.map(l => ({
    id: l.id,
    courseId: c.id,
    title: l.title,
    duration: l.duration ? `${Math.floor(l.duration / 60)}m` : "10m",
    order: l.order
  })));

  return {
    user: { name: instructor.name, email: instructor.email },
    instructorProfile: {
      name: instructor.name || "ইন্সট্রাক্টর",
      email: instructor.email,
      bio: instructor.bio || "ইন্সট্রাক্টর প্রোফাইল", 
      totalStudents: students.length,
      totalEarnings
    },
    courses,
    myCourses: courses, // Map to existing mock property name
    lessons,
    myLessons: lessons, // Map to existing mock property name
    myStudents: students,
    myReviews: [] // Review model does not exist yet
  };
}
