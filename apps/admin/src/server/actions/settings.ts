"use server";

import { prisma } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: ["admin_profile", "site_info", "notifications"]
      }
    }
  });

  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, any>);

  return {
    profile: settingsMap["admin_profile"] || {
      name: "অ্যাডমিন",
      email: "admin@amartalim.com",
      phone: "০১৭XXXXXXXX",
      bio: "Amar Talim একাডেমির প্রতিষ্ঠাতা ও প্রশিক্ষক।",
    },
    site: settingsMap["site_info"] || {
      siteName: "Amar Talim একাডেমি",
      tagline: "বাংলায় শিখুন, বিশ্বে জয় করুন",
      contactEmail: "info@amartalim.com",
      footerText: "© ২০২৪ Amar Talim একাডেমি। সর্বস্বত্ব সংরক্ষিত।",
    },
    notifications: settingsMap["notifications"] || {
      emailOnEnroll: true,
      emailOnComplete: true,
      emailOnQuizPass: false,
      dailyDigest: false,
    }
  };
}

export async function saveProfileSettings(data: { name: string; email: string; phone: string; bio: string }) {
  await prisma.siteSetting.upsert({
    where: { key: "admin_profile" },
    update: { value: data },
    create: { key: "admin_profile", value: data },
  });
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveSiteSettings(data: { siteName: string; tagline: string; contactEmail: string; footerText: string }) {
  await prisma.siteSetting.upsert({
    where: { key: "site_info" },
    update: { value: data },
    create: { key: "site_info", value: data },
  });
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveNotificationSettings(data: { emailOnEnroll: boolean; emailOnComplete: boolean; emailOnQuizPass: boolean; dailyDigest: boolean }) {
  await prisma.siteSetting.upsert({
    where: { key: "notifications" },
    update: { value: data },
    create: { key: "notifications", value: data },
  });
  revalidatePath("/admin/settings");
  return { success: true };
}
