"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function approveApplication(id: string) {
  await requireAdmin();

  try {
    const application = await prisma.roleApplication.findUnique({ 
      where: { id },
      include: { user: true }
    });
    if (!application) return { error: "আবেদন খুঁজে পাওয়া যায়নি।" };
    if (application.status === "APPROVED") return { error: "ইতোমধ্যে অ্যাপ্রুভ করা হয়েছে।" };

    const updated = await prisma.roleApplication.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    if (application.role === "INSTRUCTOR") {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "INSTRUCTOR" },
      });
    } else if (application.role === "AUTHOR") {
      const slug = (application.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'author') + '-' + Date.now();
      const meta = application.meta as any || {};
      await prisma.author.upsert({
        where: { email: application.user.email },
        update: {
          name: application.name,
          phone: application.phone,
          bio: application.bio,
          shortBio: meta.shortBio || null,
          facebook: meta.facebook || null,
          twitter: meta.twitter || null,
          website: meta.website || null,
          expertise: application.expertise,
          status: "APPROVED"
        },
        create: {
          name: application.name,
          slug: slug,
          email: application.user.email,
          phone: application.phone,
          bio: application.bio,
          shortBio: meta.shortBio || null,
          facebook: meta.facebook || null,
          twitter: meta.twitter || null,
          website: meta.website || null,
          expertise: application.expertise,
          status: "APPROVED",
          avatar: application.user.image
        }
      });
    } else if (application.role === "MUFTI") {
      const slug = (application.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'mufti') + '-' + Date.now();
      const meta = application.meta as any || {};
      await prisma.mufti.upsert({
        where: { email: application.user.email },
        update: {
          name: application.name,
          phone: application.phone,
          bio: application.bio,
          shortBio: meta.shortBio || null,
          expertise: application.expertise,
          status: "APPROVED"
        },
        create: {
          name: application.name,
          slug: slug,
          email: application.user.email,
          phone: application.phone,
          bio: application.bio,
          shortBio: meta.shortBio || null,
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
    return { error: "আবেদন অ্যাপ্রুভ করতে সমস্যা হয়েছে।" };
  }
}

export async function rejectApplication(id: string, adminNote?: string) {
  await requireAdmin();

  try {
    const application = await prisma.roleApplication.findUnique({ where: { id } });
    if (!application) return { error: "আবেদন খুঁজে পাওয়া যায়নি।" };

    const updated = await prisma.roleApplication.update({
      where: { id },
      data: { 
        status: "REJECTED",
        ...(adminNote !== undefined && { adminNote }) 
      },
    });

    revalidatePath("/admin/applications");
    return { success: true, application: updated };
  } catch (error: any) {
    console.error("Error rejecting application:", error);
    return { error: "আবেদন বাতিল করতে সমস্যা হয়েছে।" };
  }
}

export async function deleteApplication(id: string) {
  await requireAdmin();

  try {
    const application = await prisma.roleApplication.findUnique({ where: { id } });
    if (!application) return { error: "আবেদন খুঁজে পাওয়া যায়নি।" };

    await prisma.roleApplication.delete({ where: { id } });

    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting application:", error);
    return { error: "আবেদন মুছে ফেলতে সমস্যা হয়েছে।" };
  }
}

export async function updateApplication(id: string, data: any) {
  await requireAdmin();

  try {
    const application = await prisma.roleApplication.findUnique({ where: { id } });
    if (!application) return { error: "আবেদন খুঁজে পাওয়া যায়নি।" };

    const updated = await prisma.roleApplication.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        expertise: data.expertise,
        meta: data.meta,
      },
    });

    revalidatePath("/admin/applications");
    return { success: true, application: updated };
  } catch (error: any) {
    console.error("Error updating application:", error);
    return { error: "আবেদন আপডেট করতে সমস্যা হয়েছে।" };
  }
}
