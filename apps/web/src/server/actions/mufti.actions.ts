"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import type { ActionResult } from "./blog.actions";
import { slugify } from "@/types/blog";
import type { Mufti } from "@prisma/client";

export const getMuftis = async () => {
  try {
    const muftis = await prisma.mufti.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, data: muftis };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error fetching muftis" };
  }
};

export const createMufti = async (input: {
  name: string;
  email?: string;
  bio: string;
  shortBio?: string;
  expertise?: string[];
  avatar?: string;
}): Promise<ActionResult<{ id: string }>> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    const slug = slugify(input.name) + "-" + Date.now();
    const mufti = await prisma.mufti.create({
      data: {
        name: input.name,
        slug,
        email: input.email || null,
        bio: input.bio,
        shortBio: input.shortBio || null,
        expertise: input.expertise || [],
        avatar: input.avatar || null,
        status: "APPROVED",
      },
    });
    return { ok: true, data: { id: mufti.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error creating mufti" };
  }
};

export const updateMufti = async (
  id: string,
  patch: Partial<{
    name: string;
    email: string;
    bio: string;
    shortBio: string;
    expertise: string[];
    avatar: string;
  }>
): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    await prisma.mufti.update({
      where: { id },
      data: {
        ...patch,
        ...(patch.name && { slug: slugify(patch.name) + "-" + Date.now() }), // Simple slug generation on update for safety
      },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error updating mufti" };
  }
};

export const deleteMufti = async (id: string): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    const mufti = await prisma.mufti.findUnique({ where: { id } });
    if (mufti) {
      const user = await prisma.user.findUnique({ where: { email: mufti.email } });
      if (user) {
        await prisma.roleApplication.deleteMany({
          where: {
            userId: user.id,
            role: "MUFTI",
            status: "APPROVED"
          }
        });
      }
    }
    await prisma.mufti.delete({
      where: { id },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error deleting mufti" };
  }
};
