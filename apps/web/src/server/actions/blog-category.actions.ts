"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import type { ActionResult } from "./blog.actions";
import { slugify } from "@/types/blog";

export const getBlogCategories = async () => {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { createdAt: "asc" },
    });
    return { ok: true, data: categories };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error fetching categories" };
  }
};

export const createBlogCategory = async (input: { name: string; description?: string; color?: string; parentId?: string | null }): Promise<ActionResult<{ id: string }>> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const category = await prisma.blogCategory.create({
      data: {
        name: input.name,
        slug: slugify(input.name),
        description: input.description,
        color: input.color,
        parentId: input.parentId || null,
      },
    });
    return { ok: true, data: { id: category.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error creating category" };
  }
};

export const updateBlogCategory = async (id: string, patch: Partial<{ name: string; description: string; color: string; parentId: string | null }>): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    await prisma.blogCategory.update({
      where: { id },
      data: {
        ...patch,
        ...(patch.name && { slug: slugify(patch.name) }),
      },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error updating category" };
  }
};

export const deleteBlogCategory = async (id: string): Promise<ActionResult> => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "INSTRUCTOR") {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    await prisma.blogCategory.delete({
      where: { id },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error deleting category" };
  }
};
