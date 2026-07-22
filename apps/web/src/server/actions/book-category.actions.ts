"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import type { ActionResult } from "./blog.actions";
import { slugify } from "@/types/blog";

export const getBookCategories = async () => {
  try {
    const categories = await prisma.bookCategory.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { books: true }
        }
      }
    });
    return { ok: true, data: categories };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error fetching book categories" };
  }
};

export const createBookCategory = async (input: { name: string; description?: string; parentId?: string | null }): Promise<ActionResult<{ id: string }>> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const category = await prisma.bookCategory.create({
      data: {
        name: input.name,
        slug: slugify(input.name),
        description: input.description,
        parentId: input.parentId || null,
      },
    });
    return { ok: true, data: { id: category.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error creating book category" };
  }
};

export const updateBookCategory = async (id: string, patch: Partial<{ name: string; description: string; parentId: string | null }>): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    await prisma.bookCategory.update({
      where: { id },
      data: {
        ...patch,
        ...(patch.name && { slug: slugify(patch.name) }),
      },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error updating book category" };
  }
};

export const deleteBookCategory = async (id: string): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    await prisma.bookCategory.delete({
      where: { id },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error deleting book category" };
  }
};
