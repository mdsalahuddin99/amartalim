"use server";

import { prisma } from "../db/prisma";
import { auth } from "../auth/auth";
import { revalidatePath } from "next/cache";

export async function submitRoleApplication(data: {
  role: "INSTRUCTOR" | "AUTHOR" | "MUFTI";
  name: string;
  phone?: string;
  bio: string;
  expertise: string[];
  meta?: any;
}) {
  const session = await auth();
  if (!session?.user) {
    return { error: "আপনাকে লগইন করতে হবে।" };
  }

  const { role, name, phone, bio, expertise, meta } = data;

  if (!role || !name || !bio || !expertise || expertise.length === 0) {
    return { error: "সকল প্রয়োজনীয় তথ্য প্রদান করুন।" };
  }

  try {
    // Check if already applied
    const existing = await prisma.roleApplication.findUnique({
      where: {
        userId_role: {
          userId: session.user.id,
          role,
        }
      }
    });

    if (existing) {
      return { error: "আপনি ইতিমধ্যে এই রোলের জন্য আবেদন করেছেন।" };
    }

    const application = await prisma.roleApplication.create({
      data: {
        userId: session.user.id,
        role,
        name,
        phone,
        bio,
        expertise,
        meta,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/apply");
    
    return { success: true, application };
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return { error: "আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" };
  }
}
