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

// ─── Header & Footer Config ──────────────────────────────────────────
export async function getHeaderFooterSettings() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "header-footer-config" } });
    if (row && row.value) return row.value as any;
  } catch (e) {
    // ignore
  }

  return {
    headerLinks: [
      { id: "1", label: "হোম", url: "/", type: "custom" },
      { id: "2", label: "কোর্সসমূহ", url: "/courses", type: "custom" },
      { id: "3", label: "লাইব্রেরি", url: "/library", type: "custom" },
      { id: "4", label: "ব্লগ", url: "/blogs", type: "custom" },
    ],
    footerLogo: null,
    footerAbout: "আরবী ভাষা, ইসলামিক জ্ঞান ও আধুনিক স্কিল নিয়ে বাংলা ভাষায় গভীর গবেষণভিত্তিক ব্লগ।",
    socialLinks: {
      facebook: "https://facebook.com/amartalim",
      youtube: "https://youtube.com/amartalim",
      twitter: "https://twitter.com/amartalim",
    },
    footerSections: [
      { id: "s1", label: "সব ব্লগ", url: "/blogs", type: "custom" },
      { id: "s2", label: "লাইব্রেরি", url: "/library", type: "custom" },
      { id: "s3", label: "আপনার জিজ্ঞাসা", url: "/qa", type: "custom" },
      { id: "s4", label: "সাইন ইন", url: "/login", type: "custom" },
    ],
    footerQuickLinks: [
      { id: "q1", label: "গোপনীয়তা নীতি", url: "/privacy", type: "custom" },
      { id: "q2", label: "ব্যবহারের শর্তাবলী", url: "/terms", type: "custom" },
      { id: "q3", label: "যোগাযোগ", url: "/contact", type: "custom" },
    ]
  };
}

export async function saveHeaderFooterSettings(data: any) {
  await prisma.siteSetting.upsert({
    where: { key: "header-footer-config" },
    update: { value: data },
    create: { key: "header-footer-config", value: data },
  });
  revalidatePath("/admin/header-footer");
  return { success: true };
}
