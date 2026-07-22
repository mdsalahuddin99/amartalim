"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export const toggleBookmarkAction = async (blogId: string) => {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "লগইন প্রয়োজন।" };
  
  const existing = await prisma.bookmark.findUnique({
    where: { userId_blogId: { userId: session.user.id, blogId } }
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_blogId: { userId: session.user.id, blogId } }
    });
    return { ok: true, active: false };
  }

  await prisma.bookmark.create({
    data: { userId: session.user.id, blogId }
  });
  return { ok: true, active: true };
};

export const getUserBookmarksAction = async () => {
  const session = await auth();
  if (!session?.user) return [];
  
  return prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { blog: true }
  });
};

export const checkBookmarkAction = async (blogId: string) => {
  const session = await auth();
  if (!session?.user) return false;
  
  const existing = await prisma.bookmark.findUnique({
    where: { userId_blogId: { userId: session.user.id, blogId } }
  });
  
  return !!existing;
};
