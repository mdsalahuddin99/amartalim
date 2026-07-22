"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export const updateInstructor = async (id: string, data: {
  name?: string;
  bio?: string;
  specialization?: string;
  status?: "active" | "suspended" | "pending";
}) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    if (data.name) {
      await prisma.user.update({
        where: { id },
        data: { name: data.name }
      });
    }

    if (data.bio || data.specialization) {
      // Find their approved role application
      const app = await prisma.roleApplication.findFirst({
        where: { userId: id, role: "INSTRUCTOR", status: "APPROVED" }
      });
      
      if (app) {
        await prisma.roleApplication.update({
          where: { id: app.id },
          data: {
            ...(data.bio && { bio: data.bio }),
            ...(data.specialization && { expertise: [data.specialization] })
          }
        });
      }
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to update instructor" };
  }
};

export const deleteInstructor = async (id: string) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    // Instead of completely deleting, we might want to change their role to STUDENT or soft delete
    await prisma.user.update({
      where: { id },
      data: { role: "STUDENT" }
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to delete instructor" };
  }
};
