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
