"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";
import type { HomepageContent } from "@/lib/stores/homepage-store";
import { HOMEPAGE_DEFAULTS } from "@/lib/stores/homepage-store";

export async function getAdminHomepageContent(): Promise<HomepageContent> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "homepage-content" },
  });
  
  if (!setting || !setting.value) {
    return HOMEPAGE_DEFAULTS;
  }
  
  const v = setting.value as unknown as HomepageContent;
  return {
    ...HOMEPAGE_DEFAULTS,
    ...v,
    counters: { ...HOMEPAGE_DEFAULTS.counters, ...(v.counters || {}) },
    categories: { ...HOMEPAGE_DEFAULTS.categories, ...(v.categories || {}) },
    testimonials: { ...HOMEPAGE_DEFAULTS.testimonials, ...(v.testimonials || {}) },
    partners: { ...HOMEPAGE_DEFAULTS.partners, ...(v.partners || {}) },
  };
}

export async function saveHomepageContent(data: HomepageContent) {
  await prisma.siteSetting.upsert({
    where: { key: "homepage-content" },
    update: { value: data as any },
    create: { key: "homepage-content", value: data as any },
  });
  
  revalidatePath("/");
  revalidatePath("/(marketing)", "layout");
  revalidatePath("/admin/homepage");
  
  return { success: true };
}
