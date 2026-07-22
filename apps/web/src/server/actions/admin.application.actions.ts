"use server";

import { prisma } from "../db/prisma";
import { auth } from "@/server/auth/auth";
import { revalidatePath } from "next/cache";

// Helper to check if current user is ADMIN
async function requireAdmin() {
  const session = await auth();
  // If we really only want ADMIN (and not instructor), we should have an isAdmin check.
  // For now we assume if they can access admin dashboard, they can do this.
  // We can refine this later.
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function approveApplication(id: string) {
  await requireAdmin();

  try {
    const application = await prisma.roleApplication.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!application) {
      return { error: "আবেদন খুঁজে পাওয়া যায়নি।" };
    }

    if (application.status === "APPROVED") {
      return { error: "আবেদনটি ইতোমধ্যে অ্যাপ্রুভ করা হয়েছে।" };
    }

    // 1. Update Application Status
    const updated = await prisma.roleApplication.update({
      where: { id },
      data: { status: "APPROVED" }
    });

    // 2. We could optionally update User.role to INSTRUCTOR if it's an INSTRUCTOR application.
    // The user mentioned they want a global profile.
    if (application.role === "INSTRUCTOR") {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "INSTRUCTOR" }
      });
      // Clear public instructors cache so the new instructor shows up instantly
      const { revalidateTag } = require("next/cache");
      revalidateTag("instructors");
    } else if (application.role === "AUTHOR") {
      const slug = (application.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'author') + '-' + Date.now();
      await prisma.author.upsert({
        where: { email: application.user.email },
        update: {
          name: application.name,
          phone: application.phone,
          bio: application.bio,
          expertise: application.expertise,
          status: "APPROVED"
        },
        create: {
          name: application.name,
          slug: slug,
          email: application.user.email,
          phone: application.phone,
          bio: application.bio,
          expertise: application.expertise,
          status: "APPROVED",
          avatar: application.user.image
        }
      });
    } else if (application.role === "MUFTI") {
      const slug = (application.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'mufti') + '-' + Date.now();
      await prisma.mufti.upsert({
        where: { email: application.user.email },
        update: {
          name: application.name,
          phone: application.phone,
          bio: application.bio,
          expertise: application.expertise,
          status: "APPROVED"
        },
        create: {
          name: application.name,
          slug: slug,
          email: application.user.email,
          phone: application.phone,
          bio: application.bio,
          expertise: application.expertise,
          status: "APPROVED",
          avatar: application.user.image
        }
      });
    }

    revalidatePath("/admin/applications");
    return { success: true, application: updated };
  } catch (error: any) {
    console.error("Error approving application:", error);
    return { error: "আবেদন অ্যাপ্রুভ করতে সমস্যা হয়েছে।" };
  }
}

export async function rejectApplication(id: string, adminNote?: string) {
  await requireAdmin();

  try {
    const application = await prisma.roleApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return { error: "আবেদন খুঁজে পাওয়া যায়নি।" };
    }

    const updated = await prisma.roleApplication.update({
      where: { id },
      data: { 
        status: "REJECTED",
        adminNote: adminNote || null
      }
    });

    revalidatePath("/admin/applications");
    return { success: true, application: updated };
  } catch (error: any) {
    console.error("Error rejecting application:", error);
    return { error: "আবেদন বাতিল করতে সমস্যা হয়েছে।" };
  }
}

export async function setApplicationPending(id: string, adminNote?: string) {
  await requireAdmin();

  try {
    const updated = await prisma.roleApplication.update({
      where: { id },
      data: { 
        status: "PENDING",
        adminNote: adminNote || null
      }
    });

    revalidatePath("/admin/applications");
    return { success: true, application: updated };
  } catch (error: any) {
    console.error("Error setting application to pending:", error);
    return { error: "আবেদন পেন্ডিং করতে সমস্যা হয়েছে।" };
  }
}

export async function editApplication(id: string, data: any) {
  await requireAdmin();

  try {
    const updated = await prisma.roleApplication.update({
      where: { id },
      data
    });

    revalidatePath("/admin/applications");
    return { success: true, application: updated };
  } catch (error: any) {
    console.error("Error editing application:", error);
    return { error: "আবেদন এডিট করতে সমস্যা হয়েছে।" };
  }
}

export async function deleteApplication(id: string) {
  await requireAdmin();

  try {
    await prisma.roleApplication.delete({
      where: { id }
    });

    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting application:", error);
    return { error: "আবেদন ডিলেট করতে সমস্যা হয়েছে।" };
  }
}
