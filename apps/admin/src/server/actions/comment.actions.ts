"use server";

import { commentCreateSchema, type CommentCreateInput } from "@/lib/validators/comment";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function createComment(
  input: CommentCreateInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "মন্তব্য করতে লগইন করুন।" };
  
  const parsed = commentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "অবৈধ ইনপুট।" };
  }
  
  try {
    const c = await prisma.comment.create({
      data: {
        content: parsed.data.body,
        blogId: parsed.data.blogId,
        userId: session.user.id,
        parentId: parsed.data.parentId ?? null,
        status: "PENDING", 
      },
    });
    return { ok: true, data: { id: c.id } };
  } catch (err) {
    return { ok: false, error: "Failed to create comment." };
  }
}

export async function approveComment(commentId: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized." };
  }
  
  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "APPROVED" }
    });
    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, error: "Failed to approve comment." };
  }
}

export async function rejectComment(commentId: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized." };
  }
  
  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { status: "REJECTED" }
    });
    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, error: "Failed to reject comment." };
  }
}

export async function deleteComment(
  commentId: string,
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "লগইন প্রয়োজন।" };
  
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return { ok: false, error: "Comment not found." };
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { ok: false, error: "Unauthorized." };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() }
    });
    return { ok: true, data: null };
  } catch (err) {
    return { ok: false, error: "Failed to delete comment." };
  }
}
