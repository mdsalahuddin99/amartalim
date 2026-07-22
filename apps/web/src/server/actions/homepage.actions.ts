"use server";

import { prisma } from "../db/prisma";
import { revalidatePath } from "next/cache";

export async function updateHomepageContent(data: any) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "homepage-content" },
      update: { value: data },
      create: { key: "homepage-content", value: data },
    });
    
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    
    return { ok: true };
  } catch (error) {
    console.error("[UPDATE_HOMEPAGE]", error);
    return { ok: false, error: "Failed to update homepage content" };
  }
}
