"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import { revalidatePath } from "next/cache";

const isAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
};

export async function getAdminStudents() {
  await isAdmin();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      enrollments: { select: { courseId: true } },
      progress: {
        where: { completed: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return students.map((s) => ({
    id: s.id,
    name: s.name || "Unknown",
    email: s.email,
    status: s.deletedAt ? "inactive" : "active",
    enrolledCourses: s.enrollments.map((e) => e.courseId),
    completedCourses: s.progress.length,
    joinedAt: s.createdAt.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }));
}

export async function getAdminInstructors() {
  await isAdmin();

  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    include: {
      courses: {
        select: {
          id: true,
          studentCount: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return instructors.map((i) => {
    const totalStudents = i.courses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    const totalEarnings = i.courses.reduce((sum, c) => sum + (c.studentCount || 0) * (c.price || 0), 0);

    return {
      id: i.id,
      name: i.name || "Unknown",
      email: i.email,
      bio: i.bio || "ইন্সট্রাক্টর", // Fallback if no bio exists
      totalStudents,
      totalCourses: i.courses.length,
      totalEarnings,
      status: i.deletedAt ? "suspended" : "active",
      joinedAt: i.createdAt.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      specialization: i.specialization || "সাধারণ", // Fallback if no specialization exists
    };
  });
}

export async function toggleUserStatus(userId: string) {
  await isAdmin();
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const newStatus = user.deletedAt ? null : new Date();

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: newStatus },
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/instructors");
}

export async function deleteUser(userId: string) {
  await isAdmin();
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    if (user.role === "INSTRUCTOR") {
      await prisma.roleApplication.deleteMany({
        where: { userId, role: "INSTRUCTOR", status: "APPROVED" }
      });
    }
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/instructors");
}

export async function updateInstructorProfile(id: string, data: { name?: string; bio?: string; specialization?: string }) {
  await isAdmin();
  
  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        bio: data.bio,
        specialization: data.specialization
      }
    });
    
    revalidatePath("/admin/instructors");
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: "Failed to update instructor profile" };
  }
}
