"use server";

import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";
import { revalidatePath } from "next/cache";

const isAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session.user;
};

// ─── Generic SiteSetting helpers ────────────────────────────────────
export async function getSiteSetting<T = any>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row ? (row.value as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function upsertSiteSetting(key: string, value: any) {
  await isAdmin();
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidatePath("/");
  return { ok: true };
}

// ─── Site Config (Settings page) ─────────────────────────────────────
export async function getSiteConfig() {
  return getSiteSetting("site-config", {
    siteName: "Amar Talim একাডেমি",
    tagline: "বাংলায় শিখুন, বিশ্বে জয় করুন",
    contactEmail: "info@amartalim.com",
    footerText: "© ২০২৪ Amar Talim একাডেমি। সর্বস্বত্ব সংরক্ষিত।",
    notifications: {
      emailOnEnroll: true,
      emailOnComplete: true,
      emailOnQuizPass: false,
      dailyDigest: false,
    },
  });
}

export async function saveSiteConfig(config: any) {
  await upsertSiteSetting("site-config", config);
  revalidatePath("/admin/settings");
  return { ok: true };
}

// ─── Ads Config ────────────────────────────────────────────────────
export async function getAdsConfig() {
  return getSiteSetting("ads-content", { items: [], config: { adsenseEnabled: false } });
}

export async function saveAdsConfig(data: any) {
  await isAdmin();
  await prisma.siteSetting.upsert({
    where: { key: "ads-content" },
    update: { value: data },
    create: { key: "ads-content", value: data },
  });
  revalidatePath("/");
  revalidatePath("/admin/ads");
  return { ok: true };
}

// ─── Admin profile (from session user) ───────────────────────────────
export async function getAdminProfile() {
  const user = await isAdmin();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, image: true },
  });
  return dbUser;
}

export async function updateAdminProfile(data: { name?: string; email?: string }) {
  const user = await isAdmin();
  await prisma.user.update({
    where: { id: user.id },
    data,
  });
  revalidatePath("/admin/settings");
  return { ok: true };
}

// ─── Header & Footer Config ──────────────────────────────────────────
import { unstable_noStore as noStore } from "next/cache";

export async function getHeaderFooterSettings() {
  noStore();
  return getSiteSetting("header-footer-config", {
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
  });
}

export async function saveHeaderFooterSettings(data: any) {
  await isAdmin();
  await prisma.siteSetting.upsert({
    where: { key: "header-footer-config" },
    update: { value: data },
    create: { key: "header-footer-config", value: data },
  });
  revalidatePath("/");
  revalidatePath("/admin/header-footer");
  return { ok: true };
}
