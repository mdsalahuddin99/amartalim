"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import type { ActionResult } from "./blog.actions";
import { slugify } from "@/types/blog";
import type { QaStatus } from "@prisma/client";

export const getQaPosts = async (options?: { status?: QaStatus; categoryId?: string }) => {
  try {
    const where: any = {};
    if (options?.status) where.status = options.status;
    if (options?.categoryId) where.categoryId = options.categoryId;

    const posts = await prisma.qaPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        mufti: true,
        asker: {
          select: { name: true, image: true },
        },
      },
    });
    return { ok: true, data: posts };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error fetching QA posts" };
  }
};

export const getQaPostBySlug = async (slug: string) => {
  try {
    const post = await prisma.qaPost.findUnique({
      where: { slug },
      include: {
        category: true,
        mufti: true,
      },
    });
    if (!post) return { ok: false, error: "Not found" };
    return { ok: true, data: post };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error fetching QA post" };
  }
};

export const createQaPost = async (input: {
  title: string;
  questionDetails?: string;
  categoryId?: string | null;
  askerName?: string;
  askerEmail?: string;
}): Promise<ActionResult<{ id: string; slug: string }>> => {
  try {
    const session = await auth();
    const slug = slugify(input.title) + "-" + Date.now();
    
    const post = await prisma.qaPost.create({
      data: {
        title: input.title,
        slug,
        questionDetails: input.questionDetails || null,
        categoryId: input.categoryId || null,
        askerName: input.askerName || null,
        askerEmail: input.askerEmail || null,
        askerId: session?.user?.id || null, // Optional authenticated user
        status: "PENDING",
      },
    });
    return { ok: true, data: { id: post.id, slug: post.slug } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error submitting question" };
  }
};

export const updateQaPost = async (
  id: string,
  patch: Partial<{
    title: string;
    questionDetails: string;
    answer: string;
    categoryId: string | null;
    muftiId: string | null;
    status: QaStatus;
    tags: string[];
  }>
): Promise<ActionResult> => {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  let isAuthorized = session.user.role === "ADMIN";
  if (!isAuthorized) {
    const muftiApp = await prisma.roleApplication.findUnique({
      where: { userId_role: { userId: session.user.id, role: "MUFTI" } }
    });
    if (muftiApp?.status === "APPROVED") {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) return { ok: false, error: "Unauthorized" };

  try {
    const data: any = { ...patch };
    if (patch.title) {
      data.slug = slugify(patch.title) + "-" + Date.now();
    }
    if (patch.status === "PUBLISHED" || patch.status === "ANSWERED") {
      data.publishedAt = new Date();
    }

    await prisma.qaPost.update({
      where: { id },
      data,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error updating QA post" };
  }
};

export const deleteQaPost = async (id: string): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  try {
    await prisma.qaPost.delete({
      where: { id },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error deleting QA post" };
  }
};

export const recordQaView = async (id: string) => {
  try {
    await prisma.qaPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  } catch (e) {
    // Ignore
  }
};
