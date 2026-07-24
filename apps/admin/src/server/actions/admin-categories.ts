"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(data: { name: string; description: string; image: string; parentId: string | null }) {
  await prisma.courseCategory.create({
    data: {
      name: data.name,
      slug: data.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(), // Generate a unique slug
      description: data.description,
      image: data.image,
    }
  });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, data: { name: string; description: string; image: string; parentId: string | null }) {
  await prisma.courseCategory.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      image: data.image,
    }
  });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await prisma.courseCategory.delete({
    where: { id }
  });
  revalidatePath("/admin/categories");
  return { success: true };
}
